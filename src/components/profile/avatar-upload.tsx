"use client";

import React, { useState } from "react";
import { authService } from "@/services/auth";
import { ImageUpload } from "@/components/ui/image-upload";
import { User } from "@/types/api";
import { handleApiError } from "@/lib/api-client";

export interface AvatarUploadProps {
  /** Current user data */
  user: User;
  /** Callback when avatar is updated */
  onUpdate?: (user: User) => void;
  /** Custom class name */
  className?: string;
}

export function AvatarUpload({ user, onUpdate, className }: AvatarUploadProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleUpload = async (file: File) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await authService.uploadAvatar(file);
      setSuccess(result.message);
      onUpdate?.(result.user);

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete your avatar?")) {
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await authService.deleteAvatar();
      setSuccess(result.message);
      onUpdate?.(result.user);

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
      currentImage={user.avatar}
      onUpload={handleUpload}
      onDelete={user.avatar ? handleDelete : undefined}
      loading={loading}
      error={error}
      success={success}
      aspectRatio="1/1"
      compress={true}
      maxWidth={400}
      className={className}
      showDelete={!!user.avatar}
      placeholder="Upload your profile picture"
      compact={true}
    />
  );
}
