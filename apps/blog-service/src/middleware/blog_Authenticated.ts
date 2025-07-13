import jwt from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";
import prisma from "@packages/libs/prisma";
import { UserBlog } from "@prisma/client";

const blog_Authenticated = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token =
      req.headers.authorization?.split(" ")[1] || req.cookies["access_token"];

    if (!token) {
      return res.status(401).json({ message: "Unauthorized: Token missing" });
    }

    const decoded = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET as string
    ) as { id: string; role: UserBlog["role"] };

    if (!decoded?.id || !decoded.role) {
      return res.status(401).json({ message: "Unauthorized: Invalid token payload" });
    }

    const user = await prisma.userBlog.findUnique({ where: { id: decoded.id } });

    if (!user) {
      return res.status(401).json({ message: "Unauthorized: User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Auth Error:", error);
    return res.status(401).json({ message: "Unauthorized: Invalid token" });
  }
};

export default blog_Authenticated;
