import { apiClient } from "@/lib/api-client";
import {
  EditorStatsResponse,
  EditorStats,
  EditorGroupInfoResponse,
  EditorGroupInfo,
  PendingChaptersResponse,
  PendingChapter,
  ClaimedChaptersResponse,
  ClaimedChapter,
  EditorChapterDetailResponse,
  ChapterDetail,
  ClaimChapterResponse,
  UnclaimChapterResponse,
  ApproveChapterResponse,
  RequestRevisionResponse,
  ReviewHistoryResponse,
  ReviewHistoryItem,
  PaginatedResponse,
} from "@/types/api";

export const editorService = {
  // Get editor dashboard stats
  async getStats(): Promise<EditorStats> {
    const response = await apiClient.get<EditorStatsResponse>("/editor/stats");
    return response.data.stats;
  },

  // Get editor's group info
  async getGroupInfo(): Promise<EditorGroupInfo | null> {
    const response =
      await apiClient.get<EditorGroupInfoResponse>("/editor/group");
    return response.data.group;
  },

  // Get pending chapters (paginated)
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

  // Get my claimed chapters
  async getClaimedChapters(): Promise<ClaimedChapter[]> {
    const response = await apiClient.get<ClaimedChaptersResponse>(
      "/editor/my-claimed-chapters",
    );
    return response.data.chapters;
  },

  // Claim a chapter for review
  async claimChapter(chapterId: number): Promise<ClaimChapterResponse> {
    const response = await apiClient.post<ClaimChapterResponse>(
      `/editor/chapters/${chapterId}/claim`,
    );
    return response.data;
  },

  // Release a claimed chapter
  async unclaimChapter(chapterId: number): Promise<UnclaimChapterResponse> {
    const response = await apiClient.post<UnclaimChapterResponse>(
      `/editor/chapters/${chapterId}/unclaim`,
    );
    return response.data;
  },

  // Get full chapter details for review (requires claiming first)
  async getChapterDetail(chapterId: number): Promise<ChapterDetail> {
    const response = await apiClient.get<EditorChapterDetailResponse>(
      `/editor/chapters/${chapterId}`,
    );
    return response.data.chapter;
  },

  // Approve a chapter
  async approveChapter(
    chapterId: number,
    notes?: string,
  ): Promise<ApproveChapterResponse> {
    const data: { notes?: string } = {};
    if (notes) data.notes = notes;

    const response = await apiClient.post<ApproveChapterResponse>(
      `/editor/chapters/${chapterId}/approve`,
      data,
    );
    return response.data;
  },

  // Request revision for a chapter
  async requestRevision(
    chapterId: number,
    notes: string,
  ): Promise<RequestRevisionResponse> {
    const response = await apiClient.post<RequestRevisionResponse>(
      `/editor/chapters/${chapterId}/request-revision`,
      { notes },
    );
    return response.data;
  },

  // Get review history (paginated)
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
};
