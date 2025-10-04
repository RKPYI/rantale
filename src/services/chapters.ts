import { apiClient } from "@/lib/api-client";
import {
  Chapter,
  ChapterSummary,
  ChapterListResponse,
  ChapterDetailResponse,
  CreateChapterRequest,
  UpdateChapterRequest,
} from "@/types/api";

export const chapterService = {
  // Get all chapters for a novel
  async getNovelChapters(
    novelSlug: string,
  ): Promise<{
    novel: { title: string; slug: string; author: string };
    chapters: ChapterSummary[];
  }> {
    const response = await apiClient.get<ChapterListResponse>(
      `/novels/${novelSlug}/chapters`,
    );
    return {
      novel: response.data.novel,
      chapters: response.data.chapters,
    };
  },

  // Get chapter by novel slug and chapter number
  async getChapter(
    novelSlug: string,
    chapterNumber: number,
  ): Promise<{
    novel: { id: number; title: string; slug: string; author: string };
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

  // Admin-only operations (require authentication and admin role)
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
    chapterId: number,
    data: UpdateChapterRequest,
  ): Promise<Chapter> {
    const response = await apiClient.put<{ message: string; chapter: Chapter }>(
      `/chapters/${chapterId}`,
      data,
    );
    return response.data.chapter;
  },

  async deleteChapter(chapterId: number): Promise<void> {
    await apiClient.delete(`/chapters/${chapterId}`);
  },
};
