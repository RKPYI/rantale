"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  X,
  BookOpen,
  Clock,
  Star,
  TrendingUp,
  Crown,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { SearchSpinner } from "@/components/ui/spinner";
import { useSearchNovels } from "@/hooks/use-novels";
import {
  formatRating,
  getNovelStyling,
  getStatusColor,
} from "@/lib/novel-utils";
import { Novel } from "@/types/api";
import { cn } from "@/lib/utils";

interface SearchSheetProps {
  trigger?: React.ReactNode;
}

export function SearchSheet({ trigger }: SearchSheetProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Search novels with debouncing (minimum 3 characters)
  const { data: searchResults, loading: searchLoading } = useSearchNovels(
    searchQuery.length >= 3 ? searchQuery : "",
  );

  // Reset search when sheet closes
  useEffect(() => {
    if (!open) {
      setSearchQuery("");
    }
  }, [open]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchClear = () => {
    setSearchQuery("");
  };

  const handleResultClick = () => {
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="icon">
            <Search className="h-5 w-5" />
          </Button>
        )}
      </SheetTrigger>
      <SheetContent side="top" className="h-[90vh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Search Novels</SheetTitle>
        </SheetHeader>

        <div className="mt-4">
          <div className="relative">
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
            <Input
              placeholder="Search novels, authors..."
              className="w-full pr-10 pl-10"
              value={searchQuery}
              onChange={handleSearchChange}
              autoFocus
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-1/2 right-1 h-6 w-6 -translate-y-1/2 transform p-0"
                onClick={handleSearchClear}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>

          {/* Search Results */}
          <div className="mt-4">
            {searchQuery.length < 3 ? (
              <div className="text-muted-foreground py-8 text-center text-sm">
                Type at least 3 characters to search
              </div>
            ) : searchLoading ? (
              <div className="py-8 text-center">
                <SearchSpinner />
              </div>
            ) : searchResults && searchResults.length > 0 ? (
              <div className="space-y-2">
                <div className="text-muted-foreground px-1 text-xs font-medium">
                  {searchResults.length} result
                  {searchResults.length !== 1 ? "s" : ""} found
                </div>

                {searchResults.map((novel: Novel) => {
                  const styling = getNovelStyling(novel, "compact");

                  return (
                    <Link
                      key={novel.id}
                      href={`/novels/${novel.slug}`}
                      className={cn(
                        "hover:bg-muted/50 block rounded-lg p-3 transition-all",
                        styling.containerClass,
                      )}
                      onClick={handleResultClick}
                    >
                      <div className="flex items-start gap-3">
                        {/* Novel Cover */}
                        <div className="relative flex-shrink-0">
                          {novel.cover_image ? (
                            <Image
                              src={novel.cover_image}
                              alt={novel.title}
                              width={56}
                              height={80}
                              className={cn(
                                "bg-muted rounded object-cover",
                                styling.coverClass,
                              )}
                            />
                          ) : (
                            <div
                              className={cn(
                                "bg-muted flex h-20 w-14 items-center justify-center rounded",
                                styling.coverClass,
                              )}
                            >
                              <BookOpen className="text-muted-foreground h-6 w-6" />
                            </div>
                          )}
                          {/* Corner badge icon */}
                          {styling.showCornerIcon && (
                            <div
                              className={cn(
                                "absolute -top-1 -right-1 rounded-full p-0.5 shadow-lg",
                                styling.cornerIconClass,
                              )}
                            >
                              {novel.is_featured ? (
                                <Crown className="h-3 w-3 text-white" />
                              ) : (
                                <TrendingUp className="h-3 w-3 text-white" />
                              )}
                            </div>
                          )}
                        </div>

                        {/* Novel Info */}
                        <div className="min-w-0 flex-1">
                          <div className="mb-1 flex items-center gap-1.5">
                            <h4
                              className={cn(
                                "text-sm leading-tight font-medium",
                                styling.titleClass,
                              )}
                            >
                              {novel.title}
                            </h4>
                            {styling.badge.show && (
                              <Badge
                                variant="default"
                                className={styling.badge.className}
                              >
                                {styling.badge.label}
                              </Badge>
                            )}
                          </div>
                          <p className="text-muted-foreground mb-2 text-xs">
                            by {novel.author}
                          </p>

                          {/* Novel Stats */}
                          <div className="mb-2 flex flex-wrap items-center gap-2">
                            <div className="flex items-center gap-1">
                              <Star className="h-3 w-3 fill-current text-yellow-400" />
                              <span className="text-xs">
                                {formatRating(novel.rating)}
                              </span>
                            </div>
                            <Badge
                              variant={getStatusColor(novel.status)}
                              className="h-4 text-xs"
                            >
                              {novel.status.charAt(0).toUpperCase() +
                                novel.status.slice(1)}
                            </Badge>
                            <div className="text-muted-foreground flex items-center gap-1 text-xs">
                              <BookOpen className="h-3 w-3" />
                              {novel.total_chapters} ch
                            </div>
                          </div>

                          {/* Genres */}
                          {novel.genres.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {novel.genres.slice(0, 3).map((genre) => (
                                <Badge
                                  key={genre.id}
                                  variant="secondary"
                                  className="h-4 text-xs"
                                >
                                  {genre.name}
                                </Badge>
                              ))}
                              {novel.genres.length > 3 && (
                                <span className="text-muted-foreground text-xs">
                                  +{novel.genres.length - 3}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                })}

                <div className="border-t pt-3 text-center">
                  <Link
                    href={`/search?q=${encodeURIComponent(searchQuery)}`}
                    className="text-primary text-sm font-medium hover:underline"
                    onClick={handleResultClick}
                  >
                    {searchResults.length > 8 ? (
                      <>View all {searchResults.length} results</>
                    ) : (
                      <>Advanced search & filters</>
                    )}
                  </Link>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center">
                <BookOpen className="text-muted-foreground mx-auto mb-2 h-8 w-8" />
                <p className="text-muted-foreground text-sm">No novels found</p>
                <p className="text-muted-foreground text-xs">
                  Try different keywords
                </p>
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
