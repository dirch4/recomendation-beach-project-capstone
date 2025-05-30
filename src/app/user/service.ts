import { PrismaClient } from "@prisma/client";
import { BadRequestError } from "../../error/BadRequestError"; // Import kelas custom error
import bcrypt from "bcryptjs";
import { generateToken } from "../../utils/jwt"; // Import fungsi untuk membuat JWT

const prisma = new PrismaClient();

/**
 * Mendaftarkan pengguna baru.
 * Memvalidasi password, memeriksa keberadaan pengguna, mengenkripsi password,
 * menyimpan pengguna, dan menghasilkan token JWT.
 */
export const registerUser = async (
  username: string,
  email: string,
  password: string,
  confirmPassword: string
) => {
  // Validasi password match sudah ditangani di schema.ts, tapi bisa juga di sini sebagai fallback
  if (password !== confirmPassword) {
    throw new BadRequestError("Passwords do not match");
  }

  // Memeriksa apakah pengguna dengan email yang sama sudah ada
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new BadRequestError("User with this email already exists");
  }

  // Mengenkripsi password sebelum menyimpan ke database
  const hashedPassword = await bcrypt.hash(password, 10);

  // Membuat pengguna baru di database
  const newUser = await prisma.user.create({
    data: {
      username,
      email,
      password: hashedPassword,
    },
  });

  const token = generateToken(newUser.id);

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
  if (!user) {
    throw new BadRequestError("Invalid credentials: User not found");
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new BadRequestError("Invalid credentials: Incorrect password");
  }

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
