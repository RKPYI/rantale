import { apiClient } from "@/lib/api-client";
import {
  AuthorApplication,
  AuthorApplicationRequest,
  AuthorApplicationResponse,
  AuthorApplicationsResponse,
  AuthorApplicationStatusResponse,
  AuthorNovelsResponse,
  MessageResponse,
  Novel,
  AuthorStats,
  AuthorNovel,
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
    const params: Record<string, any> = {};
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
    const response = await apiClient.get("/author/stats");
    return response.data as AuthorStats;
  },
};
