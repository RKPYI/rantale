"use client";

import { BookOpen } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useGenres } from "@/hooks/use-novels";
import { GenreNovelRow } from "@/components/novels/genre-novel-row";

export default function BrowsePage() {
  const { data: genres, loading, error } = useGenres();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Browse by Genre</h1>
          <p className="text-muted-foreground">
            Explore novels across every genre, sorted by the most popular reads.
          </p>
        </div>

        {/* Genre rows */}
        {loading ? (
          <div className="space-y-8">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-6 w-40" />
                <div className="flex gap-3 sm:gap-4">
                  {Array.from({ length: 6 }).map((_, j) => (
                    <div
                      key={j}
                      className="w-[140px] flex-shrink-0 sm:w-[150px] md:w-[160px]"
                    >
                      <Skeleton className="aspect-[2/3] w-full rounded-lg" />
                      <div className="space-y-1.5 px-0.5 pt-2 pb-1">
                        <Skeleton className="h-3.5 w-full" />
                        <Skeleton className="h-3 w-2/3" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <Card>
            <CardContent className="p-8 text-center">
              <BookOpen className="text-muted-foreground mx-auto mb-4 h-16 w-16" />
              <h3 className="mb-2 text-xl font-medium">
                Error Loading Genres
              </h3>
              <p className="text-muted-foreground mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="text-primary hover:text-primary/80 font-medium"
              >
                Try Again
              </button>
            </CardContent>
          </Card>
        ) : genres && genres.length > 0 ? (
          genres.map((genre) => (
            <GenreNovelRow key={genre.id} genre={genre} />
          ))
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <BookOpen className="text-muted-foreground mx-auto mb-4 h-16 w-16" />
              <h3 className="mb-2 text-xl font-medium">No Genres Found</h3>
              <p className="text-muted-foreground">
                Genres will appear here once they are added to the system.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
