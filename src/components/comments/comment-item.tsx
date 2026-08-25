"use client";

import React, { useState, useEffect, memo } from "react";
import { Button } from "@/components/ui/button";
import { CornerDownRight } from "lucide-react";
import { CommentItemProps } from "./types";
import { CommentHeader } from "./comment-header";
import { CommentContent } from "./comment-content";
import { CommentActions } from "./comment-actions";
import { CommentForm } from "./comment-form";

const CommentItemComponent = ({
  comment,
  depth = 0,
  userId,
  isAdmin = false,
  userVotes,
  openSpoilers,
  collapsedReplies,
  replyingTo,
  editingComment,
  onStartReply,
  onCancelReply,
  onSubmitReply,
  onStartEdit,
  onCancelEdit,
  onSubmitEdit,
  onDelete,
  onVote,
  onToggleSpoiler,
  onToggleRepliesCollapsed,
  isSubmitting,
}: CommentItemProps) => {
  const [replyContent, setReplyContent] = useState("");
  const [replyIsSpoiler, setReplyIsSpoiler] = useState(false);
  const [editContent, setEditContent] = useState("");

  const isOwner = userId === comment.user_id;
  const canEdit = userId && (isOwner || isAdmin);
  const isEditing = editingComment === comment.id;
  const isReplying = replyingTo === comment.id;
  const maxDepth = 5; // Allow deeper nesting
  const maxVisualDepth = 3; // But limit visual indentation to 3 levels
  const repliesCollapsed = collapsedReplies.has(comment.id);

  // Initialize edit content when editing starts
  useEffect(() => {
    if (isEditing) {
      setEditContent(comment.content);
    }
  }, [isEditing, comment.content]);

  // Handle missing user data
  if (!comment.user) {
    return null;
  }

  const handleSubmitReply = () => {
    if (replyContent.trim()) {
      onSubmitReply(comment.id, replyContent, replyIsSpoiler);
      setReplyContent("");
      setReplyIsSpoiler(false);
    }
  };

  const handleCancelReply = () => {
    onCancelReply();
    setReplyContent("");
    setReplyIsSpoiler(false);
  };

  const handleSubmitEdit = () => {
    if (editContent.trim()) {
      onSubmitEdit(comment.id, editContent);
      setEditContent("");
    }
  };

  const handleCancelEdit = () => {
    onCancelEdit();
    setEditContent("");
  };

  // Calculate visual depth (cap at maxVisualDepth to prevent excessive indentation)
  const visualDepth = Math.min(depth, maxVisualDepth);
  // Show thread indicator for deep comments
  const isDeepComment = depth > maxVisualDepth;

  return (
    <div
      className={`space-y-3 ${
        visualDepth > 0
          ? `border-muted/60 ml-3 border-l pl-3 md:ml-5 md:pl-4 ${isDeepComment ? "border-dashed" : ""}`
          : ""
      }`}
    >
      {/* Deep thread indicator */}
      {isDeepComment && (
        <div className="text-muted-foreground mb-2 flex items-center gap-2 text-xs">
          <div className="bg-muted h-px flex-1"></div>
          <span className="italic">Thread continues (Level {depth})</span>
          <div className="bg-muted h-px flex-1"></div>
        </div>
      )}

      <article className="border-border/70 rounded-md border bg-transparent p-3 sm:p-4">
        <CommentHeader
          comment={comment}
          canEdit={!!canEdit}
          isEditing={isEditing}
          onStartEdit={() => onStartEdit(comment)}
          onDelete={() => onDelete(comment.id)}
        />

        <CommentContent
          comment={comment}
          isEditing={isEditing}
          isSpoilerOpen={openSpoilers.has(comment.id)}
          editContent={editContent}
          onEditContentChange={setEditContent}
          onSubmitEdit={handleSubmitEdit}
          onCancelEdit={handleCancelEdit}
          onToggleSpoiler={() => onToggleSpoiler(comment.id)}
          isSubmitting={isSubmitting}
        />

        <CommentActions
          comment={comment}
          userId={userId}
          userVote={userVotes.get(comment.id) ?? null}
          depth={depth}
          maxDepth={maxDepth}
          isEditing={isEditing}
          isReplying={isReplying}
          onVote={(isUpvote) => onVote(comment.id, isUpvote)}
          onToggleReply={() => {
            if (isReplying) {
              handleCancelReply();
            } else {
              onStartReply(comment.id);
            }
          }}
          isSubmitting={isSubmitting}
        />

        {/* Reply form */}
        {isReplying && (
          <div className="border-border/60 mt-3 border-t pt-3">
            <CommentForm
              value={replyContent}
              onChange={setReplyContent}
              onSubmit={handleSubmitReply}
              onCancel={handleCancelReply}
              isSpoiler={replyIsSpoiler}
              onSpoilerChange={setReplyIsSpoiler}
              placeholder="Write a reply..."
              submitText="Reply"
              isSubmitting={isSubmitting}
              autoFocus={true}
              showCancel={true}
            />
          </div>
        )}
      </article>

      {/* Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="space-y-3">
          {/* Collapse/Expand button for all replies */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onToggleRepliesCollapsed(comment.id)}
            className="text-muted-foreground hover:text-foreground -ml-1 h-7 gap-2 px-1 text-xs"
          >
            <CornerDownRight className="h-3 w-3" />
            {repliesCollapsed
              ? `Show ${comment.replies.length} ${comment.replies.length === 1 ? "reply" : "replies"}`
              : `Hide ${comment.replies.length} ${comment.replies.length === 1 ? "reply" : "replies"}`}
          </Button>

          {/* Render replies (collapsed or expanded) */}
          {!repliesCollapsed &&
            comment.replies.map((reply) => (
              <CommentItem
                key={reply.id}
                comment={reply}
                depth={depth + 1}
                userId={userId}
                isAdmin={isAdmin}
                userVotes={userVotes}
                openSpoilers={openSpoilers}
                collapsedReplies={collapsedReplies}
                replyingTo={replyingTo}
                editingComment={editingComment}
                onStartReply={onStartReply}
                onCancelReply={onCancelReply}
                onSubmitReply={onSubmitReply}
                onStartEdit={onStartEdit}
                onCancelEdit={onCancelEdit}
                onSubmitEdit={onSubmitEdit}
                onDelete={onDelete}
                onVote={onVote}
                onToggleSpoiler={onToggleSpoiler}
                onToggleRepliesCollapsed={onToggleRepliesCollapsed}
                isSubmitting={isSubmitting}
              />
            ))}
        </div>
      )}
    </div>
  );
};

export const CommentItem = memo(CommentItemComponent);
CommentItem.displayName = "CommentItem";
