"use client";

import { editorService } from "@/services/editor";
import {
  PaginatedResponse,
  PendingChapter,
  ReviewHistoryItem,
  EditorGroupInfo,
  EditorStats,
  ClaimedChapter,
} from "@/types/api";
import { useApi } from "./use-api";

// Hook for getting editor dashboard stats
export function useEditorStats() {
  return useApi<EditorStats>(() => editorService.getStats(), []);
}

// Hook for getting editor's group info
export function useEditorGroupInfo() {
  return useApi<EditorGroupInfo | null>(() => editorService.getGroupInfo(), []);
}

// Hook for getting pending chapters (paginated)
export function useEditorPendingChapters(page?: number) {
  return useApi<PaginatedResponse<PendingChapter>>(
    () => editorService.getPendingChapters(page),
    [page],
  );
}

// Hook for getting my claimed chapters
export function useEditorClaimedChapters() {
  return useApi<ClaimedChapter[]>(() => editorService.getClaimedChapters(), []);
}

// Hook for getting review history (paginated)
export function useEditorReviewHistory(page?: number) {
  return useApi<PaginatedResponse<ReviewHistoryItem>>(
    () => editorService.getReviewHistory(),
    [page],
  );
}
