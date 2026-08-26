"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { DeleteModal } from "@/components/ui/delete-modal";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  BookOpen,
  Eye,
  Edit,
  FileText,
  Trash2,
  Plus,
  Send,
  AlertCircle,
  ArrowRightLeft,
  X,
} from "lucide-react";
import { useAuthorNovelChapters } from "@/hooks/use-author";
import { useOrderedListSelection } from "@/hooks/use-ordered-list-selection";
import { chapterService } from "@/services/chapters";
import { authorService } from "@/services/author";
import { volumeService } from "@/services/volumes";
import {
  AuthorNovel,
  AuthorChapterWithStatus,
  ChapterSummary,
  VolumeSummary,
} from "@/types/api";
import { cn, logAndToastError } from "@/lib/utils";
import { formatNumber } from "@/lib/novel-utils";
import { getChapterPath, getChapterLabel } from "@/lib/chapter-url";
import { toast } from "sonner";
import { ChapterStatusBadge } from "@/components/editor/chapter-status-badge";
import { MoveChapterDialog } from "@/components/author/move-chapter-dialog";
import {
  SelectableList,
  SelectableListRow,
  SelectionHint,
} from "@/components/author/selectable-list-row";

interface ChaptersTabProps {
  selectedNovel: AuthorNovel | null;
  novels: AuthorNovel[] | null;
  refetchNovels: () => void;
  onCreateChapter: (novel: AuthorNovel) => void;
  onEditChapter: (novel: AuthorNovel, chapter: ChapterSummary) => void;
  onRefetchChapters?: (refetch: () => Promise<void>) => void;
}

export function ChaptersTab({
  selectedNovel,
  novels,
  refetchNovels,
  onCreateChapter,
  onEditChapter,
  onRefetchChapters,
}: ChaptersTabProps) {
  const [currentNovel, setCurrentNovel] = useState<AuthorNovel | null>(
    selectedNovel,
  );
  const [deleteChapterDialog, setDeleteChapterDialog] = useState<{
    isOpen: boolean;
    chapter: { id: number; number: number; title: string } | null;
  }>({ isOpen: false, chapter: null });

  const [isBulkDeletingChapters, setIsBulkDeletingChapters] = useState(false);
  const [bulkDeleteChaptersDialog, setBulkDeleteChaptersDialog] =
    useState(false);
  const [submittingChapterId, setSubmittingChapterId] = useState<number | null>(
    null,
  );
  const [moveChapterDialog, setMoveChapterDialog] = useState<{
    isOpen: boolean;
    chapters: AuthorChapterWithStatus[];
  }>({ isOpen: false, chapters: [] });
  const [allVolumes, setAllVolumes] = useState<VolumeSummary[]>([]);

  const {
    data: chaptersData,
    loading: chaptersLoading,
    refetch: refetchChapters,
  } = useAuthorNovelChapters(currentNovel?.slug || "");

  const chapters = chaptersData?.chapters || [];
  const chapterIds = useMemo(() => chapters.map((chapter) => chapter.id), [chapters]);
  const volumeGroups = chaptersData?.volumes || [];
  const usesVolumes = currentNovel?.uses_volumes ?? chaptersData?.uses_volumes;
  const canMoveChapters = usesVolumes && allVolumes.length > 1;

  const {
    selectedIds: selectedChapterIds,
    setSelectedIds: setSelectedChapterIds,
    handleSelect: handleChapterSelect,
    toggleAll: toggleAllChapters,
    handleListKeyDown: handleChapterListKeyDown,
    allSelected: allChaptersSelected,
    someSelected: someChaptersSelected,
    clearSelection: clearChapterSelection,
  } = useOrderedListSelection({
    orderedIds: chapterIds,
    resetKey: currentNovel?.id ?? null,
  });

  const loadAllVolumes = async (novelSlug: string) => {
    try {
      const data = await volumeService.getAuthorNovelVolumes(novelSlug);
      setAllVolumes(data.volumes);
    } catch {
      setAllVolumes([]);
    }
  };

  // Expose refetch function to parent
  useEffect(() => {
    if (onRefetchChapters && refetchChapters) {
      onRefetchChapters(refetchChapters);
    }
  }, [onRefetchChapters, refetchChapters]);

  useEffect(() => {
    if (!currentNovel?.slug || !usesVolumes) {
      setAllVolumes([]);
      return;
    }

    loadAllVolumes(currentNovel.slug);
  }, [currentNovel?.slug, usesVolumes]);

  const handleDeleteChapter = async () => {
    if (!deleteChapterDialog.chapter || !currentNovel) return;

    try {
      await chapterService.deleteChapter(
        currentNovel.slug,
        deleteChapterDialog.chapter.id,
      );
      await refetchChapters();
      await refetchNovels();
      toast.success("Chapter deleted successfully!");
      setDeleteChapterDialog({ isOpen: false, chapter: null });
    } catch (error) {
      logAndToastError(
        error,
        "Failed to delete chapter",
        "Failed to delete chapter. Please try again.",
      );
    }
  };

  const handleBulkDeleteChapters = async () => {
    if (!currentNovel || selectedChapterIds.size === 0) return;

    setBulkDeleteChaptersDialog(false);
    setIsBulkDeletingChapters(true);
    try {
      const result = await chapterService.bulkDeleteChapters(
        currentNovel.slug,
        Array.from(selectedChapterIds),
      );

      toast.success(`Successfully deleted ${result.deleted_count} chapter(s)!`);
      setSelectedChapterIds(new Set());
      await refetchChapters();
      await refetchNovels();
    } catch (error) {
      logAndToastError(
        error,
        "Failed to bulk delete chapters",
        "Failed to delete chapters. Please try again.",
      );
    } finally {
      setIsBulkDeletingChapters(false);
    }
  };

  const handleSubmitForReview = async (chapter: AuthorChapterWithStatus) => {
    if (!currentNovel) return;

    setSubmittingChapterId(chapter.id);
    try {
      await authorService.submitChapterForReview(currentNovel.slug, chapter.id);
      toast.success("Chapter submitted for review!");
      await refetchChapters();
    } catch (error) {
      logAndToastError(
        error,
        "Failed to submit chapter",
        "Failed to submit chapter for review. Please try again.",
      );
    } finally {
      setSubmittingChapterId(null);
    }
  };

  const toggleChapterSelection = (chapterId: number, event?: React.MouseEvent | React.KeyboardEvent) => {
    handleChapterSelect(chapterId, event);
  };

  const getSelectedChaptersInOrder = () =>
    chapters.filter((chapter) => selectedChapterIds.has(chapter.id));

  const handleOpenBulkMoveDialog = () => {
    const selectedChapters = getSelectedChaptersInOrder();
    if (selectedChapters.length === 0) return;

    setMoveChapterDialog({ isOpen: true, chapters: selectedChapters });
  };

  const renderChapterRow = (chapter: AuthorChapterWithStatus) => {
    const isSelected = selectedChapterIds.has(chapter.id);

    return (
      <SelectableListRow
        key={chapter.id}
        selected={isSelected}
        onSelect={(event) => toggleChapterSelection(chapter.id, event)}
        ariaLabel={`${getChapterLabel(chapter, usesVolumes)}: ${chapter.title}`}
        className={cn(
          "p-3 sm:p-4",
          chapter.status === "revision_requested" &&
            "border-red-200 bg-red-50/50 dark:border-red-900/50 dark:bg-red-950/20",
          chapter.status === "pending_update" &&
            "border-blue-200 bg-blue-50/50 dark:border-blue-900/50 dark:bg-blue-950/20",
          chapter.status === "pending_review" &&
            "border-yellow-200 bg-yellow-50/50 dark:border-yellow-900/50 dark:bg-yellow-950/20",
        )}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 flex-1 items-start gap-3 sm:items-center">
            <Checkbox
              checked={isSelected}
              onClick={(event) => {
                event.stopPropagation();
                toggleChapterSelection(chapter.id, event);
              }}
              aria-label={`Select ${chapter.title}`}
              className="mt-1 flex-shrink-0 sm:mt-0"
            />
            <div className="min-w-0 flex-1 overflow-hidden">
              <div className="flex flex-wrap items-center gap-2">
                <h4 className="text-sm font-medium break-words sm:text-base">
                  {getChapterLabel(chapter, usesVolumes)}: {chapter.title}
                </h4>
                <ChapterStatusBadge status={chapter.status} />
              </div>
              <p className="text-muted-foreground text-xs sm:text-sm">
                {formatNumber(chapter.word_count)} words
              </p>
            </div>
          </div>
          <div
            className="flex items-center justify-end space-x-2 sm:flex-shrink-0"
            data-no-row-select
          >
          {(chapter.status === "draft" ||
            chapter.status === "revision_requested") && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSubmitForReview(chapter)}
              disabled={submittingChapterId === chapter.id}
            >
              {submittingChapterId === chapter.id ? (
                <span className="mr-2 animate-spin">⏳</span>
              ) : (
                <Send className="mr-2 h-4 w-4" />
              )}
              Submit
            </Button>
          )}
          {(chapter.status === "approved" ||
            chapter.status === "pending_update") &&
            currentNovel && (
              <Button variant="ghost" size="sm" asChild>
                <Link
                  href={getChapterPath(
                    currentNovel.slug,
                    chapter,
                    usesVolumes,
                  )}
                >
                  <Eye className="h-4 w-4" />
                </Link>
              </Button>
            )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              currentNovel &&
              onEditChapter(
                currentNovel,
                chapter as unknown as ChapterSummary,
              )
            }
            disabled={
              chapter.status === "pending_review" ||
              chapter.status === "pending_update"
            }
            title={
              chapter.status === "pending_review" ||
              chapter.status === "pending_update"
                ? "Cannot edit while pending review"
                : undefined
            }
          >
            <Edit className="h-4 w-4" />
          </Button>
          {canMoveChapters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                setMoveChapterDialog({ isOpen: true, chapters: [chapter] })
              }
              title="Move to another volume"
            >
              <ArrowRightLeft className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              setDeleteChapterDialog({
                isOpen: true,
                chapter: {
                  id: chapter.id,
                  number: chapter.chapter_number,
                  title: chapter.title,
                },
              })
            }
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      {chapter.status === "revision_requested" &&
        chapter.latest_review?.notes && (
          <Alert variant="destructive" className="mt-3">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <strong>Editor Feedback:</strong> {chapter.latest_review.notes}
            </AlertDescription>
          </Alert>
        )}
      {chapter.status === "pending_update" && (
        <Alert className="mt-3 border-blue-200 bg-blue-50/50 dark:border-blue-900/50 dark:bg-blue-950/20">
          <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <AlertDescription className="text-sm text-blue-800 dark:text-blue-300">
            Your changes are being reviewed. The original content remains
            visible to readers.
          </AlertDescription>
        </Alert>
      )}
      {chapter.status === "pending_review" && (
        <Alert className="mt-3 border-yellow-200 bg-yellow-50/50 dark:border-yellow-900/50 dark:bg-yellow-950/20">
          <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
          <AlertDescription className="text-sm text-yellow-800 dark:text-yellow-300">
            This chapter is waiting for editor review.
          </AlertDescription>
        </Alert>
      )}
    </SelectableListRow>
    );
  };

  if (!novels || novels.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="py-8 text-center">
            <BookOpen className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
            <h3 className="text-base font-medium sm:text-lg">
              No Novels Available
            </h3>
            <p className="text-muted-foreground text-sm sm:text-base">
              Create a novel first to manage chapters.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Novel Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 flex-shrink-0" />
            <span className="truncate">Select Novel</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-3">
            {novels.map((novel) => (
              <div
                key={novel.id}
                className={cn(
                  "cursor-pointer rounded-lg border p-3 transition-colors sm:p-4",
                  currentNovel?.id === novel.id
                    ? "border-primary bg-primary/5"
                    : "hover:bg-muted/50",
                )}
                onClick={() => setCurrentNovel(novel)}
              >
                <h4 className="text-sm font-medium break-words sm:truncate sm:text-base">
                  {novel.title}
                </h4>
                <p className="text-muted-foreground text-xs sm:text-sm">
                  {novel.chapters_count} chapters
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Chapter Management */}
      {currentNovel && (
        <Card>
          <CardHeader>
            <CardTitle className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <span className="flex items-center gap-2">
                <FileText className="h-5 w-5 flex-shrink-0" />
                <span className="break-words sm:truncate">
                  Chapters - {currentNovel.title}
                </span>
              </span>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                {selectedChapterIds.size > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearChapterSelection}
                    className="w-full sm:w-auto"
                  >
                    <X className="mr-2 h-4 w-4" />
                    Clear ({selectedChapterIds.size})
                  </Button>
                )}
                {selectedChapterIds.size > 0 && canMoveChapters && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleOpenBulkMoveDialog}
                    className="w-full sm:w-auto"
                  >
                    <ArrowRightLeft className="mr-2 h-4 w-4" />
                    Move ({selectedChapterIds.size})
                  </Button>
                )}
                {selectedChapterIds.size > 0 && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setBulkDeleteChaptersDialog(true)}
                    disabled={isBulkDeletingChapters}
                    className="w-full sm:w-auto"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete ({selectedChapterIds.size})
                  </Button>
                )}
                <Button
                  onClick={() => onCreateChapter(currentNovel)}
                  className="w-full sm:w-auto"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  New Chapter
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {chaptersLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : chapters && chapters.length > 0 ? (
              <SelectableList
                label={`Chapters for ${currentNovel.title}`}
                selectedCount={selectedChapterIds.size}
                onKeyDown={handleChapterListKeyDown}
                className="space-y-3"
              >
                <div className="space-y-3 border-b pb-3">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={
                        allChaptersSelected
                          ? true
                          : someChaptersSelected
                            ? "indeterminate"
                            : false
                      }
                      onClick={(event) => event.stopPropagation()}
                      onCheckedChange={toggleAllChapters}
                      aria-label="Select all chapters"
                    />
                    <label className="text-xs font-medium sm:text-sm">
                      Select All ({chapters.length})
                    </label>
                  </div>
                  <SelectionHint />
                </div>

                {usesVolumes && volumeGroups.length > 0
                  ? volumeGroups.map((volume) => (
                      <div key={volume.id} className="space-y-3">
                        <h3 className="text-sm font-semibold">
                          {volume.title} (Vol. {volume.volume_number})
                        </h3>
                        {chapters
                          .filter(
                            (chapter) =>
                              chapter.volume_number === volume.volume_number,
                          )
                          .map((chapter) => renderChapterRow(chapter))}
                      </div>
                    ))
                  : chapters.map((chapter) => renderChapterRow(chapter))}
              </SelectableList>
            ) : (
              <div className="py-8 text-center">
                <FileText className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
                <h3 className="text-base font-medium sm:text-lg">
                  No Chapters Yet
                </h3>
                <p className="text-muted-foreground mb-4 text-sm sm:text-base">
                  Start writing by creating your first chapter.
                </p>
                <Button onClick={() => onCreateChapter(currentNovel)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Chapter
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Delete Chapter Confirmation Dialog */}
      <DeleteModal
        open={deleteChapterDialog.isOpen}
        onOpenChange={(isOpen: boolean) =>
          setDeleteChapterDialog({
            isOpen,
            chapter: deleteChapterDialog.chapter,
          })
        }
        onConfirm={handleDeleteChapter}
        title="Delete Chapter?"
        description={
          deleteChapterDialog.chapter
            ? `This will permanently delete "Chapter ${deleteChapterDialog.chapter.number}: ${deleteChapterDialog.chapter.title}". This action cannot be undone.`
            : "This will permanently delete this chapter. This action cannot be undone."
        }
        confirmText="Delete Chapter"
        isLoading={false}
      />

      {/* Bulk Delete Chapters Confirmation Dialog */}
      <DeleteModal
        open={bulkDeleteChaptersDialog}
        onOpenChange={setBulkDeleteChaptersDialog}
        onConfirm={handleBulkDeleteChapters}
        title="Delete Multiple Chapters?"
        description={`This will permanently delete ${selectedChapterIds.size} selected chapter(s). This action cannot be undone.`}
        confirmText={`Delete ${selectedChapterIds.size} Chapter(s)`}
        isLoading={isBulkDeletingChapters}
      />

      {currentNovel && (
        <MoveChapterDialog
          isOpen={moveChapterDialog.isOpen}
          onClose={() => setMoveChapterDialog({ isOpen: false, chapters: [] })}
          novelSlug={currentNovel.slug}
          chapters={moveChapterDialog.chapters}
          onSuccess={async () => {
            if (moveChapterDialog.chapters.length > 1) {
              setSelectedChapterIds(new Set());
            }
            await refetchChapters();
            await refetchNovels();
            if (currentNovel?.slug && usesVolumes) {
              await loadAllVolumes(currentNovel.slug);
            }
          }}
        />
      )}
    </div>
  );
}
