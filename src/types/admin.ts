/**
 * Admin and Moderation Types
 * Types related to admin dashboard, user management, and moderation
 */

import type { PaginatedResponse } from "./common";
import type { User } from "./user";
import type { Comment } from "./comment";

// Dashboard Statistics
export interface AdminDashboardStats {
  users: {
    total: number;
    new_this_month: number;
    verified: number;
    active_today: number;
    by_role: {
      users: number;
      authors: number;
      moderators: number;
      admins: number;
    };
  };
  content: {
    novels: number;
    chapters: number;
    comments: number;
    ratings: number;
    pending_comments: number;
    novels_this_month: number;
  };
  engagement: {
    total_views: string | number;
    total_library_entries: number;
    average_rating: number;
    top_genres: {
      name: string;
      count: number;
    }[];
  };
  author_applications: {
    pending: number;
    approved_this_month: number;
    total_approved: number;
  };
}

// Activity Tracking
export interface AdminActivity {
  id: number;
  activity_type:
    | "user_registered"
    | "novel_created"
    | "chapter_published"
    | "comment_posted"
    | "rating_added"
    | "application_submitted"
    | "user_role_changed";
  created_at: string;

  // For user registration activities
  name?: string;
  email?: string;
  is_admin?: boolean;
  is_verified?: boolean;

  // For novel creation activities
  title?: string;
  author?: string;

  // For comment activities
  user_id?: number;
  novel_id?: number;
  content?: string;
  user?: {
    id: number;
    name: string;
    is_admin: boolean;
    is_verified: boolean;
  };
  novel?: {
    id: number;
    title: string;
  };

  // For application activities
  status?: "pending" | "approved" | "rejected";
}

// API Responses
export interface AdminUsersResponse {
  message: string;
  users: PaginatedResponse<User>;
  stats: {
    total: number;
    active: number;
    inactive: number;
    unverified: number;
    by_role: {
      users: number;
      authors: number;
      moderators: number;
      admins: number;
    };
  };
}

export interface AdminCommentsResponse {
  current_page: number;
  data: Array<
    Comment & {
      user: User;
      novel: {
        id: number;
        title: string;
      };
      chapter?: {
        id: number;
        title: string;
      };
    }
  >;
  // Pagination properties from PaginatedResponse
  first_page_url?: string;
  from?: number | null;
  last_page?: number;
  last_page_url?: string;
  next_page_url?: string | null;
  path?: string;
  per_page?: number;
  prev_page_url?: string | null;
  to?: number | null;
  total?: number;
}

export interface AdminModerationResponse {
  message: string;
  moderation_data: {
    pending_comments: Comment[];
    recent_novels: {
      id: number;
      title: string;
      author: string | null;
      status: "ongoing" | "completed" | "hiatus";
      created_at: string;
    }[];
  };
}

export interface AdminSystemHealth {
  message: string;
  health: {
    database: {
      status: "healthy" | "warning" | "critical";
      total_tables: number;
    };
    cache: {
      status: "healthy" | "warning" | "critical";
    };
    storage: {
      status: "healthy" | "warning" | "critical";
    };
    recent_errors: {
      count_today: number;
      critical_errors: number;
    };
  };
}
