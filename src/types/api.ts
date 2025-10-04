// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  current_page: number;
  data: T[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  links: PaginationLink[];
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}

export interface PaginationLink {
  url: string | null;
  label: string;
  active: boolean;
}

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

// User Types
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

export interface AuthorStats {
  total_novels: number;
  total_views: number;
  total_followers: number;
  monthly_views: number | null;
  monthly_followers: number | null;
  average_rating: number | null;
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

// Library System Types
export interface LibraryEntry {
  id: number;
  user_id: number;
  novel_id: number;
  status: "want_to_read" | "reading" | "completed" | "dropped" | "on_hold";
  is_favorite: boolean;
  added_at: string;
  status_updated_at: string;
  created_at: string;
  updated_at: string;
  novel: Novel;
}

export interface LibraryResponse {
  message: string;
  library: PaginatedResponse<LibraryEntry>;
  stats: {
    total: number;
    want_to_read: number;
    reading: number;
    completed: number;
    dropped: number;
    on_hold: number;
    favorites: number;
  };
}

export interface LibraryStatusResponse {
  in_library: boolean;
  library_entry?: LibraryEntry;
  novel_id: number;
  novel_title: string;
}

export interface AddToLibraryRequest {
  novel_id: number;
  status: "want_to_read" | "reading" | "completed" | "dropped" | "on_hold";
  is_favorite?: boolean;
}

export interface UpdateLibraryEntryRequest {
  status?: "want_to_read" | "reading" | "completed" | "dropped" | "on_hold";
  is_favorite?: boolean;
}

// Notification System Types
export interface Notification {
  id: number;
  user_id: number;
  type:
    | "new_chapter"
    | "comment_reply"
    | "author_status"
    | "novel_update"
    | "system";
  title: string;
  message: string;
  data: Record<string, any>;
  read_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface NotificationsResponse {
  notifications: PaginatedResponse<Notification>;
  stats: {
    total: number;
    unread: number;
    read: number;
  };
}

export interface AuthResponse {
  message: string;
  user: User;
  token: string;
  verification_notice?: string;
}

// Novel Types
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

export interface NovelWithChapters extends Novel {
  chapters: ChapterSummary[];
}

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

// Comment System Types
export interface Comment {
  id: number;
  user_id: number;
  novel_id: number;
  chapter_id: number | null;
  parent_id: number | null;
  content: string;
  likes: number;
  dislikes: number;
  is_spoiler: boolean;
  is_approved: boolean;
  /** Timestamp when comment was last edited, null if never edited */
  edited_at: string | null;
  created_at: string;
  updated_at: string;
  user: User;
  replies: Comment[];
}

export interface CommentVote {
  is_upvote: boolean;
  created_at: string;
}

export interface CommentsResponse {
  comments: PaginatedResponse<Comment>;
  total_comments_count: number;
}

export interface CreateCommentRequest {
  novel_id: number;
  chapter_id?: number;
  parent_id?: number;
  content: string;
  is_spoiler?: boolean;
}

export interface UpdateCommentRequest {
  content: string;
  is_spoiler?: boolean;
}

export interface VoteCommentRequest {
  is_upvote: boolean;
}

// Rating System Types
export interface Rating {
  id: number;
  user_id: number;
  novel_id: number;
  rating: number; // 1-5
  review: string | null;
  created_at: string;
  updated_at: string;
  user: User;
  novel?: Novel;
}

export interface RatingStats {
  average_rating: number;
  total_ratings: number;
  rating_breakdown: {
    "5": number;
    "4": number;
    "3": number;
    "2": number;
    "1": number;
  };
}

export interface RatingsResponse {
  ratings: PaginatedResponse<Rating>;
  stats: RatingStats;
}

export interface CreateRatingRequest {
  novel_id: number;
  rating: number; // 1-5
  review?: string;
}

export interface UpdateRatingRequest {
  rating: number; // 1-5
  review?: string;
}

// Reading Progress Types
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

export interface UpdateReadingProgressRequest {
  novel_slug: string;
  chapter_number: number;
}

export interface CreateReadingProgressRequest {
  novel_slug: string;
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
  new_password: string;
  new_password_confirmation: string;
}

// Enhanced Auth Types
export interface GoogleAuthResponse {
  url: string;
}

export interface EmailVerificationRequest {
  id: string;
  hash: string;
}

// Admin Types
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
  // ... pagination properties
}

// Enhanced Response Types
export interface MessageResponse {
  message: string;
}

export interface CommentResponse {
  message: string;
  comment: Comment;
}

export interface VoteResponse {
  message: string;
  likes: number;
  dislikes: number;
}

export interface RatingResponse {
  message: string;
  rating: Rating;
  novel_stats: {
    average_rating: number;
    total_ratings: number;
  };
}

export interface DeleteRatingResponse {
  message: string;
  novel_stats: {
    average_rating: number;
    total_ratings: number;
  };
}

export interface ReadingProgressCreateResponse {
  message: string;
  progress: ReadingProgressResponse;
}

export interface ReadingProgressUpdateResponse {
  message: string;
  progress: ReadingProgressResponse;
}

// Novel Request Types
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

// Chapter Request Types
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

// Admin Dashboard Types
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
