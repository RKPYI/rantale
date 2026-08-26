"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowRightLeft } from "lucide-react";
import { chapterService } from "@/services/chapters";
import { volumeService } from "@/services/volumes";
import { AuthorChapterWithStatus, VolumeSummary } from "@/types/api";
import { getChapterLabel } from "@/lib/chapter-url";
import { logAndToastError } from "@/lib/utils";
import { toast } from "sonner";

interface MoveChapterDialogProps {
  isOpen: boolean;
  onClose: () => void;
  novelSlug: string;
  chapters: AuthorChapterWithStatus[];
  onSuccess: () => void | Promise<void>;
}

export function MoveChapterDialog({
  isOpen,
  onClose,
  novelSlug,
  chapters,
  onSuccess,
}: MoveChapterDialogProps) {
  const [volumes, setVolumes] = useState<VolumeSummary[]>([]);
  const [loadingVolumes, setLoadingVolumes] = useState(false);
  const [targetVolumeId, setTargetVolumeId] = useState<string>("");
  const [targetChapterNumber, setTargetChapterNumber] = useState<string>("");
  const [moving, setMoving] = useState(false);

  const isBulkMove = chapters.length > 1;
  const sourceVolumeIds = useMemo(
    () => new Set(chapters.map((chapter) => chapter.volume_id).filter(Boolean)),
    [chapters],
  );

  useEffect(() => {
    if (!isOpen || !novelSlug) return;

    setLoadingVolumes(true);
    volumeService
      .getAuthorNovelVolumes(novelSlug)
      .then((data) => setVolumes(data.volumes))
      .catch(() => setVolumes([]))
      .finally(() => setLoadingVolumes(false));
  }, [isOpen, novelSlug]);

  const availableVolumes = useMemo(() => {
    if (sourceVolumeIds.size === 1 && chapters.length > 0) {
      const sourceId = chapters[0].volume_id;
      return volumes.filter((volume) => volume.id !== sourceId);
    }

    return volumes;
  }, [volumes, chapters, sourceVolumeIds]);

  useEffect(() => {
    if (!isOpen || chapters.length === 0) return;

    setTargetVolumeId(
      availableVolumes[0] ? String(availableVolumes[0].id) : "",
    );
    setTargetChapterNumber("");
  }, [isOpen, chapters, availableVolumes]);

  const selectedVolume = useMemo(
    () => volumes.find((volume) => volume.id === Number(targetVolumeId)),
    [volumes, targetVolumeId],
  );

  const handleMove = async () => {
    if (chapters.length === 0 || !targetVolumeId) return;

    setMoving(true);
    try {
      const position = targetChapterNumber.trim()
        ? parseInt(targetChapterNumber, 10)
        : undefined;
      const payload = {
        volume_id: parseInt(targetVolumeId, 10),
        chapter_number: position,
      };

      if (isBulkMove) {
        const result = await chapterService.bulkMoveChaptersToVolume(
          novelSlug,
          chapters.map((chapter) => chapter.id),
          payload,
        );
        toast.success(
          `Successfully moved ${result.moved_count} chapter(s) and renumbered volumes`,
        );
      } else {
        await chapterService.moveChapterToVolume(
          novelSlug,
          chapters[0].id,
          payload,
        );
        toast.success("Chapter moved and volumes renumbered successfully");
      }

      await onSuccess();
      onClose();
    } catch (error) {
      logAndToastError(
        error,
        "Failed to move chapter",
        isBulkMove
          ? "Failed to move chapters. Please try again."
          : "Failed to move chapter. Please try again.",
      );
    } finally {
      setMoving(false);
    }
  };

  const description = useMemo(() => {
    if (chapters.length === 0) {
      return "Select chapters to move.";
    }

    if (isBulkMove) {
      return `Move ${chapters.length} selected chapters to another volume. Their relative order will be preserved and chapters in affected volumes will be renumbered automatically.`;
    }

    const chapter = chapters[0];
    return `Move "${getChapterLabel(chapter, true)}: ${chapter.title}" to another volume. Chapters in both volumes will be renumbered automatically.`;
  }, [chapters, isBulkMove]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowRightLeft className="h-4 w-4" />
            {isBulkMove ? "Move Chapters" : "Move Chapter"}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {isBulkMove && (
            <div className="bg-muted/50 max-h-32 space-y-1 overflow-y-auto rounded-md border p-3">
              {chapters.map((chapter) => (
                <p key={chapter.id} className="text-sm">
                  {getChapterLabel(chapter, true)}: {chapter.title}
                </p>
              ))}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="target-volume">Target volume</Label>
            <Select
              value={targetVolumeId}
              onValueChange={setTargetVolumeId}
              disabled={loadingVolumes || availableVolumes.length === 0}
            >
              <SelectTrigger id="target-volume">
                <SelectValue placeholder="Select target volume" />
              </SelectTrigger>
              <SelectContent>
                {availableVolumes.map((volume) => (
                  <SelectItem key={volume.id} value={String(volume.id)}>
                    {volume.title} (Vol. {volume.volume_number})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="target-position">
              Position in target volume{" "}
              <span className="text-muted-foreground font-normal">(optional)</span>
            </Label>
            <Input
              id="target-position"
              type="number"
              min={1}
              value={targetChapterNumber}
              onChange={(e) => setTargetChapterNumber(e.target.value)}
              placeholder={
                selectedVolume
                  ? isBulkMove
                    ? `Append to end (${selectedVolume.chapters.length + 1})`
                    : `Append to end (${selectedVolume.chapters.length + 1})`
                  : "Append to end"
              }
            />
            <p className="text-muted-foreground text-xs">
              {isBulkMove
                ? "Leave empty to append the selected chapters at the end. Existing chapters at and after this position will shift down."
                : "Leave empty to append at the end. Existing chapters at and after this position will shift down."}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={moving}>
            Cancel
          </Button>
          <Button
            onClick={handleMove}
            disabled={moving || !targetVolumeId || loadingVolumes}
          >
            {moving
              ? "Moving..."
              : isBulkMove
                ? `Move ${chapters.length} Chapters`
                : "Move Chapter"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
