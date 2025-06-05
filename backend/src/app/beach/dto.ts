export interface PreferenceInput {
  preference_text: string;
}

export interface BeachRecommendation {
  placeId: string;
  score: number;
  name?: string;
  rating?: number;
}

export interface BeachDetail {
  placeId: string;
  name: string;
  description: string | null;
  rating: number;
  reviews: number; // This is the count of reviews from the 'beach' table
  sentimentSummary: {
    positive: number; // Percentage
    negative: number; // Percentage
    neutral: number; // Percentage
  };
  featured_image: string | null;
  address: string | null;
  review_keywords: string | null;
  link: string | null;
  coordinates: string | null;
}

// Internal type for service, good to keep co-located or in DTO if widely used
export type SelectedBeachDetailsForRecommendation = {
  place_Id: string;
  name: string;
  rating: number;
};

// Internal type for service, specific to query result structure
export type BeachQueryResult = {
  place_Id: string;
  name: string;
  description: string | null;
  reviews: number; // This is the count of reviews from the 'beach' table
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
