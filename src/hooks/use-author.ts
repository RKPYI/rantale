"use client";

import { authorService } from "@/services/author";
import {
  AuthorApplication,
  AuthorApplicationRequest,
  AuthorApplicationsResponse,
  AuthorApplicationStatusResponse,
  AuthorNovel,
  AuthorStats,
} from "@/types/api";
import { useApi } from "./use-api";

// Hook for getting current user's application status
export function useAuthorApplicationStatus() {
  return useApi(() => authorService.getApplicationStatus(), []);
}

// Hook for submitting author application (use refetch to call)
export function useSubmitAuthorApplication() {
  return useApi(
    () => Promise.resolve(null), // Use refetch with authorService.submitApplication
    [],
  );
}

// Admin hooks
export function useAuthorApplications(page?: number, status?: string) {
  return useApi(
    () => authorService.getAllApplications(page, status),
    [page, status],
  );
}

export function useAuthorApplication(applicationId: number) {
  return useApi(
    () => authorService.getApplication(applicationId),
    [applicationId],
  );
}

export function useApproveApplication() {
  return useApi(
    () => Promise.resolve(null), // Use refetch with authorService.approveApplication
    [],
  );
}

export function useRejectApplication() {
  return useApi(
    () => Promise.resolve(null), // Use refetch with authorService.rejectApplication
    [],
  );
}

// Hook for getting author's novels
export function useAuthorNovels() {
  return useApi<AuthorNovel[]>(() => authorService.getNovels(), []);
}

// Hook for getting author statistics
export function useAuthorStats() {
  return useApi<AuthorStats>(() => authorService.getStats(), []);
}
