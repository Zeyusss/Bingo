export function getAuthCookieOptions() {
  const nodeEnv = process.env.NODE_ENV || "development";
  const envSecure = process.env.COOKIE_SECURE;
  const envSameSite = process.env.COOKIE_SAME_SITE;

  const secure = envSecure === "true" || nodeEnv === "production";
  const sameSite =
    (envSameSite as "lax" | "strict" | "none") || (secure ? "none" : "lax");

  return {
    httpOnly: true,
    secure,
    sameSite,
    path: "/",
  } as const;
}
