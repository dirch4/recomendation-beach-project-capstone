import { CustomError } from "./BaseCustomError";

export class BadRequestError extends CustomError {
  constructor(message: string) {
    super(message, 400);
  }
}
