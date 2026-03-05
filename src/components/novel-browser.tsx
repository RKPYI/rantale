"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Filter, ChevronLeft, ChevronRight } from "lucide-react";

import {
  useNovels,
  useSearchNovels,
  usePopularNovels,
  useLatestNovels,
  useRecommendedNovels,
  useGenres,
} from "@/hooks/use-novels";

import { simplifyPagination } from "@/lib/novel-utils";
import { NovelListParams } from "@/types/api";
import { NovelGrid } from "@/components/novels";

// ---------- Type aliases ----------

type SortBy = "popular" | "rating" | "latest" | "updated";
type NovelStatus = "ongoing" | "completed" | "hiatus" | "";

// ---------- Component ----------

export function NovelBrowserComponent() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<NovelStatus>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<SortBy>("latest");

  // --- Data fetching ---

  const { data: genres, loading: genresLoading } = useGenres();

  const novelParams: NovelListParams = {
    page: currentPage,
    per_page: 12,
    sort_by: sortBy,
    sort_order: "desc",
    ...(selectedGenre && { genre: selectedGenre }),
    ...(selectedStatus && { status: selectedStatus }),
  };

  const {
    data: novels,
    loading: novelsLoading,
    error: novelsError,
    refetch: refetchNovels,
  } = useNovels(novelParams);

  const { data: popularNovels, loading: popularLoading } = usePopularNovels();
  const { data: latestNovels, loading: latestLoading } = useLatestNovels();
  const { data: recommendedNovels, loading: recommendedLoading } =
    useRecommendedNovels();
  const { data: searchResults, loading: searchLoading } =
    useSearchNovels(searchQuery);

  // --- Derived state ---

  const pagination = novels ? simplifyPagination(novels) : null;

  // --- Handlers ---

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    refetchNovels();
  };

  const resetFilters = () => {
    setSelectedGenre("");
    setSelectedStatus("");
    setCurrentPage(1);
    setSortBy("latest");
  };

  // ---------- Render ----------

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        {/* Page header — left-aligned, consistent with other pages */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Book Browser</h1>
          <p className="text-muted-foreground">
            Explore our collection of books with advanced filtering and search
          </p>
        </div>

        <Tabs defaultValue="browse" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="browse">Browse</TabsTrigger>
            <TabsTrigger value="popular">Popular</TabsTrigger>
            <TabsTrigger value="latest">Latest</TabsTrigger>
            <TabsTrigger value="recommended">Recommended</TabsTrigger>
          </TabsList>

          {/* ───── Browse Tab ───── */}
          <TabsContent value="browse" className="space-y-6">
            {/* Search & Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Search & Filters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Search input */}
                <div className="relative">
                  <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
                  <Input
                    placeholder="Search books by title, student, or description…"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Filter row */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                  {/* Genre */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Genre</label>
                    <Select
                      value={selectedGenre}
                      onValueChange={setSelectedGenre}
                      disabled={genresLoading}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="All Genres" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Genres</SelectItem>
                        {genres?.map((genre) => (
                          <SelectItem key={genre.id} value={genre.slug}>
                            {genre.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Status */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Status</label>
                    <Select
                      value={selectedStatus}
                      onValueChange={(v) => setSelectedStatus(v as NovelStatus)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="All Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Status</SelectItem>
                        <SelectItem value="ongoing">Ongoing</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="hiatus">On Hiatus</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Sort By */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Sort By</label>
                    <Select
                      value={sortBy}
                      onValueChange={(v) => setSortBy(v as SortBy)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="latest">Latest Updates</SelectItem>
                        <SelectItem value="popular">Most Popular</SelectItem>
                        <SelectItem value="rating">Highest Rated</SelectItem>
                        <SelectItem value="updated">
                          Recently Updated
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Reset */}
                  <div className="flex items-end">
                    <Button
                      onClick={resetFilters}
                      variant="outline"
                      className="w-full"
                    >
                      Reset Filters
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Search Results (shown only while searching) */}
            {searchQuery.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>
                    Search Results for &ldquo;{searchQuery}&rdquo;
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <NovelGrid
                    novels={searchResults ?? undefined}
                    loading={searchLoading}
                    emptyMessage={`No books found matching "${searchQuery}".`}
                  />
                </CardContent>
              </Card>
            )}

            {/* Main novels list */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Books</span>
                  {pagination && (
                    <span className="text-muted-foreground text-sm font-normal">
                      {pagination.from}-{pagination.to} of{" "}
                      {pagination.totalItems}
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {novelsError && (
                  <div className="mb-4 rounded bg-red-50 py-4 text-center text-red-500">
                    Error: {novelsError}
                  </div>
                )}

                <NovelGrid
                  novels={novels?.data}
                  loading={novelsLoading}
                  emptyMessage="No books found with the current filters."
                />

                {/* Pagination */}
                {pagination && pagination.totalPages > 1 && (
                  <div className="mt-6 flex items-center justify-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handlePageChange(pagination.currentPage - 1)
                      }
                      disabled={!pagination.hasPrev}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>

                    <span className="text-muted-foreground px-2 text-sm">
                      Page {pagination.currentPage} of {pagination.totalPages}
                    </span>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handlePageChange(pagination.currentPage + 1)
                      }
                      disabled={!pagination.hasNext}
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ───── Popular Tab ───── */}
          <TabsContent value="popular">
            <Card>
              <CardHeader>
                <CardTitle>Popular Books</CardTitle>
              </CardHeader>
              <CardContent>
                <NovelGrid
                  novels={popularNovels ?? undefined}
                  loading={popularLoading}
                  emptyMessage="No popular books available."
                  emptyIcon="book"
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* ───── Latest Tab ───── */}
          <TabsContent value="latest">
            <Card>
              <CardHeader>
                <CardTitle>Latest Books</CardTitle>
              </CardHeader>
              <CardContent>
                <NovelGrid
                  novels={latestNovels ?? undefined}
                  loading={latestLoading}
                  emptyMessage="No latest books available."
                  emptyIcon="clock"
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* ───── Recommended Tab ───── */}
          <TabsContent value="recommended">
            <Card>
              <CardHeader>
                <CardTitle>Recommended Books</CardTitle>
              </CardHeader>
              <CardContent>
                <NovelGrid
                  novels={recommendedNovels ?? undefined}
                  loading={recommendedLoading}
                  emptyMessage="No recommended books available."
                  emptyIcon="star"
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
