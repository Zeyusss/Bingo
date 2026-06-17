import { kafka } from "@packages/utils/kafka";
import { clients } from "./main";
import { WebSocket } from "ws";

interface LogMessage {
    type: "info" | "error" | "warning" | "success" | "debug";
    message: string;
    timestamp: string;
    source: string;
    requestId?: string;
    userId?: string;
    metadata?: Record<string, any>;
}

class LogConsumerService {
    private consumer = kafka.consumer({ 
        groupId: "log-events-group",
        sessionTimeout: 30000,
        heartbeatInterval: 3000,
        maxWaitTimeInMs: 5000,
        allowAutoTopicCreation: false
    });
    
    private logQueue: LogMessage[] = [];
    private readonly maxQueueSize = 1000; 
    private readonly batchInterval = 3000;
    private readonly maxBatchSize = 50;
    private isProcessing = false;
    private processingInterval: NodeJS.Timeout | null = null;
    private isConnected = false;
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;
    private reconnectDelay = 2000;

    async start(): Promise<void> {
        await this.connectWithRetry();
        this.startBatchProcessing();
    }

    private async connectWithRetry(): Promise<void> {
        try {
            await this.consumer.connect();
            await this.consumer.subscribe({ 
                topic: "logs", 
                fromBeginning: false 
            });
            
            await this.consumer.run({
                eachBatch: async ({ batch, resolveOffset, heartbeat }) => {
                    
                    for (const message of batch.messages) {
                        try {
                            if (!message.value) continue;
                            
                            const logData = JSON.parse(message.value.toString()) as LogMessage;
                            
                            if (this.isValidLogMessage(logData)) {
                                this.addToQueue(logData);
                            }
                            
                            resolveOffset(message.offset);
                            await heartbeat();
                        } catch (error) {
                            console.error('[LogConsumer] Error in batch processing:', error);
                        }
                    }
                }
            });
            
            this.isConnected = true;
            this.reconnectAttempts = 0;
            console.log('[LogConsumer] Connected and consuming logs');
            
        } catch (error) {
            this.isConnected = false;
            this.reconnectAttempts++;
            
            if (this.reconnectAttempts <= this.maxReconnectAttempts) {
                console.warn(`[LogConsumer] Connection failed, retrying in ${this.reconnectDelay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
                await new Promise(resolve => setTimeout(resolve, this.reconnectDelay));
                this.reconnectDelay *= 1.5; 
                return this.connectWithRetry();
            }
            
            console.error('[LogConsumer] Max reconnection attempts reached:', error);
            throw error;
        }
    }

    private isValidLogMessage(data: any): data is LogMessage {
        return (
            data &&
            typeof data.type === 'string' &&
            typeof data.message === 'string' &&
            typeof data.timestamp === 'string' &&
            typeof data.source === 'string' &&
            ['info', 'error', 'warning', 'success', 'debug'].includes(data.type)
        );
    }

    private addToQueue(logData: LogMessage): void {
        
        if (this.logQueue.length >= this.maxQueueSize) {
           
            const removeCount = Math.floor(this.maxQueueSize * 0.1); 
            this.logQueue.splice(0, removeCount);
            console.warn(`[LogConsumer] Queue size limit reached, removed ${removeCount} oldest logs`);
        }
        
        this.logQueue.push(logData);
    }

    private startBatchProcessing(): void {
        this.processingInterval = setInterval(() => {
            this.processLogBatch();
        }, this.batchInterval);
    }

    private async processLogBatch(): Promise<void> {
        if (this.isProcessing || this.logQueue.length === 0 || clients.size === 0) {
            return;
        }

        this.isProcessing = true;
        
        try {
            
            const batchSize = Math.min(this.maxBatchSize, this.logQueue.length);
            const logsToProcess = this.logQueue.splice(0, batchSize);
            
            if (logsToProcess.length === 0) {
                this.isProcessing = false;
                return;
            }

            console.log(`[LogConsumer] Processing ${logsToProcess.length} logs for ${clients.size} clients`);
            
            
            const groupedLogs = this.groupLogsByType(logsToProcess);
            
            
            const clientPromises = Array.from(clients).map(client => 
                this.sendLogsToClient(client, groupedLogs)
            );
            
            await Promise.allSettled(clientPromises);
            
        } catch (error) {
            console.error('[LogConsumer] Error in batch processing:', error);
        } finally {
            this.isProcessing = false;
        }
    }

    private groupLogsByType(logs: LogMessage[]): Record<string, LogMessage[]> {
        return logs.reduce((groups, log) => {
            if (!groups[log.type]) {
                groups[log.type] = [];
            }
            groups[log.type].push(log);
            return groups;
        }, {} as Record<string, LogMessage[]>);
    }

    private async sendLogsToClient(client: WebSocket, groupedLogs: Record<string, LogMessage[]>): Promise<void> {
        try {
            if (client.readyState !== WebSocket.OPEN) {
                return;
            }

            
            for (const [type, logs] of Object.entries(groupedLogs)) {
                if (logs.length === 0) continue;
                
                const payload = {
                    type: 'log_batch',
                    logType: type,
                    logs: logs,
                    timestamp: new Date().toISOString(),
                    count: logs.length
                };
                
                client.send(JSON.stringify(payload));
            }
        } catch (error) {
            if (client.readyState !== WebSocket.OPEN) {
                clients.delete(client);
            }
        }
    }

    async stop(): Promise<void> {
        console.log('[LogConsumer] Shutting down...');
        
        if (this.processingInterval) {
            clearInterval(this.processingInterval);
            this.processingInterval = null;
        }
        
        
        if (this.logQueue.length > 0) {
            console.log(`[LogConsumer] Processing ${this.logQueue.length} remaining logs before shutdown`);
            await this.processLogBatch();
        }
        
        if (this.isConnected) {
            await this.consumer.disconnect();
            this.isConnected = false;
        }
        
        console.log('[LogConsumer] Shutdown complete');
    }

    getQueueStatus(): { queueSize: number; isProcessing: boolean; isConnected: boolean } {
        return {
            queueSize: this.logQueue.length,
            isProcessing: this.isProcessing,
            isConnected: this.isConnected
        };
    }
}


const logConsumerService = new LogConsumerService();


export { logConsumerService };


export const consumeKafkaMessages = async (): Promise<void> => {
    return logConsumerService.start();
};


process.on('SIGINT', async () => {
    console.log('[LogConsumer] Received SIGINT, shutting down gracefully...');
    await logConsumerService.stop();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('[LogConsumer] Received SIGTERM, shutting down gracefully...');
    await logConsumerService.stop();
    process.exit(0);
});


consumeKafkaMessages().catch(console.error);