"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { ThumbsUp, ThumbsDown, Reply } from "lucide-react";
import { getCommentVoteRatio } from "@/lib/content-utils";
import { CommentActionsProps } from "./types";

export function CommentActions({
  comment,
  userId,
  userVote,
  depth,
  maxDepth,
  isEditing,
  isReplying,
  onVote,
  onToggleReply,
  isSubmitting,
}: CommentActionsProps) {
  if (isEditing) {
    return null;
  }
  const canReply = depth < Math.min(maxDepth, 2);

  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <div className="flex items-center gap-2">
        {/* Vote buttons */}
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant={userVote === true ? "secondary" : "ghost"}
            onClick={() => onVote(true)}
            disabled={!userId || isSubmitting}
            className="h-8 px-2"
          >
            <ThumbsUp className="h-3 w-3" />
            <span className="text-xs">{comment.likes}</span>
          </Button>
          <Button
            size="sm"
            variant={userVote === false ? "secondary" : "ghost"}
            onClick={() => onVote(false)}
            disabled={!userId || isSubmitting}
            className="h-8 px-2"
          >
            <ThumbsDown className="h-3 w-3" />
            <span className="text-xs">{comment.dislikes}</span>
          </Button>
        </div>

        {/* Reply button - only show for top-level (depth 0) and first-level (depth 1) comments */}
        {canReply && (
          <Button
            size="sm"
            variant="ghost"
            onClick={onToggleReply}
            disabled={!userId}
            className="h-8 px-2"
          >
            <Reply className="h-3 w-3" />
            <span className="text-xs">{isReplying ? "Cancel" : "Reply"}</span>
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
  );
}
