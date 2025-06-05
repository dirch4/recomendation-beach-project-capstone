"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BeachSearchQuerySchema = exports.PreferenceInputSchema = void 0;
const zod_1 = require("zod");
exports.PreferenceInputSchema = zod_1.z.object({
    preference_text: zod_1.z
        .string()
        .min(10, "Preference text should be descriptive (min 10 characters)"),
});
// Schema for search query parameters (optional but good for validation)
exports.BeachSearchQuerySchema = zod_1.z.object({
    search: zod_1.z.string().optional(),
    limit: zod_1.z.preprocess((val) => (typeof val === "string" ? parseInt(val, 10) : val), zod_1.z.number().int().min(1).optional()),
    page: zod_1.z.preprocess((val) => (typeof val === "string" ? parseInt(val, 10) : val), zod_1.z.number().int().min(1).optional()),
});
//# sourceMappingURL=schema.js.map