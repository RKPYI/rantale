"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  BookOpen,
  Star,
  Eye,
  Heart,
  Clock,
  Calendar,
  User,
  Play,
  MessageCircle,
  TrendingUp,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CommentSection } from "@/components/comment-section";
import { RatingSection } from "@/components/rating-section";
import { ReadingProgress } from "@/components/reading-progress";
import { LibraryActionButton } from "@/components/library";
import { ShareButton } from "@/components/ui/share-button";
import { useAuth } from "@/hooks/use-auth";
import { useNovelProgress } from "@/hooks/use-reading-progress";
import {
  formatRating,
  getStatusColor,
  formatDate,
  formatNumber,
} from "@/lib/novel-utils";
import { formatProgressPercentage } from "@/lib/content-utils";
import { cn } from "@/lib/utils";
import { NovelWithChapters } from "@/types/api";

interface NovelDetailViewProps {
  novel: NovelWithChapters;
}

export function NovelDetailView({ novel }: NovelDetailViewProps) {
  const { isAuthenticated, user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  const { data: readingProgress } = useNovelProgress(novel.slug);

  // Handle URL hash to open specific tab (e.g., #reviews)
  useEffect(() => {
    const hash = window.location.hash.slice(1); // Remove the '#'
    if (
      hash &&
      ["overview", "chapters", "reviews", "comments"].includes(hash)
    ) {
      setActiveTab(hash);
      // Scroll to tabs section smoothly after a brief delay
      setTimeout(() => {
        const tabsElement = document.querySelector('[role="tablist"]');
        if (tabsElement) {
          tabsElement.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);
    }
  }, []);

  // Handle tab change and update URL hash
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    // Update URL hash without scrolling
    window.history.replaceState(null, "", `#${value}`);
  };

  const handleStartReading = () => {
    if (novel.chapters && novel.chapters.length > 0) {
      const firstChapter = novel.chapters[0];
      window.location.href = `/novels/${novel.slug}/chapters/${firstChapter.chapter_number}`;
    }
  };

  const handleContinueReading = () => {
    if (readingProgress?.current_chapter) {
      window.location.href = `/novels/${novel.slug}/chapters/${readingProgress.current_chapter.chapter_number}`;
    } else {
      handleStartReading();
    }
  };

  // Check if user has actually started reading (current_chapter is not null)
  const hasStartedReading =
    readingProgress?.current_chapter !== null &&
    readingProgress?.current_chapter !== undefined;

  return (
    <div className="container mx-auto max-w-7xl px-4 py-6">
      {/* Header Section */}
      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Cover Image */}
        <div className="lg:col-span-1">
          <div className="sticky top-6">
            <div className="relative aspect-[2/3] overflow-hidden rounded-lg shadow-lg">
              {novel.cover_image ? (
                <Image
                  src={novel.cover_image}
                  alt={novel.title}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              ) : (
                <div className="from-muted to-muted/50 flex h-full w-full items-center justify-center bg-gradient-to-br">
                  <BookOpen className="text-muted-foreground h-20 w-20" />
                </div>
              )}

              {/* Status Badge */}
              <Badge
                variant={getStatusColor(novel.status)}
                className="absolute top-4 left-4"
              >
                {novel.status.charAt(0).toUpperCase() + novel.status.slice(1)}
              </Badge>

              {/* Featured/Trending Badges */}
              {novel.is_featured && (
                <Badge variant="default" className="absolute top-4 right-4">
                  Featured
                </Badge>
              )}
              {novel.is_trending && !novel.is_featured && (
                <Badge className="absolute top-4 right-4 bg-orange-500 hover:bg-orange-600">
                  <TrendingUp className="mr-1 h-3 w-3" />
                  Trending
                </Badge>
              )}
            </div>

            {/* Action Buttons */}
            <div className="mt-4 space-y-2">
              {isAuthenticated && hasStartedReading ? (
                <Button
                  onClick={handleContinueReading}
                  className="w-full"
                  size="lg"
                >
                  <Play className="mr-2 h-4 w-4" />
                  Continue Reading
                </Button>
              ) : (
                <Button
                  onClick={handleStartReading}
                  className="w-full"
                  size="lg"
                  disabled={!novel.chapters || novel.chapters.length === 0}
                >
                  <BookOpen className="mr-2 h-4 w-4" />
                  Start Reading
                </Button>
              )}

              <div className="flex gap-2">
                <LibraryActionButton novel={novel} />
                <ShareButton
                  title={novel.title}
                  description={`Check out "${novel.title}" by ${novel.author}. ${novel.description ? novel.description.slice(0, 100) + "..." : ""}`}
                  variant="outline"
                  size="icon"
                />
              </div>
            </div>

            {/* Reading Progress */}
            {isAuthenticated && readingProgress && hasStartedReading && (
              <Card className="mt-4">
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Reading Progress</span>
                      <span>
                        {formatProgressPercentage(
                          readingProgress.progress_percentage,
                        )}
                      </span>
                    </div>
                    <Progress
                      value={readingProgress.progress_percentage}
                      className="h-2"
                    />
                    <div className="text-muted-foreground text-xs">
                      {readingProgress.current_chapter ? (
                        <>
                          Chapter{" "}
                          {readingProgress.current_chapter.chapter_number}:{" "}
                          {readingProgress.current_chapter.title}
                        </>
                      ) : (
                        "Not started yet"
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Novel Info */}
        <div className="lg:col-span-2">
          <div className="space-y-4">
            <div>
              <h1 className="mb-2 text-3xl font-bold lg:text-4xl">
                {novel.title}
              </h1>
              <div className="text-muted-foreground mb-4 flex items-center gap-2 text-lg">
                <User className="h-4 w-4" />
                <span>by {novel.author}</span>
              </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {novel.rating !== null && novel.rating !== undefined && (
                <div className="bg-muted rounded-lg p-3 text-center">
                  <div className="flex items-center justify-center gap-1 text-lg font-semibold">
                    <Star className="h-4 w-4 fill-current text-yellow-400" />
                    {formatRating(novel.rating)}
                  </div>
                  <div className="text-muted-foreground text-xs">
                    {novel.rating_count !== null &&
                    novel.rating_count !== undefined
                      ? `${formatNumber(novel.rating_count)} ratings`
                      : "Rating"}
                  </div>
                </div>
              )}

              {novel.total_chapters !== null &&
                novel.total_chapters !== undefined && (
                  <div className="bg-muted rounded-lg p-3 text-center">
                    <div className="flex items-center justify-center gap-1 text-lg font-semibold">
                      <BookOpen className="h-4 w-4" />
                      {novel.total_chapters}
                    </div>
                    <div className="text-muted-foreground text-xs">
                      Chapters
                    </div>
                  </div>
                )}

              {novel.views !== null && novel.views !== undefined && (
                <div className="bg-muted rounded-lg p-3 text-center">
                  <div className="flex items-center justify-center gap-1 text-lg font-semibold">
                    <Eye className="h-4 w-4" />
                    {formatNumber(novel.views)}
                  </div>
                  <div className="text-muted-foreground text-xs">Views</div>
                </div>
              )}
            </div>

            {/* Genres */}
            <div className="flex flex-wrap gap-2">
              {novel.genres.map((genre) => (
                <Link key={genre.id} href={`/genres?genre=${genre.slug}`}>
                  <Badge
                    variant="secondary"
                    className="hover:bg-primary hover:text-primary-foreground cursor-pointer transition-colors"
                    style={{
                      backgroundColor: `${genre.color}20`,
                      borderColor: genre.color,
                    }}
                  >
                    {genre.name}
                  </Badge>
                </Link>
              ))}
            </div>

            {/* Description */}
            {novel.description && (
              <Card>
                <CardContent className="p-4">
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                    {novel.description}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Metadata */}
            <div className="text-muted-foreground grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>
                  Published:{" "}
                  {formatDate(novel.published_at || novel.created_at)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>Updated: {formatDate(novel.updated_at)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Separator className="my-8" />

      {/* Tabs Section */}
      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-4 lg:flex lg:w-auto lg:grid-cols-none">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="chapters">Chapters</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
          <TabsTrigger value="comments">Comments</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Main Content */}
            <div className="space-y-6 lg:col-span-2">
              {/* Latest Chapters */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Latest Chapters
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleTabChange("chapters")}
                    >
                      View All
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {novel.chapters && novel.chapters.length > 0 ? (
                    <div className="space-y-2">
                      {novel.chapters
                        .slice(-5)
                        .reverse()
                        .map((chapter) => (
                          <Link
                            key={chapter.id}
                            href={`/novels/${novel.slug}/chapters/${chapter.chapter_number}`}
                            className="hover:bg-muted block rounded-lg p-3 transition-colors"
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="font-medium">
                                  Chapter {chapter.chapter_number}:{" "}
                                  {chapter.title}
                                </div>
                                <div className="text-muted-foreground text-sm">
                                  {chapter.word_count
                                    ? `${formatNumber(chapter.word_count)} words`
                                    : ""}
                                </div>
                              </div>
                              <ChevronRight className="text-muted-foreground h-4 w-4" />
                            </div>
                          </Link>
                        ))}
                    </div>
                  ) : (
                    <div className="text-muted-foreground py-8 text-center">
                      No chapters available yet
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6 lg:col-span-1">
              {/* Placeholder for related novels */}
              <Card>
                <CardHeader>
                  <CardTitle>Related Novels</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">
                    Related novels will be shown here
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="chapters">
          <Card>
            <CardHeader>
              <CardTitle>Chapters ({novel.total_chapters || 0})</CardTitle>
            </CardHeader>
            <CardContent>
              {novel.chapters && novel.chapters.length > 0 ? (
                <div className="space-y-2">
                  {novel.chapters.map((chapter) => (
                    <Link
                      key={chapter.id}
                      href={`/novels/${novel.slug}/chapters/${chapter.chapter_number}`}
                      className="hover:bg-muted block rounded-lg border p-4 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">
                            Chapter {chapter.chapter_number}: {chapter.title}
                          </h3>
                          <div className="text-muted-foreground text-sm">
                            {chapter.word_count
                              ? `${formatNumber(chapter.word_count)} words`
                              : "Word count not available"}
                          </div>
                        </div>
                        <ChevronRight className="text-muted-foreground h-5 w-5" />
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-muted-foreground py-12 text-center">
                  <BookOpen className="mx-auto mb-4 h-12 w-12" />
                  <h3 className="mb-2 font-medium">No chapters available</h3>
                  <p>This novel doesn&apos;t have any chapters yet.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reviews">
          <RatingSection
            novelSlug={novel.slug}
            novelId={novel.id}
            title={novel.title}
          />
        </TabsContent>

        <TabsContent value="comments">
          <CommentSection
            novelSlug={novel.slug}
            novelId={novel.id}
            title={novel.title}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
