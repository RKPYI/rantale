"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DeleteModal } from "@/components/ui/delete-modal";
import { MessageSquare } from "lucide-react";

import { useNovelComments, useChapterComments } from "@/hooks/use-comments";
import { useAuth } from "@/contexts/auth-context";
import { commentService } from "@/services/comments";
import { useAsync } from "@/hooks/use-api";

import { sortComments } from "@/lib/content-utils";

import {
  Comment,
  CreateCommentRequest,
  UpdateCommentRequest,
} from "@/types/api";
import { AuthModal } from "@/components/auth-modal";

import { CommentItem } from "./comment-item";
import { CommentForm } from "./comment-form";
import { CommentSectionProps, SortOption } from "./types";

export function CommentSection({
  novelSlug,
  novelId,
  chapterId,
  chapterNumber,
  title,
}: CommentSectionProps) {
  const [newComment, setNewComment] = useState("");
  const [isSpoiler, setIsSpoiler] = useState(false);
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [editingComment, setEditingComment] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [openSpoilers, setOpenSpoilers] = useState<Set<number>>(new Set());
  const [collapsedReplies, setCollapsedReplies] = useState<Set<number>>(
    new Set(),
  );
  const [userVotes, setUserVotes] = useState<Map<number, boolean | null>>(
    new Map(),
  );
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState<number | null>(null);

  // Track which comment IDs we've already initialized in collapsed state
  const initializedCommentIds = useRef<Set<number>>(new Set());
  // Track which comments should be force-expanded (e.g., after user replies)
  const forceExpandedComments = useRef<Set<number>>(new Set());

  const { user, isAuthenticated, loading: authLoading } = useAuth();

  // Fetch comments - use different hooks for novel vs chapter comments
  const novelCommentsResult = useNovelComments(novelSlug);
  const chapterCommentsResult = useChapterComments(
    novelSlug,
    chapterNumber || 0,
  );

  const {
    data: commentsData,
    loading: commentsLoading,
    error: commentsError,
    refetch: refetchComments,
    silentRefetch: silentRefetchComments,
  } = chapterNumber ? chapterCommentsResult : novelCommentsResult;

  // Async operations
  const { loading: submittingComment, execute: executeCommentAction } =
    useAsync();

  const comments = commentsData?.comments.data || [];
  const totalComments = commentsData?.total_comments_count || 0;
  const sortedComments = sortComments(comments, sortBy);

  // Initialize collapsed state for new comments (default to collapsed)
  useEffect(() => {
    if (comments.length > 0) {
      const newCommentIds: number[] = [];

      const collectCommentIds = (commentList: Comment[]) => {
        commentList.forEach((comment) => {
          if (comment.replies && comment.replies.length > 0) {
            // Only add if we haven't seen this comment ID before
            if (!initializedCommentIds.current.has(comment.id)) {
              newCommentIds.push(comment.id);
              initializedCommentIds.current.add(comment.id);
            }
            collectCommentIds(comment.replies);
          }
        });
      };

      collectCommentIds(comments);

      // Only update state if there are new comments
      if (newCommentIds.length > 0) {
        setCollapsedReplies((prev) => {
          const newSet = new Set(prev);
          newCommentIds.forEach((id) => {
            // Don't collapse if it's marked as force-expanded (e.g., user just replied to it)
            if (!forceExpandedComments.current.has(id)) {
              newSet.add(id); // Default to collapsed for new comments
            }
          });
          return newSet;
        });
      }
    }
  }, [comments]);

  // Fetch user votes for all comments when comments load
  useEffect(() => {
    if (isAuthenticated && comments.length > 0) {
      const fetchAllUserVotes = async () => {
        const commentIds: number[] = [];

        // Collect all comment IDs (including replies)
        const collectCommentIds = (commentList: Comment[]) => {
          commentList.forEach((comment) => {
            commentIds.push(comment.id);
            if (comment.replies && comment.replies.length > 0) {
              collectCommentIds(comment.replies);
            }
          });
        };

        collectCommentIds(comments);

        // Fetch votes for all comments in a single request
        try {
          const bulkVotes = await commentService.getBulkUserVotes(commentIds);
          const newVotesMap = new Map<number, boolean | null>();

          for (const [id, vote] of Object.entries(bulkVotes)) {
            const commentId = parseInt(id, 10);
            newVotesMap.set(commentId, vote?.is_upvote ?? null);
          }

          setUserVotes(newVotesMap);
        } catch (error) {
          console.error("Error fetching bulk user votes:", error);
          // Set all votes to null on error
          const fallbackVotes = new Map<number, boolean | null>();
          commentIds.forEach((id) => fallbackVotes.set(id, null));
          setUserVotes(fallbackVotes);
        }
      };

      fetchAllUserVotes();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [comments, isAuthenticated]);

  // Memoized callback functions to prevent unnecessary re-renders
  const handleStartReply = useCallback((commentId: number) => {
    setReplyingTo(commentId);
  }, []);

  const handleCancelReply = useCallback(() => {
    setReplyingTo(null);
  }, []);

  const handleSubmitReply = useCallback(
    async (parentId: number, content: string, isSpoilerReply: boolean) => {
      if (!content.trim() || !isAuthenticated) return;

      const commentData: CreateCommentRequest = {
        novel_id: novelId,
        content: content.trim(),
        is_spoiler: isSpoilerReply,
        parent_id: parentId,
        ...(chapterId && { chapter_id: chapterId }),
      };

      try {
        await executeCommentAction(commentService.createComment, commentData);
        setReplyingTo(null);

        // Mark this comment as force-expanded so it won't be collapsed when new data arrives
        forceExpandedComments.current.add(parentId);

        // Automatically expand the parent comment's replies so user can see their new reply
        setCollapsedReplies((prev) => {
          const newSet = new Set(prev);
          newSet.delete(parentId); // Remove from collapsed set to expand
          return newSet;
        });

        silentRefetchComments();
      } catch (error) {
        console.error("Error creating reply:", error);
      }
    },
    [
      isAuthenticated,
      novelId,
      chapterId,
      executeCommentAction,
      silentRefetchComments,
    ],
  );

  const handleStartEdit = useCallback((comment: Comment) => {
    setEditingComment(comment.id);
  }, []);

  const handleCancelEdit = useCallback(() => {
    setEditingComment(null);
  }, []);

  const handleSubmitEdit = useCallback(
    async (commentId: number, content: string) => {
      if (!content.trim()) return;

      const updateData: UpdateCommentRequest = {
        content: content.trim(),
      };

      try {
        await executeCommentAction(
          commentService.updateComment,
          commentId,
          updateData,
        );
        setEditingComment(null);
        silentRefetchComments();
      } catch (error) {
        console.error("Error updating comment:", error);
      }
    },
    [executeCommentAction, silentRefetchComments],
  );

  const handleDelete = useCallback((commentId: number) => {
    setCommentToDelete(commentId);
    setDeleteModalOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!commentToDelete) return;

    try {
      await executeCommentAction(commentService.deleteComment, commentToDelete);
      setDeleteModalOpen(false);
      setCommentToDelete(null);
      silentRefetchComments();
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  }, [commentToDelete, executeCommentAction, silentRefetchComments]);

  const handleVote = useCallback(
    async (commentId: number, isUpvote: boolean) => {
      if (!isAuthenticated) return;

      try {
        await executeCommentAction(commentService.voteOnComment, commentId, {
          is_upvote: isUpvote,
        });
        // Update local vote state immediately for better UX
        const currentVote = userVotes.get(commentId);
        const newVote = currentVote === isUpvote ? null : isUpvote;
        setUserVotes((prev) => new Map(prev.set(commentId, newVote)));

        // Silent background refetch to update vote counts without flickering
        silentRefetchComments();
      } catch (error) {
        console.error("Error voting on comment:", error);
      }
    },
    [isAuthenticated, userVotes, executeCommentAction, silentRefetchComments],
  );

  const handleToggleSpoiler = useCallback((commentId: number) => {
    setOpenSpoilers((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(commentId)) {
        newSet.delete(commentId);
      } else {
        newSet.add(commentId);
      }
      return newSet;
    });
  }, []);

  const handleToggleRepliesCollapsed = useCallback((commentId: number) => {
    setCollapsedReplies((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(commentId)) {
        newSet.delete(commentId);
      } else {
        newSet.add(commentId);
      }
      return newSet;
    });
  }, []);

  const handleCreateComment = useCallback(async () => {
    if (!newComment.trim() || !isAuthenticated) return;

    const commentData: CreateCommentRequest = {
      novel_id: novelId,
      content: newComment.trim(),
      is_spoiler: isSpoiler,
      ...(chapterId && { chapter_id: chapterId }),
    };

    try {
      await executeCommentAction(commentService.createComment, commentData);
      setNewComment("");
      setIsSpoiler(false);
      silentRefetchComments();
    } catch (error) {
      console.error("Error creating comment:", error);
    }
  }, [
    newComment,
    isAuthenticated,
    novelId,
    isSpoiler,
    chapterId,
    executeCommentAction,
    silentRefetchComments,
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Comments for {title}
          </CardTitle>
          <div className="text-muted-foreground flex items-center justify-between text-sm">
            <span>{totalComments} comments</span>
            <div className="flex items-center gap-2">
              <label className="text-xs">Sort by:</label>
              <select
                value={sortBy}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  setSortBy(e.target.value as SortOption)
                }
                className="rounded border px-2 py-1 text-xs"
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="popular">Most Popular</option>
                <option value="controversial">Controversial</option>
              </select>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* New comment form */}
      {isAuthenticated ? (
        <Card>
          <CardContent className="p-4">
            <CommentForm
              value={newComment}
              onChange={setNewComment}
              onSubmit={handleCreateComment}
              isSpoiler={isSpoiler}
              onSpoilerChange={setIsSpoiler}
              placeholder="Share your thoughts about this novel/chapter..."
              submitText="Post Comment"
              isSubmitting={submittingComment}
            />
          </CardContent>
        </Card>
      ) : authLoading ? (
        <Card>
          <CardContent className="space-y-3 p-4">
            {/* Textarea skeleton */}
            <Skeleton className="h-24 w-full rounded-md" />

            {/* Checkbox + button row skeleton */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4 rounded-sm" /> {/* checkbox */}
                <Skeleton className="h-4 w-40" /> {/* label */}
              </div>
              <Skeleton className="h-9 w-28 rounded-md" /> {/* button */}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-muted-foreground mb-3">
              Please sign in to leave a comment
            </p>
            <AuthModal
              trigger={<Button variant="outline">Sign In</Button>}
              onSuccess={refetchComments}
            />
          </CardContent>
        </Card>
      )}

      {/* Comments List */}
      {commentsLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="animate-pulse space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="bg-muted h-8 w-8 rounded-full"></div>
                    <div className="bg-muted h-4 w-24 rounded"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="bg-muted h-4 w-full rounded"></div>
                    <div className="bg-muted h-4 w-3/4 rounded"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : commentsError ? (
        <Card>
          <CardContent className="p-4 text-center">
            <p className="mb-3 text-red-500">
              Error loading comments: {commentsError}
            </p>
            <Button variant="outline" onClick={refetchComments}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      ) : sortedComments.length > 0 ? (
        <div className="space-y-4">
          {sortedComments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              userId={user?.id}
              isAdmin={user?.is_admin}
              userVotes={userVotes}
              openSpoilers={openSpoilers}
              collapsedReplies={collapsedReplies}
              replyingTo={replyingTo}
              editingComment={editingComment}
              onStartReply={handleStartReply}
              onCancelReply={handleCancelReply}
              onSubmitReply={handleSubmitReply}
              onStartEdit={handleStartEdit}
              onCancelEdit={handleCancelEdit}
              onSubmitEdit={handleSubmitEdit}
              onDelete={handleDelete}
              onVote={handleVote}
              onToggleSpoiler={handleToggleSpoiler}
              onToggleRepliesCollapsed={handleToggleRepliesCollapsed}
              isSubmitting={submittingComment}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <MessageSquare className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
            <h3 className="mb-2 font-medium">No comments yet</h3>
            <p className="text-muted-foreground">
              Be the first to share your thoughts!
            </p>
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        onConfirm={handleConfirmDelete}
        title="Delete Comment?"
        description="Are you sure you want to delete this comment? This action cannot be undone."
        confirmText="Delete Comment"
        isLoading={submittingComment}
      />
    </div>
  );
}
