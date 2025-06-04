import { z } from "zod";

export const ReviewInputSchema = z.object({
  placeId: z.string().min(1, "Place ID is required"),
  rating: z.number().min(1).max(5, "Rating must be between 1 and 5"),
  review_text: z.string().min(1, "Review text cannot be empty"),
});
