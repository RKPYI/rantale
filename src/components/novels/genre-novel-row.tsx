"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NovelCard } from "./novel-card";
import { NovelCardSkeleton } from "./novel-card-skeleton";
import { Genre, Novel, PaginatedResponse } from "@/types/api";
import { novelService } from "@/services/novels";
import { cn } from "@/lib/utils";

interface GenreNovelRowProps {
  genre: Genre;
  className?: string;
}

export function GenreNovelRow({ genre, className }: GenreNovelRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [novels, setNovels] = useState<Novel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch novels for this genre sorted by popularity (views)
  useEffect(() => {
    let cancelled = false;

    async function fetchNovels() {
      try {
        setLoading(true);
        setError(null);
        const response: PaginatedResponse<Novel> =
          await novelService.getNovelsByGenre(genre.slug, {
            sort_by: "popular",
            per_page: 20,
          });
        if (!cancelled) {
          setNovels(response.data);
        }
      } catch (err) {
        if (!cancelled) {
          setError("Failed to load books");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchNovels();
    return () => {
      cancelled = true;
    };
  }, [genre.slug]);

  // Update scroll button visibility
  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    updateScrollState();
    el.addEventListener("scroll", updateScrollState, { passive: true });
    const observer = new ResizeObserver(updateScrollState);
    observer.observe(el);

    return () => {
      el.removeEventListener("scroll", updateScrollState);
      observer.disconnect();
    };
  }, [loading, updateScrollState]);

  const scroll = (direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const cardWidth = 180; // roughly card width + gap
    const distance = cardWidth * 3;
    el.scrollBy({
      left: direction === "left" ? -distance : distance,
      behavior: "smooth",
    });
  };

  // If genre has no novels and is done loading, skip rendering
  if (!loading && !error && novels.length === 0) return null;

  return (
    <section className={cn("space-y-3", className)}>
      {/* Section header */}
      <div className="flex items-center justify-between">
        <Link
          href={`/search?genre=${genre.slug}`}
          className="group flex items-center gap-2"
        >
          <h2 className="group-hover:text-primary text-lg font-semibold transition-colors sm:text-xl">
            {genre.name}
          </h2>
          {genre.novels_count !== undefined && genre.novels_count > 0 && (
            <span className="text-muted-foreground text-xs sm:text-sm">
              ({genre.novels_count})
            </span>
          )}
          <ChevronRight className="text-muted-foreground group-hover:text-primary h-4 w-4 transition-colors" />
        </Link>

        {/* Desktop scroll controls */}
        <div className="hidden items-center gap-1 sm:flex">
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-8 w-8 transition-opacity",
              !canScrollLeft && "pointer-events-none opacity-0",
            )}
            onClick={() => scroll("left")}
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-8 w-8 transition-opacity",
              !canScrollRight && "pointer-events-none opacity-0",
            )}
            onClick={() => scroll("right")}
            aria-label="Scroll right"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Scrollable novel row */}
      {error ? (
        <div className="text-muted-foreground flex items-center gap-2 py-4 text-sm">
          <BookOpen className="h-4 w-4" />
          <span>{error}</span>
        </div>
      ) : (
        <div className="relative">
          {/* Left gradient fade */}
          {canScrollLeft && (
            <div className="from-background pointer-events-none absolute top-0 bottom-0 left-0 z-10 w-8 bg-gradient-to-r to-transparent" />
          )}

          <div
            ref={scrollRef}
            className="scrollbar-hide flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth pb-2 sm:gap-4"
          >
            {loading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="snap-start">
                    <NovelCardSkeleton size="browse" />
                  </div>
                ))
              : novels.map((novel) => (
                  <div key={novel.id} className="snap-start">
                    <NovelCard novel={novel} size="browse" />
                  </div>
                ))}
          </div>

          {/* Right gradient fade */}
          {canScrollRight && (
            <div className="from-background pointer-events-none absolute top-0 right-0 bottom-0 z-10 w-8 bg-gradient-to-l to-transparent" />
          )}
        </div>
      )}
    </section>
  );
}
