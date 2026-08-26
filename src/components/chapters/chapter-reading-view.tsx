"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import {
  ArrowLeft,
  BookOpen,
  Eye,
  Clock,
  ChevronLeft,
  ChevronRight,
  Home,
  MessageSquare,
  ArrowUp,
  Type,
  Edit,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CommentSection } from "@/components/comments/comment-section";
import { ShareButton } from "@/components/ui/share-button";
import { ChapterNavigator } from "@/components/chapters/chapter-navigator";
import { ChapterDialog } from "@/components/author/chapter-dialog";
import { useAuth } from "@/contexts/auth-context";
import { useAsync } from "@/hooks/use-api";
import { readingProgressService } from "@/services/reading-progress";
import { formatDate, formatNumber } from "@/lib/novel-utils";
import { cn } from "@/lib/utils";
import { Chapter, ChapterSummary } from "@/types/api";
import {
  getChapterPath,
  getChapterLabel,
} from "@/lib/chapter-url";

const MOBILE_NAV_HIDE_THRESHOLD = 8;
const MOBILE_NAV_BREAKPOINT = 768;

// Local storage keys
const READING_SETTINGS_KEY = "chapter-reading-settings";

// Default settings
const DEFAULT_SETTINGS = {
  fontSize: 20,
  maxWidth: 780,
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
    uses_volumes?: boolean;
  };
  allChapters: ChapterSummary[];
}

export function ChapterReadingView({
  chapter,
  novel,
  allChapters,
}: ChapterReadingViewProps) {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [showComments, setShowComments] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);

  const { fontSize, maxWidth } = settings;

  const { execute: executeUpdateProgress } = useAsync();

  // Check if user is admin
  const isAdmin = user?.is_admin || user?.role === 3;

  const handleEditSuccess = () => {
    router.refresh();
  };

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
            chapter_id: chapter.id,
          });
        } catch (error) {
          console.error("Error updating reading progress:", error);
        }
      };

      // Only update once when the component mounts or chapter changes
      updateProgress();
    }
  }, [isAuthenticated, novel.slug, chapter.id]); // Removed executeUpdateProgress from dependencies

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
              getChapterPath(novel.slug, previousChapter, novel.uses_volumes),
            );
          }
          break;
        case "ArrowRight":
          if (nextChapter) {
            router.push(
              getChapterPath(novel.slug, nextChapter, novel.uses_volumes),
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
        <div className="container mx-auto px-2 py-2 md:px-4 md:py-3">
          <div className="flex items-center">
            {/* Left: Back Navigation */}
            <div className="flex min-w-0 flex-1 items-center gap-1">
              <Link href={`/novels/${novel.slug}`}>
                <Button variant="ghost" size="sm" className="hidden sm:flex">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Novel
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 sm:hidden"
                >
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
            <div className="hidden flex-shrink-0 px-2 text-center lg:block lg:px-4">
              <div className="max-w-xs truncate text-sm font-medium">
                {novel.title}
              </div>
              <div className="text-muted-foreground max-w-xs truncate text-xs">
                {getChapterLabel(chapter, novel.uses_volumes)}: {chapter.title}
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex min-w-0 flex-1 items-center justify-end gap-1 md:gap-2">
              {/* Admin Edit Button */}
              {isAdmin && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowEditDialog(true)}
                  title="Edit Chapter (Admin)"
                  className="h-9 w-9"
                >
                  <Edit className="h-4 w-4" />
                </Button>
              )}

              <ChapterNavigator
                allChapters={allChapters}
                currentChapterId={chapter.id}
                novelSlug={novel.slug}
                usesVolumes={novel.uses_volumes}
              />

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9">
                    <Type className="h-4 w-4" />
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
                className="h-9 w-9"
              />
            </div>
          </div>

          <div className="mt-1 px-1 lg:hidden">
            <div className="text-sm leading-tight font-medium">
              {novel.title}
            </div>
            <div className="text-muted-foreground truncate text-xs leading-tight">
              Ch. {chapter.chapter_number}: {chapter.title}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-3 py-4 pb-24 sm:px-4 md:py-8 md:pb-8">
        <div className="flex flex-col items-center">
          {/* Chapter Header */}
          <div className="mb-8 w-full" style={{ maxWidth: `${maxWidth}px` }}>
            <header className="border-border/70 border-b pb-6 text-center">
              <div className="space-y-2">
                <Badge variant="outline">{novel.author}</Badge>
                <h2 className="text-xl leading-tight font-semibold md:text-3xl">
                  {novel.title}
                </h2>
                <h1 className="text-muted-foreground text-lg leading-snug font-semibold md:text-2xl">
                  Chapter {chapter.chapter_number}: {chapter.title}
                </h1>
              </div>
              <div className="mt-4 space-y-2 text-center">
                <div className="text-muted-foreground flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-sm">
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
              </div>
            </header>
          </div>

          {/* Chapter Content */}
          <div className="mb-8 w-full" style={{ maxWidth: `${maxWidth}px` }}>
            <article className="border-border/70 border-b pb-8 sm:px-4 md:px-8">
              <div
                className="prose prose-gray dark:prose-invert max-w-none text-pretty break-words"
                style={{
                  fontSize: `${fontSize}px`,
                  lineHeight: 1.95,
                  letterSpacing: "0.01em",
                }}
              >
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeRaw, rehypeSanitize]}
                  components={{
                    // Customize heading styles
                    h1: ({ node, ...props }) => (
                      <h1
                        className="mt-6 mb-4 text-2xl leading-tight font-bold md:text-3xl"
                        {...props}
                      />
                    ),
                    h2: ({ node, ...props }) => (
                      <h2
                        className="mt-5 mb-3 text-xl leading-tight font-semibold md:text-2xl"
                        {...props}
                      />
                    ),
                    h3: ({ node, ...props }) => (
                      <h3
                        className="mt-4 mb-2 text-lg leading-tight font-semibold md:text-xl"
                        {...props}
                      />
                    ),
                    // Customize paragraph spacing
                    p: ({ node, ...props }) => (
                      <p
                        className="mb-5 leading-[1.95] tracking-[0.01em]"
                        {...props}
                      />
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
                    // Customize tables
                    table: ({ node, ...props }) => (
                      <div className="my-6 overflow-x-auto">
                        <table
                          className="border-border w-full border-collapse border"
                          {...props}
                        />
                      </div>
                    ),
                    thead: ({ node, ...props }) => (
                      <thead className="bg-muted" {...props} />
                    ),
                    tbody: ({ node, ...props }) => <tbody {...props} />,
                    tr: ({ node, ...props }) => (
                      <tr className="border-border border-b" {...props} />
                    ),
                    th: ({ node, ...props }) => (
                      <th
                        className="border-border border px-4 py-3 text-left font-semibold"
                        {...props}
                      />
                    ),
                    td: ({ node, ...props }) => (
                      <td
                        className="border-border border px-4 py-3"
                        {...props}
                      />
                    ),
                  }}
                >
                  {chapter.content}
                </ReactMarkdown>
              </div>
            </article>
          </div>

          {/* Navigation Footer */}
          <div className="mb-8 w-full" style={{ maxWidth: `${maxWidth}px` }}>
            <nav className="space-y-4 border-b px-1 pb-6 md:space-y-0 md:px-2">
              <div className="text-center">
                <div className="text-muted-foreground text-sm font-medium">
                  {getChapterLabel(chapter, novel.uses_volumes)} ·{" "}
                  {currentIndex + 1} of {allChapters.length}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 md:hidden">
                {previousChapter ? (
                  <Link
                    href={getChapterPath(
                      novel.slug,
                      previousChapter,
                      novel.uses_volumes,
                    )}
                  >
                    <Button
                      variant="outline"
                      className="w-full justify-center gap-1"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Prev
                    </Button>
                  </Link>
                ) : (
                  <Button
                    variant="outline"
                    disabled
                    className="w-full justify-center gap-1"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Prev
                  </Button>
                )}

                {nextChapter ? (
                  <Link
                    href={getChapterPath(
                      novel.slug,
                      nextChapter,
                      novel.uses_volumes,
                    )}
                  >
                    <Button className="w-full justify-center gap-1">
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </Link>
                ) : (
                  <Button disabled className="w-full justify-center gap-1">
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="hidden items-center justify-between md:flex">
                {previousChapter ? (
                  <Link
                    href={getChapterPath(
                      novel.slug,
                      previousChapter,
                      novel.uses_volumes,
                    )}
                  >
                    <Button variant="outline" className="flex items-center">
                      <ChevronLeft className="h-4 w-4" />
                      <div className="text-left">
                        <div className="text-sm">
                          {getChapterLabel(
                            previousChapter,
                            novel.uses_volumes,
                          )}
                        </div>
                      </div>
                    </Button>
                  </Link>
                ) : (
                  <Button
                    variant="outline"
                    className="invisible flex items-center"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <div className="text-left">
                      <div className="text-sm">Placeholder</div>
                    </div>
                  </Button>
                )}

                {nextChapter ? (
                  <Link
                    href={getChapterPath(
                      novel.slug,
                      nextChapter,
                      novel.uses_volumes,
                    )}
                  >
                    <Button className="flex items-center gap-2">
                      <div className="text-right">
                        <div className="text-sm">
                          {getChapterLabel(nextChapter, novel.uses_volumes)}
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </Link>
                ) : (
                  <Button className="invisible flex items-center gap-2">
                    <div className="text-right">
                      <div className="text-sm">Placeholder</div>
                    </div>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </nav>
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
                chapterNumber={chapter.chapter_number}
                chapterVolumeNumber={chapter.volume_number ?? undefined}
                title={`${getChapterLabel(chapter, novel.uses_volumes)}: ${chapter.title}`}
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
            nextChapter || previousChapter
              ? "bottom-24 md:bottom-6"
              : "bottom-6",
          )}
        >
          <ArrowUp className="h-4 w-4" />
        </Button>
      )}

      {/* Admin Edit Dialog */}
      {isAdmin && (
        <ChapterDialog
          isOpen={showEditDialog}
          onClose={() => setShowEditDialog(false)}
          chapter={chapter}
          isEditing={true}
          novel={{
            id: novel.id,
            slug: novel.slug,
            title: novel.title,
          }}
          onSuccess={handleEditSuccess}
        />
      )}
    </div>
  );
}
