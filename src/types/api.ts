// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// User Types
export interface User {
  id: number;
  name: string;
  email: string;
  email_verified_at: string | null;
  email_verified: boolean;
  role: number | null;
  avatar: string | null;
  bio: string | null;
  is_admin: boolean;
  last_login_at?: string;
  created_at?: string;
}

export interface AuthResponse {
  message: string;
  user: User;
  token: string;
  verification_notice?: string;
}

// Novel Types
export interface Novel {
  id: string;
  title: string;
  description: string;
  cover?: string;
  author: string;
  genre: string[];
  status: 'ongoing' | 'completed' | 'hiatus';
  chapters: number;
  rating: number;
  views: number;
  createdAt: string;
  updatedAt: string;
}

export interface Chapter {
  id: string;
  novelId: string;
  title: string;
  content: string;
  chapterNumber: number;
  publishedAt: string;
  wordCount: number;
}

// Reading Progress
export interface ReadingProgress {
  id: string;
  userId: string;
  novelId: string;
  chapterId: string;
  progress: number; // percentage read
  lastReadAt: string;
}

// API Error Types
export interface ApiError {
  success: false;
  error: string;
  details?: Record<string, string[]>;
  statusCode?: number;
}

// Request Types
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

export interface UpdateProfileRequest {
  name?: string;
  email?: string;
  avatar?: string;
  bio?: string;
}

export interface ChangePasswordRequest {
  current_password: string;
  password: string;
  password_confirmation: string;
}