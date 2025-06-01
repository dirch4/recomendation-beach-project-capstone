import dotenv from "dotenv";
import express from "express";
import userController from "./app/user/controller";
import reviewController from "./app/review/controller";
import beachController from "./app/beach/controller";
import { logger } from "./middleware/logger";
import { errorHandler } from "./middleware/error";
import cors from "cors";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use("/user", userController);
app.use("/review", reviewController);
app.use("/beach", beachController);

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json());
app.use(logger);
app.use(errorHandler);

app.listen(PORT, () =>
  console.log(`Server running on port http://localhost:${PORT}`)
);
