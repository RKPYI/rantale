"use client";

import React, { useState, useRef } from "react";
import { Upload, X, Image as ImageIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  validateImageFile,
  generatePreview,
  compressImage,
  formatFileSize,
  buildImageUrl,
} from "@/lib/image-utils";
import { Button } from "./button";
import { ImageCropper } from "./image-cropper";

export interface ImageUploadProps {
  /** Current image URL */
  currentImage?: string | null;
  /** Callback when file is selected and validated */
  onFileSelect?: (file: File) => void;
  /** Callback when upload is triggered */
  onUpload?: (file: File) => Promise<void>;
  /** Callback when delete is triggered */
  onDelete?: () => Promise<void>;
  /** Whether the component is in loading state */
  loading?: boolean;
  /** Error message to display */
  error?: string | null;
  /** Success message to display */
  success?: string | null;
  /** Aspect ratio for preview (e.g., "1/1" for square, "2/3" for book cover) */
  aspectRatio?: string;
  /** Whether to compress images before upload */
  compress?: boolean;
  /** Maximum width for compression */
  maxWidth?: number;
  /** Custom class name */
  className?: string;
  /** Show delete button */
  showDelete?: boolean;
  /** Accept attribute for file input */
  accept?: string;
  /** Placeholder text */
  placeholder?: string;
  /** Compact mode for smaller displays */
  compact?: boolean;
  /** Enable image cropping before upload */
  enableCrop?: boolean;
  /** Crop shape (rect or round) */
  cropShape?: "rect" | "round";
}

export function ImageUpload({
  currentImage,
  onFileSelect,
  onUpload,
  onDelete,
  loading = false,
  error = null,
  success = null,
  aspectRatio = "1/1",
  compress = true,
  maxWidth = 1000,
  className,
  showDelete = true,
  accept = "image/*",
  placeholder = "Click to upload an image",
  compact = false,
  enableCrop = true,
  cropShape = "rect",
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(
    buildImageUrl(currentImage ?? null) || null,
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showCropper, setShowCropper] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Calculate numeric aspect ratio for cropper
  const numericAspect = aspectRatio.includes("/")
    ? eval(aspectRatio)
    : parseFloat(aspectRatio);

  const handleFileChange = async (file: File | null) => {
    if (!file) return;

    // Validate file
    const errors = validateImageFile(file);
    if (errors.length > 0) {
      setValidationError(errors[0].message);
      return;
    }

    setValidationError(null);

    try {
      // Generate preview for cropper
      const previewUrl = await generatePreview(file);

      if (enableCrop) {
        // Show cropper
        setImageToCrop(previewUrl);
        setShowCropper(true);
      } else {
        // Skip cropping, compress if needed
        const fileToUse = compress ? await compressImage(file, maxWidth) : file;
        setPreview(previewUrl);
        setSelectedFile(fileToUse);
        onFileSelect?.(fileToUse);
      }
    } catch (err) {
      setValidationError("Failed to process image");
      console.error("Image processing error:", err);
    }
  };

  const handleCropComplete = async (croppedBlob: Blob) => {
    try {
      // Convert blob to file
      const croppedFile = new File(
        [croppedBlob],
        selectedFile?.name || "cropped-image.jpg",
        { type: "image/jpeg" },
      );

      // Compress if needed
      const fileToUse = compress
        ? await compressImage(croppedFile, maxWidth)
        : croppedFile;

      // Generate preview
      const previewUrl = await generatePreview(fileToUse);
      setPreview(previewUrl);
      setSelectedFile(fileToUse);
      setShowCropper(false);
      setImageToCrop(null);

      // Notify parent
      onFileSelect?.(fileToUse);
    } catch (err) {
      setValidationError("Failed to process cropped image");
      console.error("Crop processing error:", err);
      setShowCropper(false);
    }
  };

  const handleCropCancel = () => {
    setShowCropper(false);
    setImageToCrop(null);
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    handleFileChange(file || null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileChange(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleUploadClick = async () => {
    if (!selectedFile || !onUpload) return;

    try {
      await onUpload(selectedFile);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err) {
      // Error is handled by parent
      console.error("Upload error:", err);
    }
  };

  const handleDeleteClick = async () => {
    if (!onDelete) return;

    try {
      await onDelete();
      setPreview(null);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err) {
      // Error is handled by parent
      console.error("Delete error:", err);
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const displayError = validationError || error;

  return (
    <>
      <div className={cn("space-y-3", compact && "space-y-2", className)}>
        {/* Preview Area */}
        <div
          className={cn(
            "relative overflow-hidden rounded-lg border-2 border-dashed transition-colors",
            compact ? "min-h-[160px]" : "min-h-[200px]",
            isDragging
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/25 hover:border-muted-foreground/50",
            displayError && "border-destructive",
          )}
          style={{ aspectRatio }}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          {preview ? (
            <div className="relative h-full w-full">
              <img
                src={preview}
                alt="Preview"
                className="h-full w-full object-cover"
              />
              {showDelete && !loading && (
                <Button
                  type="button"
                  size="icon"
                  variant="destructive"
                  className="absolute top-2 right-2"
                  onClick={handleDeleteClick}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ) : (
            <div
              className={cn(
                "flex h-full cursor-pointer flex-col items-center justify-center gap-2 p-6 text-center",
                compact && "gap-1 p-4",
              )}
              onClick={handleBrowseClick}
            >
              <ImageIcon
                className={cn(
                  "text-muted-foreground/50 h-12 w-12",
                  compact && "h-8 w-8",
                )}
              />
              <p
                className={cn(
                  "text-muted-foreground text-sm",
                  compact && "text-xs",
                )}
              >
                {placeholder}
              </p>
              <p
                className={cn(
                  "text-muted-foreground/75 text-xs",
                  compact && "hidden",
                )}
              >
                or drag and drop
              </p>
            </div>
          )}

          {loading && (
            <div className="bg-background/80 absolute inset-0 flex items-center justify-center">
              <Loader2 className="text-primary h-8 w-8 animate-spin" />
            </div>
          )}
        </div>

        {/* File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleInputChange}
          className="hidden"
          disabled={loading}
        />

        {/* Action Buttons */}
        <div className={cn("flex gap-2", compact && "flex-col sm:flex-row")}>
          <Button
            type="button"
            variant="outline"
            onClick={handleBrowseClick}
            disabled={loading}
            className="flex-1"
            size={compact ? "sm" : "default"}
          >
            <Upload className={cn("mr-2 h-4 w-4", compact && "h-3 w-3")} />
            Choose File
          </Button>

          {selectedFile && onUpload && (
            <Button
              type="button"
              onClick={handleUploadClick}
              disabled={loading}
              className="flex-1"
              size={compact ? "sm" : "default"}
            >
              {loading ? (
                <>
                  <Loader2
                    className={cn(
                      "mr-2 h-4 w-4 animate-spin",
                      compact && "h-3 w-3",
                    )}
                  />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload
                    className={cn("mr-2 h-4 w-4", compact && "h-3 w-3")}
                  />
                  Upload
                </>
              )}
            </Button>
          )}
        </div>

        {/* File Info */}
        {selectedFile && (
          <div
            className={cn(
              "text-muted-foreground text-xs",
              compact && "text-[10px]",
            )}
          >
            {selectedFile.name} ({formatFileSize(selectedFile.size)})
          </div>
        )}

        {/* Messages */}
        {displayError && (
          <div
            className={cn(
              "bg-destructive/10 text-destructive rounded-md p-3 text-sm",
              compact && "p-2 text-xs",
            )}
          >
            {displayError}
          </div>
        )}

        {success && (
          <div
            className={cn(
              "rounded-md bg-green-500/10 p-3 text-sm text-green-600 dark:text-green-400",
              compact && "p-2 text-xs",
            )}
          >
            {success}
          </div>
        )}
      </div>

      {/* Image Cropper Dialog */}
      {imageToCrop && (
        <ImageCropper
          image={imageToCrop}
          aspect={numericAspect}
          cropShape={cropShape}
          open={showCropper}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
          title="Crop Your Image"
          description="Adjust the crop area, zoom, and rotation to your liking"
        />
      )}
    </>
  );
}
