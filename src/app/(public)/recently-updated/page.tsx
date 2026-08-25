"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { BookOpen, Clock, ChevronRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useRecentlyUpdatedNovels } from "@/hooks/use-novels";
import {
  formatRelativeTime,
  formatRating,
  getStatusColor,
} from "@/lib/novel-utils";
import { RecentlyUpdatedNovel } from "@/types/api";

type TimeGroup = "today" | "yesterday" | "this-week" | "earlier";

const TIME_GROUP_LABELS: Record<TimeGroup, string> = {
  today: "Today",
  yesterday: "Yesterday",
  "this-week": "This week",
  earlier: "Earlier",
};

const TIME_GROUP_ORDER: TimeGroup[] = [
  "today",
  "yesterday",
  "this-week",
  "earlier",
];

function getTimeGroup(dateString: string): TimeGroup {
  const date = new Date(dateString);
  const now = new Date();
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  );
  const startOfYesterday = new Date(startOfToday);
  startOfYesterday.setDate(startOfYesterday.getDate() - 1);
  const startOfWeek = new Date(startOfToday);
  startOfWeek.setDate(startOfWeek.getDate() - 6);

  if (date >= startOfToday) return "today";
  if (date >= startOfYesterday) return "yesterday";
  if (date >= startOfWeek) return "this-week";
  return "earlier";
}

function UpdateRow({ novel }: { novel: RecentlyUpdatedNovel }) {
  const chapterHref = `/novels/${novel.slug}/chapters/${novel.latest_chapter_number}`;
  const novelHref = `/novels/${novel.slug}`;
  const timeAgo = formatRelativeTime(novel.latest_chapter_created_at);

  return (
    <article className="group relative flex gap-3 py-4 sm:gap-4">
      <Link
        href={novelHref}
        className="relative h-[96px] w-[64px] flex-shrink-0 overflow-hidden rounded-md shadow-sm ring-1 ring-black/5 transition-transform duration-300 group-hover:-translate-y-0.5 dark:ring-white/10 sm:h-[112px] sm:w-[75px]"
      >
        {novel.cover_image ? (
          <Image
            src={novel.cover_image}
            alt={novel.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="75px"
          />
        ) : (
          <div className="from-muted to-muted/50 flex h-full w-full items-center justify-center bg-gradient-to-br">
            <BookOpen className="text-muted-foreground h-6 w-6" />
          </div>
        )}
      </Link>

      <div className="flex min-w-0 flex-1 flex-col justify-between gap-2">
        <div className="space-y-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <Link href={novelHref} className="block">
                <h3 className="group-hover:text-primary line-clamp-1 text-sm font-semibold tracking-tight transition-colors sm:text-base">
                  {novel.title}
                </h3>
              </Link>
              <p className="text-muted-foreground truncate text-xs sm:text-sm">
                {novel.author ?? "Anonymous"}
              </p>
            </div>
            <time
              dateTime={novel.latest_chapter_created_at}
              className="text-muted-foreground flex flex-shrink-0 items-center gap-1 text-[11px] sm:text-xs"
            >
              <Clock className="hidden h-3 w-3 sm:block" />
              {timeAgo}
            </time>
          </div>

          <Link
            href={chapterHref}
            className="text-primary hover:text-primary/80 inline-flex max-w-full items-center gap-1 text-sm font-medium transition-colors"
          >
            <span className="truncate">
              Ch. {novel.latest_chapter_number}
              {novel.latest_chapter_title
                ? ` — ${novel.latest_chapter_title}`
                : ""}
            </span>
            <ChevronRight className="h-3.5 w-3.5 flex-shrink-0 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        <div className="text-muted-foreground flex flex-wrap items-center gap-2 text-[11px] sm:gap-3 sm:text-xs">
          <Badge
            variant={getStatusColor(novel.status)}
            className="h-5 text-[10px]"
            tabIndex={-1}
          >
            {novel.status.charAt(0).toUpperCase() + novel.status.slice(1)}
          </Badge>
          {novel.rating !== null && novel.rating !== undefined && (
            <span className="flex items-center gap-0.5 tabular-nums">
              <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
              {formatRating(novel.rating)}
            </span>
          )}
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
              {novel.genres.length > 1 ? ` +${novel.genres.length - 1}` : ""}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

function UpdateRowSkeleton() {
  return (
    <div className="flex gap-3 py-4 sm:gap-4">
      <Skeleton className="h-[96px] w-[64px] flex-shrink-0 rounded-md sm:h-[112px] sm:w-[75px]" />
      <div className="flex flex-1 flex-col justify-between gap-2 py-0.5">
        <div className="space-y-2">
          <div className="flex justify-between gap-3">
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/3" />
            </div>
            <Skeleton className="h-3 w-12" />
          </div>
          <Skeleton className="h-4 w-2/3" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-10" />
          <Skeleton className="h-5 w-12" />
        </div>
      </div>
    </div>
  );
}

export default function RecentlyUpdatedPage() {
  const [limit, setLimit] = useState(20);
  const { data: novels, loading, error } = useRecentlyUpdatedNovels(limit);

  const grouped = useMemo(() => {
    if (!novels?.length) return [];

    const buckets: Record<TimeGroup, RecentlyUpdatedNovel[]> = {
      today: [],
      yesterday: [],
      "this-week": [],
      earlier: [],
    };

    for (const novel of novels) {
      buckets[getTimeGroup(novel.latest_chapter_created_at)].push(novel);
    }

    return TIME_GROUP_ORDER.filter((key) => buckets[key].length > 0).map(
      (key) => ({
        key,
        label: TIME_GROUP_LABELS[key],
        novels: buckets[key],
      }),
    );
  }, [novels]);

  return (
    <div className="container mx-auto px-4 py-8 md:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Recent updates</h1>
          <p className="text-muted-foreground">
            New chapters as they drop — jump straight into the latest release.
          </p>
        </div>

        {loading ? (
          <div className="divide-y">
            {Array.from({ length: 8 }).map((_, i) => (
              <UpdateRowSkeleton key={i} />
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center py-16 text-center">
            <Clock className="text-muted-foreground mb-4 h-12 w-12" />
            <h2 className="mb-1 text-lg font-medium">Couldn&apos;t load updates</h2>
            <p className="text-muted-foreground mb-4 max-w-sm text-sm">
              {error}
            </p>
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
            >
              Try again
            </Button>
          </div>
        ) : !novels?.length ? (
          <div className="flex flex-col items-center py-16 text-center">
            <Clock className="text-muted-foreground mb-4 h-12 w-12" />
            <h2 className="mb-1 text-lg font-medium">No updates yet</h2>
            <p className="text-muted-foreground mb-4 max-w-sm text-sm">
              Fresh chapters will show up here as authors publish.
            </p>
            <Button variant="outline" asChild>
              <Link href="/browse">Browse novels</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-8">
            {grouped.map((group) => (
              <section key={group.key} className="space-y-1">
                <div className="bg-background/95 sticky top-14 z-10 -mx-1 border-b px-1 py-2 backdrop-blur supports-[backdrop-filter]:bg-background/80 md:top-16">
                  <h2 className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                    {group.label}
                    <span className="text-muted-foreground/60 ml-2 font-normal normal-case tracking-normal">
                      {group.novels.length}
                    </span>
                  </h2>
                </div>
                <div className="divide-y">
                  {group.novels.map((novel) => (
                    <UpdateRow key={novel.id} novel={novel} />
                  ))}
                </div>
              </section>
            ))}

            {novels.length === limit && limit < 50 && (
              <div className="flex justify-center pt-2">
                <Button
                  variant="outline"
                  className="min-w-[160px]"
                  onClick={() => setLimit((prev) => Math.min(prev + 10, 50))}
                >
                  Load more
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
