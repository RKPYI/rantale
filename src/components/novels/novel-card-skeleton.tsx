"use client";

import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface NovelCardSkeletonProps {
  size?: "default" | "compact" | "featured" | "horizontal" | "browse";
  className?: string;
}

export function NovelCardSkeleton({
  size = "default",
  className,
}: NovelCardSkeletonProps) {
  const isCompact = size === "compact";
  const isFeatured = size === "featured";
  const isHorizontal = size === "horizontal";
  const isBrowse = size === "browse";

  if (isBrowse) {
    return (
      <Card
        className={cn(
          "w-[150px] flex-shrink-0 overflow-hidden pt-0 sm:w-[160px] md:w-[170px]",
          className,
        )}
      >
        <Skeleton className="aspect-[2/3] w-full" />
        <CardContent className="space-y-1.5 p-2">
          <Skeleton className="h-3.5 w-full" />
          <Skeleton className="h-3 w-3/4" />
          <div className="flex gap-2">
            <Skeleton className="h-3 w-8" />
            <Skeleton className="h-3 w-10" />
          </div>
        </CardContent>
      </Card>
    );
  }

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

  if (isFeatured) {
    return (
      <Card
        className={cn(
          "overflow-hidden border-transparent p-0 shadow-md",
          className,
        )}
      >
        <div className="relative aspect-[2/3]">
          <Skeleton className="absolute inset-0 h-full w-full rounded-none" />
          <div className="absolute inset-x-0 bottom-0 space-y-2 p-4">
            <Skeleton className="h-5 w-4/5 bg-white/20" />
            <Skeleton className="h-3 w-1/3 bg-white/15" />
            <div className="flex gap-3">
              <Skeleton className="h-3 w-10 bg-white/15" />
              <Skeleton className="h-3 w-12 bg-white/15" />
            </div>
          </div>
        </div>
      </Card>
    );
  }

  if (isCompact) {
    return (
      <div className={cn("overflow-hidden", className)}>
        <Skeleton className="aspect-[2/3] w-full rounded-lg" />
        <div className="space-y-1.5 px-0.5 pt-2 pb-1">
          <Skeleton className="h-3.5 w-full" />
          <Skeleton className="h-3 w-2/3" />
        </div>
      </div>
    );
  }

  return (
    <Card className={cn("overflow-hidden pt-0", className)}>
      <Skeleton className="aspect-[2/3] w-full" />
      <CardContent className="space-y-3 p-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-3 w-24" />
        </div>
        <div className="space-y-1">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-3/4" />
        </div>
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
