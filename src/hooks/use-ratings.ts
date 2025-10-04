"use client";

import { ratingService } from "@/services/ratings";
import {
  Rating,
  RatingsResponse,
  CreateRatingRequest,
  PaginatedResponse,
} from "@/types/api";
import { useApi } from "./use-api";

// Hook for getting novel ratings
export function useNovelRatings(novelSlug: string, page?: number) {
  return useApi(
    () => ratingService.getNovelRatings(novelSlug, page),
    [novelSlug, page],
  );
}

// Hook for creating or updating a rating (use refetch to call)
export function useCreateOrUpdateRating() {
  return useApi(
    () => Promise.resolve(null), // Use refetch with ratingService.createOrUpdateRating
    [],
  );
}

// Hook for getting user's rating for a novel
export function useUserRatingForNovel(novelSlug: string) {
  return useApi(
    () => ratingService.getUserRatingForNovel(novelSlug),
    [novelSlug],
  );
}

// Hook for deleting a rating (use refetch to call)
export function useDeleteRating() {
  return useApi(
    () => Promise.resolve(null), // Use refetch with ratingService.deleteRating
    [],
  );
}

// Hook for getting all user's ratings
export function useUserRatings(page?: number) {
  return useApi(() => ratingService.getUserRatings(page), [page]);
}
