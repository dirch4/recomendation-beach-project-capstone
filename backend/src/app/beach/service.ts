import { PrismaClient } from "@prisma/client"; // Or import { prisma } from '../../prisma/client';
import { BadRequestError } from "../../error/BadRequestError";
import axios from "axios";
import {
  BeachRecommendation,
  BeachDetail,
  SelectedBeachDetailsForRecommendation,
  BeachQueryResult,
} from "./dto"; // Adjusted DTO import

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://localhost:5001";
const prisma = new PrismaClient();

export const getBeachRecommendations = async (
  preferenceText: string
): Promise<BeachRecommendation[]> => {
  let recommendations: BeachRecommendation[] = [];
  try {
    const response = await axios.post(`${ML_SERVICE_URL}/recommend-beach`, {
      preference_text: preferenceText,
    });

    // Ensure the response structure is as expected
    if (!response.data || !Array.isArray(response.data.recommendations)) {
      console.error(
        "Invalid recommendations format from ML service:",
        response.data
      );
      throw new Error(
        "Invalid recommendations format from ML service. Expected an object with a 'recommendations' array."
      );
    }
    const mlRecommendations: { placeId: string; score: number }[] =
      response.data.recommendations;

    const recommendedPlaceIds = mlRecommendations.map((rec) => rec.placeId);
    if (recommendedPlaceIds.length === 0) {
      return []; // No recommendations, no need to query DB
    }

    const beachesDetails = await prisma.beach.findMany({
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
        const beachDetail = beachesDetails.find(
          (b: SelectedBeachDetailsForRecommendation) =>
            b.place_Id === mlRec.placeId
        );
        return {
          placeId: mlRec.placeId,
          score: mlRec.score,
          name: beachDetail?.name,
          rating: beachDetail?.rating,
        };
      })
      .sort((a, b) => b.score - a.score);
  } catch (error: any) {
    console.error(
      "Error calling ML recommendation service or processing results:",
      error.response?.data || error.message || error
    );
    // Check if it's an Axios error to provide more specific feedback
    if (axios.isAxiosError(error)) {
      throw new BadRequestError(
        `Failed to get recommendations. ML service communication error: ${error.message}`
      );
    }
    throw new BadRequestError(
      `Failed to get recommendations. ML service might be down, misconfigured, or returned unexpected data. Original error: ${error.message}`
    );
  }

  return recommendations;
};

export const searchBeaches = async (
  keyword: string | undefined, // Allow keyword to be undefined
  limit: number,
  page: number
): Promise<BeachDetail[]> => {
  const skip = (page - 1) * limit;

  const whereClause: any = {}; // Prisma.BeachWhereInput
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

  const beaches: BeachQueryResult[] = await prisma.beach.findMany({
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

  return beaches.map((beach: BeachQueryResult): BeachDetail => {
    const totalSentimentCount =
      beach.positiveSentimentCount +
      beach.negativeSentimentCount +
      beach.neutralSentimentCount;

    const calculatePercentage = (count: number, total: number) => {
      return total > 0 ? parseFloat(((count / total) * 100).toFixed(2)) : 0;
    };

    const sentimentSummary = {
      positive: calculatePercentage(
        beach.positiveSentimentCount,
        totalSentimentCount
      ),
      negative: calculatePercentage(
        beach.negativeSentimentCount,
        totalSentimentCount
      ),
      neutral: calculatePercentage(
        beach.neutralSentimentCount,
        totalSentimentCount
      ),
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
};

export const getBeachDetails = async (
  placeId: string
): Promise<BeachDetail | null> => {
  const beach: BeachQueryResult | null = await prisma.beach.findUnique({
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

  const totalSentimentCount =
    beach.positiveSentimentCount +
    beach.negativeSentimentCount +
    beach.neutralSentimentCount;

  const calculatePercentage = (count: number, total: number) => {
    return total > 0 ? parseFloat(((count / total) * 100).toFixed(2)) : 0;
  };

  const sentimentSummary = {
    positive: calculatePercentage(
      beach.positiveSentimentCount,
      totalSentimentCount
    ),
    negative: calculatePercentage(
      beach.negativeSentimentCount,
      totalSentimentCount
    ),
    neutral: calculatePercentage(
      beach.neutralSentimentCount,
      totalSentimentCount
    ),
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
};
