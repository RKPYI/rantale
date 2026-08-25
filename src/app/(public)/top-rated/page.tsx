"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { BookOpen, Eye, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNovels } from "@/hooks/use-novels";
import {
  formatNumber,
  formatRating,
  getStatusColor,
} from "@/lib/novel-utils";
import { cn } from "@/lib/utils";
import { Novel } from "@/types/api";

type LeaderboardMetric = "rating" | "views";

const TABS = [
  {
    value: "rating" as const,
    label: "Top rated",
    description: "Highest reader scores across the library",
    icon: Star,
  },
  {
    value: "views" as const,
    label: "Most viewed",
    description: "Stories with the most reads",
    icon: Eye,
  },
] as const;

function RankMark({ rank, large = false }: { rank: number; large?: boolean }) {
  const isTopThree = rank <= 3;

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center font-semibold tabular-nums",
        large ? "text-2xl sm:text-3xl" : "w-7 text-sm sm:w-8 sm:text-base",
        !isTopThree && "text-muted-foreground",
        rank === 1 &&
          (large
            ? "text-amber-300"
            : "text-amber-600 dark:text-amber-400"),
        rank === 2 &&
          (large ? "text-white" : "text-slate-500 dark:text-slate-300"),
        rank === 3 &&
          (large
            ? "text-orange-200"
            : "text-orange-700/80 dark:text-orange-400"),
      )}
    >
      {rank}
    </span>
  );
}

function MetricValue({
  novel,
  metric,
  emphasize = false,
}: {
  novel: Novel;
  metric: LeaderboardMetric;
  emphasize?: boolean;
}) {
  if (metric === "rating") {
    if (novel.rating === null || novel.rating === undefined) {
      return <span className="text-muted-foreground">—</span>;
    }

    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 tabular-nums",
          emphasize && "text-base font-semibold sm:text-lg",
        )}
      >
        <Star className="h-3.5 w-3.5 fill-yellow-500 text-yellow-500" />
        {formatRating(novel.rating)}
      </span>
    );
  }

  if (novel.views === null || novel.views === undefined) {
    return <span className="text-muted-foreground">—</span>;
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 tabular-nums",
        emphasize && "text-base font-semibold sm:text-lg",
      )}
    >
      <Eye className="h-3.5 w-3.5" />
      {formatNumber(novel.views)}
    </span>
  );
}

function PodiumCard({
  novel,
  rank,
  metric,
}: {
  novel: Novel;
  rank: number;
  metric: LeaderboardMetric;
}) {
  return (
    <Link
      href={`/novels/${novel.slug}`}
      className={cn(
        "group flex flex-col gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        rank === 1 && "md:-mt-4",
      )}
    >
      <div className="relative aspect-[2/3] overflow-hidden rounded-lg shadow-sm ring-1 ring-black/5 transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-md dark:ring-white/10">
        {novel.cover_image ? (
          <Image
            src={novel.cover_image}
            alt={novel.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 33vw, 220px"
            priority={rank === 1}
          />
        ) : (
          <div className="from-muted to-muted/50 flex h-full w-full items-center justify-center bg-gradient-to-br">
            <BookOpen className="text-muted-foreground h-10 w-10" />
          </div>
        )}

        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 pt-10">
          <div className="flex items-end justify-between gap-2 text-white">
            <RankMark rank={rank} large />
            <div className="text-right text-xs text-white/90 sm:text-sm">
              <MetricValue novel={novel} metric={metric} emphasize />
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-0.5 px-0.5">
        <h3 className="group-hover:text-primary line-clamp-2 text-sm leading-snug font-semibold transition-colors sm:text-base">
          {novel.title}
        </h3>
        <p className="text-muted-foreground truncate text-xs sm:text-sm">
          {novel.author ?? "Anonymous"}
        </p>
      </div>
    </Link>
  );
}

function RankedRow({
  novel,
  rank,
  metric,
}: {
  novel: Novel;
  rank: number;
  metric: LeaderboardMetric;
}) {
  return (
    <Link
      href={`/novels/${novel.slug}`}
      className="group flex items-center gap-3 py-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:gap-4"
    >
      <RankMark rank={rank} />

      <div className="relative h-[72px] w-[48px] flex-shrink-0 overflow-hidden rounded-md shadow-sm ring-1 ring-black/5 transition-transform duration-300 group-hover:-translate-y-0.5 dark:ring-white/10 sm:h-[84px] sm:w-[56px]">
        {novel.cover_image ? (
          <Image
            src={novel.cover_image}
            alt={novel.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="56px"
          />
        ) : (
          <div className="from-muted to-muted/50 flex h-full w-full items-center justify-center bg-gradient-to-br">
            <BookOpen className="text-muted-foreground h-5 w-5" />
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1 space-y-1">
        <div>
          <h3 className="group-hover:text-primary line-clamp-1 text-sm font-semibold tracking-tight transition-colors sm:text-base">
            {novel.title}
          </h3>
          <p className="text-muted-foreground truncate text-xs sm:text-sm">
            {novel.author ?? "Anonymous"}
          </p>
        </div>
        <div className="text-muted-foreground flex flex-wrap items-center gap-2 text-[11px] sm:gap-3 sm:text-xs">
          <Badge
            variant={getStatusColor(novel.status)}
            className="h-5 text-[10px]"
            tabIndex={-1}
          >
            {novel.status.charAt(0).toUpperCase() + novel.status.slice(1)}
          </Badge>
          {novel.total_chapters !== null &&
            novel.total_chapters !== undefined && (
              <span className="flex items-center gap-1">
                <BookOpen className="h-3 w-3" />
                {novel.total_chapters} ch
              </span>
            )}
          {novel.genres?.[0] && (
            <span className="text-muted-foreground/80 hidden truncate sm:inline">
              {novel.genres[0].name}
            </span>
          )}
        </div>
      </div>

      <div className="text-muted-foreground flex-shrink-0 text-xs sm:text-sm">
        <MetricValue novel={novel} metric={metric} />
      </div>
    </Link>
  );
}

function PodiumSkeleton() {
  return (
    <div className="grid grid-cols-3 gap-3 sm:gap-4 md:gap-6">
      {[2, 1, 3].map((rank) => (
        <div
          key={rank}
          className={cn("space-y-3", rank === 1 && "md:-mt-4")}
        >
          <Skeleton className="aspect-[2/3] w-full rounded-lg" />
          <div className="space-y-1.5 px-0.5">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

function RowSkeleton({ rank }: { rank: number }) {
  return (
    <div className="flex items-center gap-3 py-3 sm:gap-4">
      <span className="text-muted-foreground w-7 text-center text-sm tabular-nums sm:w-8">
        {rank}
      </span>
      <Skeleton className="h-[72px] w-[48px] flex-shrink-0 rounded-md sm:h-[84px] sm:w-[56px]" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/3" />
        <Skeleton className="h-5 w-24 rounded-full" />
      </div>
      <Skeleton className="h-4 w-12" />
    </div>
  );
}

function Leaderboard({
  novels,
  loading,
  metric,
}: {
  novels?: Novel[];
  loading: boolean;
  metric: LeaderboardMetric;
}) {
  if (loading) {
    return (
      <div className="space-y-8">
        <PodiumSkeleton />
        <div className="divide-y">
          {Array.from({ length: 7 }).map((_, i) => (
            <RowSkeleton key={i} rank={i + 4} />
          ))}
        </div>
      </div>
    );
  }

  if (!novels?.length) {
    return (
      <div className="flex flex-col items-center py-16 text-center">
        <Star className="text-muted-foreground mb-4 h-12 w-12" />
        <h2 className="mb-1 text-lg font-medium">No rankings yet</h2>
        <p className="text-muted-foreground mb-4 max-w-sm text-sm">
          Check back once readers start rating and reading more stories.
        </p>
        <Button variant="outline" asChild>
          <Link href="/browse">Browse novels</Link>
        </Button>
      </div>
    );
  }

  const topThree = novels.slice(0, 3);
  const rest = novels.slice(3);

  const podium =
    topThree.length >= 3
      ? [
          { novel: topThree[1], rank: 2 },
          { novel: topThree[0], rank: 1 },
          { novel: topThree[2], rank: 3 },
        ]
      : topThree.map((novel, index) => ({ novel, rank: index + 1 }));

  return (
    <div className="space-y-8">
      {podium.length > 0 && (
        <div
          className={cn(
            "grid gap-3 sm:gap-4 md:gap-6",
            podium.length >= 3 ? "grid-cols-3" : "grid-cols-1 sm:grid-cols-3",
          )}
        >
          {podium.map(({ novel, rank }) => (
            <div
              key={novel.id}
              className={cn(
                podium.length >= 3 && rank === 1 && "order-first md:order-none",
                podium.length >= 3 && rank === 2 && "order-2 md:order-none",
                podium.length >= 3 && rank === 3 && "order-3 md:order-none",
              )}
            >
              <PodiumCard novel={novel} rank={rank} metric={metric} />
            </div>
          ))}
        </div>
      )}

      {rest.length > 0 && (
        <div className="divide-y">
          {rest.map((novel, index) => (
            <RankedRow
              key={novel.id}
              novel={novel}
              rank={index + 4}
              metric={metric}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function TopRatedPage() {
  const [activeTab, setActiveTab] = useState<"rating" | "views">("rating");

  const { data: topRatedData, loading: ratingLoading } = useNovels({
    sort_by: "rating",
    per_page: 20,
  });

  const { data: mostViewedData, loading: viewsLoading } = useNovels({
    sort_by: "popular",
    per_page: 20,
  });

  const active = TABS.find((tab) => tab.value === activeTab) ?? TABS[0];

  return (
    <div className="container mx-auto px-4 py-8 md:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Leaderboard</h1>
          <p
            key={active.value}
            className="text-muted-foreground animate-in fade-in-0 slide-in-from-bottom-1 duration-200 motion-reduce:animate-none"
          >
            {active.description}
          </p>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={(value) =>
            setActiveTab(value as "rating" | "views")
          }
          className="gap-6"
        >
          <div className="bg-background/95 sticky top-14 z-10 -mx-4 border-b backdrop-blur supports-[backdrop-filter]:bg-background/80 md:top-16 md:-mx-6 lg:-mx-8">
            <div className="px-4 md:px-6 lg:px-8">
              <TabsList className="bg-transparent text-muted-foreground inline-flex h-auto w-full items-stretch justify-start gap-0 rounded-none p-0">
                {TABS.map((tab) => {
                  const Icon = tab.icon;

                  return (
                    <TabsTrigger
                      key={tab.value}
                      value={tab.value}
                      className={cn(
                        "group relative h-12 flex-none gap-2 rounded-none border-0 bg-transparent px-3.5 text-sm font-medium shadow-none",
                        "text-muted-foreground hover:text-foreground",
                        "data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none",
                        "dark:data-[state=active]:border-transparent dark:data-[state=active]:bg-transparent",
                        "after:bg-primary after:absolute after:inset-x-2 after:bottom-0 after:h-0.5 after:origin-left after:scale-x-0 after:rounded-full after:transition-transform after:duration-200",
                        "data-[state=active]:after:scale-x-100",
                        "sm:px-4",
                      )}
                    >
                      <Icon className="size-3.5 group-data-[state=active]:text-primary" />
                      <span>{tab.label}</span>
                    </TabsTrigger>
                  );
                })}
              </TabsList>
            </div>
          </div>

          <TabsContent value="rating" className="mt-0 outline-none">
            <div className="animate-in fade-in-0 slide-in-from-bottom-1 duration-300 motion-reduce:animate-none">
              <Leaderboard
                novels={topRatedData?.data}
                loading={ratingLoading}
                metric="rating"
              />
            </div>
          </TabsContent>

          <TabsContent value="views" className="mt-0 outline-none">
            <div className="animate-in fade-in-0 slide-in-from-bottom-1 duration-300 motion-reduce:animate-none">
              <Leaderboard
                novels={mostViewedData?.data}
                loading={viewsLoading}
                metric="views"
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
