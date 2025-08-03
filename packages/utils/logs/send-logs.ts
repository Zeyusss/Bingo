import { kafka } from "../kafka";

type LogLevel = "info" | "error" | "warning" | "success" | "debug";

interface LogPayload {
    type: LogLevel;
    message: string;
    timestamp: string;
    source: string;
    requestId?: string;
    userId?: string;
    metadata?: Record<string, any>;
}

class LoggerService {
    private producer = kafka.producer({
        maxInFlightRequests: 1,
        idempotent: true,
        transactionTimeout: 30000,
    });
    private isConnected = false;
    private connectionPromise: Promise<void> | null = null;
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;
    private reconnectDelay = 1000;

    private async ensureConnection(): Promise<void> {
        if (this.isConnected) return;
        
        if (this.connectionPromise) {
            return this.connectionPromise;
        }

        this.connectionPromise = this.connect();
        return this.connectionPromise;
    }

    private async connect(): Promise<void> {
        try {
            await this.producer.connect();
            this.isConnected = true;
            this.reconnectAttempts = 0;
            this.connectionPromise = null;
            console.log('[Logger] Kafka producer connected successfully');
        } catch (error) {
            this.connectionPromise = null;
            this.reconnectAttempts++;
            
            if (this.reconnectAttempts <= this.maxReconnectAttempts) {
                console.warn(`[Logger] Connection failed, retrying in ${this.reconnectDelay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
                await new Promise(resolve => setTimeout(resolve, this.reconnectDelay));
                this.reconnectDelay *= 2; // Exponential backoff
                return this.connect();
            }
            
            console.error('[Logger] Max reconnection attempts reached:', error);
            throw error;
        }
    }

    async sendLog(params: {
        type?: LogLevel;
        message: string;
        source?: string;
        requestId?: string;
        userId?: string;
        metadata?: Record<string, any>;
    }): Promise<void> {
        const {
            type = "info",
            message,
            source = "unknown-service",
            requestId,
            userId,
            metadata
        } = params;

        // Validate and sanitize sensitive data
        const sanitizedMessage = this.sanitizeMessage(message);
        const sanitizedMetadata = this.sanitizeMetadata(metadata);

        const logPayload: LogPayload = {
            type,
            message: sanitizedMessage,
            timestamp: new Date().toISOString(),
            source,
            ...(requestId && { requestId }),
            ...(userId && { userId }),
            ...(sanitizedMetadata && { metadata: sanitizedMetadata })
        };

        try {
            await this.ensureConnection();
            
            await this.producer.send({
                topic: "logs",
                messages: [{
                    key: source, // Partition by source for better distribution
                    value: JSON.stringify(logPayload),
                    timestamp: Date.now().toString()
                }],
            });
        } catch (error) {
            // Mark as disconnected to trigger reconnection on next send
            this.isConnected = false;
            
            // Fallback to console logging if Kafka fails
            console.error('[Logger] Failed to send log to Kafka:', error);
            console.log(`[${logPayload.timestamp}] ${source} [${type.toUpperCase()}] ${sanitizedMessage}`);
            
            // Re-throw for caller to handle if needed
            throw error;
        }
    }

    private sanitizeMessage(message: string): string {
        // Remove sensitive patterns
        const sensitivePatterns = [
            /password[\s]*[:=][\s]*["']?[^\s"']+["']?/gi,
            /token[\s]*[:=][\s]*["']?[^\s"']+["']?/gi,
            /key[\s]*[:=][\s]*["']?[^\s"']+["']?/gi,
            /secret[\s]*[:=][\s]*["']?[^\s"']+["']?/gi,
            /authorization[\s]*[:=][\s]*["']?[^\s"']+["']?/gi,
        ];

        let sanitized = message;
        sensitivePatterns.forEach(pattern => {
            sanitized = sanitized.replace(pattern, (match) => {
                const parts = match.split(/[:=]/);
                return `${parts[0]}:***REDACTED***`;
            });
        });

        return sanitized;
    }

    private sanitizeMetadata(metadata?: Record<string, any>): Record<string, any> | undefined {
        if (!metadata) return undefined;

        const sensitiveKeys = ['password', 'token', 'secret', 'key', 'authorization', 'cookie'];
        const sanitized = { ...metadata };

        Object.keys(sanitized).forEach(key => {
            if (sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive))) {
                sanitized[key] = '***REDACTED***';
            }
        });

        return sanitized;
    }

    async disconnect(): Promise<void> {
        if (this.isConnected) {
            await this.producer.disconnect();
            this.isConnected = false;
            console.log('[Logger] Kafka producer disconnected');
        }
    }
}

// Singleton instance
const loggerService = new LoggerService();

// Export the main function for backward compatibility
export async function sendLog(params: {
    type?: "info" | "error" | "warning" | "success" | "debug";
    message: string;
    source?: string;
    requestId?: string;
    userId?: string;
    metadata?: Record<string, any>;
}): Promise<void> {
    return loggerService.sendLog(params);
}

// Export logger service for advanced usage
export { loggerService };

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('[Logger] Shutting down gracefully...');
    await loggerService.disconnect();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('[Logger] Shutting down gracefully...');
    await loggerService.disconnect();
    process.exit(0);
});