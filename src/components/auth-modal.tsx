"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useAsync } from "@/hooks/use-api";
import { authService } from "@/services/auth";
import { toast } from "sonner";
import type { LoginRequest, RegisterRequest } from "@/types/api";

// Google Logo SVG Component
const GoogleIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
    <path
      fill="#4285f4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34a853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#fbbc05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="#ea4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);

interface AuthModalProps {
  trigger?: React.ReactNode;
  defaultTab?: "signin" | "signup";
  onSuccess?: () => void;
}

export function AuthModal({
  trigger,
  defaultTab = "signin",
  onSuccess,
}: AuthModalProps) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Form states
  const [signinData, setSigninData] = useState<LoginRequest>({
    email: "",
    password: "",
  });

  const [signupData, setSignupData] = useState<RegisterRequest>({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
  });

  const [errors, setErrors] = useState<Record<string, string[]>>({});

  const { login, register } = useAuth();
  const { loading, execute } = useAsync();

  const resetForm = () => {
    setSigninData({ email: "", password: "" });
    setSignupData({
      name: "",
      email: "",
      password: "",
      password_confirmation: "",
    });
    setErrors({});
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const handleClose = () => {
    setOpen(false);
    setTimeout(resetForm, 150); // Reset after animation
  };

  const handleSuccess = () => {
    handleClose();
    onSuccess?.();
    toast.success(
      activeTab === "signin"
        ? "Welcome back!"
        : "Account created successfully!",
    );

    // Refresh the page to update the UI with the new auth state
    setTimeout(() => {
      window.location.reload();
    }, 500); // Small delay to let the toast show
  };

  const handleSignin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Basic validation
    const newErrors: Record<string, string[]> = {};
    if (!signinData.email) newErrors.email = ["Email is required"];
    if (!signinData.password) newErrors.password = ["Password is required"];

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await execute(async () => {
        const authResponse = await authService.login(signinData);
        // If successful, update the auth context
        if (authResponse?.user) {
          // The auth service already set the token, now we just need to trigger auth state update
          await login(signinData.email, signinData.password);
        }
        return authResponse;
      });

      handleSuccess();
    } catch (error: any) {
      if (error?.details) {
        setErrors(error.details);
      } else {
        toast.error(error?.message || "Login failed. Please try again.");
      }
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Basic validation
    const newErrors: Record<string, string[]> = {};
    if (!signupData.name) newErrors.name = ["Name is required"];
    if (!signupData.email) newErrors.email = ["Email is required"];
    if (!signupData.password) newErrors.password = ["Password is required"];
    if (signupData.password !== signupData.password_confirmation) {
      newErrors.password_confirmation = ["Passwords do not match"];
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await execute(async () => {
        const authResponse = await authService.register(signupData);
        // If successful, update the auth context
        if (authResponse?.user) {
          // The auth service already set the token, now we just need to trigger auth state update
          await register(
            signupData.name,
            signupData.email,
            signupData.password,
            signupData.password_confirmation,
          );
        }
        return authResponse;
      });

      handleSuccess();
    } catch (error: any) {
      if (error?.details) {
        setErrors(error.details);
      } else {
        toast.error(error?.message || "Registration failed. Please try again.");
      }
    }
  };

  const handleGoogleAuth = async () => {
    try {
      // Get Google OAuth URL from backend
      const url = await authService.getGoogleAuthRedirectUrl();
      // Redirect to Google OAuth
      window.location.href = url;
    } catch (error: any) {
      toast.error("Google authentication failed. Please try again.");
    }
  };

  const renderFieldError = (fieldName: string) => {
    if (!errors[fieldName]) return null;
    return <p className="mt-1 text-sm text-red-500">{errors[fieldName][0]}</p>;
  };

  const defaultTrigger = (
    <Button variant="outline" size="sm">
      Sign In
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger || defaultTrigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Join RDKNovel</DialogTitle>
          <DialogDescription>
            Sign in to your account or create a new one to start commenting and
            track your reading progress.
          </DialogDescription>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as "signin" | "signup")}
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          {/* Sign In Tab */}
          <TabsContent value="signin" className="mt-4 space-y-4">
            <form onSubmit={handleSignin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signin-email">Email</Label>
                <div className="relative">
                  <Mail className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
                  <Input
                    id="signin-email"
                    type="email"
                    placeholder="Enter your email"
                    className="pl-10"
                    value={signinData.email}
                    onChange={(e) =>
                      setSigninData((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    disabled={loading}
                  />
                </div>
                {renderFieldError("email")}
              </div>

              <div className="space-y-2">
                <Label htmlFor="signin-password">Password</Label>
                <div className="relative">
                  <Lock className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
                  <Input
                    id="signin-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    className="pr-10 pl-10"
                    value={signinData.password}
                    onChange={(e) =>
                      setSigninData((prev) => ({
                        ...prev,
                        password: e.target.value,
                      }))
                    }
                    disabled={loading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute top-0 right-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                  >
                    {showPassword ? (
                      <EyeOff className="text-muted-foreground h-4 w-4" />
                    ) : (
                      <Eye className="text-muted-foreground h-4 w-4" />
                    )}
                  </Button>
                </div>
                {renderFieldError("password")}
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background text-muted-foreground px-2">
                  Or continue with
                </span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleGoogleAuth}
              disabled={loading}
            >
              <GoogleIcon className="mr-2 h-4 w-4" />
              Google
            </Button>
          </TabsContent>

          {/* Sign Up Tab */}
          <TabsContent value="signup" className="mt-4 space-y-4">
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signup-name">Full Name</Label>
                <div className="relative">
                  <User className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder="Enter your full name"
                    className="pl-10"
                    value={signupData.name}
                    onChange={(e) =>
                      setSignupData((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    disabled={loading}
                  />
                </div>
                {renderFieldError("name")}
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-email">Email</Label>
                <div className="relative">
                  <Mail className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="Enter your email"
                    className="pl-10"
                    value={signupData.email}
                    onChange={(e) =>
                      setSignupData((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    disabled={loading}
                  />
                </div>
                {renderFieldError("email")}
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-password">Password</Label>
                <div className="relative">
                  <Lock className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
                  <Input
                    id="signup-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password"
                    className="pr-10 pl-10"
                    value={signupData.password}
                    onChange={(e) =>
                      setSignupData((prev) => ({
                        ...prev,
                        password: e.target.value,
                      }))
                    }
                    disabled={loading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute top-0 right-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                  >
                    {showPassword ? (
                      <EyeOff className="text-muted-foreground h-4 w-4" />
                    ) : (
                      <Eye className="text-muted-foreground h-4 w-4" />
                    )}
                  </Button>
                </div>
                {renderFieldError("password")}
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-confirm-password">
                  Confirm Password
                </Label>
                <div className="relative">
                  <Lock className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
                  <Input
                    id="signup-confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    className="pr-10 pl-10"
                    value={signupData.password_confirmation}
                    onChange={(e) =>
                      setSignupData((prev) => ({
                        ...prev,
                        password_confirmation: e.target.value,
                      }))
                    }
                    disabled={loading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute top-0 right-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={loading}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="text-muted-foreground h-4 w-4" />
                    ) : (
                      <Eye className="text-muted-foreground h-4 w-4" />
                    )}
                  </Button>
                </div>
                {renderFieldError("password_confirmation")}
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background text-muted-foreground px-2">
                  Or continue with
                </span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleGoogleAuth}
              disabled={loading}
            >
              <GoogleIcon className="mr-2 h-4 w-4" />
              Google
            </Button>
          </TabsContent>
        </Tabs>

        {/* Terms and Privacy */}
        <div className="text-muted-foreground mt-4 text-center text-xs">
          By continuing, you agree to our{" "}
          <a href="/terms" className="hover:text-foreground underline">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="/privacy" className="hover:text-foreground underline">
            Privacy Policy
          </a>
          .
        </div>
      </DialogContent>
    </Dialog>
  );
}
