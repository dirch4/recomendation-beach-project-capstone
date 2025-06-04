import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

// Mengambil SECRET_KEY dari environment variables. Penting untuk tidak menggunakan fallback di produksi!
const SECRET_KEY = process.env.JWT_SECRET;

// Pastikan SECRET_KEY telah diatur
if (!SECRET_KEY) {
  console.error(
    "FATAL ERROR: JWT_SECRET is not defined in environment variables."
  );
  process.exit(1);
}

declare global {
  namespace Express {
    interface Request {
      user?: { id: string };
    }
  }
}

export const authenticateJWT = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res
      .status(401)
      .json({ error: "Unauthorized: No token provided or malformed header" });
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, SECRET_KEY) as { id: string };

    req.user = { id: decoded.id };
    next();
  } catch (error: any) {
    console.error("JWT verification error:", error.message);
    if (error.name === "TokenExpiredError") {
      res.status(401).json({ error: "Unauthorized: Token expired" });
      return;
    }
    if (error.name === "JsonWebTokenError") {
      res.status(401).json({ error: "Unauthorized: Invalid token" });
      return;
    }
    res
      .status(401)
      .json({ error: "Unauthorized: Failed to authenticate token" });
    return;
  }
};
