"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart3,
  BookOpen,
  Clock,
  Target,
  TrendingUp,
  Heart,
  Star,
  MessageCircle,
  ArrowRight,
} from "lucide-react";
import { useProfileStats } from "@/hooks/use-profile-stats";
import { formatDate } from "@/lib/novel-utils";
import { ContinueReading } from "@/components/sections/continue-reading";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";

export function ReadingStats() {
  const { data: stats, loading } = useProfileStats();

  if (loading) {
    return <ReadingStatsSkeleton />;
  }

  if (!stats) {
    return (
      <div className="rounded-2xl border border-dashed px-6 py-14 text-center">
        <BookOpen
          className="text-muted-foreground mx-auto mb-3 size-10 opacity-60"
          aria-hidden
        />
        <h3 className="text-base font-medium">No reading data yet</h3>
        <p className="text-muted-foreground mx-auto mt-1 max-w-sm text-sm">
          Start a novel and your progress, ratings, and activity will show up
          here.
        </p>
        <Button asChild size="sm" className="mt-5">
          <Link href="/browse">
            Browse novels
            <ArrowRight className="size-3.5" aria-hidden />
          </Link>
        </Button>
      </div>
    );
  }

  const library = stats.library;
  const readingProgress = stats.reading_progress;
  const activity = stats.activity;
  const recentActivity = stats.recent_activity.slice(0, 5);

  const overview = [
    {
      label: "Novels read",
      value: readingProgress.total_novels_reading,
      icon: BookOpen,
      tone: "text-sky-600 dark:text-sky-400",
      soft: "bg-sky-500/10",
    },
    {
      label: "Completed",
      value: readingProgress.completed_novels,
      icon: Target,
      tone: "text-emerald-600 dark:text-emerald-400",
      soft: "bg-emerald-500/10",
    },
    {
      label: "Favorites",
      value: library.favorites,
      icon: Heart,
      tone: "text-primary",
      soft: "bg-primary/10",
    },
    {
      label: "Comments",
      value: activity.total_comments,
      icon: MessageCircle,
      tone: "text-violet-600 dark:text-violet-400",
      soft: "bg-violet-500/10",
    },
  ];

  const statusRows = [
    {
      key: "reading",
      label: "Reading",
      count: library.by_status.reading,
      color: "bg-sky-500",
      soft: "bg-sky-500/10",
    },
    {
      key: "want_to_read",
      label: "Want to read",
      count: library.by_status.want_to_read,
      color: "bg-amber-500",
      soft: "bg-amber-500/10",
    },
    {
      key: "completed",
      label: "Completed",
      count: library.by_status.completed,
      color: "bg-emerald-500",
      soft: "bg-emerald-500/10",
    },
    {
      key: "on_hold",
      label: "On hold",
      count: library.by_status.on_hold,
      color: "bg-orange-500",
      soft: "bg-orange-500/10",
    },
    {
      key: "dropped",
      label: "Dropped",
      count: library.by_status.dropped,
      color: "bg-muted-foreground/50",
      soft: "bg-muted",
    },
  ].filter((row) => row.count > 0);

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        {overview.map(({ label, value, icon: Icon, tone, soft }) => (
          <Card key={label} className="border-border/80 shadow-none">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-muted-foreground text-xs font-medium sm:text-sm">
                    {label}
                  </p>
                  <p className="mt-1 text-2xl font-semibold tabular-nums tracking-tight">
                    {value}
                  </p>
                </div>
                <span
                  className={cn(
                    "flex size-9 shrink-0 items-center justify-center rounded-xl",
                    soft,
                    tone,
                  )}
                >
                  <Icon className="size-4" aria-hidden />
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 lg:gap-6">
        <Card className="border-border/80 shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base font-semibold tracking-tight sm:text-lg">
              <BarChart3 className="text-muted-foreground size-4" aria-hidden />
              Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <ProgressRow
              label="In progress"
              valueLabel={`${readingProgress.in_progress_novels}`}
              percent={Math.min(
                (readingProgress.in_progress_novels /
                  (readingProgress.total_novels_reading || 1)) *
                  100,
                100,
              )}
              barClass="bg-sky-500"
            />
            <ProgressRow
              label="Average completion"
              valueLabel={`${Math.round(readingProgress.average_completion_rate)}%`}
              percent={readingProgress.average_completion_rate}
              barClass="bg-emerald-500"
            />

            <div className="border-border/60 space-y-2 border-t pt-4">
              <p className="text-sm font-medium">This month</p>
              <div className="text-muted-foreground flex flex-col gap-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Star className="size-3.5" aria-hidden />
                    Ratings
                  </span>
                  <span className="text-foreground font-medium tabular-nums">
                    {activity.this_month.ratings}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <MessageCircle className="size-3.5" aria-hidden />
                    Comments
                  </span>
                  <span className="text-foreground font-medium tabular-nums">
                    {activity.this_month.comments}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base font-semibold tracking-tight sm:text-lg">
              <Star className="text-muted-foreground size-4" aria-hidden />
              Library status
            </CardTitle>
            <p className="text-muted-foreground text-sm">
              {library.total_novels} novel
              {library.total_novels === 1 ? "" : "s"} organized
            </p>
          </CardHeader>
          <CardContent>
            {statusRows.length > 0 ? (
              <div className="space-y-2">
                {statusRows.map((row) => (
                  <div
                    key={row.key}
                    className={cn(
                      "flex items-center justify-between rounded-xl px-3 py-2.5",
                      row.soft,
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={cn("size-2.5 rounded-full", row.color)}
                      />
                      <span className="text-sm font-medium">{row.label}</span>
                    </div>
                    <span className="text-sm font-semibold tabular-nums">
                      {row.count}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground py-6 text-center text-sm">
                No novels in library yet
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/80 shadow-none">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base font-semibold tracking-tight sm:text-lg">
            <TrendingUp className="text-muted-foreground size-4" aria-hidden />
            Overall
          </CardTitle>
          <p className="text-muted-foreground text-sm">
            {readingProgress.total_novels_reading} with reading progress ·{" "}
            {library.total_novels} in library
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <StatBlock
              label="Chapters read"
              value={readingProgress.total_chapters_read}
            />
            <StatBlock
              label="Avg. completion"
              value={`${Math.round(readingProgress.average_completion_rate)}%`}
            />
            <StatBlock label="Ratings given" value={activity.total_ratings} />
            <StatBlock
              label="Avg. rating"
              value={
                <>
                  {activity.average_rating_given.toFixed(1)}
                  <span className="text-muted-foreground text-sm font-normal">
                    /5
                  </span>
                </>
              }
            />
          </div>

          <ContinueReading className="mt-6" showTitle={true} />
        </CardContent>
      </Card>

      <Card className="border-border/80 shadow-none">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base font-semibold tracking-tight sm:text-lg">
            <Clock className="text-muted-foreground size-4" aria-hidden />
            Recent activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentActivity.length > 0 ? (
            <ul className="divide-y overflow-hidden rounded-2xl border">
              {recentActivity.map((item, idx) => (
                <li key={`${item.timestamp}-${idx}`}>
                  <Link
                    href={`/novels/${item.novel.slug}`}
                    className="hover:bg-muted/50 flex items-center justify-between gap-3 p-3 transition-colors sm:p-4"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-full">
                        {item.type === "reading" ? (
                          <BookOpen className="size-4" aria-hidden />
                        ) : item.type === "comment" ? (
                          <MessageCircle className="size-4" aria-hidden />
                        ) : (
                          <Star className="size-4" aria-hidden />
                        )}
                      </span>
                      <div className="min-w-0">
                        <h4 className="truncate text-sm font-medium">
                          {item.novel.title}
                        </h4>
                        <p className="text-muted-foreground truncate text-xs">
                          {item.type === "reading" && item.chapter
                            ? `Chapter ${item.chapter.number}: ${item.chapter.title}`
                            : item.type === "comment"
                              ? `${item.content?.slice(0, 50) ?? ""}…`
                              : `Rated ${item.rating}/5`}
                        </p>
                      </div>
                    </div>
                    <p className="text-muted-foreground shrink-0 text-xs">
                      {formatDate(item.timestamp)}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="py-8 text-center">
              <Clock
                className="text-muted-foreground mx-auto mb-2 size-8 opacity-60"
                aria-hidden
              />
              <p className="text-muted-foreground text-sm">No recent activity</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ProgressRow({
  label,
  valueLabel,
  percent,
  barClass,
}: {
  label: string;
  valueLabel: string;
  percent: number;
  barClass: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm">{label}</span>
        <Badge variant="outline" className="tabular-nums">
          {valueLabel}
        </Badge>
      </div>
      <div className="bg-muted h-2 w-full overflow-hidden rounded-full">
        <div
          className={cn("h-full rounded-full transition-all", barClass)}
          style={{ width: `${Math.min(Math.max(percent, 0), 100)}%` }}
        />
      </div>
    </div>
  );
}

function StatBlock({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <p className="text-muted-foreground text-xs">{label}</p>
      <p className="text-2xl font-semibold tabular-nums tracking-tight">
        {value}
      </p>
    </div>
  );
}

function ReadingStatsSkeleton() {
  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <Skeleton key={i} className="h-56 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-40 rounded-xl" />
    </div>
  );
}
