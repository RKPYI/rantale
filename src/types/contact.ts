/**
 * Contact Form Types
 */

import type { PaginatedResponse } from "./common";

// Request payload for submitting contact form
export interface ContactRequest {
  name: string;
  email: string;
  subject: string;
  message: string;
}

// Response from contact submission
export interface ContactResponse {
  success: boolean;
  message: string;
}

// Validation error response
export interface ContactValidationError {
  success: false;
  message: string;
  errors: {
    [key: string]: string[];
  };
}

// User's contact message
export interface UserContact {
  id: number;
  user_id: number | null;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: "new" | "read" | "replied";
  admin_response: string | null;
  responded_at: string | null;
  created_at: string;
  updated_at: string;
}

// User contacts response
export interface UserContactsResponse {
  message: string;
  contacts: PaginatedResponse<UserContact>;
}

// Single contact response
export interface UserContactResponse {
  message: string;
  contact: UserContact;
}
