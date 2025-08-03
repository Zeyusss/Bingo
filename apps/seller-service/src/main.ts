// Load environment variables
require('dotenv').config({ path: require('path').resolve(__dirname, '../../../.env') });

import { errorMiddleware } from "@packages/error-handler/error-middleware";
import { createLoggingMiddleware, createErrorLoggingMiddleware } from '@packages/middleware/logging.middleware';
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import router from "./routes/seller.routes";

const app = express();

app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:3001"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());


app.use(createLoggingMiddleware('seller-service'));

app.get("/", (req, res) => {
  res.send({ message: "Seller Service API" });
});

// routes
app.use("/api", router);


app.use(createErrorLoggingMiddleware('seller-service'));

app.use(errorMiddleware);

const port = process.env.PORT || 6003;
const server = app.listen(port, () => {
  console.log(`Seller service listening at http://localhost:${port}/api`);
});

server.on("error", (err) => {
  console.error("Server error:", err);
});
