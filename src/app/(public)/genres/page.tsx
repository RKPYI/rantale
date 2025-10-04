"use client";

import { BookOpen, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';

import { useGenres } from '@/hooks/use-novels';
import { Genre } from '@/types/api';

export default function GenresPage() {
  const { data: genres, loading, error } = useGenres();

  const GenreCard = ({ genre }: { genre: Genre }) => (
    <Link href={`/search?genre=${genre.slug}`}>
      <Card className="hover:shadow-lg transition-all duration-200 hover:scale-[1.02] cursor-pointer">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold">{genre.name}</h3>
            <BookOpen className="h-5 w-5 text-muted-foreground" />
          </div>
          
          {genre.description && (
            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
              {genre.description}
            </p>
          )}
          
          <div className="flex items-center justify-between">
            <Badge variant="secondary" className="text-xs">
              {genre.novels_count || 0} novels
            </Badge>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3" />
              Popular
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );

  const LoadingSkeleton = () => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-3">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-5 w-5 rounded" />
        </div>
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-3/4 mb-4" />
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-4 w-12" />
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Explore Genres</h1>
          <p className="text-muted-foreground">
            Browse novels by genre and discover stories that match your interests
          </p>
        </div>

        {/* Genres Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <LoadingSkeleton key={i} />
            ))}
          </div>
        ) : error ? (
          <Card>
            <CardContent className="p-8 text-center">
              <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-medium mb-2">Error Loading Genres</h3>
              <p className="text-muted-foreground mb-4">
                {error}
              </p>
              <button 
                onClick={() => window.location.reload()}
                className="text-primary hover:text-primary/80 font-medium"
              >
                Try Again
              </button>
            </CardContent>
          </Card>
        ) : genres && genres.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {genres.map((genre) => (
              <GenreCard key={genre.id} genre={genre} />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-medium mb-2">No Genres Found</h3>
              <p className="text-muted-foreground">
                Genres will appear here once they are added to the system.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Popular Genres Section */}
        {genres && genres.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Popular Genres</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
              {genres
                .sort((a, b) => (b.novels_count || 0) - (a.novels_count || 0))
                .slice(0, 12)
                .map((genre) => (
                  <Link key={genre.id} href={`/search?genre=${genre.slug}`}>
                    <Badge 
                      variant="outline" 
                      className="w-full justify-center py-2 hover:bg-muted transition-colors cursor-pointer"
                    >
                      {genre.name}
                    </Badge>
                  </Link>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}