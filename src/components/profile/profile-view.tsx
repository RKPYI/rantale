"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import {
  User,
  Settings,
  BookOpen,
  Heart,
  Clock,
  Calendar,
  Mail,
  Edit,
  Shield,
  Crown,
  PenTool,
  Star,
  BarChart3,
  Trophy,
  Target,
  TrendingUp,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useLibrary } from "@/hooks/use-library";
import { UserAvatar, UserInfo } from "@/components/ui/user-avatar";
import { formatDate } from "@/lib/novel-utils";
import { getUserRole } from "@/lib/user-utils";
import { ProfileSettings } from "@/components/profile/profile-settings";
import { ReadingStats } from "@/components/profile/reading-stats";

export function ProfileView() {
  const [activeTab, setActiveTab] = useState("overview");
  const { user, isAuthenticated, loading } = useAuth();
  const { data: library, loading: libraryLoading } = useLibrary();

  if (loading) {
    return <ProfileViewSkeleton />;
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="container mx-auto px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <Alert>
          <AlertDescription>
            Please sign in to view your profile.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const userRole = getUserRole(user);
  const joinedDate = user.created_at ? new Date(user.created_at) : new Date();
  const isVerified = user.email_verified_at !== null;

  return (
    <div className="container mx-auto space-y-4 px-4 py-6 sm:space-y-6 sm:px-6 sm:py-8 lg:px-8">
      {/* Profile Header */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start sm:gap-6">
            {/* Avatar Section */}
            <div className="flex w-full flex-col items-center space-y-3 sm:w-auto sm:space-y-4">
              <UserAvatar user={user} size="lg" showBadge={true} />
              <div className="text-center">
                <UserInfo
                  user={user}
                  showRole={true}
                  showVerificationStatus={false}
                  className="justify-center"
                />
                {!isVerified && (
                  <Badge variant="outline" className="mt-2 text-xs">
                    <Mail className="mr-1 h-3 w-3" />
                    Email Unverified
                  </Badge>
                )}
              </div>
            </div>

            {/* User Information */}
            <div className="w-full flex-1 space-y-4">
              <div className="text-center sm:text-left">
                <h1 className="text-2xl font-bold break-words sm:text-3xl">
                  {user.name}
                </h1>
                <p className="text-muted-foreground text-sm break-all sm:text-base">
                  {user.email}
                </p>
                {user.bio && (
                  <p className="text-muted-foreground mt-2 text-sm break-words">
                    {user.bio}
                  </p>
                )}
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
                <div className="bg-muted rounded-lg p-2 text-center sm:p-3">
                  <Calendar className="text-muted-foreground mx-auto mb-1 h-4 w-4 sm:h-5 sm:w-5" />
                  <p className="text-muted-foreground text-xs">Joined</p>
                  <p className="text-xs leading-tight font-medium sm:text-sm">
                    {formatDate(joinedDate.toISOString())}
                  </p>
                </div>
                <div className="bg-muted rounded-lg p-2 text-center sm:p-3">
                  <BookOpen className="text-muted-foreground mx-auto mb-1 h-4 w-4 sm:h-5 sm:w-5" />
                  <p className="text-muted-foreground text-xs">Library</p>
                  <p className="text-xs font-medium sm:text-sm">
                    {library?.stats?.total || 0}
                  </p>
                </div>
                <div className="bg-muted rounded-lg p-2 text-center sm:p-3">
                  <Heart className="text-muted-foreground mx-auto mb-1 h-4 w-4 sm:h-5 sm:w-5" />
                  <p className="text-muted-foreground text-xs">Favorites</p>
                  <p className="text-xs font-medium sm:text-sm">
                    {library?.stats?.favorites || 0}
                  </p>
                </div>
                <div className="bg-muted rounded-lg p-2 text-center sm:p-3">
                  <Trophy className="text-muted-foreground mx-auto mb-1 h-4 w-4 sm:h-5 sm:w-5" />
                  <p className="text-muted-foreground text-xs">Completed</p>
                  <p className="text-xs font-medium sm:text-sm">
                    {library?.stats?.completed || 0}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex w-full flex-col gap-2 sm:flex-row">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveTab("settings")}
                  className="w-full sm:w-auto"
                >
                  <Edit className="mr-2 h-4 w-4" />
                  <span className="sm:hidden">Edit</span>
                  <span className="hidden sm:inline">Edit Profile</span>
                </Button>
                {userRole === "user" && (
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="w-full sm:w-auto"
                  >
                    <a href="/author">
                      <PenTool className="mr-2 h-4 w-4" />
                      <span className="sm:hidden">Author</span>
                      <span className="hidden sm:inline">Become Author</span>
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="overflow-x-auto">
          <TabsList className="inline-flex w-full min-w-full sm:w-auto sm:min-w-0">
            <TabsTrigger value="overview" className="flex-shrink-0">
              Overview
            </TabsTrigger>
            <TabsTrigger value="library" className="flex-shrink-0">
              Library
            </TabsTrigger>
            <TabsTrigger
              value="reading"
              className="hidden flex-shrink-0 sm:block"
            >
              Reading Stats
            </TabsTrigger>
            <TabsTrigger value="reading" className="flex-shrink-0 sm:hidden">
              Stats
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex-shrink-0">
              Settings
            </TabsTrigger>
            {(userRole === "author" || userRole === "admin") && (
              <TabsTrigger
                value="author"
                className="hidden flex-shrink-0 sm:block"
              >
                Author Dashboard
              </TabsTrigger>
            )}
            {(userRole === "author" || userRole === "admin") && (
              <TabsTrigger value="author" className="flex-shrink-0 sm:hidden">
                Author
              </TabsTrigger>
            )}
          </TabsList>
        </div>

        {/* Overview Tab */}
        <TabsContent
          value="overview"
          className="mt-4 space-y-4 sm:mt-6 sm:space-y-6"
        >
          <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
            {/* Account Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Account Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Account Type</span>
                  <Badge variant="secondary">
                    {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Email Status</span>
                  <Badge variant={isVerified ? "default" : "outline"}>
                    {isVerified ? "Verified" : "Unverified"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Account Status</span>
                  <Badge variant="default">Active</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Member Since</span>
                  <span className="text-muted-foreground text-sm">
                    {formatDate(joinedDate.toISOString())}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {library?.library.data.slice(0, 3).map((entry) => (
                    <div
                      key={entry.id}
                      className="flex flex-col gap-1 text-sm sm:flex-row sm:items-center sm:gap-3"
                    >
                      <div className="flex flex-1 items-center gap-3">
                        <div className="bg-primary h-2 w-2 flex-shrink-0 rounded-full"></div>
                        <span className="text-muted-foreground text-xs sm:text-sm">
                          {entry.status === "reading"
                            ? "Started reading"
                            : entry.status === "completed"
                              ? "Finished reading"
                              : entry.status === "want_to_read"
                                ? "Added to library"
                                : "Updated"}
                        </span>
                        <span className="truncate text-xs font-medium sm:text-sm">
                          {entry.novel.title}
                        </span>
                      </div>
                      <span className="text-muted-foreground ml-5 text-xs sm:ml-auto">
                        {formatDate(entry.status_updated_at)}
                      </span>
                    </div>
                  )) || (
                    <p className="text-muted-foreground text-sm">
                      No recent activity
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Reading Progress Overview */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <BarChart3 className="h-5 w-5" />
                Reading Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-5">
                <div className="rounded-lg border p-3 text-center">
                  <p className="text-xl font-bold text-blue-600 sm:text-2xl">
                    {library?.stats?.reading || 0}
                  </p>
                  <p className="text-muted-foreground text-xs leading-tight sm:text-sm">
                    Currently Reading
                  </p>
                </div>
                <div className="rounded-lg border p-3 text-center">
                  <p className="text-xl font-bold text-green-600 sm:text-2xl">
                    {library?.stats?.completed || 0}
                  </p>
                  <p className="text-muted-foreground text-xs sm:text-sm">
                    Completed
                  </p>
                </div>
                <div className="rounded-lg border p-3 text-center">
                  <p className="text-xl font-bold text-yellow-600 sm:text-2xl">
                    {library?.stats?.want_to_read || 0}
                  </p>
                  <p className="text-muted-foreground text-xs leading-tight sm:text-sm">
                    Want to Read
                  </p>
                </div>
                <div className="rounded-lg border p-3 text-center">
                  <p className="text-xl font-bold text-orange-600 sm:text-2xl">
                    {library?.stats?.on_hold || 0}
                  </p>
                  <p className="text-muted-foreground text-xs sm:text-sm">
                    On Hold
                  </p>
                </div>
                <div className="col-span-2 rounded-lg border p-3 text-center sm:col-span-1">
                  <p className="text-xl font-bold text-red-600 sm:text-2xl">
                    {library?.stats?.favorites || 0}
                  </p>
                  <p className="text-muted-foreground text-xs sm:text-sm">
                    Favorites
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Library Tab */}
        <TabsContent value="library">
          {libraryLoading ? (
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-center space-x-4">
                      <Skeleton className="h-16 w-12 rounded" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-48" />
                        <Skeleton className="h-3 w-32" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>My Library</CardTitle>
              </CardHeader>
              <CardContent>
                {library && library.library.data.length > 0 ? (
                  <div className="space-y-3 sm:space-y-4">
                    {library.library.data.slice(0, 10).map((entry) => (
                      <div
                        key={entry.id}
                        className="flex flex-col gap-3 rounded-lg border p-3 sm:flex-row sm:items-center sm:gap-4 sm:p-4"
                      >
                        <div className="flex flex-1 items-center gap-3 sm:gap-4">
                          <img
                            src={
                              entry.novel.cover_image || "/placeholder-book.jpg"
                            }
                            alt={entry.novel.title}
                            className="h-14 w-10 flex-shrink-0 rounded object-cover sm:h-16 sm:w-12"
                          />
                          <div className="min-w-0 flex-1">
                            <h4 className="truncate text-sm font-medium sm:text-base">
                              {entry.novel.title}
                            </h4>
                            <p className="text-muted-foreground truncate text-xs sm:text-sm">
                              by {entry.novel.author}
                            </p>
                            <div className="mt-1 flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {entry.status.replace("_", " ")}
                              </Badge>
                              {entry.is_favorite && (
                                <Heart className="h-3 w-3 fill-current text-red-500 sm:h-4 sm:w-4" />
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex-shrink-0 text-left sm:text-right">
                          <p className="text-muted-foreground text-xs sm:text-sm">
                            Added {formatDate(entry.added_at)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center">
                    <BookOpen className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
                    <h3 className="text-lg font-medium">
                      Your library is empty
                    </h3>
                    <p className="text-muted-foreground">
                      Start adding novels to track your reading progress
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Reading Stats Tab */}
        <TabsContent value="reading">
          <ReadingStats />
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings">
          <ProfileSettings />
        </TabsContent>

        {/* Author Dashboard Tab */}
        {(userRole === "author" || userRole === "admin") && (
          <TabsContent value="author">
            <Card>
              <CardHeader>
                <CardTitle>Author Dashboard</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Access your full author dashboard for novel management and
                  analytics.
                </p>
                <Button asChild>
                  <a href="/author">
                    <PenTool className="mr-2 h-4 w-4" />
                    Go to Author Dashboard
                  </a>
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}

function ProfileViewSkeleton() {
  return (
    <div className="container mx-auto space-y-4 px-4 py-6 sm:space-y-6 sm:px-6 sm:py-8 lg:px-8">
      {/* Header Skeleton */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start sm:gap-6">
            <div className="flex flex-col items-center space-y-3 sm:space-y-4">
              <Skeleton className="h-20 w-20 rounded-full sm:h-24 sm:w-24" />
              <Skeleton className="h-5 w-28 sm:h-6 sm:w-32" />
            </div>
            <div className="w-full flex-1 space-y-4">
              <div className="text-center sm:text-left">
                <Skeleton className="mx-auto mb-2 h-7 w-40 sm:mx-0 sm:h-8 sm:w-48" />
                <Skeleton className="mx-auto h-4 w-48 sm:mx-0 sm:w-64" />
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton
                    key={i}
                    className="h-14 w-full rounded-lg sm:h-16"
                  />
                ))}
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Skeleton className="h-9 w-full sm:w-32" />
                <Skeleton className="h-9 w-full sm:w-36" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs Skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="space-y-3 sm:space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full sm:h-20" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
