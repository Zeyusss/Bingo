import * as jwt from "jsonwebtoken";
import { NextFunction, Response } from "express";
import prisma from "../libs/prisma";

const ACCESS_TOKEN_COOKIE_NAMES = [
  "admin_access_token",
  "access_token",
  "seller_access_token",
] as const;

const isAuthenticated = async (req: any, res: Response, next: NextFunction) => {
  try {
    const secret = process.env.ACCESS_TOKEN_SECRET as string;
    const bearerToken = req.headers.authorization?.split(" ")[1];
    const candidates = [
      ...ACCESS_TOKEN_COOKIE_NAMES.map((name) => req.cookies[name]),
      bearerToken,
    ].filter((value): value is string => Boolean(value));

    let decoded: { id: string; role: "user" | "admin" | "seller" } | null = null;

    for (const token of candidates) {
      try {
        const payload = jwt.verify(token, secret) as {
          id: string;
          role: "user" | "admin" | "seller";
        };
        if (payload?.id && payload?.role) {
          decoded = payload;
          break;
        }
      } catch {
        // Try next cookie (e.g. stale access_token vs valid admin_access_token)
      }
    }

    if (!decoded) {
      const hasAnyCookie = ACCESS_TOKEN_COOKIE_NAMES.some(
        (name) => req.cookies[name],
      );
      return res.status(401).json({
        message: hasAnyCookie
          ? "Unauthorized ! Token Invalid."
          : "Unauthorized ! Token Missing.",
      });
    }

    let account;
    if (decoded.role === "user" || decoded.role === "admin") {
      account = await prisma.users.findUnique({
        where: { id: decoded.id },
        include: {
          avatar: {
            select: {
              id: true,
              url: true,
            },
          },
        },
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

    if (decoded.role === "seller" && account.isBlocked) {
      return res.status(403).json({ message: "Forbidden" });
    }

    if (decoded.role === "seller" && account.isDeleted) {
      return res
        .status(401)
        .json({ message: "Account has been suspended or deleted." });
    }

    if (
      decoded.role === "seller" &&
      account.deletedAt &&
      new Date() > new Date(account.deletedAt)
    ) {
      return res.status(401).json({
        message:
          "Account deletion date has passed. Your account is no longer accessible.",
      });
    }

    req.role = decoded.role;
    return next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized ! Token Invalid." });
  }
};

export default isAuthenticated;
