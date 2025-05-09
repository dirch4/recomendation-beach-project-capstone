import dontenv from "dotenv";
import express from "express";

dontenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.route("/").get((req, res) => {
  res.send("Hello world");
});

app.listen(PORT, () =>
  console.log(`Server running on port http://localhost:${PORT}`)
);
