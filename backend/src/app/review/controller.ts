import express, { NextFunction, Response, Request } from "express";
import * as reviewService from "./service";
import { ReviewInputSchema, PreferenceInputSchema } from "./schema";
import { BadRequestError } from "../../error/BadRequestError";

const router = express.Router();

router.post(
  "/analyze-review",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user || !req.user.id) {
        throw new BadRequestError("User not authenticated.");
      }

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
        error.issues &&
        Array.isArray(error.issues) &&
        error.issues.length > 0
      ) {
        return next(
          new BadRequestError(`Validation Error: ${error.issues[0].message}`)
        );
      }
      next(error);
    }
  }
);

router.post(
  "/recommend-beach",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = PreferenceInputSchema.parse(req.body);
      const { preference_text } = validatedData;

      const recommendations = await reviewService.getBeachRecommendations(
        preference_text
      );

      res.json({
        message: "Beach recommendations based on your preference",
        recommendations,
      });
    } catch (error: any) {
      if (
        error.issues &&
        Array.isArray(error.issues) &&
        error.issues.length > 0
      ) {
        return next(
          new BadRequestError(`Validation Error: ${error.issues[0].message}`)
        );
      }
      next(error);
    }
  }
);

router.get(
  "/beach/:placeId",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { placeId } = req.params;
      const beachDetails = await reviewService.getBeachDetails(placeId);

      if (!beachDetails) {
        res.status(404).json({ message: "Beach not found" });
        return;
      }

      res.json(beachDetails);
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  "/review/:placeId",
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
