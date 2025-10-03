"use client";

import { novelService, NovelFilters } from '@/services/novels';
import { Novel, Chapter, PaginatedResponse } from '@/types/api';
import { useApi } from './use-api';

// Hook for getting novels with filters
export function useNovels(filters?: NovelFilters) {
  return useApi(
    () => novelService.getNovels(filters),
    [JSON.stringify(filters)]
  );
}

// Hook for getting a single novel
export function useNovel(novelId: string) {
  return useApi(
    () => novelService.getNovel(novelId),
    [novelId]
  );
}

// Hook for getting novel chapters
export function useNovelChapters(novelId: string, page?: number, limit?: number) {
  return useApi(
    () => novelService.getNovelChapters(novelId, page, limit),
    [novelId, page, limit]
  );
}

// Hook for getting a specific chapter
export function useChapter(novelId: string, chapterNumber: number) {
  return useApi(
    () => novelService.getChapter(novelId, chapterNumber),
    [novelId, chapterNumber]
  );
}

// Hook for getting featured novels
export function useFeaturedNovels(limit: number = 10) {
  return useApi(
    () => novelService.getFeaturedNovels(limit),
    [limit]
  );
}

// Hook for getting recently updated novels
export function useRecentlyUpdated(limit: number = 10) {
  return useApi(
    () => novelService.getRecentlyUpdated(limit),
    [limit]
  );
}

// Hook for searching novels
export function useSearchNovels(query: string, filters?: Omit<NovelFilters, 'search'>) {
  return useApi(
    () => query ? novelService.searchNovels(query, filters) : Promise.resolve({ success: true, data: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 0, hasNext: false, hasPrev: false } } as PaginatedResponse<Novel>),
    [query, JSON.stringify(filters)]
  );
}

// Hook for getting novels by genre
export function useNovelsByGenre(genre: string, page?: number, limit?: number) {
  return useApi(
    () => novelService.getNovelsByGenre(genre, page, limit),
    [genre, page, limit]
  );
}

// Hook for getting available genres
export function useGenres() {
  return useApi(
    () => novelService.getGenres(),
    []
  );
}

// Hook for getting user's library
export function useUserLibrary(page?: number, limit?: number) {
  return useApi(
    () => novelService.getUserLibrary(page, limit),
    [page, limit]
  );
}