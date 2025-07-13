import { UserBlog } from "@prisma/client";

declare global {
  namespace Express {
    interface Request {
      user?: UserBlog;
    }
  }
}

export {}; 