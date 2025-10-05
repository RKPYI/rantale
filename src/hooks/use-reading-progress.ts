"use client";

import { readingProgressService } from "@/services/reading-progress";
import {
  ReadingProgressResponse,
  UpdateReadingProgressRequest,
  CreateReadingProgressRequest,
  UserReadingProgressResponse,
} from "@/types/api";
import { useApi } from "./use-api";

// Hook for getting reading progress for a novel
export function useNovelProgress(novelSlug: string) {
  return useApi(
    () => readingProgressService.getNovelProgress(novelSlug),
    [novelSlug],
  );
}

// Hook for updating reading progress (use refetch to call)
export function useUpdateProgress() {
  return useApi(
    () => Promise.resolve(null), // Use refetch with readingProgressService.updateProgress
    [],
  );
}

// Hook for creating initial reading progress (use refetch to call)
export function useCreateInitialProgress() {
  return useApi(
    () => Promise.resolve(null), // Use refetch with readingProgressService.createInitialProgress
    [],
  );
}

// Hook for getting all user's reading progress
export function useUserReadingProgress() {
  return useApi(() => readingProgressService.getUserReadingProgress(), []);
}

// Hook for deleting reading progress (use refetch to call)
export function useDeleteProgress() {
  return useApi(
    () => Promise.resolve(null), // Use refetch with readingProgressService.deleteProgress
    [],
  );
}

// Hook for starting to read a novel (use refetch to call)
export function useStartReading() {
  return useApi(
    () => Promise.resolve(null), // Use refetch with readingProgressService.startReading
    [],
  );
}

// Hook for continuing reading (use refetch to call)
export function useContinueReading() {
  return useApi(
    () => Promise.resolve(null), // Use refetch with readingProgressService.continueReading
    [],
  );
}
