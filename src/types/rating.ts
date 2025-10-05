/**
 * Rating System Types
 * Types related to novel ratings and reviews
 */

import type { PaginatedResponse } from "./common";
import type { User } from "./user";
import type { Novel } from "./novel";

// Rating Entity
export interface Rating {
  id: number;
  user_id: number;
  novel_id: number;
  rating: number; // 1-5
  review: string | null;
  created_at: string;
  updated_at: string;
  user: User;
  novel?: Novel;
}

// Rating Statistics
export interface RatingStats {
  average_rating: number;
  total_ratings: number;
  rating_breakdown: {
    "5": number;
    "4": number;
    "3": number;
    "2": number;
    "1": number;
  };
}

// API Responses
export interface RatingsResponse {
  ratings: PaginatedResponse<Rating>;
  stats: RatingStats;
}

export interface RatingResponse {
  message: string;
  rating: Rating;
  novel_stats: {
    average_rating: number;
    total_ratings: number;
  };
}

export interface DeleteRatingResponse {
  message: string;
  novel_stats: {
    average_rating: number;
    total_ratings: number;
  };
}

// Request Types
export interface CreateRatingRequest {
  novel_id: number;
  rating: number; // 1-5
  review?: string;
}

export interface UpdateRatingRequest {
  rating: number; // 1-5
  review?: string;
}
