"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateJWT = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// Mengambil SECRET_KEY dari environment variables. Penting untuk tidak menggunakan fallback di produksi!
const SECRET_KEY = process.env.JWT_SECRET;
// Pastikan SECRET_KEY telah diatur
if (!SECRET_KEY) {
    console.error("FATAL ERROR: JWT_SECRET is not defined in environment variables.");
    process.exit(1);
}
const authenticateJWT = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res
            .status(401)
            .json({ error: "Unauthorized: No token provided or malformed header" });
        return;
    }
    const token = authHeader.split(" ")[1];
    try {
        const decoded = jsonwebtoken_1.default.verify(token, SECRET_KEY);
        req.user = { id: decoded.id };
        next();
    }
    catch (error) {
        console.error("JWT verification error:", error.message);
        if (error.name === "TokenExpiredError") {
            res.status(401).json({ error: "Unauthorized: Token expired" });
            return;
        }
        if (error.name === "JsonWebTokenError") {
            res.status(401).json({ error: "Unauthorized: Invalid token" });
            return;
        }
        res
            .status(401)
            .json({ error: "Unauthorized: Failed to authenticate token" });
        return;
    }
});
exports.authenticateJWT = authenticateJWT;
//# sourceMappingURL=auth.js.map