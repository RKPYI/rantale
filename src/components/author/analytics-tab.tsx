"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart3, TrendingUp } from "lucide-react";
import { formatNumber } from "@/lib/novel-utils";
import { AuthorNovel, AuthorStats } from "@/types/api";

interface AnalyticsTabProps {
  stats: AuthorStats | null;
  statsLoading: boolean;
  novels: AuthorNovel[] | null;
  novelsLoading: boolean;
}

export function AnalyticsTab({
  stats,
  statsLoading,
  novels,
  novelsLoading,
}: AnalyticsTabProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 flex-shrink-0" />
            <span className="truncate">Performance Overview</span>
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
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm">Total Views</span>
                <span className="text-sm font-medium sm:text-base">
                  {formatNumber(stats.total_views)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm">Monthly Views</span>
                <span className="text-sm font-medium sm:text-base">
                  {formatNumber(stats.monthly_views || 0)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm">Average Rating</span>
                <span className="text-sm font-medium sm:text-base">
                  {stats.average_rating ? stats.average_rating.toFixed(1) : "—"}
                </span>
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
            <TrendingUp className="h-5 w-5 flex-shrink-0" />
            <span className="truncate">Top Performing Novels</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {novelsLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
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
                    className="flex items-center justify-between gap-2"
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-2">
                      <span className="w-4 flex-shrink-0 font-mono text-xs sm:text-sm">
                        #{index + 1}
                      </span>
                      <span className="truncate text-xs sm:text-sm">
                        {novel.title}
                      </span>
                    </div>
                    <span className="text-muted-foreground flex-shrink-0 text-xs sm:text-sm">
                      {formatNumber(novel.views_count)} views
                    </span>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-xs sm:text-sm">
              No published novels yet.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
