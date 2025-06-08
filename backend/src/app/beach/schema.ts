// ./app/beach/schema.ts
import { z } from "zod";

export const PreferenceInputSchema = z.object({
  preference_text: z
    .string()
    .min(10, "Preference text should be descriptive (min 10 characters)"),
});

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

// Schema baru untuk query parameter nearby
export const NearbyBeachQuerySchema = z.object({
  lat: z.preprocess(
    (val) => (typeof val === "string" ? parseFloat(val) : val),
    z.number().min(-90, "Invalid latitude").max(90, "Invalid latitude")
  ),
  lng: z.preprocess(
    (val) => (typeof val === "string" ? parseFloat(val) : val),
    z.number().min(-180, "Invalid longitude").max(180, "Invalid longitude")
  ),
  radius: z.preprocess(
    // Radius dalam kilometer
    (val) => (typeof val === "string" ? parseInt(val, 10) : val),
    z
      .number()
      .int()
      .min(1, "Radius must be at least 1km")
      .optional()
      .default(10) // Default radius 10 km
  ),
  limit: z.preprocess(
    (val) => (typeof val === "string" ? parseInt(val, 10) : val),
    z.number().int().min(1).optional().default(10)
  ),
  page: z.preprocess(
    (val) => (typeof val === "string" ? parseInt(val, 10) : val),
    z.number().int().min(1).optional().default(1)
  ),
});
