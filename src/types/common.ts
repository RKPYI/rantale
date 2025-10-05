/**
 * Common API Types
 * Shared types used across multiple API endpoints
 */

// Generic Pagination Response
export interface PaginatedResponse<T> {
  current_page: number;
  data: T[];
  first_page_url: string;
  from: number | null;
  last_page: number;
  last_page_url: string;
  links: Array<{
    url: string | null;
    label: string;
    active: boolean;
  }>;
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number | null;
  total: number;
}

// Generic API Response
export interface ApiResponse<T = unknown> {
  message: string;
  data: T;
}

// API Error Types
export interface ApiError {
  success: false;
  error: string;
  details?: Record<string, string[]>;
  statusCode?: number;
}

// Generic Message Response
export interface MessageResponse {
  message: string;
}
