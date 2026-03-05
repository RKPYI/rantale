"use client";

import React, { useState } from "react";
import { ImageUpload } from "@/components/ui/image-upload";
import { apiClient } from "@/lib/api-client";
import { handleApiError } from "@/lib/api-client";

export interface NovelCoverUploadProps {
  /** Current cover image URL */
  currentImage?: string | null;
  /** Novel ID (for updating existing novel) */
  novelId?: number;
  /** Callback when cover is uploaded */
  onUploadComplete?: (imageUrl: string) => void;
  /** Custom class name */
  className?: string;
}

export function NovelCoverUpload({
  currentImage,
  novelId,
  onUploadComplete,
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
      // Upload the cover image
      const response = await apiClient.uploadFile<{
        url: string;
        message: string;
      }>(
        novelId ? `/novels/${novelId}/cover` : "/novels/upload-cover",
        file,
        "cover_image",
      );

      setSuccess(response.data.message || "Cover uploaded successfully!");
      onUploadComplete?.(response.data.url);

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

    if (!novelId) {
      // If no novel ID, just clear the preview
      onUploadComplete?.("");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await apiClient.delete(`/novels/${novelId}/cover`);
      setSuccess("Cover deleted successfully!");
      onUploadComplete?.("");

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
      currentImage={currentImage}
      onUpload={handleUpload}
      onDelete={currentImage ? handleDelete : undefined}
      loading={loading}
      error={error}
      success={success}
      aspectRatio="2/3"
      compress={true}
      maxWidth={800}
      className={className}
      showDelete={!!currentImage}
      placeholder="Upload book cover image"
      compact={false}
      enableCrop={true}
      cropShape="rect"
    />
  );
}
