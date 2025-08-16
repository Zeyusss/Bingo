import { users, sellers, UserRole } from "@prisma/client";
import { BusinessEventLogger } from "@packages/middleware/logging.middleware";
import { Request } from "express";

declare module "express-serve-static-core" {
    interface Request {
    user?: users;
    seller?: sellers;
    role?: UserRole | "SELLER";
    logger?: BusinessEventLogger;
    requestId?: string;
  }
}
