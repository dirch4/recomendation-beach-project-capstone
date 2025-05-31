import { PrismaClient } from "@prisma/client";
import { BadRequestError } from "../../error/BadRequestError";
import axios from "axios";

import { SentimentResult, BeachRecommendation, BeachDetail } from "./dto";

type SelectedBeachDetails = {
  place_Id: string;
  name: string;
  rating: number;
};

type BeachQueryResult = {
  place_Id: string;
  name: string;
  description: string | null;
  reviews: number;
  rating: number;
  featured_image: string | null;
  address: string | null;
  review_keywords: string | null;
  link: string | null;
  coordinates: string | null;
  positiveSentimentCount: number;
  negativeSentimentCount: number;
  neutralSentimentCount: number;
};

const prisma = new PrismaClient();

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://localhost:5001";

export const analyzeAndSaveReview = async (
  userId: string,
  placeId: string,
  rating: number,
  review_text: string
): Promise<{ sentiment: string; confidence: number; review: any }> => {
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

  await prisma.$transaction(async (tx: PrismaClient) => {
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
    let totalReviews = currentBeach.reviews;

    if (sentimentResult.sentiment.toLowerCase() === "positive") {
      updatedPositive++;
    } else if (sentimentResult.sentiment.toLowerCase() === "negative") {
      updatedNegative++;
    } else {
      updatedNeutral++;
    }
    totalReviews++;

    await tx.beach.update({
      where: { place_Id: placeId },
      data: {
        positiveSentimentCount: updatedPositive,
        negativeSentimentCount: updatedNegative,
        neutralSentimentCount: updatedNeutral,
        reviews: totalReviews,
      },
    });
  });

  return {
    sentiment: sentimentResult.sentiment,
    confidence: sentimentResult.confidence,
    review: newReview,
  };
};

export const getBeachRecommendations = async (
  preferenceText: string
): Promise<BeachRecommendation[]> => {
  let recommendations: BeachRecommendation[] = [];
  try {
    const response = await axios.post(`${ML_SERVICE_URL}/recommend-beach`, {
      preference_text: preferenceText,
    });
    const mlRecommendations: { placeId: string; score: number }[] =
      response.data.recommendations;

    if (!Array.isArray(mlRecommendations)) {
      throw new Error("Invalid recommendations format from ML service");
    }

    const recommendedPlaceIds = mlRecommendations.map((rec) => rec.placeId);
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
          (b: SelectedBeachDetails) => b.place_Id === mlRec.placeId
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
      "Error calling ML recommendation service:",
      error.message || error
    );
    throw new BadRequestError(
      "Failed to get recommendations. ML service might be down or misconfigured."
    );
  }

  return recommendations;
};

export const searchBeaches = async (
  keyword: string,
  limit: number,
  page: number
): Promise<BeachDetail[]> => {
  const skip = (page - 1) * limit;

  const whereClause: any = {};
  if (keyword) {
    whereClause.OR = [
      {
        name: {
          contains: keyword,
          mode: "insensitive", // Untuk pencarian case-insensitive
        },
      },
      {
        description: {
          contains: keyword,
          mode: "insensitive",
        },
      },
      // Anda bisa menambahkan kolom lain untuk pencarian, misalnya review_keywords
      // {
      //   review_keywords: {
      //     contains: keyword,
      //     mode: 'insensitive'
      //   }
      // }
    ];
  }

  const beaches = await prisma.beach.findMany({
    where: whereClause,
    take: limit,
    skip: skip,
    orderBy: {
      rating: "desc", // Urutkan berdasarkan rating secara default
    },
    select: {
      // Pilih kolom yang ingin Anda tampilkan
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

  return beaches.map((beach: BeachQueryResult) => {
    const totalSentimentCount =
      beach.positiveSentimentCount +
      beach.negativeSentimentCount +
      beach.neutralSentimentCount;
    const sentimentSummary = {
      positive:
        totalSentimentCount > 0
          ? parseFloat(
              (
                (beach.positiveSentimentCount / totalSentimentCount) *
                100
              ).toFixed(2)
            )
          : 0,
      negative:
        totalSentimentCount > 0
          ? parseFloat(
              (
                (beach.negativeSentimentCount / totalSentimentCount) *
                100
              ).toFixed(2)
            )
          : 0,
      neutral:
        totalSentimentCount > 0
          ? parseFloat(
              (
                (beach.neutralSentimentCount / totalSentimentCount) *
                100
              ).toFixed(2)
            )
          : 0,
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
};

export const getBeachDetails = async (
  placeId: string
): Promise<BeachDetail | null> => {
  const beach = await prisma.beach.findUnique({
    where: { place_Id: placeId },
  });

  if (!beach) {
    return null;
  }

  const totalSentimentCount =
    beach.positiveSentimentCount +
    beach.negativeSentimentCount +
    beach.neutralSentimentCount;
  const sentimentSummary = {
    positive:
      totalSentimentCount > 0
        ? parseFloat(
            (
              (beach.positiveSentimentCount / totalSentimentCount) *
              100
            ).toFixed(2)
          )
        : 0,
    negative:
      totalSentimentCount > 0
        ? parseFloat(
            (
              (beach.negativeSentimentCount / totalSentimentCount) *
              100
            ).toFixed(2)
          )
        : 0,
    neutral:
      totalSentimentCount > 0
        ? parseFloat(
            ((beach.neutralSentimentCount / totalSentimentCount) * 100).toFixed(
              2
            )
          )
        : 0,
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

export const getBeachReviews = async (placeId: string): Promise<any[]> => {
  const reviews = await prisma.reviews.findMany({
    where: { placeId: placeId },
    select: {
      id: true,
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

  if (!reviews || reviews.length === 0) {
    return [];
  }

  return reviews;
};
