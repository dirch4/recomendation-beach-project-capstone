// ./app/beach/service.ts
import { PrismaClient } from "@prisma/client";
import { BadRequestError } from "../../error/BadRequestError"; // Sesuaikan path jika perlu
import axios from "axios";
import {
  BeachRecommendation,
  BeachDetail,
  SelectedBeachDetailsForRecommendation,
  BeachQueryResult,
  NearbyBeachDetail, // Ditambahkan
} from "./dto";

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://localhost:5001";
const prisma = new PrismaClient();

// --- Helper function to calculate distance (Haversine formula) ---
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return parseFloat(distance.toFixed(2)); // Jarak dalam kilometer dengan 2 desimal
}
// --- End Helper Function ---

const calculatePercentage = (count: number, total: number) => {
  return total > 0 ? parseFloat(((count / total) * 100).toFixed(2)) : 0;
};

export const getBeachRecommendations = async (
  preferenceText: string
): Promise<BeachRecommendation[]> => {
  let recommendations: BeachRecommendation[] = [];
  try {
    const response = await axios.post(`${ML_SERVICE_URL}/recommend-beach`, {
      preference_text: preferenceText,
    });

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
      return [];
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
  keyword: string | undefined,
  limit: number,
  page: number
): Promise<BeachDetail[]> => {
  const skip = (page - 1) * limit;
  const whereClause: any = {};
  if (keyword && keyword.trim() !== "") {
    whereClause.OR = [
      { name: { contains: keyword, mode: "insensitive" } },
      { description: { contains: keyword, mode: "insensitive" } },
    ];
  }

  const beaches: BeachQueryResult[] = await prisma.beach.findMany({
    where: whereClause,
    take: limit,
    skip: skip,
    orderBy: { rating: "desc" },
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
  });
};

export const getBeachDetails = async (
  placeId: string
): Promise<BeachDetail | null> => {
  const beach: BeachQueryResult | null = await prisma.beach.findUnique({
    where: { place_Id: placeId },
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

  if (!beach) {
    return null;
  }

  const totalSentimentCount =
    beach.positiveSentimentCount +
    beach.negativeSentimentCount +
    beach.neutralSentimentCount;
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

// --- Fungsi baru untuk mencari pantai terdekat ---
export const findNearbyBeaches = async (
  userLat: number,
  userLng: number,
  radiusKm: number,
  limit: number,
  page: number
): Promise<{
  data: NearbyBeachDetail[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
}> => {
  const allBeaches: BeachQueryResult[] = await prisma.beach.findMany({
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

  if (!allBeaches || allBeaches.length === 0) {
    return { data: [], totalCount: 0, currentPage: page, totalPages: 0 };
  }

  const nearbyBeachesWithDistance: NearbyBeachDetail[] = [];

  for (const beach of allBeaches) {
    if (beach.coordinates) {
      try {
        const [beachLatStr, beachLngStr] = beach.coordinates.split(",");
        const beachLat = parseFloat(beachLatStr);
        const beachLng = parseFloat(beachLngStr);

        if (isNaN(beachLat) || isNaN(beachLng)) {
          console.warn(
            `Invalid coordinates for beach ${beach.name} (${beach.place_Id}): ${beach.coordinates}. Skipping.`
          );
          continue;
        }

        const distance = calculateDistance(
          userLat,
          userLng,
          beachLat,
          beachLng
        );

        if (distance <= radiusKm) {
          const totalSentimentCount =
            beach.positiveSentimentCount +
            beach.negativeSentimentCount +
            beach.neutralSentimentCount;

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

          nearbyBeachesWithDistance.push({
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
            distance: distance, // Jarak sudah di-parseFloat(toFixed(2)) di calculateDistance
          });
        }
      } catch (error) {
        console.error(
          `Error processing coordinates for beach ${beach.name} (${beach.place_Id}): ${beach.coordinates}. Error: ${error}. Skipping.`
        );
        continue;
      }
    } else {
      console.warn(
        `Beach ${beach.name} (${beach.place_Id}) has no coordinates. Skipping.`
      );
    }
  }

  nearbyBeachesWithDistance.sort((a, b) => a.distance - b.distance);

  const totalCount = nearbyBeachesWithDistance.length;
  const totalPages = Math.ceil(totalCount / limit);
  const skip = (page - 1) * limit;
  const paginatedBeaches = nearbyBeachesWithDistance.slice(skip, skip + limit);

  return {
    data: paginatedBeaches,
    totalCount,
    currentPage: page,
    totalPages,
  };
};
