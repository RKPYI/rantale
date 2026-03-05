"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { DeleteModal } from "@/components/ui/delete-modal";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Palette,
  Plus,
  Edit,
  Trash2,
  Search,
  BookOpen,
  Loader2,
  Tag,
} from "lucide-react";
import { useAdminGenres } from "@/hooks/use-admin";
import { adminService } from "@/services/admin";
import { AdminGenre } from "@/types/api";
import { toast } from "sonner";

const DEFAULT_COLOR = "#dc2626";

export function GenresTab() {
  const { data: genres, loading, error, refetch } = useAdminGenres();
  const [searchQuery, setSearchQuery] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingGenre, setEditingGenre] = useState<AdminGenre | null>(null);
  const [deletingGenre, setDeletingGenre] = useState<AdminGenre | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filteredGenres = genres?.filter((genre) =>
    genre.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleDelete = async () => {
    if (!deletingGenre) return;
    setIsDeleting(true);
    try {
      await adminService.deleteGenre(deletingGenre.id);
      toast.success(`Genre "${deletingGenre.name}" deleted successfully`);
      setDeletingGenre(null);
      refetch();
    } catch (err: unknown) {
      const error = err as {
        response?: { data?: { message?: string; novels_count?: number } };
      };
      if (error.response?.data?.novels_count) {
        toast.error(
          error.response.data.message ||
            "Cannot delete genre with attached novels",
        );
      } else {
        toast.error("Failed to delete genre");
      }
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-9 w-32" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-destructive">Failed to load genres: {error}</p>
          <Button variant="outline" onClick={refetch} className="mt-4">
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold">Genre Management</h2>
          <p className="text-muted-foreground text-sm">
            Create, edit, and manage book genres ({genres?.length || 0} total)
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Genre
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
        <Input
          placeholder="Search genres..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Genre Grid */}
      {!filteredGenres || filteredGenres.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Tag className="text-muted-foreground mb-4 h-12 w-12" />
            <p className="text-lg font-medium">
              {searchQuery ? "No genres match your search" : "No genres yet"}
            </p>
            <p className="text-muted-foreground text-sm">
              {searchQuery
                ? "Try a different search term"
                : "Create your first genre to get started"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredGenres.map((genre) => (
            <Card
              key={genre.id}
              className="group relative overflow-hidden transition-shadow hover:shadow-md"
            >
              {/* Color bar at top */}
              <div
                className="h-2 w-full"
                style={{ backgroundColor: genre.color }}
              />
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-4 w-4 flex-shrink-0 rounded-full border"
                      style={{ backgroundColor: genre.color }}
                    />
                    <CardTitle className="text-base">{genre.name}</CardTitle>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setEditingGenre(genre)}
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive h-8 w-8"
                      onClick={() => setDeletingGenre(genre)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 pt-0">
                <p className="text-muted-foreground line-clamp-2 text-sm">
                  {genre.description || "No description"}
                </p>
                <div className="flex items-center justify-between text-sm">
                  <div className="text-muted-foreground flex items-center gap-1">
                    <BookOpen className="h-3.5 w-3.5" />
                    <span>
                      {genre.novels_count}{" "}
                      {genre.novels_count === 1 ? "book" : "books"}
                    </span>
                  </div>
                  <span className="text-muted-foreground font-mono text-xs">
                    {genre.slug}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Dialog */}
      <GenreFormDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={refetch}
        mode="create"
      />

      {/* Edit Dialog */}
      <GenreFormDialog
        open={!!editingGenre}
        onOpenChange={(open) => !open && setEditingGenre(null)}
        onSuccess={refetch}
        mode="edit"
        genre={editingGenre}
      />

      {/* Delete Confirmation */}
      <DeleteModal
        open={!!deletingGenre}
        onOpenChange={(open) => !open && setDeletingGenre(null)}
        onConfirm={handleDelete}
        title="Delete Genre?"
        description={
          deletingGenre
            ? deletingGenre.novels_count > 0
              ? `"${deletingGenre.name}" has ${deletingGenre.novels_count} book(s) attached. You must remove all books from this genre before deleting it.`
              : `This will permanently delete the genre "${deletingGenre.name}". This action cannot be undone.`
            : ""
        }
        confirmText="Delete Genre"
        isLoading={isDeleting}
      />
    </div>
  );
}

// Reusable form dialog for create/edit
function GenreFormDialog({
  open,
  onOpenChange,
  onSuccess,
  mode,
  genre,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  mode: "create" | "edit";
  genre?: AdminGenre | null;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState(DEFAULT_COLOR);
  const [submitting, setSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Populate form when dialog opens
  useEffect(() => {
    if (open) {
      if (mode === "edit" && genre) {
        setName(genre.name);
        setDescription(genre.description || "");
        setColor(genre.color);
      } else {
        setName("");
        setDescription("");
        setColor(DEFAULT_COLOR);
      }
      setValidationErrors([]);
    }
  }, [open, genre, mode]);

  const handleSubmit = async () => {
    const errors: string[] = [];
    if (!name.trim()) errors.push("Name is required");
    if (name.length > 255) errors.push("Name must be 255 characters or less");
    if (description.length > 1000)
      errors.push("Description must be 1000 characters or less");
    if (color && !/^#[0-9A-Fa-f]{6}$/.test(color))
      errors.push("Color must be a valid hex code (e.g. #dc2626)");

    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    setSubmitting(true);
    setValidationErrors([]);
    try {
      if (mode === "create") {
        await adminService.createGenre({
          name: name.trim(),
          description: description.trim() || undefined,
          color: color || undefined,
        });
        toast.success(`Genre "${name.trim()}" created successfully`);
      } else if (genre) {
        await adminService.updateGenre(genre.id, {
          name: name.trim(),
          description: description.trim() || undefined,
          color,
        });
        toast.success(`Genre "${name.trim()}" updated successfully`);
      }
      onOpenChange(false);
      onSuccess();
    } catch (err: unknown) {
      const error = err as {
        response?: {
          data?: { errors?: Record<string, string[]>; message?: string };
        };
      };
      if (error.response?.data?.errors) {
        const msgs = Object.values(error.response.data.errors).flat();
        setValidationErrors(msgs);
      } else {
        toast.error(error.response?.data?.message || `Failed to ${mode} genre`);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            {mode === "create" ? "Create Genre" : "Edit Genre"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {validationErrors.length > 0 && (
            <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-400">
              <ul className="list-inside list-disc space-y-1">
                {validationErrors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="genre-name">Name *</Label>
            <Input
              id="genre-name"
              placeholder="e.g. Fantasy, Sci-Fi, Romance..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={255}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="genre-description">Description</Label>
            <Textarea
              id="genre-description"
              placeholder="Brief description of this genre..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              maxLength={1000}
            />
            <p className="text-muted-foreground text-right text-xs">
              {description.length}/1000
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="genre-color">Color</Label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                id="genre-color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="h-10 w-14 cursor-pointer rounded border p-1"
              />
              <Input
                value={color}
                onChange={(e) => setColor(e.target.value)}
                placeholder="#dc2626"
                maxLength={7}
                className="font-mono"
              />
              <div
                className="h-10 w-10 flex-shrink-0 rounded-md border"
                style={{ backgroundColor: color }}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={submitting || !name.trim()}>
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {mode === "create" ? "Create Genre" : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
