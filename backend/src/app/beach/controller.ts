import express, { NextFunction, Response, Request } from "express";
import * as beachService from "./service";
import { PreferenceInputSchema, BeachSearchQuerySchema } from "./schema";
import { BadRequestError } from "../../error/BadRequestError";

const router = express.Router();

// NO AUTHENTICATION NEEDED FOR THESE ROUTES

router.post(
  "/recommend", // Path: /api/beaches/recommend
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = PreferenceInputSchema.parse(req.body);
      const { preference_text } = validatedData;

      const recommendations = await beachService.getBeachRecommendations(
        preference_text
      );

      res.json({
        message: "Beach recommendations based on your preference",
        recommendations,
      });
    } catch (error: any) {
      if (
        error.name === "ZodError" && // Check for ZodError specifically
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
  "/search", // Path: /api/beaches/search?search=keyword&limit=10&page=1
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate query parameters
      const queryValidationResult = BeachSearchQuerySchema.safeParse(req.query);
      if (!queryValidationResult.success) {
        const firstError = queryValidationResult.error.issues[0];
        throw new BadRequestError(
          `Invalid query parameter: ${firstError.path.join(".")} - ${
            firstError.message
          }`
        );
      }
      const {
        search: searchQuery,
        limit = 10,
        page = 1,
      } = queryValidationResult.data;

      const beaches = await beachService.searchBeaches(
        searchQuery,
        limit,
        page
      );

      const response = {
        message: "Beaches retrieved successfully",
        count: beaches.length, // Current page count
        // You might want to add totalCount if pagination requires it
        page: page,
        limit: limit,
        data: beaches,
      };

      // If you want to provide total count for pagination, you'd need another query
      // const totalCount = await prisma.beach.count({ where: whereClause }); // Similar whereClause as in service
      // response.totalCount = totalCount;
      // response.totalPages = Math.ceil(totalCount / limit);

      res.json(response);
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  "/:placeId", // Path: /api/beaches/:placeId
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { placeId } = req.params;
      if (!placeId) {
        throw new BadRequestError("Place ID is required.");
      }
      const beachDetails = await beachService.getBeachDetails(placeId);

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

export default router;
