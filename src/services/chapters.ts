import { apiClient } from "@/lib/api-client";
import {
  Chapter,
  ChapterSummary,
  ChapterListResponse,
  ChapterDetailResponse,
  CreateChapterRequest,
  UpdateChapterRequest,
  VolumeSummary,
} from "@/types/api";

export const chapterService = {
  async getNovelChapters(novelSlug: string): Promise<{
    novel: { title: string; slug: string; author: string };
    uses_volumes: boolean;
    chapters: ChapterSummary[];
    volumes?: VolumeSummary[];
  }> {
    const response = await apiClient.get<ChapterListResponse>(
      `/novels/${novelSlug}/chapters`,
    );
    return {
      novel: response.data.novel,
      uses_volumes: response.data.uses_volumes,
      chapters: response.data.chapters,
      volumes: response.data.volumes,
    };
  },

  async getChapter(
    novelSlug: string,
    chapterNumber: number,
  ): Promise<{
    novel: {
      id: number;
      title: string;
      slug: string;
      author: string;
      uses_volumes?: boolean;
    };
    chapter: Chapter;
  }> {
    const response = await apiClient.get<ChapterDetailResponse>(
      `/novels/${novelSlug}/chapters/${chapterNumber}`,
    );
    return {
      novel: response.data.novel,
      chapter: response.data.chapter,
    };
  },

  async getVolumeChapter(
    novelSlug: string,
    volumeNumber: number,
    chapterNumber: number,
  ): Promise<{
    novel: {
      id: number;
      title: string;
      slug: string;
      author: string;
      uses_volumes?: boolean;
    };
    chapter: Chapter;
  }> {
    const response = await apiClient.get<ChapterDetailResponse>(
      `/novels/${novelSlug}/volumes/${volumeNumber}/chapters/${chapterNumber}`,
    );
    return {
      novel: response.data.novel,
      chapter: response.data.chapter,
    };
  },

  async getAuthorChapter(
    novelSlug: string,
    chapterNumber: number,
    volumeNumber?: number,
  ): Promise<{
    novel: {
      id: number;
      title: string;
      slug: string;
      author: string;
      uses_volumes?: boolean;
    };
    chapter: Chapter;
  }> {
    const url =
      volumeNumber != null
        ? `/author/novels/${novelSlug}/volumes/${volumeNumber}/chapters/${chapterNumber}`
        : `/author/novels/${novelSlug}/chapters/${chapterNumber}`;

    const response = await apiClient.get<ChapterDetailResponse>(url);
    return {
      novel: response.data.novel,
      chapter: response.data.chapter,
    };
  },

  async createChapter(
    novelSlug: string,
    data: CreateChapterRequest,
  ): Promise<Chapter> {
    const response = await apiClient.post<{
      message: string;
      chapter: Chapter;
    }>(`/novels/${novelSlug}/chapters`, data);
    return response.data.chapter;
  },

  async updateChapter(
    novelSlug: string,
    chapterId: number,
    data: UpdateChapterRequest,
  ): Promise<Chapter> {
    const response = await apiClient.put<{ message: string; chapter: Chapter }>(
      `/novels/${novelSlug}/chapters/${chapterId}`,
      data,
    );
    return response.data.chapter;
  },

  async deleteChapter(novelSlug: string, chapterId: number): Promise<void> {
    await apiClient.delete(`/novels/${novelSlug}/chapters/${chapterId}`);
  },

  async bulkDeleteChapters(
    novelSlug: string,
    chapterIds: number[],
  ): Promise<{ deleted_count: number }> {
    const response = await apiClient.post<{
      message: string;
      deleted_count: number;
    }>(`/novels/${novelSlug}/chapters/bulk-delete`, {
      chapter_ids: chapterIds,
    });
    return { deleted_count: response.data.deleted_count };
  },

  async moveChapterToVolume(
    novelSlug: string,
    chapterId: number,
    data: { volume_id: number; chapter_number?: number },
  ): Promise<Chapter> {
    const response = await apiClient.post<{ message: string; chapter: Chapter }>(
      `/novels/${novelSlug}/chapters/${chapterId}/move-volume`,
      data,
    );
    return response.data.chapter;
  },

  async bulkMoveChaptersToVolume(
    novelSlug: string,
    chapterIds: number[],
    data: { volume_id: number; chapter_number?: number },
  ): Promise<{ moved_count: number }> {
    const response = await apiClient.post<{
      message: string;
      moved_count: number;
    }>(`/novels/${novelSlug}/chapters/bulk-move-volume`, {
      chapter_ids: chapterIds,
      ...data,
    });
    return { moved_count: response.data.moved_count };
  },
};
