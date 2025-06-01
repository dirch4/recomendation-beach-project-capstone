import { z } from "zod";

export const PreferenceInputSchema = z.object({
  preference_text: z
    .string()
    .min(10, "Preference text should be descriptive (min 10 characters)"),
});

// Schema for search query parameters (optional but good for validation)
export const BeachSearchQuerySchema = z.object({
  search: z.string().optional(),
  limit: z.preprocess(
    (val) => (typeof val === "string" ? parseInt(val, 10) : val),
    z.number().int().min(1).optional()
  ),
  page: z.preprocess(
    (val) => (typeof val === "string" ? parseInt(val, 10) : val),
    z.number().int().min(1).optional()
  ),
});
