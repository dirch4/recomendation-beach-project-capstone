import dontenv from "dotenv";
import express from "express";
import userController from "./app/user/controller";

dontenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

app.use("/user", userController);

app.listen(PORT, () =>
  console.log(`Server running on port http://localhost:${PORT}`)
);
