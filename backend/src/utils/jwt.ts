import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const SECRET_KEY = (process.env.JWT_SECRET as string) || "secretkey";
const EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1h";

export const generateToken = (userId: string): string => {
  return jwt.sign(
    { id: userId },
    SECRET_KEY as jwt.Secret,
    { expiresIn: EXPIRES_IN } as jwt.SignOptions
  );
};
