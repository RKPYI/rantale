"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Settings,
  Eye,
  Clock,
  ChevronLeft,
  ChevronRight,
  Home,
  List,
  MessageSquare,
  Bookmark,
  ArrowUp,
  WifiOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CommentSection } from "@/components/comment-section";
import { ShareButton } from "@/components/ui/share-button";
import { ChapterNavigator } from "@/components/chapters/chapter-navigator";
import { ChapterDownloadButton } from "@/components/chapters/chapter-download-button";
import { useAuth } from "@/hooks/use-auth";
import { useAsync } from "@/hooks/use-api";
import { useOfflineStatus } from "@/hooks/use-offline-chapter";
import { readingProgressService } from "@/services/reading-progress";
import { formatDate, formatNumber } from "@/lib/novel-utils";
import { cn } from "@/lib/utils";
import { Chapter, ChapterSummary } from "@/types/api";
import { toast } from "sonner";

// Local storage keys
const READING_SETTINGS_KEY = "chapter-reading-settings";

// Default settings
const DEFAULT_SETTINGS = {
  fontSize: 16,
  lineHeight: 1.6,
  maxWidth: 800,
};

// Utility functions for localStorage
const getStoredSettings = () => {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const stored = localStorage.getItem(READING_SETTINGS_KEY);
    return stored
      ? { ...DEFAULT_SETTINGS, ...JSON.parse(stored) }
      : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
};

const saveSettings = (settings: typeof DEFAULT_SETTINGS) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(READING_SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error("Failed to save reading settings:", error);
  }
};

interface ChapterReadingViewProps {
  chapter: Chapter;
  novel: {
    id: number;
    title: string;
    slug: string;
    author: string;
  };
  allChapters: ChapterSummary[];
}

export function ChapterReadingView({
  chapter,
  novel,
  allChapters,
}: ChapterReadingViewProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { isOffline } = useOfflineStatus();
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [showComments, setShowComments] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [mounted, setMounted] = useState(false);

  const { fontSize, lineHeight, maxWidth } = settings;

  const { execute: executeUpdateProgress } = useAsync();

  // Mark component as mounted to prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Load settings from localStorage on mount
  useEffect(() => {
    const storedSettings = getStoredSettings();
    setSettings(storedSettings);
  }, []);

  // Update settings with localStorage persistence
  const updateSettings = (newSettings: Partial<typeof DEFAULT_SETTINGS>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    saveSettings(updatedSettings);
  };

  // Find current chapter position and navigation
  const currentIndex = allChapters.findIndex((ch) => ch.id === chapter.id);
  const previousChapter =
    currentIndex > 0 ? allChapters[currentIndex - 1] : null;
  const nextChapter =
    currentIndex < allChapters.length - 1
      ? allChapters[currentIndex + 1]
      : null;

  // Update reading progress once when component mounts and user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const updateProgress = async () => {
        try {
          await executeUpdateProgress(readingProgressService.updateProgress, {
            novel_slug: novel.slug,
            chapter_number: chapter.chapter_number,
          });
        } catch (error) {
          console.error("Error updating reading progress:", error);
        }
      };

      // Only update once when the component mounts or chapter changes
      updateProgress();
    }
  }, [isAuthenticated, novel.slug, chapter.chapter_number]); // Removed executeUpdateProgress from dependencies

  // Scroll progress tracking and scroll to top button visibility
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const progress = (scrollTop / docHeight) * 100;
      setReadingProgress(Math.min(100, Math.max(0, progress)));

      // Show scroll to top button after scrolling 300px
      setShowScrollTop(scrollTop > 300);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      switch (event.key) {
        case "ArrowLeft":
          if (previousChapter) {
            router.push(
              `/novels/${novel.slug}/chapters/${previousChapter.chapter_number}`,
            );
          }
          break;
        case "ArrowRight":
          if (nextChapter) {
            router.push(
              `/novels/${novel.slug}/chapters/${nextChapter.chapter_number}`,
            );
          }
          break;
      }
    };

    document.addEventListener("keydown", handleKeyPress);
    return () => document.removeEventListener("keydown", handleKeyPress);
  }, [previousChapter, nextChapter, novel.slug, router]);

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="bg-background min-h-screen">
      {/* Fixed Progress Bar */}
      <div className="bg-background/80 fixed top-0 right-0 left-0 z-[60] backdrop-blur-sm">
        <Progress value={readingProgress} className="h-1 rounded-none" />
      </div>

      {/* Header Navigation */}
      <div className="bg-background/95 sticky top-1 z-50 border-b shadow-sm backdrop-blur-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Left: Back Navigation */}
            <div className="flex items-center gap-1 md:gap-2">
              <Link href={`/novels/${novel.slug}`}>
                <Button variant="ghost" size="sm" className="hidden sm:flex">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Novel
                </Button>
                <Button variant="ghost" size="icon" className="sm:hidden">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <Separator
                orientation="vertical"
                className="hidden h-6 sm:block"
              />
              <Link href="/">
                <Button variant="ghost" size="icon">
                  <Home className="h-4 w-4" />
                </Button>
              </Link>
            </div>

            {/* Center: Chapter Info */}
            <div className="flex-1 px-2 text-center md:px-4">
              <div className="truncate text-xs font-medium sm:text-sm">
                {novel.title}
              </div>
              <div className="text-muted-foreground truncate text-xs">
                Ch. {chapter.chapter_number}: {chapter.title}
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-1 md:gap-2">
              {/* Download Button */}
              <ChapterDownloadButton
                chapter={chapter}
                novelTitle={novel.title}
                variant="ghost"
                size="icon"
                showLabel={false}
                onSuccess={() => {
                  toast.success("Chapter downloaded", {
                    description: "You can now read this chapter offline",
                  });
                }}
                onError={(error) => {
                  toast.error("Download failed", {
                    description: error.message,
                  });
                }}
              />

              <ChapterNavigator
                allChapters={allChapters}
                currentChapterId={chapter.id}
                novelSlug={novel.slug}
              />

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Settings className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="mr-2 w-56 md:w-64">
                  <div className="space-y-3 p-3 md:space-y-4 md:p-4">
                    <div>
                      <label className="text-xs font-medium md:text-sm">
                        Font Size
                      </label>
                      <div className="mt-1 flex items-center gap-1 md:gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            updateSettings({
                              fontSize: Math.max(12, fontSize - 2),
                            })
                          }
                          disabled={fontSize <= 12}
                          className="px-2 md:px-3"
                        >
                          A-
                        </Button>
                        <span className="w-8 text-center text-xs md:w-10 md:text-sm">
                          {fontSize}px
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            updateSettings({
                              fontSize: Math.min(24, fontSize + 2),
                            })
                          }
                          disabled={fontSize >= 24}
                          className="px-2 md:px-3"
                        >
                          A+
                        </Button>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-medium md:text-sm">
                        Line Height
                      </label>
                      <div className="mt-1 flex items-center gap-1 md:gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            updateSettings({
                              lineHeight: Math.max(1.2, lineHeight - 0.2),
                            })
                          }
                          disabled={lineHeight <= 1.2}
                          className="px-2 md:px-3"
                        >
                          -
                        </Button>
                        <span className="w-8 text-center text-xs md:w-10 md:text-sm">
                          {lineHeight.toFixed(1)}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            updateSettings({
                              lineHeight: Math.min(2.5, lineHeight + 0.2),
                            })
                          }
                          disabled={lineHeight >= 2.5}
                          className="px-2 md:px-3"
                        >
                          +
                        </Button>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-medium md:text-sm">
                        Max Width ({maxWidth}px)
                      </label>
                      <div className="mt-1 flex items-center gap-1 md:gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            updateSettings({
                              maxWidth: Math.max(600, maxWidth - 100),
                            })
                          }
                          disabled={maxWidth <= 600}
                          className="px-2 text-xs md:px-3 md:text-sm"
                        >
                          Narrow
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            updateSettings({
                              maxWidth: Math.min(1200, maxWidth + 100),
                            })
                          }
                          disabled={maxWidth >= 1200}
                          className="px-2 text-xs md:px-3 md:text-sm"
                        >
                          Wide
                        </Button>
                      </div>
                    </div>
                    <Separator />
                    <div className="pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateSettings(DEFAULT_SETTINGS)}
                        className="w-full text-xs md:text-sm"
                      >
                        Reset to Default
                      </Button>
                    </div>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              <ShareButton
                title={`${novel.title} - Chapter ${chapter.chapter_number}`}
                description={`Read Chapter ${chapter.chapter_number}: ${chapter.title} of ${novel.title} by ${novel.author}`}
                variant="ghost"
                size="icon"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 md:py-8">
        <div className="flex flex-col items-center">
          {/* Offline Reading Indicator */}
          {mounted && isOffline && (
            <div className="mb-6 w-full" style={{ maxWidth: `${maxWidth}px` }}>
              <Card className="border-amber-500 bg-amber-50 dark:bg-amber-950/20">
                <CardContent className="flex items-center gap-3 p-4">
                  <WifiOff className="h-5 w-5 text-amber-600 dark:text-amber-500" />
                  <div className="flex-1">
                    <p className="font-medium text-amber-900 dark:text-amber-100">
                      Reading Offline
                    </p>
                    <p className="text-sm text-amber-700 dark:text-amber-300">
                      You are viewing a downloaded copy of this chapter
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Chapter Header */}
          <div className="mb-8 w-full" style={{ maxWidth: `${maxWidth}px` }}>
            <Card>
              <CardHeader className="text-center">
                <div className="space-y-2">
                  <Badge variant="outline">{novel.author}</Badge>
                  <CardTitle className="text-2xl md:text-3xl">
                    {novel.title}
                  </CardTitle>
                  <h1 className="text-muted-foreground text-xl font-semibold md:text-2xl">
                    Chapter {chapter.chapter_number}: {chapter.title}
                  </h1>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-center">
                <div className="text-muted-foreground flex items-center justify-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>
                      {formatDate(chapter.published_at ?? chapter.created_at)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <BookOpen className="h-4 w-4" />
                    <span>{formatNumber(chapter.word_count)} words</span>
                  </div>
                  {chapter.views !== null && chapter.views !== undefined && (
                    <div className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      <span>{formatNumber(chapter.views)} views</span>
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  {!chapter.is_free && (
                    <Badge variant="secondary">Premium Chapter</Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Chapter Content */}
          <div className="mb-8 w-full" style={{ maxWidth: `${maxWidth}px` }}>
            <Card>
              <CardContent className="p-6 md:p-8">
                <div
                  className="prose prose-gray dark:prose-invert max-w-none"
                  style={{
                    fontSize: `${fontSize}px`,
                    lineHeight: lineHeight,
                  }}
                >
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeRaw, rehypeSanitize]}
                    components={{
                      // Customize heading styles
                      h1: ({ node, ...props }) => (
                        <h1
                          className="mt-6 mb-4 text-3xl font-bold"
                          {...props}
                        />
                      ),
                      h2: ({ node, ...props }) => (
                        <h2
                          className="mt-5 mb-3 text-2xl font-semibold"
                          {...props}
                        />
                      ),
                      h3: ({ node, ...props }) => (
                        <h3
                          className="mt-4 mb-2 text-xl font-semibold"
                          {...props}
                        />
                      ),
                      // Customize paragraph spacing
                      p: ({ node, ...props }) => (
                        <p className="mb-4 leading-relaxed" {...props} />
                      ),
                      // Customize blockquote style
                      blockquote: ({ node, ...props }) => (
                        <blockquote
                          className="border-primary/30 text-muted-foreground my-4 border-l-4 pl-4 italic"
                          {...props}
                        />
                      ),
                      // Customize code blocks
                      code: ({ node, className, children, ...props }) => {
                        const isInline = !className?.includes("language-");
                        return isInline ? (
                          <code
                            className="bg-muted rounded px-1.5 py-0.5 font-mono text-sm"
                            {...props}
                          >
                            {children}
                          </code>
                        ) : (
                          <code
                            className="bg-muted block overflow-x-auto rounded-md p-4 font-mono text-sm"
                            {...props}
                          >
                            {children}
                          </code>
                        );
                      },
                      // Customize lists
                      ul: ({ node, ...props }) => (
                        <ul
                          className="my-4 ml-6 list-disc space-y-2"
                          {...props}
                        />
                      ),
                      ol: ({ node, ...props }) => (
                        <ol
                          className="my-4 ml-6 list-decimal space-y-2"
                          {...props}
                        />
                      ),
                      // Customize links
                      a: ({ node, ...props }) => (
                        <a
                          className="text-primary font-medium hover:underline"
                          target="_blank"
                          rel="noopener noreferrer"
                          {...props}
                        />
                      ),
                      // Customize horizontal rules
                      hr: ({ node, ...props }) => (
                        <hr className="border-border my-8" {...props} />
                      ),
                      // Customize images
                      img: ({ node, src, alt, ...props }) => {
                        // Prevent empty src attribute error
                        if (!src) return null;
                        return (
                          <img
                            src={src}
                            alt={alt || ""}
                            className="my-4 h-auto max-w-full rounded-lg"
                            {...props}
                          />
                        );
                      },
                    }}
                  >
                    {chapter.content}
                  </ReactMarkdown>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Navigation Footer */}
          <div className="mb-8 w-full" style={{ maxWidth: `${maxWidth}px` }}>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  {previousChapter ? (
                    <Link
                      href={`/novels/${novel.slug}/chapters/${previousChapter.chapter_number}`}
                    >
                      <Button
                        variant="outline"
                        className="flex items-center gap-2"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        <div className="text-left">
                          <div className="text-muted-foreground text-xs">
                            Previous
                          </div>
                          <div className="text-sm">
                            Chapter {previousChapter.chapter_number}
                          </div>
                        </div>
                      </Button>
                    </Link>
                  ) : (
                    <div />
                  )}

                  <div className="text-center">
                    <div className="text-muted-foreground text-sm">
                      Chapter {chapter.chapter_number} of {allChapters.length}
                    </div>
                  </div>

                  {nextChapter ? (
                    <Link
                      href={`/novels/${novel.slug}/chapters/${nextChapter.chapter_number}`}
                    >
                      <Button className="flex items-center gap-2">
                        <div className="text-right">
                          <div className="text-xs">Next</div>
                          <div className="text-sm">
                            Chapter {nextChapter.chapter_number}
                          </div>
                        </div>
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  ) : (
                    <div />
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Comments Section */}
          <div className="w-full" style={{ maxWidth: `${maxWidth}px` }}>
            <div className="mb-4">
              <Button
                variant="outline"
                onClick={() => setShowComments(!showComments)}
                className="w-full text-sm md:text-base"
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                {showComments ? "Hide Comments" : "Show Comments"}
              </Button>
            </div>

            {showComments && (
              <CommentSection
                novelSlug={novel.slug}
                novelId={novel.id}
                chapterId={chapter.id}
                title={`Chapter ${chapter.chapter_number}: ${chapter.title}`}
              />
            )}
          </div>
        </div>
      </main>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <Button
          size="icon"
          onClick={scrollToTop}
          className={cn(
            "fixed right-6 z-40 rounded-full shadow-lg transition-all duration-300 hover:shadow-xl",
            // On mobile: adjust position based on navigation buttons
            "bottom-6 md:bottom-6",
            // On mobile with navigation: move up to avoid overlap
            nextChapter || previousChapter
              ? "bottom-[144px] md:bottom-6"
              : "bottom-6",
          )}
        >
          <ArrowUp className="h-4 w-4" />
        </Button>
      )}

      {/* Floating Action Buttons (Mobile Navigation) */}
      <div className="fixed right-6 bottom-6 flex flex-col gap-2 md:hidden">
        {previousChapter && (
          <Link
            href={`/novels/${novel.slug}/chapters/${previousChapter.chapter_number}`}
          >
            <Button
              size="icon"
              variant="secondary"
              className="rounded-full shadow-lg transition-all duration-300 hover:shadow-xl"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </Link>
        )}
        {nextChapter && (
          <Link
            href={`/novels/${novel.slug}/chapters/${nextChapter.chapter_number}`}
          >
            <Button
              size="icon"
              className="rounded-full shadow-lg transition-all duration-300 hover:shadow-xl"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}
