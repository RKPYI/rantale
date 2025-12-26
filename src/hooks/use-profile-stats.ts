"use client";

import { authService } from "@/services/auth";
import { UserProfileStats } from "@/types/api";
import { useApi } from "./use-api";

/**
 * Hook for fetching comprehensive user profile statistics
 * Includes reading progress, library stats, activity, genre preferences, and recent activity
 */
export function useProfileStats() {
  return useApi<UserProfileStats>(() => authService.getUserProfileStats(), []);
}
