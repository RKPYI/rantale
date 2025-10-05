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
} from "lucide-react";
import { useLibrary } from "@/hooks/use-library";
import { formatDate } from "@/lib/novel-utils";

export function ReadingStats() {
  const { data: library, loading } = useLibrary();

  if (loading) {
    return <ReadingStatsSkeleton />;
  }

  if (!library) {
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

  const stats = library.stats;
  const recentEntries = library.library.data.slice(0, 5);

  // Calculate reading streaks and goals (mock data for now)
  const readingStreak = 7; // days
  const monthlyGoal = 5; // novels per month
  const monthlyProgress = stats.completed; // assuming this month

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4 text-center">
            <BookOpen className="mx-auto mb-2 h-8 w-8 text-blue-500" />
            <p className="text-2xl font-bold">{stats.total}</p>
            <p className="text-muted-foreground text-sm">Total Novels</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Target className="mx-auto mb-2 h-8 w-8 text-green-500" />
            <p className="text-2xl font-bold">{stats.completed}</p>
            <p className="text-muted-foreground text-sm">Completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Heart className="mx-auto mb-2 h-8 w-8 text-red-500" />
            <p className="text-2xl font-bold">{stats.favorites}</p>
            <p className="text-muted-foreground text-sm">Favorites</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="mx-auto mb-2 h-8 w-8 text-purple-500" />
            <p className="text-2xl font-bold">{readingStreak}</p>
            <p className="text-muted-foreground text-sm">Day Streak</p>
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
                <span className="text-sm">Currently Reading</span>
                <Badge variant="outline">{stats.reading}</Badge>
              </div>
              <div className="bg-muted h-2 w-full rounded-full">
                <div
                  className="h-2 rounded-full bg-blue-500 transition-all"
                  style={{
                    width: `${Math.min((stats.reading / (stats.total || 1)) * 100, 100)}%`,
                  }}
                ></div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Completion Rate</span>
                <Badge variant="outline">
                  {stats.total > 0
                    ? Math.round((stats.completed / stats.total) * 100)
                    : 0}
                  %
                </Badge>
              </div>
              <div className="bg-muted h-2 w-full rounded-full">
                <div
                  className="h-2 rounded-full bg-green-500 transition-all"
                  style={{
                    width: `${stats.total > 0 ? (stats.completed / stats.total) * 100 : 0}%`,
                  }}
                ></div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Monthly Goal</span>
                <Badge variant="outline">
                  {monthlyProgress}/{monthlyGoal}
                </Badge>
              </div>
              <div className="bg-muted h-2 w-full rounded-full">
                <div
                  className="h-2 rounded-full bg-purple-500 transition-all"
                  style={{
                    width: `${Math.min((monthlyProgress / monthlyGoal) * 100, 100)}%`,
                  }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reading Categories */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              Reading Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-lg bg-blue-50 p-3 dark:bg-blue-950/20">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                  <span className="text-sm font-medium">Reading</span>
                </div>
                <span className="text-sm font-bold">{stats.reading}</span>
              </div>

              <div className="flex items-center justify-between rounded-lg bg-yellow-50 p-3 dark:bg-yellow-950/20">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                  <span className="text-sm font-medium">Want to Read</span>
                </div>
                <span className="text-sm font-bold">{stats.want_to_read}</span>
              </div>

              <div className="flex items-center justify-between rounded-lg bg-green-50 p-3 dark:bg-green-950/20">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-green-500"></div>
                  <span className="text-sm font-medium">Completed</span>
                </div>
                <span className="text-sm font-bold">{stats.completed}</span>
              </div>

              <div className="flex items-center justify-between rounded-lg bg-orange-50 p-3 dark:bg-orange-950/20">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-orange-500"></div>
                  <span className="text-sm font-medium">On Hold</span>
                </div>
                <span className="text-sm font-bold">{stats.on_hold}</span>
              </div>

              <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-gray-950/20">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-gray-500"></div>
                  <span className="text-sm font-medium">Dropped</span>
                </div>
                <span className="text-sm font-bold">{stats.dropped}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentEntries.length > 0 ? (
            <div className="space-y-3">
              {recentEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={entry.novel.cover_image || "/placeholder-book.jpg"}
                      alt={entry.novel.title}
                      className="h-12 w-10 rounded object-cover"
                    />
                    <div>
                      <h4 className="text-sm font-medium">
                        {entry.novel.title}
                      </h4>
                      <p className="text-muted-foreground text-xs">
                        by {entry.novel.author}
                      </p>
                      <Badge variant="outline" className="mt-1 text-xs">
                        {entry.status.replace("_", " ")}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-muted-foreground text-xs">
                      Updated {formatDate(entry.status_updated_at)}
                    </p>
                    {entry.is_favorite && (
                      <Heart className="mt-1 ml-auto h-3 w-3 fill-current text-red-500" />
                    )}
                  </div>
                </div>
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
