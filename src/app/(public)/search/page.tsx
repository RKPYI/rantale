"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BookOpen, Filter, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { NovelGrid } from "@/components/novels";
import { useSearchNovels, useGenres } from "@/hooks/use-novels";
import { useApi } from "@/hooks/use-api";
import { novelService } from "@/services/novels";
import { cn } from "@/lib/utils";
import { Genre, Novel, NovelListParams } from "@/types/api";

type SortBy =
  | "relevance"
  | "rating"
  | "views"
  | "chapters"
  | "updated"
  | "title";

const SORT_OPTIONS: { value: SortBy; label: string }[] = [
  { value: "relevance", label: "Relevance" },
  { value: "rating", label: "Highest rated" },
  { value: "views", label: "Most popular" },
  { value: "chapters", label: "Most chapters" },
  { value: "updated", label: "Recently updated" },
  { value: "title", label: "Title (A–Z)" },
];

const STATUS_OPTIONS = [
  { value: "", label: "Any status" },
  { value: "ongoing", label: "Ongoing" },
  { value: "completed", label: "Completed" },
  { value: "hiatus", label: "On hiatus" },
] as const;

function mapSortToApi(sortBy: SortBy): NovelListParams["sort_by"] {
  switch (sortBy) {
    case "rating":
      return "rating";
    case "views":
      return "popular";
    case "updated":
      return "updated";
    case "title":
      return "latest";
    default:
      return "popular";
  }
}

function sortNovels(novels: Novel[], sortBy: SortBy): Novel[] {
  const sorted = [...novels];
  switch (sortBy) {
    case "rating":
      return sorted.sort(
        (a, b) => parseFloat(b.rating || "0") - parseFloat(a.rating || "0"),
      );
    case "views":
      return sorted.sort((a, b) => (b.views || 0) - (a.views || 0));
    case "chapters":
      return sorted.sort(
        (a, b) => (b.total_chapters || 0) - (a.total_chapters || 0),
      );
    case "updated":
      return sorted.sort(
        (a, b) =>
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
      );
    case "title":
      return sorted.sort((a, b) => a.title.localeCompare(b.title));
    default:
      return sorted;
  }
}

function filterNovels(
  novels: Novel[],
  selectedGenres: string[],
  selectedStatus: string,
): Novel[] {
  return novels.filter((novel) => {
    if (selectedGenres.length > 0) {
      const novelGenres = novel.genres.map((g) => g.slug);
      if (!selectedGenres.some((genre) => novelGenres.includes(genre))) {
        return false;
      }
    }
    if (selectedStatus && novel.status !== selectedStatus) {
      return false;
    }
    return true;
  });
}

function FiltersPanel({
  genres,
  selectedGenres,
  selectedStatus,
  sortBy,
  onGenreToggle,
  onStatusChange,
  onSortChange,
  onClear,
  hasActiveFilters,
}: {
  genres?: Genre[];
  selectedGenres: string[];
  selectedStatus: string;
  sortBy: SortBy;
  onGenreToggle: (slug: string) => void;
  onStatusChange: (status: string) => void;
  onSortChange: (sort: SortBy) => void;
  onClear: () => void;
  hasActiveFilters: boolean;
}) {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold tracking-tight">Genres</h2>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={onClear}
              className="text-muted-foreground hover:text-foreground text-xs transition-colors"
            >
              Clear
            </button>
          )}
        </div>
        <div className="flex max-h-56 flex-wrap gap-1.5 overflow-y-auto pr-1">
          {genres?.map((genre) => {
            const active = selectedGenres.includes(genre.slug);
            return (
              <button
                key={genre.id}
                type="button"
                onClick={() => onGenreToggle(genre.slug)}
                className={cn(
                  "rounded-full border px-2.5 py-1 text-xs transition-colors",
                  active
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground",
                )}
              >
                {genre.name}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-sm font-semibold tracking-tight">Status</h2>
        <div className="space-y-2">
          {STATUS_OPTIONS.map((option) => (
            <label
              key={option.value || "any"}
              className="flex cursor-pointer items-center gap-2.5"
            >
              <Checkbox
                checked={selectedStatus === option.value}
                onCheckedChange={(checked) => {
                  if (checked) onStatusChange(option.value);
                  else if (option.value === selectedStatus) onStatusChange("");
                }}
              />
              <span className="text-sm">{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-sm font-semibold tracking-tight">Sort by</h2>
        <Select
          value={sortBy}
          onValueChange={(value) => onSortChange(value as SortBy)}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const initialGenre = searchParams.get("genre") || "";

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
  const [selectedGenres, setSelectedGenres] = useState<string[]>(
    initialGenre ? [initialGenre] : [],
  );
  const [selectedStatus, setSelectedStatus] = useState("");
  const [sortBy, setSortBy] = useState<SortBy>("relevance");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const { data: genres } = useGenres();

  const isSearchMode = debouncedQuery.length >= 3;
  const isBrowseMode =
    !isSearchMode && (selectedGenres.length > 0 || !!selectedStatus);

  const {
    data: searchResults,
    loading: searchLoading,
    error: searchError,
  } = useSearchNovels(isSearchMode ? debouncedQuery : "");

  const browseParams = useMemo<NovelListParams | null>(() => {
    if (!isBrowseMode) return null;
    return {
      genre: selectedGenres[0],
      status: (selectedStatus || undefined) as NovelListParams["status"],
      sort_by: mapSortToApi(sortBy),
      sort_order: sortBy === "title" ? "asc" : "desc",
      per_page: 24,
    };
  }, [isBrowseMode, selectedGenres, selectedStatus, sortBy]);

  const {
    data: browseData,
    loading: browseLoading,
    error: browseError,
  } = useApi(
    () =>
      browseParams
        ? novelService.getNovels(browseParams)
        : Promise.resolve(null),
    [JSON.stringify(browseParams)],
  );

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Apply genre from URL (e.g. /search?genre=fantasy from browse)
  useEffect(() => {
    const urlGenre = searchParams.get("genre") || "";
    if (!urlGenre) return;
    setSelectedGenres((prev) =>
      prev.length === 1 && prev[0] === urlGenre ? prev : [urlGenre],
    );
  }, [searchParams]);

  // Keep the address bar in sync without interrupting typing
  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedQuery) params.set("q", debouncedQuery);
    if (selectedGenres.length === 1) params.set("genre", selectedGenres[0]);

    const next = params.toString();
    const current = searchParams.toString();
    if (next !== current) {
      router.replace(next ? `/search?${next}` : "/search", { scroll: false });
    }
  }, [debouncedQuery, selectedGenres, router, searchParams]);

  const handleGenreToggle = useCallback((genreSlug: string) => {
    setSelectedGenres((prev) =>
      prev.includes(genreSlug)
        ? prev.filter((g) => g !== genreSlug)
        : [...prev, genreSlug],
    );
  }, []);

  const clearFilters = useCallback(() => {
    setSelectedGenres([]);
    setSelectedStatus("");
    setSortBy("relevance");
  }, []);

  const hasActiveFilters =
    selectedGenres.length > 0 ||
    !!selectedStatus ||
    sortBy !== "relevance";

  const filteredResults = useMemo(() => {
    if (isSearchMode) {
      const base = filterNovels(
        searchResults ?? [],
        selectedGenres,
        selectedStatus,
      );
      return sortBy === "relevance" ? base : sortNovels(base, sortBy);
    }

    if (isBrowseMode) {
      const base = filterNovels(
        browseData?.data ?? [],
        selectedGenres,
        selectedStatus,
      );
      // chapters / title may need client sort even in browse mode
      if (sortBy === "chapters" || sortBy === "title") {
        return sortNovels(base, sortBy);
      }
      return base;
    }

    return [];
  }, [
    isSearchMode,
    isBrowseMode,
    searchResults,
    browseData,
    selectedGenres,
    selectedStatus,
    sortBy,
  ]);

  const loading = isSearchMode
    ? searchLoading
    : isBrowseMode
      ? browseLoading
      : false;
  const error = isSearchMode ? searchError : isBrowseMode ? browseError : null;
  const showIdle = !isSearchMode && !isBrowseMode;
  const showTooShort =
    searchQuery.length > 0 && searchQuery.length < 3 && !isBrowseMode;

  const activeFilterCount =
    selectedGenres.length + (selectedStatus ? 1 : 0);

  const filterProps = {
    genres: genres ?? undefined,
    selectedGenres,
    selectedStatus,
    sortBy,
    onGenreToggle: handleGenreToggle,
    onStatusChange: setSelectedStatus,
    onSortChange: setSortBy,
    onClear: clearFilters,
    hasActiveFilters,
  };

  return (
    <div className="container mx-auto px-4 py-8 md:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Search</h1>
          <p className="text-muted-foreground">
            Find novels by title, author, or browse with filters.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
              placeholder="Search by title, author, or description…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-11 pr-10 pl-10 text-base"
              autoFocus
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setDebouncedQuery("");
                }}
                className="text-muted-foreground hover:text-foreground absolute top-1/2 right-2.5 -translate-y-1/2 rounded-md p-1 transition-colors"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 lg:hidden">
            <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Filter className="h-4 w-4" />
                  Filters
                  {activeFilterCount > 0 && (
                    <Badge
                      variant="secondary"
                      className="h-5 min-w-5 justify-center px-1.5 text-[10px]"
                    >
                      {activeFilterCount}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent
                side="bottom"
                className="max-h-[85vh] gap-0 overflow-y-auto rounded-t-2xl px-0 pb-[max(1.5rem,env(safe-area-inset-bottom))]"
              >
                <SheetHeader className="border-b px-5 pt-5 pb-4">
                  <SheetTitle>Filters</SheetTitle>
                </SheetHeader>
                <div className="px-5 pt-5 pb-2">
                  <FiltersPanel {...filterProps} />
                </div>
                <div className="sticky bottom-0 border-t bg-background px-5 pt-3 pb-1">
                  <Button
                    className="w-full"
                    onClick={() => setFiltersOpen(false)}
                  >
                    Show results
                  </Button>
                </div>
              </SheetContent>
            </Sheet>

            <Select
              value={sortBy}
              onValueChange={(value) => setSortBy(value as SortBy)}
            >
              <SelectTrigger className="min-w-[140px] flex-1">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {(selectedGenres.length > 0 || selectedStatus) && (
          <div className="flex flex-wrap items-center gap-2">
            {selectedGenres.map((genreSlug) => {
              const genre = genres?.find((g) => g.slug === genreSlug);
              if (!genre) return null;
              return (
                <Badge
                  key={genreSlug}
                  variant="secondary"
                  className="gap-1 pr-1"
                >
                  {genre.name}
                  <button
                    type="button"
                    onClick={() => handleGenreToggle(genreSlug)}
                    className="hover:bg-foreground/10 rounded-full p-0.5"
                    aria-label={`Remove ${genre.name}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              );
            })}
            {selectedStatus && (
              <Badge variant="secondary" className="gap-1 pr-1">
                {selectedStatus.charAt(0).toUpperCase() +
                  selectedStatus.slice(1)}
                <button
                  type="button"
                  onClick={() => setSelectedStatus("")}
                  className="hover:bg-foreground/10 rounded-full p-0.5"
                  aria-label="Remove status filter"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[220px_minmax(0,1fr)]">
          <aside className="hidden lg:block">
            <div className="sticky top-20">
              <FiltersPanel {...filterProps} />
            </div>
          </aside>

          <div className="min-w-0 space-y-4">
            {(isSearchMode || isBrowseMode) && !loading && !error && (
              <div className="flex items-end justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold tracking-tight">
                    {isSearchMode
                      ? `Results for “${debouncedQuery}”`
                      : selectedGenres.length === 1
                        ? (genres?.find((g) => g.slug === selectedGenres[0])
                            ?.name ?? "Filtered novels")
                        : "Filtered novels"}
                  </h2>
                  <p className="text-muted-foreground text-sm">
                    {filteredResults.length} novel
                    {filteredResults.length !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
            )}

            {showIdle ? (
              <div className="flex flex-col items-center py-16 text-center">
                <Search className="text-muted-foreground mb-4 h-12 w-12" />
                <h2 className="mb-1 text-lg font-medium">Start searching</h2>
                <p className="text-muted-foreground max-w-sm text-sm">
                  Type at least 3 characters, or pick a genre to browse.
                </p>
              </div>
            ) : showTooShort ? (
              <div className="flex flex-col items-center py-16 text-center">
                <Search className="text-muted-foreground mb-4 h-12 w-12" />
                <h2 className="mb-1 text-lg font-medium">Keep typing</h2>
                <p className="text-muted-foreground max-w-sm text-sm">
                  Enter at least 3 characters to search.
                </p>
              </div>
            ) : loading ? (
              <NovelGrid loading size="compact" skeletonCount={12} />
            ) : error ? (
              <div className="flex flex-col items-center py-16 text-center">
                <Search className="text-muted-foreground mb-4 h-12 w-12" />
                <h2 className="mb-1 text-lg font-medium">Search failed</h2>
                <p className="text-muted-foreground mb-4 max-w-sm text-sm">
                  {error}
                </p>
                <Button
                  variant="outline"
                  onClick={() => window.location.reload()}
                >
                  Try again
                </Button>
              </div>
            ) : filteredResults.length > 0 ? (
              <NovelGrid novels={filteredResults} size="compact" />
            ) : (
              <div className="flex flex-col items-center py-16 text-center">
                <BookOpen className="text-muted-foreground mb-4 h-12 w-12" />
                <h2 className="mb-1 text-lg font-medium">No results</h2>
                <p className="text-muted-foreground mb-4 max-w-sm text-sm">
                  Nothing matched. Try different keywords or clear filters.
                </p>
                {hasActiveFilters && (
                  <Button variant="outline" onClick={clearFilters}>
                    Clear filters
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
