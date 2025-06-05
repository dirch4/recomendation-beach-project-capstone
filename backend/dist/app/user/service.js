"use strict";
// src/app/user/service.ts
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
exports.updatePassword = exports.updateUsername = exports.loginUser = exports.registerUser = void 0;
exports.getUserById = getUserById;
const client_1 = require("@prisma/client");
const BadRequestError_1 = require("../../error/BadRequestError");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jwt_1 = require("../../utils/jwt");
const prisma = new client_1.PrismaClient();
const registerUser = (username, email, password, confirmPassword) => __awaiter(void 0, void 0, void 0, function* () {
    if (password !== confirmPassword) {
        throw new BadRequestError_1.BadRequestError("Passwords do not match");
    }
    const existingUser = yield prisma.user.findUnique({
        where: { email },
    });
    if (existingUser) {
        throw new BadRequestError_1.BadRequestError("User with this email already exists");
    }
    const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
    const newUser = yield prisma.user.create({
        data: {
            username,
            email,
            password: hashedPassword,
        },
    });
    const token = (0, jwt_1.generateToken)({
        id: newUser.id,
        email: newUser.email,
        name: newUser.username,
    });
    return {
        user: {
            id: newUser.id,
            username: newUser.username,
            email: newUser.email,
            token,
        },
    };
});
exports.registerUser = registerUser;
const loginUser = (email, password) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield prisma.user.findUnique({ where: { email } });
    if (!user)
        throw new BadRequestError_1.BadRequestError("Invalid credentials: User not found");
    const isPasswordValid = yield bcryptjs_1.default.compare(password, user.password);
    if (!isPasswordValid)
        throw new BadRequestError_1.BadRequestError("Invalid password");
    const token = (0, jwt_1.generateToken)({
        id: user.id,
        email: user.email,
        name: user.username,
    });
    return {
        token,
        user: {
            id: user.id,
            username: user.username,
            email: user.email,
        },
    };
});
exports.loginUser = loginUser;
// Fungsi baru: Update Username
const updateUsername = (userId, data) => __awaiter(void 0, void 0, void 0, function* () {
    const { newUsername } = data;
    // Pastikan username baru belum digunakan oleh user lain
    const existingUserWithNewUsername = yield prisma.user.findUnique({
        where: { username: newUsername },
    });
    if (existingUserWithNewUsername &&
        existingUserWithNewUsername.id !== userId) {
        throw new BadRequestError_1.BadRequestError("Username already taken by another user.");
    }
    const updatedUser = yield prisma.user.update({
        where: { id: userId },
        data: { username: newUsername },
        select: { id: true, username: true, email: true }, // Pilih field yang ingin dikembalikan
    });
    return updatedUser;
});
exports.updateUsername = updateUsername;
// Fungsi baru: Update Password
const updatePassword = (userId, data) => __awaiter(void 0, void 0, void 0, function* () {
    const { oldPassword, newPassword, confirmNewPassword } = data;
    if (newPassword !== confirmNewPassword) {
        throw new BadRequestError_1.BadRequestError("New password and confirmation do not match.");
    }
    const user = yield prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
        throw new BadRequestError_1.BadRequestError("User not found."); // Seharusnya tidak terjadi karena authenticated
    }
    const isOldPasswordValid = yield bcryptjs_1.default.compare(oldPassword, user.password);
    if (!isOldPasswordValid) {
        throw new BadRequestError_1.BadRequestError("Old password is incorrect.");
    }
    const hashedNewPassword = yield bcryptjs_1.default.hash(newPassword, 10);
    const updatedUser = yield prisma.user.update({
        where: { id: userId },
        data: { password: hashedNewPassword },
        select: { id: true, username: true, email: true }, // Pilih field yang ingin dikembalikan
    });
    return updatedUser;
});
exports.updatePassword = updatePassword;
function getUserById(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, username: true, email: true },
        });
    });
}
//# sourceMappingURL=service.js.map