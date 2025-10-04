"use client";

import { GenreCard } from "./genre-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import { Genre } from "@/types/api";

interface GenreGridProps {
  genres?: Genre[];
  loading?: boolean;
  limit?: number;
  variant?: "default" | "compact" | "featured";
  className?: string;
}

export function GenreGrid({ 
  genres, 
  loading, 
  limit = 12, 
  variant = "default",
  className 
}: GenreGridProps) {
  const isCompact = variant === "compact";
  const isFeatured = variant === "featured";

  if (loading) {
    return (
      <div className={cn(
        "grid gap-4",
        isCompact ? "grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8" :
        isFeatured ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4" :
        "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6",
        className
      )}>
        {Array.from({ length: limit }).map((_, i) => (
          <div key={i} className={cn(
            "rounded-lg border bg-gradient-to-br from-muted/30 to-muted/10",
            isCompact ? "p-3" : "p-6"
          )}>
            <div className="flex flex-col items-center text-center space-y-3">
              <Skeleton className={cn(
                "rounded-full",
                isCompact ? "w-10 h-10" : isFeatured ? "w-16 h-16" : "w-14 h-14"
              )} />
              <div className="space-y-2">
                <Skeleton className={cn(
                  "mx-auto",
                  isCompact ? "h-3 w-12" : "h-4 w-16"
                )} />
                <Skeleton className="h-3 w-20 mx-auto" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!genres || genres.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-20 h-20 mx-auto bg-gradient-to-br from-muted to-muted/50 rounded-full flex items-center justify-center mb-4">
          <Filter className="h-10 w-10 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-muted-foreground mb-2">No Genres Available</h3>
        <p className="text-sm text-muted-foreground">Check back later for genre updates</p>
      </div>
    );
  }

  return (
    <div className={cn(
      "grid gap-4",
      isCompact ? "grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8" :
      isFeatured ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4" :
      "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6",
      className
    )}>
      {genres.slice(0, limit).map((genre) => (
        <GenreCard 
          key={genre.id} 
          genre={genre} 
          variant={variant}
          novelCount={Math.floor(Math.random() * 1000) + 50} // Mock data - replace with real counts
        />
      ))}
    </div>
  );
}