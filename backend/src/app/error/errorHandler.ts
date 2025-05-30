import { Request, Response, NextFunction } from "express";
import { BadRequestError } from "../../error/BadRequestError";

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(err);

  if (err instanceof BadRequestError) {
    res.status(400).json({ message: err.message });
    return;
  }

  if (err.issues && Array.isArray(err.issues) && err.issues.length > 0) {
    res
      .status(400)
      .json({ message: `Validation Error: ${err.issues[0].message}` });
    return;
  }

  res.status(500).json({ message: "Internal Server Error" });
};
