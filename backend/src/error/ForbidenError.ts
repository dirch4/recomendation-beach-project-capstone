import { CustomError } from "./BaseCustomError";

export class ForbiddenError extends CustomError {
  constructor(message: string) {
    super(message, 403);
  }
}
