"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { UserAvatar, UserInfo } from "@/components/ui/user-avatar";
import { Clock, Edit, EyeOff, Trash2 } from "lucide-react";
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
    <div className="mb-2 flex items-center justify-between gap-2">
      <div className="flex min-w-0 items-center gap-2">
        <UserAvatar user={comment.user} size="sm" showBadge={true} />
        <div className="min-w-0">
          <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
            <UserInfo
              user={comment.user}
              showRole={true}
              showVerificationStatus={false}
              compact
            />
            {comment.is_spoiler && (
              <span className="bg-amber-500/10 text-amber-800 dark:bg-amber-400/10 dark:text-amber-300 inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-medium tracking-wide uppercase">
                <EyeOff className="size-2.5" aria-hidden="true" />
                Spoiler
              </span>
            )}
          </div>
          <div className="text-muted-foreground mt-0.5 flex items-center gap-1.5 text-[11px] leading-none">
            <Clock className="h-3 w-3 shrink-0" />
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
