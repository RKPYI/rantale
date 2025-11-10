/**
 * Chapter Download Button Component
 * Allows users to download chapters for offline reading
 */

"use client";

import { Download, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useOfflineChapter } from "@/hooks/use-offline-chapter";
import type { Chapter } from "@/types/api";

export interface ChapterDownloadButtonProps {
  chapter: Chapter;
  novelTitle?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  showLabel?: boolean;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function ChapterDownloadButton({
  chapter,
  novelTitle,
  variant = "outline",
  size = "sm",
  showLabel = true,
  onSuccess,
  onError,
}: ChapterDownloadButtonProps) {
  const { isDownloaded, isDownloading, downloadChapter, removeChapter } =
    useOfflineChapter(chapter.id);

  const handleDownload = async () => {
    try {
      await downloadChapter(chapter, novelTitle);
      onSuccess?.();
    } catch (error) {
      onError?.(error instanceof Error ? error : new Error("Download failed"));
    }
  };

  const handleRemove = async () => {
    try {
      await removeChapter();
      onSuccess?.();
    } catch (error) {
      onError?.(error instanceof Error ? error : new Error("Remove failed"));
    }
  };

  if (isDownloading) {
    return (
      <Button variant={variant} size={size} disabled>
        <Loader2 className="h-4 w-4 animate-spin" />
        {showLabel && <span className="ml-2">Downloading...</span>}
      </Button>
    );
  }

  if (isDownloaded) {
    return (
      <Button
        variant={variant}
        size={size}
        onClick={handleRemove}
        title="Click to remove offline copy"
      >
        <Check className="h-4 w-4 text-green-600" />
        {showLabel && <span className="ml-2">Downloaded</span>}
      </Button>
    );
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleDownload}
      title="Download for offline reading"
    >
      <Download className="h-4 w-4" />
      {showLabel && <span className="ml-2">Download</span>}
    </Button>
  );
}

/**
 * Compact icon-only version
 */
export function ChapterDownloadIcon({
  chapter,
  novelTitle,
  onSuccess,
  onError,
}: Omit<ChapterDownloadButtonProps, "variant" | "size" | "showLabel">) {
  return (
    <ChapterDownloadButton
      chapter={chapter}
      novelTitle={novelTitle}
      variant="ghost"
      size="icon"
      showLabel={false}
      onSuccess={onSuccess}
      onError={onError}
    />
  );
}
