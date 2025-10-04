"use client";

import { commentService } from '@/services/comments';
import {
  Comment,
  CommentsResponse,
  CreateCommentRequest,
  UpdateCommentRequest,
  VoteCommentRequest,
  CommentVote,
  AdminCommentsResponse
} from '@/types/api';
import { useApi } from './use-api';

// Hook for getting novel comments
export function useNovelComments(novelSlug: string, page?: number) {
  return useApi(
    () => commentService.getNovelComments(novelSlug, page),
    [novelSlug, page]
  );
}

// Hook for getting chapter comments
export function useChapterComments(novelSlug: string, chapterId: number, page?: number) {
  return useApi(
    () => commentService.getChapterComments(novelSlug, chapterId, page),
    [novelSlug, chapterId, page]
  );
}

// Hook for creating comments (use refetch to call)
export function useCreateComment() {
  return useApi(
    () => Promise.resolve(null), // Use refetch with commentService.createComment
    []
  );
}

// Hook for updating comments (use refetch to call)
export function useUpdateComment() {
  return useApi(
    () => Promise.resolve(null), // Use refetch with commentService.updateComment
    []
  );
}

// Hook for deleting comments (use refetch to call)
export function useDeleteComment() {
  return useApi(
    () => Promise.resolve(null), // Use refetch with commentService.deleteComment
    []
  );
}

// Hook for voting on comments (use refetch to call)
export function useVoteOnComment() {
  return useApi(
    () => Promise.resolve(null), // Use refetch with commentService.voteOnComment
    []
  );
}

// Hook for getting user's vote on a comment
export function useUserVoteOnComment(commentId: number) {
  return useApi(
    () => commentService.getUserVoteOnComment(commentId),
    [commentId]
  );
}

// Admin hook for getting all comments
export function useAllComments(page?: number) {
  return useApi(
    () => commentService.getAllComments(page),
    [page]
  );
}

// Admin hook for toggling comment approval (use refetch to call)
export function useToggleCommentApproval() {
  return useApi(
    () => Promise.resolve(null), // Use refetch with commentService.toggleCommentApproval
    []
  );
}