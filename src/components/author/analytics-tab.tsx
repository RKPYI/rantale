"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import {
  BarChart3,
  TrendingUp,
  Users,
  MessageSquare,
  Star,
  Eye,
  Heart,
  BookmarkPlus,
  BookOpen,
} from "lucide-react";
import { formatNumber } from "@/lib/novel-utils";
import { AuthorNovel, AuthorStats } from "@/types/api";

interface AnalyticsTabProps {
  stats: AuthorStats | null;
  statsLoading: boolean;
  novels: AuthorNovel[] | null;
  novelsLoading: boolean;
}

interface MetricRowProps {
  label: string;
  value: string | number;
  icon?: React.ElementType;
  sublabel?: string;
}

function MetricRow({ label, value, icon: Icon, sublabel }: MetricRowProps) {
  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center gap-2">
        {Icon && <Icon className="text-muted-foreground h-4 w-4" />}
        <div>
          <span className="text-xs sm:text-sm">{label}</span>
          {sublabel && (
            <p className="text-muted-foreground text-xs">{sublabel}</p>
          )}
        </div>
      </div>
      <span className="text-sm font-medium sm:text-base">{value}</span>
    </div>
  );
}

export function AnalyticsTab({
  stats,
  statsLoading,
  novels,
  novelsLoading,
}: AnalyticsTabProps) {
  // Calculate engagement rate (views to interactions ratio)
  const getEngagementRate = () => {
    if (!stats || stats.engagement_stats.total_views === 0) return 0;
    const totalInteractions =
      stats.engagement_stats.total_comments +
      stats.engagement_stats.total_ratings +
      stats.engagement_stats.total_library_adds;
    return (totalInteractions / stats.engagement_stats.total_views) * 100;
  };

  // Calculate completion rate
  const getCompletionRate = () => {
    if (!stats || stats.reader_engagement.currently_reading === 0) return 0;
    return (
      (stats.reader_engagement.completed_readers /
        (stats.reader_engagement.currently_reading +
          stats.reader_engagement.completed_readers)) *
      100
    );
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Engagement Metrics */}
      <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 flex-shrink-0" />
              <span className="truncate">Engagement Metrics</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ) : stats ? (
              <div className="space-y-1">
                <MetricRow
                  label="Total Views"
                  value={formatNumber(stats.engagement_stats.total_views)}
                  icon={Eye}
                />
                <MetricRow
                  label="Comments"
                  value={formatNumber(stats.engagement_stats.total_comments)}
                  icon={MessageSquare}
                />
                <MetricRow
                  label="Ratings"
                  value={formatNumber(stats.engagement_stats.total_ratings)}
                  icon={Star}
                />
                <MetricRow
                  label="Library Adds"
                  value={formatNumber(
                    stats.engagement_stats.total_library_adds,
                  )}
                  icon={BookmarkPlus}
                />
                <MetricRow
                  label="Favorites"
                  value={formatNumber(stats.engagement_stats.total_favorites)}
                  icon={Heart}
                />
                <div className="mt-4 border-t pt-4">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-medium">Engagement Rate</span>
                    <span className="text-sm font-bold">
                      {getEngagementRate().toFixed(1)}%
                    </span>
                  </div>
                  <Progress value={Math.min(getEngagementRate(), 100)} />
                </div>
              </div>
            ) : (
              <Alert>
                <AlertDescription className="text-xs sm:text-sm">
                  Unable to load analytics data.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 flex-shrink-0" />
              <span className="truncate">Reader Insights</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ) : stats ? (
              <div className="space-y-1">
                <Alert className="mb-3">
                  <AlertDescription className="text-xs">
                    These metrics only track users who added your novels to
                    their library. Total readers may be higher.
                  </AlertDescription>
                </Alert>
                <MetricRow
                  label="Currently Reading"
                  value={formatNumber(
                    stats.reader_engagement.currently_reading,
                  )}
                  icon={BookOpen}
                />
                <MetricRow
                  label="Completed"
                  value={formatNumber(
                    stats.reader_engagement.completed_readers,
                  )}
                  icon={BookOpen}
                />
                <MetricRow
                  label="Want to Read"
                  value={formatNumber(stats.reader_engagement.want_to_read)}
                  icon={BookmarkPlus}
                />
                <div className="mt-4 border-t pt-4">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-medium">Completion Rate</span>
                    <span className="text-sm font-bold">
                      {getCompletionRate().toFixed(1)}%
                    </span>
                  </div>
                  <Progress value={Math.min(getCompletionRate(), 100)} />
                  <p className="text-muted-foreground mt-2 text-xs">
                    Percentage of readers who completed vs currently reading
                  </p>
                </div>
              </div>
            ) : (
              <Alert>
                <AlertDescription className="text-xs sm:text-sm">
                  Unable to load reader data.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quality & Content Metrics */}
      <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 flex-shrink-0" />
              <span className="truncate">Quality Metrics</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ) : stats ? (
              <div className="space-y-1">
                <MetricRow
                  label="Average Rating"
                  value={
                    stats.quality_stats.average_rating
                      ? stats.quality_stats.average_rating.toFixed(2)
                      : "—"
                  }
                  icon={Star}
                />
                <MetricRow
                  label="High-Rated Novels"
                  value={stats.quality_stats.novels_above_4_stars}
                  sublabel="4+ stars"
                />
                <MetricRow
                  label="Five-Star Ratings"
                  value={formatNumber(stats.quality_stats.five_star_ratings)}
                />
                {stats.quality_stats.average_rating && (
                  <div className="mt-4 border-t pt-4">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm font-medium">
                        Rating Quality
                      </span>
                      <span className="text-sm font-bold">
                        {(
                          (stats.quality_stats.average_rating / 5) *
                          100
                        ).toFixed(0)}
                        %
                      </span>
                    </div>
                    <Progress
                      value={(stats.quality_stats.average_rating / 5) * 100}
                    />
                  </div>
                )}
              </div>
            ) : (
              <Alert>
                <AlertDescription className="text-xs sm:text-sm">
                  Unable to load quality data.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 flex-shrink-0" />
              <span className="truncate">Content Summary</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ) : stats ? (
              <div className="space-y-1">
                <MetricRow
                  label="Total Novels"
                  value={stats.content_stats.total_novels}
                />
                <MetricRow
                  label="Total Chapters"
                  value={formatNumber(stats.content_stats.total_chapters)}
                />
                <MetricRow
                  label="Total Words"
                  value={formatNumber(stats.content_stats.total_words)}
                />
                <MetricRow
                  label="Avg. Chapters/Novel"
                  value={stats.content_stats.avg_chapters_per_novel.toFixed(1)}
                />
                <div className="mt-4 grid grid-cols-2 gap-3 border-t pt-4">
                  <div className="rounded-lg border border-green-500/20 bg-green-500/10 p-3 text-center">
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {stats.content_stats.completed_novels}
                    </p>
                    <p className="text-muted-foreground text-xs">Completed</p>
                  </div>
                  <div className="rounded-lg border border-blue-500/20 bg-blue-500/10 p-3 text-center">
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {stats.content_stats.ongoing_novels}
                    </p>
                    <p className="text-muted-foreground text-xs">Ongoing</p>
                  </div>
                </div>
              </div>
            ) : (
              <Alert>
                <AlertDescription className="text-xs sm:text-sm">
                  Unable to load content data.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Performing Novels */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 flex-shrink-0" />
            <span className="truncate">Top Performing Novels</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {novelsLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </div>
          ) : novels && novels.length > 0 ? (
            <div className="space-y-3">
              {novels
                .filter(
                  (n) => n.status === "ongoing" || n.status === "completed",
                )
                .sort((a, b) => b.views_count - a.views_count)
                .slice(0, 5)
                .map((novel, index) => (
                  <div
                    key={novel.id}
                    className="hover:bg-muted/50 flex items-center justify-between gap-2 rounded-lg border p-3 transition-colors"
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                      <span className="bg-primary/10 text-primary flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold">
                        {index + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {novel.title}
                        </p>
                        <div className="text-muted-foreground flex items-center gap-3 text-xs">
                          <span className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {formatNumber(novel.views_count)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Star className="h-3 w-3" />
                            {novel.rating_avg
                              ? parseFloat(novel.rating_avg).toFixed(1)
                              : "—"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-muted-foreground py-8 text-center text-xs sm:text-sm">
              No published novels yet.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
