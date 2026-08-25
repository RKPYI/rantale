"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpen, Clock } from "lucide-react";
import { useUserReadingProgress } from "@/hooks/use-reading-progress";
import { formatRelativeTime } from "@/lib/novel-utils";
import { formatProgressPercentage } from "@/lib/content-utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface ContinueReadingProps {
  variant?: "default" | "compact" | "card";
  showTitle?: boolean;
  className?: string;
}

type LastReadEntry = NonNullable<
  ReturnType<typeof useUserReadingProgress>["data"]
>["reading_progress"][number];

function getMostRecentRead(
  entries: LastReadEntry[] | undefined,
): LastReadEntry | null {
  if (!entries?.length) return null;

  return [...entries].sort((a, b) => {
    const aTime = a.last_read_at ? new Date(a.last_read_at).getTime() : 0;
    const bTime = b.last_read_at ? new Date(b.last_read_at).getTime() : 0;
    return bTime - aTime;
  })[0];
}

export function ContinueReading({
  variant = "default",
  showTitle = true,
  className = "",
}: ContinueReadingProps) {
  const { data, loading } = useUserReadingProgress();

  if (loading) {
    return (
      <ContinueReadingSkeleton
        variant={variant}
        showTitle={showTitle}
        className={className}
      />
    );
  }

  const lastRead = getMostRecentRead(data?.reading_progress);

  if (!lastRead?.current_chapter) {
    return null;
  }

  const { novel, current_chapter, progress_percentage, last_read_at } =
    lastRead;
  const href = `/novels/${novel.slug}/chapters/${current_chapter.chapter_number}`;
  const isCompact = variant === "compact";
  const isCard = variant === "card";

  return (
    <section
      aria-label="Continue reading"
      className={cn(
        "group/resume relative overflow-hidden rounded-2xl border border-primary/10 bg-gradient-to-br from-primary/[0.06] via-background to-muted/40",
        "shadow-[0_1px_0_0_oklch(0_0_0/0.04)] transition-[border-color,box-shadow] duration-300",
        "hover:border-primary/20 hover:shadow-[0_8px_28px_-12px_oklch(0.645_0.246_16.439/0.28)]",
        isCard && "p-5 sm:p-6",
        isCompact && "p-3.5 sm:p-4",
        !isCard && !isCompact && "p-4 sm:p-5",
        className,
      )}
    >
      {/* Soft accent wash */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-20 size-48 rounded-full bg-primary/10 blur-3xl transition-opacity duration-500 group-hover/resume:opacity-80"
      />

      {showTitle && (
        <div className="relative mb-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-full bg-primary/10 text-primary">
              <BookOpen className="size-3.5" aria-hidden />
            </span>
            <p className="text-sm font-medium tracking-tight">
              Continue reading
            </p>
          </div>
          {last_read_at && (
            <p className="text-muted-foreground flex items-center gap-1 text-xs">
              <Clock className="size-3 shrink-0" aria-hidden />
              <span>{formatRelativeTime(last_read_at)}</span>
            </p>
          )}
        </div>
      )}

      <Link
        href={href}
        className={cn(
          "relative flex gap-3.5 rounded-xl outline-none",
          "focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2",
          isCard && "gap-5 sm:gap-6",
        )}
      >
        {/* Cover */}
        <div
          className={cn(
            "relative shrink-0 overflow-hidden rounded-lg bg-muted shadow-sm ring-1 ring-black/5",
            isCompact && "h-[88px] w-[60px]",
            isCard && "h-[132px] w-[88px] sm:h-[148px] sm:w-[100px]",
            !isCompact && !isCard && "h-[104px] w-[72px]",
          )}
        >
          {novel.cover_image ? (
            <Image
              src={novel.cover_image}
              alt=""
              fill
              className="object-cover transition-transform duration-500 ease-out group-hover/resume:scale-105"
              sizes="100px"
            />
          ) : (
            <div className="from-muted to-muted/60 flex h-full w-full items-center justify-center bg-gradient-to-br">
              <BookOpen className="text-muted-foreground size-6" aria-hidden />
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex min-w-0 flex-1 flex-col justify-between py-0.5">
          <div className="min-w-0 space-y-1">
            <h3
              className={cn(
                "truncate font-semibold tracking-tight transition-colors group-hover/resume:text-primary",
                isCard ? "text-lg sm:text-xl" : "text-base",
              )}
            >
              {novel.title}
            </h3>
            <p className="text-muted-foreground line-clamp-2 text-sm leading-snug">
              <span className="text-foreground/70 font-medium">
                Ch. {current_chapter.chapter_number}
              </span>
              <span className="text-muted-foreground/60 mx-1.5">·</span>
              {current_chapter.title}
            </p>
            {novel.author && (
              <p className="text-muted-foreground truncate text-xs">
                {novel.author}
              </p>
            )}
          </div>

          <div className="mt-3 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <Progress
                value={Math.min(progress_percentage, 100)}
                className="h-1.5 flex-1"
                aria-label={`${formatProgressPercentage(progress_percentage)} complete`}
              />
              <span className="text-muted-foreground shrink-0 text-xs tabular-nums">
                {formatProgressPercentage(progress_percentage)}
              </span>
            </div>

            <div className="flex items-center justify-between gap-3">
              {!showTitle && last_read_at ? (
                <p className="text-muted-foreground flex items-center gap-1 text-xs">
                  <Clock className="size-3 shrink-0" aria-hidden />
                  {formatRelativeTime(last_read_at)}
                </p>
              ) : (
                <p className="text-muted-foreground text-xs">
                  {lastRead.total_chapters > 0
                    ? `${current_chapter.chapter_number} of ${lastRead.total_chapters} chapters`
                    : "Pick up where you left off"}
                </p>
              )}

              <Button
                asChild
                size={isCompact ? "sm" : "default"}
                className="pointer-events-none shrink-0 gap-1.5 shadow-sm"
                tabIndex={-1}
              >
                <span>
                  Continue
                  <ArrowRight className="size-4 transition-transform duration-300 group-hover/resume:translate-x-0.5" />
                </span>
              </Button>
            </div>
          </div>
        </div>
      </Link>
    </section>
  );
}

function ContinueReadingSkeleton({
  variant = "default",
  showTitle = true,
  className = "",
}: {
  variant?: "default" | "compact" | "card";
  showTitle?: boolean;
  className?: string;
}) {
  const isCompact = variant === "compact";
  const isCard = variant === "card";

  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-primary/10 bg-gradient-to-br from-primary/[0.06] via-background to-muted/40",
        isCard && "p-5 sm:p-6",
        isCompact && "p-3.5 sm:p-4",
        !isCard && !isCompact && "p-4 sm:p-5",
        className,
      )}
    >
      {showTitle && (
        <div className="mb-3 flex items-center justify-between">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-4 w-14" />
        </div>
      )}
      <div className={cn("flex gap-3.5", isCard && "gap-5")}>
        <Skeleton
          className={cn(
            "shrink-0 rounded-lg",
            isCompact && "h-[88px] w-[60px]",
            isCard && "h-[132px] w-[88px] sm:h-[148px] sm:w-[100px]",
            !isCompact && !isCard && "h-[104px] w-[72px]",
          )}
        />
        <div className="flex min-w-0 flex-1 flex-col justify-between py-0.5">
          <div className="space-y-2">
            <Skeleton className={cn("h-5 w-48", isCard && "h-6 w-56")} />
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-24" />
          </div>
          <div className="mt-3 space-y-2">
            <Skeleton className="h-1.5 w-full" />
            <div className="flex items-center justify-between">
              <Skeleton className="h-3 w-28" />
              <Skeleton
                className={cn("h-8 w-24 rounded-md", !isCompact && "h-9")}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
