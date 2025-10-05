/**
 * User and Authentication Types
 * Types related to user accounts, authentication, and authorization
 */

// User Entity
export interface User {
  id: number;
  name: string;
  email: string;
  email_verified_at: string | null;
  email_verified: boolean;
  role: number; // 0=user, 1=author, 2=moderator, 3=admin
  provider?: string; // email|google
  provider_id?: string | null;
  avatar: string | null;
  bio: string | null;
  is_admin: boolean;
  last_login_at?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

// Authentication Responses
export interface AuthResponse {
  message: string;
  user: User;
  token: string;
  verification_notice?: string;
}

export interface GoogleAuthResponse {
  url: string;
}

// Authentication Requests
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export interface EmailVerificationRequest {
  id: string;
  hash: string;
}

// Profile Management
export interface UpdateProfileRequest {
  name?: string;
  email?: string;
  avatar?: string;
  bio?: string;
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
  new_password_confirmation: string;
}
