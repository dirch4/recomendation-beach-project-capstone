"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConflictError = void 0;
const BaseCustomError_1 = require("./BaseCustomError");
class ConflictError extends BaseCustomError_1.CustomError {
    constructor(message) {
        super(message, 409);
    }
}
exports.ConflictError = ConflictError;
//# sourceMappingURL=ConflictError.js.map