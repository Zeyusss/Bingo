import express from "express";
import cors from "cors";
import proxy from "express-http-proxy";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import initializeConfig from "./libs/initializeSiteConfig";

const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:3001",
      "http://localhost:3002",
      "http://localhost:3003",
    ],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(morgan("dev"));
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ extended: true, limit: "100mb" }));
app.use(cookieParser());
app.set("trust proxy", 1);

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
    keyGenerator: (req: any) => {
      //key generation to prevent bypass attempts
      const userKey = req.user?.id || req.headers['x-user-id'] || 'anonymous';
      const ipKey = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for']?.split(',')[0];
      
      return `${userKey}:${ipKey}`;
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
        error: message,
        retryAfter,
        type: 'rate_limit_exceeded',
        timestamp: new Date().toISOString()
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

app.get("/gateway-health", (req, res) => {
  res.send({ message: "Welcome to api-gateway!" });
});

// routes
app.use('/admin/api/dashboard/resource-monitor', monitoringLimiter, proxy("http://localhost:6005", {
  proxyReqPathResolver: (req) => '/api/dashboard/resource-monitor'
})); // ultra-high for monitoring
app.use('/admin/api/dashboard/system-stats', monitoringLimiter, proxy("http://localhost:6005", {
  proxyReqPathResolver: (req) => '/api/dashboard/system-stats'
})); // ultra-high for stats
 app.use('/admin/api/dashboard/revenue', dashboardLimiter, proxy("http://localhost:6005", {
  proxyReqPathResolver: (req) => '/api/dashboard/revenue'
})); // specific route for revenue
app.use('/admin/api/dashboard', dashboardLimiter, proxy("http://localhost:6005")); // high capacity for dashboards
app.use('/order/api/get-recent-orders', dashboardLimiter, proxy("http://localhost:6004", {
  proxyReqPathResolver: (req) => '/api/get-recent-orders'
})); // high capacity for order dashboard
app.use("/blogs", apiLimiter, proxy("http://localhost:6009"));
app.use("/chatting", apiLimiter, proxy("http://localhost:6006")); // standard limits 
app.use("/admin", apiLimiter, proxy("http://localhost:6005")); // standard limits
app.use("/order", apiLimiter, proxy("http://localhost:6004")); // standard limits 
app.use("/seller", apiLimiter, proxy("http://localhost:6003")); // standard limits 
app.use("/product", apiLimiter, proxy("http://localhost:6002")); // standard limits
app.use("/", generalLimiter, proxy("http://localhost:6001")); // general limits 

const port = process.env.PORT || 8080;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api`);
  try {
    initializeConfig();
    console.log("Site config initialized Successfully!");
  } catch (error) {
    console.error("Failed to initialize site config:", error);
  }
});
server.on("error", console.error);
