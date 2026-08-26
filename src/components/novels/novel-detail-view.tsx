"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  BookOpen,
  Star,
  Eye,
  Clock,
  Calendar,
  Play,
  ChevronRight,
  Edit,
  Trash2,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  LayoutList,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { CommentSection } from "@/components/comments/comment-section";
import { RatingSection } from "@/components/rating-section";
import { LibraryActionButton } from "@/components/library";
import { ShareButton } from "@/components/ui/share-button";
import { RelatedNovels } from "./related-novels";
import { NovelDialog } from "@/components/author/novel-dialog";
import { useAuth } from "@/contexts/auth-context";
import { useNovelProgress } from "@/hooks/use-reading-progress";
import { useGenres } from "@/hooks/use-novels";
import {
  formatRating,
  getStatusColor,
  formatDate,
  formatNumber,
  formatRelativeTime,
} from "@/lib/novel-utils";
import { formatProgressPercentage } from "@/lib/content-utils";
import { cn } from "@/lib/utils";
import { NovelWithChapters, ChapterSummary } from "@/types/api";
import {
  flattenNovelChapters,
  getChapterPath,
  getChapterLabel,
  groupChaptersByVolume,
} from "@/lib/chapter-url";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useRouter } from "next/navigation";
import { NovelBadge } from "./ui/novel-badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { novelService } from "@/services/novels";
import { toast } from "sonner";

interface NovelDetailViewProps {
  novel: NovelWithChapters;
}

const DESCRIPTION_COLLAPSE_LENGTH = 320;
const CHAPTERS_PER_PAGE = 50;

export function NovelDetailView({ novel }: NovelDetailViewProps) {
  const { isAuthenticated, loading: authLoading, user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const [chaptersPage, setChaptersPage] = useState(1);
  const [openVolumeIds, setOpenVolumeIds] = useState<string[]>([]);
  const router = useRouter();

  const { data: readingProgress, loading: progressLoading } = useNovelProgress(
    novel.slug,
  );
  const { data: genres } = useGenres();
  const isLoading = authLoading || progressLoading;

  const sortedChapters = useMemo(
    () => flattenNovelChapters(novel),
    [novel],
  );

  const volumeGroups = useMemo(
    () => groupChaptersByVolume(novel.volumes),
    [novel.volumes],
  );

  const latestChapters = useMemo(
    () => [...sortedChapters].slice(-5).reverse(),
    [sortedChapters],
  );

  const chaptersTotalPages = Math.max(
    1,
    Math.ceil(sortedChapters.length / CHAPTERS_PER_PAGE),
  );
  const safeChaptersPage = Math.min(chaptersPage, chaptersTotalPages);
  const paginatedChapters = useMemo(() => {
    const start = (safeChaptersPage - 1) * CHAPTERS_PER_PAGE;
    return sortedChapters.slice(start, start + CHAPTERS_PER_PAGE);
  }, [sortedChapters, safeChaptersPage]);
  const chaptersFrom =
    sortedChapters.length === 0
      ? 0
      : (safeChaptersPage - 1) * CHAPTERS_PER_PAGE + 1;
  const chaptersTo = Math.min(
    safeChaptersPage * CHAPTERS_PER_PAGE,
    sortedChapters.length,
  );

  const currentChapterNumber =
    readingProgress?.current_chapter?.chapter_number ?? null;
  const currentVolumeNumber =
    readingProgress?.current_chapter?.volume_number ?? null;

  useEffect(() => {
    if (progressLoading || !novel.uses_volumes) {
      return;
    }

    const currentVolume = volumeGroups.find(
      (volume) => volume.volume_number === currentVolumeNumber,
    );

    setOpenVolumeIds(currentVolume ? [`volume-${currentVolume.id}`] : []);
  }, [
    currentVolumeNumber,
    novel.uses_volumes,
    progressLoading,
    volumeGroups,
  ]);

  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (
      hash &&
      ["overview", "chapters", "reviews", "comments"].includes(hash)
    ) {
      setActiveTab(hash);
      setTimeout(() => {
        const tabsElement = document.querySelector('[role="tablist"]');
        if (tabsElement) {
          tabsElement.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);
    }
  }, []);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    window.history.replaceState(null, "", `#${value}`);
    requestAnimationFrame(() => {
      document
        .querySelector('[role="tab"][data-state="active"]')
        ?.scrollIntoView({
          behavior: "smooth",
          inline: "nearest",
          block: "nearest",
        });
    });
  };

  const handleStartReading = () => {
    if (sortedChapters.length > 0) {
      router.push(
        getChapterPath(novel.slug, sortedChapters[0], novel.uses_volumes),
      );
    }
  };

  const handleContinueReading = () => {
    if (readingProgress?.current_chapter) {
      router.push(
        getChapterPath(
          novel.slug,
          readingProgress.current_chapter,
          novel.uses_volumes ?? readingProgress.uses_volumes,
        ),
      );
    } else {
      handleStartReading();
    }
  };

  const hasStartedReading =
    readingProgress?.current_chapter !== null &&
    readingProgress?.current_chapter !== undefined;

  const hasChapters = sortedChapters.length > 0;
  const isAdmin = user?.is_admin || user?.role === 3;

  const description = novel.description?.trim() ?? "";
  const shouldCollapseDescription =
    description.length > DESCRIPTION_COLLAPSE_LENGTH;
  const visibleDescription =
    !shouldCollapseDescription || descriptionExpanded
      ? description
      : `${description.slice(0, DESCRIPTION_COLLAPSE_LENGTH).trimEnd()}…`;

  const handleEditSuccess = () => {
    router.refresh();
  };

  const handleDeleteNovel = async () => {
    setIsDeleting(true);
    try {
      await novelService.deleteNovel(novel.slug);
      toast.success("Novel deleted successfully");
      router.push("/novels");
      router.refresh();
    } catch (error) {
      console.error("Failed to delete novel:", error);
      toast.error("Failed to delete novel. Please try again.");
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const primaryAction = (
    <Button
      onClick={hasStartedReading ? handleContinueReading : handleStartReading}
      className="w-full gap-2 shadow-sm"
      size="lg"
      disabled={isLoading || !hasChapters}
    >
      {hasStartedReading ? (
        <>
          <Play className="size-4" />
          Continue reading
        </>
      ) : (
        <>
          <BookOpen className="size-4" />
          Start reading
        </>
      )}
    </Button>
  );

  return (
    <div className="pb-24 lg:pb-0">
      {/* Atmospheric hero */}
      <section className="relative isolate overflow-hidden">
        {novel.cover_image && (
          <div aria-hidden className="pointer-events-none absolute inset-0">
            <Image
              src={novel.cover_image}
              alt=""
              fill
              className="scale-110 object-cover opacity-30 blur-2xl saturate-150"
              priority
              sizes="100vw"
            />
            <div className="from-background via-background/85 to-background absolute inset-0 bg-gradient-to-b" />
          </div>
        )}

        <div className="relative container mx-auto max-w-7xl px-4 pt-6 pb-8 md:px-6 lg:px-8 lg:pt-10 lg:pb-12">
          <div className="flex flex-col gap-6 sm:flex-row sm:gap-8 lg:grid lg:grid-cols-[minmax(0,260px)_1fr] lg:gap-10">
            {/* Cover + desktop actions */}
            <div className="mx-auto w-[140px] shrink-0 sm:mx-0 sm:w-[160px] lg:w-full">
              <div className="lg:sticky lg:top-6">
                <div className="relative aspect-[2/3] overflow-hidden rounded-2xl shadow-[0_20px_50px_-24px_oklch(0_0_0/0.45)] ring-1 ring-black/5">
                  {novel.cover_image ? (
                    <Image
                      src={novel.cover_image}
                      alt={`Cover of ${novel.title}`}
                      fill
                      className="object-cover"
                      priority
                      sizes="(max-width: 640px) 140px, (max-width: 1024px) 160px, 260px"
                    />
                  ) : (
                    <div className="from-muted to-muted/50 flex h-full w-full items-center justify-center bg-gradient-to-br">
                      <BookOpen className="text-muted-foreground size-12" />
                    </div>
                  )}
                </div>

                {/* Desktop action rail */}
                <div className="mt-5 hidden space-y-3 lg:block">
                  {primaryAction}

                  {isAuthenticated && readingProgress && hasStartedReading && (
                    <div className="rounded-xl border border-primary/10 bg-primary/[0.04] p-3.5">
                      <div className="mb-2 flex items-center justify-between text-xs">
                        <span className="text-muted-foreground font-medium">
                          Your progress
                        </span>
                        <span className="tabular-nums">
                          {formatProgressPercentage(
                            readingProgress.progress_percentage,
                          )}
                        </span>
                      </div>
                      <Progress
                        value={Math.min(
                          readingProgress.progress_percentage,
                          100,
                        )}
                        className="h-1.5"
                      />
                      {readingProgress.current_chapter && (
                        <p className="text-muted-foreground mt-2 line-clamp-2 text-xs leading-snug">
                          Ch. {readingProgress.current_chapter.chapter_number}
                          <span className="text-muted-foreground/50 mx-1">
                            ·
                          </span>
                          {readingProgress.current_chapter.title}
                        </p>
                      )}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <LibraryActionButton novel={novel} className="min-w-0 flex-1" />
                    <ShareButton
                      title={novel.title}
                      description={`Check out "${novel.title}" by ${novel.author ?? "Anonymous"}. ${description ? description.slice(0, 100) + "…" : ""}`}
                      variant="outline"
                      size="icon"
                    />
                  </div>

                  {isAdmin && (
                    <div className="flex gap-2 pt-1">
                      <Button
                        onClick={() => setShowEditDialog(true)}
                        variant="ghost"
                        size="sm"
                        className="flex-1"
                      >
                        <Edit className="size-3.5" />
                        Edit
                      </Button>
                      <Button
                        onClick={() => setShowDeleteDialog(true)}
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive flex-1"
                      >
                        <Trash2 className="size-3.5" />
                        Delete
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Title, meta, synopsis */}
            <div className="min-w-0 flex-1 space-y-5 text-center sm:text-left lg:space-y-6">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                  <Badge variant={getStatusColor(novel.status)}>
                    {novel.status.charAt(0).toUpperCase() +
                      novel.status.slice(1)}
                  </Badge>
                  {(novel.is_featured || novel.is_trending) && (
                    <NovelBadge novel={novel} positioned={false} />
                  )}
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-balance sm:text-3xl lg:text-4xl xl:text-5xl">
                  {novel.title}
                </h1>
                <p className="text-muted-foreground text-base sm:text-lg">
                  by{" "}
                  <span className="text-foreground font-medium">
                    {novel.author ?? "Anonymous"}
                  </span>
                </p>
              </div>

              {/* Inline stats — values first */}
              <div className="text-muted-foreground flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm sm:justify-start">
                {novel.rating !== null && novel.rating !== undefined && (
                  <span className="inline-flex items-center gap-1.5">
                    <Star className="size-3.5 fill-amber-400 text-amber-400" />
                    <span className="text-foreground font-semibold tabular-nums">
                      {formatRating(novel.rating)}
                    </span>
                    {novel.rating_count != null && (
                      <span className="text-xs">
                        ({formatNumber(novel.rating_count)})
                      </span>
                    )}
                  </span>
                )}

                {novel.total_chapters != null && (
                  <span className="inline-flex items-center gap-1.5">
                    <BookOpen className="size-3.5" />
                    <span className="text-foreground font-semibold tabular-nums">
                      {novel.total_chapters}
                    </span>
                    <span className="text-xs">chapters</span>
                  </span>
                )}

                {novel.views != null && (
                  <span className="inline-flex items-center gap-1.5">
                    <Eye className="size-3.5" />
                    <span className="text-foreground font-semibold tabular-nums">
                      {formatNumber(novel.views)}
                    </span>
                    <span className="text-xs">views</span>
                  </span>
                )}
              </div>

              {/* Genres */}
              {novel.genres.length > 0 && (
                <div className="flex flex-wrap justify-center gap-2 sm:justify-start">
                  {novel.genres.map((genre) => (
                    <Link key={genre.id} href={`/genres?genre=${genre.slug}`}>
                      <Badge
                        variant="secondary"
                        className="hover:bg-primary hover:text-primary-foreground cursor-pointer border transition-colors"
                        style={{
                          backgroundColor: `${genre.color}18`,
                          borderColor: `${genre.color}55`,
                        }}
                      >
                        {genre.name}
                      </Badge>
                    </Link>
                  ))}
                </div>
              )}

              {/* Mobile / tablet primary actions */}
              <div className="space-y-3 lg:hidden">
                {primaryAction}
                <div className="flex gap-2">
                  <LibraryActionButton novel={novel} className="min-w-0 flex-1" />
                  <ShareButton
                    title={novel.title}
                    description={`Check out "${novel.title}" by ${novel.author ?? "Anonymous"}. ${description ? description.slice(0, 100) + "…" : ""}`}
                    variant="outline"
                    size="icon"
                  />
                </div>
                {isAuthenticated && readingProgress && hasStartedReading && (
                  <div className="rounded-xl border border-primary/10 bg-primary/[0.04] p-3">
                    <div className="mb-1.5 flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="tabular-nums">
                        {formatProgressPercentage(
                          readingProgress.progress_percentage,
                        )}
                      </span>
                    </div>
                    <Progress
                      value={Math.min(readingProgress.progress_percentage, 100)}
                      className="h-1.5"
                    />
                  </div>
                )}
              </div>

              {/* Synopsis */}
              {description && (
                <div className="space-y-2 text-left">
                  <h2 className="text-sm font-semibold tracking-tight">
                    Synopsis
                  </h2>
                  <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-line sm:text-[15px] sm:leading-7">
                    {visibleDescription}
                  </p>
                  {shouldCollapseDescription && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-primary h-auto gap-1 px-0 py-1 hover:bg-transparent"
                      onClick={() =>
                        setDescriptionExpanded((expanded) => !expanded)
                      }
                    >
                      {descriptionExpanded ? (
                        <>
                          Show less
                          <ChevronUp className="size-3.5" />
                        </>
                      ) : (
                        <>
                          Read more
                          <ChevronDown className="size-3.5" />
                        </>
                      )}
                    </Button>
                  )}
                </div>
              )}

              {/* Dates */}
              <div className="text-muted-foreground flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs sm:justify-start">
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="size-3.5" />
                  Published{" "}
                  {formatDate(novel.published_at || novel.created_at)}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="size-3.5" />
                  Updated {formatRelativeTime(novel.updated_at)}
                </span>
              </div>

              {isAdmin && (
                <div className="flex justify-center gap-2 lg:hidden">
                  <Button
                    onClick={() => setShowEditDialog(true)}
                    variant="outline"
                    size="sm"
                  >
                    <Edit className="size-3.5" />
                    Edit
                  </Button>
                  <Button
                    onClick={() => setShowDeleteDialog(true)}
                    variant="outline"
                    size="sm"
                    className="text-destructive"
                  >
                    <Trash2 className="size-3.5" />
                    Delete
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <div className="container mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
        <Tabs
          value={activeTab}
          onValueChange={handleTabChange}
          className="space-y-6"
        >
          <div className="bg-background/95 sticky top-0 z-10 -mx-4 border-b backdrop-blur supports-[backdrop-filter]:bg-background/80 md:-mx-6 lg:-mx-8">
            <div className="scrollbar-hide overflow-x-auto px-4 md:px-6 lg:px-8">
              <TabsList className="bg-transparent text-muted-foreground inline-flex h-auto min-w-full w-max items-stretch justify-start gap-0 rounded-none p-0">
                {(
                  [
                    {
                      value: "overview",
                      label: "Overview",
                      icon: LayoutList,
                    },
                    {
                      value: "chapters",
                      label: novel.uses_volumes ? "Volumes" : "Chapters",
                      icon: BookOpen,
                      count: novel.uses_volumes
                        ? volumeGroups.length
                        : (novel.total_chapters ?? sortedChapters.length),
                    },
                    {
                      value: "reviews",
                      label: "Reviews",
                      icon: Star,
                      count: novel.rating_count,
                    },
                    {
                      value: "comments",
                      label: "Comments",
                      icon: MessageSquare,
                    },
                  ] as const
                ).map((tab) => {
                  const Icon = tab.icon;
                  const count =
                    "count" in tab && tab.count != null && tab.count > 0
                      ? tab.count
                      : null;

                  return (
                    <TabsTrigger
                      key={tab.value}
                      value={tab.value}
                      className={cn(
                        "group relative h-12 flex-none gap-2 rounded-none border-0 bg-transparent px-3.5 text-sm font-medium shadow-none",
                        "text-muted-foreground hover:text-foreground",
                        "data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none",
                        "dark:data-[state=active]:border-transparent dark:data-[state=active]:bg-transparent",
                        "after:bg-primary after:absolute after:inset-x-2 after:bottom-0 after:h-0.5 after:origin-left after:scale-x-0 after:rounded-full after:transition-transform after:duration-200",
                        "data-[state=active]:after:scale-x-100",
                        "sm:px-4",
                      )}
                    >
                      <Icon className="hidden size-3.5 sm:block group-data-[state=active]:text-primary" />
                      <span>{tab.label}</span>
                      {count != null && (
                        <span
                          className={cn(
                            "rounded-md px-1.5 py-0.5 text-[11px] font-medium tabular-nums",
                            "bg-muted text-muted-foreground",
                            "group-data-[state=active]:bg-primary/10 group-data-[state=active]:text-primary",
                          )}
                        >
                          {formatNumber(count)}
                        </span>
                      )}
                    </TabsTrigger>
                  );
                })}
              </TabsList>
            </div>
          </div>

          <TabsContent value="overview" className="space-y-8 pb-8">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              <div className="space-y-4 lg:col-span-2">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-lg font-semibold tracking-tight">
                    Latest chapters
                  </h2>
                  {hasChapters && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-primary gap-1"
                      onClick={() => handleTabChange("chapters")}
                    >
                      View all
                      <ChevronRight className="size-4" />
                    </Button>
                  )}
                </div>

                {hasChapters ? (
                  <ul className="divide-y rounded-2xl border">
                    {latestChapters.map((chapter) => (
                      <li key={chapter.id}>
                        <ChapterRow
                          novelSlug={novel.slug}
                          chapter={chapter}
                          usesVolumes={novel.uses_volumes}
                          isCurrent={
                            currentChapterNumber === chapter.chapter_number &&
                            (!novel.uses_volumes ||
                              readingProgress?.current_chapter
                                ?.volume_number === chapter.volume_number)
                          }
                        />
                      </li>
                    ))}
                  </ul>
                ) : (
                  <EmptyChapters />
                )}
              </div>

              <div className="lg:col-span-1">
                <RelatedNovels novelSlug={novel.slug} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="chapters" className="pb-8">
            <div className="mb-4 flex items-end justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold tracking-tight">
                  {novel.uses_volumes ? "All volumes" : "All chapters"}
                </h2>
                <p className="text-muted-foreground text-sm">
                  {novel.uses_volumes
                    ? `${volumeGroups.length} volumes`
                    : `${novel.total_chapters ?? sortedChapters.length} chapters`}
                  {hasStartedReading && currentChapterNumber != null && (
                    <>
                      {" "}
                      · currently on{" "}
                      {novel.uses_volumes && currentVolumeNumber != null
                        ? `Vol. ${currentVolumeNumber} · Ch. ${currentChapterNumber}`
                        : `Ch. ${currentChapterNumber}`}
                    </>
                  )}
                </p>
              </div>
              {hasChapters && chaptersTotalPages > 1 && (
                <p className="text-muted-foreground shrink-0 text-sm tabular-nums">
                  {chaptersFrom}–{chaptersTo} of {sortedChapters.length}
                </p>
              )}
            </div>

            {hasChapters ? (
              <div className="space-y-4">
                {novel.uses_volumes && volumeGroups.length > 0 ? (
                  <Accordion
                    type="multiple"
                    value={openVolumeIds}
                    onValueChange={setOpenVolumeIds}
                    className="rounded-2xl border px-2"
                  >
                    {volumeGroups.map((volume) => (
                      <AccordionItem
                        key={volume.id}
                        value={`volume-${volume.id}`}
                        className="border-b last:border-b-0"
                      >
                        <AccordionTrigger className="px-3 hover:no-underline">
                          <div className="text-left">
                            <p className="font-medium">
                              {volume.title || `Volume ${volume.volume_number}`}
                            </p>
                            <p className="text-muted-foreground text-xs">
                              {volume.chapters.length} chapter
                              {volume.chapters.length === 1 ? "" : "s"}
                            </p>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="pb-0">
                          <ul className="divide-y">
                            {volume.chapters.map((chapter) => (
                              <li key={chapter.id}>
                                <ChapterRow
                                  novelSlug={novel.slug}
                                  chapter={chapter}
                                  usesVolumes={novel.uses_volumes}
                                  isCurrent={
                                    currentChapterNumber ===
                                      chapter.chapter_number &&
                                    readingProgress?.current_chapter
                                      ?.volume_number === volume.volume_number
                                  }
                                  showWordCountFallback
                                />
                              </li>
                            ))}
                          </ul>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                ) : (
                  <ul className="divide-y rounded-2xl border">
                    {paginatedChapters.map((chapter) => (
                      <li key={chapter.id}>
                        <ChapterRow
                          novelSlug={novel.slug}
                          chapter={chapter}
                          usesVolumes={novel.uses_volumes}
                          isCurrent={
                            currentChapterNumber === chapter.chapter_number
                          }
                          showWordCountFallback
                        />
                      </li>
                    ))}
                  </ul>
                )}

                {!novel.uses_volumes && chaptersTotalPages > 1 && (
                  <div className="flex items-center justify-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setChaptersPage((page) => Math.max(1, page - 1))
                      }
                      disabled={safeChaptersPage <= 1}
                    >
                      <ChevronLeft className="size-4" />
                      Previous
                    </Button>

                    <span className="text-muted-foreground px-2 text-sm tabular-nums">
                      Page {safeChaptersPage} of {chaptersTotalPages}
                    </span>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setChaptersPage((page) =>
                          Math.min(chaptersTotalPages, page + 1),
                        )
                      }
                      disabled={safeChaptersPage >= chaptersTotalPages}
                    >
                      Next
                      <ChevronRight className="size-4" />
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <EmptyChapters />
            )}
          </TabsContent>

          <TabsContent value="reviews" className="pb-8">
            <RatingSection
              novelSlug={novel.slug}
              novelId={novel.id}
              title={novel.title}
            />
          </TabsContent>

          <TabsContent value="comments" className="pb-8">
            <CommentSection
              novelSlug={novel.slug}
              novelId={novel.id}
              title={novel.title}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Mobile floating CTA — sits above bottom nav (h-16) */}
      <div className="pointer-events-none fixed inset-x-0 bottom-20 z-40 px-3 md:bottom-4 lg:hidden">
        <div className="border-border/80 bg-background/95 pointer-events-auto mx-auto flex max-w-7xl items-center gap-3 rounded-2xl border p-3 shadow-[0_12px_40px_-16px_oklch(0_0_0/0.4)] backdrop-blur supports-[backdrop-filter]:bg-background/90">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{novel.title}</p>
            <p className="text-muted-foreground truncate text-xs">
              {hasStartedReading && readingProgress?.current_chapter
                ? `Ch. ${readingProgress.current_chapter.chapter_number} · ${readingProgress.current_chapter.title}`
                : hasChapters
                  ? "Ready when you are"
                  : "No chapters yet"}
            </p>
          </div>
          <Button
            onClick={
              hasStartedReading ? handleContinueReading : handleStartReading
            }
            size="default"
            className="shrink-0 gap-1.5 shadow-sm"
            disabled={isLoading || !hasChapters}
          >
            {hasStartedReading ? (
              <>
                <Play className="size-3.5" />
                Continue
              </>
            ) : (
              <>
                <BookOpen className="size-3.5" />
                Start
              </>
            )}
          </Button>
        </div>
      </div>

      {isAdmin && (
        <NovelDialog
          isOpen={showEditDialog}
          onClose={() => setShowEditDialog(false)}
          novel={novel}
          isEditing={true}
          genres={genres || []}
          onSuccess={handleEditSuccess}
        />
      )}

      {isAdmin && (
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete this novel?</AlertDialogTitle>
              <AlertDialogDescription>
                This cannot be undone. &quot;{novel.title}&quot; and all of its
                chapters, comments, and ratings will be permanently deleted.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteNovel}
                disabled={isDeleting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isDeleting ? "Deleting…" : "Delete novel"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}

function ChapterRow({
  novelSlug,
  chapter,
  usesVolumes = false,
  isCurrent = false,
  showWordCountFallback = false,
}: {
  novelSlug: string;
  chapter: ChapterSummary;
  usesVolumes?: boolean;
  isCurrent?: boolean;
  showWordCountFallback?: boolean;
}) {
  return (
    <Link
      href={getChapterPath(novelSlug, chapter, usesVolumes)}
      className={cn(
        "group flex items-center gap-3 px-3 py-3.5 transition-colors sm:gap-4 sm:px-4",
        "hover:bg-muted/60 focus-visible:bg-muted/60 focus-visible:outline-none",
        isCurrent && "bg-primary/[0.06]",
      )}
    >
      <span
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-lg text-xs font-semibold tabular-nums sm:size-10 sm:text-sm",
          isCurrent
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary",
        )}
      >
        {usesVolumes && chapter.volume_number != null
          ? `${chapter.volume_number}-${chapter.chapter_number}`
          : chapter.chapter_number}
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3
            className={cn(
              "truncate text-sm font-medium transition-colors sm:text-[15px]",
              "group-hover:text-primary",
              isCurrent && "text-primary",
            )}
          >
            {chapter.title}
          </h3>
          {isCurrent && (
            <Badge variant="secondary" className="shrink-0 text-[10px]">
              Current
            </Badge>
          )}
        </div>
        <p className="text-muted-foreground mt-0.5 text-xs">
          {usesVolumes && chapter.volume_number != null && (
            <span>{getChapterLabel(chapter, usesVolumes)} · </span>
          )}
          {chapter.word_count
            ? `${formatNumber(chapter.word_count)} words`
            : showWordCountFallback
              ? "Word count unavailable"
              : "\u00A0"}
        </p>
      </div>

      <ChevronRight
        className={cn(
          "text-muted-foreground size-4 shrink-0 transition-transform",
          "group-hover:translate-x-0.5 group-hover:text-primary",
        )}
      />
    </Link>
  );
}

function EmptyChapters() {
  return (
    <div className="rounded-2xl border border-dashed px-6 py-14 text-center">
      <div className="bg-muted mx-auto mb-4 flex size-12 items-center justify-center rounded-full">
        <BookOpen className="text-muted-foreground size-5" />
      </div>
      <h3 className="mb-1 font-medium">No chapters yet</h3>
      <p className="text-muted-foreground text-sm">
        Check back soon — new chapters will show up here.
      </p>
    </div>
  );
}
