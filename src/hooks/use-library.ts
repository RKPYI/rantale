"use client";

import { libraryService } from "@/services/library";
import {
  LibraryEntry,
  LibraryResponse,
  LibraryStatusResponse,
  AddToLibraryRequest,
  UpdateLibraryEntryRequest,
} from "@/types/api";
import { useApi, useAsync } from "./use-api";

// Hook for getting user's library
export function useUserLibrary(
  page?: number,
  status?: string,
  favorites?: boolean,
) {
  return useApi(
    () => libraryService.getUserLibrary(page, status, favorites),
    [page, status, favorites],
  );
}

// Alias for consistency with component expectations
export function useLibrary(status?: string) {
  return useApi<LibraryResponse>(
    () => libraryService.getUserLibrary(1, status),
    [status],
  );
}

// Hook for checking novel status in library
export function useNovelLibraryStatus(novelSlug: string) {
  return useApi(
    () => libraryService.getNovelStatusInLibrary(novelSlug),
    [novelSlug],
  );
}

// Hook for getting available library statuses
export function useLibraryStatuses() {
  return useApi(() => libraryService.getAvailableStatuses(), []);
}

// Hook for adding to library (use refetch to call)
export function useAddToLibrary() {
  return useApi(
    () => Promise.resolve(null), // Use refetch with libraryService.addToLibrary
    [],
  );
}

// Hook for updating library entry (use refetch to call)
export function useUpdateLibraryEntry() {
  return useApi(
    () => Promise.resolve(null), // Use refetch with libraryService.updateLibraryEntry
    [],
  );
}

// Hook for updating library status with async execution
export function useUpdateLibraryStatus() {
  return useAsync<LibraryEntry>();
}

// Hook for removing from library (use refetch to call)
export function useRemoveFromLibrary() {
  return useAsync<void>();
}

// Hook for toggling favorite (use refetch to call)
export function useToggleFavorite() {
  return useAsync<LibraryEntry>();
}
