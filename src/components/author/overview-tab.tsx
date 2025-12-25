"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, PlusCircle, Eye, Star, Users, Edit } from "lucide-react";
import { formatDate, formatNumber } from "@/lib/novel-utils";
import { AuthorNovel, AuthorStats } from "@/types/api";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
}

function StatCard({
  title,
  value,
  icon: Icon,
  change,
  changeType = "positive",
}: StatCardProps) {
  return (
    <Card>
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <p className="text-muted-foreground truncate text-xs font-medium sm:text-sm">
              {title}
            </p>
            <p className="truncate text-xl font-bold sm:text-2xl">{value}</p>
            {change && (
              <p
                className={cn(
                  "truncate text-xs",
                  changeType === "positive" && "text-green-600",
                  changeType === "negative" && "text-red-600",
                  changeType === "neutral" && "text-muted-foreground",
                )}
              >
                {change}
              </p>
            )}
          </div>
          <Icon className="text-muted-foreground h-6 w-6 flex-shrink-0 sm:h-8 sm:w-8" />
        </div>
      </CardContent>
    </Card>
  );
}

interface OverviewTabProps {
  stats: AuthorStats | null;
  statsLoading: boolean;
  novels: AuthorNovel[] | null;
  novelsLoading: boolean;
  onCreateNovel: () => void;
  onEditNovel: (novel: AuthorNovel) => void;
  onViewAllNovels: () => void;
  getStatusColor: (status: string) => string;
}

export function OverviewTab({
  stats,
  statsLoading,
  novels,
  novelsLoading,
  onCreateNovel,
  onEditNovel,
  onViewAllNovels,
  getStatusColor,
}: OverviewTabProps) {
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 lg:gap-6">
        {statsLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4 sm:p-6">
                <Skeleton className="mb-2 h-4 w-16 sm:w-24" />
                <Skeleton className="mb-2 h-6 w-12 sm:h-8 sm:w-16" />
                <Skeleton className="h-3 w-14 sm:w-20" />
              </CardContent>
            </Card>
          ))
        ) : stats ? (
          <>
            <StatCard
              title="Total Novels"
              value={stats.total_novels}
              icon={BookOpen}
            />
            <StatCard
              title="Total Views"
              value={formatNumber(stats.total_views)}
              icon={Eye}
              change={
                stats.monthly_views
                  ? `+${formatNumber(stats.monthly_views)} this month`
                  : undefined
              }
            />
            <StatCard
              title="Avg. Rating"
              value={
                stats.average_rating ? stats.average_rating.toFixed(1) : "—"
              }
              icon={Star}
            />
            <StatCard title="Total Followers" value="—" icon={Users} />
          </>
        ) : (
          <div className="col-span-full">
            <Alert>
              <AlertDescription>Unable to load statistics.</AlertDescription>
            </Alert>
          </div>
        )}
      </div>

      {/* Recent Novels */}
      <Card>
        <CardHeader>
          <CardTitle className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <span className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 flex-shrink-0" />
              <span className="truncate">Recent Novels</span>
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={onViewAllNovels}
              className="w-full sm:w-auto"
            >
              View All
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {novelsLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 flex-shrink-0 rounded" />
                  <div className="min-w-0 flex-1 space-y-2">
                    <Skeleton className="h-4 w-full max-w-[200px]" />
                    <Skeleton className="h-3 w-full max-w-[150px]" />
                  </div>
                </div>
              ))}
            </div>
          ) : novels && novels.length > 0 ? (
            <div className="space-y-4">
              {novels.slice(0, 5).map((novel) => (
                <div
                  key={novel.id}
                  className="hover:bg-muted/50 flex items-center justify-between gap-4 rounded-lg border p-3 transition-colors sm:p-4"
                >
                  <div className="flex min-w-0 flex-1 items-center space-x-3 sm:space-x-4">
                    <img
                      src={novel.cover_image || "/placeholder-book.jpg"}
                      alt={novel.title}
                      className="h-12 w-9 flex-shrink-0 rounded object-cover sm:h-16 sm:w-12"
                    />
                    <div className="min-w-0 flex-1">
                      <h4 className="truncate text-sm font-medium sm:text-base">
                        {novel.title}
                      </h4>
                      <div className="text-muted-foreground flex flex-wrap items-center gap-1 text-xs sm:gap-2 sm:text-sm">
                        <Badge
                          className={cn(
                            getStatusColor(novel.status),
                            "text-xs",
                          )}
                        >
                          {novel.status.charAt(0).toUpperCase() +
                            novel.status.slice(1)}
                        </Badge>
                        <span className="hidden sm:inline">•</span>
                        <span className="truncate">
                          {novel.chapters_count} ch
                        </span>
                        <span className="hidden sm:inline">•</span>
                        <span className="hidden truncate sm:inline">
                          Updated {formatDate(novel.updated_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-shrink-0 items-center space-x-1 sm:space-x-2">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/novels/${novel.slug}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEditNovel(novel)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center">
              <BookOpen className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
              <h3 className="text-base font-medium sm:text-lg">
                No novels yet
              </h3>
              <p className="text-muted-foreground mb-4 text-sm sm:text-base">
                Start your writing journey by creating your first novel.
              </p>
              <Button onClick={onCreateNovel}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Create Novel
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
