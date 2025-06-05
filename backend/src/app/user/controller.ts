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
  authenticateJWT, 
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user || !req.user.id) {
        throw new BadRequestError("User not authenticated."); 
      }
      const userId = req.user.id;
      const validatedData = updateUsernameSchema.parse(req.body);

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

router.patch(
  "/update-password",
  authenticateJWT, 
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user || !req.user.id) {
        throw new BadRequestError("User not authenticated."); 
      }
      const userId = req.user.id; 
      const validatedData = updatePasswordSchema.parse(req.body);

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

router.get(
  "/me",
  authenticateJWT,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user || !req.user.id) {
        throw new BadRequestError("User not authenticated.");
      }

      const userId = req.user.id;
      const user = await userService.getUserById(userId); 

      if (!user) {
        throw new BadRequestError("User not found.");
      }

      res.json({
        id: user.id,
        name: user.username,
        email: user.email,
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
