/**
 * Editor Workflow Types
 * Types related to the editorial workflow for chapter review
 * Based on EDITOR_WORKFLOW_FRONTEND_GUIDE.md
 */

import { PaginatedResponse } from "./common";

// Chapter statuses in the review workflow
export type ChapterReviewStatus =
  | "draft"
  | "pending_review"
  | "approved"
  | "revision_requested"
  | "pending_update";

// Review action types
export type ReviewAction = "approved" | "revision_requested";

// ---------------------
// Stats
// ---------------------

export interface EditorStats {
  pending_review: number;
  available_to_claim: number;
  my_claimed_chapters: number;
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

// ---------------------
// Group Info
// ---------------------

export interface EditorGroupMember {
  id: number;
  name: string;
  username: string;
  email: string;
  user_role: string;
  group_role: "editor" | "author";
  joined_at: string;
}

export interface EditorGroupInfo {
  id: number;
  name: string;
  tag: string;
  description: string | null;
  created_at: string;
  member_count: number;
  pending_chapters_from_group: number;
  members: EditorGroupMember[];
}

export interface EditorGroupInfoResponse {
  message: string;
  group: EditorGroupInfo | null;
}

// ---------------------
// Pending Chapters
// ---------------------

export interface PendingChapter {
  id: number;
  title: string;
  chapter_number: number;
  status: ChapterReviewStatus;
  word_count: number;
  created_at: string;
  novel: {
    id: number;
    title: string;
    slug: string;
    author: string;
  };
  claimed_by_editor: { id: number; name: string } | null;
  is_claimed: boolean;
  is_claimed_by_me: boolean;
  can_review: boolean;
}

export interface PendingChaptersResponse {
  message: string;
  chapters: PaginatedResponse<PendingChapter>;
}

// ---------------------
// My Claimed Chapters
// ---------------------

export interface ClaimedChapter {
  id: number;
  title: string;
  chapter_number: number;
  status: ChapterReviewStatus;
  claimed_at: string;
  claim_expires_at: string;
  claim_hours_remaining: number;
  novel: {
    id: number;
    title: string;
    slug: string;
    author: string;
  };
}

export interface ClaimedChaptersResponse {
  message: string;
  chapters: ClaimedChapter[];
}

// ---------------------
// Chapter Detail (for review)
// ---------------------

export interface ChapterReviewRecord {
  id: number;
  action: ReviewAction;
  notes: string | null;
  created_at: string;
  editor: {
    id: number;
    name: string;
  };
}

export interface ChapterDetail {
  id: number;
  title: string;
  content: string;
  chapter_number: number;
  word_count: number;
  status: ChapterReviewStatus;
  pending_title: string | null;
  pending_content: string | null;
  claimed_by: number | null;
  claimed_at: string | null;
  claim_expires_at: string | null;
  novel: {
    id: number;
    title: string;
    slug: string;
    author: string;
    user_id: number;
  };
  reviews: ChapterReviewRecord[];
  reviewer: { id: number; name: string } | null;
  claimed_by_editor: { id: number; name: string } | null;
}

export interface EditorChapterDetailResponse {
  message: string;
  chapter: ChapterDetail;
}

// ---------------------
// Claim / Unclaim
// ---------------------

export interface ClaimChapterResponse {
  message: string;
  chapter: PendingChapter;
  claim_expires_at: string;
}

export interface UnclaimChapterResponse {
  message: string;
}

// ---------------------
// Approve / Request Revision
// ---------------------

export interface ApproveChapterRequest {
  notes?: string;
}

export interface ApproveChapterResponse {
  message: string;
  chapter: ChapterDetail;
}

export interface RequestRevisionRequest {
  notes: string;
}

export interface RequestRevisionResponse {
  message: string;
  chapter: ChapterDetail;
}

// ---------------------
// Review History
// ---------------------

export interface ReviewHistoryItem {
  id: number;
  action: ReviewAction;
  notes: string | null;
  created_at: string;
  chapter: {
    id: number;
    title: string;
    chapter_number: number;
    novel_id: number;
  };
}

export interface ReviewHistoryResponse {
  message: string;
  reviews: PaginatedResponse<ReviewHistoryItem>;
}
