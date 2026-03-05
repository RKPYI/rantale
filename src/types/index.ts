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
  RelatedNovel,
  Chapter,
  ChapterSummary,
  NovelApiResponse,
  SearchApiResponse,
  GenresApiResponse,
  RelatedNovelsApiResponse,
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
  ErrorMessage,
  EditorialGroup,
  EditorialGroupMember,
  EditorialGroupsResponse,
  EditorialGroupResponse,
  CreateEditorialGroupRequest,
  UpdateEditorialGroupRequest,
  AddEditorMemberRequest,
  AddAuthorMembersRequest,
  AddMemberRequest,
  AddMemberConflictResponse,
} from "./admin";

// Editor types
export type {
  ChapterReviewStatus,
  ReviewAction,
  EditorStats,
  EditorStatsResponse,
  EditorGroupMember,
  EditorGroupInfo,
  EditorGroupInfoResponse,
  PendingChapter,
  PendingChaptersResponse,
  ClaimedChapter,
  ClaimedChaptersResponse,
  ChapterReviewRecord,
  ChapterDetail,
  EditorChapterDetailResponse,
  ClaimChapterResponse,
  UnclaimChapterResponse,
  ApproveChapterRequest,
  ApproveChapterResponse,
  RequestRevisionRequest,
  RequestRevisionResponse,
  ReviewHistoryItem,
  ReviewHistoryResponse,
} from "./editor";

export * from "./author";
export * from "./library";
export * from "./notification";
