import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import proxy from "express-http-proxy";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import initializeConfig from "./libs/initializeSiteConfig";
import { v4 as uuidv4 } from 'uuid';

const app = express();

const corsOrigins = (process.env.CORS_ORIGINS || "http://localhost:3000").split(",");
const INTERNAL_SERVICE_TOKEN = process.env.INTERNAL_SERVICE_TOKEN;

app.use(
  cors({
    origin: corsOrigins,
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(morgan("dev"));
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(cookieParser());
app.set("trust proxy", 1);

app.use((req: Request, res: Response, next: NextFunction) => {
  req.headers['x-request-id'] = (req.headers['x-request-id'] as string) || uuidv4();
  res.setHeader('x-request-id', req.headers['x-request-id'] as string);
  next();
});

// sliding window rate limiting
const createRateLimiter = (windowMs: number, max: number, message: string) => {
  return rateLimit({
    windowMs,
    max,
    message: { 
      error: message,
      retryAfter: Math.ceil(windowMs / 1000),
      type: 'rate_limit_exceeded'
    },
    standardHeaders: true, 
    legacyHeaders: false, 
    keyGenerator: (req: Request) => {
      return req.ip || req.socket.remoteAddress || 'anonymous';
    },
    handler: (req, res) => {
      const retryAfter = Math.ceil(windowMs / 1000);
      res.set({
        'Retry-After': retryAfter.toString(),
        'X-RateLimit-Limit': max.toString(),
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': new Date(Date.now() + windowMs).toISOString()
      });
      res.status(429).json({
        status: 'error',
        message: message,
        details: { retryAfter, type: 'rate_limit_exceeded', timestamp: new Date().toISOString() }
      });
    },
    skip: (req) => {
      return req.path === '/gateway-health' || req.path === '/health';
    }
  });
};


const generalLimiter = createRateLimiter(
  60 * 1000, 
  100, 
  'Too many requests. Please wait a moment before trying again.'
);



const apiLimiter = createRateLimiter(
  60 * 1000, 
  200,
  'API rate limit exceeded. Please reduce request frequency.'
);


const dashboardLimiter = createRateLimiter(
  60 * 1000,
  500, 
  'Dashboard rate limit exceeded. Reducing polling frequency temporarily.'
);


const monitoringLimiter = createRateLimiter(
  60 * 1000, 
  1000, 
  'Monitoring rate limit exceeded. Please contact system administrator.'
);

const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  keyGenerator: (req: Request) => req.ip || req.socket.remoteAddress || 'anonymous',
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      status: 'error',
      message: 'Too many auth attempts. Please wait before trying again.',
      retryAfter: 60,
    });
  },
});

app.get("/gateway-health", (req, res) => {
  res.send({ message: "Welcome to api-gateway!" });
});

const makeProxyOptions = (pathResolver?: (req: Request) => string) => ({
  proxyReqOptDecorator: (proxyReqOpts: any) => {
    proxyReqOpts.headers = proxyReqOpts.headers || {};
    proxyReqOpts.headers['x-internal-service-token'] = process.env.INTERNAL_SERVICE_TOKEN || '';
    proxyReqOpts.headers['x-request-id'] = proxyReqOpts.headers['x-request-id'] || '';
    return proxyReqOpts;
  },
  ...(pathResolver ? { proxyReqPathResolver: pathResolver } : {}),
});

// routes
app.use('/admin/api/dashboard/resource-monitor', monitoringLimiter, proxy('http://localhost:6005', makeProxyOptions((req) => '/api/dashboard/resource-monitor'))); // ultra-high for monitoring
app.use('/admin/api/dashboard/system-stats', monitoringLimiter, proxy('http://localhost:6005', makeProxyOptions((req) => '/api/dashboard/system-stats'))); // ultra-high for stats
app.use('/admin/api/dashboard/revenue', dashboardLimiter, proxy('http://localhost:6005', makeProxyOptions((req) => '/api/dashboard/revenue'))); // specific route for revenue
app.use('/admin/api/dashboard', dashboardLimiter, proxy('http://localhost:6005', makeProxyOptions())); // high capacity for dashboards
app.use('/order/api/get-recent-orders', dashboardLimiter, proxy('http://localhost:6004', makeProxyOptions((req) => '/api/get-recent-orders'))); // high capacity for order dashboard
app.use("/blogs", apiLimiter, proxy('http://localhost:6009', makeProxyOptions()));
app.use("/recommendation", apiLimiter, proxy('http://localhost:6007', makeProxyOptions()));
app.use("/chatting", apiLimiter, proxy('http://localhost:6006', makeProxyOptions())); // standard limits 
app.use("/admin", apiLimiter, proxy('http://localhost:6005', makeProxyOptions())); // standard limits
app.use("/order", apiLimiter, proxy('http://localhost:6004', makeProxyOptions())); // standard limits 
app.use("/seller", apiLimiter, proxy('http://localhost:6003', makeProxyOptions())); // standard limits 
app.use("/product", apiLimiter, proxy('http://localhost:6002', makeProxyOptions())); // standard limits
app.use('/api', authLimiter, proxy('http://localhost:6001', makeProxyOptions())); // auth routes (login, OTP, password-reset)
app.use("/", generalLimiter, proxy('http://localhost:6001', makeProxyOptions())); // general limits 

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('[api-gateway] Unhandled error:', err);
  res.status(500).json({ status: 'error', message: 'Internal gateway error' });
});

const port = process.env.PORT || 8080;
initializeConfig()
  .then(() => {
    const server = app.listen(port, () => {
      console.log(`api-gateway running on port ${port}`);
    });
    server.on("error", console.error);
  })
  .catch((err) => {
    console.error('Failed to initialize config:', err);
    process.exit(1);
  });
