require("dotenv").config({
  path: require("path").resolve(__dirname, "../../../.env"),
});

import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import blogRoutes from "./routes/blog.routes";
import { errorMiddleware } from "@packages/error-handler/error-middleware";
import {
  createLoggingMiddleware,
  createErrorLoggingMiddleware,
} from "@packages/middleware/logging.middleware";
import checkInternalToken from "@packages/middleware/check-internal-token";

const app = express();

const corsOrigins = (process.env.CORS_ORIGINS || "http://localhost:3000").split(",");

app.use(
  cors({
    origin: corsOrigins,
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);


app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

app.use(cookieParser());
app.use(createLoggingMiddleware("blog-service"));

app.use(checkInternalToken);

app.use("/", blogRoutes);


// Default route
app.get("/", (_, res) => {
  res.send({ message: "Blog Service is running" });
});


app.use("*", (_, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use(createErrorLoggingMiddleware("blog-service"));
app.use(errorMiddleware);

const port = process.env.PORT || 6009;
const server = app.listen(port, () => {
  console.log(`Blog service running at http://localhost:${port}/`);
});
server.on("error", console.error);
