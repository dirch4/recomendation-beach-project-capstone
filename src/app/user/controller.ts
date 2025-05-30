import express, { NextFunction, Response, Request } from "express";
import * as userService from "./service";
import { userSchema } from "./schema";
import { BadRequestError } from "../../error/BadRequestError";

const router = express.Router();

router.post(
  "/register",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = userSchema.parse(req.body);
      const { username, email, password, confirmPassword } = validatedData;

      const result = await userService.registerUser(
        username,
        email,
        password,
        confirmPassword
      );

      // Opsional: Jika ingin menyimpan token di HTTP-only cookie (lebih aman dari XSS)
      // Perhatikan: Jika Anda menggunakan cookie, frontend tidak perlu membaca token dari body JSON
      // res.cookie('jwtToken', result.user.token, {
      //   httpOnly: true, // Mencegah akses JavaScript dari client
      //   secure: process.env.NODE_ENV === 'production', // Hanya kirim via HTTPS di produksi
      //   maxAge: 7 * 24 * 60 * 60 * 1000, // Durasi cookie: 7 hari (dalam milidetik)
      //   sameSite: 'Lax', // Pengaturan SameSite untuk CSRF protection
      // });

      res.status(201).json({
        message: "User registered successfully",
        user: {
          id: result.user.id,
          username: result.user.username,
          email: result.user.email,
          token: result.user.token,
        },
      });
    } catch (error: any) {
      if (
        error.issues &&
        Array.isArray(error.issues) &&
        error.issues.length > 0
      ) {
        return next(
          new BadRequestError(`Validation Error: ${error.issues[0].message}`)
        );
      }
      next(error);
    }
  }
);

router.post(
  "/login",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;

      const result = await userService.loginUser(email, password);

      // Opsional: Jika ingin menyimpan token di HTTP-only cookie
      // res.cookie('jwtToken', result.user.token, {
      //   httpOnly: true,
      //   secure: process.env.NODE_ENV === 'production',
      //   maxAge: 7 * 24 * 60 * 60 * 1000,
      //   sameSite: 'Lax',
      // });

      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
