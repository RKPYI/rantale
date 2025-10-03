import { apiClient } from '@/lib/api-client';
import { Novel, PaginatedResponse, Chapter } from '@/types/api';

export interface NovelFilters {
  search?: string;
  genre?: string[];
  status?: 'ongoing' | 'completed' | 'hiatus';
  sortBy?: 'title' | 'rating' | 'views' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export const novelService = {
  // Get novels with filtering and pagination
  async getNovels(filters?: NovelFilters): Promise<PaginatedResponse<Novel>> {
    const response = await apiClient.get<PaginatedResponse<Novel>>('/novels', filters);
    return response.data;
  },

  // Get featured/popular novels
  async getFeaturedNovels(limit: number = 10): Promise<Novel[]> {
    const response = await apiClient.get<Novel[]>('/novels/featured', { limit });
    return response.data;
  },

  // Get recently updated novels
  async getRecentlyUpdated(limit: number = 10): Promise<Novel[]> {
    const response = await apiClient.get<Novel[]>('/novels/recent', { limit });
    return response.data;
  },

  // Get novel by ID
  async getNovel(id: string): Promise<Novel> {
    const response = await apiClient.get<Novel>(`/novels/${id}`);
    return response.data;
  },

  // Get novel chapters
  async getNovelChapters(novelId: string, page?: number, limit?: number): Promise<PaginatedResponse<Chapter>> {
    const params = { page, limit };
    const response = await apiClient.get<PaginatedResponse<Chapter>>(`/novels/${novelId}/chapters`, params);
    return response.data;
  },

  // Get specific chapter
  async getChapter(novelId: string, chapterNumber: number): Promise<Chapter> {
    const response = await apiClient.get<Chapter>(`/novels/${novelId}/chapters/${chapterNumber}`);
    return response.data;
  },

  // Get chapter by ID
  async getChapterById(chapterId: string): Promise<Chapter> {
    const response = await apiClient.get<Chapter>(`/chapters/${chapterId}`);
    return response.data;
  },

  // Search novels
  async searchNovels(query: string, filters?: Omit<NovelFilters, 'search'>): Promise<PaginatedResponse<Novel>> {
    const params = { search: query, ...filters };
    const response = await apiClient.get<PaginatedResponse<Novel>>('/novels/search', params);
    return response.data;
  },

  // Get novels by genre
  async getNovelsByGenre(genre: string, page?: number, limit?: number): Promise<PaginatedResponse<Novel>> {
    const params = { page, limit };
    const response = await apiClient.get<PaginatedResponse<Novel>>(`/novels/genre/${genre}`, params);
    return response.data;
  },

  // Get available genres
  async getGenres(): Promise<string[]> {
    const response = await apiClient.get<string[]>('/novels/genres');
    return response.data;
  },

  // Rate a novel (if authenticated)
  async rateNovel(novelId: string, rating: number): Promise<void> {
    await apiClient.post(`/novels/${novelId}/rate`, { rating });
  },

  // Add novel to favorites/library
  async addToLibrary(novelId: string): Promise<void> {
    await apiClient.post(`/novels/${novelId}/library`);
  },

  // Remove from library
  async removeFromLibrary(novelId: string): Promise<void> {
    await apiClient.delete(`/novels/${novelId}/library`);
  },

  // Get user's library
  async getUserLibrary(page?: number, limit?: number): Promise<PaginatedResponse<Novel>> {
    const params = { page, limit };
    const response = await apiClient.get<PaginatedResponse<Novel>>('/user/library', params);
    return response.data;
  },
};