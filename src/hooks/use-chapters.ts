"use client";

import { chapterService } from '@/services/chapters';
import { Chapter, ChapterSummary } from '@/types/api';
import { useApi } from './use-api';

// Hook for getting all chapters for a novel
export function useNovelChapters(novelSlug: string) {
  return useApi(
    () => chapterService.getNovelChapters(novelSlug),
    [novelSlug]
  );
}

// Hook for getting a chapter by novel slug and chapter number
export function useChapter(novelSlug: string, chapterNumber: number) {
  return useApi(
    () => chapterService.getChapter(novelSlug, chapterNumber),
    [novelSlug, chapterNumber]
  );
}

// Admin mutation hooks (require authentication and admin role)
export function useCreateChapter() {
  return useApi(
    () => Promise.resolve(null), // Default empty function, use refetch for actual calls
    []
  );
}

export function useUpdateChapter() {
  return useApi(
    () => Promise.resolve(null), // Default empty function, use refetch for actual calls
    []
  );
}

export function useDeleteChapter() {
  return useApi(
    () => Promise.resolve(null), // Default empty function, use refetch for actual calls
    []
  );
}