"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Save } from "lucide-react";
import { useNovelChapters } from "@/hooks/use-chapters";
import { chapterService } from "@/services/chapters";
import { AuthorNovel, ChapterSummary, Chapter } from "@/types/api";
import { toast } from "sonner";
import { MarkdownEditor } from "@/components/chapters/markdown-editor";
import { handleErrorWithState, ApiError } from "@/lib/utils";

interface ChapterDialogProps {
  isOpen: boolean;
  onClose: () => void;
  chapter?: ChapterSummary | Chapter;
  isEditing: boolean;
  novel: AuthorNovel | null;
  onSuccess: () => void | Promise<void>;
}

export function ChapterDialog({
  isOpen,
  onClose,
  chapter,
  isEditing,
  novel,
  onSuccess,
}: ChapterDialogProps) {
  const [formData, setFormData] = useState({
    chapter_number: 1,
    title: "",
    content: "",
    is_free: true,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>("");
  const [loadingContent, setLoadingContent] = useState(false);

  // Get chapters data to determine next chapter number
  const { data: chaptersData } = useNovelChapters(novel?.slug || "");

  useEffect(() => {
    setError(""); // Clear error when dialog opens/closes

    const loadChapterContent = async () => {
      if (isEditing && chapter && novel) {
        // Check if we already have the content (full Chapter object)
        if ("content" in chapter && chapter.content) {
          setFormData({
            chapter_number: chapter.chapter_number,
            title: chapter.title,
            content: chapter.content,
            is_free: chapter.is_free !== false,
          });
        } else {
          // Fetch full chapter content from API
          setLoadingContent(true);
          try {
            const response = await chapterService.getChapter(
              novel.slug,
              chapter.chapter_number,
            );
            setFormData({
              chapter_number: response.chapter.chapter_number,
              title: response.chapter.title,
              content: response.chapter.content,
              is_free: response.chapter.is_free !== false,
            });
          } catch (error) {
            console.error("Failed to load chapter content:", error);
            toast.error("Failed to load chapter content");
            setFormData({
              chapter_number: chapter.chapter_number,
              title: chapter.title,
              content: "",
              is_free: true,
            });
          } finally {
            setLoadingContent(false);
          }
        }
      } else {
        // When creating new chapter, set next available number
        const nextChapterNumber = chaptersData?.chapters
          ? Math.max(
              ...chaptersData.chapters.map((ch) => ch.chapter_number),
              0,
            ) + 1
          : 1;

        setFormData({
          chapter_number: nextChapterNumber,
          title: "",
          content: "",
          is_free: true,
        });
      }
    };

    if (isOpen) {
      loadChapterContent();
    }
  }, [isEditing, chapter, isOpen, novel, chaptersData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novel) return;

    setError("");
    setSaving(true);

    try {
      if (isEditing && chapter) {
        await chapterService.updateChapter(novel.slug, chapter.id, formData);
        toast.success("Chapter updated successfully!");
      } else {
        await chapterService.createChapter(novel.slug, formData);
        toast.success("Chapter created successfully!");
      }
      await onSuccess();
      onClose();
    } catch (error: unknown) {
      console.error("Failed to save chapter:", error);

      // Special handling for chapter conflict
      if (error && typeof error === "object" && "rawData" in error) {
        const apiError = error as ApiError;
        if (
          apiError.rawData &&
          typeof apiError.rawData === "object" &&
          "existing_chapter" in apiError.rawData
        ) {
          const existing = apiError.rawData.existing_chapter as {
            chapter_number: number;
            title: string;
          };
          const errorMessage = `Chapter ${existing.chapter_number} already exists: "${existing.title}". Please use a different chapter number or edit the existing chapter.`;
          setError(errorMessage);
          toast.error(errorMessage);
          return;
        }
      }

      // Default error handling
      handleErrorWithState(
        error,
        setError,
        "Failed to save chapter. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[95vh] max-w-[95vw] overflow-y-auto lg:max-w-6xl">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg">
            {isEditing ? "Edit Chapter" : "Create New Chapter"}
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            {novel
              ? `Managing chapters for "${novel.title}"`
              : "Chapter management"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription className="text-xs sm:text-sm">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {loadingContent && (
            <Alert>
              <AlertDescription className="flex items-center gap-2 text-xs sm:text-sm">
                <span className="animate-spin">⏳</span>
                Loading chapter content...
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="chapter_number" className="text-xs sm:text-sm">
                Chapter Number *
                {!isEditing &&
                  chaptersData?.chapters &&
                  chaptersData.chapters.length > 0 && (
                    <span className="text-muted-foreground ml-2 text-xs font-normal">
                      (Next:{" "}
                      {Math.max(
                        ...chaptersData.chapters.map((ch) => ch.chapter_number),
                      ) + 1}
                      )
                    </span>
                  )}
              </Label>
              <Input
                id="chapter_number"
                type="number"
                value={formData.chapter_number}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    chapter_number: parseInt(e.target.value),
                  }))
                }
                min={1}
                required
                disabled={loadingContent}
                className="text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="title" className="text-xs sm:text-sm">
                Chapter Title *
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder="Enter chapter title"
                required
                disabled={loadingContent}
                className="text-sm"
              />
            </div>
          </div>

          <div className="space-y-2">
            <MarkdownEditor
              value={formData.content}
              onChange={(content) =>
                setFormData((prev) => ({ ...prev, content }))
              }
              label="Chapter Content"
              placeholder="Write your chapter content here... (Markdown supported)"
              rows={20}
              required
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_free"
              checked={formData.is_free}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({ ...prev, is_free: !!checked }))
              }
              disabled={loadingContent}
            />
            <Label
              htmlFor="is_free"
              className="cursor-pointer text-xs font-normal sm:text-sm"
            >
              This is a free chapter
            </Label>
          </div>

          <DialogFooter className="flex-col gap-2 sm:flex-row">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="w-full text-xs sm:w-auto sm:text-sm"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving || loadingContent}
              className="w-full text-xs sm:w-auto sm:text-sm"
            >
              {saving ? (
                <>
                  <span className="mr-2 animate-spin">⏳</span>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  {isEditing ? "Update Chapter" : "Create Chapter"}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
