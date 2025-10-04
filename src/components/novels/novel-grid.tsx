"use client";

import { BookOpen, Clock, Star } from "lucide-react";
import { NovelCard } from "./novel-card";
import { NovelCardSkeleton } from "./novel-card-skeleton";
import { Novel } from "@/types/api";
import { cn } from "@/lib/utils";

interface NovelGridProps {
  novels?: Novel[];
  loading?: boolean;
  size?: "default" | "compact" | "featured";
  maxItems?: number;
  emptyMessage?: string;
  emptyIcon?: "book" | "clock" | "star";
  className?: string;
  skeletonCount?: number;
}

export function NovelGrid({ 
  novels, 
  loading = false, 
  size = "default",
  maxItems,
  emptyMessage = "No novels found",
  emptyIcon = "book",
  className,
  skeletonCount = 10
}: NovelGridProps) {
  const displayNovels = maxItems ? novels?.slice(0, maxItems) : novels;
  
  const getEmptyIcon = () => {
    switch (emptyIcon) {
      case "clock":
        return <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />;
      case "star":
        return <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4" />;
      default:
        return <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />;
    }
  };

  const getGridCols = () => {
    if (size === "featured") {
      return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";
    }
    return "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5";
  };

  if (loading) {
    return (
      <div className={cn("grid gap-6", getGridCols(), className)}>
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <NovelCardSkeleton key={i} size={size} />
        ))}
      </div>
    );
  }

  if (!displayNovels || displayNovels.length === 0) {
    return (
      <div className="col-span-full text-center py-12">
        {getEmptyIcon()}
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={cn("grid gap-6", getGridCols(), className)}>
      {displayNovels.map((novel) => (
        <NovelCard key={novel.id} novel={novel} size={size} />
      ))}
    </div>
  );
}