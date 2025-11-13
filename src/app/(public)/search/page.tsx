"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  Search,
  Filter,
  SortAsc,
  BookOpen,
  Star,
  Clock,
  Crown,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import Image from "next/image";

import { useSearchNovels, useGenres } from "@/hooks/use-novels";
import {
  formatRating,
  formatChapterCount,
  formatViewCount,
  truncateDescription,
  getStatusColor,
  getNovelStyling,
  getNovelBadgeConfig,
} from "@/lib/novel-utils";
import { cn } from "@/lib/utils";
import {
  LoadingSpinner,
  NovelSearchLoading,
} from "@/components/ui/loading-spinner";
import { SearchSpinner, LoadingThrobber } from "@/components/ui/spinner";
import { Novel, Genre } from "@/types/api";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("relevance");

  // Fetch genres for filtering
  const { data: genres } = useGenres();

  // Search novels with current query
  const {
    data: searchResults,
    loading: searchLoading,
    error: searchError,
  } = useSearchNovels(debouncedQuery);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Update query when URL params change
  useEffect(() => {
    const urlQuery = searchParams.get("q") || "";
    if (urlQuery !== searchQuery) {
      setSearchQuery(urlQuery);
    }
  }, [searchParams]);

  const handleGenreToggle = (genreSlug: string) => {
    setSelectedGenres((prev) =>
      prev.includes(genreSlug)
        ? prev.filter((g) => g !== genreSlug)
        : [...prev, genreSlug],
    );
  };

  const clearFilters = () => {
    setSelectedGenres([]);
    setSelectedStatus("");
    setSortBy("relevance");
  };

  // Filter and sort results
  const filteredResults = searchResults
    ? searchResults
        .filter((novel) => {
          // Genre filter
          if (selectedGenres.length > 0) {
            const novelGenres = novel.genres.map((g) => g.slug);
            if (!selectedGenres.some((genre) => novelGenres.includes(genre))) {
              return false;
            }
          }

          // Status filter
          if (selectedStatus && novel.status !== selectedStatus) {
            return false;
          }

          return true;
        })
        .sort((a, b) => {
          switch (sortBy) {
            case "rating":
              return parseFloat(b.rating || "0") - parseFloat(a.rating || "0");
            case "views":
              return (b.views || 0) - (a.views || 0);
            case "chapters":
              return (b.total_chapters || 0) - (a.total_chapters || 0);
            case "updated":
              return (
                new Date(b.updated_at).getTime() -
                new Date(a.updated_at).getTime()
              );
            case "title":
              return a.title.localeCompare(b.title);
            default:
              return 0; // relevance - keep original order
          }
        })
    : [];

  const NovelCard = ({ novel }: { novel: Novel }) => {
    const styling = getNovelStyling(novel, "normal");
    const badgeConfig = getNovelBadgeConfig(novel);

    return (
      <Link href={`/novels/${novel.slug}`}>
        <Card
          className={cn(
            "transition-all duration-200 hover:scale-[1.02] hover:shadow-lg",
            // Add featured/trending border styling
            novel.is_featured &&
              "border-2 border-amber-500/30 shadow-lg shadow-amber-500/10",
            novel.is_trending &&
              !novel.is_featured &&
              "border-2 border-blue-500/30 shadow-lg shadow-blue-500/10",
            // Add container gradient background
            styling.containerClass,
          )}
        >
          <CardContent className="p-4">
            <div className="flex gap-4">
              {/* Cover Image */}
              <div className="relative flex-shrink-0">
                {novel.cover_image ? (
                  <Image
                    src={novel.cover_image}
                    alt={novel.title}
                    width={80}
                    height={120}
                    className={cn(
                      "bg-muted rounded object-cover",
                      styling.coverClass,
                    )}
                  />
                ) : (
                  <div
                    className={cn(
                      "bg-muted flex h-30 w-20 items-center justify-center rounded",
                      styling.coverClass,
                    )}
                  >
                    <BookOpen className="text-muted-foreground h-8 w-8" />
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
              <div className="min-w-0 flex-1 space-y-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h3
                      className={cn(
                        "line-clamp-2 text-lg font-semibold",
                        styling.titleClass,
                      )}
                    >
                      {novel.title}
                    </h3>
                    {badgeConfig.show && (
                      <Badge
                        variant="default"
                        className={badgeConfig.className}
                      >
                        {badgeConfig.label}
                      </Badge>
                    )}
                  </div>
                  <p className="text-muted-foreground">by {novel.author}</p>
                </div>

                <p className="text-muted-foreground line-clamp-3 text-sm">
                  {truncateDescription(novel.description, 200)}
                </p>

                {/* Genres */}
                <div className="flex flex-wrap gap-1">
                  {novel.genres.slice(0, 3).map((genre) => (
                    <Badge
                      key={genre.id}
                      variant="secondary"
                      className="text-xs"
                    >
                      {genre.name}
                    </Badge>
                  ))}
                  {novel.genres.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{novel.genres.length - 3}
                    </Badge>
                  )}
                </div>

                {/* Stats */}
                <div className="text-muted-foreground flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-current text-yellow-400" />
                    <span>
                      {formatRating(novel.rating)} ({novel.rating_count})
                    </span>
                  </div>
                  <Badge variant={getStatusColor(novel.status)}>
                    {novel.status.charAt(0).toUpperCase() +
                      novel.status.slice(1)}
                  </Badge>
                  <span>{formatChapterCount(novel.total_chapters)}</span>
                  <span>{formatViewCount(novel.views)} Views</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Search Novels</h1>
          <p className="text-muted-foreground">
            Discover your next favorite story from our collection
          </p>
        </div>

        {/* Search Bar */}
        <Card>
          <CardContent className="p-4">
            <div className="relative">
              <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
              <Input
                placeholder="Search by title, author, or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 text-base"
              />
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
          {/* Filters Sidebar */}
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Filter className="h-4 w-4" />
                  Filters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Genre Filter */}
                <div>
                  <h4 className="mb-2 font-medium">Genres</h4>
                  <div className="max-h-48 space-y-1 overflow-y-auto">
                    {genres?.map((genre: Genre) => (
                      <label
                        key={genre.id}
                        className="flex cursor-pointer items-center space-x-2"
                      >
                        <input
                          type="checkbox"
                          checked={selectedGenres.includes(genre.slug)}
                          onChange={() => handleGenreToggle(genre.slug)}
                          className="rounded"
                        />
                        <span className="text-sm">{genre.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Status Filter */}
                <div>
                  <h4 className="mb-2 font-medium">Status</h4>
                  <div className="space-y-1">
                    {["", "ongoing", "completed", "hiatus"].map((status) => (
                      <label
                        key={status}
                        className="flex cursor-pointer items-center space-x-2"
                      >
                        <input
                          type="radio"
                          name="status"
                          checked={selectedStatus === status}
                          onChange={() => setSelectedStatus(status)}
                        />
                        <span className="text-sm">
                          {status === ""
                            ? "All Status"
                            : status.charAt(0).toUpperCase() + status.slice(1)}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Sort Options */}
                <div>
                  <h4 className="mb-2 flex items-center gap-1 font-medium">
                    <SortAsc className="h-4 w-4" />
                    Sort By
                  </h4>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full rounded border p-2 text-sm"
                  >
                    <option value="relevance">Relevance</option>
                    <option value="rating">Highest Rated</option>
                    <option value="views">Most Popular</option>
                    <option value="chapters">Most Chapters</option>
                    <option value="updated">Recently Updated</option>
                    <option value="title">Title (A-Z)</option>
                  </select>
                </div>

                {/* Clear Filters */}
                {(selectedGenres.length > 0 ||
                  selectedStatus ||
                  sortBy !== "relevance") && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearFilters}
                    className="w-full"
                  >
                    Clear Filters
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Search Results */}
          <div className="space-y-4 lg:col-span-3">
            {/* Results Header */}
            {searchQuery && (
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">
                    {debouncedQuery
                      ? `Results for "${debouncedQuery}"`
                      : "All Novels"}
                  </h2>
                  {filteredResults.length > 0 && (
                    <p className="text-muted-foreground">
                      {filteredResults.length} novel
                      {filteredResults.length !== 1 ? "s" : ""} found
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Active Filters */}
            {(selectedGenres.length > 0 || selectedStatus) && (
              <div className="flex flex-wrap gap-2">
                <span className="text-muted-foreground text-sm">Filters:</span>
                {selectedGenres.map((genreSlug) => {
                  const genre = genres?.find((g) => g.slug === genreSlug);
                  return genre ? (
                    <Badge
                      key={genreSlug}
                      variant="secondary"
                      className="text-xs"
                    >
                      {genre.name}
                      <button
                        onClick={() => handleGenreToggle(genreSlug)}
                        className="hover:text-destructive ml-1"
                      >
                        ×
                      </button>
                    </Badge>
                  ) : null;
                })}
                {selectedStatus && (
                  <Badge variant="secondary" className="text-xs">
                    {selectedStatus.charAt(0).toUpperCase() +
                      selectedStatus.slice(1)}
                    <button
                      onClick={() => setSelectedStatus("")}
                      className="hover:text-destructive ml-1"
                    >
                      ×
                    </button>
                  </Badge>
                )}
              </div>
            )}

            {/* Results */}
            {!debouncedQuery && !searchQuery ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Search className="text-muted-foreground mx-auto mb-4 h-16 w-16" />
                  <h3 className="mb-2 text-xl font-medium">
                    Start Your Search
                  </h3>
                  <p className="text-muted-foreground">
                    Enter a search term to discover amazing novels
                  </p>
                </CardContent>
              </Card>
            ) : debouncedQuery.length < 3 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Search className="text-muted-foreground mx-auto mb-4 h-16 w-16" />
                  <h3 className="mb-2 text-xl font-medium">Keep Typing</h3>
                  <p className="text-muted-foreground">
                    Please enter at least 3 characters to search
                  </p>
                </CardContent>
              </Card>
            ) : searchLoading ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <LoadingThrobber
                    message="Searching novels..."
                    variant="soft"
                    size="lg"
                  />
                  <p className="text-muted-foreground/60 mt-2 text-xs">
                    Finding the perfect stories for you
                  </p>
                </CardContent>
              </Card>
            ) : searchError ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <div className="text-destructive mb-4">
                    <Search className="mx-auto mb-2 h-16 w-16" />
                  </div>
                  <h3 className="mb-2 text-xl font-medium">Search Error</h3>
                  <p className="text-muted-foreground mb-4">{searchError}</p>
                  <Button
                    variant="outline"
                    onClick={() => window.location.reload()}
                  >
                    Try Again
                  </Button>
                </CardContent>
              </Card>
            ) : filteredResults.length > 0 ? (
              <div className="space-y-4">
                {filteredResults.map((novel) => (
                  <NovelCard key={novel.id} novel={novel} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <BookOpen className="text-muted-foreground mx-auto mb-4 h-16 w-16" />
                  <h3 className="mb-2 text-xl font-medium">No Results Found</h3>
                  <p className="text-muted-foreground mb-4">
                    No novels match your search criteria. Try different keywords
                    or filters.
                  </p>
                  <Button variant="outline" onClick={clearFilters}>
                    Clear All Filters
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
