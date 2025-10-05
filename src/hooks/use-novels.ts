"use client";

import { novelService } from "@/services/novels";
import {
  Novel,
  NovelWithChapters,
  PaginatedResponse,
  Genre,
  NovelListParams,
} from "@/types/api";
import { useApi } from "./use-api";

// Hook for getting novels with filters
export function useNovels(params?: NovelListParams) {
  return useApi(() => novelService.getNovels(params), [JSON.stringify(params)]);
}

// Hook for getting a single novel by slug
export function useNovel(slug: string) {
  return useApi(() => novelService.getNovelBySlug(slug), [slug]);
}

// Hook for searching novels
export function useSearchNovels(query: string) {
  return useApi(
    () =>
      query && query.length >= 3
        ? novelService.searchNovels(query)
        : Promise.resolve([]),
    [query],
  );
}

// Hook for getting popular novels
export function usePopularNovels() {
  return useApi(() => novelService.getPopularNovels(), []);
}

// Hook for getting latest novels
export function useLatestNovels() {
  return useApi(() => novelService.getLatestNovels(), []);
}

// Hook for getting recommended novels
export function useRecommendedNovels() {
  return useApi(() => novelService.getRecommendedNovels(), []);
}

// Hook for getting novels by genre
export function useNovelsByGenre(
  genreSlug: string,
  params?: Omit<NovelListParams, "genre">,
) {
  return useApi(
    () => novelService.getNovelsByGenre(genreSlug, params),
    [genreSlug, JSON.stringify(params)],
  );
}

// Hook for getting novels by status
export function useNovelsByStatus(
  status: "ongoing" | "completed" | "hiatus",
  params?: Omit<NovelListParams, "status">,
) {
  return useApi(
    () => novelService.getNovelsByStatus(status, params),
    [status, JSON.stringify(params)],
  );
}

// Hook for getting novels sorted by specific criteria
export function useNovelsSortedBy(
  sortBy: "popular" | "rating" | "latest" | "updated",
  params?: Omit<NovelListParams, "sort_by">,
) {
  return useApi(
    () => novelService.getNovelsSortedBy(sortBy, params),
    [sortBy, JSON.stringify(params)],
  );
}

// Hook for getting available genres
export function useGenres() {
  return useApi(() => novelService.getGenres(), []);
}

// Admin mutation hooks (require authentication and admin role)
// These return the useApi structure but are meant to be called manually via refetch
export function useCreateNovel() {
  return useApi(
    () => Promise.resolve(null), // Default empty function, use refetch for actual calls
    [],
  );
}

export function useUpdateNovel() {
  return useApi(
    () => Promise.resolve(null), // Default empty function, use refetch for actual calls
    [],
  );
}

export function useDeleteNovel() {
  return useApi(
    () => Promise.resolve(null), // Default empty function, use refetch for actual calls
    [],
  );
}
