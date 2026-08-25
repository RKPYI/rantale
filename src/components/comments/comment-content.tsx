"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { CommentContentProps } from "./types";

function EditForm({
  editContent,
  onEditContentChange,
  onSubmitEdit,
  onCancelEdit,
  isSubmitting,
}: Pick<
  CommentContentProps,
  | "editContent"
  | "onEditContentChange"
  | "onSubmitEdit"
  | "onCancelEdit"
  | "isSubmitting"
>) {
  return (
    <div className="space-y-2">
      <Textarea
        value={editContent}
        onChange={(e) => onEditContentChange(e.target.value)}
        placeholder="Edit your comment..."
        rows={3}
        className="min-h-[84px] resize-y"
      />
      <div className="flex gap-2">
        <Button
          size="sm"
          onClick={onSubmitEdit}
          disabled={!editContent.trim() || isSubmitting}
        >
          Save
        </Button>
        <Button size="sm" variant="outline" onClick={onCancelEdit}>
          Cancel
        </Button>
      </div>
    </div>
  );
}

export function CommentContent({
  comment,
  isEditing,
  isSpoilerOpen,
  editContent,
  onEditContentChange,
  onSubmitEdit,
  onCancelEdit,
  onToggleSpoiler,
  isSubmitting,
}: CommentContentProps) {
  if (isEditing) {
    return (
      <div className="mb-3">
        <EditForm
          editContent={editContent}
          onEditContentChange={onEditContentChange}
          onSubmitEdit={onSubmitEdit}
          onCancelEdit={onCancelEdit}
          isSubmitting={isSubmitting}
        />
      </div>
    );
  }

  if (comment.is_spoiler) {
    return (
      <div className="mb-3">
        {!isSpoilerOpen ? (
          <button
            type="button"
            onClick={onToggleSpoiler}
            aria-expanded={false}
            aria-label="Reveal spoiler comment"
            className={cn(
              "group border-amber-500/30 bg-amber-500/[0.06] text-foreground",
              "hover:border-amber-500/45 hover:bg-amber-500/[0.1]",
              "focus-visible:ring-amber-500/40 dark:border-amber-400/25 dark:bg-amber-400/[0.07]",
              "dark:hover:border-amber-400/40 dark:hover:bg-amber-400/[0.12]",
              "flex w-full items-center gap-3 rounded-md border px-3.5 py-3.5 text-left",
              "transition-colors focus-visible:ring-2 focus-visible:outline-none",
            )}
          >
            <span className="bg-amber-500/15 text-amber-700 dark:bg-amber-400/15 dark:text-amber-300 flex size-9 shrink-0 items-center justify-center rounded-md">
              <EyeOff className="size-4" aria-hidden="true" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-medium">Spoiler hidden</span>
              <span className="text-muted-foreground mt-0.5 block text-xs">
                Tap to reveal this comment
              </span>
            </span>
            <span className="text-amber-800/80 group-hover:bg-amber-500/15 dark:text-amber-200/90 dark:group-hover:bg-amber-400/15 rounded-md px-2.5 py-1 text-xs font-medium transition-colors">
              Reveal
            </span>
          </button>
        ) : (
          <div
            className={cn(
              "border-amber-500/25 bg-amber-500/[0.04] dark:border-amber-400/20 dark:bg-amber-400/[0.05]",
              "rounded-md border",
            )}
          >
            <div className="flex items-center justify-between gap-2 px-3 pt-2.5 pb-1.5">
              <span className="text-amber-800 dark:text-amber-300 flex items-center gap-1.5 text-xs font-medium">
                <Eye className="size-3.5" aria-hidden="true" />
                Spoiler
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onToggleSpoiler}
                aria-expanded={true}
                aria-label="Hide spoiler comment"
                className="text-muted-foreground hover:text-foreground h-7 px-2 text-xs"
              >
                <EyeOff className="size-3.5" aria-hidden="true" />
                Hide
              </Button>
            </div>
            <p className="text-foreground px-3 pt-0.5 pb-3 text-sm whitespace-pre-wrap">
              {comment.content}
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="mb-3">
      <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
    </div>
  );
}
