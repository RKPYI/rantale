"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { authService } from "@/services/auth";
import { User, UpdateProfileRequest } from "@/types/api";
import { handleApiError } from "@/lib/api-client";

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

interface AuthActions {
  login: (
    email: string,
    password: string,
    remember?: boolean,
  ) => Promise<boolean>;
  register: (
    name: string,
    email: string,
    password: string,
    passwordConfirmation: string,
  ) => Promise<{
    success: boolean;
    needsVerification?: boolean;
    message?: string;
  }>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateProfile: (data: UpdateProfileRequest) => Promise<boolean>;
  clearError: () => void;
  sendEmailVerification: () => Promise<boolean>;
  resendEmailVerification: () => Promise<boolean>;
}

type AuthContextType = AuthState & AuthActions;

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize auth state on mount
  useEffect(() => {
    const initAuth = async () => {
      if (!authService.isAuthenticated()) {
        setLoading(false);
        return;
      }

      try {
        const profile = await authService.getProfile();
        setUser(profile);
      } catch (err) {
        // Token might be invalid, remove it
        authService.logout();
        setError(handleApiError(err));
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = useCallback(
    async (
      email: string,
      password: string,
      remember: boolean = false,
    ): Promise<boolean> => {
      try {
        setLoading(true);
        setError(null);

        console.log("🔐 Attempting login...");
        const authResponse = await authService.login(
          { email, password },
          remember,
        );

        console.log("✅ Login response:", authResponse);

        if (!authResponse || !authResponse.user) {
          throw new Error("Invalid authentication response: missing user data");
        }

        setUser(authResponse.user);

        return true;
      } catch (err) {
        console.error("❌ Login error:", err);
        setError(handleApiError(err));
        return false;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const register = useCallback(
    async (
      name: string,
      email: string,
      password: string,
      passwordConfirmation: string,
    ): Promise<{
      success: boolean;
      needsVerification?: boolean;
      message?: string;
    }> => {
      try {
        setLoading(true);
        setError(null);

        const authResponse = await authService.register({
          name,
          email,
          password,
          password_confirmation: passwordConfirmation,
        });

        // Registration successful with token - auto login
        setUser(authResponse.user);

        return {
          success: true,
          needsVerification: !authResponse.user.email_verified,
          message: authResponse.verification_notice || authResponse.message,
        };
      } catch (err) {
        setError(handleApiError(err));
        return { success: false };
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const logout = useCallback(async (): Promise<void> => {
    try {
      await authService.logout();
    } catch (err) {
      // Log error but don't block logout
      console.error("Logout error:", err);
    } finally {
      setUser(null);
      setError(null);
    }
  }, []);

  const refreshProfile = useCallback(async (): Promise<void> => {
    if (!authService.isAuthenticated()) {
      setUser(null);
      return;
    }

    try {
      setLoading(true);
      const profile = await authService.getProfile();
      setUser(profile);
      setError(null);
    } catch (err) {
      setError(handleApiError(err));
      // If profile fetch fails, token might be invalid
      authService.logout();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProfile = useCallback(
    async (data: UpdateProfileRequest): Promise<boolean> => {
      try {
        setLoading(true);
        setError(null);

        const updatedUser = await authService.updateProfile(data);
        setUser(updatedUser);

        return true;
      } catch (err) {
        setError(handleApiError(err));
        return false;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const sendEmailVerification = useCallback(async (): Promise<boolean> => {
    try {
      await authService.sendEmailVerification();
      return true;
    } catch (err) {
      setError(handleApiError(err));
      return false;
    }
  }, []);

  const resendEmailVerification = useCallback(async (): Promise<boolean> => {
    try {
      await authService.resendEmailVerification();
      return true;
    } catch (err) {
      setError(handleApiError(err));
      return false;
    }
  }, []);

  const value: AuthContextType = {
    // State
    user,
    loading,
    error,
    isAuthenticated: !!user && authService.isAuthenticated(),

    // Actions
    login,
    register,
    logout,
    refreshProfile,
    updateProfile,
    clearError,
    sendEmailVerification,
    resendEmailVerification,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook to access auth context
 * Must be used within AuthProvider
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
