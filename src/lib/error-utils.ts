/**
 * Error Handling Utilities
 * Centralized error handling to eliminate duplicate error parsing code
 */

import { toast } from "sonner";

/**
 * ApiError structure from api-client
 */
export interface ApiError {
  success: false;
  error: string;
  details?: Record<string, string[]>;
  statusCode?: number;
  rawData?: unknown;
}

/**
 * Extract error message from various error types
 * Handles ApiError, Error instances, and unknown errors
 */
export function getErrorMessage(
  error: unknown,
  fallbackMessage = "An unexpected error occurred",
): string {
  // Handle ApiError from api-client
  if (error && typeof error === "object" && "error" in error) {
    const apiError = error as ApiError;
    return apiError.error || fallbackMessage;
  }

  // Handle standard Error instances
  if (error instanceof Error) {
    return error.message;
  }

  // Fallback for unknown error types
  return fallbackMessage;
}

/**
 * Handle error with toast notification
 * Extracts error message and displays toast
 */
export function handleErrorWithToast(
  error: unknown,
  fallbackMessage = "An unexpected error occurred",
): string {
  const errorMessage = getErrorMessage(error, fallbackMessage);
  toast.error(errorMessage);
  return errorMessage;
}

/**
 * Log error and show toast notification
 * Useful for catch blocks
 */
export function logAndToastError(
  error: unknown,
  context: string,
  fallbackMessage?: string,
): string {
  console.error(`${context}:`, error);
  return handleErrorWithToast(error, fallbackMessage);
}

/**
 * Extract validation errors from ApiError
 * Returns field-level validation errors
 */
export function getValidationErrors(
  error: unknown,
): Record<string, string[]> | null {
  if (error && typeof error === "object" && "details" in error) {
    const apiError = error as ApiError;
    return apiError.details || null;
  }

  // Also check rawData.errors for Laravel validation errors
  if (
    error &&
    typeof error === "object" &&
    "rawData" in error &&
    error.rawData &&
    typeof error.rawData === "object" &&
    "errors" in error.rawData
  ) {
    return error.rawData.errors as Record<string, string[]>;
  }

  return null;
}

/**
 * Check if error has validation errors
 */
export function hasValidationErrors(error: unknown): boolean {
  return getValidationErrors(error) !== null;
}

/**
 * Format validation errors for display
 */
export function formatValidationErrors(
  errors: Record<string, string[]>,
): string {
  return Object.entries(errors)
    .map(([field, messages]) => `${field}: ${messages.join(", ")}`)
    .join("; ");
}

/**
 * Handle error with state setters (common pattern in components)
 */
export function handleErrorWithState(
  error: unknown,
  setError: (message: string) => void,
  fallbackMessage?: string,
): void {
  const errorMessage = getErrorMessage(error, fallbackMessage);
  setError(errorMessage);
  toast.error(errorMessage);
}
