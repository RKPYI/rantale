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

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        {/* Vote buttons */}
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant={userVote === true ? "default" : "ghost"}
            onClick={() => onVote(true)}
            disabled={!userId || isSubmitting}
            className={
              userVote === true ? "bg-primary text-primary-foreground" : ""
            }
          >
            <ThumbsUp
              className={`h-3 w-3 ${userVote === true ? "text-primary-foreground" : ""}`}
            />
            {comment.likes}
          </Button>
          <Button
            size="sm"
            variant={userVote === false ? "default" : "ghost"}
            onClick={() => onVote(false)}
            disabled={!userId || isSubmitting}
            className={
              userVote === false
                ? "bg-destructive text-destructive-foreground"
                : ""
            }
          >
            <ThumbsDown
              className={`h-3 w-3 ${userVote === false ? "text-destructive-foreground" : ""}`}
            />
            {comment.dislikes}
          </Button>
        </div>

        {/* Reply button - only show for top-level (depth 0) and first-level (depth 1) comments */}
        {depth < 2 && (
          <Button
            size="sm"
            variant="ghost"
            onClick={onToggleReply}
            disabled={!userId}
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
  );
}
