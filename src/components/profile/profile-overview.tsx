"use client";

import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock,
  Edit,
  Heart,
  MessageCircle,
  PauseCircle,
  PenTool,
  Bookmark,
  Star,
  Target,
  TrendingUp,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ContinueReading } from "@/components/sections/continue-reading";
import { formatDate } from "@/lib/novel-utils";
import { cn } from "@/lib/utils";
import type { UserProfileStats } from "@/types/api";
import type { UserRole } from "@/lib/user-utils";

const SHELF_SEGMENTS = [
  {
    key: "reading" as const,
    label: "Reading",
    icon: BookOpen,
    className: "text-sky-600 dark:text-sky-400",
    swatch: "bg-sky-500",
    soft: "bg-sky-500/10",
  },
  {
    key: "want_to_read" as const,
    label: "Want to read",
    icon: Bookmark,
    className: "text-amber-600 dark:text-amber-400",
    swatch: "bg-amber-500",
    soft: "bg-amber-500/10",
  },
  {
    key: "completed" as const,
    label: "Completed",
    icon: CheckCircle2,
    className: "text-emerald-600 dark:text-emerald-400",
    swatch: "bg-emerald-500",
    soft: "bg-emerald-500/10",
  },
  {
    key: "on_hold" as const,
    label: "On hold",
    icon: PauseCircle,
    className: "text-orange-600 dark:text-orange-400",
    swatch: "bg-orange-500",
    soft: "bg-orange-500/10",
  },
  {
    key: "dropped" as const,
    label: "Dropped",
    icon: XCircle,
    className: "text-muted-foreground",
    swatch: "bg-muted-foreground/50",
    soft: "bg-muted",
  },
];

const GENRE_PALETTE = [
  "bg-primary",
  "bg-sky-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-violet-500",
  "bg-orange-500",
];

interface ProfileOverviewProps {
  stats: UserProfileStats | null;
  userRole: UserRole;
  onNavigateTab: (tab: string) => void;
}

export function ProfileOverview({
  stats,
  userRole,
  onNavigateTab,
}: ProfileOverviewProps) {
  const library = stats?.library;
  const progress = stats?.reading_progress;
  const activity = stats?.activity;
  const genres = stats?.genre_preferences?.slice(0, 6) ?? [];
  const recent = stats?.recent_activity?.slice(0, 6) ?? [];

  const libraryTotal = library?.total_novels ?? 0;
  const favorites = library?.favorites ?? 0;
  const chaptersRead = progress?.total_chapters_read ?? 0;
  const completed = progress?.completed_novels ?? 0;
  const inProgress = progress?.in_progress_novels ?? 0;
  const avgCompletion = Math.round(progress?.average_completion_rate ?? 0);
  const novelsReading = progress?.total_novels_reading ?? 0;
  const ratings = activity?.total_ratings ?? 0;
  const comments = activity?.total_comments ?? 0;
  const avgRating = activity?.average_rating_given ?? 0;
  const monthRatings = activity?.this_month.ratings ?? 0;
  const monthComments = activity?.this_month.comments ?? 0;

  const shelfData = SHELF_SEGMENTS.map((seg) => ({
    ...seg,
    value: library?.by_status[seg.key] ?? 0,
  })).filter((seg) => seg.value > 0);

  const maxGenre = Math.max(1, ...genres.map((g) => g.count));

  return (
    <div className="flex flex-col gap-5 sm:gap-6">
      <ContinueReading variant="card" showTitle={true} />

      {/* Snapshot metrics */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <MetricTile
          label="Chapters read"
          value={chaptersRead}
          icon={BookOpen}
          tone="text-sky-600 dark:text-sky-400"
          soft="bg-sky-500/10"
        />
        <MetricTile
          label="Avg. completion"
          value={`${avgCompletion}%`}
          icon={Target}
          tone="text-emerald-600 dark:text-emerald-400"
          soft="bg-emerald-500/10"
          onClick={() => onNavigateTab("reading")}
        />
        <MetricTile
          label="Ratings given"
          value={ratings}
          icon={Star}
          tone="text-amber-600 dark:text-amber-400"
          soft="bg-amber-500/10"
          onClick={() => onNavigateTab("ratings")}
        />
        <MetricTile
          label="Comments"
          value={comments}
          icon={MessageCircle}
          tone="text-violet-600 dark:text-violet-400"
          soft="bg-violet-500/10"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-12">
        {/* Shelf donut */}
        <Card className="overflow-hidden border-border/80 shadow-none lg:col-span-5">
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between gap-3">
              <div>
                <CardTitle className="text-base font-semibold tracking-tight sm:text-lg">
                  Shelf mix
                </CardTitle>
                <p className="text-muted-foreground mt-1 text-sm">
                  {libraryTotal === 0
                    ? "Nothing on your shelf yet"
                    : `${libraryTotal} novel${libraryTotal === 1 ? "" : "s"} organized`}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="shrink-0"
                onClick={() => onNavigateTab("library")}
              >
                Open
                <ArrowRight className="size-3.5" aria-hidden />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {libraryTotal === 0 ? (
              <EmptyShelfHint />
            ) : (
              <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center">
                <DonutChart
                  segments={shelfData.map((s) => ({
                    value: s.value,
                    colorClass: s.swatch,
                    label: s.label,
                  }))}
                  centerValue={libraryTotal}
                  centerLabel="total"
                />
                <ul className="w-full flex-1 space-y-2">
                  {shelfData.map((seg) => {
                    const Icon = seg.icon;
                    const pct = Math.round((seg.value / libraryTotal) * 100);
                    return (
                      <li
                        key={seg.key}
                        className="flex items-center justify-between gap-3 text-sm"
                      >
                        <span className="flex min-w-0 items-center gap-2">
                          <span
                            className={cn(
                              "flex size-7 shrink-0 items-center justify-center rounded-lg",
                              seg.soft,
                              seg.className,
                            )}
                          >
                            <Icon className="size-3.5" aria-hidden />
                          </span>
                          <span className="truncate">{seg.label}</span>
                        </span>
                        <span className="flex shrink-0 items-center gap-2 tabular-nums">
                          <span className="text-muted-foreground text-xs">
                            {pct}%
                          </span>
                          <span className="font-semibold">{seg.value}</span>
                        </span>
                      </li>
                    );
                  })}
                  {favorites > 0 && (
                    <li className="border-border/60 flex items-center justify-between gap-3 border-t pt-2 text-sm">
                      <span className="text-muted-foreground flex items-center gap-2">
                        <Heart
                          className="size-3.5 fill-current text-primary"
                          aria-hidden
                        />
                        Favorites
                      </span>
                      <span className="font-semibold tabular-nums">
                        {favorites}
                      </span>
                    </li>
                  )}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Reading pulse */}
        <Card className="overflow-hidden border-border/80 shadow-none lg:col-span-7">
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between gap-3">
              <div>
                <CardTitle className="text-base font-semibold tracking-tight sm:text-lg">
                  Reading pulse
                </CardTitle>
                <p className="text-muted-foreground mt-1 text-sm">
                  How far you get through the books you start
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="shrink-0"
                onClick={() => onNavigateTab("reading")}
              >
                Stats
                <ArrowRight className="size-3.5" aria-hidden />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
              <CompletionRing percent={avgCompletion} />

              <div className="flex-1 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <MiniStat label="In progress" value={inProgress} />
                  <MiniStat label="Finished" value={completed} />
                  <MiniStat label="Novels started" value={novelsReading} />
                  <MiniStat
                    label="Avg. rating given"
                    value={
                      ratings > 0 ? (
                        <>
                          {avgRating.toFixed(1)}
                          <span className="text-muted-foreground text-sm font-normal">
                            /5
                          </span>
                        </>
                      ) : (
                        "—"
                      )
                    }
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      Finish rate among started
                    </span>
                    <span className="font-medium tabular-nums">
                      {novelsReading > 0
                        ? `${Math.round((completed / novelsReading) * 100)}%`
                        : "—"}
                    </span>
                  </div>
                  <Progress
                    value={
                      novelsReading > 0
                        ? Math.min((completed / novelsReading) * 100, 100)
                        : 0
                    }
                    className="h-2"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-12">
        {/* Genre preferences */}
        <Card className="overflow-hidden border-border/80 shadow-none lg:col-span-5">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base font-semibold tracking-tight sm:text-lg">
              <TrendingUp
                className="text-muted-foreground size-4"
                aria-hidden
              />
              Genre taste
            </CardTitle>
            <p className="text-muted-foreground text-sm">
              What shows up most in your library
            </p>
          </CardHeader>
          <CardContent>
            {genres.length > 0 ? (
              <ul className="space-y-3">
                {genres.map((genre, idx) => {
                  const width = `${Math.max((genre.count / maxGenre) * 100, 6)}%`;
                  return (
                    <li key={genre.id} className="space-y-1.5">
                      <div className="flex items-center justify-between gap-3 text-sm">
                        <span className="truncate font-medium">
                          {genre.name}
                        </span>
                        <span className="text-muted-foreground shrink-0 tabular-nums text-xs">
                          {genre.count}
                        </span>
                      </div>
                      <div className="bg-muted h-2 overflow-hidden rounded-full">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all duration-500",
                            GENRE_PALETTE[idx % GENRE_PALETTE.length],
                          )}
                          style={{ width }}
                        />
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="rounded-2xl border border-dashed px-4 py-10 text-center">
                <p className="text-sm font-medium">No genre data yet</p>
                <p className="text-muted-foreground mt-1 text-xs">
                  Add novels to your library to see preferences
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* This month + activity */}
        <div className="flex flex-col gap-4 sm:gap-5 lg:col-span-7">
          <Card className="overflow-hidden border-border/80 shadow-none">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold tracking-tight sm:text-lg">
                This month
              </CardTitle>
              <p className="text-muted-foreground text-sm">
                Ratings and comments so far
              </p>
            </CardHeader>
            <CardContent>
              <MonthActivityChart
                ratings={monthRatings}
                comments={monthComments}
              />
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-border/80 shadow-none">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-3">
                <CardTitle className="flex items-center gap-2 text-base font-semibold tracking-tight sm:text-lg">
                  <Clock
                    className="text-muted-foreground size-4"
                    aria-hidden
                  />
                  Recent activity
                </CardTitle>
                {recent.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="shrink-0"
                    onClick={() => onNavigateTab("reading")}
                  >
                    More
                    <ArrowRight className="size-3.5" aria-hidden />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {recent.length > 0 ? (
                <ul className="space-y-0.5">
                  {recent.map((item, idx) => (
                    <li key={`${item.timestamp}-${idx}`}>
                      <Link
                        href={`/novels/${item.novel.slug}`}
                        className="hover:bg-muted/70 -mx-2 flex gap-3 rounded-xl px-2 py-2.5 transition-colors"
                      >
                        <span className="bg-primary/10 text-primary mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full">
                          {item.type === "reading" ? (
                            <BookOpen className="size-3.5" aria-hidden />
                          ) : item.type === "comment" ? (
                            <Edit className="size-3.5" aria-hidden />
                          ) : (
                            <Star className="size-3.5" aria-hidden />
                          )}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium">
                            {item.novel.title}
                          </span>
                          <span className="text-muted-foreground block text-xs">
                            {item.type === "reading"
                              ? item.chapter
                                ? `Ch. ${item.chapter.number}`
                                : "Continued reading"
                              : item.type === "comment"
                                ? "Left a comment"
                                : `Rated ${item.rating}/5`}
                            {" · "}
                            {formatDate(item.timestamp)}
                          </span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="py-8 text-center">
                  <Clock
                    className="text-muted-foreground mx-auto mb-3 size-9 opacity-60"
                    aria-hidden
                  />
                  <p className="text-sm font-medium">No recent activity</p>
                  <p className="text-muted-foreground mt-1 text-xs">
                    Start a novel to see it here
                  </p>
                  <Button
                    asChild
                    size="sm"
                    variant="outline"
                    className="mt-4"
                  >
                    <Link href="/browse">Browse novels</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {userRole === "user" && (
        <Link
          href="/author"
          className="group relative flex flex-col gap-3 overflow-hidden rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/[0.06] via-background to-muted/30 p-5 transition-colors hover:border-primary/25 sm:flex-row sm:items-center sm:justify-between sm:p-6"
        >
          <div className="relative flex items-start gap-3">
            <span className="bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-xl">
              <PenTool className="size-4" aria-hidden />
            </span>
            <div>
              <p className="font-medium tracking-tight">Write your own story</p>
              <p className="text-muted-foreground mt-0.5 text-sm">
                Apply to become an author and publish on Rantale.
              </p>
            </div>
          </div>
          <span className="text-primary relative inline-flex items-center gap-1 text-sm font-medium">
            Get started
            <ArrowRight
              className="size-3.5 transition-transform group-hover:translate-x-0.5"
              aria-hidden
            />
          </span>
        </Link>
      )}
    </div>
  );
}

function MetricTile({
  label,
  value,
  icon: Icon,
  tone,
  soft,
  onClick,
}: {
  label: string;
  value: React.ReactNode;
  icon: React.ElementType;
  tone: string;
  soft: string;
  onClick?: () => void;
}) {
  const content = (
    <div className="flex items-start justify-between gap-2">
      <div className="min-w-0">
        <p className="text-muted-foreground text-xs font-medium sm:text-sm">
          {label}
        </p>
        <p className="mt-1 text-xl font-semibold tracking-tight tabular-nums sm:text-2xl">
          {value}
        </p>
      </div>
      <span
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-xl sm:size-9",
          soft,
          tone,
        )}
      >
        <Icon className="size-4" aria-hidden />
      </span>
    </div>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="rounded-2xl border border-border/80 bg-card p-3 text-left transition-colors hover:bg-muted/40 focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none sm:p-4"
      >
        {content}
      </button>
    );
  }

  return (
    <div className="rounded-2xl border border-border/80 bg-card p-3 sm:p-4">
      {content}
    </div>
  );
}

function MiniStat({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="rounded-xl bg-muted/50 px-3 py-2.5">
      <p className="text-muted-foreground text-xs">{label}</p>
      <p className="mt-0.5 text-lg font-semibold tabular-nums tracking-tight">
        {value}
      </p>
    </div>
  );
}

function DonutChart({
  segments,
  centerValue,
  centerLabel,
}: {
  segments: Array<{ value: number; colorClass: string; label: string }>;
  centerValue: number;
  centerLabel: string;
}) {
  const size = 148;
  const stroke = 18;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const total = segments.reduce((sum, s) => sum + s.value, 0) || 1;
  let offset = 0;

  const colorMap: Record<string, string> = {
    "bg-sky-500": "#0ea5e9",
    "bg-amber-500": "#f59e0b",
    "bg-emerald-500": "#10b981",
    "bg-orange-500": "#f97316",
    "bg-muted-foreground/50": "#94a3b8",
  };

  return (
    <div
      className="relative shrink-0"
      style={{ width: size, height: size }}
      role="img"
      aria-label={`Library shelf: ${segments
        .map((s) => `${s.label} ${s.value}`)
        .join(", ")}`}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          className="stroke-muted"
          strokeWidth={stroke}
        />
        {segments.map((seg) => {
          const length = (seg.value / total) * circumference;
          const dashOffset = -offset;
          offset += length;
          return (
            <circle
              key={seg.label}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={colorMap[seg.colorClass] ?? "#e11d48"}
              strokeWidth={stroke}
              strokeDasharray={`${length} ${circumference - length}`}
              strokeDashoffset={dashOffset}
              strokeLinecap="butt"
              className="transition-all duration-500"
            />
          );
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-semibold tabular-nums tracking-tight">
          {centerValue}
        </span>
        <span className="text-muted-foreground text-[11px] uppercase tracking-wide">
          {centerLabel}
        </span>
      </div>
    </div>
  );
}

function CompletionRing({ percent }: { percent: number }) {
  const size = 128;
  const stroke = 10;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(Math.max(percent, 0), 100);
  const filled = (clamped / 100) * circumference;

  return (
    <div
      className="relative mx-auto shrink-0 sm:mx-0"
      style={{ width: size, height: size }}
      role="img"
      aria-label={`Average completion ${clamped}%`}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          className="stroke-muted"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          className="stroke-emerald-500 transition-all duration-700"
          strokeWidth={stroke}
          strokeDasharray={`${filled} ${circumference - filled}`}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-semibold tabular-nums tracking-tight">
          {clamped}
          <span className="text-muted-foreground text-base font-medium">%</span>
        </span>
        <span className="text-muted-foreground text-[11px]">avg complete</span>
      </div>
    </div>
  );
}

function MonthActivityChart({
  ratings,
  comments,
}: {
  ratings: number;
  comments: number;
}) {
  const max = Math.max(ratings, comments, 1);
  const hasActivity = ratings > 0 || comments > 0;

  if (!hasActivity) {
    return (
      <div className="rounded-2xl border border-dashed px-4 py-8 text-center">
        <p className="text-sm font-medium">Quiet month so far</p>
        <p className="text-muted-foreground mt-1 text-xs">
          Rate or comment on a novel to fill this in
        </p>
      </div>
    );
  }

  const bars = [
    {
      label: "Ratings",
      value: ratings,
      className: "bg-amber-500",
      soft: "bg-amber-500/10",
      icon: Star,
    },
    {
      label: "Comments",
      value: comments,
      className: "bg-violet-500",
      soft: "bg-violet-500/10",
      icon: MessageCircle,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4">
      {bars.map(({ label, value, className, soft, icon: Icon }) => (
        <div key={label} className={cn("rounded-2xl p-4", soft)}>
          <div className="flex items-center justify-between gap-2">
            <span className="text-muted-foreground flex items-center gap-1.5 text-xs font-medium">
              <Icon className="size-3.5" aria-hidden />
              {label}
            </span>
            <span className="text-xl font-semibold tabular-nums">{value}</span>
          </div>
          <div className="bg-background/60 mt-3 h-2 overflow-hidden rounded-full">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500",
                className,
              )}
              style={{
                width: `${Math.max((value / max) * 100, value > 0 ? 8 : 0)}%`,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyShelfHint() {
  return (
    <div className="rounded-2xl border border-dashed px-6 py-10 text-center">
      <BookOpen
        className="text-muted-foreground mx-auto mb-3 size-10 opacity-60"
        aria-hidden
      />
      <h3 className="text-sm font-medium sm:text-base">Your shelf is empty</h3>
      <p className="text-muted-foreground mx-auto mt-1 max-w-xs text-xs sm:text-sm">
        Add novels as you browse to track progress and favorites.
      </p>
      <Button asChild size="sm" className="mt-4">
        <Link href="/browse">
          Browse novels
          <ArrowRight className="size-3.5" aria-hidden />
        </Link>
      </Button>
    </div>
  );
}
