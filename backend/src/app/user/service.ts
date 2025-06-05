// src/app/user/service.ts

import { PrismaClient } from "@prisma/client";
import { BadRequestError } from "../../error/BadRequestError";
import bcrypt from "bcryptjs";
import { generateToken } from "../../utils/jwt";
import { UpdateUsernameDTO, UpdatePasswordDTO } from "./dto"; // Import DTOs baru

const prisma = new PrismaClient();

export const registerUser = async (
  username: string,
  email: string,
  password: string,
  confirmPassword: string
) => {
  if (password !== confirmPassword) {
    throw new BadRequestError("Passwords do not match");
  }

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new BadRequestError("User with this email already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await prisma.user.create({
    data: {
      username,
      email,
      password: hashedPassword,
    },
  });

  const token = generateToken({
    id: newUser.id,
    email: newUser.email,
    name: newUser.username,
  });

  return {
    user: {
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      token,
    },
  };
};

export const loginUser = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new BadRequestError("Invalid credentials: User not found");

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) throw new BadRequestError("Invalid password");

  const token = generateToken({
    id: user.id,
    email: user.email,
    name: user.username,
  });
  
  return {
    token,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
    },
  };
};

// Fungsi baru: Update Username
export const updateUsername = async (
  userId: string,
  data: UpdateUsernameDTO
) => {
  const { newUsername } = data;

  // Pastikan username baru belum digunakan oleh user lain
  const existingUserWithNewUsername = await prisma.user.findUnique({
    where: { username: newUsername },
  });

  if (
    existingUserWithNewUsername &&
    existingUserWithNewUsername.id !== userId
  ) {
    throw new BadRequestError("Username already taken by another user.");
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { username: newUsername },
    select: { id: true, username: true, email: true }, // Pilih field yang ingin dikembalikan
  });

  return updatedUser;
};

// Fungsi baru: Update Password
export const updatePassword = async (
  userId: string,
  data: UpdatePasswordDTO
) => {
  const { oldPassword, newPassword, confirmNewPassword } = data;

  if (newPassword !== confirmNewPassword) {
    throw new BadRequestError("New password and confirmation do not match.");
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new BadRequestError("User not found."); // Seharusnya tidak terjadi karena authenticated
  }

  const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);
  if (!isOldPasswordValid) {
    throw new BadRequestError("Old password is incorrect.");
  }

  const hashedNewPassword = await bcrypt.hash(newPassword, 10);

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { password: hashedNewPassword },
    select: { id: true, username: true, email: true }, // Pilih field yang ingin dikembalikan
  });

  return updatedUser;
};

export async function getUserById(userId: string) {
  return await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, username: true, email: true},
  });
}
