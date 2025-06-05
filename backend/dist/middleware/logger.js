"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const moment_timezone_1 = __importDefault(require("moment-timezone"));
// Middleware untuk logging request
const logger = (req, res, next) => {
    const indonesiaTime = (0, moment_timezone_1.default)()
        .tz("Asia/Jakarta")
        .format("YYYY-MM-DD HH:mm:ss");
    console.log(`[${indonesiaTime}] ${req.method} ${req.url}`);
    next();
};
exports.logger = logger;
//# sourceMappingURL=logger.js.map