import { apiClient } from "@/lib/api-client";
import {
  EditorStatsResponse,
  EditorStats,
  PendingChaptersResponse,
  ChapterForReview,
  ChapterForReviewResponse,
  ApproveChapterRequest,
  ApproveChapterResponse,
  RequestRevisionRequest,
  RequestRevisionResponse,
  ReviewHistoryResponse,
  PaginatedResponse,
  ReviewHistoryItem,
  PendingChapter,
  ClaimedChapter,
  ClaimedChaptersResponse,
  ClaimChapterResponse,
  UnclaimChapterResponse,
} from "@/types/api";

export const editorService = {
  // Get editor statistics
  async getStats(): Promise<EditorStats> {
    const response = await apiClient.get<EditorStatsResponse>("/editor/stats");
    return response.data.stats;
  },

  // Get pending chapters for review
  async getPendingChapters(
    page?: number,
    perPage?: number,
  ): Promise<PaginatedResponse<PendingChapter>> {
    const params: Record<string, number> = {};
    if (page) params.page = page;
    if (perPage) params.per_page = perPage;

    const response = await apiClient.get<PendingChaptersResponse>(
      "/editor/pending-chapters",
      params,
    );
    return response.data.chapters;
  },

  // Get chapter details for review
  async getChapterForReview(chapterId: number): Promise<ChapterForReview> {
    const response = await apiClient.get<ChapterForReviewResponse>(
      `/editor/chapters/${chapterId}`,
    );
    return response.data.chapter;
  },

  // Approve a chapter
  async approveChapter(
    chapterId: number,
    data?: ApproveChapterRequest,
  ): Promise<ApproveChapterResponse> {
    const response = await apiClient.post<ApproveChapterResponse>(
      `/editor/chapters/${chapterId}/approve`,
      data || {},
    );
    return response.data;
  },

  // Request revision for a chapter
  async requestRevision(
    chapterId: number,
    data: RequestRevisionRequest,
  ): Promise<RequestRevisionResponse> {
    const response = await apiClient.post<RequestRevisionResponse>(
      `/editor/chapters/${chapterId}/request-revision`,
      data,
    );
    return response.data;
  },

  // Get review history
  async getReviewHistory(
    perPage?: number,
  ): Promise<PaginatedResponse<ReviewHistoryItem>> {
    const params: Record<string, number> = {};
    if (perPage) params.per_page = perPage;

    const response = await apiClient.get<ReviewHistoryResponse>(
      "/editor/review-history",
      params,
    );
    return response.data.reviews;
  },

  // Claim a chapter for review
  async claimChapter(chapterId: number): Promise<ClaimChapterResponse> {
    const response = await apiClient.post<ClaimChapterResponse>(
      `/editor/chapters/${chapterId}/claim`,
      {},
    );
    return response.data;
  },

  // Release a claimed chapter
  async unclaimChapter(chapterId: number): Promise<UnclaimChapterResponse> {
    const response = await apiClient.post<UnclaimChapterResponse>(
      `/editor/chapters/${chapterId}/unclaim`,
      {},
    );
    return response.data;
  },

  // Get chapters claimed by the current editor
  async getMyClaimedChapters(): Promise<ClaimedChapter[]> {
    const response = await apiClient.get<ClaimedChaptersResponse>(
      "/editor/my-claimed-chapters",
    );
    return response.data.chapters;
  },
};
