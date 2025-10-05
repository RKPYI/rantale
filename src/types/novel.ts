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

// Chapter Types
export interface ChapterSummary {
  id: number;
  novel_id: number;
  chapter_number: number;
  title: string;
  word_count: number;
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
  previous_chapter?: number | null;
  next_chapter?: number | null;
}

// Novel with Relations
export interface NovelWithChapters extends Novel {
  chapters: ChapterSummary[];
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

export interface ChapterListResponse {
  message: string;
  novel: {
    title: string;
    slug: string;
    author: string;
  };
  chapters: ChapterSummary[];
}

export interface ChapterDetailResponse {
  message: string;
  novel: {
    id: number;
    title: string;
    slug: string;
    author: string;
  };
  chapter: Chapter;
}

// Request Types
export interface NovelSearchParams {
  q: string;
}

export interface NovelListParams {
  genre?: string;
  status?: "ongoing" | "completed" | "hiatus";
  sort_by?: "popular" | "rating" | "latest" | "updated" | string;
  sort_order?: "asc" | "desc";
  page?: number;
  per_page?: number;
}

export interface CreateNovelRequest {
  title: string;
  author: string;
  description?: string;
  cover_image?: string;
  status?: "ongoing" | "completed" | "hiatus";
  genres?: number[];
}

export interface UpdateNovelRequest {
  title?: string;
  author?: string;
  description?: string;
  cover_image?: string;
  status?: "ongoing" | "completed" | "hiatus";
  genres?: number[];
}

export interface CreateChapterRequest {
  chapter_number: number;
  title: string;
  content: string;
  is_free?: boolean;
  published_at?: string;
}

export interface UpdateChapterRequest {
  title?: string;
  content?: string;
  is_free?: boolean;
  published_at?: string;
}
