import * as jwt from "jsonwebtoken";
import prisma from "@packages/libs/prisma";

export interface DecodedAccessToken {
  id: string;
  role: "user" | "seller" | "admin";
}

function parseCookies(cookieHeader: string): Record<string, string> {
  return cookieHeader.split(";").reduce((acc, pair) => {
    const [key, ...val] = pair.trim().split("=");
    if (key) acc[key.trim()] = decodeURIComponent(val.join("=").trim());
    return acc;
  }, {} as Record<string, string>);
}

export function verifyAccessToken(
  cookieHeader?: string,
  authHeader?: string
): DecodedAccessToken {
  const secret = process.env.ACCESS_TOKEN_SECRET as string;
  let token: string | undefined;

  if (cookieHeader) {
    const cookies = parseCookies(cookieHeader);
    token = cookies["access_token"] || cookies["seller_access_token"];
  }

  if (!token && authHeader?.startsWith("Bearer ")) {
    token = authHeader.slice(7);
  }

  if (!token) throw new Error("No access token");

  const decoded = jwt.verify(token, secret) as DecodedAccessToken;
  if (!decoded?.id || !decoded?.role) throw new Error("Invalid token payload");
  return decoded;
}

export async function verifyAccessTokenWithDb(
  cookieHeader?: string,
  authHeader?: string
): Promise<DecodedAccessToken> {
  const decoded = verifyAccessToken(cookieHeader, authHeader);

  if (decoded.role === "seller") {
    const seller = await prisma.sellers.findUnique({
      where: { id: decoded.id },
      select: { isDeleted: true, isBlocked: true },
    });
    if (!seller || seller.isDeleted || seller.isBlocked) {
      throw new Error("Seller account is inactive or blocked");
    }
  } else if (decoded.role === "user") {
    const user = await prisma.users.findUnique({
      where: { id: decoded.id },
      select: { isDeleted: true, isBlocked: true },
    });
    if (!user || user.isDeleted || user.isBlocked) {
      throw new Error("User account is inactive or blocked");
    }
  }

  return decoded;
}
