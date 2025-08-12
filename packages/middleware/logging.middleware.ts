import { Request, Response, NextFunction } from "express";
import { sendLog } from "../utils/logs/send-logs";

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role?: string;
    email?: string;
  };
  requestId?: string;
}

/**
 * Simple request logging middleware
 * Logs requests without breaking existing functionality
 */
export function createLoggingMiddleware(serviceName: string) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const startTime = Date.now();
    const requestId =
      (req.headers["x-request-id"] as string) ||
      `${serviceName}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    req.requestId = requestId;
    res.setHeader("x-request-id", requestId);

    sendLog({
      type: "info",
      message: `${req.method} ${req.originalUrl || req.url} - Request started`,
      source: serviceName,
      requestId,
      userId: req.user?.id,
      metadata: {
        method: req.method,
        url: req.originalUrl || req.url,
        userAgent: req.headers["user-agent"],
        ip: req.ip || req.connection?.remoteAddress,
      },
    }).catch((err) => console.error("Failed to send request start log:", err));

    const originalEnd = res.end;
    res.end = function (chunk?: any, encoding?: any) {
      const duration = Date.now() - startTime;

      sendLog({
        type:
          res.statusCode >= 400
            ? "error"
            : res.statusCode >= 300
            ? "warning"
            : "info",
        message: `${req.method} ${req.originalUrl || req.url} - ${
          res.statusCode
        } (${duration}ms)`,
        source: serviceName,
        requestId,
        userId: req.user?.id,
        metadata: {
          method: req.method,
          url: req.originalUrl || req.url,
          statusCode: res.statusCode,
          duration,
          responseSize: res.get("content-length") || 0,
        },
      }).catch((err) =>
        console.error("Failed to send request completion log:", err)
      );

      if (duration > 2000) {
        sendLog({
          type: "warning",
          message: `Slow request: ${duration}ms`,
          source: serviceName,
          requestId,
          userId: req.user?.id,
          metadata: {
            method: req.method,
            url: req.originalUrl || req.url,
            duration,
            threshold: 2000,
          },
        }).catch((err) =>
          console.error("Failed to send slow request log:", err)
        );
      }

      return originalEnd.call(this, chunk, encoding);
    };

    next();
  };
}

export function createErrorLoggingMiddleware(serviceName: string) {
  return (
    error: any,
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    sendLog({
      type: "error",
      message: `Unhandled error: ${error.message}`,
      source: serviceName,
      requestId: req.requestId,
      userId: req.user?.id,
      metadata: {
        error: error.name,
        errorMessage: error.message,
        stack: error.stack,
        statusCode: error.statusCode || 500,
        method: req.method,
        url: req.originalUrl || req.url,
        requestBody: req.body,
        query: req.query,
        params: req.params,
      },
    }).catch((err) => console.error("Failed to send error log:", err));

    if (error.name === "AuthError" || error.name === "UnauthorizedError") {
      sendLog({
        type: "error",
        message: `Security event: ${error.message}`,
        source: serviceName,
        requestId: req.requestId,
        userId: req.user?.id,
        metadata: {
          severity: "high",
          errorType: error.name,
          method: req.method,
          url: req.originalUrl || req.url,
        },
      }).catch((err) => console.error("Failed to send security log:", err));
    }

    next(error);
  };
}

export class BusinessEventLogger {
  private serviceName: string;

  constructor(serviceName: string) {
    this.serviceName = serviceName;
  }

  async logUserAction(
    action: string,
    userId: string,
    details: Record<string, any> = {},
    requestId?: string
  ) {
    await sendLog({
      type: "info",
      message: `User action: ${action}`,
      source: this.serviceName,
      requestId,
      userId,
      metadata: {
        event: "user_action",
        action,
        ...details,
      },
    }).catch((err) => console.error("Failed to send user action log:", err));
  }

  async logPaymentEvent(
    event: "payment_initiated" | "payment_success" | "payment_failed",
    amount: number,
    currency: string,
    userId: string,
    details: Record<string, any> = {},
    requestId?: string
  ) {
    await sendLog({
      type: event === "payment_failed" ? "error" : "info",
      message: `Payment event: ${event}`,
      source: this.serviceName,
      requestId,
      userId,
      metadata: {
        event: "payment_event",
        paymentEvent: event,
        amount,
        currency,
        timestamp: new Date().toISOString(),
        ...details,
      },
    }).catch((err) => console.error("Failed to send payment log:", err));
  }

  async logSecurityEvent(
    event: string,
    severity: "low" | "medium" | "high" | "critical",
    userId?: string,
    details: Record<string, any> = {},
    requestId?: string
  ) {
    await sendLog({
      type:
        severity === "critical" || severity === "high" ? "error" : "warning",
      message: `Security event: ${event}`,
      source: this.serviceName,
      requestId,
      userId,
      metadata: {
        event: "security_event",
        securityEvent: event,
        severity,
        timestamp: new Date().toISOString(),
        ...details,
      },
    }).catch((err) => console.error("Failed to send security log:", err));
  }
}

export const authEventLogger = new BusinessEventLogger("auth-service");
export const orderEventLogger = new BusinessEventLogger("order-service");
export const productEventLogger = new BusinessEventLogger("product-service");
export const adminEventLogger = new BusinessEventLogger("admin-service");
