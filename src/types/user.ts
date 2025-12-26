/**
 * User and Authentication Types
 * Types related to user accounts, authentication, and authorization
 */

// User Entity
export interface User {
  id: number;
  name: string;
  email: string;
  email_verified_at: string | null;
  email_verified: boolean;
  role: number; // 0=user, 1=author, 2=moderator, 3=admin
  provider?: string; // email|google
  provider_id?: string | null;
  avatar: string | null;
  bio: string | null;
  is_admin: boolean;
  last_login_at?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

// Authentication Responses
export interface AuthResponse {
  message: string;
  user: User;
  token: string;
  verification_notice?: string;
}

export interface GoogleAuthResponse {
  url: string;
}

// Authentication Requests
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export interface EmailVerificationRequest {
  id: string;
  hash: string;
}

// Profile Management
export interface UpdateProfileRequest {
  name?: string;
  email?: string;
  avatar?: string;
  bio?: string;
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
  new_password_confirmation: string;
}

// User Profile Statistics
export interface UserProfileStats {
  username: string;
  member_since: string;
  reading_progress: {
    total_novels_reading: number;
    completed_novels: number;
    in_progress_novels: number;
    total_chapters_read: number;
    average_completion_rate: number;
    last_read: {
      novel_id: number;
      novel_title: string;
      novel_slug: string;
      chapter_number: number;
      chapter_title: string;
      last_read_at: string;
    } | null;
  };
  library: {
    total_novels: number;
    favorites: number;
    by_status: {
      reading: number;
      completed: number;
      want_to_read: number;
      on_hold: number;
      dropped: number;
    };
  };
  activity: {
    total_comments: number;
    total_ratings: number;
    average_rating_given: number;
    this_month: {
      comments: number;
      ratings: number;
      // reading_days: number; // Not working yet fix the backend first
    };
  };
  genre_preferences: Array<{
    id: number;
    name: string;
    count: number;
  }>;
  recent_activity: Array<{
    type: "reading" | "comment" | "rating";
    timestamp: string;
    novel: {
      title: string;
      slug: string;
    };
    chapter?: {
      number: number;
      title: string;
    };
    content?: string;
    rating?: number;
  }>;
}
