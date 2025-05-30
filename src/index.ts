import dotenv from "dotenv";
import express, { Request, Response, NextFunction } from "express";
import userController from "./app/user/controller";
import reviewController from "./app/review/controller"; // Import reviewController
import { authenticateJWT } from "./middleware/auth";
import { errorHandler } from "./app/error/errorHandler";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

app.use("/user", userController);
app.use("/api", authenticateJWT, reviewController); // Semua rute /api memerlukan JWT

app.get("/protected-route", authenticateJWT, (req: Request, res: Response) => {
  res.json({
    message: "Anda berhasil mengakses rute terproteksi!",
    userId: req.user?.id,
    timestamp: new Date().toISOString(),
  });
});

app.use(errorHandler);

app.listen(PORT, () =>
  console.log(`Server running on port http://localhost:${PORT}`)
);
