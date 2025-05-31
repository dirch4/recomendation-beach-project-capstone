import { z } from "zod";

export const ReviewInputSchema = z.object({
  placeId: z.string().min(1, "Place ID is required"),
  rating: z.number().min(1).max(5, "Rating must be between 1 and 5"),
  review_text: z.string().min(1, "Review text cannot be empty"),
});

export const PreferenceInputSchema = z.object({
  preference_text: z
    .string()
    .min(10, "Preference text should be descriptive (min 10 characters)"),
});
