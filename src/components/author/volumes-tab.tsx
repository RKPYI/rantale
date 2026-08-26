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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { BookOpen, Layers, Plus, Trash2, Edit, Save } from "lucide-react";
import { useAuthorNovels } from "@/hooks/use-author";
import { volumeService } from "@/services/volumes";
import { novelService } from "@/services/novels";
import { AuthorNovel, VolumeSummary } from "@/types/api";
import { cn, logAndToastError } from "@/lib/utils";
import { toast } from "sonner";

export function VolumesTab({
  selectedNovel,
  novels,
  refetchNovels,
}: {
  selectedNovel: AuthorNovel | null;
  novels: AuthorNovel[] | null;
  refetchNovels: () => void;
}) {
  const [currentNovel, setCurrentNovel] = useState<AuthorNovel | null>(
    selectedNovel,
  );
  const [volumes, setVolumes] = useState<VolumeSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [editingVolumeId, setEditingVolumeId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ title: "", description: "" });
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    volume: VolumeSummary | null;
  }>({ isOpen: false, volume: null });
  const [deletingVolume, setDeletingVolume] = useState(false);
  const [toggleDialogOpen, setToggleDialogOpen] = useState(false);
  const [togglingVolumes, setTogglingVolumes] = useState(false);

  const loadVolumes = async (novel: AuthorNovel) => {
    setLoading(true);
    try {
      const data = await volumeService.getAuthorNovelVolumes(novel.slug);
      setVolumes(data.volumes);
    } catch (error) {
      logAndToastError(error, "Failed to load volumes", "Failed to load volumes");
      setVolumes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!selectedNovel) {
      setCurrentNovel(null);
      setVolumes([]);
      setEditingVolumeId(null);
      return;
    }

    setCurrentNovel(selectedNovel);
    setEditingVolumeId(null);
    setFormData({ title: "", description: "" });

    if (selectedNovel.uses_volumes) {
      void loadVolumes(selectedNovel);
    } else {
      setVolumes([]);
    }
  }, [selectedNovel?.id, selectedNovel?.uses_volumes]);

  const handleSelectNovel = async (novel: AuthorNovel) => {
    setCurrentNovel(novel);
    setEditingVolumeId(null);
    setFormData({ title: "", description: "" });
    if (novel.uses_volumes) {
      await loadVolumes(novel);
    } else {
      setVolumes([]);
    }
  };

  const handleCreateVolume = async () => {
    if (!currentNovel || !formData.title.trim()) return;

    setCreating(true);
    try {
      await volumeService.createVolume(currentNovel.slug, {
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
      });
      toast.success("Volume created successfully");
      setFormData({ title: "", description: "" });
      await loadVolumes(currentNovel);
      refetchNovels();
    } catch (error) {
      logAndToastError(error, "Failed to create volume", "Failed to create volume");
    } finally {
      setCreating(false);
    }
  };

  const handleUpdateVolume = async (volume: VolumeSummary) => {
    if (!currentNovel || !formData.title.trim()) return;

    try {
      await volumeService.updateVolume(currentNovel.slug, volume.id, {
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
      });
      toast.success("Volume updated successfully");
      setEditingVolumeId(null);
      setFormData({ title: "", description: "" });
      await loadVolumes(currentNovel);
    } catch (error) {
      logAndToastError(error, "Failed to update volume", "Failed to update volume");
    }
  };

  const handleDeleteVolume = async () => {
    if (!deleteDialog.volume || !currentNovel) return;

    setDeletingVolume(true);
    try {
      await volumeService.deleteVolume(currentNovel.slug, deleteDialog.volume.id);
      toast.success("Volume deleted successfully");
      setDeleteDialog({ isOpen: false, volume: null });
      await loadVolumes(currentNovel);
      refetchNovels();
    } catch (error) {
      logAndToastError(error, "Failed to delete volume", "Failed to delete volume");
    } finally {
      setDeletingVolume(false);
    }
  };

  const handleToggleVolumeMode = async () => {
    if (!currentNovel) return;

    setTogglingVolumes(true);
    try {
      const nextValue = !currentNovel.uses_volumes;
      await novelService.updateNovel(currentNovel.slug, {
        uses_volumes: nextValue,
      });
      toast.success(
        nextValue
          ? "Volume mode enabled. Existing chapters were moved to Volume 1."
          : "Volume mode disabled. Chapters were renumbered globally.",
      );
      setToggleDialogOpen(false);
      refetchNovels();
      const updatedNovel = { ...currentNovel, uses_volumes: nextValue };
      setCurrentNovel(updatedNovel);
      if (nextValue) {
        await loadVolumes(updatedNovel);
      } else {
        setVolumes([]);
      }
    } catch (error) {
      logAndToastError(
        error,
        "Failed to update volume mode",
        "Failed to update volume mode",
      );
    } finally {
      setTogglingVolumes(false);
    }
  };

  if (!novels || novels.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 py-8 text-center">
          <BookOpen className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
          <p className="text-muted-foreground">Create a novel first to manage volumes.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5" />
            Select Novel
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
            {novels.map((novel) => (
              <button
                key={novel.id}
                type="button"
                className={cn(
                  "rounded-lg border p-3 text-left transition-colors sm:p-4",
                  currentNovel?.id === novel.id
                    ? "border-primary bg-primary/5"
                    : "hover:bg-muted/50",
                )}
                onClick={() => handleSelectNovel(novel)}
              >
                <h4 className="text-sm font-medium break-words sm:text-base">
                  {novel.title}
                </h4>
                <p className="text-muted-foreground text-xs sm:text-sm">
                  {novel.uses_volumes ? "Uses volumes" : "Flat chapters"}
                </p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {currentNovel && (
        <Card>
          <CardHeader>
            <CardTitle className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <span>Volumes — {currentNovel.title}</span>
              <Button
                variant="outline"
                onClick={() => setToggleDialogOpen(true)}
              >
                {currentNovel.uses_volumes
                  ? "Disable Volume Mode"
                  : "Enable Volume Mode"}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {!currentNovel.uses_volumes ? (
              <div className="rounded-lg border border-dashed p-8 text-center">
                <Layers className="text-muted-foreground mx-auto mb-3 h-10 w-10" />
                <h3 className="font-medium">Flat chapter mode</h3>
                <p className="text-muted-foreground mt-2 text-sm">
                  Enable volume mode to organize chapters into volumes. Existing
                  chapters will be placed into Volume 1 automatically.
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-3 rounded-lg border p-4">
                  <h3 className="font-medium">Create Volume</h3>
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="volume-title">Title</Label>
                      <Input
                        id="volume-title"
                        value={formData.title}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            title: e.target.value,
                          }))
                        }
                        placeholder="Volume 2"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="volume-description">Description</Label>
                      <Textarea
                        id="volume-description"
                        value={formData.description}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            description: e.target.value,
                          }))
                        }
                        placeholder="Optional volume description"
                        rows={3}
                      />
                    </div>
                  </div>
                  <Button onClick={handleCreateVolume} disabled={creating}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Volume
                  </Button>
                </div>

                {loading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 2 }).map((_, i) => (
                      <Skeleton key={i} className="h-20 w-full" />
                    ))}
                  </div>
                ) : volumes.length > 0 ? (
                  <div className="space-y-3">
                    {volumes.map((volume) => (
                      <div
                        key={volume.id}
                        className="rounded-lg border p-4"
                      >
                        {editingVolumeId === volume.id ? (
                          <div className="space-y-3">
                            <Input
                              value={formData.title}
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  title: e.target.value,
                                }))
                              }
                            />
                            <Textarea
                              value={formData.description}
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  description: e.target.value,
                                }))
                              }
                              rows={3}
                            />
                            <div className="flex gap-2">
                              <Button onClick={() => handleUpdateVolume(volume)}>
                                <Save className="mr-2 h-4 w-4" />
                                Save
                              </Button>
                              <Button
                                variant="outline"
                                onClick={() => {
                                  setEditingVolumeId(null);
                                  setFormData({ title: "", description: "" });
                                }}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <h4 className="font-medium">
                                {volume.title} (Vol. {volume.volume_number})
                              </h4>
                              {volume.description && (
                                <p className="text-muted-foreground mt-1 text-sm">
                                  {volume.description}
                                </p>
                              )}
                              <p className="text-muted-foreground mt-2 text-xs">
                                {volume.chapters.length} chapter
                                {volume.chapters.length === 1 ? "" : "s"}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setEditingVolumeId(volume.id);
                                  setFormData({
                                    title: volume.title,
                                    description: volume.description ?? "",
                                  });
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-destructive"
                                onClick={() =>
                                  setDeleteDialog({ isOpen: true, volume })
                                }
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed p-8 text-center">
                    <p className="text-muted-foreground text-sm">
                      No volumes yet. Create your first volume above.
                    </p>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      )}

      <DeleteModal
        open={deleteDialog.isOpen}
        onOpenChange={(isOpen) =>
          setDeleteDialog({ isOpen, volume: deleteDialog.volume })
        }
        onConfirm={handleDeleteVolume}
        title="Delete Volume?"
        description={
          deleteDialog.volume
            ? `Delete "${deleteDialog.volume.title}"? This only works if the volume has no chapters.`
            : "Delete this volume?"
        }
        confirmText="Delete Volume"
        isLoading={deletingVolume}
      />

      <AlertDialog open={toggleDialogOpen} onOpenChange={setToggleDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {currentNovel?.uses_volumes
                ? "Disable volume mode?"
                : "Enable volume mode?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {currentNovel?.uses_volumes
                ? "All chapters will be renumbered globally from 1..N and volume groupings will be removed."
                : "All existing chapters will be moved into Volume 1. You can create more volumes afterward."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={togglingVolumes}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleToggleVolumeMode}
              disabled={togglingVolumes}
            >
              {togglingVolumes ? "Updating..." : "Confirm"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
