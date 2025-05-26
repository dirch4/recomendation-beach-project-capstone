import { CustomError } from "./BaseCustomError";

export class UnauthorizedError extends CustomError {
  constructor(message: string) {
    super(message, 401);
  }
}
