import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.JWT_SECRET || "supersecretjwtkey"; // Pastikan sesuai dengan di auth.ts

export const generateToken = (userId: string): string => {
  return jwt.sign({ id: userId }, SECRET_KEY, { expiresIn: "1h" }); // Token berlaku 1 jam
};

export const verifyToken = (token: string): { id: string } | null => {
  try {
    const decoded = jwt.verify(token, SECRET_KEY) as { id: string };
    return decoded;
  } catch (error) {
    return null;
  }
};
