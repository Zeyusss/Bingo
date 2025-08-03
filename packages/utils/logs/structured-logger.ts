import { sendLog } from './send-logs';

export interface LogContext {
    requestId?: string;
    userId?: string;
    sessionId?: string;
    traceId?: string;
    correlationId?: string;
    userAgent?: string;
    ip?: string;
    method?: string;
    url?: string;
    statusCode?: number;
    duration?: number;
    metadata?: Record<string, any>;
}

export class StructuredLogger {
    private source: string;
    private defaultContext: LogContext;

    constructor(source: string, defaultContext: LogContext = {}) {
        this.source = source;
        this.defaultContext = defaultContext;
    }

    private async log(
        level: "info" | "error" | "warning" | "success" | "debug",
        message: string,
        context: LogContext = {}
    ): Promise<void> {
        const mergedContext = { ...this.defaultContext, ...context };
        
        try {
            await sendLog({
                type: level,
                message,
                source: this.source,
                requestId: mergedContext.requestId,
                userId: mergedContext.userId,
                metadata: {
                    ...mergedContext.metadata,
                    ...(mergedContext.sessionId && { sessionId: mergedContext.sessionId }),
                    ...(mergedContext.traceId && { traceId: mergedContext.traceId }),
                    ...(mergedContext.correlationId && { correlationId: mergedContext.correlationId }),
                    ...(mergedContext.userAgent && { userAgent: mergedContext.userAgent }),
                    ...(mergedContext.ip && { ip: mergedContext.ip }),
                    ...(mergedContext.method && { method: mergedContext.method }),
                    ...(mergedContext.url && { url: mergedContext.url }),
                    ...(mergedContext.statusCode && { statusCode: mergedContext.statusCode }),
                    ...(mergedContext.duration && { duration: mergedContext.duration }),
                }
            });
        } catch (error) {
            console.error(`[${this.source}] Failed to send log:`, error);
            console.log(`[${new Date().toISOString()}] ${this.source} [${level.toUpperCase()}] ${message}`);
        }
    }

    async info(message: string, context?: LogContext): Promise<void> {
        return this.log('info', message, context);
    }

    async error(message: string, context?: LogContext): Promise<void> {
        return this.log('error', message, context);
    }

    async warning(message: string, context?: LogContext): Promise<void> {
        return this.log('warning', message, context);
    }

    async success(message: string, context?: LogContext): Promise<void> {
        return this.log('success', message, context);
    }

    async debug(message: string, context?: LogContext): Promise<void> {
        return this.log('debug', message, context);
    }

    async requestStart(method: string, url: string, context?: LogContext): Promise<void> {
        return this.info(`${method} ${url} - Request started`, {
            ...context,
            method,
            url,
            metadata: { event: 'request_start', ...context?.metadata }
        });
    }

    async requestEnd(method: string, url: string, statusCode: number, duration: number, context?: LogContext): Promise<void> {
        const level = statusCode >= 400 ? 'error' : statusCode >= 300 ? 'warning' : 'success';
        return this.log(level, `${method} ${url} - ${statusCode} (${duration}ms)`, {
            ...context,
            method,
            url,
            statusCode,
            duration,
            metadata: { event: 'request_end', ...context?.metadata }
        });
    }

    async authSuccess(userId: string, context?: LogContext): Promise<void> {
        return this.success('User authentication successful', {
            ...context,
            userId,
            metadata: { event: 'auth_success', ...context?.metadata }
        });
    }

    async authFailure(reason: string, context?: LogContext): Promise<void> {
        return this.warning(`Authentication failed: ${reason}`, {
            ...context,
            metadata: { event: 'auth_failure', reason, ...context?.metadata }
        });
    }

    async dbQuery(query: string, duration: number, context?: LogContext): Promise<void> {
        return this.debug(`DB Query executed (${duration}ms): ${query.substring(0, 100)}...`, {
            ...context,
            duration,
            metadata: { event: 'db_query', query: query.substring(0, 200), ...context?.metadata }
        });
    }

    async dbError(error: string, query?: string, context?: LogContext): Promise<void> {
        return this.error(`Database error: ${error}`, {
            ...context,
            metadata: { 
                event: 'db_error', 
                error,
                ...(query && { query: query.substring(0, 200) }),
                ...context?.metadata 
            }
        });
    }

    async externalApiCall(service: string, endpoint: string, duration: number, statusCode: number, context?: LogContext): Promise<void> {
        const level = statusCode >= 400 ? 'error' : 'info';
        return this.log(level, `External API call to ${service}${endpoint} - ${statusCode} (${duration}ms)`, {
            ...context,
            statusCode,
            duration,
            metadata: { 
                event: 'external_api_call', 
                service, 
                endpoint,
                ...context?.metadata 
            }
        });
    }

    async paymentEvent(event: 'payment_initiated' | 'payment_success' | 'payment_failed', amount: number, currency: string, context?: LogContext): Promise<void> {
        const level = event === 'payment_failed' ? 'error' : event === 'payment_success' ? 'success' : 'info';
        return this.log(level, `Payment ${event}: ${amount} ${currency}`, {
            ...context,
            metadata: { 
                event, 
                amount, 
                currency,
                ...context?.metadata 
            }
        });
    }

    async securityEvent(event: string, severity: 'low' | 'medium' | 'high' | 'critical', context?: LogContext): Promise<void> {
        const level = severity === 'critical' || severity === 'high' ? 'error' : 'warning';
        return this.log(level, `Security event: ${event} (${severity})`, {
            ...context,
            metadata: { 
                event: 'security_event', 
                securityEvent: event,
                severity,
                ...context?.metadata 
            }
        });
    }

    async performanceMetric(metric: string, value: number, unit: string, context?: LogContext): Promise<void> {
        return this.info(`Performance metric: ${metric} = ${value}${unit}`, {
            ...context,
            metadata: { 
                event: 'performance_metric', 
                metric, 
                value, 
                unit,
                ...context?.metadata 
            }
        });
    }


    child(additionalContext: LogContext): StructuredLogger {
        return new StructuredLogger(this.source, { ...this.defaultContext, ...additionalContext });
    }


    forRequest(requestId: string, userId?: string, additionalContext?: LogContext): StructuredLogger {
        return this.child({ requestId, userId, ...additionalContext });
    }
}


export function createLogger(source: string, defaultContext?: LogContext): StructuredLogger {
    return new StructuredLogger(source, defaultContext);
}


export function createRequestLogger(source: string) {
    const logger = createLogger(source);
    
    return (req: any, res: any, next: any) => {
        const startTime = Date.now();
        const requestId = req.headers['x-request-id'] || `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const userId = req.user?.id || req.userId;
        
        req.requestId = requestId;
        res.setHeader('x-request-id', requestId);
        
        req.logger = logger.forRequest(requestId, userId, {
            ip: req.ip || req.connection.remoteAddress,
            userAgent: req.headers['user-agent']
        });
        
        req.logger.requestStart(req.method, req.originalUrl || req.url);
        
        const originalEnd = res.end;
        res.end = function(...args: any[]) {
            const duration = Date.now() - startTime;
            req.logger.requestEnd(req.method, req.originalUrl || req.url, res.statusCode, duration);
            originalEnd.apply(res, args);
        };
        
        next();
    };
}


export function createErrorLogger(source: string) {
    const logger = createLogger(source);
    
    return (error: any, req: any, res: any, next: any) => {
        const requestLogger = req.logger || logger;
        
        requestLogger.error(`Unhandled error: ${error.message}`, {
            metadata: {
                error: error.name,
                stack: error.stack,
                event: 'unhandled_error'
            }
        });
        
        next(error);
    };
}
