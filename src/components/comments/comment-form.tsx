"use client";

import React, { useId } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
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
  const spoilerId = useId();

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
        className={cn(
          "min-h-[96px] resize-y transition-colors",
          isSpoiler &&
            "border-amber-500/40 bg-amber-500/[0.04] focus-visible:border-amber-500/55 focus-visible:ring-amber-500/25 dark:border-amber-400/35 dark:bg-amber-400/[0.05]",
        )}
        aria-describedby={isSpoiler ? spoilerId : undefined}
      />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <label
          htmlFor={spoilerId}
          className={cn(
            "inline-flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm select-none",
            "hover:bg-muted/60 transition-colors",
            isSpoiler &&
              "bg-amber-500/10 text-amber-900 dark:bg-amber-400/10 dark:text-amber-200",
          )}
        >
          <Checkbox
            id={spoilerId}
            checked={isSpoiler}
            onCheckedChange={(checked) => onSpoilerChange(checked === true)}
          />
          <EyeOff
            className={cn(
              "size-3.5 shrink-0",
              isSpoiler
                ? "text-amber-700 dark:text-amber-300"
                : "text-muted-foreground",
            )}
            aria-hidden="true"
          />
          <span>Mark as spoiler</span>
        </label>
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
