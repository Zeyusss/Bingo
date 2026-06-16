import { Request, Response, NextFunction } from 'express';

const requestCounts = new Map<string, { count: number; resetTime: number }>();

interface RateLimitOptions {
  windowMs: number;
  maxRequests: number;
  message?: string;
}

export const createRateLimiter = (options: RateLimitOptions) => {
  const {
    windowMs,
    maxRequests,
    message = 'Too many requests, please try again later.',
  } = options;

  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const clientId = `${req.ip || req.connection.remoteAddress}:${req.get('User-Agent') || 'unknown'}`;
      const now = Date.now();

      for (const [key, data] of requestCounts.entries()) {
        if (now > data.resetTime) {
          requestCounts.delete(key);
        }
      }

      let clientData = requestCounts.get(clientId);
      if (!clientData || now > clientData.resetTime) {
        clientData = { count: 0, resetTime: now + windowMs };
        requestCounts.set(clientId, clientData);
      }

      if (clientData.count >= maxRequests) {
        const resetTimeSeconds = Math.ceil((clientData.resetTime - now) / 1000);
        res.set({
          'X-RateLimit-Limit': maxRequests.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': Math.ceil(clientData.resetTime / 1000).toString(),
          'Retry-After': resetTimeSeconds.toString(),
        });
        return res.status(429).json({
          success: false,
          message,
          retryAfter: resetTimeSeconds,
        });
      }

      clientData.count++;
      res.set({
        'X-RateLimit-Limit': maxRequests.toString(),
        'X-RateLimit-Remaining': (maxRequests - clientData.count).toString(),
        'X-RateLimit-Reset': Math.ceil(clientData.resetTime / 1000).toString(),
      });

      return next();
    } catch (error) {
      console.error('Rate limiter error:', error);
      return next();
    }
  };
};

export const couponRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  maxRequests: 10,
  message: 'Too many coupon attempts. Please wait 15 minutes before trying again.',
});
