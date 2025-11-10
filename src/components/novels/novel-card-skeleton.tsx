"use client";

import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface NovelCardSkeletonProps {
  size?: "default" | "compact" | "featured";
  className?: string;
}

export function NovelCardSkeleton({
  size = "default",
  className,
}: NovelCardSkeletonProps) {
  const isCompact = size === "compact";
  const isFeatured = size === "featured";

  return (
    <Card className={cn("overflow-hidden pt-0", className)}>
      <Skeleton
        className={cn(
          "w-full",
          isCompact ? "aspect-[3/2]" : "aspect-[2/3]",
          isFeatured && "aspect-[2/3]",
        )}
      />
      <CardContent className="space-y-3 p-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-3 w-24" />
        </div>
        {!isCompact && (
          <div className="space-y-1">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-3/4" />
          </div>
        )}
        <div className="flex gap-1">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-12" />
        </div>
      </CardContent>
      <CardFooter className="px-4 pt-0 pb-4">
        <div className="flex gap-3">
          <Skeleton className="h-3 w-12" />
          <Skeleton className="h-3 w-8" />
        </div>
      </CardFooter>
    </Card>
  );
}
