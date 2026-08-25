"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  User,
  Mail,
  Lock,
  Save,
  AlertCircle,
  CheckCircle,
  Trash2,
  Shield,
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { useAsync } from "@/hooks/use-api";
import { authService } from "@/services/auth";
import { toast } from "sonner";
import { AvatarUpload } from "@/components/profile/avatar-upload";
import { logAndToastError } from "@/lib/utils";

export function ProfileSettings() {
  const { user, updateProfile, sendEmailVerification, refreshProfile } =
    useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || "",
    bio: user?.bio || "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        bio: user.bio || "",
      });
    }
  }, [user]);

  const [passwordData, setPasswordData] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });

  const { loading: updatingProfile, execute: executeProfileUpdate } =
    useAsync();
  const { loading: updatingPassword, execute: executePasswordUpdate } =
    useAsync();
  const { loading: sendingVerification, execute: executeSendVerification } =
    useAsync();

  if (!user) return null;

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Name is required");
      return;
    }

    try {
      const success = await executeProfileUpdate(updateProfile, formData);
      if (success) {
        toast.success("Profile updated successfully!");
      }
    } catch (error) {
      logAndToastError(
        error,
        "Error updating profile",
        "Failed to update profile. Please try again.",
      );
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.new_password !== passwordData.confirm_password) {
      toast.error("New passwords do not match");
      return;
    }

    if (passwordData.new_password.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    try {
      await executePasswordUpdate(authService.updatePassword, {
        current_password: passwordData.current_password,
        new_password: passwordData.new_password,
      });

      setPasswordData({
        current_password: "",
        new_password: "",
        confirm_password: "",
      });
      toast.success("Password updated successfully!");
    } catch (error) {
      logAndToastError(
        error,
        "Error updating password",
        "Failed to update password. Please try again.",
      );
    }
  };

  const handleSendVerification = async () => {
    try {
      const success = await executeSendVerification(sendEmailVerification);
      if (success) {
        toast.success("Verification email sent! Check your inbox.");
      }
    } catch (error) {
      logAndToastError(
        error,
        "Error sending verification",
        "Failed to send verification email. Please try again.",
      );
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const accountTypeLabel =
    user.role === 0
      ? "Reader"
      : user.role === 1
        ? "Author"
        : user.role === 2
          ? "Editor"
          : "Admin";

  return (
    <div className="space-y-5 sm:space-y-6">
      {!user.email_verified_at && (
        <Alert className="border-amber-500/25 bg-amber-500/5">
          <Mail className="size-4 text-amber-600 dark:text-amber-400" />
          <AlertDescription className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-sm">
              Verify your email to unlock every feature.
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSendVerification}
              disabled={sendingVerification}
              className="shrink-0"
            >
              {sendingVerification ? "Sending…" : "Send verification"}
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 lg:gap-6">
        <Card className="border-border/80 shadow-none">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-base font-semibold tracking-tight sm:text-lg">
              <span className="bg-primary/10 text-primary flex size-8 items-center justify-center rounded-lg">
                <User className="size-4" aria-hidden />
              </span>
              Profile
            </CardTitle>
            <p className="text-muted-foreground text-sm">
              How you appear across Rantale
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleProfileUpdate} className="space-y-5">
              <div className="space-y-2">
                <Label>Photo</Label>
                <AvatarUpload user={user} onUpdate={() => refreshProfile()} />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="name">Display name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Your display name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={user.email}
                  disabled
                  className="bg-muted"
                />
                <p className="text-muted-foreground text-xs">
                  Email can't be changed here. Contact support if you need a
                  new address.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => handleInputChange("bio", e.target.value)}
                  placeholder="A short line about what you read or write…"
                  rows={3}
                  maxLength={500}
                />
                <p className="text-muted-foreground text-right text-xs tabular-nums">
                  {formData.bio.length}/500
                </p>
              </div>

              <Button
                type="submit"
                disabled={updatingProfile}
                className="w-full"
              >
                <Save className="size-4" aria-hidden />
                {updatingProfile ? "Saving…" : "Save changes"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-none">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-base font-semibold tracking-tight sm:text-lg">
              <span className="bg-muted flex size-8 items-center justify-center rounded-lg">
                <Shield className="size-4" aria-hidden />
              </span>
              Security
            </CardTitle>
            <p className="text-muted-foreground text-sm">
              Keep your account locked down
            </p>
          </CardHeader>
          <CardContent>
            {user.provider !== "google" ? (
              <form onSubmit={handlePasswordUpdate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current_password">Current password</Label>
                  <Input
                    id="current_password"
                    type="password"
                    value={passwordData.current_password}
                    onChange={(e) =>
                      handlePasswordChange("current_password", e.target.value)
                    }
                    placeholder="Enter current password"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new_password">New password</Label>
                  <Input
                    id="new_password"
                    type="password"
                    value={passwordData.new_password}
                    onChange={(e) =>
                      handlePasswordChange("new_password", e.target.value)
                    }
                    placeholder="At least 8 characters"
                    minLength={8}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm_password">Confirm new password</Label>
                  <Input
                    id="confirm_password"
                    type="password"
                    value={passwordData.confirm_password}
                    onChange={(e) =>
                      handlePasswordChange("confirm_password", e.target.value)
                    }
                    placeholder="Repeat new password"
                    minLength={8}
                    required
                  />
                </div>

                <Button
                  type="submit"
                  disabled={updatingPassword}
                  className="w-full"
                  variant="secondary"
                >
                  <Lock className="size-4" aria-hidden />
                  {updatingPassword ? "Updating…" : "Update password"}
                </Button>
              </form>
            ) : (
              <Alert>
                <Shield className="size-4" />
                <AlertDescription>
                  You're signed in with Google. Password changes happen in your
                  Google account.
                </AlertDescription>
              </Alert>
            )}

            <Separator className="my-6" />

            <div className="space-y-3">
              <h4 className="text-sm font-medium">Account</h4>
              <dl className="space-y-2.5 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-muted-foreground">Type</dt>
                  <dd>
                    <Badge variant="secondary">{accountTypeLabel}</Badge>
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-muted-foreground">Email</dt>
                  <dd>
                    <Badge
                      variant={user.email_verified_at ? "default" : "outline"}
                    >
                      {user.email_verified_at ? (
                        <>
                          <CheckCircle className="mr-1 size-3" aria-hidden />
                          Verified
                        </>
                      ) : (
                        <>
                          <AlertCircle className="mr-1 size-3" aria-hidden />
                          Unverified
                        </>
                      )}
                    </Badge>
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-muted-foreground">Sign-in</dt>
                  <dd>
                    <Badge variant="outline">
                      {user.provider === "google" ? "Google" : "Email"}
                    </Badge>
                  </dd>
                </div>
              </dl>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-destructive/30 bg-destructive/[0.02] shadow-none">
        <CardHeader className="pb-3">
          <CardTitle className="text-destructive flex items-center gap-2 text-base font-semibold tracking-tight">
            <AlertCircle className="size-4" aria-hidden />
            Danger zone
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h4 className="text-sm font-medium">Delete account</h4>
              <p className="text-muted-foreground mt-1 text-sm">
                Permanently remove your account and reading data. This can't be
                undone.
              </p>
            </div>
            <Button variant="destructive" disabled className="shrink-0">
              <Trash2 className="size-4" aria-hidden />
              Contact support
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
