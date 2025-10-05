"use client";

import { useState } from "react";
import { Star, TrendingUp, Clock, BookOpen, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import Image from "next/image";

import { useNovels } from "@/hooks/use-novels";
import {
  formatRating,
  formatChapterCount,
  formatViewCount,
  truncateDescription,
  getStatusColor,
} from "@/lib/novel-utils";
import { Novel } from "@/types/api";

export default function TopRatedPage() {
  const [activeTab, setActiveTab] = useState("rating");

  // Fetch novels with different sorting
  const { data: topRatedData, loading: ratingLoading } = useNovels({
    sort_by: "rating",
    per_page: 20,
  });

  const { data: mostViewedData, loading: viewsLoading } = useNovels({
    sort_by: "popular",
    per_page: 20,
  });

  const { data: recentlyUpdatedData, loading: updatedLoading } = useNovels({
    sort_by: "updated",
    per_page: 20,
  });

  // Extract data arrays from paginated responses
  const topRated = topRatedData?.data;
  const mostViewed = mostViewedData?.data;
  const recentlyUpdated = recentlyUpdatedData?.data;

  const NovelCard = ({ novel, rank }: { novel: Novel; rank: number }) => (
    <Link href={`/novels/${novel.slug}`}>
      <Card className="cursor-pointer transition-all duration-200 hover:scale-[1.01] hover:shadow-lg">
        <CardContent className="p-4">
          <div className="flex gap-4">
            {/* Rank Badge */}
            <div className="flex flex-shrink-0 flex-col items-center">
              <div
                className={`mb-2 flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-white ${
                  rank <= 3
                    ? "bg-gradient-to-r from-yellow-400 to-yellow-600"
                    : rank <= 10
                      ? "bg-gradient-to-r from-slate-400 to-slate-600"
                      : "bg-gradient-to-r from-orange-400 to-orange-600"
                } `}
              >
                {rank}
              </div>

              {/* Cover Image */}
              {novel.cover_image ? (
                <Image
                  src={novel.cover_image}
                  alt={novel.title}
                  width={80}
                  height={120}
                  className="bg-muted rounded object-cover"
                />
              ) : (
                <div className="bg-muted flex h-30 w-20 items-center justify-center rounded">
                  <BookOpen className="text-muted-foreground h-8 w-8" />
                </div>
              )}
            </div>

            {/* Novel Info */}
            <div className="min-w-0 flex-1 space-y-2">
              <div>
                <h3 className="line-clamp-2 text-lg font-semibold">
                  {novel.title}
                </h3>
                <p className="text-muted-foreground">by {novel.author}</p>
              </div>

              <p className="text-muted-foreground line-clamp-3 text-sm">
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
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1 text-yellow-600">
                  <Star className="h-4 w-4 fill-current" />
                  <span className="font-medium">
                    {formatRating(novel.rating)}
                  </span>
                </div>
                <Badge variant={getStatusColor(novel.status)}>
                  {novel.status}
                </Badge>
                <div className="text-muted-foreground flex items-center gap-1">
                  <BookOpen className="h-4 w-4" />
                  <span>{formatChapterCount(novel.total_chapters)}</span>
                </div>
                <div className="text-muted-foreground flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  <span>{formatViewCount(novel.views)}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );

  const LoadingSkeleton = ({ rank }: { rank: number }) => (
    <Card>
      <CardContent className="p-4">
        <div className="flex gap-4">
          <div className="flex flex-shrink-0 flex-col items-center">
            <div className="bg-muted mb-2 flex h-8 w-8 items-center justify-center rounded-full">
              <span className="text-sm font-bold">{rank}</span>
            </div>
            <Skeleton className="h-30 w-20 rounded" />
          </div>
          <div className="flex-1 space-y-2">
            <div>
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="mt-1 h-4 w-1/2" />
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <div className="flex gap-2">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-5 w-16" />
            </div>
            <div className="flex gap-4">
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-4 w-12" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderNovelList = (novels: Novel[] | undefined, loading: boolean) => {
    if (loading) {
      return (
        <div className="space-y-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <LoadingSkeleton key={i} rank={i + 1} />
          ))}
        </div>
      );
    }

    if (!novels || novels.length === 0) {
      return (
        <Card>
          <CardContent className="p-8 text-center">
            <TrendingUp className="text-muted-foreground mx-auto mb-4 h-16 w-16" />
            <h3 className="mb-2 text-xl font-medium">No Novels Found</h3>
            <p className="text-muted-foreground">
              Check back later for top-rated content.
            </p>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="space-y-4">
        {novels.map((novel, index) => (
          <NovelCard key={novel.id} novel={novel} rank={index + 1} />
        ))}
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Top Rated Novels</h1>
          <p className="text-muted-foreground">
            Discover the highest-rated and most popular novels in our collection
          </p>
        </div>

        {/* Tabs for different rankings */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="rating" className="flex items-center gap-2">
              <Star className="h-4 w-4" />
              Highest Rated
            </TabsTrigger>
            <TabsTrigger value="views" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Most Viewed
            </TabsTrigger>
            <TabsTrigger value="updated" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Recently Updated
            </TabsTrigger>
          </TabsList>

          <TabsContent value="rating" className="mt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-xl font-semibold">
                  <Star className="h-5 w-5 text-yellow-500" />
                  Highest Rated Novels
                </h2>
                <p className="text-muted-foreground text-sm">
                  Based on user ratings
                </p>
              </div>
              {renderNovelList(topRated, ratingLoading)}
            </div>
          </TabsContent>

          <TabsContent value="views" className="mt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-xl font-semibold">
                  <Eye className="h-5 w-5 text-blue-500" />
                  Most Viewed Novels
                </h2>
                <p className="text-muted-foreground text-sm">
                  Based on total views
                </p>
              </div>
              {renderNovelList(mostViewed, viewsLoading)}
            </div>
          </TabsContent>

          <TabsContent value="updated" className="mt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-xl font-semibold">
                  <Clock className="h-5 w-5 text-green-500" />
                  Recently Updated
                </h2>
                <p className="text-muted-foreground text-sm">
                  Latest chapter updates
                </p>
              </div>
              {renderNovelList(recentlyUpdated, updatedLoading)}
            </div>
          </TabsContent>
        </Tabs>

        {/* Call to Action */}
        <Card className="from-primary/10 to-primary/5 border-primary/20 bg-gradient-to-r">
          <CardContent className="p-6 text-center">
            <TrendingUp className="text-primary mx-auto mb-4 h-12 w-12" />
            <h3 className="mb-2 text-xl font-semibold">Discover More</h3>
            <p className="text-muted-foreground mb-4">
              Explore our full collection of novels with advanced filtering and
              search
            </p>
            <div className="flex justify-center gap-2">
              <Link href="/search">
                <Button>Browse All Novels</Button>
              </Link>
              <Link href="/genres">
                <Button variant="outline">View by Genre</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
