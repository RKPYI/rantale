/**
 * Comment System Types
 * Types related to comments, replies, and comment voting
 */

import type { PaginatedResponse } from "./common";
import type { User } from "./user";

// Comment Entity
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

// Comment Voting
export interface CommentVote {
  is_upvote: boolean;
  created_at: string;
}

// Bulk Votes Response
export interface BulkVotesResponse {
  [commentId: string]: {
    vote: CommentVote | null;
  };
}

// API Responses
export interface CommentsResponse {
  comments: PaginatedResponse<Comment>;
  total_comments_count: number;
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

// Request Types
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
