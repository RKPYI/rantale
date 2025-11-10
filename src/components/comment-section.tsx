"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { UserAvatar, UserInfo } from "@/components/ui/user-avatar";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { DeleteModal } from "@/components/ui/delete-modal";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Checkbox } from "@/components/ui/checkbox";
import {
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Reply,
  Edit,
  Trash2,
  AlertTriangle,
  Clock,
  Star,
  User,
} from "lucide-react";

import { useNovelComments, useChapterComments } from "@/hooks/use-comments";
import { useAuth } from "@/hooks/use-auth";
import { commentService } from "@/services/comments";
import { useAsync } from "@/hooks/use-api";

import {
  formatCommentTime,
  isCommentEdited,
  getCommentVoteRatio,
  sortComments,
  truncateContent,
  getCommentModifiedText,
} from "@/lib/content-utils";

import {
  Comment,
  CreateCommentRequest,
  UpdateCommentRequest,
} from "@/types/api";
import { AuthModal } from "@/components/auth-modal";

interface CommentSectionProps {
  novelSlug: string;
  novelId: number;
  chapterId?: number;
  title: string;
}

export function CommentSection({
  novelSlug,
  novelId,
  chapterId,
  title,
}: CommentSectionProps) {
  const newCommentRef = useRef<HTMLTextAreaElement | null>(null);
  const replyContentRef = useRef<HTMLTextAreaElement | null>(null);
  const editContentRef = useRef<HTMLTextAreaElement | null>(null);
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [editingComment, setEditingComment] = useState<number | null>(null);
  const [editingCommentContent, setEditingCommentContent] = useState("");
  const [sortBy, setSortBy] = useState<
    "newest" | "oldest" | "popular" | "controversial"
  >("newest");
  const [showSpoilers, setShowSpoilers] = useState(false);
  const [isSpoiler, setIsSpoiler] = useState(false);
  const [isReplyingSpoiler, setIsReplyingSpoiler] = useState(false);
  const [openSpoilers, setOpenSpoilers] = useState<Set<number>>(new Set());
  const [userVotes, setUserVotes] = useState<Map<number, boolean | null>>(
    new Map(),
  );
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState<number | null>(null);

  const { user, isAuthenticated } = useAuth();

  // Fetch comments - use different hooks for novel vs chapter comments
  const novelCommentsResult = useNovelComments(novelSlug);
  const chapterCommentsResult = useChapterComments(novelSlug, chapterId || 0);

  const {
    data: commentsData,
    loading: commentsLoading,
    error: commentsError,
    refetch: refetchComments,
  } = chapterId ? chapterCommentsResult : novelCommentsResult;

  // Async operations
  const { loading: submittingComment, execute: executeCommentAction } =
    useAsync();

  const comments = commentsData?.comments.data || [];
  const totalComments = commentsData?.total_comments_count || 0;
  const sortedComments = sortComments(comments, sortBy);

  // Effect to set textarea content when editing starts
  useEffect(() => {
    if (
      editingComment !== null &&
      editContentRef.current &&
      editingCommentContent
    ) {
      editContentRef.current.value = editingCommentContent;
    }
  }, [editingComment, editingCommentContent]);

  // State to track textarea content for button validation
  const [hasNewCommentContent, setHasNewCommentContent] = useState(false);
  const [hasReplyContent, setHasReplyContent] = useState(false);
  const [hasEditContent, setHasEditContent] = useState(false);

  // Helper functions to validate textarea content
  const hasValidContent = (
    ref: React.RefObject<HTMLTextAreaElement | null>,
  ): boolean => {
    return !!ref.current?.value?.trim();
  };

  const handleNewCommentInput = () => {
    setHasNewCommentContent(hasValidContent(newCommentRef));
  };

  const handleReplyInput = () => {
    setHasReplyContent(hasValidContent(replyContentRef));
  };

  const handleEditInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const content = e.target.value;
    setEditingCommentContent(content);
    setHasEditContent(content.trim().length > 0);
  };

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

  // Create comment
  const handleCreateComment = async (parentId?: number) => {
    const content = parentId
      ? replyContentRef.current?.value || ""
      : newCommentRef.current?.value || "";

    if (!content.trim() || !isAuthenticated) return;

    const commentData: CreateCommentRequest = {
      novel_id: novelId,
      content: content.trim(),
      is_spoiler: parentId ? isReplyingSpoiler : isSpoiler,
      ...(chapterId && { chapter_id: chapterId }),
      ...(parentId && { parent_id: parentId }),
    };

    try {
      await executeCommentAction(commentService.createComment, commentData);
      if (parentId) {
        if (replyContentRef.current) replyContentRef.current.value = "";
        setHasReplyContent(false);
        setIsReplyingSpoiler(false);
      } else {
        if (newCommentRef.current) newCommentRef.current.value = "";
        setHasNewCommentContent(false);
        setIsSpoiler(false);
      }
      setReplyingTo(null);
      refetchComments();
    } catch (error) {
      console.error("Error creating comment:", error);
    }
  };

  // Update comment
  const handleUpdateComment = async (commentId: number) => {
    if (!editingCommentContent.trim()) return;

    const updateData: UpdateCommentRequest = {
      content: editingCommentContent.trim(),
    };

    try {
      await executeCommentAction(
        commentService.updateComment,
        commentId,
        updateData,
      );
      setEditingComment(null);
      setEditingCommentContent("");
      setHasEditContent(false);
      refetchComments();
    } catch (error) {
      console.error("Error updating comment:", error);
    }
  };

  // Delete comment
  const openDeleteModal = (commentId: number) => {
    setCommentToDelete(commentId);
    setDeleteModalOpen(true);
  };

  const handleDeleteComment = async () => {
    if (!commentToDelete) return;

    try {
      await executeCommentAction(commentService.deleteComment, commentToDelete);
      setDeleteModalOpen(false);
      setCommentToDelete(null);
      refetchComments();
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  // Vote on comment
  const handleVoteComment = async (commentId: number, isUpvote: boolean) => {
    if (!isAuthenticated) return;

    try {
      await executeCommentAction(commentService.voteOnComment, commentId, {
        is_upvote: isUpvote,
      });
      // Update local vote state immediately for better UX
      const currentVote = userVotes.get(commentId);
      const newVote = currentVote === isUpvote ? null : isUpvote;
      setUserVotes((prev) => new Map(prev.set(commentId, newVote)));
      refetchComments();
    } catch (error) {
      console.error("Error voting on comment:", error);
    }
  };

  const startEditing = (comment: Comment) => {
    setEditingComment(comment.id);
    setEditingCommentContent(comment.content);
    setHasEditContent(true); // Content is loaded, enable save button
  };

  const cancelEditing = () => {
    setEditingComment(null);
    setEditingCommentContent("");
    setHasEditContent(false);
  };

  const toggleSpoiler = (commentId: number) => {
    setOpenSpoilers((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(commentId)) {
        newSet.delete(commentId);
      } else {
        newSet.add(commentId);
      }
      return newSet;
    });
  };

  // Comment component
  const CommentItem = ({
    comment,
    depth = 0,
  }: {
    comment: Comment;
    depth?: number;
  }) => {
    const isOwner = user?.id === comment.user_id;
    const canEdit = isAuthenticated && (isOwner || user?.is_admin);
    const isEditing = editingComment === comment.id;
    const maxDepth = 3;

    // Handle missing user data
    if (!comment.user) {
      return null;
    }

    return (
      <div
        className={`space-y-3 ${depth > 0 ? "border-muted ml-6 border-l-2 pl-4" : ""}`}
      >
        <Card className="transition-shadow hover:shadow-sm">
          <CardContent className="p-4">
            {/* Comment Header */}
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <UserAvatar user={comment.user} size="md" showBadge={true} />
                <div>
                  <UserInfo
                    user={comment.user}
                    showRole={true}
                    showVerificationStatus={true}
                  />
                  <div className="text-muted-foreground flex items-center gap-2 text-xs">
                    <Clock className="h-3 w-3" />
                    {formatCommentTime(comment.created_at)}
                    {isCommentEdited(comment) && (
                      <span className="text-amber-600 dark:text-amber-400">
                        ({getCommentModifiedText(comment)})
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Comment Actions */}
              {canEdit && (
                <div className="flex items-center gap-1">
                  {!isEditing && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => startEditing(comment)}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => openDeleteModal(comment.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>

            {/* Comment Content */}
            <div className="mb-3">
              {comment.is_spoiler ? (
                <Collapsible
                  open={openSpoilers.has(comment.id)}
                  onOpenChange={() => toggleSpoiler(comment.id)}
                >
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mb-2 w-full justify-start"
                    >
                      <AlertTriangle className="mr-2 h-4 w-4 text-amber-500" />
                      {openSpoilers.has(comment.id)
                        ? "Hide Spoiler"
                        : "Show Spoiler"}
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-2">
                    {isEditing ? (
                      <div className="space-y-2">
                        <Textarea
                          ref={editContentRef}
                          value={editingCommentContent}
                          placeholder="Edit your comment..."
                          rows={3}
                          onChange={handleEditInput}
                        />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleUpdateComment(comment.id)}
                            disabled={!hasEditContent || submittingComment}
                          >
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={cancelEditing}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <p className="rounded border border-amber-200 bg-amber-50 p-3 text-sm whitespace-pre-wrap dark:border-amber-800 dark:bg-amber-950">
                        {comment.content}
                      </p>
                    )}
                  </CollapsibleContent>
                </Collapsible>
              ) : isEditing ? (
                <div className="space-y-2">
                  <Textarea
                    ref={editContentRef}
                    value={editingCommentContent}
                    placeholder="Edit your comment..."
                    rows={3}
                    onChange={handleEditInput}
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleUpdateComment(comment.id)}
                      disabled={!hasEditContent || submittingComment}
                    >
                      Save
                    </Button>
                    <Button size="sm" variant="outline" onClick={cancelEditing}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
              )}

              {comment.is_spoiler && (
                <Badge variant="outline" className="mt-2 text-xs">
                  <AlertTriangle className="mr-1 h-3 w-3" />
                  Spoiler
                </Badge>
              )}
            </div>

            {/* Comment Footer */}
            {!isEditing && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* Vote buttons */}
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant={
                        userVotes.get(comment.id) === true ? "default" : "ghost"
                      }
                      onClick={() => handleVoteComment(comment.id, true)}
                      disabled={!isAuthenticated || submittingComment}
                      className={
                        userVotes.get(comment.id) === true
                          ? "bg-primary text-primary-foreground"
                          : ""
                      }
                    >
                      <ThumbsUp
                        className={`h-3 w-3 ${userVotes.get(comment.id) === true ? "text-primary-foreground" : ""}`}
                      />
                      {comment.likes}
                    </Button>
                    <Button
                      size="sm"
                      variant={
                        userVotes.get(comment.id) === false
                          ? "default"
                          : "ghost"
                      }
                      onClick={() => handleVoteComment(comment.id, false)}
                      disabled={!isAuthenticated || submittingComment}
                      className={
                        userVotes.get(comment.id) === false
                          ? "bg-destructive text-destructive-foreground"
                          : ""
                      }
                    >
                      <ThumbsDown
                        className={`h-3 w-3 ${userVotes.get(comment.id) === false ? "text-destructive-foreground" : ""}`}
                      />
                      {comment.dislikes}
                    </Button>
                  </div>

                  {/* Reply button */}
                  {depth < maxDepth && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        if (replyingTo === comment.id) {
                          setReplyingTo(null);
                          if (replyContentRef.current)
                            replyContentRef.current.value = "";
                          setHasReplyContent(false);
                          setIsReplyingSpoiler(false);
                        } else {
                          setReplyingTo(comment.id);
                          // Clear the reply textarea when starting a new reply
                          if (replyContentRef.current)
                            replyContentRef.current.value = "";
                          setHasReplyContent(false);
                        }
                      }}
                      disabled={!isAuthenticated}
                    >
                      <Reply className="h-3 w-3" />
                      Reply
                    </Button>
                  )}
                </div>

                {/* Vote ratio indicator */}
                {comment.likes + comment.dislikes > 0 && (
                  <div className="text-muted-foreground text-xs">
                    {Math.round(getCommentVoteRatio(comment))}% positive
                  </div>
                )}
              </div>
            )}

            {/* Reply form */}
            {replyingTo === comment.id && (
              <div className="mt-3 space-y-2 border-t pt-3">
                <Textarea
                  ref={replyContentRef}
                  placeholder="Write a reply..."
                  rows={3}
                  onChange={handleReplyInput}
                />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id={`reply-spoiler-${comment.id}`}
                      checked={isReplyingSpoiler}
                      onCheckedChange={(checked) =>
                        setIsReplyingSpoiler(checked === true)
                      }
                    />
                    <label
                      htmlFor={`reply-spoiler-${comment.id}`}
                      className="cursor-pointer text-sm"
                    >
                      This reply contains spoilers
                    </label>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleCreateComment(comment.id)}
                      disabled={!hasReplyContent || submittingComment}
                    >
                      Reply
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setReplyingTo(null);
                        if (replyContentRef.current)
                          replyContentRef.current.value = "";
                        setHasReplyContent(false);
                        setIsReplyingSpoiler(false);
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="space-y-3">
            {comment.replies.map((reply) => (
              <CommentItem key={reply.id} comment={reply} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    );
  };

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
                  setSortBy(e.target.value as typeof sortBy)
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
            <div className="space-y-3">
              <Textarea
                ref={newCommentRef}
                placeholder="Share your thoughts about this novel/chapter..."
                rows={4}
                onChange={handleNewCommentInput}
              />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="spoiler-warning"
                    checked={isSpoiler}
                    onCheckedChange={(checked) =>
                      setIsSpoiler(checked === true)
                    }
                  />
                  <label
                    htmlFor="spoiler-warning"
                    className="cursor-pointer text-sm"
                  >
                    This comment contains spoilers
                  </label>
                </div>
                <Button
                  onClick={() => handleCreateComment()}
                  disabled={!hasNewCommentContent || submittingComment}
                >
                  {submittingComment ? "Posting..." : "Post Comment"}
                </Button>
              </div>
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
            <CommentItem key={comment.id} comment={comment} />
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
        onConfirm={handleDeleteComment}
        title="Delete Comment?"
        description="Are you sure you want to delete this comment? This action cannot be undone."
        confirmText="Delete Comment"
        isLoading={submittingComment}
      />
    </div>
  );
}
