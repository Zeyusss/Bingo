import { Response } from "express";

export const setCookie = (res: Response, name: string, value: string) => {
  res.cookie(name, value, {
    httpOnly: true,
    secure: false, // Changed for localhost
    sameSite: "lax", // Changed for localhost
    maxAge: 7 * 24 * 60 * 60 * 1000, // Cookie expiration time (1 week)
  });
};
