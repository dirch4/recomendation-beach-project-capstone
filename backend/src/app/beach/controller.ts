// ./app/beach/controller.ts
import express, { NextFunction, Response, Request } from "express";
import * as beachService from "./service";
import {
  PreferenceInputSchema,
  BeachSearchQuerySchema,
  NearbyBeachQuerySchema, // Ditambahkan
} from "./schema";
import { BadRequestError } from "../../error/BadRequestError"; // Sesuaikan path jika perlu

const router = express.Router();

// NO AUTHENTICATION NEEDED FOR THESE ROUTES

router.post(
  "/recommend",
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
        error.name === "ZodError" &&
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
  "/search",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
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
        limit = 10, // Default dari schema
        page = 1, // Default dari schema
      } = queryValidationResult.data;

      const beaches = await beachService.searchBeaches(
        searchQuery,
        limit,
        page
      );

      // Untuk search, totalCount dan totalPages idealnya dihitung di service
      // dengan query terpisah agar akurat, tapi untuk contoh ini kita pakai length dari hasil.
      // Untuk pagination yang benar, service.searchBeaches juga harus mengembalikan totalCount.
      const totalCountForSearch = beaches.length; // Ini bukan total item di DB, hanya yang di page ini.
      // Anda perlu query count terpisah untuk totalCount sebenarnya.

      res.json({
        message: "Beaches retrieved successfully",
        count: beaches.length,
        // totalCount: totalCountForSearch, // (Perlu implementasi total count di service)
        page: page,
        limit: limit,
        // totalPages: Math.ceil(totalCountForSearch / limit), // (Perlu implementasi total count di service)
        data: beaches,
      });
    } catch (error) {
      next(error);
    }
  }
);

// --- Route baru untuk mencari pantai terdekat ---
router.get(
  "/nearby", // Path: /beach/nearby?lat=-6.20&lng=106.81&radius=20&limit=5&page=1
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const queryValidationResult = NearbyBeachQuerySchema.safeParse(req.query);
      if (!queryValidationResult.success) {
        const firstError = queryValidationResult.error.issues[0];
        // Menggabungkan semua pesan error jika ada lebih dari satu
        const errorMessages = queryValidationResult.error.issues
          .map((issue) => `${issue.path.join(".")} - ${issue.message}`)
          .join(", ");
        throw new BadRequestError(
          `Invalid query parameter(s): ${errorMessages}`
        );
      }

      const {
        lat,
        lng,
        radius, // Default dari schema akan digunakan
        limit, // Default dari schema
        page, // Default dari schema
      } = queryValidationResult.data;

      const result = await beachService.findNearbyBeaches(
        lat,
        lng,
        radius,
        limit,
        page
      );

      res.json({
        message: `Nearby beaches within ${radius}km radius`,
        countOnPage: result.data.length,
        totalCount: result.totalCount,
        currentPage: result.currentPage,
        totalPages: result.totalPages,
        data: result.data,
      });
    } catch (error) {
      next(error);
    }
  }
);
// --- End Route Baru ---

router.get(
  "/:placeId",
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
