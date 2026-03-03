"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { novelService } from "@/services/novels";
import { AuthorNovel, Genre, NovelWithChapters } from "@/types/api";
import { toast } from "sonner";
import { NovelCoverUpload } from "@/components/novels/novel-cover-upload";
import { ImageUpload } from "@/components/ui/image-upload";
import { handleErrorWithState } from "@/lib/utils";

interface NovelDialogProps {
  isOpen: boolean;
  onClose: () => void;
  novel?: AuthorNovel | NovelWithChapters | null;
  isEditing: boolean;
  genres: Genre[];
  onSuccess: () => void;
}

export function NovelDialog({
  isOpen,
  onClose,
  novel,
  isEditing,
  genres,
  onSuccess,
}: NovelDialogProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "ongoing" as "ongoing" | "completed" | "hiatus",
    genres: [] as number[],
  });
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    setError(""); // Clear error when dialog opens/closes
    setCoverImage(null); // Clear cover image selection
    if (isEditing && novel) {
      setFormData({
        title: novel.title,
        description: novel.description,
        status: novel.status,
        genres: novel.genres?.map((g) => g.id) || [],
      });
    } else {
      setFormData({
        title: "",
        description: "",
        status: "ongoing",
        genres: [],
      });
    }
  }, [isEditing, novel, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      if (isEditing && novel) {
        await novelService.updateNovel(novel.slug, formData);
        toast.success("Novel updated successfully!");
        onSuccess();
        onClose();
      } else {
        // Create the novel first
        const createdNovel = await novelService.createNovel({
          ...formData,
          author: "", // This should be set by the backend based on authenticated user
        });

        // If a cover image was selected, upload it
        if (coverImage && createdNovel.slug) {
          try {
            await novelService.uploadNovelCover(createdNovel.slug, coverImage);
            toast.success("Novel created with cover image!");
          } catch (uploadError) {
            console.error("Failed to upload cover:", uploadError);
            toast.success(
              "Novel created, but cover upload failed. You can add it later.",
            );
          }
        } else {
          toast.success("Novel created successfully!");
        }

        onSuccess();
        onClose();
      }
    } catch (error: unknown) {
      console.error("Failed to save novel:", error);
      handleErrorWithState(
        error,
        setError,
        "Failed to save novel. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleGenreToggle = (genreId: number) => {
    setFormData((prev) => ({
      ...prev,
      genres: prev.genres.includes(genreId)
        ? prev.genres.filter((id) => id !== genreId)
        : [...prev.genres, genreId],
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg">
            {isEditing ? "Edit Novel" : "Create New Novel"}
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            {isEditing
              ? "Update your novel details"
              : "Create a new novel to start your writing journey"}
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

          <div className="space-y-2">
            <Label htmlFor="title" className="text-xs sm:text-sm">
              Title *
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
              }
              placeholder="Enter novel title"
              required
              className="text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-xs sm:text-sm">
              Description *
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder="Write a compelling description for your novel..."
              rows={4}
              required
              className="text-sm"
            />
          </div>

          {/* Cover Image Upload */}
          {isEditing && novel ? (
            <div className="space-y-2">
              <Label className="text-xs sm:text-sm">Cover Image</Label>
              <NovelCoverUpload
                novel={novel}
                onUpdate={() => {
                  onSuccess();
                  toast.success("Cover image updated!");
                }}
              />
            </div>
          ) : (
            <div className="space-y-2">
              <Label className="text-xs sm:text-sm">
                Cover Image (Optional)
              </Label>
              <ImageUpload
                onFileSelect={(file) => setCoverImage(file)}
                aspectRatio="2/3"
                compress={true}
                maxWidth={800}
                placeholder="Upload novel cover image (recommended: 2:3 ratio)"
                compact={true}
                showDelete={false}
              />
              {coverImage && (
                <p className="text-muted-foreground text-xs">
                  Selected: {coverImage.name}
                </p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="status" className="text-xs sm:text-sm">
              Status
            </Label>
            <div className="flex flex-wrap gap-2">
              {["ongoing", "completed", "hiatus"].map((status) => (
                <Button
                  key={status}
                  type="button"
                  variant={formData.status === status ? "default" : "outline"}
                  size="sm"
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      status: status as "ongoing" | "completed" | "hiatus",
                    }))
                  }
                  className="text-xs capitalize sm:text-sm"
                >
                  {status}
                </Button>
              ))}
            </div>
          </div>

          {genres && genres.length > 0 && (
            <div className="space-y-2">
              <Label className="text-xs sm:text-sm">Genres</Label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {genres.map((genre) => (
                  <div key={genre.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`genre-${genre.id}`}
                      checked={formData.genres.includes(genre.id)}
                      onCheckedChange={() => handleGenreToggle(genre.id)}
                    />
                    <Label
                      htmlFor={`genre-${genre.id}`}
                      className="cursor-pointer text-xs font-normal sm:text-sm"
                    >
                      {genre.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}

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
              disabled={saving}
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
                  {isEditing ? "Update Novel" : "Create Novel"}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
