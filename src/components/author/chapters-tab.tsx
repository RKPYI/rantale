"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { DeleteModal } from "@/components/ui/delete-modal";
import { BookOpen, Eye, Edit, FileText, Trash2, Plus } from "lucide-react";
import { useNovelChapters } from "@/hooks/use-chapters";
import { chapterService } from "@/services/chapters";
import { AuthorNovel, ChapterSummary } from "@/types/api";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ChaptersTabProps {
  selectedNovel: AuthorNovel | null;
  novels: AuthorNovel[] | null;
  refetchNovels: () => void;
  onCreateChapter: (novel: AuthorNovel) => void;
  onEditChapter: (novel: AuthorNovel, chapter: ChapterSummary) => void;
}

export function ChaptersTab({
  selectedNovel,
  novels,
  refetchNovels,
  onCreateChapter,
  onEditChapter,
}: ChaptersTabProps) {
  const [currentNovel, setCurrentNovel] = useState<AuthorNovel | null>(
    selectedNovel,
  );
  const [deleteChapterDialog, setDeleteChapterDialog] = useState<{
    isOpen: boolean;
    chapter: { id: number; number: number; title: string } | null;
  }>({ isOpen: false, chapter: null });

  // Bulk selection state for chapters
  const [selectedChapterIds, setSelectedChapterIds] = useState<Set<number>>(
    new Set(),
  );
  const [isBulkDeletingChapters, setIsBulkDeletingChapters] = useState(false);

  const {
    data: chapters,
    loading: chaptersLoading,
    refetch: refetchChapters,
  } = useNovelChapters(currentNovel?.slug || "");

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
      console.error("Failed to delete chapter:", error);

      let errorMessage = "Failed to delete chapter. Please try again.";
      if (error && typeof error === "object" && "error" in error) {
        const apiError = error as { error: string };
        errorMessage = apiError.error;
      }

      toast.error(errorMessage);
    }
  };

  const handleBulkDeleteChapters = async () => {
    if (!currentNovel || selectedChapterIds.size === 0) return;

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
      console.error("Failed to bulk delete chapters:", error);

      let errorMessage = "Failed to delete chapters. Please try again.";
      if (error && typeof error === "object" && "error" in error) {
        const apiError = error as { error: string };
        errorMessage = apiError.error || errorMessage;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      toast.error(errorMessage);
    } finally {
      setIsBulkDeletingChapters(false);
    }
  };

  const toggleChapterSelection = (chapterId: number) => {
    setSelectedChapterIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(chapterId)) {
        newSet.delete(chapterId);
      } else {
        newSet.add(chapterId);
      }
      return newSet;
    });
  };

  const toggleAllChapters = () => {
    if (!chapters?.chapters) return;
    if (selectedChapterIds.size === chapters.chapters.length) {
      setSelectedChapterIds(new Set());
    } else {
      setSelectedChapterIds(new Set(chapters.chapters.map((ch) => ch.id)));
    }
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
                <h4 className="truncate text-sm font-medium sm:text-base">
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
                <span className="truncate">
                  Chapters - {currentNovel.title}
                </span>
              </span>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                {selectedChapterIds.size > 0 && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleBulkDeleteChapters}
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
            ) : chapters?.chapters && chapters.chapters.length > 0 ? (
              <div className="space-y-3">
                {/* Select All Checkbox */}
                <div className="flex items-center gap-2 border-b pb-3">
                  <Checkbox
                    checked={
                      selectedChapterIds.size === chapters.chapters.length
                    }
                    onCheckedChange={toggleAllChapters}
                  />
                  <label className="text-xs font-medium sm:text-sm">
                    Select All ({chapters.chapters.length})
                  </label>
                </div>

                {chapters.chapters.map((chapter) => (
                  <div
                    key={chapter.id}
                    className="flex flex-col gap-3 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4"
                  >
                    <div className="flex min-w-0 flex-1 items-start gap-3 sm:items-center">
                      {/* Checkbox for individual selection */}
                      <Checkbox
                        checked={selectedChapterIds.has(chapter.id)}
                        onCheckedChange={() =>
                          toggleChapterSelection(chapter.id)
                        }
                        className="mt-1 flex-shrink-0 sm:mt-0"
                      />
                      <div className="min-w-0 flex-1">
                        <h4 className="truncate text-sm font-medium sm:text-base">
                          Chapter {chapter.chapter_number}: {chapter.title}
                        </h4>
                        <p className="text-muted-foreground text-xs sm:text-sm">
                          {chapter.word_count} words
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-end space-x-2 sm:flex-shrink-0">
                      <Button variant="ghost" size="sm" asChild>
                        <Link
                          href={`/novels/${currentNovel.slug}/chapters/${chapter.chapter_number}`}
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEditChapter(currentNovel, chapter)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
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
                ))}
              </div>
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
    </div>
  );
}
