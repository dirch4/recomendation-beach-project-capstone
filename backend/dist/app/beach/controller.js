"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const beachService = __importStar(require("./service"));
const schema_1 = require("./schema");
const BadRequestError_1 = require("../../error/BadRequestError");
const router = express_1.default.Router();
// NO AUTHENTICATION NEEDED FOR THESE ROUTES
router.post("/recommend", // Path: /api/beaches/recommend
(req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const validatedData = schema_1.PreferenceInputSchema.parse(req.body);
        const { preference_text } = validatedData;
        const recommendations = yield beachService.getBeachRecommendations(preference_text);
        res.json({
            message: "Beach recommendations based on your preference",
            recommendations,
        });
    }
    catch (error) {
        if (error.name === "ZodError" && // Check for ZodError specifically
            error.issues &&
            Array.isArray(error.issues) &&
            error.issues.length > 0) {
            return next(new BadRequestError_1.BadRequestError(`Validation Error: ${error.issues[0].message}`));
        }
        next(error);
    }
}));
router.get("/search", // Path: /api/beaches/search?search=keyword&limit=10&page=1
(req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Validate query parameters
        const queryValidationResult = schema_1.BeachSearchQuerySchema.safeParse(req.query);
        if (!queryValidationResult.success) {
            const firstError = queryValidationResult.error.issues[0];
            throw new BadRequestError_1.BadRequestError(`Invalid query parameter: ${firstError.path.join(".")} - ${firstError.message}`);
        }
        const { search: searchQuery, limit = 10, page = 1, } = queryValidationResult.data;
        const beaches = yield beachService.searchBeaches(searchQuery, limit, page);
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
    }
    catch (error) {
        next(error);
    }
}));
router.get("/:placeId", // Path: /api/beaches/:placeId
(req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { placeId } = req.params;
        if (!placeId) {
            throw new BadRequestError_1.BadRequestError("Place ID is required.");
        }
        const beachDetails = yield beachService.getBeachDetails(placeId);
        if (!beachDetails) {
            res.status(404).json({ message: "Beach not found" });
            return;
        }
        res.json(beachDetails);
    }
    catch (error) {
        next(error);
    }
}));
exports.default = router;
//# sourceMappingURL=controller.js.map