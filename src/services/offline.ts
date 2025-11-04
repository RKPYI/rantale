/**
 * Offline Service
 * Handles chapter downloads and offline reading functionality
 */

import type { Chapter } from '@/types/api';

const CACHE_NAME = 'rdknovel-chapters-v1';
const CACHE_KEY_PREFIX = '/offline/chapters/';
const STORAGE_KEY = 'downloaded-chapters';

export interface OfflineChapter {
  id: number;
  title: string;
  content: string;
  novel_id: number;
  novelTitle: string;
  chapter_number: number;
  downloadedAt: string;
}

export interface DownloadProgress {
  chapterId: string;
  progress: number;
  status: 'downloading' | 'completed' | 'failed';
}

export const offlineService = {
  /**
   * Download chapter for offline reading
   */
  async downloadChapter(chapter: Chapter, novelTitle?: string): Promise<void> {
    try {
      // Prepare offline chapter data
      const offlineChapter: OfflineChapter = {
        id: chapter.id,
        title: chapter.title,
        content: chapter.content,
        novel_id: chapter.novel_id,
        novelTitle: novelTitle || '',
        chapter_number: chapter.chapter_number,
        downloadedAt: new Date().toISOString(),
      };

      // Store in Cache API
      const cache = await caches.open(CACHE_NAME);
      const response = new Response(JSON.stringify(offlineChapter), {
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
      });

      await cache.put(`${CACHE_KEY_PREFIX}${chapter.id}`, response);

      // Update download list in localStorage
      const downloads = this.getDownloadedChapters();
      downloads.add(chapter.id.toString());
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...downloads]));

      // Store metadata for quick access
      const metadata = this.getDownloadMetadata();
      metadata[chapter.id.toString()] = {
        title: chapter.title,
        novelTitle: offlineChapter.novelTitle,
        chapterNumber: chapter.chapter_number,
        downloadedAt: offlineChapter.downloadedAt,
      };
      localStorage.setItem(`${STORAGE_KEY}-metadata`, JSON.stringify(metadata));
    } catch (error) {
      console.error('Failed to download chapter:', error);
      throw new Error('Failed to download chapter for offline reading');
    }
  },

  /**
   * Download multiple chapters in batch
   */
  async downloadMultipleChapters(
    chapters: Chapter[],
    onProgress?: (progress: DownloadProgress) => void
  ): Promise<void> {
    const total = chapters.length;
    let completed = 0;

    for (const chapter of chapters) {
      try {
        onProgress?.({
          chapterId: chapter.id.toString(),
          progress: (completed / total) * 100,
          status: 'downloading',
        });

        await this.downloadChapter(chapter);
        completed++;

        onProgress?.({
          chapterId: chapter.id.toString(),
          progress: (completed / total) * 100,
          status: 'completed',
        });
      } catch (error) {
        onProgress?.({
          chapterId: chapter.id.toString(),
          progress: (completed / total) * 100,
          status: 'failed',
        });
        throw error;
      }
    }
  },

  /**
   * Get chapter from cache (offline mode)
   */
  async getOfflineChapter(chapterId: string): Promise<OfflineChapter | null> {
    try {
      const cache = await caches.open(CACHE_NAME);
      const response = await cache.match(`${CACHE_KEY_PREFIX}${chapterId}`);

      if (!response) return null;

      const data = await response.json();
      return data as OfflineChapter;
    } catch (error) {
      console.error('Failed to get offline chapter:', error);
      return null;
    }
  },

  /**
   * Remove downloaded chapter
   */
  async removeChapter(chapterId: string): Promise<void> {
    try {
      const cache = await caches.open(CACHE_NAME);
      await cache.delete(`${CACHE_KEY_PREFIX}${chapterId}`);

      const downloads = this.getDownloadedChapters();
      downloads.delete(chapterId);
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...downloads]));

      // Remove metadata
      const metadata = this.getDownloadMetadata();
      delete metadata[chapterId];
      localStorage.setItem(`${STORAGE_KEY}-metadata`, JSON.stringify(metadata));
    } catch (error) {
      console.error('Failed to remove chapter:', error);
      throw error;
    }
  },

  /**
   * Get list of downloaded chapter IDs
   */
  getDownloadedChapters(): Set<string> {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return new Set(stored ? JSON.parse(stored) : []);
    } catch {
      return new Set();
    }
  },

  /**
   * Get download metadata
   */
  getDownloadMetadata(): Record<string, {
    title: string;
    novelTitle: string;
    chapterNumber: number;
    downloadedAt: string;
  }> {
    try {
      const stored = localStorage.getItem(`${STORAGE_KEY}-metadata`);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  },

  /**
   * Check if chapter is downloaded
   */
  isChapterDownloaded(chapterId: string): boolean {
    return this.getDownloadedChapters().has(chapterId);
  },

  /**
   * Get all downloaded chapters with metadata
   */
  async getAllDownloadedChapters(): Promise<OfflineChapter[]> {
    const chapterIds = this.getDownloadedChapters();
    const chapters: OfflineChapter[] = [];

    for (const id of chapterIds) {
      const chapter = await this.getOfflineChapter(id);
      if (chapter) {
        chapters.push(chapter);
      }
    }

    return chapters.sort((a, b) => a.chapter_number - b.chapter_number);
  },

  /**
   * Clear all downloaded chapters
   */
  async clearAllDownloads(): Promise<void> {
    try {
      await caches.delete(CACHE_NAME);
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(`${STORAGE_KEY}-metadata`);
    } catch (error) {
      console.error('Failed to clear downloads:', error);
      throw error;
    }
  },

  /**
   * Get storage usage estimate
   */
  async getStorageUsage(): Promise<{ used: number; quota: number; percentage: number }> {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      const used = estimate.usage || 0;
      const quota = estimate.quota || 0;
      const percentage = quota > 0 ? (used / quota) * 100 : 0;

      return { used, quota, percentage };
    }

    return { used: 0, quota: 0, percentage: 0 };
  },

  /**
   * Check if browser supports offline features
   */
  isSupported(): boolean {
    return (
      typeof window !== 'undefined' &&
      'caches' in window &&
      'localStorage' in window
    );
  },

  /**
   * Check if user is online
   */
  isOnline(): boolean {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  },
};
