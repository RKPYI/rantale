"use client";

import { useState } from "react";
import {
  Star,
  TrendingUp,
  Clock,
  BookOpen,
  Eye,
  Crown,
  Trophy,
  Award,
  Medal,
} from "lucide-react";
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
  getNovelStyling,
  getNovelBadgeConfig,
} from "@/lib/novel-utils";
import { cn } from "@/lib/utils";
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

  // Extract data arrays from paginated responses
  const topRated = topRatedData?.data;
  const mostViewed = mostViewedData?.data;

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <div className="text-xl">1</div>;
    if (rank === 2) return <div className="text-xl">2</div>;
    if (rank === 3) return <div className="text-xl">3</div>;
    return null;
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return "from-yellow-400 via-yellow-500 to-yellow-600";
    if (rank === 2) return "from-slate-300 via-slate-400 to-slate-500";
    if (rank === 3) return "from-orange-400 via-orange-500 to-orange-600";
    if (rank <= 10) return "from-blue-400 via-blue-500 to-blue-600";
    return "from-purple-400 via-purple-500 to-purple-600";
  };

  const NovelCard = ({ novel, rank }: { novel: Novel; rank: number }) => {
    const styling = getNovelStyling(novel, "normal");
    const badgeConfig = getNovelBadgeConfig(novel);
    const isTopThree = rank <= 3;

    return (
      <Link href={`/novels/${novel.slug}`}>
        <Card
          className={cn(
            "group relative cursor-pointer overflow-hidden transition-all duration-200 hover:scale-[1.01] hover:shadow-xl",
            // Add featured/trending border styling
            novel.is_featured &&
              "border-2 border-amber-500/30 shadow-lg shadow-amber-500/10",
            novel.is_trending &&
              !novel.is_featured &&
              "border-2 border-blue-500/30 shadow-lg shadow-blue-500/10",
            // Add container gradient background
            styling.containerClass,
            // Special styling for top 3
            isTopThree && "shadow-lg",
          )}
        >
          <CardContent className="p-4">
            <div className="flex gap-4">
              {/* Rank Badge */}
              <div className="flex flex-shrink-0 flex-col items-center gap-2">
                <div
                  className={cn(
                    "relative flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white shadow-lg",
                    `bg-gradient-to-br ${getRankColor(rank)}`,
                    isTopThree && "shadow-xl ring-2 ring-white/50",
                  )}
                >
                  {getRankIcon(rank) || rank}
                </div>

                {/* Cover Image */}
                <div className="relative">
                  {novel.cover_image ? (
                    <Image
                      src={novel.cover_image}
                      alt={novel.title}
                      width={80}
                      height={120}
                      className={cn(
                        "bg-muted rounded object-cover transition-transform duration-300 group-hover:scale-105",
                        styling.coverClass,
                        isTopThree && "shadow-md",
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
              </div>

              {/* Novel Info */}
              <div className="min-w-0 flex-1 space-y-2">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3
                      className={cn(
                        "group-hover:text-primary line-clamp-2 text-lg font-semibold transition-colors",
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

                <p className="text-muted-foreground line-clamp-2 text-sm">
                  {truncateDescription(novel.description, 150)}
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
                <div className="flex flex-wrap items-center gap-4 text-sm">
                  <div className="flex items-center gap-1 font-medium text-yellow-600">
                    <Star className="h-4 w-4 fill-current" />
                    <span>{formatRating(novel.rating)}</span>
                    {novel.rating_count && (
                      <span className="text-muted-foreground text-xs">
                        ({formatViewCount(novel.rating_count)})
                      </span>
                    )}
                  </div>
                  <Badge
                    variant={getStatusColor(novel.status)}
                    className="text-xs"
                  >
                    {novel.status.charAt(0).toUpperCase() +
                      novel.status.slice(1)}
                  </Badge>
                  <div className="text-muted-foreground flex items-center gap-1">
                    <BookOpen className="h-4 w-4" />
                    <span>{novel.total_chapters || 0} ch</span>
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
  };

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
            <NovelCard novel={novels[1]} rank={2} />
          </div>
          {/* 1st Place */}
          <div className="order-1 md:order-2 md:-mt-4 md:scale-105">
            <NovelCard novel={novels[0]} rank={1} />
          </div>
          {/* 3rd Place */}
          <div className="order-3 md:order-3">
            <NovelCard novel={novels[2]} rank={3} />
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
            <h3 className="mb-2 text-xl font-medium">No Novels Found</h3>
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
              <NovelCard key={novel.id} novel={novel} rank={index + 4} />
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
                Top Rated Novels
              </h1>
              <Trophy className="h-8 w-8 text-yellow-500" />
            </div>
            <p className="text-muted-foreground mx-auto max-w-2xl text-lg">
              Discover the highest-rated and most popular novels in our
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
                  Top Rated Novels
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
