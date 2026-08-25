"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { UserAvatar, UserInfo } from "@/components/ui/user-avatar";
import { Clock, Edit, Trash2 } from "lucide-react";
import {
  formatCommentTime,
  isCommentEdited,
  getCommentModifiedText,
} from "@/lib/content-utils";
import { CommentHeaderProps } from "./types";

export function CommentHeader({
  comment,
  canEdit,
  isEditing,
  onStartEdit,
  onDelete,
}: CommentHeaderProps) {
  return (
    <div className="mb-2 flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <UserAvatar user={comment.user} size="sm" showBadge={true} />
        <div>
          <UserInfo
            user={comment.user}
            showRole={true}
            showVerificationStatus={false}
          />
          <div className="text-muted-foreground flex items-center gap-2 text-xs leading-none">
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

      {canEdit && (
        <div className="flex items-center gap-1">
          {!isEditing && (
            <Button
              size="icon"
              variant="ghost"
              onClick={onStartEdit}
              className="h-8 w-8"
              aria-label="Edit comment"
            >
              <Edit className="h-3 w-3" />
            </Button>
          )}
          <Button
            size="icon"
            variant="ghost"
            onClick={onDelete}
            className="h-8 w-8"
            aria-label="Delete comment"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      )}
    </div>
  );
}
