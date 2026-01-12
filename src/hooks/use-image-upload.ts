"use client";

import { useState } from "react";
import { authService } from "@/services/auth";
import { novelService } from "@/services/novels";
import { User, Novel } from "@/types/api";
import { handleApiError } from "@/lib/api-client";

export interface UseImageUploadState {
  loading: boolean;
  error: string | null;
  success: string | null;
  upload: (file: File) => Promise<void>;
  remove: () => Promise<void>;
  reset: () => void;
}

/**
 * Hook for avatar upload functionality
 * @param onUpdate - Callback when avatar is updated
 * @returns Upload state and functions
 */
export function useAvatarUpload(
  onUpdate?: (user: User) => void,
): UseImageUploadState {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const upload = async (file: File) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await authService.uploadAvatar(file);
      setSuccess(result.message);
      onUpdate?.(result.user);

      // Auto-clear success message
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const remove = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await authService.deleteAvatar();
      setSuccess(result.message);
      onUpdate?.(result.user);

      // Auto-clear success message
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setLoading(false);
    setError(null);
    setSuccess(null);
  };

  return {
    loading,
    error,
    success,
    upload,
    remove,
    reset,
  };
}

/**
 * Hook for novel cover upload functionality
 * @param novelSlug - Novel slug
 * @param onUpdate - Callback when cover is updated
 * @returns Upload state and functions
 */
export function useNovelCoverUpload(
  novelSlug: string,
  onUpdate?: (novel: Novel) => void,
): UseImageUploadState {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const upload = async (file: File) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await novelService.uploadNovelCover(novelSlug, file);
      setSuccess(result.message);
      onUpdate?.(result.novel);

      // Auto-clear success message
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const remove = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await novelService.deleteNovelCover(novelSlug);
      setSuccess(result.message);
      onUpdate?.(result.novel);

      // Auto-clear success message
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setLoading(false);
    setError(null);
    setSuccess(null);
  };

  return {
    loading,
    error,
    success,
    upload,
    remove,
    reset,
  };
}
