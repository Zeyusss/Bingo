import { Response } from "express";
import { getAuthCookieOptions } from "@packages/libs/cookie-options";

const DEFAULT_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days

export const AUTH_COOKIE_NAMES = [
  "access_token",
  "refresh_token",
  "admin_access_token",
  "admin_refresh_token",
  "seller_access_token",
  "seller_refresh_token",
] as const;

export const setCookie = (res: Response, name: string, value: string) => {
  res.cookie(name, value, {
    ...getAuthCookieOptions(),
    maxAge: DEFAULT_MAX_AGE,
  });
};

/** Must match setCookie options or browsers won't clear secure cookies in production. */
export const clearAuthCookies = (res: Response) => {
  const options = getAuthCookieOptions();
  for (const name of AUTH_COOKIE_NAMES) {
    res.clearCookie(name, options);
  }
};

export { getAuthCookieOptions };
