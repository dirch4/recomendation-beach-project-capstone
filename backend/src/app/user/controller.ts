import express, { NextFunction, Response, Request } from "express";
import * as userService from "./service";
import {
  updatePasswordSchema,
  updateUsernameSchema,
  userSchema,
} from "./schema";
import { BadRequestError } from "../../error/BadRequestError";
import { authenticateJWT } from "../../middleware/auth";

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

      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

router.patch(
  "/update-username",
  authenticateJWT, // Memastikan pengguna sudah login
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user || !req.user.id) {
        throw new BadRequestError("User not authenticated."); // Fallback jika middleware gagal
      }
      const userId = req.user.id; // Ambil ID pengguna dari token
      const validatedData = updateUsernameSchema.parse(req.body); // Validasi input

      const updatedUser = await userService.updateUsername(
        userId,
        validatedData
      );
      res.json({
        message: "Username updated successfully",
        user: updatedUser,
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

// Rute untuk mengubah password (PATCH /user/update-password)
router.patch(
  "/update-password",
  authenticateJWT, // Memastikan pengguna sudah login
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user || !req.user.id) {
        throw new BadRequestError("User not authenticated."); // Fallback jika middleware gagal
      }
      const userId = req.user.id; // Ambil ID pengguna dari token
      const validatedData = updatePasswordSchema.parse(req.body); // Validasi input

      const updatedUser = await userService.updatePassword(
        userId,
        validatedData
      );
      res.json({
        message: "Password updated successfully",
        user: updatedUser,
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

export default router;
