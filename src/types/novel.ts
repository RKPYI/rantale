/**
 * Novel and Chapter Types
 * Types related to novels, genres, chapters, and book content
 */

import type { PaginatedResponse } from "./common";

// Genre Entity
export interface Genre {
  id: number;
  name: string;
  slug: string;
  description: string;
  color: string;
  novels_count?: number;
  created_at: string;
  updated_at: string;
  pivot?: {
    novel_id: number;
    genre_id: number;
  };
}

// Novel Entity
export interface Novel {
  id: number;
  title: string;
  slug: string;
  author: string;
  created_at: string;
  updated_at: string;
  description: string;
  status: "ongoing" | "completed" | "hiatus";
  cover_image: string | null;
  uses_volumes?: boolean;
  total_chapters: number | null;
  views: number | null;
  likes: number | null;
  rating: string | null;
  rating_count: number | null;
  is_featured: boolean;
  is_trending: boolean;
  published_at: string | null;
  genres: Genre[];
}

export interface VolumeSummary {
  id: number;
  novel_id?: number;
  volume_number: number;
  title: string;
  description?: string | null;
  chapters: ChapterSummary[];
}

export interface Volume {
  id: number;
  novel_id: number;
  volume_number: number;
  title: string;
  description: string | null;
  chapters?: ChapterSummary[];
}

// Chapter Types
export interface ChapterSummary {
  id: number;
  novel_id: number;
  chapter_number: number;
  title: string;
  word_count: number;
  volume_id?: number | null;
  volume_number?: number | null;
}

export interface Chapter {
  id: number;
  novel_id: number;
  chapter_number: number;
  title: string;
  content: string;
  word_count: number;
  views: number | null;
  is_free: boolean;
  published_at: string;
  created_at: string;
  updated_at: string;
  volume_id?: number | null;
  volume_number?: number | null;
  previous_chapter?: number | null;
  next_chapter?: number | null;
  previous_volume?: number | null;
  next_volume?: number | null;
}

// Novel with Relations
export interface NovelWithChapters extends Novel {
  chapters: ChapterSummary[];
  volumes?: VolumeSummary[];
}

// Related Novel with Similarity Score
export interface RelatedNovel extends Novel {
  similarity_score: number;
}

// Recently Updated Novel with Latest Chapter Info
export interface RecentlyUpdatedNovel extends Novel {
  latest_chapter_created_at: string;
  latest_chapter_number: number;
  latest_chapter_title: string;
  latest_chapter_id: number;
  latest_chapter_volume_number?: number | null;
}

// API Responses
export interface NovelApiResponse {
  message: string;
  novels: PaginatedResponse<Novel> | Novel[];
}

export interface SearchApiResponse {
  message: string;
  novels: Novel[];
}

export interface GenresApiResponse {
  message: string;
  genres: Genre[];
}

export interface RelatedNovelsApiResponse {
  message: string;
  data: RelatedNovel[];
  current_novel: {
    id: number;
    title: string;
    slug: string;
  };
  algorithm_used?: string;
}

export interface RecentlyUpdatedApiResponse {
  message: string;
  novels: RecentlyUpdatedNovel[];
}

export interface ChapterListResponse {
  message: string;
  uses_volumes: boolean;
  novel: {
    title: string;
    slug: string;
    author: string;
  };
  chapters: ChapterSummary[];
  volumes?: VolumeSummary[];
}

export interface ChapterDetailResponse {
  message: string;
  novel: {
    id: number;
    title: string;
    slug: string;
    author: string;
    uses_volumes?: boolean;
  };
  chapter: Chapter;
}

export interface VolumeListResponse {
  message: string;
  uses_volumes: boolean;
  novel: {
    title: string;
    slug: string;
    author: string;
  };
  volumes: VolumeSummary[];
}

// Request Types
export interface NovelSearchParams {
  q: string;
  [key: string]: string | number | undefined;
}

export interface NovelListParams {
  genre?: string;
  status?: "ongoing" | "completed" | "hiatus";
  sort_by?: "popular" | "rating" | "latest" | "updated" | string;
  sort_order?: "asc" | "desc";
  page?: number;
  per_page?: number;
  [key: string]: string | number | undefined;
}

export interface CreateNovelRequest {
  title: string;
  author: string;
  description?: string;
  cover_image?: string;
  status?: "ongoing" | "completed" | "hiatus";
  uses_volumes?: boolean;
  genres?: number[];
}

export interface UpdateNovelRequest {
  title?: string;
  author?: string;
  description?: string;
  cover_image?: string;
  status?: "ongoing" | "completed" | "hiatus";
  uses_volumes?: boolean;
  genres?: number[];
}

export interface CreateChapterRequest {
  chapter_number: number;
  title: string;
  content: string;
  is_free?: boolean;
  published_at?: string;
  save_as_draft?: boolean;
  volume_id?: number;
  volume_number?: number;
}

// Image Upload Types
export interface UploadNovelCoverResponse {
  message: string;
  cover_url: string;
  novel: Novel;
}

export interface DeleteNovelCoverResponse {
  message: string;
  novel: Novel;
}
export interface UpdateChapterRequest {
  title?: string;
  content?: string;
  is_free?: boolean;
  published_at?: string;
  save_as_draft?: boolean;
  volume_id?: number;
  volume_number?: number;
}
