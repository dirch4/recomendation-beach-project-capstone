import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.JWT_SECRET || "supersecretjwtkey"; // Pastikan sesuai dengan di auth.ts

export const generateToken = (user: { id: string; email: string; name: string }): string => {
  return jwt.sign( {id: user.id, email: user.email, name: user.name,}, SECRET_KEY, { expiresIn: "1h" }); // Token berlaku 1 jam
};

export const verifyToken = (token: string): { id: string; email: string; name: string } | null => {

  
  try {
    const decoded = jwt.verify(token, SECRET_KEY) as { id: string; email: string; name: string };
    return decoded;
  } catch (error) {
    return null;
  }
};

