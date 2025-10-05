import { apiClient } from "@/lib/api-client";
import {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  User,
  UpdateProfileRequest,
  ChangePasswordRequest,
  ApiResponse,
} from "@/types/api";

export const authService = {
  // Authentication
  async login(
    credentials: LoginRequest,
    remember: boolean = false,
  ): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(
      "/auth/login",
      credentials,
    );

    // Laravel returns the data directly, not wrapped in { success, data }
    const authData = response.data || (response as unknown as AuthResponse);

    if (authData && authData.token) {
      apiClient.setAuthToken(authData.token, remember);
    }

    return authData;
  },

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(
      "/auth/register",
      userData,
    );

    // Laravel returns the data directly, not wrapped in { success, data }
    const authData = response.data || (response as unknown as AuthResponse);

    if (authData && authData.token) {
      apiClient.setAuthToken(authData.token, true); // Auto-login after registration
    }

    return authData;
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post("/auth/logout");
    } finally {
      // Always remove token even if API call fails
      apiClient.removeAuthToken();
    }
  },

  // Google OAuth
  getGoogleAuthUrl(): string {
    return `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/google`;
  },

  // User Profile
  async getProfile(): Promise<User> {
    const response = await apiClient.get<{ user: User }>("/auth/me");

    // Laravel returns { user: User } directly
    const userData = response.data || (response as unknown as { user: User });

    if (userData && userData.user) {
      return userData.user;
    }

    // Fallback if response format is different
    throw new Error("Invalid user profile response");
  },

  async updateProfile(userData: UpdateProfileRequest): Promise<User> {
    const response = await apiClient.put<{ user: User }>(
      "/auth/profile",
      userData,
    );

    const userResponse =
      response.data || (response as unknown as { user: User });

    if (userResponse && userResponse.user) {
      return userResponse.user;
    }

    throw new Error("Invalid update profile response");
  },

  async changePassword(passwordData: ChangePasswordRequest): Promise<void> {
    await apiClient.put("/auth/change-password", passwordData);
  },

  // Google OAuth
  async getGoogleAuthRedirectUrl(): Promise<string> {
    const response = await apiClient.get<{ url: string }>("/auth/google");
    return response.data.url;
  },

  async handleGoogleCallback(
    code: string,
    state?: string,
  ): Promise<AuthResponse> {
    const params = new URLSearchParams({ code });
    if (state) params.append("state", state);

    const response = await apiClient.get<AuthResponse>(
      `/auth/google/callback?${params.toString()}`,
    );
    const authData = response.data || (response as unknown as AuthResponse);

    if (authData && authData.token) {
      apiClient.setAuthToken(authData.token, true);
    }

    return authData;
  },

  // Email Verification
  async sendEmailVerification(): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>(
      "/auth/email/verification-notification",
    );
    return response.data;
  },

  async resendEmailVerification(): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>(
      "/auth/email/resend-verification",
    );
    return response.data;
  },

  async verifyEmail(id: string, hash: string): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>(
      `/auth/email/verify/${id}/${hash}`,
    );
    return response.data;
  },

  // Update password
  async updatePassword(data: {
    current_password: string;
    new_password: string;
  }): Promise<{ message: string }> {
    const response = await apiClient.put<{ message: string }>(
      "/auth/password",
      data,
    );
    return response.data;
  },

  // Utility methods
  isAuthenticated(): boolean {
    return apiClient.getAuthToken() !== null;
  },

  getAuthToken(): string | null {
    return apiClient.getAuthToken();
  },
};
