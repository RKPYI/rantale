"use client";

import { useState } from "react";
import { contactService } from "@/services/contact";
import {
  ContactRequest,
  UserContactsResponse,
  UserContactResponse,
} from "@/types/api";
import { useApi } from "./use-api";

/**
 * Hook for managing contact form submission
 */
export function useContact() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string[]>
  >({});
  const [success, setSuccess] = useState(false);

  const submitContact = async (data: ContactRequest) => {
    setLoading(true);
    setError(null);
    setValidationErrors({});
    setSuccess(false);

    try {
      const response = await contactService.submit(data);
      setSuccess(true);
      return response;
    } catch (err: any) {
      // Handle validation errors from Laravel
      // The API client throws ApiError with rawData containing the full response
      if (err.rawData?.errors) {
        setValidationErrors(err.rawData.errors);
        setError(
          err.rawData.message || "Validation failed. Please check the form.",
        );
      } else if (err.details) {
        // Fallback: if errors are mapped to 'details'
        setValidationErrors(err.details);
        setError(err.error || "Validation failed. Please check the form.");
      } else {
        const errorMessage =
          err.error ||
          err.message ||
          "Failed to send message. Please try again.";
        setError(errorMessage);
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setError(null);
    setValidationErrors({});
    setSuccess(false);
    setLoading(false);
  };

  return {
    submitContact,
    loading,
    error,
    validationErrors,
    success,
    reset,
  };
}

/**
 * Hook for fetching user's contact history
 */
export function useMyContacts(page?: number, status?: string) {
  return useApi<UserContactsResponse>(
    () => contactService.getMyContacts(page, status),
    [page, status],
  );
}

/**
 * Hook for fetching specific user contact
 */
export function useMyContact(contactId: number) {
  return useApi<UserContactResponse>(
    () => contactService.getMyContact(contactId),
    [contactId],
  );
}
