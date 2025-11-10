/**
 * useOfflineChapter Hook
 * Manages offline chapter download and removal functionality
 */

import { useState, useEffect, useCallback } from "react";
import { offlineService, type OfflineChapter } from "@/services/offline";
import type { Chapter } from "@/types/api";

export interface UseOfflineChapterReturn {
  isDownloaded: boolean;
  isDownloading: boolean;
  downloadChapter: (chapter: Chapter, novelTitle?: string) => Promise<void>;
  removeChapter: () => Promise<void>;
  error: string | null;
}

export function useOfflineChapter(chapterId: number): UseOfflineChapterReturn {
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if chapter is downloaded on mount and when chapterId changes
  useEffect(() => {
    if (!offlineService.isSupported()) {
      return;
    }

    setIsDownloaded(offlineService.isChapterDownloaded(chapterId.toString()));
  }, [chapterId]);

  const downloadChapter = useCallback(
    async (chapter: Chapter, novelTitle?: string) => {
      if (!offlineService.isSupported()) {
        setError("Offline features are not supported in this browser");
        return;
      }

      setIsDownloading(true);
      setError(null);

      try {
        await offlineService.downloadChapter(chapter, novelTitle);
        setIsDownloaded(true);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to download chapter";
        setError(message);
        throw err;
      } finally {
        setIsDownloading(false);
      }
    },
    [],
  );

  const removeChapter = useCallback(async () => {
    if (!offlineService.isSupported()) {
      setError("Offline features are not supported in this browser");
      return;
    }

    setError(null);

    try {
      await offlineService.removeChapter(chapterId.toString());
      setIsDownloaded(false);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to remove chapter";
      setError(message);
      throw err;
    }
  }, [chapterId]);

  return {
    isDownloaded,
    isDownloading,
    downloadChapter,
    removeChapter,
    error,
  };
}

/**
 * useOfflineStatus Hook
 * Monitors online/offline status
 */
export function useOfflineStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true,
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return { isOnline, isOffline: !isOnline };
}

/**
 * useDownloadedChapters Hook
 * Manages list of all downloaded chapters
 */
export function useDownloadedChapters() {
  const [chapters, setChapters] = useState<OfflineChapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [storageUsage, setStorageUsage] = useState({
    used: 0,
    quota: 0,
    percentage: 0,
  });

  const loadChapters = useCallback(async () => {
    if (!offlineService.isSupported()) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const downloaded = await offlineService.getAllDownloadedChapters();
      const usage = await offlineService.getStorageUsage();

      setChapters(downloaded);
      setStorageUsage(usage);
    } catch (error) {
      console.error("Failed to load downloaded chapters:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearAll = useCallback(async () => {
    try {
      await offlineService.clearAllDownloads();
      setChapters([]);
      setStorageUsage({ used: 0, quota: 0, percentage: 0 });
    } catch (error) {
      console.error("Failed to clear downloads:", error);
      throw error;
    }
  }, []);

  useEffect(() => {
    loadChapters();
  }, [loadChapters]);

  return {
    chapters,
    loading,
    storageUsage,
    refetch: loadChapters,
    clearAll,
  };
}
