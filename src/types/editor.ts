/**
 * Editor Workflow Types
 * Types related to the editorial workflow for chapter publishing
 */

import { PaginatedResponse } from "./common";
import { User } from "./user";

// Chapter Status
export type ChapterStatus =
  | "draft"
  | "pending_review"
  | "approved"
  | "revision_requested"
  | "pending_update";

// Chapter Review Actions
export type ChapterReviewAction = "approved" | "revision_requested";

// Review Info attached to chapters
export interface ChapterReview {
  id: number;
  chapter_id: number;
  action: ChapterReviewAction;
  notes: string | null;
  created_at: string;
  editor?: {
    id: number;
    name: string;
  };
}

// Extended chapter summary with workflow info (for author view)
export interface AuthorChapterWithStatus {
  id: number;
  title: string;
  chapter_number: number;
  word_count: number;
  status: ChapterStatus;
  reviewed_at: string | null;
  created_at: string;
  published_at: string | null;
  volume_id?: number | null;
  volume_number?: number | null;
  latest_review: ChapterReview | null;
  pending_title: string | null;
  pending_content: string | null;
}

// Author chapters response
export interface AuthorChaptersResponse {
  message: string;
  uses_volumes?: boolean;
  novel: {
    id: number;
    title: string;
    slug: string;
    author: string;
  };
  chapters: AuthorChapterWithStatus[];
  volumes?: import("./novel").VolumeSummary[];
}

// Chapter workflow stats (part of author stats)
export interface ChapterWorkflowStats {
  pending_review: number;
  revision_requested: number;
  approved: number;
  draft: number;
}

// Editor Statistics
export interface EditorStats {
  pending_review: number;
  my_reviews_today: number;
  my_reviews_this_week: number;
  my_total_reviews: number;
  approvals_today: number;
  revisions_requested_today: number;
}

export interface EditorStatsResponse {
  message: string;
  stats: EditorStats;
}

// Claim info attached to pending chapters
export interface ChapterClaimInfo {
  is_claimed: boolean;
  is_claimed_by_me: boolean;
  can_review: boolean;
  claimed_by_editor: string | null;
}

// Pending chapter for editor review
export interface PendingChapter {
  id: number;
  title: string;
  chapter_number: number;
  volume_number?: number | null;
  word_count: number;
  status: ChapterStatus;
  created_at: string;
  novel: {
    id: number;
    title: string;
    slug: string;
    author: string;
    uses_volumes?: boolean;
    user: {
      id: number;
      name: string;
    };
  };
  // Claim system fields
  is_claimed: boolean;
  is_claimed_by_me: boolean;
  can_review: boolean;
  claimed_by_editor: string | null;
}

// Claimed chapter (from /editor/my-claimed-chapters)
export interface ClaimedChapter {
  id: number;
  title: string;
  chapter_number: number;
  volume_number?: number | null;
  word_count: number;
  status: ChapterStatus;
  created_at: string;
  novel: {
    id: number;
    title: string;
    slug: string;
    author: string;
    uses_volumes?: boolean;
    user: {
      id: number;
      name: string;
    };
  };
  claim_expires_at: string;
  claim_hours_remaining: number;
}

// Claimed chapters response
export interface ClaimedChaptersResponse {
  message: string;
  chapters: ClaimedChapter[];
}

// Claim/unclaim response
export interface ClaimChapterResponse {
  message: string;
}

export interface UnclaimChapterResponse {
  message: string;
}

export interface PendingChaptersResponse {
  message: string;
  chapters: PaginatedResponse<PendingChapter>;
}

// Chapter details for editor review
export interface ChapterForReview {
  id: number;
  title: string;
  content: string;
  chapter_number: number;
  word_count: number;
  status: ChapterStatus;
  created_at: string;
  novel: {
    id: number;
    title: string;
    slug: string;
    author: string;
    user_id: number;
    user: User;
  };
  reviews: ChapterReview[];
  reviewer: User | null;
  pending_title: string | null;
  pending_content: string | null;
}

export interface ChapterForReviewResponse {
  message: string;
  chapter: ChapterForReview;
}

// Approve chapter request/response
export interface ApproveChapterRequest {
  notes?: string;
}

export interface ApproveChapterResponse {
  message: string;
  chapter: {
    id: number;
    title: string;
    status: "approved";
    published_at: string;
    reviewed_at: string;
    novel: {
      id: number;
      title: string;
      slug: string;
    };
    reviewer: {
      id: number;
      name: string;
    };
  };
}

// Request revision request/response
export interface RequestRevisionRequest {
  notes: string;
}

export interface RequestRevisionResponse {
  message: string;
  chapter: {
    id: number;
    title: string;
    status: "revision_requested";
    reviewed_at: string;
    novel: {
      id: number;
      title: string;
      slug: string;
    };
    reviewer: {
      id: number;
      name: string;
    };
    latest_review: ChapterReview;
  };
}

// Submit for review response
export interface SubmitForReviewResponse {
  message: string;
  chapter: {
    id: number;
    status: "pending_review";
  };
}

// Review history item
export interface ReviewHistoryItem {
  id: number;
  chapter_id: number;
  action: ChapterReviewAction;
  notes: string | null;
  created_at: string;
  chapter: {
    id: number;
    title: string;
    chapter_number: number;
    volume_number?: number | null;
    novel_id: number;
    novel: {
      id: number;
      title: string;
      slug: string;
      uses_volumes?: boolean;
    };
  };
}

export interface ReviewHistoryResponse {
  message: string;
  reviews: PaginatedResponse<ReviewHistoryItem>;
}
