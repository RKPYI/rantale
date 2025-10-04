"use client";

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, Filter, SortAsc, BookOpen, Star, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import Image from 'next/image';

import { useSearchNovels, useGenres } from '@/hooks/use-novels';
import { 
  formatRating, 
  formatChapterCount, 
  formatViewCount,
  truncateDescription,
  getStatusColor
} from '@/lib/novel-utils';
import { cn } from '@/lib/utils';
import { LoadingSpinner, NovelSearchLoading } from '@/components/ui/loading-spinner';
import { SearchSpinner, LoadingThrobber } from '@/components/ui/spinner';
import { Novel, Genre } from '@/types/api';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('relevance');

  // Fetch genres for filtering
  const { data: genres } = useGenres();
  
  // Search novels with current query
  const { data: searchResults, loading: searchLoading, error: searchError } = useSearchNovels(debouncedQuery);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Update query when URL params change
  useEffect(() => {
    const urlQuery = searchParams.get('q') || '';
    if (urlQuery !== searchQuery) {
      setSearchQuery(urlQuery);
    }
  }, [searchParams]);

  const handleGenreToggle = (genreSlug: string) => {
    setSelectedGenres(prev => 
      prev.includes(genreSlug) 
        ? prev.filter(g => g !== genreSlug)
        : [...prev, genreSlug]
    );
  };

  const clearFilters = () => {
    setSelectedGenres([]);
    setSelectedStatus('');
    setSortBy('relevance');
  };

  // Filter and sort results
  const filteredResults = searchResults ? searchResults.filter(novel => {
    // Genre filter
    if (selectedGenres.length > 0) {
      const novelGenres = novel.genres.map(g => g.slug);
      if (!selectedGenres.some(genre => novelGenres.includes(genre))) {
        return false;
      }
    }
    
    // Status filter
    if (selectedStatus && novel.status !== selectedStatus) {
      return false;
    }
    
    return true;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'rating':
        return parseFloat(b.rating || '0') - parseFloat(a.rating || '0');
      case 'views':
        return (b.views || 0) - (a.views || 0);
      case 'chapters':
        return (b.total_chapters || 0) - (a.total_chapters || 0);
      case 'updated':
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      case 'title':
        return a.title.localeCompare(b.title);
      default:
        return 0; // relevance - keep original order
    }
  }) : [];

  const NovelCard = ({ novel }: { novel: Novel }) => (
    <Link href={`/novels/${novel.slug}`}>
      <Card className="hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
        <CardContent className="p-4">
          <div className="flex gap-4">
            {/* Cover Image */}
            <div className="flex-shrink-0">
              {novel.cover_image ? (
                <Image
                  src={novel.cover_image}
                  alt={novel.title}
                  width={80}
                  height={120}
                  className="rounded object-cover bg-muted"
                />
              ) : (
                <div className="w-20 h-30 bg-muted rounded flex items-center justify-center">
                  <BookOpen className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
            </div>
            
            {/* Novel Info */}
            <div className="flex-1 min-w-0 space-y-2">
              <div>
                <h3 className="font-semibold text-lg line-clamp-2">{novel.title}</h3>
                <p className="text-muted-foreground">by {novel.author}</p>
              </div>
              
              <p className="text-sm text-muted-foreground line-clamp-3">
                {truncateDescription(novel.description, 200)}
              </p>
              
              {/* Genres */}
              <div className="flex flex-wrap gap-1">
                {novel.genres.slice(0, 3).map((genre) => (
                  <Badge key={genre.id} variant="secondary" className="text-xs">
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
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-current text-yellow-400" />
                  <span>{formatRating(novel.rating)}</span>
                </div>
                <Badge variant={getStatusColor(novel.status)}>
                  {novel.status}
                </Badge>
                <span>{formatChapterCount(novel.total_chapters)}</span>
                <span>{formatViewCount(novel.views)} views</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );

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
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search by title, author, or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 text-base"
              />
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Filters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Genre Filter */}
                <div>
                  <h4 className="font-medium mb-2">Genres</h4>
                  <div className="space-y-1 max-h-48 overflow-y-auto">
                    {genres?.map((genre: Genre) => (
                      <label key={genre.id} className="flex items-center space-x-2 cursor-pointer">
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
                  <h4 className="font-medium mb-2">Status</h4>
                  <div className="space-y-1">
                    {['', 'ongoing', 'completed', 'hiatus'].map((status) => (
                      <label key={status} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          name="status"
                          checked={selectedStatus === status}
                          onChange={() => setSelectedStatus(status)}
                        />
                        <span className="text-sm">
                          {status === '' ? 'All Status' : status.charAt(0).toUpperCase() + status.slice(1)}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Sort Options */}
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-1">
                    <SortAsc className="h-4 w-4" />
                    Sort By
                  </h4>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full p-2 border rounded text-sm"
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
                {(selectedGenres.length > 0 || selectedStatus || sortBy !== 'relevance') && (
                  <Button variant="outline" size="sm" onClick={clearFilters} className="w-full">
                    Clear Filters
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Search Results */}
          <div className="lg:col-span-3 space-y-4">
            {/* Results Header */}
            {searchQuery && (
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">
                    {debouncedQuery ? `Results for "${debouncedQuery}"` : 'All Novels'}
                  </h2>
                  {filteredResults.length > 0 && (
                    <p className="text-muted-foreground">
                      {filteredResults.length} novel{filteredResults.length !== 1 ? 's' : ''} found
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Active Filters */}
            {(selectedGenres.length > 0 || selectedStatus) && (
              <div className="flex flex-wrap gap-2">
                <span className="text-sm text-muted-foreground">Filters:</span>
                {selectedGenres.map((genreSlug) => {
                  const genre = genres?.find(g => g.slug === genreSlug);
                  return genre ? (
                    <Badge key={genreSlug} variant="secondary" className="text-xs">
                      {genre.name}
                      <button
                        onClick={() => handleGenreToggle(genreSlug)}
                        className="ml-1 hover:text-destructive"
                      >
                        ×
                      </button>
                    </Badge>
                  ) : null;
                })}
                {selectedStatus && (
                  <Badge variant="secondary" className="text-xs">
                    {selectedStatus.charAt(0).toUpperCase() + selectedStatus.slice(1)}
                    <button
                      onClick={() => setSelectedStatus('')}
                      className="ml-1 hover:text-destructive"
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
                  <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-medium mb-2">Start Your Search</h3>
                  <p className="text-muted-foreground">
                    Enter a search term to discover amazing novels
                  </p>
                </CardContent>
              </Card>
            ) : debouncedQuery.length < 3 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-medium mb-2">Keep Typing</h3>
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
                  <p className="text-xs text-muted-foreground/60 mt-2">
                    Finding the perfect stories for you
                  </p>
                </CardContent>
              </Card>
            ) : searchError ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <div className="text-destructive mb-4">
                    <Search className="h-16 w-16 mx-auto mb-2" />
                  </div>
                  <h3 className="text-xl font-medium mb-2">Search Error</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchError}
                  </p>
                  <Button variant="outline" onClick={() => window.location.reload()}>
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
                  <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-medium mb-2">No Results Found</h3>
                  <p className="text-muted-foreground mb-4">
                    No novels match your search criteria. Try different keywords or filters.
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