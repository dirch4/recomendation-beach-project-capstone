"use strict";
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
exports.getBeachDetails = exports.searchBeaches = exports.getBeachRecommendations = void 0;
const client_1 = require("@prisma/client"); // Or import { prisma } from '../../prisma/client';
const BadRequestError_1 = require("../../error/BadRequestError");
const axios_1 = __importDefault(require("axios"));
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://localhost:5001";
const prisma = new client_1.PrismaClient();
const getBeachRecommendations = (preferenceText) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    let recommendations = [];
    try {
        const response = yield axios_1.default.post(`${ML_SERVICE_URL}/recommend-beach`, {
            preference_text: preferenceText,
        });
        // Ensure the response structure is as expected
        if (!response.data || !Array.isArray(response.data.recommendations)) {
            console.error("Invalid recommendations format from ML service:", response.data);
            throw new Error("Invalid recommendations format from ML service. Expected an object with a 'recommendations' array.");
        }
        const mlRecommendations = response.data.recommendations;
        const recommendedPlaceIds = mlRecommendations.map((rec) => rec.placeId);
        if (recommendedPlaceIds.length === 0) {
            return []; // No recommendations, no need to query DB
        }
        const beachesDetails = yield prisma.beach.findMany({
            where: {
                place_Id: {
                    in: recommendedPlaceIds,
                },
            },
            select: {
                place_Id: true,
                name: true,
                rating: true,
            },
        });
        recommendations = mlRecommendations
            .map((mlRec) => {
            const beachDetail = beachesDetails.find((b) => b.place_Id === mlRec.placeId);
            return {
                placeId: mlRec.placeId,
                score: mlRec.score,
                name: beachDetail === null || beachDetail === void 0 ? void 0 : beachDetail.name,
                rating: beachDetail === null || beachDetail === void 0 ? void 0 : beachDetail.rating,
            };
        })
            .sort((a, b) => b.score - a.score);
    }
    catch (error) {
        console.error("Error calling ML recommendation service or processing results:", ((_a = error.response) === null || _a === void 0 ? void 0 : _a.data) || error.message || error);
        // Check if it's an Axios error to provide more specific feedback
        if (axios_1.default.isAxiosError(error)) {
            throw new BadRequestError_1.BadRequestError(`Failed to get recommendations. ML service communication error: ${error.message}`);
        }
        throw new BadRequestError_1.BadRequestError(`Failed to get recommendations. ML service might be down, misconfigured, or returned unexpected data. Original error: ${error.message}`);
    }
    return recommendations;
});
exports.getBeachRecommendations = getBeachRecommendations;
const searchBeaches = (keyword, // Allow keyword to be undefined
limit, page) => __awaiter(void 0, void 0, void 0, function* () {
    const skip = (page - 1) * limit;
    const whereClause = {}; // Prisma.BeachWhereInput
    if (keyword && keyword.trim() !== "") {
        whereClause.OR = [
            {
                name: {
                    contains: keyword,
                    mode: "insensitive",
                },
            },
            {
                description: {
                    contains: keyword,
                    mode: "insensitive",
                },
            },
            // {
            //   address: { // Example: also search by address
            //     contains: keyword,
            //     mode: "insensitive",
            //   }
            // }
        ];
    }
    const beaches = yield prisma.beach.findMany({
        where: whereClause,
        take: limit,
        skip: skip,
        orderBy: {
            rating: "desc", // Default sort
        },
        select: {
            place_Id: true,
            name: true,
            description: true,
            reviews: true,
            rating: true,
            featured_image: true,
            address: true,
            review_keywords: true,
            link: true,
            coordinates: true,
            positiveSentimentCount: true,
            negativeSentimentCount: true,
            neutralSentimentCount: true,
        },
    });
    return beaches.map((beach) => {
        const totalSentimentCount = beach.positiveSentimentCount +
            beach.negativeSentimentCount +
            beach.neutralSentimentCount;
        const calculatePercentage = (count, total) => {
            return total > 0 ? parseFloat(((count / total) * 100).toFixed(2)) : 0;
        };
        const sentimentSummary = {
            positive: calculatePercentage(beach.positiveSentimentCount, totalSentimentCount),
            negative: calculatePercentage(beach.negativeSentimentCount, totalSentimentCount),
            neutral: calculatePercentage(beach.neutralSentimentCount, totalSentimentCount),
        };
        return {
            placeId: beach.place_Id,
            name: beach.name,
            description: beach.description,
            rating: beach.rating,
            reviews: beach.reviews, // This is the total review count from the beach table
            sentimentSummary: sentimentSummary,
            featured_image: beach.featured_image,
            address: beach.address,
            review_keywords: beach.review_keywords,
            link: beach.link,
            coordinates: beach.coordinates,
        };
    });
});
exports.searchBeaches = searchBeaches;
const getBeachDetails = (placeId) => __awaiter(void 0, void 0, void 0, function* () {
    const beach = yield prisma.beach.findUnique({
        where: { place_Id: placeId },
        select: {
            // Ensure all fields for BeachQueryResult are selected
            place_Id: true,
            name: true,
            description: true,
            reviews: true,
            rating: true,
            featured_image: true,
            address: true,
            review_keywords: true,
            link: true,
            coordinates: true,
            positiveSentimentCount: true,
            negativeSentimentCount: true,
            neutralSentimentCount: true,
        },
    });
    if (!beach) {
        return null;
    }
    const totalSentimentCount = beach.positiveSentimentCount +
        beach.negativeSentimentCount +
        beach.neutralSentimentCount;
    const calculatePercentage = (count, total) => {
        return total > 0 ? parseFloat(((count / total) * 100).toFixed(2)) : 0;
    };
    const sentimentSummary = {
        positive: calculatePercentage(beach.positiveSentimentCount, totalSentimentCount),
        negative: calculatePercentage(beach.negativeSentimentCount, totalSentimentCount),
        neutral: calculatePercentage(beach.neutralSentimentCount, totalSentimentCount),
    };
    return {
        placeId: beach.place_Id,
        name: beach.name,
        description: beach.description,
        rating: beach.rating,
        reviews: beach.reviews,
        sentimentSummary: sentimentSummary,
        featured_image: beach.featured_image,
        address: beach.address,
        review_keywords: beach.review_keywords,
        link: beach.link,
        coordinates: beach.coordinates,
    };
});
exports.getBeachDetails = getBeachDetails;
//# sourceMappingURL=service.js.map