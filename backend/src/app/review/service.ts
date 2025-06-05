import { Prisma, PrismaClient } from "@prisma/client"; // Or import from your shared client: import { prisma } from '../../prisma/client';
import { BadRequestError } from "../../error/BadRequestError";
import axios from "axios";
import { SentimentResult, ReviewDetails } from "./dto"; // Adjusted DTO import

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://localhost:5001";

const prisma = new PrismaClient();

export const analyzeAndSaveReview = async (
  userId: string,
  placeId: string,
  rating: number,
  review_text: string
): Promise<{ sentiment: string; confidence: number; review: any }> => {
  // Consider using a more specific type for `review: any`
  const existingBeach = await prisma.beach.findUnique({
    where: { place_Id: placeId },
  });

  if (!existingBeach) {
    throw new BadRequestError(`Beach with ID ${placeId} not found.`);
  }

  let sentimentResult: SentimentResult;
  try {
    const response = await axios.post(`${ML_SERVICE_URL}/analyze-sentiment`, {
      review_text,
    });
    sentimentResult = response.data;
    if (
      !sentimentResult.sentiment ||
      typeof sentimentResult.confidence === "undefined"
    ) {
      throw new Error("Invalid response from ML service");
    }
  } catch (error: any) {
    console.error(
      "Error calling ML sentiment service:",
      error.message || error
    );
    throw new BadRequestError(
      "Failed to analyze sentiment. ML service might be down or misconfigured."
    );
  }

  const newReview = await prisma.reviews.create({
    data: {
      userId: userId,
      placeId: placeId,
      rating: rating,
      review_text: review_text,
      average_sentiment: sentimentResult.sentiment,
    },
  });

  // Transaction to update beach sentiment counts
  await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    // Removed PrismaClient type for tx if using shared client directly
    const currentBeach = await tx.beach.findUnique({
      where: { place_Id: placeId },
      select: {
        positiveSentimentCount: true,
        negativeSentimentCount: true,
        neutralSentimentCount: true,
        reviews: true,
      },
    });

    if (!currentBeach) {
      throw new BadRequestError(
        `Beach with ID ${placeId} not found during sentiment update.`
      );
    }

    let updatedPositive = currentBeach.positiveSentimentCount;
    let updatedNegative = currentBeach.negativeSentimentCount;
    let updatedNeutral = currentBeach.neutralSentimentCount;
    let totalReviews = currentBeach.reviews; // This 'reviews' is the count of reviews on the beach table

    if (sentimentResult.sentiment.toLowerCase() === "positive") {
      updatedPositive++;
    } else if (sentimentResult.sentiment.toLowerCase() === "negative") {
      updatedNegative++;
    } else {
      updatedNeutral++;
    }
    totalReviews++; // Increment the review count on the beach table

    await tx.beach.update({
      where: { place_Id: placeId },
      data: {
        positiveSentimentCount: updatedPositive,
        negativeSentimentCount: updatedNegative,
        neutralSentimentCount: updatedNeutral,
        reviews: totalReviews, // Update the review count
      },
    });
  });

  return {
    sentiment: sentimentResult.sentiment,
    confidence: sentimentResult.confidence,
    review: newReview,
  };
};

export const getBeachReviews = async (
  placeId: string
): Promise<ReviewDetails[]> => {
  const reviews = await prisma.reviews.findMany({
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

  return reviews as ReviewDetails[]; // Assert type if confident in selection
};
