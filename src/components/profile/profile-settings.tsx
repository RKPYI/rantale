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
  Settings,
  User,
  Mail,
  Lock,
  Upload,
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

export function ProfileSettings() {
  const { user, updateProfile, sendEmailVerification } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || "",
    bio: user?.bio || "",
    avatar: user?.avatar || "",
  });

  // Update form data when user data changes
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        bio: user.bio || "",
        avatar: user.avatar || "",
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
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile. Please try again.");
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
      console.error("Error updating password:", error);
      toast.error("Failed to update password. Please try again.");
    }
  };

  const handleSendVerification = async () => {
    try {
      const success = await executeSendVerification(sendEmailVerification);
      if (success) {
        toast.success("Verification email sent! Check your inbox.");
      }
    } catch (error) {
      console.error("Error sending verification:", error);
      toast.error("Failed to send verification email. Please try again.");
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

  return (
    <div className="space-y-6">
      {/* Email Verification Alert */}
      {!user.email_verified_at && (
        <Alert>
          <Mail className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>
              Your email address is not verified. Please verify to access all
              features.
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSendVerification}
              disabled={sendingVerification}
            >
              {sendingVerification ? "Sending..." : "Send Verification"}
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Profile Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
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
                  Email cannot be changed. Contact support if needed.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => handleInputChange("bio", e.target.value)}
                  placeholder="Tell us about yourself..."
                  rows={3}
                  maxLength={500}
                />
                <p className="text-muted-foreground text-xs">
                  {formData.bio.length}/500 characters
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="avatar">Avatar URL</Label>
                <Input
                  id="avatar"
                  type="url"
                  value={formData.avatar}
                  onChange={(e) => handleInputChange("avatar", e.target.value)}
                  placeholder="https://example.com/avatar.jpg"
                />
                <p className="text-muted-foreground text-xs">
                  Enter a URL to your profile picture
                </p>
              </div>

              <Button
                type="submit"
                disabled={updatingProfile}
                className="w-full"
              >
                <Save className="mr-2 h-4 w-4" />
                {updatingProfile ? "Updating..." : "Update Profile"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Account Security */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Account Security
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordUpdate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current_password">Current Password</Label>
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
                <Label htmlFor="new_password">New Password</Label>
                <Input
                  id="new_password"
                  type="password"
                  value={passwordData.new_password}
                  onChange={(e) =>
                    handlePasswordChange("new_password", e.target.value)
                  }
                  placeholder="Enter new password"
                  minLength={8}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm_password">Confirm New Password</Label>
                <Input
                  id="confirm_password"
                  type="password"
                  value={passwordData.confirm_password}
                  onChange={(e) =>
                    handlePasswordChange("confirm_password", e.target.value)
                  }
                  placeholder="Confirm new password"
                  minLength={8}
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={updatingPassword}
                className="w-full"
              >
                <Lock className="mr-2 h-4 w-4" />
                {updatingPassword ? "Updating..." : "Update Password"}
              </Button>
            </form>

            <Separator className="my-6" />

            {/* Account Info */}
            <div className="space-y-4">
              <h4 className="font-medium">Account Information</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Account Type</span>
                  <Badge variant="secondary">
                    {user.role === 0
                      ? "Reader"
                      : user.role === 1
                        ? "Author"
                        : user.role === 2
                          ? "Moderator"
                          : "Admin"}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email Status</span>
                  <Badge
                    variant={user.email_verified_at ? "default" : "outline"}
                  >
                    {user.email_verified_at ? (
                      <>
                        <CheckCircle className="mr-1 h-3 w-3" />
                        Verified
                      </>
                    ) : (
                      <>
                        <AlertCircle className="mr-1 h-3 w-3" />
                        Unverified
                      </>
                    )}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Login Method</span>
                  <Badge variant="outline">
                    {user.provider === "google" ? "Google" : "Email"}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Danger Zone */}
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Danger Zone
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="mb-2 font-medium">Delete Account</h4>
              <p className="text-muted-foreground mb-4 text-sm">
                Once you delete your account, there is no going back. Please be
                certain.
              </p>
              <Button variant="destructive" disabled>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Account (Contact Support)
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
