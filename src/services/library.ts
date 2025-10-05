import { apiClient } from "@/lib/api-client";
import {
  LibraryEntry,
  LibraryResponse,
  LibraryStatusResponse,
  AddToLibraryRequest,
  UpdateLibraryEntryRequest,
  MessageResponse,
} from "@/types/api";

export const libraryService = {
  // Get user's library
  async getUserLibrary(
    page?: number,
    status?: string,
    favorites?: boolean,
  ): Promise<LibraryResponse> {
    const params: Record<string, string | number | boolean> = {};
    if (page) params.page = page;
    if (status && status !== "all") params.status = status;
    if (favorites !== undefined) params.favorites = favorites;

    const response = await apiClient.get<LibraryResponse>("/library", params);
    return response.data;
  },

  // Add novel to library
  async addToLibrary(data: AddToLibraryRequest): Promise<LibraryEntry> {
    const response = await apiClient.post<{
      message: string;
      library_entry: LibraryEntry;
    }>("/library", data);
    return response.data.library_entry;
  },

  // Update library entry
  async updateLibraryEntry(
    libraryId: number,
    data: UpdateLibraryEntryRequest,
  ): Promise<LibraryEntry> {
    const response = await apiClient.put<{
      message: string;
      library_entry: LibraryEntry;
    }>(`/library/${libraryId}`, data);
    return response.data.library_entry;
  },

  // Remove from library
  async removeFromLibrary(libraryId: number): Promise<void> {
    await apiClient.delete(`/library/${libraryId}`);
  },

  // Check novel status in library
  async getNovelStatusInLibrary(
    novelSlug: string,
  ): Promise<LibraryStatusResponse> {
    const response = await apiClient.get<LibraryStatusResponse>(
      `/library/novel/${novelSlug}/status`,
    );
    return response.data;
  },

  // Toggle favorite status
  async toggleFavorite(novelSlug: string): Promise<LibraryEntry> {
    const response = await apiClient.post<{
      message: string;
      is_favorite: boolean;
      library_entry: LibraryEntry;
    }>(`/library/novel/${novelSlug}/toggle-favorite`);
    return response.data.library_entry;
  },

  // Get available statuses
  async getAvailableStatuses(): Promise<
    Array<{ value: string; label: string }>
  > {
    const response = await apiClient.get<{
      statuses: Array<{ value: string; label: string }>;
    }>("/library/statuses");
    return response.data.statuses;
  },
};
