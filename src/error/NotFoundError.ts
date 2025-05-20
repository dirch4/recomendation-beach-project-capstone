import { CustomError } from "./BaseCustomError";

export class NotFoundError extends CustomError {
  constructor(message: string) {
    super(message, 404);
  }
}
