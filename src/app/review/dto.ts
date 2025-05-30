export interface ReviewInput {
  placeId: string;
  rating: number;
  review_text: string;
}

export interface PreferenceInput {
  preference_text: string;
}

export interface SentimentResult {
  sentiment: string; // "Positive", "Negative", "Neutral"
  confidence: number;
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
  reviews: number;
  sentimentSummary: {
    positive: number;
    negative: number;
    neutral: number;
  };
  featured_image: string | null;
  address: string | null;
  review_keywords: string | null;
  link: string | null;
  coordinates: string | null;
}
