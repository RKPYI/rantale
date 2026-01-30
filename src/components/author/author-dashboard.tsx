"use client";

import { useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DeleteModal } from "@/components/ui/delete-modal";
import { PlusCircle } from "lucide-react";
import { useAuthorNovels, useAuthorStats } from "@/hooks/use-author";
import { useGenres } from "@/hooks/use-novels";
import { novelService } from "@/services/novels";
import { AuthorNovel, ChapterSummary } from "@/types/api";
import { toast } from "sonner";

// Import tab components
import { OverviewTab } from "./overview-tab";
import { NovelsTab } from "./novels-tab";
import { ChaptersTab } from "./chapters-tab";
import { AnalyticsTab } from "./analytics-tab";
import { NovelDialog } from "./novel-dialog";
import { toggleInSet, toggleAllInSet, logAndToastError } from "@/lib/utils";
import { ChapterDialog } from "./chapter-dialog";

export function AuthorDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [isNovelDialogOpen, setIsNovelDialogOpen] = useState(false);
  const [isChapterDialogOpen, setIsChapterDialogOpen] = useState(false);
  const [selectedNovel, setSelectedNovel] = useState<AuthorNovel | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<ChapterSummary | null>(
    null,
  );
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingChapter, setIsEditingChapter] = useState(false);
  const [deleteNovelDialog, setDeleteNovelDialog] = useState<{
    isOpen: boolean;
    novel: { id: number; slug: string; title: string } | null;
  }>({ isOpen: false, novel: null });

  // Bulk selection state
  const [selectedNovelIds, setSelectedNovelIds] = useState<Set<number>>(
    new Set(),
  );
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [bulkDeleteNovelsDialog, setBulkDeleteNovelsDialog] = useState(false);

  // Store refetch function from ChaptersTab using ref to avoid re-renders
  const refetchChaptersRef = useRef<(() => Promise<void>) | null>(null);

  // Memoize the callback to prevent infinite loops
  const handleRefetchChapters = useCallback((refetch: () => Promise<void>) => {
    refetchChaptersRef.current = refetch;
  }, []);

  const {
    data: novels,
    loading: novelsLoading,
    error: novelsError,
    refetch: refetchNovels,
  } = useAuthorNovels();
  const {
    data: stats,
    loading: statsLoading,
    error: statsError,
  } = useAuthorStats();
  const { data: genres } = useGenres();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ongoing":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "hiatus":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const handleDeleteNovel = async () => {
    if (!deleteNovelDialog.novel) return;

    try {
      await novelService.deleteNovel(deleteNovelDialog.novel.slug);
      await refetchNovels();
      toast.success("Novel deleted successfully!");
      setDeleteNovelDialog({ isOpen: false, novel: null });
    } catch (error) {
      logAndToastError(
        error,
        "Failed to delete novel",
        "Failed to delete novel. Please try again.",
      );
    }
  };

  const handleBulkDeleteNovels = async () => {
    if (selectedNovelIds.size === 0) return;

    setBulkDeleteNovelsDialog(false);
    setIsBulkDeleting(true);
    try {
      const result = await novelService.bulkDeleteNovels(
        Array.from(selectedNovelIds),
      );

      if (result.unauthorized_novels && result.unauthorized_novels.length > 0) {
        toast.warning(
          `Deleted ${result.deleted_count} novel(s), but ${result.unauthorized_novels.length} were skipped due to permissions.`,
        );
      } else {
        toast.success(`Successfully deleted ${result.deleted_count} novel(s)!`);
      }

      setSelectedNovelIds(new Set());
      await refetchNovels();
    } catch (error) {
      logAndToastError(
        error,
        "Failed to bulk delete novels",
        "Failed to delete novels. Please try again.",
      );
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const toggleNovelSelection = (novelId: number) => {
    setSelectedNovelIds((prev) => toggleInSet(prev, novelId));
  };

  const toggleAllNovels = () => {
    if (!novels) return;
    setSelectedNovelIds((prev) => toggleAllInSet(prev, novels, (n) => n.id));
  };

  if (novelsError || statsError) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Error loading dashboard data. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4 px-4 py-6 sm:space-y-6 sm:px-0">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Author Dashboard</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Manage your novels and track your performance
          </p>
        </div>
        <Button
          onClick={() => {
            setSelectedNovel(null);
            setIsEditing(false);
            setIsNovelDialogOpen(true);
          }}
          className="w-full sm:w-auto"
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          New Novel
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="overflow-x-auto">
          <TabsList className="inline-flex w-full min-w-max sm:w-auto">
            <TabsTrigger value="overview" className="text-xs sm:text-sm">
              Overview
            </TabsTrigger>
            <TabsTrigger value="novels" className="text-xs sm:text-sm">
              Novels
            </TabsTrigger>
            <TabsTrigger value="chapters" className="text-xs sm:text-sm">
              Chapters
            </TabsTrigger>
            <TabsTrigger value="analytics" className="text-xs sm:text-sm">
              Analytics
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <OverviewTab
            stats={stats}
            statsLoading={statsLoading}
            novels={novels}
            novelsLoading={novelsLoading}
            onCreateNovel={() => {
              setSelectedNovel(null);
              setIsEditing(false);
              setIsNovelDialogOpen(true);
            }}
            onEditNovel={(novel) => {
              setSelectedNovel(novel);
              setIsEditing(true);
              setIsNovelDialogOpen(true);
            }}
            onViewAllNovels={() => setActiveTab("novels")}
            getStatusColor={getStatusColor}
          />
        </TabsContent>

        {/* Novels Tab */}
        <TabsContent value="novels">
          <NovelsTab
            novels={novels}
            novelsLoading={novelsLoading}
            selectedNovelIds={selectedNovelIds}
            isBulkDeleting={isBulkDeleting}
            onCreateNovel={() => {
              setSelectedNovel(null);
              setIsEditing(false);
              setIsNovelDialogOpen(true);
            }}
            onEditNovel={(novel) => {
              setSelectedNovel(novel);
              setIsEditing(true);
              setIsNovelDialogOpen(true);
            }}
            onManageChapters={(novel) => {
              setSelectedNovel(novel);
              setActiveTab("chapters");
            }}
            onDeleteNovel={(novel) =>
              setDeleteNovelDialog({ isOpen: true, novel })
            }
            onBulkDelete={() => setBulkDeleteNovelsDialog(true)}
            onToggleSelection={toggleNovelSelection}
            onToggleAll={toggleAllNovels}
            getStatusColor={getStatusColor}
          />
        </TabsContent>

        {/* Chapters Tab */}
        <TabsContent value="chapters">
          <ChaptersTab
            selectedNovel={selectedNovel}
            novels={novels}
            refetchNovels={refetchNovels}
            onCreateChapter={(novel) => {
              setSelectedNovel(novel);
              setSelectedChapter(null);
              setIsEditingChapter(false);
              setIsChapterDialogOpen(true);
            }}
            onEditChapter={(novel, chapter) => {
              setSelectedNovel(novel);
              setSelectedChapter(chapter);
              setIsEditingChapter(true);
              setIsChapterDialogOpen(true);
            }}
            onRefetchChapters={handleRefetchChapters}
          />
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <AnalyticsTab
            stats={stats}
            statsLoading={statsLoading}
            novels={novels}
            novelsLoading={novelsLoading}
          />
        </TabsContent>
      </Tabs>

      {/* Novel Creation/Editing Dialog */}
      <NovelDialog
        isOpen={isNovelDialogOpen}
        onClose={() => setIsNovelDialogOpen(false)}
        novel={selectedNovel}
        isEditing={isEditing}
        genres={genres || []}
        onSuccess={refetchNovels}
      />

      {/* Chapter Creation/Editing Dialog */}
      <ChapterDialog
        isOpen={isChapterDialogOpen}
        onClose={() => setIsChapterDialogOpen(false)}
        chapter={selectedChapter ?? undefined}
        isEditing={isEditingChapter}
        novel={selectedNovel}
        onSuccess={async () => {
          await refetchNovels();
          if (refetchChaptersRef.current) {
            await refetchChaptersRef.current();
          }
        }}
      />

      {/* Delete Novel Confirmation Dialog */}
      <DeleteModal
        open={deleteNovelDialog.isOpen}
        onOpenChange={(isOpen) =>
          setDeleteNovelDialog({ isOpen, novel: deleteNovelDialog.novel })
        }
        onConfirm={handleDeleteNovel}
        title="Delete Novel?"
        description={
          deleteNovelDialog.novel
            ? `This will permanently delete "${deleteNovelDialog.novel.title}" and all its chapters. This action cannot be undone.`
            : "This will permanently delete this novel and all its chapters. This action cannot be undone."
        }
        confirmText="Delete Novel"
        isLoading={false}
      />

      {/* Bulk Delete Novels Confirmation Dialog */}
      <DeleteModal
        open={bulkDeleteNovelsDialog}
        onOpenChange={setBulkDeleteNovelsDialog}
        onConfirm={handleBulkDeleteNovels}
        title="Delete Multiple Novels?"
        description={`This will permanently delete ${selectedNovelIds.size} selected novel(s) and all their chapters. This action cannot be undone.`}
        confirmText={`Delete ${selectedNovelIds.size} Novel(s)`}
        isLoading={isBulkDeleting}
      />
    </div>
  );
}
