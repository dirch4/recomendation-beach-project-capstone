export interface ReviewInput {
  placeId: string;
  rating: number;
  review_text: string;
}

export interface SentimentResult {
  sentiment: string; // "Positive", "Negative", "Neutral"
  confidence: number;
}

// You might want to define the shape of a returned review object explicitly
export interface ReviewDetails {
  id: string;
  userId: string;
  placeId: string;
  rating: number;
  review_text: string;
  average_sentiment: string;
  createdAt: Date;
  user: {
    id: string;
    username: string | null; // Assuming username can be null
  };
}
