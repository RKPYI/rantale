"use client";

import { useState } from "react";
import { Star, TrendingUp, Eye, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";

import { useNovels } from "@/hooks/use-novels";
import { Novel } from "@/types/api";
import { NovelCard } from "@/components/novels";

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

  // Extract data arrays from paginated responses
  const topRated = topRatedData?.data;
  const mostViewed = mostViewedData?.data;

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

  const TopThreePodium = ({ novels }: { novels: Novel[] }) => {
    if (novels.length < 3) return null;

    return (
      <div className="mb-8">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {/* 2nd Place */}
          <div className="order-2 md:order-1">
            <NovelCard novel={novels[1]} size="ranked" rank={2} />
          </div>
          {/* 1st Place */}
          <div className="order-1 md:order-2 md:-mt-4 md:scale-105">
            <NovelCard novel={novels[0]} size="ranked" rank={1} />
          </div>
          {/* 3rd Place */}
          <div className="order-3 md:order-3">
            <NovelCard novel={novels[2]} size="ranked" rank={3} />
          </div>
        </div>
      </div>
    );
  };

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
            <h3 className="mb-2 text-xl font-medium">No Books Found</h3>
            <p className="text-muted-foreground">
              Check back later for top-rated content.
            </p>
          </CardContent>
        </Card>
      );
    }

    return (
      <>
        {/* Podium for top 3 */}
        {novels.length >= 3 && <TopThreePodium novels={novels.slice(0, 3)} />}

        {/* Rest of the list */}
        {novels.length > 3 && (
          <div className="space-y-4">
            {novels.slice(3).map((novel, index) => (
              <NovelCard
                key={novel.id}
                novel={novel}
                size="ranked"
                rank={index + 4}
              />
            ))}
          </div>
        )}
      </>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="relative overflow-hidden rounded-lg border border-yellow-500/20 bg-gradient-to-r from-yellow-500/10 via-orange-500/10 to-red-500/10 p-8">
          <div className="relative z-10 space-y-3 text-center">
            <div className="mb-2 flex items-center justify-center gap-2">
              <Trophy className="h-8 w-8 text-yellow-500" />
              <h1 className="bg-gradient-to-r from-yellow-600 via-orange-600 to-red-600 bg-clip-text text-4xl font-bold text-transparent">
                Top Rated Books
              </h1>
              <Trophy className="h-8 w-8 text-yellow-500" />
            </div>
            <p className="text-muted-foreground mx-auto max-w-2xl text-lg">
              Discover the highest-rated and most popular books in our
              collection. These masterpieces have captivated thousands of
              readers worldwide.
            </p>
            <div className="flex items-center justify-center gap-6 pt-2 text-sm">
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 fill-current text-yellow-500" />
                <span className="font-medium">Top Rated</span>
              </div>
              <div className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-blue-500" />
                <span className="font-medium">Most Viewed</span>
              </div>
            </div>
          </div>
          {/* Background decoration */}
          <div className="absolute top-0 right-0 translate-x-1/4 -translate-y-1/4 opacity-10">
            <Trophy className="h-64 w-64 text-yellow-500" />
          </div>
        </div>

        {/* Tabs for different rankings */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="rating" className="flex items-center gap-2">
              <Star className="h-4 w-4" />
              Top Rated
            </TabsTrigger>
            <TabsTrigger value="views" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Most Viewed
            </TabsTrigger>
          </TabsList>

          <TabsContent value="rating" className="mt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-xl font-semibold">
                  <Star className="h-5 w-5 text-yellow-500" />
                  Top Rated Books
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
                  Most Viewed Books
                </h2>
                <p className="text-muted-foreground text-sm">
                  Based on total views
                </p>
              </div>
              {renderNovelList(mostViewed, viewsLoading)}
            </div>
          </TabsContent>
        </Tabs>

        {/* Call to Action */}
        <Card className="from-primary/10 to-primary/5 border-primary/20 bg-gradient-to-r">
          <CardContent className="p-6 text-center">
            <TrendingUp className="text-primary mx-auto mb-4 h-12 w-12" />
            <h3 className="mb-2 text-xl font-semibold">Discover More</h3>
            <p className="text-muted-foreground mb-4">
              Explore our full collection of books with advanced filtering and
              search
            </p>
            <div className="flex justify-center gap-2">
              <Link href="/search">
                <Button>Browse All Books</Button>
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
