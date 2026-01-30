"use client";

import React, { useState } from "react";
import { novelService } from "@/services/novels";
import { ImageUpload } from "@/components/ui/image-upload";
import { Novel } from "@/types/api";
import { handleApiError } from "@/lib/api-client";

export interface NovelCoverUploadProps {
  /** Novel data */
  novel: Novel;
  /** Callback when cover is updated */
  onUpdate?: (novel: Novel) => void;
  /** Custom class name */
  className?: string;
}

export function NovelCoverUpload({
  novel,
  onUpdate,
  className,
}: NovelCoverUploadProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleUpload = async (file: File) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await novelService.uploadNovelCover(novel.slug, file);
      setSuccess(result.message);
      onUpdate?.(result.novel);

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this cover image?")) {
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await novelService.deleteNovelCover(novel.slug);
      setSuccess(result.message);
      onUpdate?.(result.novel);

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageUpload
      currentImage={novel.cover_image}
      onUpload={handleUpload}
      onDelete={novel.cover_image ? handleDelete : undefined}
      loading={loading}
      error={error}
      success={success}
      aspectRatio="2/3"
      compress={true}
      maxWidth={800}
      className={className}
      showDelete={!!novel.cover_image}
      placeholder="Upload novel cover image"
      compact={true}
    />
  );
}
