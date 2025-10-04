"use client";

import { adminService } from "@/services/admin";
import {
  AdminDashboardStats,
  AdminActivity,
  AdminUsersResponse,
  AdminModerationResponse,
  AdminSystemHealth,
  User,
  AuthorApplication,
} from "@/types/api";
import { useApi } from "./use-api";

// Dashboard Statistics
export function useAdminDashboardStats() {
  return useApi<AdminDashboardStats>(
    () => adminService.getDashboardStats(),
    [],
  );
}

// Recent Activity Feed
export function useAdminRecentActivity(limit?: number) {
  return useApi<AdminActivity[]>(
    () => adminService.getRecentActivity(limit),
    [limit],
  );
}

// User Management
export function useAdminUsers(
  page?: number,
  search?: string,
  role?: string,
  status?: string,
) {
  return useApi<AdminUsersResponse>(
    () => adminService.getUsers(page, search, role, status),
    [page, search, role, status],
  );
}

export function useUpdateUser() {
  return useApi<User>(
    () => Promise.resolve({} as User), // Use refetch with adminService.updateUser
    [],
  );
}

// Content Moderation
export function useAdminModerationQueue(type?: string) {
  return useApi<AdminModerationResponse>(
    () => adminService.getModerationQueue(type),
    [type],
  );
}

// System Health
export function useAdminSystemHealth() {
  return useApi<AdminSystemHealth>(() => adminService.getSystemHealth(), []);
}

// Author Applications Management
export function useAdminAuthorApplications(page?: number, status?: string) {
  return useApi(
    () => adminService.getAllAuthorApplications(page, status),
    [page, status],
  );
}

export function useAdminAuthorApplication(applicationId: number) {
  return useApi<AuthorApplication>(
    () => adminService.getAuthorApplication(applicationId),
    [applicationId],
  );
}

export function useApproveAuthorApplication() {
  return useApi<AuthorApplication>(
    () => Promise.resolve({} as AuthorApplication), // Use refetch with adminService.approveAuthorApplication
    [],
  );
}

export function useRejectAuthorApplication() {
  return useApi<AuthorApplication>(
    () => Promise.resolve({} as AuthorApplication), // Use refetch with adminService.rejectAuthorApplication
    [],
  );
}

// Comment Moderation
export function useAdminComments(page?: number) {
  return useApi(() => adminService.getAllComments(page), [page]);
}

export function useToggleCommentApproval() {
  return useApi(
    () => Promise.resolve({}), // Use refetch with adminService.toggleCommentApproval
    [],
  );
}
