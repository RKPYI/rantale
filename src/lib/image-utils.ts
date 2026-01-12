/**
 * Image Upload Utilities
 * Reusable functions for image validation, compression, and preview generation
 */

// Supported image types
export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/jpg",
  "image/gif",
  "image/webp",
] as const;

// Max file size in bytes (5MB)
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

// Image validation error types
export interface ImageValidationError {
  type: "size" | "format" | "dimensions";
  message: string;
}

/**
 * Validate image file
 * @param file - The file to validate
 * @returns Array of validation errors (empty if valid)
 */
export function validateImageFile(file: File): ImageValidationError[] {
  const errors: ImageValidationError[] = [];

  // Check file type
  if (
    !ALLOWED_IMAGE_TYPES.includes(
      file.type as (typeof ALLOWED_IMAGE_TYPES)[number],
    )
  ) {
    errors.push({
      type: "format",
      message: "Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.",
    });
  }

  // Check file size
  if (file.size > MAX_IMAGE_SIZE) {
    errors.push({
      type: "size",
      message: `File size must be less than ${MAX_IMAGE_SIZE / 1024 / 1024}MB.`,
    });
  }

  return errors;
}

/**
 * Generate preview URL from file
 * @param file - The image file
 * @returns Promise that resolves to data URL
 */
export function generatePreview(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      if (e.target?.result) {
        resolve(e.target.result as string);
      } else {
        reject(new Error("Failed to read file"));
      }
    };

    reader.onerror = () => {
      reject(new Error("Failed to read file"));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Compress image before upload
 * @param file - The original image file
 * @param maxWidth - Maximum width (default: 1000px)
 * @param quality - JPEG quality (default: 0.9)
 * @returns Promise that resolves to compressed file
 */
export function compressImage(
  file: File,
  maxWidth: number = 1000,
  quality: number = 0.9,
): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions
        if (width > maxWidth) {
          height *= maxWidth / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Failed to get canvas context"));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(
                new File([blob], file.name, {
                  type: "image/jpeg",
                  lastModified: Date.now(),
                }),
              );
            } else {
              reject(new Error("Failed to compress image"));
            }
          },
          "image/jpeg",
          quality,
        );
      };

      img.onerror = () => {
        reject(new Error("Failed to load image"));
      };

      img.src = e.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error("Failed to read file"));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Get image dimensions
 * @param file - The image file
 * @returns Promise that resolves to { width, height }
 */
export function getImageDimensions(
  file: File,
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        resolve({ width: img.width, height: img.height });
      };

      img.onerror = () => {
        reject(new Error("Failed to load image"));
      };

      img.src = e.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error("Failed to read file"));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Format file size for display
 * @param bytes - File size in bytes
 * @returns Formatted string (e.g., "2.5 MB")
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}

/**
 * Build image URL with base URL
 * @param path - Relative image path from API
 * @returns Full image URL
 */
export function buildImageUrl(path: string | null): string | null {
  if (!path) return null;

  // If already a full URL, return as is
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  // Build with API base URL
  const baseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
  const cleanPath = path.startsWith("/") ? path : `/${path}`;

  return `${baseUrl}${cleanPath}`;
}
