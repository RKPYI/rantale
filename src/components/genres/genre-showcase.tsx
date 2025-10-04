"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight, BookOpen, Users } from "lucide-react";
import { Genre } from "@/types/api";
import { useNovelsByGenre } from "@/hooks/use-novels";

interface GenreListProps {
  genres: Genre[];
  loading?: boolean;
  title?: string;
  showAll?: boolean;
  limit?: number;
}

function GenreItem({ genre }: { genre: Genre }) {
  const { data: genreNovels } = useNovelsByGenre(genre.slug, { per_page: 1 });
  const novelCount = genreNovels?.total || 0;

  return (
    <Link
      href={`/genres/${genre.slug}`}
      className="group hover:bg-muted/50 hover:border-primary/40 flex items-center justify-between rounded-lg border p-4 transition-all duration-200 hover:shadow-sm"
    >
      <div className="flex flex-1 items-center gap-4">
        <div className="bg-primary/10 group-hover:bg-primary/20 flex h-12 w-12 items-center justify-center rounded-lg transition-colors">
          <BookOpen className="text-primary h-6 w-6" />
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="group-hover:text-primary truncate text-base font-medium transition-colors">
            {genre.name}
          </h3>
          <div className="mt-1 flex items-center gap-2">
            <div className="text-muted-foreground flex items-center gap-1 text-sm">
              <Users className="h-3 w-3" />
              <span>{novelCount} novels</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Badge variant="outline" className="text-xs">
          Browse
        </Badge>
        <ArrowRight className="text-muted-foreground group-hover:text-primary h-4 w-4 transition-all group-hover:translate-x-1" />
      </div>
    </Link>
  );
}

function GenreItemSkeleton() {
  return (
    <div className="flex items-center justify-between rounded-lg border p-4">
      <div className="flex flex-1 items-center gap-4">
        <Skeleton className="h-12 w-12 rounded-lg" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Skeleton className="h-5 w-16 rounded" />
        <Skeleton className="h-4 w-4 rounded" />
      </div>
    </div>
  );
}

export function GenreList({
  genres,
  loading = false,
  title = "Browse by Genre",
  showAll = false,
  limit = 8,
}: GenreListProps) {
  const displayGenres = showAll ? genres : genres?.slice(0, limit) || [];

  if (loading) {
    return (
      <section className="py-12 lg:py-16">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="mb-8 flex items-center justify-between">
            <Skeleton className="h-8 w-48" />
            {!showAll && <Skeleton className="h-9 w-20" />}
          </div>

          <div className="space-y-3">
            {Array.from({ length: limit }).map((_, i) => (
              <GenreItemSkeleton key={i} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 lg:py-16">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-2xl font-bold md:text-3xl">{title}</h2>
          {!showAll && (
            <Link href="/genres">
              <Button variant="ghost" className="group">
                View All
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          )}
        </div>

        <div className="space-y-3">
          {displayGenres.map((genre, index) => (
            <div key={genre.id}>
              <GenreItem genre={genre} />
              {index < displayGenres.length - 1 && (
                <Separator className="my-3" />
              )}
            </div>
          ))}
        </div>

        {!showAll && displayGenres.length === 0 && (
          <div className="py-12 text-center">
            <BookOpen className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
            <p className="text-muted-foreground text-lg">No genres available</p>
          </div>
        )}
      </div>
    </section>
  );
}
