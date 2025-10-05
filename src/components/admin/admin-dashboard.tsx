"use client";

import { useState } from "react";
import {
  Users,
  BookOpen,
  MessageSquare,
  Star,
  Activity,
  Shield,
  Database,
  Server,
  HardDrive,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Eye,
  UserCheck,
  FileText,
  PenTool,
  UserPlus,
  Plus,
  MessageCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useAdminDashboardStats,
  useAdminRecentActivity,
  useAdminUsers,
  useAdminModerationQueue,
  useAdminSystemHealth,
  useAdminAuthorApplications,
  useAdminAuthorApplication,
  useApproveAuthorApplication,
  useRejectAuthorApplication,
} from "@/hooks/use-admin";
import { AuthorApplication, AdminActivity } from "@/types/api";
import { formatDate, formatNumber } from "@/lib/novel-utils";
import { getUserRole } from "@/lib/user-utils";
import { adminService } from "@/services/admin";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const {
    data: stats,
    loading: statsLoading,
    error: statsError,
  } = useAdminDashboardStats();
  const { data: activities, loading: activitiesLoading } =
    useAdminRecentActivity(10);
  const { data: systemHealth, loading: healthLoading } = useAdminSystemHealth();

  if (statsLoading) {
    return <AdminDashboardSkeleton />;
  }

  if (statsError) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Failed to load dashboard data: {statsError}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Platform overview and management tools
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="overflow-x-auto">
          <TabsList className="inline-flex w-full min-w-full sm:w-auto sm:min-w-0">
            <TabsTrigger value="overview" className="flex-shrink-0">
              Overview
            </TabsTrigger>
            <TabsTrigger value="users" className="flex-shrink-0">
              Users
            </TabsTrigger>
            <TabsTrigger value="content" className="flex-shrink-0">
              Content
            </TabsTrigger>
            <TabsTrigger value="authors" className="flex-shrink-0">
              Author Apps
            </TabsTrigger>
            <TabsTrigger value="activity" className="flex-shrink-0">
              Activity
            </TabsTrigger>
            <TabsTrigger value="moderation" className="flex-shrink-0">
              Moderation
            </TabsTrigger>
            <TabsTrigger value="system" className="flex-shrink-0">
              System
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Overview Tab */}
        <TabsContent value="overview" className="mt-6 space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              title="Total Users"
              value={stats?.users?.total || 0}
              icon={Users}
              subtitle={`+${stats?.users?.new_this_month || 0} this month`}
              color="blue"
            />
            <MetricCard
              title="Total Novels"
              value={stats?.content?.novels || 0}
              icon={BookOpen}
              subtitle={`+${stats?.content?.novels_this_month || 0} this month`}
              color="green"
            />
            <MetricCard
              title="Total Comments"
              value={stats?.content?.comments || 0}
              icon={MessageSquare}
              subtitle={`${stats?.content?.pending_comments || 0} pending`}
              color="purple"
            />
            <MetricCard
              title="Average Rating"
              value={stats?.engagement?.average_rating?.toFixed(1) || "0.0"}
              icon={Star}
              subtitle={`${stats?.content?.ratings || 0} ratings`}
              color="yellow"
            />
          </div>

          {/* Recent Activity & Quick Stats */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Recent Activity */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                {activitiesLoading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <div className="flex-1 space-y-1">
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : activities && activities.length > 0 ? (
                  <div className="space-y-3">
                    {activities.slice(0, 5).map((activity) => (
                      <div
                        key={activity.id}
                        className="flex items-start gap-3 text-sm"
                      >
                        <div className="bg-primary mt-2 h-2 w-2 flex-shrink-0 rounded-full"></div>
                        <div className="min-w-0 flex-1">
                          <p className="break-words">
                            {getActivityDescription(activity)}
                          </p>
                          <p className="text-muted-foreground text-xs">
                            {formatDate(activity.created_at)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">
                    No recent activity
                  </p>
                )}
              </CardContent>
            </Card>

            {/* User Statistics */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>User Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-muted rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-blue-600">
                      {stats?.users?.active_today || 0}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      Active Today
                    </p>
                  </div>
                  <div className="bg-muted rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-green-600">
                      {stats?.users?.verified || 0}
                    </p>
                    <p className="text-muted-foreground text-xs">Verified</p>
                  </div>
                  <div className="bg-muted rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-purple-600">
                      {stats?.users?.by_role?.authors || 0}
                    </p>
                    <p className="text-muted-foreground text-xs">Authors</p>
                  </div>
                  <div className="bg-muted rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-orange-600">
                      {stats?.author_applications?.pending || 0}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      Pending Apps
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Content & Engagement Overview */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Content Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <p className="text-xl font-bold">
                      {stats?.content?.novels || 0}
                    </p>
                    <p className="text-muted-foreground text-sm">
                      Total Novels
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-bold">
                      {formatNumber(stats?.content?.chapters || 0)}
                    </p>
                    <p className="text-muted-foreground text-sm">
                      Total Chapters
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-bold">
                      {formatNumber(
                        typeof stats?.engagement?.total_views === "string"
                          ? parseInt(stats.engagement.total_views)
                          : stats?.engagement?.total_views || 0,
                      )}
                    </p>
                    <p className="text-muted-foreground text-sm">Total Views</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-bold">
                      {stats?.engagement?.total_library_entries || 0}
                    </p>
                    <p className="text-muted-foreground text-sm">
                      Library Entries
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Top Genres</CardTitle>
              </CardHeader>
              <CardContent>
                {stats?.engagement?.top_genres &&
                stats.engagement.top_genres.length > 0 ? (
                  <div className="space-y-3">
                    {stats.engagement.top_genres
                      .slice(0, 5)
                      .map((genre, index) => (
                        <div
                          key={genre.name}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-4 font-mono text-sm">
                              #{index + 1}
                            </span>
                            <span className="text-sm">{genre.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="bg-muted h-2 w-20 rounded-full">
                              <div
                                className="bg-primary h-2 rounded-full"
                                style={{
                                  width: `${Math.min((genre.count / Math.max(...stats.engagement.top_genres.map((g) => g.count))) * 100, 100)}%`,
                                }}
                              />
                            </div>
                            <span className="text-muted-foreground w-8 text-right text-sm">
                              {genre.count}
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground py-4 text-center text-sm">
                    No genre data available
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Role Distribution */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>User Role Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <div className="rounded-lg border p-3 text-center">
                  <p className="text-2xl font-bold text-blue-600">
                    {stats?.users?.by_role?.users || 0}
                  </p>
                  <p className="text-muted-foreground text-xs">Regular Users</p>
                </div>
                <div className="rounded-lg border p-3 text-center">
                  <p className="text-2xl font-bold text-purple-600">
                    {stats?.users?.by_role?.authors || 0}
                  </p>
                  <p className="text-muted-foreground text-xs">Authors</p>
                </div>
                <div className="rounded-lg border p-3 text-center">
                  <p className="text-2xl font-bold text-orange-600">
                    {stats?.users?.by_role?.moderators || 0}
                  </p>
                  <p className="text-muted-foreground text-xs">Moderators</p>
                </div>
                <div className="rounded-lg border p-3 text-center">
                  <p className="text-2xl font-bold text-red-600">
                    {stats?.users?.by_role?.admins || 0}
                  </p>
                  <p className="text-muted-foreground text-xs">Admins</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="mt-6">
          <UserManagement />
        </TabsContent>

        {/* Content Tab */}
        <TabsContent value="content" className="mt-6">
          <ContentManagement />
        </TabsContent>

        {/* Author Applications Tab */}
        <TabsContent value="authors" className="mt-6">
          <AuthorApplicationsTab />
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="mt-6">
          <ActivityTab />
        </TabsContent>

        {/* Moderation Tab */}
        <TabsContent value="moderation" className="mt-6">
          <ModerationQueue />
        </TabsContent>

        {/* System Tab */}
        <TabsContent value="system" className="mt-6">
          <SystemHealth />
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  subtitle?: string;
  color: "blue" | "green" | "purple" | "yellow" | "red";
}

function MetricCard({
  title,
  value,
  icon: Icon,
  subtitle,
  color,
}: MetricCardProps) {
  const colorClasses = {
    blue: "text-blue-600 bg-blue-100 dark:bg-blue-900/20",
    green: "text-green-600 bg-green-100 dark:bg-green-900/20",
    purple: "text-purple-600 bg-purple-100 dark:bg-purple-900/20",
    yellow: "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20",
    red: "text-red-600 bg-red-100 dark:bg-red-900/20",
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-muted-foreground text-sm font-medium">{title}</p>
            <p className="text-2xl font-bold">
              {typeof value === "number" ? formatNumber(value) : value}
            </p>
            {subtitle && (
              <p className="text-muted-foreground text-xs">{subtitle}</p>
            )}
          </div>
          <div className={`rounded-lg p-2 ${colorClasses[color]}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Placeholder components for other tabs
function UserManagement() {
  const { data, loading } = useAdminUsers();

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Management</CardTitle>
        <p className="text-muted-foreground text-sm">
          Manage users, roles, and permissions
        </p>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : (
          <div className="py-8 text-center">
            <Users className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
            <h3 className="text-lg font-medium">User Management</h3>
            <p className="text-muted-foreground">
              User management interface coming soon
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ContentManagement() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Content Management</CardTitle>
        <p className="text-muted-foreground text-sm">
          Manage novels, chapters, and content
        </p>
      </CardHeader>
      <CardContent>
        <div className="py-8 text-center">
          <FileText className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
          <h3 className="text-lg font-medium">Content Management</h3>
          <p className="text-muted-foreground">
            Content management interface coming soon
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function ModerationQueue() {
  const { data: moderation, loading, error } = useAdminModerationQueue();

  if (loading) {
    return (
      <div className="space-y-6">
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-red-600">
            Failed to load moderation data: {error}
          </p>
        </CardContent>
      </Card>
    );
  }

  const pendingComments = moderation?.moderation_data?.pending_comments || [];
  const recentNovels = moderation?.moderation_data?.recent_novels || [];

  return (
    <div className="space-y-6">
      {/* Pending Comments */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Pending Comments
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pendingComments.length === 0 ? (
            <div className="py-6 text-center">
              <CheckCircle className="mx-auto mb-3 h-12 w-12 text-green-600" />
              <p className="text-muted-foreground">
                No pending comments to review
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingComments.slice(0, 5).map((comment) => (
                <div key={comment.id} className="rounded-lg border p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 space-y-1">
                      <p className="text-sm">{comment.content}</p>
                      <div className="text-muted-foreground flex items-center gap-2 text-xs">
                        <span>by {comment.user?.name}</span>
                        <span>•</span>
                        <span>
                          {new Date(comment.created_at).toLocaleDateString()}
                        </span>
                        {comment.is_spoiler && (
                          <>
                            <span>•</span>
                            <Badge variant="secondary" className="text-xs">
                              Spoiler
                            </Badge>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <CheckCircle className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <XCircle className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Novels */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Recent Novels
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentNovels.length === 0 ? (
            <div className="py-6 text-center">
              <p className="text-muted-foreground">No recent novels</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentNovels.slice(0, 10).map((novel) => (
                <div
                  key={novel.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex-1">
                    <h4 className="font-medium">{novel.title}</h4>
                    <div className="text-muted-foreground flex items-center gap-2 text-sm">
                      <span>by {novel.author || "Unknown Author"}</span>
                      <span>•</span>
                      <Badge
                        variant={
                          novel.status === "completed" ? "default" : "secondary"
                        }
                      >
                        {novel.status}
                      </Badge>
                      <span>•</span>
                      <span>
                        {new Date(novel.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <Button size="sm" variant="outline">
                    <Eye className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function SystemHealth() {
  const { data: health, loading } = useAdminSystemHealth();

  if (loading) {
    return (
      <div className="space-y-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Database Health */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Database Health
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Status</span>
              <StatusBadge
                status={health?.health?.database?.status || "critical"}
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Total Tables</span>
              <span className="text-sm font-medium">
                {health?.health?.database?.total_tables || 0}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Cache Health */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5" />
              Cache Health
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Status</span>
              <StatusBadge
                status={health?.health?.cache?.status || "critical"}
              />
            </div>
          </CardContent>
        </Card>

        {/* Storage Health */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <HardDrive className="h-5 w-5" />
              Storage Health
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Status</span>
              <StatusBadge
                status={health?.health?.storage?.status || "critical"}
              />
            </div>
          </CardContent>
        </Card>

        {/* Recent Errors */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Error Monitoring
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Errors Today</span>
              <span className="text-sm font-medium">
                {health?.health?.recent_errors?.count_today || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Critical Errors</span>
              <span className="text-sm font-medium">
                {health?.health?.recent_errors?.critical_errors || 0}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: "healthy" | "warning" | "critical";
}) {
  const config = {
    healthy: {
      icon: CheckCircle,
      color: "text-green-600",
      bg: "bg-green-100 dark:bg-green-900/20",
    },
    warning: {
      icon: AlertTriangle,
      color: "text-yellow-600",
      bg: "bg-yellow-100 dark:bg-yellow-900/20",
    },
    critical: {
      icon: XCircle,
      color: "text-red-600",
      bg: "bg-red-100 dark:bg-red-900/20",
    },
  };

  const { icon: Icon, color, bg } = config[status];

  return (
    <Badge variant="outline" className={`${bg} ${color} border-0`}>
      <Icon className="mr-1 h-3 w-3" />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
}

// Helper function for activity descriptions
const getActivityDescription = (activity: AdminActivity) => {
  switch (activity.activity_type) {
    case "user_registered":
      return `${activity.name} registered as a new user`;
    case "novel_created":
      return `"${activity.title}" was created by ${activity.author}`;
    case "comment_posted":
      return `${activity.user?.name} commented on "${activity.novel?.title}": ${activity.content?.substring(0, 100)}${(activity.content?.length ?? 0) > 100 ? "..." : ""}`;
    case "application_submitted":
      return `${activity.user?.name} submitted an author application`;
    default:
      return "Unknown activity";
  }
};

// ActivityTab Component
function ActivityTab() {
  const { data: activities, loading, error } = useAdminRecentActivity(20);

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <Skeleton className="h-16 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-red-600">Failed to load activities: {error}</p>
        </CardContent>
      </Card>
    );
  }

  const getActivityIcon = (activityType: string) => {
    switch (activityType) {
      case "user_registered":
        return UserPlus;
      case "novel_created":
        return Plus;
      case "comment_posted":
        return MessageCircle;
      case "application_submitted":
        return FileText;
      default:
        return Activity;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) {
      return `${minutes}m ago`;
    } else if (hours < 24) {
      return `${hours}h ago`;
    } else {
      return `${days}d ago`;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Recent Activity</h3>
        <Badge variant="secondary">{activities?.length || 0} activities</Badge>
      </div>

      {!activities || activities.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground text-center">
              No recent activities
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {activities.map((activity: AdminActivity) => {
            const Icon = getActivityIcon(activity.activity_type);
            return (
              <Card key={activity.id}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="bg-primary/10 rounded-full p-2">
                      <Icon className="text-primary h-4 w-4" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm">
                        {getActivityDescription(activity)}
                      </p>
                      <div className="text-muted-foreground flex items-center gap-2 text-xs">
                        <Clock className="h-3 w-3" />
                        <span>{formatTimeAgo(activity.created_at)}</span>
                        {activity.status && (
                          <>
                            <span>•</span>
                            <Badge
                              variant={
                                activity.status === "pending"
                                  ? "secondary"
                                  : "default"
                              }
                              className="text-xs"
                            >
                              {activity.status}
                            </Badge>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

// AuthorApplicationsTab Component
function AuthorApplicationsTab() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedApplication, setSelectedApplication] = useState<number | null>(
    null,
  );
  const [adminNotes, setAdminNotes] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<"approve" | "reject" | "view">(
    "view",
  );

  const {
    data: applications,
    loading,
    error,
    refetch,
  } = useAdminAuthorApplications(
    1,
    statusFilter === "all" ? undefined : statusFilter,
  );
  const { data: selectedApp } = useAdminAuthorApplication(
    selectedApplication || 0,
  );

  const handleAction = async (
    applicationId: number,
    action: "approve" | "reject",
    notes?: string,
  ) => {
    try {
      if (action === "approve") {
        await adminService.approveAuthorApplication(applicationId, notes);
      } else {
        await adminService.rejectAuthorApplication(
          applicationId,
          notes || "No reason provided",
        );
      }
      await refetch();
      setIsDialogOpen(false);
      setAdminNotes("");
    } catch (error) {
      console.error(`Failed to ${action} application:`, error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary">Pending</Badge>;
      case "approved":
        return (
          <Badge variant="default" className="bg-green-600">
            Approved
          </Badge>
        );
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-24 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-red-600">Failed to load applications: {error}</p>
        </CardContent>
      </Card>
    );
  }

  const applicationsList = ((
    applications as { applications?: { data?: AuthorApplication[] } }
  )?.applications?.data || []) as AuthorApplication[];

  return (
    <div className="space-y-6">
      {/* Header and Filters */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Author Applications</h3>
          <p className="text-muted-foreground text-sm">
            Review and manage author applications
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant={statusFilter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter("all")}
          >
            All
          </Button>
          <Button
            variant={statusFilter === "pending" ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter("pending")}
          >
            Pending
          </Button>
          <Button
            variant={statusFilter === "approved" ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter("approved")}
          >
            Approved
          </Button>
          <Button
            variant={statusFilter === "rejected" ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter("rejected")}
          >
            Rejected
          </Button>
        </div>
      </div>

      {/* Applications List */}
      {applicationsList.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <div className="py-8 text-center">
              <FileText className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
              <h3 className="text-lg font-medium">No Applications</h3>
              <p className="text-muted-foreground">
                {statusFilter === "all"
                  ? "No author applications found"
                  : `No ${statusFilter} applications found`}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {applicationsList.map((application: AuthorApplication) => (
            <Card key={application.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3">
                      <div>
                        <h4 className="font-medium">
                          {application.user?.name || "Unknown User"}
                        </h4>
                        <p className="text-muted-foreground text-sm">
                          {application.user?.email}
                        </p>
                      </div>
                      {getStatusBadge(application.status)}
                    </div>

                    <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
                      <div>
                        <Label className="font-medium">Pen Name:</Label>
                        <p className="text-muted-foreground">
                          {application.pen_name || "Not specified"}
                        </p>
                      </div>
                      <div>
                        <Label className="font-medium">
                          Writing Experience:
                        </Label>
                        <p className="text-muted-foreground line-clamp-2">
                          {application.writing_experience}
                        </p>
                      </div>
                    </div>

                    {application.bio && (
                      <div className="text-sm">
                        <Label className="font-medium">Bio:</Label>
                        <p className="text-muted-foreground line-clamp-2">
                          {application.bio}
                        </p>
                      </div>
                    )}

                    {application.admin_notes && (
                      <div className="text-sm">
                        <Label className="font-medium">Admin Notes:</Label>
                        <p className="text-muted-foreground">
                          {application.admin_notes}
                        </p>
                      </div>
                    )}

                    <div className="text-muted-foreground flex items-center gap-4 text-xs">
                      <span>Applied: {formatDate(application.created_at)}</span>
                      {application.reviewed_at && (
                        <span>
                          Reviewed: {formatDate(application.reviewed_at)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedApplication(application.id);
                        setActionType("view");
                        setIsDialogOpen(true);
                      }}
                    >
                      <Eye className="mr-1 h-4 w-4" />
                      View
                    </Button>

                    {application.status === "pending" && (
                      <>
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => {
                            setSelectedApplication(application.id);
                            setActionType("approve");
                            setIsDialogOpen(true);
                          }}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="mr-1 h-4 w-4" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            setSelectedApplication(application.id);
                            setActionType("reject");
                            setIsDialogOpen(true);
                          }}
                        >
                          <XCircle className="mr-1 h-4 w-4" />
                          Reject
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Action Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {actionType === "approve"
                ? "Approve Application"
                : actionType === "reject"
                  ? "Reject Application"
                  : "Application Details"}
            </DialogTitle>
            <DialogDescription>
              {actionType === "approve"
                ? "Add optional notes and approve this author application."
                : actionType === "reject"
                  ? "Please provide a reason for rejecting this application."
                  : "View detailed information about this application."}
            </DialogDescription>
          </DialogHeader>

          {selectedApp && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="font-medium">Applicant:</Label>
                  <p>{selectedApp.user?.name}</p>
                </div>
                <div>
                  <Label className="font-medium">Email:</Label>
                  <p>{selectedApp.user?.email}</p>
                </div>
                <div>
                  <Label className="font-medium">Pen Name:</Label>
                  <p>{selectedApp.pen_name || "Not specified"}</p>
                </div>
                <div>
                  <Label className="font-medium">Status:</Label>
                  <div>{getStatusBadge(selectedApp.status)}</div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="font-medium">Bio:</Label>
                <p className="text-muted-foreground bg-muted rounded p-3 text-sm">
                  {selectedApp.bio}
                </p>
              </div>

              <div className="space-y-2">
                <Label className="font-medium">Writing Experience:</Label>
                <p className="text-muted-foreground bg-muted rounded p-3 text-sm">
                  {selectedApp.writing_experience}
                </p>
              </div>

              {selectedApp.sample_work && (
                <div className="space-y-2">
                  <Label className="font-medium">Sample Work:</Label>
                  <p className="text-muted-foreground bg-muted max-h-32 overflow-y-auto rounded p-3 text-sm">
                    {selectedApp.sample_work}
                  </p>
                </div>
              )}

              {selectedApp.portfolio_url && (
                <div className="space-y-2">
                  <Label className="font-medium">Portfolio URL:</Label>
                  <a
                    href={selectedApp.portfolio_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    {selectedApp.portfolio_url}
                  </a>
                </div>
              )}

              {(actionType === "approve" || actionType === "reject") && (
                <div className="space-y-2">
                  <Label className="font-medium">
                    {actionType === "reject"
                      ? "Rejection Reason *"
                      : "Admin Notes (Optional)"}
                  </Label>
                  <Textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder={
                      actionType === "reject"
                        ? "Please provide a reason for rejection..."
                        : "Add any notes for this approval..."
                    }
                    rows={3}
                  />
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            {actionType === "approve" && (
              <Button
                onClick={() =>
                  handleAction(selectedApplication!, "approve", adminNotes)
                }
                className="bg-green-600 hover:bg-green-700"
              >
                Approve Application
              </Button>
            )}
            {actionType === "reject" && (
              <Button
                variant="destructive"
                onClick={() =>
                  handleAction(selectedApplication!, "reject", adminNotes)
                }
                disabled={!adminNotes.trim()}
              >
                Reject Application
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function AdminDashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-8 w-64" />
        <Skeleton className="mt-2 h-4 w-96" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-48 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
