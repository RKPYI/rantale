import { apiClient } from "@/lib/api-client";
import {
  AuthorApplication,
  AuthorApplicationRequest,
  AuthorApplicationResponse,
  AuthorApplicationsResponse,
  AuthorApplicationStatusResponse,
  AuthorNovelsResponse,
  AuthorStats,
  AuthorNovel,
  AuthorChaptersResponse,
  AuthorChapterWithStatus,
  SubmitForReviewResponse,
} from "@/types/api";

export const authorService = {
  // Submit author application
  async submitApplication(
    data: AuthorApplicationRequest,
  ): Promise<AuthorApplication> {
    const response = await apiClient.post<AuthorApplicationResponse>(
      "/author/apply",
      data,
    );
    return response.data.application;
  },

  // Get current user's application status
  async getApplicationStatus(): Promise<AuthorApplicationStatusResponse> {
    const response = await apiClient.get<AuthorApplicationStatusResponse>(
      "/author/application-status",
    );
    return response.data;
  },

  // Admin: Get all applications
  async getAllApplications(
    page?: number,
    status?: string,
  ): Promise<AuthorApplicationsResponse> {
    const params: Record<string, string | number> = {};
    if (page) params.page = page;
    if (status && status !== "all") params.status = status;

    const response = await apiClient.get<AuthorApplicationsResponse>(
      "/admin/author-applications",
      params,
    );
    return response.data;
  },

  // Admin: Get single application
  async getApplication(applicationId: number): Promise<AuthorApplication> {
    const response = await apiClient.get<{ application: AuthorApplication }>(
      `/admin/author-applications/${applicationId}`,
    );
    return response.data.application;
  },

  // Admin: Approve application
  async approveApplication(
    applicationId: number,
    adminNotes?: string,
  ): Promise<AuthorApplication> {
    const data = adminNotes ? { admin_notes: adminNotes } : {};
    const response = await apiClient.post<AuthorApplicationResponse>(
      `/admin/author-applications/${applicationId}/approve`,
      data,
    );
    return response.data.application;
  },

  // Admin: Reject application
  async rejectApplication(
    applicationId: number,
    adminNotes: string,
  ): Promise<AuthorApplication> {
    const response = await apiClient.post<AuthorApplicationResponse>(
      `/admin/author-applications/${applicationId}/reject`,
      {
        admin_notes: adminNotes,
      },
    );
    return response.data.application;
  },

  // Update application notes (for admins)
  async updateApplicationNotes(
    applicationId: number,
    adminNotes: string,
  ): Promise<AuthorApplication> {
    const response = await apiClient.put(
      `/author/applications/${applicationId}/notes`,
      {
        admin_notes: adminNotes,
      },
    );
    return response.data as AuthorApplication;
  },

  // Get author's novels
  async getNovels(): Promise<AuthorNovel[]> {
    const response =
      await apiClient.get<AuthorNovelsResponse>("/author/novels");
    return response.data.novels;
  },

  // Get author statistics
  async getStats(): Promise<AuthorStats> {
    const response = await apiClient.get<AuthorStats>("/author/stats");
    return response.data;
  },

  // Get all chapters for a novel (including unpublished) - Author Workflow
  async getNovelChapters(novelSlug: string): Promise<{
    novel: { id: number; title: string; slug: string; author: string };
    chapters: AuthorChapterWithStatus[];
  }> {
    const response = await apiClient.get<AuthorChaptersResponse>(
      `/author/novels/${novelSlug}/chapters`,
    );
    return {
      novel: response.data.novel,
      chapters: response.data.chapters,
    };
  },

  // Submit chapter for review (after revision)
  async submitChapterForReview(
    novelSlug: string,
    chapterId: number,
  ): Promise<SubmitForReviewResponse> {
    const response = await apiClient.post<SubmitForReviewResponse>(
      `/novels/${novelSlug}/chapters/${chapterId}/submit-for-review`,
      {},
    );
    return response.data;
  },
};
