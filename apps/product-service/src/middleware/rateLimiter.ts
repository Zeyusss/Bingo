import { Request, Response, NextFunction } from 'express';


const requestCounts = new Map<string, { count: number; resetTime: number; windowStart: number }>();

interface RateLimitOptions {
  windowMs: number; 
  maxRequests: number; 
  message?: string;
  skipSuccessfulRequests?: boolean;
}

export const createRateLimiter = (options: RateLimitOptions) => {
  const {
    windowMs,
    maxRequests,
    message = 'Too many requests, please try again later.',
    skipSuccessfulRequests = false
  } = options;

  setInterval(() => {
    const now = Date.now();
    for (const [key, data] of requestCounts.entries()) {
      if (now - data.windowStart > windowMs) {
        requestCounts.delete(key);
      }
    }
  }, windowMs).unref();

  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const clientId = `${req.ip || req.connection.remoteAddress}:${req.get('User-Agent') || 'unknown'}`;
      const now = Date.now();
      
      let clientData = requestCounts.get(clientId);
      if (!clientData || now > clientData.resetTime) {
        clientData = {
          count: 0,
          resetTime: now + windowMs,
          windowStart: now,
        };
        requestCounts.set(clientId, clientData);
      }
      
      if (clientData.count >= maxRequests) {
        const resetTimeSeconds = Math.ceil((clientData.resetTime - now) / 1000);
        
        res.set({
          'X-RateLimit-Limit': maxRequests.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': Math.ceil(clientData.resetTime / 1000).toString(),
          'Retry-After': resetTimeSeconds.toString()
        });
        
        return res.status(429).json({
          success: false,
          message,
          retryAfter: resetTimeSeconds
        });
      }
      
      if (!skipSuccessfulRequests) {
        clientData.count++;
      }
      
      res.set({
        'X-RateLimit-Limit': maxRequests.toString(),
        'X-RateLimit-Remaining': (maxRequests - clientData.count).toString(),
        'X-RateLimit-Reset': Math.ceil(clientData.resetTime / 1000).toString()
      });
      
      if (skipSuccessfulRequests) {
        const originalSend = res.json;
        res.json = function(body: any) {
          if (res.statusCode >= 400) {
            clientData!.count++;
          }
          return originalSend.call(this, body);
        };
      }
      
      return next();
    } catch (error) {
      console.error('Rate limiter error:', error);
      return next(); 
    }
  };
};


export const searchRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 100, 
  message: 'Too many search requests. Please wait a moment before searching again.',
  skipSuccessfulRequests: true
});

export const suggestionsRateLimiter = createRateLimiter({
  windowMs: 60 * 1000, 
  maxRequests: 200,
  message: 'Too many suggestion requests. Please slow down your typing.',
  skipSuccessfulRequests: true
});

export const filtersRateLimiter = createRateLimiter({
  windowMs: 5 * 60 * 1000, 
  maxRequests: 50, 
  message: 'Too many filter requests. Please wait before requesting filters again.'
});

/** Applies to all product-service HTTP traffic (direct :6002 access). */
export const globalRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 200,
  message: 'Too many requests. Please try again later.',
});
