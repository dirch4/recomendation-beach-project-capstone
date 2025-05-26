import { PrismaClient } from "@prisma/client";
import { BadRequestError } from "../../error/BadRequestError";
import bcrypt from "bcryptjs";
import { generateToken } from "../../utils/jwt";

const prisma = new PrismaClient();

export const registerUser = async (
  username: string,
  email: string,
  password: string,
  confirmPassword: string
) => {
  if (!password || !confirmPassword || password !== confirmPassword) {
    throw new BadRequestError("passwords do not match");
  }

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new BadRequestError("User already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await prisma.user.create({
    data: {
      username,
      email,
      password: hashedPassword,
      confirmPassword: hashedPassword,
    },
  });

  return newUser;
};

export const loginUser = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new BadRequestError("User not found");

  const invalidPassword = await bcrypt.compare(password, user.password);
  if (!invalidPassword) throw new BadRequestError("Invalid password");

  const token = generateToken(user.id);

  return {
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      token,
    },
  };
};
