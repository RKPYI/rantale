"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, ArrowRight } from "lucide-react";
import { useProfileStats } from "@/hooks/use-profile-stats";
import { formatDate } from "@/lib/novel-utils";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

interface ContinueReadingProps {
  variant?: "default" | "compact" | "card";
  showTitle?: boolean;
  className?: string;
}

export function ContinueReading({
  variant = "default",
  showTitle = true,
  className = "",
}: ContinueReadingProps) {
  const { data: stats, loading } = useProfileStats();

  if (loading) {
    return <ContinueReadingSkeleton variant={variant} showTitle={showTitle} />;
  }

  // Don't show if no reading progress or no last read novel
  if (!stats?.reading_progress?.last_read) {
    return null;
  }

  const lastRead = stats.reading_progress.last_read;

  if (variant === "compact") {
    // Compact inline version for home page
    return (
      <div className={`bg-muted/50 rounded-lg border p-4 ${className}`}>
        <div className="mb-2 flex items-center gap-2">
          <BookOpen className="text-primary h-4 w-4" />
          <span className="text-sm font-medium">Continue Reading</span>
        </div>
        <Link
          href={`/novels/${lastRead.novel_slug}/chapters/${lastRead.chapter_number}`}
          className="group flex items-center justify-between hover:underline"
        >
          <div className="flex-1">
            <p className="group-hover:text-primary font-medium">
              {lastRead.novel_title}
            </p>
            <p className="text-muted-foreground text-sm">
              Chapter {lastRead.chapter_number}: {lastRead.chapter_title}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <p className="text-muted-foreground text-xs">
              {formatDate(lastRead.last_read_at)}
            </p>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </div>
        </Link>
      </div>
    );
  }

  if (variant === "card") {
    // Card version for home page hero section
    return (
      <Card className={className}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <BookOpen className="h-5 w-5" />
            Continue Reading
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Link
            href={`/novels/${lastRead.novel_slug}/chapters/${lastRead.chapter_number}`}
            className="group block"
          >
            <div className="mb-3">
              <h3 className="group-hover:text-primary text-xl font-bold transition-colors">
                {lastRead.novel_title}
              </h3>
              <p className="text-muted-foreground mt-1">
                Chapter {lastRead.chapter_number}: {lastRead.chapter_title}
              </p>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-muted-foreground text-sm">
                Last read {formatDate(lastRead.last_read_at)}
              </p>
              <Button variant="default" size="sm" className="gap-2">
                Continue Reading
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </Link>
        </CardContent>
      </Card>
    );
  }

  // Default version (for reading stats page)
  return (
    <div className={`bg-muted/50 rounded-lg border p-4 ${className}`}>
      {showTitle && (
        <div className="mb-2 flex items-center gap-2">
          <BookOpen className="text-primary h-4 w-4" />
          <span className="text-sm font-medium">Continue Reading</span>
        </div>
      )}
      <Link
        href={`/novels/${lastRead.novel_slug}/chapters/${lastRead.chapter_number}`}
        className="group flex items-center justify-between hover:underline"
      >
        <div>
          <p className="group-hover:text-primary font-medium">
            {lastRead.novel_title}
          </p>
          <p className="text-muted-foreground text-sm">
            Chapter {lastRead.chapter_number}: {lastRead.chapter_title}
          </p>
        </div>
        <p className="text-muted-foreground text-xs">
          {formatDate(lastRead.last_read_at)}
        </p>
      </Link>
    </div>
  );
}

function ContinueReadingSkeleton({
  variant = "default",
  showTitle = true,
}: {
  variant?: "default" | "compact" | "card";
  showTitle?: boolean;
}) {
  if (variant === "card") {
    return (
      <Card>
        <CardHeader className="pb-3">
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="mb-3 h-8 w-64" />
          <Skeleton className="mb-3 h-5 w-48" />
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-9 w-36" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="bg-muted/50 rounded-lg border p-4">
      {showTitle && <Skeleton className="mb-2 h-4 w-32" />}
      <Skeleton className="mb-2 h-5 w-48" />
      <Skeleton className="h-4 w-64" />
    </div>
  );
}
