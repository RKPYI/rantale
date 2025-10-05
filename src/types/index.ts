/**
 * Types Index
 * Central export point for all type definitions
 */

// Common types
export type {
  PaginatedResponse,
  ApiResponse,
  ApiError,
  MessageResponse,
} from "./common";

// User and authentication types
export type {
  User,
  AuthResponse,
  GoogleAuthResponse,
  LoginRequest,
  RegisterRequest,
  EmailVerificationRequest,
  UpdateProfileRequest,
  ChangePasswordRequest,
} from "./user";

// Novel and chapter types
export type {
  Genre,
  Novel,
  NovelWithChapters,
  Chapter,
  ChapterSummary,
  NovelApiResponse,
  SearchApiResponse,
  GenresApiResponse,
  ChapterListResponse,
  ChapterDetailResponse,
  NovelSearchParams,
  NovelListParams,
  CreateNovelRequest,
  UpdateNovelRequest,
  CreateChapterRequest,
  UpdateChapterRequest,
} from "./novel";

// Comment types
export type {
  Comment,
  CommentVote,
  CommentsResponse,
  CommentResponse,
  VoteResponse,
  BulkVotesResponse,
  CreateCommentRequest,
  UpdateCommentRequest,
  VoteCommentRequest,
} from "./comment";

// Rating types
export type {
  Rating,
  RatingStats,
  RatingsResponse,
  RatingResponse,
  DeleteRatingResponse,
  CreateRatingRequest,
  UpdateRatingRequest,
} from "./rating";

// Reading progress types
export type {
  ReadingProgress,
  ReadingProgressResponse,
  UserReadingProgressResponse,
  ReadingProgressCreateResponse,
  ReadingProgressUpdateResponse,
  UpdateReadingProgressRequest,
  CreateReadingProgressRequest,
} from "./reading-progress";

// Admin types
export type {
  AdminDashboardStats,
  AdminActivity,
  AdminUsersResponse,
  AdminCommentsResponse,
  AdminModerationResponse,
  AdminSystemHealth,
} from "./admin";

export * from "./author";
export * from "./library";
export * from "./notification";
