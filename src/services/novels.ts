import { apiClient } from '@/lib/api-client';
import { 
  Novel, 
  NovelWithChapters,
  PaginatedResponse, 
  Chapter,
  Genre,
  NovelApiResponse,
  SearchApiResponse,
  GenresApiResponse,
  NovelListParams,
  NovelSearchParams,
  CreateNovelRequest,
  UpdateNovelRequest
} from '@/types/api';

export const novelService = {
  // Get novels with filtering and pagination
  async getNovels(params?: NovelListParams): Promise<PaginatedResponse<Novel>> {
    const response = await apiClient.get<NovelApiResponse>('/novels', params);
    return response.data.novels as PaginatedResponse<Novel>;
  },

  // Search novels
  async searchNovels(query: string): Promise<Novel[]> {
    const params: NovelSearchParams = { q: query };
    const response = await apiClient.get<SearchApiResponse>('/novels/search', params);
    return response.data.novels;
  },

  // Get popular novels
  async getPopularNovels(): Promise<Novel[]> {
    const response = await apiClient.get<{ message: string; novels: Novel[] }>('/novels/popular');
    return response.data.novels;
  },

  // Get latest novels
  async getLatestNovels(): Promise<Novel[]> {
    const response = await apiClient.get<{ message: string; novels: Novel[] }>('/novels/latest');
    return response.data.novels;
  },

  // Get recommended novels
  async getRecommendedNovels(): Promise<Novel[]> {
    const response = await apiClient.get<{ message: string; novels: Novel[] }>('/novels/recommendations');
    return response.data.novels;
  },

  // Get novel by slug
  async getNovelBySlug(slug: string): Promise<NovelWithChapters> {
    const response = await apiClient.get<{ message: string; novel: NovelWithChapters }>(`/novels/${slug}`);
    return response.data.novel;
  },

  // Get available genres
  async getGenres(): Promise<Genre[]> {
    const response = await apiClient.get<GenresApiResponse>('/novels/genres');
    return response.data.genres;
  },

  // Admin-only operations (require authentication and admin role)
  async createNovel(data: CreateNovelRequest): Promise<Novel> {
    const response = await apiClient.post<{ message: string; novel: Novel }>('/novels', data);
    return response.data.novel;
  },

  async updateNovel(slug: string, data: UpdateNovelRequest): Promise<Novel> {
    const response = await apiClient.put<{ message: string; novel: Novel }>(`/novels/${slug}`, data);
    return response.data.novel;
  },

  async deleteNovel(slug: string): Promise<void> {
    await apiClient.delete(`/novels/${slug}`);
  },

  // Helper methods for filtering
  async getNovelsByGenre(genreSlug: string, params?: Omit<NovelListParams, 'genre'>): Promise<PaginatedResponse<Novel>> {
    const fullParams = { ...params, genre: genreSlug };
    return this.getNovels(fullParams);
  },

  async getNovelsByStatus(status: 'ongoing' | 'completed' | 'hiatus', params?: Omit<NovelListParams, 'status'>): Promise<PaginatedResponse<Novel>> {
    const fullParams = { ...params, status };
    return this.getNovels(fullParams);
  },

  // Get novels sorted by specific criteria
  async getNovelsSortedBy(sortBy: 'popular' | 'rating' | 'latest' | 'updated', params?: Omit<NovelListParams, 'sort_by'>): Promise<PaginatedResponse<Novel>> {
    const fullParams = { ...params, sort_by: sortBy };
    return this.getNovels(fullParams);
  },

  // Note: Library functionality (addToLibrary, removeFromLibrary, getUserLibrary) 
  // not yet implemented in the backend API
};