"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BadRequestError = void 0;
const BaseCustomError_1 = require("./BaseCustomError");
class BadRequestError extends BaseCustomError_1.CustomError {
    constructor(message) {
        super(message, 400);
    }
}
exports.BadRequestError = BadRequestError;
//# sourceMappingURL=BadRequestError.js.map