"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart3,
  BookOpen,
  Clock,
  Calendar,
  Target,
  TrendingUp,
  Heart,
  Star,
  MessageCircle,
} from "lucide-react";
import { useProfileStats } from "@/hooks/use-profile-stats";
import { formatDate } from "@/lib/novel-utils";
import { ContinueReading } from "@/components/sections/continue-reading";
import Link from "next/link";

export function ReadingStats() {
  const { data: stats, loading } = useProfileStats();

  if (loading) {
    return <ReadingStatsSkeleton />;
  }

  if (!stats) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <BookOpen className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
          <h3 className="text-lg font-medium">No reading data available</h3>
          <p className="text-muted-foreground">
            Start reading novels to see your statistics
          </p>
        </CardContent>
      </Card>
    );
  }

  const library = stats.library;
  const readingProgress = stats.reading_progress;
  const activity = stats.activity;
  const recentActivity = stats.recent_activity.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Overview Stats - Using Reading Progress data (novels with chapters read) */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4 text-center">
            <BookOpen className="mx-auto mb-2 h-8 w-8 text-blue-500" />
            <p className="text-2xl font-bold">
              {readingProgress.total_novels_reading}
            </p>
            <p className="text-muted-foreground text-sm">Novels Read</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Target className="mx-auto mb-2 h-8 w-8 text-green-500" />
            <p className="text-2xl font-bold">
              {readingProgress.completed_novels}
            </p>
            <p className="text-muted-foreground text-sm">Completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Heart className="mx-auto mb-2 h-8 w-8 text-red-500" />
            <p className="text-2xl font-bold">{library.favorites}</p>
            <p className="text-muted-foreground text-sm">Favorites</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <MessageCircle className="mx-auto mb-2 h-8 w-8 text-purple-500" />
            <p className="text-2xl font-bold">{activity.total_comments}</p>
            <p className="text-muted-foreground text-sm">Comments</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Reading Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Reading Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">In Progress</span>
                <Badge variant="outline">
                  {readingProgress.in_progress_novels}
                </Badge>
              </div>
              <div className="bg-muted h-2 w-full rounded-full">
                <div
                  className="h-2 rounded-full bg-blue-500 transition-all"
                  style={{
                    width: `${Math.min((readingProgress.in_progress_novels / (readingProgress.total_novels_reading || 1)) * 100, 100)}%`,
                  }}
                ></div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Average Completion</span>
                <Badge variant="outline">
                  {Math.round(readingProgress.average_completion_rate)}%
                </Badge>
              </div>
              <div className="bg-muted h-2 w-full rounded-full">
                <div
                  className="h-2 rounded-full bg-green-500 transition-all"
                  style={{
                    width: `${readingProgress.average_completion_rate}%`,
                  }}
                ></div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Activity This Month</span>
                <Badge variant="outline">
                  {activity.this_month.reading_days}{" "}
                  {activity.this_month.reading_days === 1 ? "day" : "days"}
                </Badge>
              </div>
              <div className="text-muted-foreground flex flex-col gap-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Star className="h-3 w-3" />
                    Ratings
                  </span>
                  <span className="font-medium">
                    {activity.this_month.ratings}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <MessageCircle className="h-3 w-3" />
                    Comments
                  </span>
                  <span className="font-medium">
                    {activity.this_month.comments}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Library Status - What's in your library */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              Library Status
            </CardTitle>
            <p className="text-muted-foreground mt-1 text-sm">
              Novels organized in your library ({library.total_novels} total)
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {library.by_status.reading > 0 && (
                <div className="flex items-center justify-between rounded-lg bg-blue-50 p-3 dark:bg-blue-950/20">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                    <span className="text-sm font-medium">Reading</span>
                  </div>
                  <span className="text-sm font-bold">
                    {library.by_status.reading}
                  </span>
                </div>
              )}

              {library.by_status.want_to_read > 0 && (
                <div className="flex items-center justify-between rounded-lg bg-yellow-50 p-3 dark:bg-yellow-950/20">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                    <span className="text-sm font-medium">Want to Read</span>
                  </div>
                  <span className="text-sm font-bold">
                    {library.by_status.want_to_read}
                  </span>
                </div>
              )}

              {library.by_status.completed > 0 && (
                <div className="flex items-center justify-between rounded-lg bg-green-50 p-3 dark:bg-green-950/20">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-green-500"></div>
                    <span className="text-sm font-medium">Completed</span>
                  </div>
                  <span className="text-sm font-bold">
                    {library.by_status.completed}
                  </span>
                </div>
              )}

              {library.by_status.on_hold > 0 && (
                <div className="flex items-center justify-between rounded-lg bg-orange-50 p-3 dark:bg-orange-950/20">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-orange-500"></div>
                    <span className="text-sm font-medium">On Hold</span>
                  </div>
                  <span className="text-sm font-bold">
                    {library.by_status.on_hold}
                  </span>
                </div>
              )}

              {library.by_status.dropped > 0 && (
                <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-gray-950/20">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-gray-500"></div>
                    <span className="text-sm font-medium">Dropped</span>
                  </div>
                  <span className="text-sm font-bold">
                    {library.by_status.dropped}
                  </span>
                </div>
              )}

              {library.total_novels === 0 && (
                <p className="text-muted-foreground py-4 text-center text-sm">
                  No novels in library yet
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Overall Statistics Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Overall Statistics
          </CardTitle>
          <p className="text-muted-foreground mt-1 text-sm">
            <strong>{readingProgress.total_novels_reading} novels</strong> with
            reading progress, <strong>{library.total_novels} novels</strong>{" "}
            organized in library
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="space-y-1">
              <p className="text-muted-foreground text-xs">
                Total Chapters Read
              </p>
              <p className="text-2xl font-bold">
                {readingProgress.total_chapters_read}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-muted-foreground text-xs">Avg. Completion</p>
              <p className="text-2xl font-bold">
                {Math.round(readingProgress.average_completion_rate)}%
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-muted-foreground text-xs">Total Ratings</p>
              <p className="text-2xl font-bold">{activity.total_ratings}</p>
            </div>
            <div className="space-y-1">
              <p className="text-muted-foreground text-xs">Avg. Rating Given</p>
              <p className="text-2xl font-bold">
                {activity.average_rating_given.toFixed(1)}
                <span className="text-muted-foreground text-sm">/5</span>
              </p>
            </div>
          </div>

          {/* Continue Reading Section */}
          <ContinueReading className="mt-6" showTitle={true} />
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentActivity.length > 0 ? (
            <div className="space-y-3">
              {recentActivity.map((activity, idx) => (
                <Link
                  key={idx}
                  href={`/novels/${activity.novel.slug}`}
                  className="hover:bg-muted flex items-center justify-between rounded-lg border p-3 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-full">
                      {activity.type === "reading" ? (
                        <BookOpen className="text-primary h-5 w-5" />
                      ) : activity.type === "comment" ? (
                        <MessageCircle className="text-primary h-5 w-5" />
                      ) : (
                        <Star className="text-primary h-5 w-5" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-sm font-medium">
                        {activity.novel.title}
                      </h4>
                      <p className="text-muted-foreground text-xs">
                        {activity.type === "reading" && activity.chapter
                          ? `Chapter ${activity.chapter.number}: ${activity.chapter.title}`
                          : activity.type === "comment"
                            ? activity.content?.slice(0, 50) + "..."
                            : `Rated ${activity.rating}/5`}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-muted-foreground text-xs">
                      {formatDate(activity.timestamp)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center">
              <Clock className="text-muted-foreground mx-auto mb-2 h-8 w-8" />
              <p className="text-muted-foreground text-sm">
                No recent activity
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ReadingStatsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <Skeleton className="h-16 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
