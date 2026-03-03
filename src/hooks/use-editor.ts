"use client";

import { editorService } from "@/services/editor";
import {
  EditorStats,
  PaginatedResponse,
  PendingChapter,
  ChapterForReview,
  ReviewHistoryItem,
  ClaimedChapter,
} from "@/types/api";
import { useApi } from "./use-api";

// Hook for getting editor statistics
export function useEditorStats() {
  return useApi<EditorStats>(() => editorService.getStats(), []);
}

// Hook for getting pending chapters
export function useEditorPendingChapters(page?: number, perPage?: number) {
  return useApi<PaginatedResponse<PendingChapter>>(
    () => editorService.getPendingChapters(page, perPage),
    [page, perPage],
  );
}

// Hook for getting chapter details for review
export function useEditorChapterForReview(chapterId: number | null) {
  return useApi<ChapterForReview | null>(
    () =>
      chapterId
        ? editorService.getChapterForReview(chapterId)
        : Promise.resolve(null),
    [chapterId],
  );
}

// Hook for getting review history
export function useEditorReviewHistory(perPage?: number) {
  return useApi<PaginatedResponse<ReviewHistoryItem>>(
    () => editorService.getReviewHistory(perPage),
    [perPage],
  );
}

// Hook for getting chapters claimed by the current editor
export function useEditorMyClaimedChapters() {
  return useApi<ClaimedChapter[]>(
    () => editorService.getMyClaimedChapters(),
    [],
  );
}
