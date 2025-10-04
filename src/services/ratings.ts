import { apiClient } from "@/lib/api-client";
import {
  Rating,
  RatingsResponse,
  CreateRatingRequest,
  UpdateRatingRequest,
  RatingResponse,
  DeleteRatingResponse,
  PaginatedResponse,
} from "@/types/api";

export const ratingService = {
  // Get ratings for a novel
  async getNovelRatings(
    novelSlug: string,
    page?: number,
  ): Promise<RatingsResponse> {
    const params = page ? { page } : {};
    const response = await apiClient.get<RatingsResponse>(
      `/novels/${novelSlug}/ratings`,
      params,
    );
    return response.data;
  },

  // Create or update a rating (requires authentication)
  async createOrUpdateRating(
    data: CreateRatingRequest,
  ): Promise<{
    rating: Rating;
    isNew: boolean;
    novelStats: { average_rating: number; total_ratings: number };
  }> {
    const response = await apiClient.post<RatingResponse>("/ratings", data);
    const isNew = response.data.message.includes("created");
    return {
      rating: response.data.rating,
      isNew,
      novelStats: response.data.novel_stats,
    };
  },

  // Get user's rating for a novel (requires authentication)
  async getUserRatingForNovel(novelSlug: string): Promise<Rating | null> {
    const response = await apiClient.get<{ rating: Rating | null }>(
      `/novels/${novelSlug}/my-rating`,
    );
    return response.data.rating;
  },

  // Delete a rating (requires authentication and ownership or admin)
  async deleteRating(
    ratingId: number,
  ): Promise<{
    message: string;
    novelStats: { average_rating: number; total_ratings: number };
  }> {
    const response = await apiClient.delete<DeleteRatingResponse>(
      `/ratings/${ratingId}`,
    );
    return {
      message: response.data.message,
      novelStats: response.data.novel_stats,
    };
  },

  // Get all ratings by the current user (requires authentication)
  async getUserRatings(
    page?: number,
  ): Promise<
    PaginatedResponse<
      Rating & {
        novel: {
          id: number;
          title: string;
          author: string;
          cover_image: string | null;
          slug: string;
        };
      }
    >
  > {
    const params = page ? { page } : {};
    const response = await apiClient.get<
      PaginatedResponse<
        Rating & {
          novel: {
            id: number;
            title: string;
            author: string;
            cover_image: string | null;
            slug: string;
          };
        }
      >
    >("/my-ratings", params);
    return response.data;
  },
};
