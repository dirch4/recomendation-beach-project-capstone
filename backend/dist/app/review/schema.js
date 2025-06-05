"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewInputSchema = void 0;
const zod_1 = require("zod");
exports.ReviewInputSchema = zod_1.z.object({
    placeId: zod_1.z.string().min(1, "Place ID is required"),
    rating: zod_1.z.number().min(1).max(5, "Rating must be between 1 and 5"),
    review_text: zod_1.z.string().min(1, "Review text cannot be empty"),
});
//# sourceMappingURL=schema.js.map