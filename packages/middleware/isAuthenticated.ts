import * as jwt from "jsonwebtoken";
import { NextFunction, Response } from "express";
import prisma from "../libs/prisma";


const isAuthenticated = async (req: any, res: Response, next: NextFunction) => {
  try {
    const token =
      req.cookies["access_token"] ||
      req.cookies["access_Token"] ||
      req.cookies["seller-access-token"] ||
      req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Unauthorized ! Token Missing." });
    }

    let decoded;
    try {
      decoded = jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET as string
      ) as { id: string; role: "user" | "admin" | "seller" };
    } catch (err) {
      return res.status(401).json({ message: "Unauthorized ! Token Invalid." });
    }

    if (!decoded || !decoded.id || !decoded.role) {
      return res.status(401).json({ message: "Forbidden ! Invalid Token." });
    }

    let account;
    if (decoded.role === "user" || decoded.role === "admin") {
      account = await prisma.users.findUnique({
        where: { id: decoded.id },
      });
      req.user = account;
    } else if (decoded.role === "seller") {
      account = await prisma.sellers.findUnique({
        where: { id: decoded.id },
        include: { 
          shop: {
            include: {
              avatar: {
                select: {
                  id: true,
                  url: true,
                },
              },
            },
          },
        },
      });
      req.seller = account;
    }

    if (!account) {
      return res
        .status(401)
        .json({ message: "Forbidden ! User/Seller not found." });
    }

    req.role = decoded.role;
    return next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized ! Token Invalid." });
  }
};

export default isAuthenticated;
