import { apiClient } from "@/lib/api-client";
import {
  AdminDashboardStats,
  AdminActivity,
  AdminUsersResponse,
  AdminModerationResponse,
  AdminSystemHealth,
  AuthorApplication,
  User,
  MessageResponse,
} from "@/types/api";

export const adminService = {
  // Dashboard Statistics
  async getDashboardStats(): Promise<AdminDashboardStats> {
    const response = await apiClient.get<AdminDashboardStats>(
      "/admin/dashboard/stats",
    );
    if (!response.data) {
      throw new Error("No data received from dashboard stats endpoint");
    }
    return response.data;
  },

  // Recent Activity Feed
  async getRecentActivity(limit?: number): Promise<AdminActivity[]> {
    const params = limit ? { limit } : {};
    const response = await apiClient.get<{
      message: string;
      activities: AdminActivity[];
    }>("/admin/activity", params);
    return response.data?.activities || [];
  },

  // User Management
  async getUsers(
    page?: number,
    search?: string,
    role?: string,
    status?: string,
  ): Promise<AdminUsersResponse> {
    const params: Record<string, string | number> = {};
    if (page) params.page = page;
    if (search) params.search = search;
    if (role && role !== "all") params.role = role;
    if (status && status !== "all") params.status = status;

    const response = await apiClient.get<AdminUsersResponse>(
      "/admin/users",
      params,
    );
    return response.data;
  },

  async updateUser(
    userId: number,
    data: { role?: number; is_active?: boolean },
  ): Promise<User> {
    const response = await apiClient.put<{ message: string; user: User }>(
      `/admin/users/${userId}`,
      data,
    );
    return response.data.user;
  },

  // Content Moderation
  async getModerationQueue(type?: string): Promise<AdminModerationResponse> {
    const params = type && type !== "all" ? { type } : {};
    const response = await apiClient.get<AdminModerationResponse>(
      "/admin/moderation",
      params,
    );
    return response.data;
  },

  // System Health
  async getSystemHealth(): Promise<AdminSystemHealth> {
    const response = await apiClient.get<AdminSystemHealth>(
      "/admin/system-health",
    );
    return response.data;
  },

  // Author Applications Management (from existing authorService but for admin context)
  async getAllAuthorApplications(page?: number, status?: string) {
    const params: Record<string, string | number> = {};
    if (page) params.page = page;
    if (status && status !== "all") params.status = status;

    const response = await apiClient.get("/admin/author-applications", params);
    return response.data;
  },

  async getAuthorApplication(
    applicationId: number,
  ): Promise<AuthorApplication> {
    const response = await apiClient.get<{ application: AuthorApplication }>(
      `/admin/author-applications/${applicationId}`,
    );
    return response.data.application;
  },

  async approveAuthorApplication(
    applicationId: number,
    adminNotes?: string,
  ): Promise<AuthorApplication> {
    const data = adminNotes ? { admin_notes: adminNotes } : {};
    const response = await apiClient.post<{
      message: string;
      application: AuthorApplication;
    }>(`/admin/author-applications/${applicationId}/approve`, data);
    return response.data.application;
  },

  async rejectAuthorApplication(
    applicationId: number,
    adminNotes: string,
  ): Promise<AuthorApplication> {
    const response = await apiClient.post<{
      message: string;
      application: AuthorApplication;
    }>(`/admin/author-applications/${applicationId}/reject`, {
      admin_notes: adminNotes,
    });
    return response.data.application;
  },

  async updateAuthorApplicationNotes(
    applicationId: number,
    adminNotes: string,
  ): Promise<AuthorApplication> {
    const response = await apiClient.put<{
      message: string;
      application: AuthorApplication;
    }>(`/admin/author-applications/${applicationId}/notes`, {
      admin_notes: adminNotes,
    });
    return response.data.application;
  },

  // Comment Moderation
  async getAllComments(page?: number) {
    const params = page ? { page } : {};
    const response = await apiClient.get("/admin/comments", params);
    return response.data;
  },

  async toggleCommentApproval(commentId: number) {
    const response = await apiClient.put(
      `/admin/comments/${commentId}/toggle-approval`,
    );
    return response.data;
  },
};
