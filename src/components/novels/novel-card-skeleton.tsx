"use client";

import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface NovelCardSkeletonProps {
  size?: "default" | "compact" | "featured" | "horizontal";
  className?: string;
}

export function NovelCardSkeleton({
  size = "default",
  className,
}: NovelCardSkeletonProps) {
  const isCompact = size === "compact";
  const isFeatured = size === "featured";
  const isHorizontal = size === "horizontal";

  // Horizontal layout skeleton
  if (isHorizontal) {
    return (
      <Card className={cn("overflow-hidden", className)}>
        <div className="flex gap-3 p-3">
          <Skeleton className="h-24 w-16 flex-shrink-0 rounded" />
          <div className="flex min-w-0 flex-1 flex-col justify-between">
            <div className="space-y-1">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <div className="flex gap-1">
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-4 w-12" />
              </div>
            </div>
            <div className="flex gap-3">
              <Skeleton className="h-3 w-12" />
              <Skeleton className="h-3 w-8" />
            </div>
          </div>
        </div>
      </Card>
    );
  }

  // Vertical layout skeleton
  return (
    <Card className={cn("overflow-hidden pt-0", className)}>
      <Skeleton
        className={cn(
          "w-full",
          isCompact ? "aspect-[3/4]" : "aspect-[2/3]",
          isFeatured && "aspect-[2/3]",
        )}
      />
      <CardContent
        className={cn("space-y-3 p-4", isCompact && "space-y-2 p-2")}
      >
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          {!isCompact && <Skeleton className="h-3 w-24" />}
        </div>
        {!isCompact && (
          <div className="space-y-1">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-3/4" />
          </div>
        )}
        {!isCompact && (
          <div className="flex gap-1">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-12" />
          </div>
        )}
      </CardContent>
      <CardFooter className={cn("px-4 pt-0 pb-4", isCompact && "px-2 pb-2")}>
        <div className="flex gap-3">
          <Skeleton className="h-3 w-12" />
          <Skeleton className="h-3 w-8" />
        </div>
      </CardFooter>
    </Card>
  );
}
