/**
 * Reading Progress Types
 * Types related to tracking user reading progress through novels
 */

import type { Novel } from "./novel";
import type { Chapter } from "./novel";

// Reading Progress Entity
export interface ReadingProgress {
  id: number;
  user_id: number;
  novel_id: number;
  chapter_id: number;
  created_at: string;
  updated_at: string;
  novel: Novel;
  chapter: Chapter;
}

// API Responses
export interface ReadingProgressResponse {
  novel_slug: string;
  user_id: number;
  current_chapter: {
    id: number;
    chapter_number: number;
    title: string;
    word_count?: number;
    views?: number;
    is_free?: boolean;
    published_at?: string;
    created_at?: string;
    updated_at?: string;
  } | null;
  progress_percentage: number;
  last_read_at: string | null;
  total_chapters: number;
}

export interface UserReadingProgressResponse {
  user_id: number;
  reading_progress: Array<{
    novel: {
      id: number;
      title: string;
      author: string;
      cover_image: string | null;
      slug: string;
    };
    current_chapter: {
      id: number;
      chapter_number: number;
      title: string;
    };
    progress_percentage: number;
    last_read_at: string;
    total_chapters: number;
  }>;
}

export interface ReadingProgressCreateResponse {
  message: string;
  progress: ReadingProgressResponse;
}

export interface ReadingProgressUpdateResponse {
  message: string;
  progress: ReadingProgressResponse;
}

// Request Types
export interface UpdateReadingProgressRequest {
  novel_slug: string;
  chapter_number: number;
}

export interface CreateReadingProgressRequest {
  novel_slug: string;
}
