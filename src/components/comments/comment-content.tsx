"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { AlertTriangle } from "lucide-react";
import { CommentContentProps } from "./types";

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
  if (comment.is_spoiler) {
    return (
      <div className="mb-3">
        <Collapsible open={isSpoilerOpen} onOpenChange={onToggleSpoiler}>
          <CollapsibleTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="mb-2 w-full justify-start"
            >
              <AlertTriangle className="mr-2 h-4 w-4 text-amber-500" />
              {isSpoilerOpen ? "Hide Spoiler" : "Show Spoiler"}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-2">
            {isEditing ? (
              <div className="space-y-2">
                <Textarea
                  value={editContent}
                  onChange={(e) => onEditContentChange(e.target.value)}
                  placeholder="Edit your comment..."
                  rows={3}
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
            ) : (
              <p className="rounded border border-amber-200 bg-amber-50 p-3 text-sm whitespace-pre-wrap dark:border-amber-800 dark:bg-amber-950">
                {comment.content}
              </p>
            )}
          </CollapsibleContent>
        </Collapsible>
        <Badge variant="outline" className="mt-2 text-xs">
          <AlertTriangle className="mr-1 h-3 w-3" />
          Spoiler
        </Badge>
      </div>
    );
  }

  return (
    <div className="mb-3">
      {isEditing ? (
        <div className="space-y-2">
          <Textarea
            value={editContent}
            onChange={(e) => onEditContentChange(e.target.value)}
            placeholder="Edit your comment..."
            rows={3}
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
      ) : (
        <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
      )}
    </div>
  );
}
