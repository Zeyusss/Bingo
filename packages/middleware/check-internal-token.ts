import { Request, Response, NextFunction } from "express";

const checkInternalToken = (req: Request, res: Response, next: NextFunction) => {
  if (req.method === "GET" && req.path === "/") {
    return next();
  }

  const token = req.headers["x-internal-service-token"] as string | undefined;
  if (!token || token !== process.env.INTERNAL_SERVICE_TOKEN) {
    return res.status(403).json({ status: "error", message: "Forbidden" });
  }

  next();
};

export default checkInternalToken;