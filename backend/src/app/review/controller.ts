import express, { NextFunction, Response, Request } from "express";
import * as reviewService from "./service";
import { ReviewInputSchema } from "./schema";
import { BadRequestError } from "../../error/BadRequestError";
import { authenticateJWT } from "../../middleware/auth";

const router = express.Router();

// Middleware to check for user authentication (example)
// You'll need to have this `req.user` populated by an actual authentication middleware (e.g., Passport.js, JWT verification)
// that runs before this router or specifically on this route.
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
  };
}

router.post(
  "/",
  authenticateJWT, // Assuming base path like /api/reviews/ is handled in app.ts
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      console.log("req.user:", req.user);
      if (!req.user || !req.user.id) {
        // This check is crucial for this route
        throw new BadRequestError("User not authenticated.");
      }

      console.log("RECEIVED BODY", req.body);

      const validatedData = ReviewInputSchema.parse(req.body);
      const { placeId, rating, review_text } = validatedData;

      const result = await reviewService.analyzeAndSaveReview(
        req.user.id,
        placeId,
        rating,
        review_text
      );

      res.status(201).json({
        message: "Review analyzed and saved successfully",
        sentiment: result.sentiment,
        confidence: result.confidence,
        review: result.review,
      });
    } catch (error: any) {
      if (
        error.name === "ZodError" && // Check for ZodError specifically
        error.issues &&
        Array.isArray(error.issues) &&
        error.issues.length > 0
      ) {
        console.error("🔥 Zod validation failed with issues:", error.issues);
        return next(
          new BadRequestError(`Validation Error: ${error.issues[0].message}`)
        );
      }
      next(error);
    }
  }
);

router.get(
  "/:placeId", // Path relative to the mounted router, e.g., /api/reviews/:placeId
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { placeId } = req.params;
      const beachReviews = await reviewService.getBeachReviews(placeId);

      res.json({
        placeId,
        reviews: beachReviews,
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
