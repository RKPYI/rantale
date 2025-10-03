import { apiClient } from '@/lib/api-client';
import { ReadingProgress, PaginatedResponse } from '@/types/api';

export const readingService = {
  // Get user's reading progress for a novel
  async getReadingProgress(novelId: string): Promise<ReadingProgress | null> {
    try {
      const response = await apiClient.get<ReadingProgress>(`/reading-progress/${novelId}`);
      return response.data;
    } catch (error) {
      // Return null if no progress found (404)
      if (error && typeof error === 'object' && 'statusCode' in error && error.statusCode === 404) {
        return null;
      }
      throw error;
    }
  },

  // Update reading progress
  async updateProgress(
    novelId: string, 
    chapterId: string, 
    progress: number
  ): Promise<ReadingProgress> {
    const response = await apiClient.post<ReadingProgress>('/reading-progress', {
      novelId,
      chapterId,
      progress,
    });
    return response.data;
  },

  // Get all reading progress for the user
  async getAllReadingProgress(page?: number, limit?: number): Promise<PaginatedResponse<ReadingProgress>> {
    const params = { page, limit };
    const response = await apiClient.get<PaginatedResponse<ReadingProgress>>('/reading-progress', params);
    return response.data;
  },

  // Mark chapter as read
  async markChapterAsRead(novelId: string, chapterId: string): Promise<ReadingProgress> {
    return this.updateProgress(novelId, chapterId, 100);
  },

  // Get reading statistics
  async getReadingStats(): Promise<{
    totalNovelsRead: number;
    totalChaptersRead: number;
    totalReadingTime: number;
    favoriteGenres: string[];
  }> {
    const response = await apiClient.get<{
      totalNovelsRead: number;
      totalChaptersRead: number;
      totalReadingTime: number;
      favoriteGenres: string[];
    }>('/reading-progress/stats');
    return response.data;
  },

  // Delete reading progress (start over)
  async deleteProgress(novelId: string): Promise<void> {
    await apiClient.delete(`/reading-progress/${novelId}`);
  },
};