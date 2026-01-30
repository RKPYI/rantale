"use client";

import Link from "next/link";
import Image from "next/image";
import { BookOpen, TrendingUp, Star, Eye, Heart, Crown } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  formatRating,
  getStatusColor,
  truncateDescription,
  getNovelBadgeConfig,
  getNovelStyling,
  formatNumber,
  formatViewCount,
} from "@/lib/novel-utils";
import { cn } from "@/lib/utils";
import { Novel } from "@/types/api";
import { NovelRating } from "./ui/novel-rating";
import { NovelBadge } from "./ui/novel-badge";

interface NovelCardProps {
  novel: Novel;
  size?: "default" | "compact" | "featured" | "horizontal" | "ranked";
  className?: string;
  rank?: number;
}

export function NovelCard({
  novel,
  size = "default",
  className,
  rank,
}: NovelCardProps) {
  const isCompact = size === "compact";
  const isFeatured = size === "featured";
  const isHorizontal = size === "horizontal";
  const isRanked = size === "ranked";
  const styling = getNovelStyling(novel, "normal");

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

  // Horizontal layout (cover left, content right)
  if (isHorizontal) {
    return (
      <Link
        href={`/novels/${novel.slug}`}
        className="focus-visible:ring-ring block rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
      >
        <Card
          className={cn(
            "group relative overflow-hidden py-0 transition-all duration-300 hover:shadow-lg",
            // Add featured/trending border styling
            novel.is_featured &&
              "border-2 border-amber-500/30 shadow-lg shadow-amber-500/10",
            novel.is_trending &&
              !novel.is_featured &&
              "border-2 border-blue-500/30 shadow-lg shadow-blue-500/10",
            // Add container gradient background
            styling.containerClass,
            className,
          )}
        >
          <div className="flex gap-3 p-3">
            {/* Cover Image - Left Side */}
            <div className="relative h-24 w-16 flex-shrink-0 overflow-hidden rounded">
              {novel.cover_image ? (
                <Image
                  src={novel.cover_image}
                  alt={novel.title}
                  fill
                  className={cn(
                    "object-cover transition-transform duration-300 group-hover:scale-110",
                    styling.coverClass,
                  )}
                  sizes="64px"
                />
              ) : (
                <div className="from-muted to-muted/50 flex h-full w-full items-center justify-center bg-gradient-to-br">
                  <BookOpen className="text-muted-foreground h-6 w-6" />
                </div>
              )}

              {/* Corner badge icon */}
              {(novel.is_featured || novel.is_trending) && (
                <div
                  className={cn(
                    "absolute -top-0.5 -right-0.5 rounded-full p-0.5 shadow-lg",
                    novel.is_featured
                      ? "bg-gradient-to-br from-amber-400 to-amber-600"
                      : "bg-gradient-to-br from-blue-400 to-blue-600",
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

            {/* Content - Right Side */}
            <div className="flex min-w-0 flex-1 flex-col justify-between">
              <div className="space-y-1">
                <h3 className="group-hover:text-primary line-clamp-2 text-sm font-semibold transition-colors">
                  {novel.title}
                </h3>
                <p
                  className={cn(
                    "text-muted-foreground",
                    isCompact ? "text-xs" : "text-sm",
                  )}
                >
                  by {novel.author ?? "Anonymous"}
                </p>
                {/* Genres */}
                <div className="flex flex-wrap gap-1">
                  {novel.genres.slice(0, 4).map((genre) => (
                    <Badge
                      key={genre.id}
                      variant="outline"
                      className="h-4 px-1.5 text-[10px]"
                      tabIndex={-1}
                    >
                      {genre.name}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Footer Stats */}
              <div className="text-muted-foreground flex items-center gap-3 text-xs">
                {novel.rating !== null && novel.rating !== undefined && (
                  <NovelRating novel={novel} />
                )}

                {novel.total_chapters !== null &&
                  novel.total_chapters !== undefined && (
                    <div className="flex items-center gap-1">
                      <BookOpen className="h-3 w-3" />
                      <span>{novel.total_chapters}</span>
                    </div>
                  )}

                {novel.views !== null && novel.views !== undefined && (
                  <div className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    {formatNumber(novel.views)}
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>
      </Link>
    );
  }

  // Ranked layout (with rank badge)
  if (isRanked && rank !== undefined) {
    const isTopThree = rank <= 3;

    return (
      <Link
        href={`/novels/${novel.slug}`}
        className="focus-visible:ring-ring block rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
      >
        <Card
          className={cn(
            "group relative overflow-hidden transition-all duration-200 hover:scale-[1.01] hover:shadow-xl",
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
            className,
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
                  <div className="relative h-[120px] w-[80px] flex-shrink-0 overflow-hidden rounded">
                    {novel.cover_image ? (
                      <Image
                        src={novel.cover_image}
                        alt={novel.title}
                        fill
                        className={cn(
                          "object-cover transition-transform duration-300 group-hover:scale-105",
                          styling.coverClass,
                          isTopThree && "shadow-md",
                        )}
                        sizes="80px"
                      />
                    ) : (
                      <div className="from-muted to-muted/50 flex h-full w-full items-center justify-center bg-gradient-to-br">
                        <BookOpen className="text-muted-foreground h-8 w-8" />
                      </div>
                    )}
                  </div>

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
                    <NovelBadge
                      novel={novel}
                      positioned={false}
                      className={styling.badge.className}
                    />
                  </div>
                  <p className="text-muted-foreground">
                    by {novel.author ?? "Anonymous"}
                  </p>
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
  }

  // Vertical layout (original design)
  return (
    <Link
      href={`/novels/${novel.slug}`}
      className="focus-visible:ring-ring block rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
    >
      <Card
        className={cn(
          "group relative overflow-hidden pt-0 transition-all duration-300 focus-within:scale-[1.02] focus-within:shadow-lg hover:scale-[1.02] hover:shadow-lg",
          isCompact ? "h-auto" : "h-full",
          className,
        )}
      >
        <div
          className={cn(
            "relative overflow-hidden",
            isCompact ? "aspect-[3/4]" : "aspect-[2/3]",
            isFeatured && "aspect-[2/3]",
          )}
        >
          {novel.cover_image ? (
            <Image
              src={novel.cover_image}
              alt={novel.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-110"
              sizes={
                isFeatured
                  ? "(max-width: 768px) 100vw, 50vw"
                  : "(max-width: 768px) 50vw, 25vw"
              }
            />
          ) : (
            <div className="from-muted to-muted/50 flex h-full w-full items-center justify-center bg-gradient-to-br">
              <BookOpen className="text-muted-foreground h-12 w-12" />
            </div>
          )}

          {/* Status Badge - hidden on mobile in compact mode */}
          <Badge
            variant={getStatusColor(novel.status)}
            className={cn(
              "absolute top-2 left-2 text-xs",
              isCompact && "hidden md:flex",
            )}
            tabIndex={-1}
          >
            {novel.status.charAt(0).toUpperCase() + novel.status.slice(1)}
          </Badge>

          {/* Featured/Trending Badges - hidden on mobile in compact mode */}
          <NovelBadge
            novel={novel}
            className={cn(isCompact && "hidden md:flex")}
          />

          {/* Overlay for featured cards */}
          {isFeatured && (
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          )}
        </div>

        <CardContent className={cn("p-4", isCompact && "p-2")}>
          <div className="space-y-2">
            <div>
              <h3
                className={cn(
                  "group-hover:text-primary line-clamp-2 font-semibold transition-colors",
                  isCompact ? "text-sm" : "text-base",
                  isFeatured && "text-lg",
                )}
              >
                {novel.title}
              </h3>
              {!isCompact && (
                <p
                  className={cn(
                    "text-muted-foreground",
                    isCompact ? "text-xs" : "text-sm",
                  )}
                >
                  by {novel.author ?? "Anonymous"}
                </p>
              )}
            </div>

            {!isCompact && novel.description && (
              <p className="text-muted-foreground line-clamp-2 text-sm">
                {truncateDescription(novel.description, 100)}
              </p>
            )}

            {/* Genres - hidden in compact mode */}
            {!isCompact && (
              <div className="flex flex-wrap gap-1">
                {novel.genres.slice(0, 3).map((genre) => (
                  <Badge
                    key={genre.id}
                    variant="outline"
                    className="h-5 text-xs"
                    tabIndex={-1}
                  >
                    {genre.name}
                  </Badge>
                ))}
                {novel.genres.length > 3 && (
                  <Badge
                    variant="outline"
                    className="h-5 text-xs"
                    tabIndex={-1}
                  >
                    +{novel.genres.length - 3}
                  </Badge>
                )}
              </div>
            )}
          </div>
        </CardContent>

        <CardFooter
          className={cn(
            "flex items-center justify-between px-4 pt-0 pb-4",
            isCompact && "px-2 pt-0 pb-0",
          )}
        >
          <div
            className={cn(
              "text-muted-foreground flex items-center gap-3 text-xs",
              isCompact && "flex-wrap gap-2",
            )}
          >
            {novel.rating !== null && novel.rating !== undefined && (
              <NovelRating novel={novel} />
            )}

            {novel.total_chapters !== null &&
              novel.total_chapters !== undefined && (
                <div className="flex items-center gap-1">
                  <BookOpen className="h-3 w-3" />
                  <span>{novel.total_chapters} ch</span>
                </div>
              )}

            {novel.views !== null && novel.views !== undefined && (
              <div className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                {formatNumber(novel.views)}
              </div>
            )}
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
