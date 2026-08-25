"use client";

import { libraryService } from "@/services/library";
import {
  LibraryEntry,
  LibraryResponse,
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

// Alias for consistency with component expectations.
// Pass filter "favorites" to request favorites=true; "all"/undefined for everything.
export function useLibrary(filter?: string, page = 1) {
  const isFavorites = filter === "favorites";
  const status =
    !filter || filter === "all" || isFavorites ? undefined : filter;

  return useApi<LibraryResponse>(
    () =>
      libraryService.getUserLibrary(
        page,
        status,
        isFavorites ? true : undefined,
      ),
    [filter, page],
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
