import { PaginatedResponse } from "./common";
import { Genre } from "./novel";
import { User } from "./user";

// Author Application Types
export interface AuthorApplication {
  id: number;
  user_id: number;
  pen_name: string | null;
  bio: string;
  writing_experience: string;
  sample_work: string | null;
  portfolio_url: string | null;
  status: "pending" | "approved" | "rejected";
  admin_notes: string | null;
  reviewed_by: number | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
  user?: User;
  reviewer?: User;
}

export interface AuthorApplicationRequest {
  pen_name?: string;
  bio: string;
  writing_experience: string;
  sample_work?: string;
  portfolio_url?: string;
}

export interface AuthorApplicationResponse {
  message: string;
  application: AuthorApplication;
}

export interface AuthorApplicationsResponse {
  applications: PaginatedResponse<AuthorApplication>;
  stats: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
  };
}

export interface AuthorApplicationStatusResponse {
  application?: AuthorApplication;
  message?: string;
  can_apply?: boolean;
  current_role?: number;
}

export interface TopNovel {
  id: number;
  title: string;
  slug: string;
  views: number;
  rating: number | null;
  rating_count: number;
  comments: number;
}

export interface AuthorStats {
  content_stats: {
    total_novels: number;
    total_chapters: number;
    total_words: number;
    completed_novels: number;
    ongoing_novels: number;
    avg_chapters_per_novel: number;
  };
  engagement_stats: {
    total_views: number;
    total_comments: number;
    total_ratings: number;
    total_library_adds: number;
    total_favorites: number;
  };
  quality_stats: {
    average_rating: number | null;
    novels_above_4_stars: number;
    five_star_ratings: number;
  };
  reader_engagement: {
    currently_reading: number;
    completed_readers: number;
    want_to_read: number;
  };
  top_novel: TopNovel | null;
  chapter_workflow?: {
    pending_review: number;
    revision_requested: number;
    approved: number;
    draft: number;
  };
}

export interface AuthorNovel {
  id: number;
  user_id: number;
  title: string;
  slug: string;
  author: string;
  created_at: string;
  updated_at: string;
  description: string;
  status: "ongoing" | "completed" | "hiatus";
  cover_image: string | null;
  total_chapters: number;
  views: number;
  likes: number;
  rating: string;
  rating_count: number;
  is_featured: boolean;
  is_trending: boolean;
  published_at: string | null;
  chapters_count: number;
  views_count: number;
  rating_avg: string | null;
  genres: Genre[];
}

export interface AuthorNovelsResponse {
  message: string;
  novels: AuthorNovel[];
}
