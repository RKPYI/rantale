"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { CommentFormProps } from "./types";

export function CommentForm({
  value,
  onChange,
  onSubmit,
  onCancel,
  isSpoiler,
  onSpoilerChange,
  placeholder = "Write a comment...",
  submitText = "Post Comment",
  isSubmitting = false,
  autoFocus = false,
  showCancel = false,
}: CommentFormProps) {
  const handleSubmit = () => {
    if (value.trim()) {
      onSubmit();
    }
  };

  return (
    <div className="space-y-3">
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={showCancel ? 3 : 4}
        autoFocus={autoFocus}
        className="min-h-[96px] resize-y"
      />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Checkbox
            id={`spoiler-${showCancel ? "reply" : "comment"}`}
            checked={isSpoiler}
            onCheckedChange={(checked) => onSpoilerChange(checked === true)}
          />
          <label
            htmlFor={`spoiler-${showCancel ? "reply" : "comment"}`}
            className="cursor-pointer text-sm"
          >
            This comment contains spoilers
          </label>
        </div>
        <div className="flex items-center justify-end gap-2">
          {showCancel && onCancel && (
            <Button size="sm" variant="ghost" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button
            onClick={handleSubmit}
            disabled={!value.trim() || isSubmitting}
            size={showCancel ? "sm" : "default"}
          >
            {isSubmitting ? "Posting..." : submitText}
          </Button>
        </div>
      </div>
    </div>
  );
}
