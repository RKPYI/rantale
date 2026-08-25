"use client";

import Link from "next/link";
import Image from "next/image";
import { BookOpen, ChevronRight, Sparkles, Star } from "lucide-react";
import { useRelatedNovels } from "@/hooks/use-novels";
import { useMediaQuery } from "@/hooks/use-media-query";
import { formatRating, formatNumber } from "@/lib/novel-utils";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import type { RelatedNovel } from "@/types/novel";

interface RelatedNovelsProps {
  novelSlug: string;
  className?: string;
  /** @deprecated Unused — kept for call-site compatibility */
  layout?: "horizontal" | "compact";
  maxItems?: number;
  mobileMaxItems?: number;
  desktopMaxItems?: number;
}

function formatMatchPercent(score: number): number | null {
  if (!Number.isFinite(score) || score <= 0) return null;
  const percent = score <= 1 ? Math.round(score * 100) : Math.round(score);
  if (percent < 1 || percent > 100) return null;
  return percent;
}

export function RelatedNovels({
  novelSlug,
  className,
  maxItems,
  mobileMaxItems = 6,
  desktopMaxItems = 3,
}: RelatedNovelsProps) {
  const { data: relatedNovels, loading } = useRelatedNovels(novelSlug);
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  const actualMaxItems =
    maxItems ?? (isDesktop ? desktopMaxItems : mobileMaxItems);

  if (!loading && (!relatedNovels || relatedNovels.length === 0)) {
    return null;
  }

  const novels = relatedNovels?.slice(0, actualMaxItems) ?? [];
  const skeletonCount = isDesktop ? desktopMaxItems : Math.min(mobileMaxItems, 4);

  return (
    <section className={cn("space-y-4", className)} aria-labelledby="related-novels-heading">
      <div>
        <h2
          id="related-novels-heading"
          className="text-lg font-semibold tracking-tight"
        >
          More like this
        </h2>
        <p className="text-muted-foreground text-sm">
          Similar titles based on genres and themes
        </p>
      </div>

      <ul className="divide-y overflow-hidden rounded-2xl border">
        {loading
          ? Array.from({ length: skeletonCount }).map((_, i) => (
              <li key={i}>
                <RelatedNovelRowSkeleton />
              </li>
            ))
          : novels.map((novel) => (
              <li key={novel.id}>
                <RelatedNovelRow novel={novel} />
              </li>
            ))}
      </ul>
    </section>
  );
}

function RelatedNovelRow({ novel }: { novel: RelatedNovel }) {
  const matchPercent = formatMatchPercent(novel.similarity_score);
  const primaryGenre = novel.genres?.[0]?.name;

  return (
    <Link
      href={`/novels/${novel.slug}`}
      className={cn(
        "group flex items-center gap-3 px-3 py-3 transition-colors sm:gap-3.5 sm:px-3.5",
        "hover:bg-muted/60 focus-visible:bg-muted/60 focus-visible:outline-none",
      )}
    >
      <div className="relative h-[84px] w-14 shrink-0 overflow-hidden rounded-lg shadow-sm ring-1 ring-black/5 sm:h-[96px] sm:w-16 dark:ring-white/10">
        {novel.cover_image ? (
          <Image
            src={novel.cover_image}
            alt=""
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="64px"
          />
        ) : (
          <div className="from-muted to-muted/50 flex h-full w-full items-center justify-center bg-gradient-to-br">
            <BookOpen className="text-muted-foreground size-5" />
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1 space-y-1">
        <h3 className="group-hover:text-primary line-clamp-2 text-sm leading-snug font-medium transition-colors sm:text-[15px]">
          {novel.title}
        </h3>

        <p className="text-muted-foreground truncate text-xs">
          {novel.author ?? "Anonymous"}
          {primaryGenre ? ` · ${primaryGenre}` : null}
        </p>

        <div className="text-muted-foreground flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px] sm:text-xs">
          {novel.rating != null && (
            <span className="inline-flex items-center gap-0.5 font-medium text-amber-600 dark:text-amber-400">
              <Star className="size-3 fill-current" />
              {formatRating(novel.rating)}
            </span>
          )}
          {novel.total_chapters != null && (
            <span className="inline-flex items-center gap-0.5">
              <BookOpen className="size-3" />
              {formatNumber(novel.total_chapters)} ch
            </span>
          )}
          {matchPercent != null && matchPercent >= 40 && (
            <span className="text-primary/80 inline-flex items-center gap-0.5 font-medium">
              <Sparkles className="size-3" />
              {matchPercent}% match
            </span>
          )}
        </div>
      </div>

      <ChevronRight
        className={cn(
          "text-muted-foreground size-4 shrink-0 transition-transform",
          "group-hover:translate-x-0.5 group-hover:text-primary",
        )}
      />
    </Link>
  );
}

function RelatedNovelRowSkeleton() {
  return (
    <div className="flex items-center gap-3 px-3 py-3 sm:gap-3.5 sm:px-3.5">
      <Skeleton className="h-[84px] w-14 shrink-0 rounded-lg sm:h-[96px] sm:w-16" />
      <div className="min-w-0 flex-1 space-y-2">
        <Skeleton className="h-4 w-[85%]" />
        <Skeleton className="h-3 w-[40%]" />
        <div className="flex gap-2">
          <Skeleton className="h-3 w-10" />
          <Skeleton className="h-3 w-12" />
        </div>
      </div>
    </div>
  );
}
