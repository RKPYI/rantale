import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Activity, Users, BookOpen, MessageSquare, Star } from "lucide-react";
import {
  useAdminDashboardStats,
  useAdminRecentActivity,
} from "@/hooks/use-admin";
import { AdminActivity, AdminDashboardStats } from "@/types/api";
import { formatDate, formatNumber } from "@/lib/novel-utils";
import { MetricCard } from "./metric-card";

export function OverviewTab() {
  const { data: stats, loading: statsLoading } = useAdminDashboardStats();
  const { data: activities, loading: activitiesLoading } =
    useAdminRecentActivity(10);

  if (statsLoading) {
    return <OverviewTabSkeleton />;
  }

  return (
    <div className="mt-6 space-y-6">
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
                <p className="text-muted-foreground text-sm">Total Novels</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold">
                  {formatNumber(stats?.content?.chapters || 0)}
                </p>
                <p className="text-muted-foreground text-sm">Total Chapters</p>
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
                <p className="text-muted-foreground text-sm">Library Entries</p>
              </div>
            </div>
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
                <p className="text-muted-foreground text-xs">Active Today</p>
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
                <p className="text-muted-foreground text-xs">Pending Apps</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content & Engagement Overview */}
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
                {activities.slice(0, 5).map((activity, index) => (
                  <div
                    key={`${activity.id}-${activity.activity_type}-${index}`}
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

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Top Genres</CardTitle>
          </CardHeader>
          <CardContent>
            {stats?.engagement?.top_genres &&
            stats.engagement.top_genres.length > 0 ? (
              <div className="space-y-3">
                {stats.engagement.top_genres.slice(0, 5).map((genre, index) => (
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
    </div>
  );
}

function OverviewTabSkeleton() {
  return (
    <div className="mt-6 space-y-6">
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

// Helper function for activity descriptions
function getActivityDescription(activity: AdminActivity) {
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
}
