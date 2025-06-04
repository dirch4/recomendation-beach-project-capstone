import { Request, Response, NextFunction } from "express";
import moment from "moment-timezone";

// Middleware untuk logging request
export const logger = (req: Request, res: Response, next: NextFunction) => {
  const indonesiaTime = moment()
    .tz("Asia/Jakarta")
    .format("YYYY-MM-DD HH:mm:ss");
  console.log(`[${indonesiaTime}] ${req.method} ${req.url}`);
  next();
};
