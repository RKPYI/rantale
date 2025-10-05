import { apiClient } from "@/lib/api-client";
import {
  ReadingProgressResponse,
  UpdateReadingProgressRequest,
  CreateReadingProgressRequest,
  ReadingProgressCreateResponse,
  ReadingProgressUpdateResponse,
  UserReadingProgressResponse,
  MessageResponse,
} from "@/types/api";

export const readingProgressService = {
  // Get reading progress for a specific novel (requires authentication)
  async getNovelProgress(novelSlug: string): Promise<ReadingProgressResponse> {
    const response = await apiClient.get<ReadingProgressResponse>(
      `/reading-progress/${novelSlug}`,
    );
    return response.data;
  },

  // Update reading progress (requires authentication)
  async updateProgress(
    data: UpdateReadingProgressRequest,
  ): Promise<ReadingProgressResponse> {
    const response = await apiClient.put<ReadingProgressUpdateResponse>(
      "/reading-progress",
      data,
    );
    return response.data.progress;
  },

  // Create initial reading progress (requires authentication)
  async createInitialProgress(
    data: CreateReadingProgressRequest,
  ): Promise<ReadingProgressResponse> {
    const response = await apiClient.post<ReadingProgressCreateResponse>(
      "/reading-progress",
      data,
    );
    return response.data.progress;
  },

  // Get all reading progress for the current user (requires authentication)
  async getUserReadingProgress(): Promise<UserReadingProgressResponse> {
    const response = await apiClient.get<UserReadingProgressResponse>(
      "/reading-progress/user",
    );
    return response.data;
  },

  // Delete reading progress for a novel (requires authentication)
  async deleteProgress(novelSlug: string): Promise<string> {
    const response = await apiClient.delete<MessageResponse>(
      `/reading-progress/${novelSlug}`,
    );
    return response.data.message;
  },

  // Helper method to start reading a novel (creates initial progress)
  async startReading(novelSlug: string): Promise<ReadingProgressResponse> {
    try {
      return await this.createInitialProgress({ novel_slug: novelSlug });
    } catch (error: unknown) {
      // If progress already exists (409 conflict), get existing progress
      if (
        error &&
        typeof error === "object" &&
        "status" in error &&
        error.status === 409 &&
        "data" in error &&
        error.data &&
        typeof error.data === "object" &&
        "progress" in error.data
      ) {
        return (error.data as { progress: ReadingProgressResponse }).progress;
      }
      throw error;
    }
  },

  // Helper method to continue reading (update to next chapter)
  async continueReading(
    novelSlug: string,
    chapterNumber: number,
  ): Promise<ReadingProgressResponse> {
    return this.updateProgress({
      novel_slug: novelSlug,
      chapter_number: chapterNumber,
    });
  },
};
