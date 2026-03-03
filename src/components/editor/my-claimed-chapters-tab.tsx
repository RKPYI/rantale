"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Lock,
  Eye,
  Clock,
  User,
  BookOpen,
  Unlock,
  AlertTriangle,
} from "lucide-react";
import { useEditorMyClaimedChapters } from "@/hooks/use-editor";
import { editorService } from "@/services/editor";
import { ClaimedChapter } from "@/types/api";
import { ChapterStatusBadge } from "./chapter-status-badge";
import { formatDistanceToNow } from "date-fns";
import { formatNumber } from "@/lib/novel-utils";
import { toast } from "sonner";
import { logAndToastError } from "@/lib/utils";

interface MyClaimedChaptersTabProps {
  onReviewChapter: (chapter: ClaimedChapter) => void;
}

function ClaimExpiryBadge({ hoursRemaining }: { hoursRemaining: number }) {
  const isUrgent = hoursRemaining <= 4;
  const isWarning = hoursRemaining <= 8;

  return (
    <Badge
      variant="outline"
      className={
        isUrgent
          ? "border-0 bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
          : isWarning
            ? "border-0 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
            : "border-0 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
      }
    >
      <Clock className="mr-1 h-3 w-3" />
      {hoursRemaining < 1
        ? "Expires in < 1h"
        : `${Math.round(hoursRemaining)}h remaining`}
    </Badge>
  );
}

export function MyClaimedChaptersTab({
  onReviewChapter,
}: MyClaimedChaptersTabProps) {
  const {
    data: claimedChapters,
    loading,
    refetch,
  } = useEditorMyClaimedChapters();
  const [releasingId, setReleasingId] = useState<number | null>(null);
  const [showReleaseDialog, setShowReleaseDialog] = useState(false);
  const [chapterToRelease, setChapterToRelease] =
    useState<ClaimedChapter | null>(null);

  const handleReleaseClick = (chapter: ClaimedChapter) => {
    setChapterToRelease(chapter);
    setShowReleaseDialog(true);
  };

  const handleConfirmRelease = async () => {
    if (!chapterToRelease) return;

    setReleasingId(chapterToRelease.id);
    try {
      await editorService.unclaimChapter(chapterToRelease.id);
      toast.success("Chapter released successfully");
      setShowReleaseDialog(false);
      setChapterToRelease(null);
      await refetch();
    } catch (err) {
      logAndToastError(err, "Failed to release chapter");
    } finally {
      setReleasingId(null);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            My Claimed Chapters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const chapters = claimedChapters || [];

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              My Claimed Chapters
            </span>
            {chapters.length > 0 && (
              <Badge variant="secondary">{chapters.length} claimed</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {chapters.length === 0 ? (
            <div className="py-12 text-center">
              <Unlock className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
              <h3 className="text-lg font-medium">No Claimed Chapters</h3>
              <p className="text-muted-foreground">
                Claim a chapter from the Pending Review queue to start
                reviewing.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {chapters.map((chapter) => (
                <div
                  key={chapter.id}
                  className="hover:bg-muted/50 flex flex-col gap-4 rounded-lg border p-4 transition-colors"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <BookOpen className="text-muted-foreground h-4 w-4 flex-shrink-0" />
                        <span className="text-muted-foreground truncate text-sm">
                          {chapter.novel.title}
                        </span>
                        <ChapterStatusBadge status={chapter.status} />
                      </div>
                      <h4 className="font-medium">
                        Chapter {chapter.chapter_number}: {chapter.title}
                      </h4>
                      <div className="text-muted-foreground flex flex-wrap items-center gap-3 text-sm">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {chapter.novel.author}
                        </span>
                        <span>{formatNumber(chapter.word_count)} words</span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Submitted{" "}
                          {formatDistanceToNow(new Date(chapter.created_at), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <ClaimExpiryBadge
                        hoursRemaining={chapter.claim_hours_remaining}
                      />
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleReleaseClick(chapter)}
                          disabled={releasingId === chapter.id}
                        >
                          <Unlock className="mr-2 h-4 w-4" />
                          Release
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => onReviewChapter(chapter)}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          Review
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Release Confirmation Dialog */}
      <Dialog open={showReleaseDialog} onOpenChange={setShowReleaseDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              Release Chapter
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to release this chapter? It will be
              available for other editors to claim.
            </DialogDescription>
          </DialogHeader>
          {chapterToRelease && (
            <div className="bg-muted/30 rounded-lg border p-3">
              <p className="font-medium">
                Chapter {chapterToRelease.chapter_number}:{" "}
                {chapterToRelease.title}
              </p>
              <p className="text-muted-foreground text-sm">
                {chapterToRelease.novel.title} by{" "}
                {chapterToRelease.novel.author}
              </p>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowReleaseDialog(false)}
              disabled={releasingId !== null}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmRelease}
              disabled={releasingId !== null}
            >
              {releasingId !== null ? (
                <>
                  <span className="mr-2 animate-spin">⏳</span>
                  Releasing...
                </>
              ) : (
                <>
                  <Unlock className="mr-2 h-4 w-4" />
                  Release Chapter
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
