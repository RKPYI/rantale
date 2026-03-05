import { apiClient } from "@/lib/api-client";
import {
  AdminDashboardStats,
  AdminActivity,
  AdminUsersResponse,
  AdminModerationResponse,
  AdminSystemHealth,
  AdminContactsResponse,
  AdminContactResponse,
  ContactRespondRequest,
  ContactUpdateStatusRequest,
  EditorialGroupsResponse,
  EditorialGroupResponse,
  EditorialGroup,
  CreateEditorialGroupRequest,
  UpdateEditorialGroupRequest,
  AddMemberRequest,
  AuthorApplication,
  User,
  MessageResponse,
  AdminGenresResponse,
  AdminGenreResponse,
  AdminGenre,
  CreateGenreRequest,
  UpdateGenreRequest,
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

  // Author Applications Management
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

  // Contact Management
  async getContacts(
    page?: number,
    status?: string,
  ): Promise<AdminContactsResponse> {
    const params: Record<string, string | number> = {};
    if (page) params.page = page;
    if (status && status !== "all") params.status = status;

    const response = await apiClient.get<AdminContactsResponse>(
      "/admin/contacts",
      params,
    );
    return response.data || (response as unknown as AdminContactsResponse);
  },

  async getContact(contactId: number): Promise<AdminContactResponse> {
    const response = await apiClient.get<AdminContactResponse>(
      `/admin/contacts/${contactId}`,
    );
    return response.data || (response as unknown as AdminContactResponse);
  },

  async respondToContact(
    contactId: number,
    data: ContactRespondRequest,
  ): Promise<AdminContactResponse> {
    const response = await apiClient.post<AdminContactResponse>(
      `/admin/contacts/${contactId}/respond`,
      data,
    );
    return response.data || (response as unknown as AdminContactResponse);
  },

  async updateContactStatus(
    contactId: number,
    data: ContactUpdateStatusRequest,
  ): Promise<AdminContactResponse> {
    const response = await apiClient.put<AdminContactResponse>(
      `/admin/contacts/${contactId}/status`,
      data,
    );
    return response.data || (response as unknown as AdminContactResponse);
  },

  async deleteContact(contactId: number): Promise<MessageResponse> {
    const response = await apiClient.delete<MessageResponse>(
      `/admin/contacts/${contactId}`,
    );
    return response.data || (response as unknown as MessageResponse);
  },

  // Editorial Group Management
  async getEditorialGroups(): Promise<EditorialGroup[]> {
    const response = await apiClient.get<EditorialGroupsResponse>(
      "/admin/editorial-groups",
    );
    return response.data.groups;
  },

  async getEditorialGroup(id: number): Promise<EditorialGroup> {
    const response = await apiClient.get<EditorialGroupResponse>(
      `/admin/editorial-groups/${id}`,
    );
    return response.data.group;
  },

  async createEditorialGroup(
    data: CreateEditorialGroupRequest,
  ): Promise<EditorialGroup> {
    const response = await apiClient.post<EditorialGroupResponse>(
      "/admin/editorial-groups",
      data,
    );
    return response.data.group;
  },

  async updateEditorialGroup(
    id: number,
    data: UpdateEditorialGroupRequest,
  ): Promise<EditorialGroup> {
    const response = await apiClient.put<EditorialGroupResponse>(
      `/admin/editorial-groups/${id}`,
      data,
    );
    return response.data.group;
  },

  async deleteEditorialGroup(id: number): Promise<MessageResponse> {
    const response = await apiClient.delete<MessageResponse>(
      `/admin/editorial-groups/${id}`,
    );
    return response.data;
  },

  async addMemberToGroup(
    groupId: number,
    data: AddMemberRequest,
  ): Promise<EditorialGroup> {
    const response = await apiClient.post<EditorialGroupResponse>(
      `/admin/editorial-groups/${groupId}/members`,
      data,
    );
    return response.data.group;
  },

  async removeMemberFromGroup(
    groupId: number,
    username: string,
  ): Promise<EditorialGroup> {
    const response = await apiClient.delete<EditorialGroupResponse>(
      `/admin/editorial-groups/${groupId}/members/${username}`,
    );
    return response.data.group;
  },

  // Genre Management
  async getGenres(): Promise<AdminGenre[]> {
    const response = await apiClient.get<AdminGenresResponse>("/admin/genres");
    return response.data.genres;
  },

  async getGenre(id: number): Promise<AdminGenre> {
    const response = await apiClient.get<AdminGenreResponse>(
      `/admin/genres/${id}`,
    );
    return response.data.genre;
  },

  async createGenre(data: CreateGenreRequest): Promise<AdminGenre> {
    const response = await apiClient.post<AdminGenreResponse>(
      "/admin/genres",
      data,
    );
    return response.data.genre;
  },

  async updateGenre(id: number, data: UpdateGenreRequest): Promise<AdminGenre> {
    const response = await apiClient.put<AdminGenreResponse>(
      `/admin/genres/${id}`,
      data,
    );
    return response.data.genre;
  },

  async deleteGenre(id: number): Promise<MessageResponse> {
    const response = await apiClient.delete<MessageResponse>(
      `/admin/genres/${id}`,
    );
    return response.data;
  },
};
