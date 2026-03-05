"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BookOpen,
  PlusCircle,
  Eye,
  Star,
  Edit,
  FileText,
  Award,
} from "lucide-react";
import { formatDate, formatNumber } from "@/lib/novel-utils";
import { AuthorNovel, AuthorStats } from "@/types/api";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  subtitle?: string;
  variant?: "default" | "primary" | "success" | "warning";
}

function StatCard({
  title,
  value,
  icon: Icon,
  subtitle,
  variant = "default",
}: StatCardProps) {
  const variantStyles = {
    default: "bg-background",
    primary: "bg-primary/5 border-primary/20",
    success: "bg-green-500/5 border-green-500/20",
    warning: "bg-yellow-500/5 border-yellow-500/20",
  };

  return (
    <Card
      className={cn("transition-all hover:shadow-md", variantStyles[variant])}
    >
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <p className="text-muted-foreground truncate text-xs font-medium sm:text-sm">
              {title}
            </p>
            <p className="truncate text-xl font-bold sm:text-2xl">{value}</p>
            {subtitle && (
              <p className="text-muted-foreground truncate text-xs">
                {subtitle}
              </p>
            )}
          </div>
          <div
            className={cn(
              "flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg sm:h-12 sm:w-12",
              variant === "primary" && "bg-primary/10",
              variant === "success" && "bg-green-500/10",
              variant === "warning" && "bg-yellow-500/10",
              variant === "default" && "bg-muted",
            )}
          >
            <Icon
              className={cn(
                "h-5 w-5 sm:h-6 sm:w-6",
                variant === "primary" && "text-primary",
                variant === "success" && "text-green-600 dark:text-green-400",
                variant === "warning" && "text-yellow-600 dark:text-yellow-400",
                variant === "default" && "text-muted-foreground",
              )}
            />
          </div>
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
      {/* Quick Stats Summary */}
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
              title="Total Books"
              value={stats.content_stats.total_novels}
              icon={BookOpen}
              variant="primary"
            />
            <StatCard
              title="Total Chapters"
              value={formatNumber(stats.content_stats.total_chapters)}
              icon={FileText}
            />
            <StatCard
              title="Total Views"
              value={formatNumber(stats.engagement_stats.total_views)}
              icon={Eye}
            />
            <StatCard
              title="Avg. Rating"
              value={
                stats.quality_stats.average_rating
                  ? stats.quality_stats.average_rating.toFixed(1)
                  : "—"
              }
              icon={Star}
              variant={
                stats.quality_stats.average_rating &&
                stats.quality_stats.average_rating >= 4
                  ? "success"
                  : "default"
              }
            />
          </>
        ) : (
          <div className="col-span-full">
            <Alert>
              <AlertDescription>Unable to load statistics.</AlertDescription>
            </Alert>
          </div>
        )}
      </div>

      {/* Chapter Workflow Alert */}
      {!statsLoading &&
        stats?.chapter_workflow &&
        (stats.chapter_workflow.pending_review > 0 ||
          stats.chapter_workflow.revision_requested > 0) && (
          <Alert>
            <FileText className="h-4 w-4" />
            <AlertDescription>
              {stats.chapter_workflow.pending_review > 0 && (
                <span className="mr-4">
                  <strong>{stats.chapter_workflow.pending_review}</strong>{" "}
                  chapter(s) pending editor review
                </span>
              )}
              {stats.chapter_workflow.revision_requested > 0 && (
                <span className="text-destructive">
                  <strong>{stats.chapter_workflow.revision_requested}</strong>{" "}
                  chapter(s) need revision
                </span>
              )}
            </AlertDescription>
          </Alert>
        )}

      {/* Top Novel Highlight */}
      {!statsLoading && stats?.top_novel && (
        <Card className="border-primary/20 from-primary/5 bg-gradient-to-br to-transparent">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-yellow-500" />
              Top Performing Book
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <h4 className="text-lg font-semibold">
                  {stats.top_novel.title}
                </h4>
                <Button variant="link" size="sm" asChild className="h-auto p-0">
                  <Link href={`/novels/${stats.top_novel.slug}`}>
                    View Book →
                  </Link>
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="bg-background/50 rounded-lg p-3">
                  <p className="text-muted-foreground text-xs">Views</p>
                  <p className="text-lg font-bold">
                    {formatNumber(stats.top_novel.views)}
                  </p>
                </div>
                <div className="bg-background/50 rounded-lg p-3">
                  <p className="text-muted-foreground text-xs">Rating</p>
                  <p className="text-lg font-bold">
                    {stats.top_novel.rating
                      ? stats.top_novel.rating.toFixed(2)
                      : "—"}
                  </p>
                </div>
                <div className="bg-background/50 rounded-lg p-3">
                  <p className="text-muted-foreground text-xs">Ratings</p>
                  <p className="text-lg font-bold">
                    {formatNumber(stats.top_novel.rating_count)}
                  </p>
                </div>
                <div className="bg-background/50 rounded-lg p-3">
                  <p className="text-muted-foreground text-xs">Comments</p>
                  <p className="text-lg font-bold">
                    {formatNumber(stats.top_novel.comments)}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Novels */}
      <Card>
        <CardHeader>
          <CardTitle className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <span className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 flex-shrink-0" />
              <span className="truncate">Recent Books</span>
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
                    {novel.cover_image ? (
                      <img
                        src={novel.cover_image}
                        alt={novel.title}
                        className="h-12 w-9 flex-shrink-0 rounded object-cover sm:h-16 sm:w-12"
                      />
                    ) : (
                      <div className="from-muted to-muted/50 flex h-12 w-9 flex-shrink-0 items-center justify-center rounded bg-gradient-to-br sm:h-16 sm:w-12">
                        <BookOpen className="text-muted-foreground h-5 w-5 sm:h-6 sm:w-6" />
                      </div>
                    )}
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
              <h3 className="text-base font-medium sm:text-lg">No books yet</h3>
              <p className="text-muted-foreground mb-4 text-sm sm:text-base">
                Start your writing journey by creating your first book.
              </p>
              <Button onClick={onCreateNovel}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Create Book
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
