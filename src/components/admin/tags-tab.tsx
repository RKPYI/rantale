"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { DeleteModal } from "@/components/ui/delete-modal";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
  Link2,
  Users,
  Check,
} from "lucide-react";
import { useAdminTags, useEditorialGroups } from "@/hooks/use-admin";
import { adminService } from "@/services/admin";
import { AdminTag, EditorialGroup } from "@/types/api";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";

const DEFAULT_COLOR = "#3b82f6";

export function TagsTab() {
  const { data: tags, loading, error, refetch } = useAdminTags();
  const [searchQuery, setSearchQuery] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<AdminTag | null>(null);
  const [deletingTag, setDeletingTag] = useState<AdminTag | null>(null);
  const [assigningTag, setAssigningTag] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const filteredTags = tags?.filter((tag) =>
    tag.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleDelete = async () => {
    if (!deletingTag) return;
    setIsDeleting(true);
    try {
      await adminService.deleteTag(deletingTag.id);
      toast.success(`Tag "${deletingTag.name}" deleted successfully`);
      setDeletingTag(null);
      refetch();
    } catch (err: unknown) {
      const error = err as {
        response?: { data?: { message?: string; novels_count?: number } };
        error?: string;
      };
      if (
        error.response?.data?.novels_count ||
        error.error?.includes("attached")
      ) {
        toast.error(
          error.response?.data?.message ||
            error.error ||
            "Cannot delete tag with attached novels",
        );
      } else {
        toast.error(
          error.response?.data?.message ||
            error.error ||
            "Failed to delete tag",
        );
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
          <p className="text-destructive">Failed to load tags: {error}</p>
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
          <h2 className="text-xl font-semibold">Tag Management</h2>
          <p className="text-muted-foreground text-sm">
            Create tags and assign them to editorial groups ({tags?.length || 0}{" "}
            total)
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setAssigningTag(true)}>
            <Link2 className="mr-2 h-4 w-4" />
            Assign to Group
          </Button>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Tag
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
        <Input
          placeholder="Search tags..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Tag Grid */}
      {!filteredTags || filteredTags.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Tag className="text-muted-foreground mb-4 h-12 w-12" />
            <p className="text-lg font-medium">
              {searchQuery ? "No tags match your search" : "No tags yet"}
            </p>
            <p className="text-muted-foreground text-sm">
              {searchQuery
                ? "Try a different search term"
                : "Create your first tag to get started"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredTags.map((tag) => (
            <Card
              key={tag.id}
              className="group relative overflow-hidden transition-shadow hover:shadow-md"
            >
              {/* Color bar at top */}
              <div
                className="h-2 w-full"
                style={{ backgroundColor: tag.color }}
              />
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-4 w-4 flex-shrink-0 rounded-full border"
                      style={{ backgroundColor: tag.color }}
                    />
                    <CardTitle className="text-base">{tag.name}</CardTitle>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setEditingTag(tag)}
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive h-8 w-8"
                      onClick={() => setDeletingTag(tag)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 pt-0">
                <p className="text-muted-foreground line-clamp-2 text-sm">
                  {tag.description || "No description"}
                </p>
                <div className="flex items-center justify-between text-sm">
                  <div className="text-muted-foreground flex items-center gap-1">
                    <BookOpen className="h-3.5 w-3.5" />
                    <span>
                      {tag.novels_count}{" "}
                      {tag.novels_count === 1 ? "novel" : "novels"}
                    </span>
                  </div>
                  <span className="text-muted-foreground font-mono text-xs">
                    {tag.slug}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Dialog */}
      <TagFormDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={refetch}
        mode="create"
      />

      {/* Edit Dialog */}
      <TagFormDialog
        open={!!editingTag}
        onOpenChange={(open) => !open && setEditingTag(null)}
        onSuccess={refetch}
        mode="edit"
        tag={editingTag}
      />

      {/* Delete Confirmation */}
      <DeleteModal
        open={!!deletingTag}
        onOpenChange={(open) => !open && setDeletingTag(null)}
        onConfirm={handleDelete}
        title="Delete Tag?"
        description={
          deletingTag
            ? deletingTag.novels_count > 0
              ? `"${deletingTag.name}" is attached to ${deletingTag.novels_count} novel(s). Remove it from all editorial groups first before deleting.`
              : `This will permanently delete the tag "${deletingTag.name}". This action cannot be undone.`
            : ""
        }
        confirmText="Delete Tag"
        isLoading={isDeleting}
      />

      {/* Assign Tags to Group Dialog */}
      <AssignTagsDialog
        open={assigningTag}
        onOpenChange={setAssigningTag}
        tags={tags || []}
        onSuccess={refetch}
      />
    </div>
  );
}

// ─── Tag Form Dialog (Create / Edit) ─────────────────────────────────

function TagFormDialog({
  open,
  onOpenChange,
  onSuccess,
  mode,
  tag,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  mode: "create" | "edit";
  tag?: AdminTag | null;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState(DEFAULT_COLOR);
  const [submitting, setSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  useEffect(() => {
    if (open) {
      if (mode === "edit" && tag) {
        setName(tag.name);
        setDescription(tag.description || "");
        setColor(tag.color);
      } else {
        setName("");
        setDescription("");
        setColor(DEFAULT_COLOR);
      }
      setValidationErrors([]);
    }
  }, [open, tag, mode]);

  const handleSubmit = async () => {
    const errors: string[] = [];
    if (!name.trim()) errors.push("Name is required");
    if (name.length > 255) errors.push("Name must be 255 characters or less");
    if (description.length > 1000)
      errors.push("Description must be 1000 characters or less");
    if (color && !/^#[0-9A-Fa-f]{6}$/.test(color))
      errors.push("Color must be a valid hex code (e.g. #3b82f6)");

    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    setSubmitting(true);
    setValidationErrors([]);
    try {
      if (mode === "create") {
        await adminService.createTag({
          name: name.trim(),
          description: description.trim() || undefined,
          color: color || undefined,
        });
        toast.success(`Tag "${name.trim()}" created successfully`);
      } else if (tag) {
        await adminService.updateTag(tag.id, {
          name: name.trim(),
          description: description.trim() || undefined,
          color,
        });
        toast.success(`Tag "${name.trim()}" updated successfully`);
      }
      onOpenChange(false);
      onSuccess();
    } catch (err: unknown) {
      const error = err as {
        response?: {
          data?: { errors?: Record<string, string[]>; message?: string };
        };
        details?: Record<string, string[]>;
        error?: string;
      };
      if (error.response?.data?.errors) {
        const msgs = Object.values(error.response.data.errors).flat();
        setValidationErrors(msgs);
      } else if (error.details) {
        const msgs = Object.values(error.details).flat();
        setValidationErrors(msgs);
      } else {
        toast.error(
          error.response?.data?.message ||
            error.error ||
            `Failed to ${mode} tag`,
        );
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
            <Tag className="h-5 w-5" />
            {mode === "create" ? "Create Tag" : "Edit Tag"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Tags are automatically applied to novels via editorial groups."
              : "Update the tag details. The slug will regenerate if the name changes."}
          </DialogDescription>
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
            <Label htmlFor="tag-name">Name *</Label>
            <Input
              id="tag-name"
              placeholder="e.g. Fantasy Team, Priority Review..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={255}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tag-description">Description</Label>
            <Textarea
              id="tag-description"
              placeholder="Brief description of this tag..."
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
            <Label htmlFor="tag-color">Color</Label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                id="tag-color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="h-10 w-14 cursor-pointer rounded border p-1"
              />
              <Input
                value={color}
                onChange={(e) => setColor(e.target.value)}
                placeholder="#3b82f6"
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
            {mode === "create" ? "Create Tag" : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Assign Tags to Editorial Group Dialog ────────────────────────────

function AssignTagsDialog({
  open,
  onOpenChange,
  tags,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tags: AdminTag[];
  onSuccess: () => void;
}) {
  const {
    data: groups,
    loading: groupsLoading,
    refetch: refetchGroups,
  } = useEditorialGroups();
  const [selectedGroup, setSelectedGroup] = useState<EditorialGroup | null>(
    null,
  );
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      setSelectedGroup(null);
      setSelectedTagIds([]);
      setSearchQuery("");
      refetchGroups();
    }
  }, [open]);

  const handleSelectGroup = (group: EditorialGroup) => {
    setSelectedGroup(group);
    // Pre-populate with the group's currently assigned tags
    setSelectedTagIds(group.tags?.map((t) => t.id) ?? []);
  };

  const toggleTag = (tagId: number) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId],
    );
  };

  const handleSubmit = async () => {
    if (!selectedGroup) return;
    setSubmitting(true);
    try {
      const result = await adminService.syncGroupTags(selectedGroup.id, {
        tag_ids: selectedTagIds,
      });
      toast.success(result.message);
      onOpenChange(false);
      onSuccess();
    } catch (err: unknown) {
      const error = err as {
        error?: string;
        response?: { data?: { message?: string } };
      };
      toast.error(
        error.error ||
          error.response?.data?.message ||
          "Failed to sync tags to group",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const filteredGroups = groups?.filter((g) =>
    g.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5" />
            Assign Tags to Editorial Group
          </DialogTitle>
          <DialogDescription>
            Select an editorial group, then choose which tags to assign. This
            replaces the group&apos;s current tags and syncs to all novels by
            authors in the group.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Step 1: Select Group */}
          {!selectedGroup ? (
            <div className="space-y-3">
              <Label>Select Editorial Group</Label>
              {groupsLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full rounded-md" />
                  ))}
                </div>
              ) : !filteredGroups || filteredGroups.length === 0 ? (
                <div className="text-muted-foreground py-6 text-center text-sm">
                  <Users className="mx-auto mb-2 h-8 w-8 opacity-50" />
                  <p>No editorial groups found</p>
                  <p className="text-xs">
                    Create an editorial group first in the Editorial Groups tab
                  </p>
                </div>
              ) : (
                <>
                  {filteredGroups.length > 5 && (
                    <div className="relative">
                      <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                      <Input
                        placeholder="Search groups..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                  )}
                  <div className="max-h-60 space-y-2 overflow-y-auto">
                    {filteredGroups.map((group) => (
                      <button
                        key={group.id}
                        onClick={() => handleSelectGroup(group)}
                        className="hover:bg-muted/50 flex w-full items-center justify-between rounded-md border p-3 text-left transition-colors"
                      >
                        <div>
                          <p className="text-sm font-medium">{group.name}</p>
                          <p className="text-muted-foreground text-xs">
                            {group.member_count} member
                            {group.member_count !== 1 ? "s" : ""}
                            {group.description ? ` · ${group.description}` : ""}
                          </p>
                        </div>
                        <Badge
                          variant={group.is_active ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {group.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          ) : (
            /* Step 2: Select Tags */
            <div className="space-y-3">
              {/* Selected Group Header */}
              <div className="flex items-center justify-between">
                <div>
                  <Label>Group</Label>
                  <p className="text-sm font-medium">{selectedGroup.name}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedGroup(null)}
                >
                  Change
                </Button>
              </div>

              <div className="border-t pt-3">
                <Label className="mb-2 block">
                  Select Tags ({selectedTagIds.length} selected)
                </Label>
                {tags.length === 0 ? (
                  <div className="text-muted-foreground py-4 text-center text-sm">
                    <Tag className="mx-auto mb-2 h-8 w-8 opacity-50" />
                    <p>No tags available</p>
                    <p className="text-xs">Create some tags first</p>
                  </div>
                ) : (
                  <div className="max-h-60 space-y-1 overflow-y-auto">
                    {tags.map((tag) => {
                      const isSelected = selectedTagIds.includes(tag.id);
                      return (
                        <div
                          key={tag.id}
                          onClick={() => toggleTag(tag.id)}
                          role="checkbox"
                          aria-checked={isSelected}
                          tabIndex={0}
                          onKeyDown={(e) =>
                            (e.key === " " || e.key === "Enter") &&
                            toggleTag(tag.id)
                          }
                          className={`flex w-full cursor-pointer items-center gap-3 rounded-md border p-3 text-left transition-colors ${
                            isSelected
                              ? "border-primary bg-primary/5"
                              : "hover:bg-muted/50"
                          }`}
                        >
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => toggleTag(tag.id)}
                            className="pointer-events-none"
                          />
                          <div
                            className="h-3.5 w-3.5 flex-shrink-0 rounded-full border"
                            style={{ backgroundColor: tag.color }}
                          />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium">
                              {tag.name}
                            </p>
                            {tag.description && (
                              <p className="text-muted-foreground truncate text-xs">
                                {tag.description}
                              </p>
                            )}
                          </div>
                          <span className="text-muted-foreground flex-shrink-0 text-xs">
                            {tag.novels_count} novel
                            {tag.novels_count !== 1 ? "s" : ""}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {selectedTagIds.length === 0 && (
                <p className="text-muted-foreground text-xs">
                  Submitting with no tags selected will remove all tags from
                  this group&apos;s novels.
                </p>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            Cancel
          </Button>
          {selectedGroup && (
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Check className="mr-2 h-4 w-4" />
              Sync {selectedTagIds.length} Tag
              {selectedTagIds.length !== 1 ? "s" : ""}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
