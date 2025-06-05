"use strict";
// src/app/user/schema.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePasswordSchema = exports.updateUsernameSchema = exports.userSchema = void 0;
const zod_1 = require("zod");
exports.userSchema = zod_1.z
    .object({
    username: zod_1.z.string().min(3, "Username must be at least 3 characters long"),
    email: zod_1.z.string().email("Invalid email format"),
    password: zod_1.z.string().min(6, "Password must be at least 6 characters long"),
    confirmPassword: zod_1.z.string(),
})
    .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});
// Skema untuk pembaruan username
exports.updateUsernameSchema = zod_1.z.object({
    newUsername: zod_1.z
        .string()
        .min(3, "New username must be at least 3 characters long"),
});
// Skema untuk pembaruan password
exports.updatePasswordSchema = zod_1.z
    .object({
    oldPassword: zod_1.z.string().min(1, "Old password is required"),
    newPassword: zod_1.z
        .string()
        .min(6, "New password must be at least 6 characters long"),
    confirmNewPassword: zod_1.z.string(),
})
    .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "New passwords do not match",
    path: ["confirmNewPassword"],
});
//# sourceMappingURL=schema.js.map