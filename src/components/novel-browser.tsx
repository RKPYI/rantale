"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Star, 
  Clock, 
  TrendingUp, 
  BookOpen, 
  Filter,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

import {
  useNovels,
  useSearchNovels,
  usePopularNovels,
  useLatestNovels,
  useRecommendedNovels,
  useGenres,
  useNovelsByGenre,
  useNovelsByStatus
} from '@/hooks/use-novels';

import {
  formatRating,
  formatChapterCount,
  formatViewCount,
  formatStatus,
  getStatusColor,
  truncateDescription,
  simplifyPagination,
  formatRelativeTime
} from '@/lib/novel-utils';

import { NovelListParams } from '@/types/api';

export function NovelBrowserComponent() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<'ongoing' | 'completed' | 'hiatus' | ''>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<'popular' | 'rating' | 'latest' | 'updated'>('latest');

  // Fetch genres for filtering
  const { data: genres, loading: genresLoading } = useGenres();

  // Build novel list parameters
  const novelParams: NovelListParams = {
    page: currentPage,
    per_page: 12,
    sort_by: sortBy,
    sort_order: 'desc',
    ...(selectedGenre && { genre: selectedGenre }),
    ...(selectedStatus && { status: selectedStatus })
  };

  // Fetch novels based on current filters
  const { data: novels, loading: novelsLoading, error: novelsError, refetch: refetchNovels } = useNovels(novelParams);

  // Fetch different novel collections
  const { data: popularNovels, loading: popularLoading } = usePopularNovels();
  const { data: latestNovels, loading: latestLoading } = useLatestNovels();
  const { data: recommendedNovels, loading: recommendedLoading } = useRecommendedNovels();
  
  // Search functionality
  const { data: searchResults, loading: searchLoading } = useSearchNovels(searchQuery);

  // Pagination helper
  const pagination = novels ? simplifyPagination(novels) : null;

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    refetchNovels();
  };

  // Reset filters
  const resetFilters = () => {
    setSelectedGenre('');
    setSelectedStatus('');
    setCurrentPage(1);
    setSortBy('latest');
  };

  // Novel card component
  const NovelCard = ({ novel }: { novel: any }) => (
    <Card className="hover:shadow-lg transition-shadow h-full">
      <CardContent className="p-4 h-full flex flex-col">
        <div className="flex-1">
          <h3 className="font-semibold mb-2 truncate" title={novel.title}>
            {novel.title}
          </h3>
          <p className="text-sm text-muted-foreground mb-2">
            by {novel.author}
          </p>
          <p className="text-xs text-muted-foreground mb-3 line-clamp-3">
            {truncateDescription(novel.description)}
          </p>
          
          {/* Genres */}
          <div className="flex flex-wrap gap-1 mb-3">
            {novel.genres.slice(0, 2).map((genre: any) => (
              <Badge key={genre.id} variant="secondary" className="text-xs">
                {genre.name}
              </Badge>
            ))}
            {novel.genres.length > 2 && (
              <Badge variant="secondary" className="text-xs">
                +{novel.genres.length - 2}
              </Badge>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="space-y-2 mt-auto">
          <div className="flex items-center justify-between text-sm">
            <Badge variant={getStatusColor(novel.status)}>
              {formatStatus(novel.status)}
            </Badge>
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-current text-yellow-400" />
              {formatRating(novel.rating)}
            </div>
          </div>
          <div className="text-xs text-muted-foreground flex justify-between">
            <span>{formatChapterCount(novel.total_chapters)}</span>
            <span>{formatViewCount(novel.views)} views</span>
          </div>
          <div className="text-xs text-muted-foreground">
            Updated {formatRelativeTime(novel.updated_at)}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // Loading skeleton
  const LoadingSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {Array.from({ length: 12 }).map((_, i) => (
        <Skeleton key={i} className="h-64 w-full" />
      ))}
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">Novel Browser</h1>
        <p className="text-muted-foreground">
          Explore our collection of novels with advanced filtering and search
        </p>
      </div>

      <Tabs defaultValue="browse" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="browse">Browse</TabsTrigger>
          <TabsTrigger value="popular">Popular</TabsTrigger>
          <TabsTrigger value="latest">Latest</TabsTrigger>
          <TabsTrigger value="recommended">Recommended</TabsTrigger>
        </TabsList>

        {/* Browse Tab */}
        <TabsContent value="browse" className="space-y-6">
          {/* Search and Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Search & Filters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search novels by title, author, or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Genre Filter */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Genre</label>
                  <select
                    value={selectedGenre}
                    onChange={(e) => setSelectedGenre(e.target.value)}
                    className="w-full p-2 border rounded-md bg-background"
                    disabled={genresLoading}
                  >
                    <option value="">All Genres</option>
                    {genres?.map((genre) => (
                      <option key={genre.id} value={genre.slug}>
                        {genre.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Status Filter */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Status</label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value as any)}
                    className="w-full p-2 border rounded-md bg-background"
                  >
                    <option value="">All Status</option>
                    <option value="ongoing">Ongoing</option>
                    <option value="completed">Completed</option>
                    <option value="hiatus">On Hiatus</option>
                  </select>
                </div>

                {/* Sort By */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Sort By</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="w-full p-2 border rounded-md bg-background"
                  >
                    <option value="latest">Latest Updates</option>
                    <option value="popular">Most Popular</option>
                    <option value="rating">Highest Rated</option>
                    <option value="updated">Recently Updated</option>
                  </select>
                </div>

                {/* Reset Button */}
                <div className="flex items-end">
                  <Button onClick={resetFilters} variant="outline" className="w-full">
                    Reset Filters
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Search Results */}
          {searchQuery.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Search Results for "{searchQuery}"</CardTitle>
              </CardHeader>
              <CardContent>
                {searchLoading ? (
                  <LoadingSkeleton />
                ) : searchResults && searchResults.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {searchResults.map((novel) => (
                      <NovelCard key={novel.id} novel={novel} />
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    No novels found matching your search.
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Novels List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Novels</span>
                {pagination && (
                  <span className="text-sm font-normal text-muted-foreground">
                    {pagination.from}-{pagination.to} of {pagination.totalItems}
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {novelsError && (
                <div className="text-red-500 text-center py-4 mb-4 bg-red-50 rounded">
                  Error: {novelsError}
                </div>
              )}

              {novelsLoading ? (
                <LoadingSkeleton />
              ) : novels && novels.data.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
                    {novels.data.map((novel) => (
                      <NovelCard key={novel.id} novel={novel} />
                    ))}
                  </div>

                  {/* Pagination */}
                  {pagination && pagination.totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(pagination.currentPage - 1)}
                        disabled={!pagination.hasPrev}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                      </Button>
                      
                      <div className="flex items-center gap-1">
                        {/* Simple pagination display */}
                        <span className="text-sm text-muted-foreground px-2">
                          Page {pagination.currentPage} of {pagination.totalPages}
                        </span>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(pagination.currentPage + 1)}
                        disabled={!pagination.hasNext}
                      >
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  No novels found with the current filters.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Popular Tab */}
        <TabsContent value="popular">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Popular Novels
              </CardTitle>
            </CardHeader>
            <CardContent>
              {popularLoading ? (
                <LoadingSkeleton />
              ) : popularNovels && popularNovels.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {popularNovels.map((novel) => (
                    <NovelCard key={novel.id} novel={novel} />
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  No popular novels available.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Latest Tab */}
        <TabsContent value="latest">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Latest Novels
              </CardTitle>
            </CardHeader>
            <CardContent>
              {latestLoading ? (
                <LoadingSkeleton />
              ) : latestNovels && latestNovels.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {latestNovels.map((novel) => (
                    <NovelCard key={novel.id} novel={novel} />
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  No latest novels available.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Recommended Tab */}
        <TabsContent value="recommended">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Recommended Novels
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recommendedLoading ? (
                <LoadingSkeleton />
              ) : recommendedNovels && recommendedNovels.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {recommendedNovels.map((novel) => (
                    <NovelCard key={novel.id} novel={novel} />
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  No recommended novels available.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}