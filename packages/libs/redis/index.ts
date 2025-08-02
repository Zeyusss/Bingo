import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_DATABASE_URL!, {
  connectTimeout: 10000,
  commandTimeout: 5000, 
  lazyConnect: true, 


  keepAlive: 30000, // 30 seconds


  tls: process.env.REDIS_DATABASE_URL?.startsWith("rediss://") ? {} : undefined,
});


redis.on("error", (error: any) => {
  console.error("Redis connection error:", error.message);
  if (
    error.code === "ECONNREFUSED" ||
    error.code === "ETIMEDOUT" ||
    error.code === "EACCES"
  ) {
    console.warn("Redis connection failed, continuing without Redis...");
  }
});

redis.on("connect", () => {
  console.log("Redis connected successfully");
});

redis.on("ready", () => {
  console.log("Redis is ready to accept commands");
});

redis.on("close", () => {
  console.log("Redis connection closed");
});

redis.on("reconnecting", () => {
  console.log("Redis reconnecting...");
});

export default redis;
