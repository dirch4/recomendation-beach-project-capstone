import { CustomError } from "./BaseCustomError";

export class ConflictError extends CustomError {
  constructor(message: string) {
    super(message, 409);
  }
}
