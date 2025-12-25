"use client";

import { useState } from "react";
import {
  Clock,
  BookOpen,
  Eye,
  Star,
  TrendingUp,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import Image from "next/image";

import { useRecentlyUpdatedNovels } from "@/hooks/use-novels";
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
import { RecentlyUpdatedNovel } from "@/types/api";
import { NovelRating } from "@/components/novels";
import { NovelBadge } from "@/components/novels/ui/novel-badge";

export default function RecentlyUpdatedPage() {
  const [limit, setLimit] = useState(20);
  const { data: novels, loading, error } = useRecentlyUpdatedNovels(limit);

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const then = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - then.getTime()) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600)
      return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800)
      return `${Math.floor(diffInSeconds / 86400)} days ago`;
    if (diffInSeconds < 2592000)
      return `${Math.floor(diffInSeconds / 604800)} weeks ago`;

    return then.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const NovelCard = ({
    novel,
    index,
  }: {
    novel: RecentlyUpdatedNovel;
    index: number;
  }) => {
    const styling = getNovelStyling(novel, "normal");
    const badgeConfig = getNovelBadgeConfig(novel);
    const timeAgo = formatTimeAgo(novel.latest_chapter_created_at);
    const isRecent = index < 5; // Highlight the 5 most recent

    return (
      <Link href={`/novels/${novel.slug}`}>
        <Card
          className={cn(
            "group relative cursor-pointer overflow-hidden transition-all duration-200 hover:scale-[1.01] hover:shadow-xl",
            novel.is_featured &&
              "border-2 border-amber-500/30 shadow-lg shadow-amber-500/10",
            novel.is_trending &&
              !novel.is_featured &&
              "border-2 border-blue-500/30 shadow-lg shadow-blue-500/10",
            styling.containerClass,
            isRecent && "border-green-500/20 bg-green-500/5",
          )}
        >
          {isRecent && (
            <div className="absolute top-2 right-2 z-10">
              <Badge className="flex items-center gap-1 bg-green-500/20 text-green-700 dark:text-green-300">
                <Sparkles className="h-3 w-3" />
                Fresh
              </Badge>
            </div>
          )}
          <CardContent className="p-4">
            <div className="flex gap-4">
              {/* Cover Image */}
              <div className="relative h-32 w-24 flex-shrink-0 overflow-hidden rounded-md">
                {novel.cover_image ? (
                  <Image
                    src={novel.cover_image}
                    alt={novel.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                ) : (
                  <div className="bg-muted flex h-full w-full items-center justify-center">
                    <BookOpen className="text-muted-foreground h-8 w-8" />
                  </div>
                )}
                {/* Special badges */}
                {badgeConfig && (
                  <div className="absolute bottom-1 left-1">
                    <NovelBadge novel={novel} />
                  </div>
                )}
              </div>

              {/* Novel Info */}
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <div>
                  <h3 className="group-hover:text-primary line-clamp-1 text-lg font-semibold transition-colors">
                    {novel.title}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    by {novel.author}
                  </p>
                </div>

                {novel.description && (
                  <p className="text-muted-foreground line-clamp-2 text-sm">
                    {truncateDescription(novel.description, 120)}
                  </p>
                )}

                {/* Latest Chapter Info - Highlighted */}
                <div className="flex flex-wrap items-center gap-2 rounded-md bg-blue-500/10 p-2 dark:bg-blue-500/20">
                  <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                    Chapter {novel.latest_chapter_number}:{" "}
                    {novel.latest_chapter_title}
                  </span>
                  <Badge variant="secondary" className="ml-auto text-xs">
                    {timeAgo}
                  </Badge>
                </div>

                {/* Genres */}
                {novel.genres && novel.genres.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {novel.genres.slice(0, 3).map((genre) => (
                      <Badge
                        key={genre.id}
                        variant="outline"
                        className="text-xs"
                      >
                        {genre.name}
                      </Badge>
                    ))}
                    {novel.genres.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{novel.genres.length - 3}
                      </Badge>
                    )}
                  </div>
                )}

                {/* Stats */}
                <div className="flex flex-wrap items-center gap-3 text-sm">
                  <div className="flex items-center gap-1">
                    {novel.rating !== null && novel.rating !== undefined && (
                      <NovelRating novel={novel} />
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
                    <span>{formatChapterCount(novel.total_chapters)} ch</span>
                  </div>
                  <div className="text-muted-foreground flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    <span>{formatViewCount(novel.views)}</span>
                  </div>
                </div>

                {/* Read Latest Chapter CTA */}
                <div className="mt-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="group/btn w-full gap-1 text-xs sm:w-auto"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      window.location.href = `/novels/${novel.slug}/chapters/${novel.latest_chapter_number}`;
                    }}
                  >
                    Read Latest Chapter
                    <ChevronRight className="h-3 w-3 transition-transform group-hover/btn:translate-x-0.5" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    );
  };

  const LoadingSkeleton = () => (
    <Card>
      <CardContent className="p-4">
        <div className="flex gap-4">
          <Skeleton className="h-32 w-24 rounded" />
          <div className="flex-1 space-y-2">
            <div>
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="mt-1 h-4 w-1/2" />
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-10 w-full rounded-md" />
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

  const renderContent = () => {
    if (loading) {
      return (
        <div className="space-y-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <LoadingSkeleton key={i} />
          ))}
        </div>
      );
    }

    if (error) {
      return (
        <Card className="border-destructive/50">
          <CardContent className="p-8 text-center">
            <TrendingUp className="text-destructive mx-auto mb-4 h-16 w-16" />
            <h3 className="mb-2 text-xl font-medium">Unable to Load Novels</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => window.location.reload()} variant="outline">
              Try Again
            </Button>
          </CardContent>
        </Card>
      );
    }

    if (!novels || novels.length === 0) {
      return (
        <Card>
          <CardContent className="p-8 text-center">
            <Clock className="text-muted-foreground mx-auto mb-4 h-16 w-16" />
            <h3 className="mb-2 text-xl font-medium">
              No Recently Updated Novels
            </h3>
            <p className="text-muted-foreground">
              Check back later for fresh content.
            </p>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="space-y-4">
        {novels.map((novel, index) => (
          <NovelCard key={novel.id} novel={novel} index={index} />
        ))}

        {/* Load More Section */}
        {novels.length === limit && limit < 50 && (
          <Card className="border-dashed">
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground mb-4">
                Want to see more recently updated novels?
              </p>
              <Button
                onClick={() => setLimit((prev) => Math.min(prev + 10, 50))}
                variant="outline"
              >
                Load More
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="relative overflow-hidden rounded-lg border border-blue-500/20 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 p-8">
          <div className="relative z-10 space-y-3 text-center">
            <div className="mb-2 flex items-center justify-center gap-2">
              <Clock className="h-8 w-8 text-blue-500" />
              <h1 className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-4xl font-bold text-transparent">
                Recently Updated Novels
              </h1>
              <Sparkles className="h-8 w-8 text-pink-500" />
            </div>
            <p className="text-muted-foreground mx-auto max-w-2xl text-lg">
              Discover novels with fresh chapters just published. Stay up to
              date with your favorite ongoing stories and never miss a new
              release.
            </p>
            <div className="flex items-center justify-center gap-6 pt-2 text-sm">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-500" />
                <span className="font-medium">Latest Chapters</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-pink-500" />
                <span className="font-medium">Fresh Content</span>
              </div>
            </div>
          </div>
          {/* Background decoration */}
          <div className="absolute top-0 right-0 translate-x-1/4 -translate-y-1/4 opacity-10">
            <Clock className="h-64 w-64 text-blue-500" />
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-4">
          <div className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
            <h2 className="flex items-center gap-2 text-xl font-semibold">
              <TrendingUp className="h-5 w-5 text-green-500" />
              Active Novels
            </h2>
            <p className="text-muted-foreground text-sm">
              Sorted by newest chapter first
            </p>
          </div>
          {renderContent()}
        </div>

        {/* Call to Action */}
        <Card className="from-primary/10 to-primary/5 border-primary/20 bg-gradient-to-r">
          <CardContent className="p-6 text-center">
            <BookOpen className="text-primary mx-auto mb-4 h-12 w-12" />
            <h3 className="mb-2 text-xl font-semibold">Discover More</h3>
            <p className="text-muted-foreground mb-4">
              Explore our full collection of novels with advanced filtering and
              search
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              <Link href="/search">
                <Button>Browse All Novels</Button>
              </Link>
              <Link href="/genres">
                <Button variant="outline">View by Genre</Button>
              </Link>
              <Link href="/top-rated">
                <Button variant="outline">Top Rated</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
