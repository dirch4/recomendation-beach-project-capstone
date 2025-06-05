"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ForbiddenError = void 0;
const BaseCustomError_1 = require("./BaseCustomError");
class ForbiddenError extends BaseCustomError_1.CustomError {
    constructor(message) {
        super(message, 403);
    }
}
exports.ForbiddenError = ForbiddenError;
//# sourceMappingURL=ForbidenError.js.map