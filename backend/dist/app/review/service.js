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
exports.getBeachReviews = exports.analyzeAndSaveReview = void 0;
const client_1 = require("@prisma/client"); // Or import from your shared client: import { prisma } from '../../prisma/client';
const BadRequestError_1 = require("../../error/BadRequestError");
const axios_1 = __importDefault(require("axios"));
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://localhost:5001";
const prisma = new client_1.PrismaClient();
const analyzeAndSaveReview = (userId, placeId, rating, review_text) => __awaiter(void 0, void 0, void 0, function* () {
    // Consider using a more specific type for `review: any`
    const existingBeach = yield prisma.beach.findUnique({
        where: { place_Id: placeId },
    });
    if (!existingBeach) {
        throw new BadRequestError_1.BadRequestError(`Beach with ID ${placeId} not found.`);
    }
    let sentimentResult;
    try {
        const response = yield axios_1.default.post(`${ML_SERVICE_URL}/analyze-sentiment`, {
            review_text,
        });
        sentimentResult = response.data;
        if (!sentimentResult.sentiment ||
            typeof sentimentResult.confidence === "undefined") {
            throw new Error("Invalid response from ML service");
        }
    }
    catch (error) {
        console.error("Error calling ML sentiment service:", error.message || error);
        throw new BadRequestError_1.BadRequestError("Failed to analyze sentiment. ML service might be down or misconfigured.");
    }
    const newReview = yield prisma.reviews.create({
        data: {
            userId: userId,
            placeId: placeId,
            rating: rating,
            review_text: review_text,
            average_sentiment: sentimentResult.sentiment,
        },
    });
    // Transaction to update beach sentiment counts
    yield prisma.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        // Removed PrismaClient type for tx if using shared client directly
        const currentBeach = yield tx.beach.findUnique({
            where: { place_Id: placeId },
            select: {
                positiveSentimentCount: true,
                negativeSentimentCount: true,
                neutralSentimentCount: true,
                reviews: true,
            },
        });
        if (!currentBeach) {
            throw new BadRequestError_1.BadRequestError(`Beach with ID ${placeId} not found during sentiment update.`);
        }
        let updatedPositive = currentBeach.positiveSentimentCount;
        let updatedNegative = currentBeach.negativeSentimentCount;
        let updatedNeutral = currentBeach.neutralSentimentCount;
        let totalReviews = currentBeach.reviews; // This 'reviews' is the count of reviews on the beach table
        if (sentimentResult.sentiment.toLowerCase() === "positive") {
            updatedPositive++;
        }
        else if (sentimentResult.sentiment.toLowerCase() === "negative") {
            updatedNegative++;
        }
        else {
            updatedNeutral++;
        }
        totalReviews++; // Increment the review count on the beach table
        yield tx.beach.update({
            where: { place_Id: placeId },
            data: {
                positiveSentimentCount: updatedPositive,
                negativeSentimentCount: updatedNegative,
                neutralSentimentCount: updatedNeutral,
                reviews: totalReviews, // Update the review count
            },
        });
    }));
    return {
        sentiment: sentimentResult.sentiment,
        confidence: sentimentResult.confidence,
        review: newReview,
    };
});
exports.analyzeAndSaveReview = analyzeAndSaveReview;
const getBeachReviews = (placeId) => __awaiter(void 0, void 0, void 0, function* () {
    const reviews = yield prisma.reviews.findMany({
        where: { placeId: placeId },
        select: {
            id: true,
            userId: true, // Added userId
            review_text: true,
            rating: true,
            average_sentiment: true,
            createdAt: true,
            user: {
                select: {
                    id: true,
                    username: true,
                },
            },
        },
        orderBy: {
            createdAt: "desc",
        },
    });
    if (!reviews) {
        // reviews will be an empty array if none found, not null
        return [];
    }
    return reviews; // Assert type if confident in selection
});
exports.getBeachReviews = getBeachReviews;
//# sourceMappingURL=service.js.map