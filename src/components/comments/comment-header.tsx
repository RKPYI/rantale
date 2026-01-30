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

      {canEdit && (
        <div className="flex items-center gap-1">
          {!isEditing && (
            <Button size="sm" variant="ghost" onClick={onStartEdit}>
              <Edit className="h-3 w-3" />
            </Button>
          )}
          <Button size="sm" variant="ghost" onClick={onDelete}>
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      )}
    </div>
  );
}
