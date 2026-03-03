"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
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
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  User,
  BookOpen,
  Clock,
  FileText,
  History,
} from "lucide-react";
import { useEditorChapterForReview } from "@/hooks/use-editor";
import { editorService } from "@/services/editor";
import {
  PendingChapter,
  ClaimedChapter,
  ChapterReview as ChapterReviewType,
} from "@/types/api";
import { ChapterStatusBadge } from "./chapter-status-badge";
import { MarkdownRenderer } from "@/components/chapters/markdown-renderer";
import { formatDistanceToNow, format } from "date-fns";
import { formatNumber } from "@/lib/novel-utils";
import { toast } from "sonner";
import { logAndToastError } from "@/lib/utils";

// Accept either PendingChapter or ClaimedChapter
type ReviewableChapter = PendingChapter | ClaimedChapter;

interface ChapterReviewProps {
  chapter: ReviewableChapter;
  onBack: () => void;
  onReviewComplete: () => void;
}

export function ChapterReview({
  chapter,
  onBack,
  onReviewComplete,
}: ChapterReviewProps) {
  const [isApproving, setIsApproving] = useState(false);
  const [isRequestingRevision, setIsRequestingRevision] = useState(false);
  const [approvalNotes, setApprovalNotes] = useState("");
  const [revisionNotes, setRevisionNotes] = useState("");
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [showRevisionDialog, setShowRevisionDialog] = useState(false);

  const {
    data: chapterDetails,
    loading,
    error,
  } = useEditorChapterForReview(chapter.id);

  const handleApprove = async () => {
    setIsApproving(true);
    try {
      await editorService.approveChapter(chapter.id, {
        notes: approvalNotes || undefined,
      });
      const successMessage =
        chapter.status === "pending_update"
          ? "Chapter update approved successfully!"
          : "Chapter approved and published successfully!";
      toast.success(successMessage);
      setShowApprovalDialog(false);
      onReviewComplete();
    } catch (err) {
      logAndToastError(err, "Failed to approve chapter");
    } finally {
      setIsApproving(false);
    }
  };

  const handleRequestRevision = async () => {
    if (!revisionNotes.trim()) {
      toast.error("Please provide revision notes for the author");
      return;
    }

    setIsRequestingRevision(true);
    try {
      await editorService.requestRevision(chapter.id, {
        notes: revisionNotes,
      });
      const successMessage =
        chapter.status === "pending_update"
          ? "Update rejected. Original content remains published."
          : "Revision request sent to the author";
      toast.success(successMessage);
      setShowRevisionDialog(false);
      onReviewComplete();
    } catch (err) {
      logAndToastError(err, "Failed to request revision");
    } finally {
      setIsRequestingRevision(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (error || !chapterDetails) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {error || "Failed to load chapter details"}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Queue
          </Button>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowRevisionDialog(true)}
            className="text-destructive hover:text-destructive"
          >
            <AlertCircle className="mr-2 h-4 w-4" />
            {chapterDetails?.status === "pending_update"
              ? "Reject Update"
              : "Request Revision"}
          </Button>
          <Button onClick={() => setShowApprovalDialog(true)}>
            <CheckCircle className="mr-2 h-4 w-4" />
            {chapterDetails?.status === "pending_update"
              ? "Approve Update"
              : "Approve & Publish"}
          </Button>
        </div>
      </div>

      {/* Chapter Info Card */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-xl">
                Chapter {chapterDetails.chapter_number}: {chapterDetails.title}
              </CardTitle>
              <div className="text-muted-foreground mt-2 flex flex-wrap items-center gap-3 text-sm">
                <span className="flex items-center gap-1">
                  <BookOpen className="h-4 w-4" />
                  {chapterDetails.novel.title}
                </span>
                <span className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  {chapterDetails.novel.author}
                </span>
                <span className="flex items-center gap-1">
                  <FileText className="h-4 w-4" />
                  {formatNumber(chapterDetails.word_count)} words
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  Submitted{" "}
                  {formatDistanceToNow(new Date(chapterDetails.created_at), {
                    addSuffix: true,
                  })}
                </span>
              </div>
            </div>
            <ChapterStatusBadge status={chapterDetails.status} />
          </div>
        </CardHeader>
      </Card>

      {/* Previous Reviews */}
      {chapterDetails.reviews && chapterDetails.reviews.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <History className="h-5 w-5" />
              Previous Reviews
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {chapterDetails.reviews.map((review: ChapterReviewType) => (
                <div
                  key={review.id}
                  className="bg-muted/30 rounded-lg border p-3"
                >
                  <div className="mb-2 flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={
                        review.action === "approved"
                          ? "border-0 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                          : "border-0 bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                      }
                    >
                      {review.action === "approved"
                        ? "Approved"
                        : "Revision Requested"}
                    </Badge>
                    {review.editor && (
                      <span className="text-muted-foreground text-sm">
                        by {review.editor.name}
                      </span>
                    )}
                    <span className="text-muted-foreground text-sm">
                      {format(new Date(review.created_at), "MMM d, yyyy")}
                    </span>
                  </div>
                  {review.notes && (
                    <p className="text-muted-foreground text-sm whitespace-pre-wrap">
                      {review.notes}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pending Update Notice */}
      {chapterDetails.status === "pending_update" && (
        <Alert className="border-blue-200 bg-blue-50/50 dark:border-blue-900/50 dark:bg-blue-950/20">
          <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <AlertDescription className="text-blue-800 dark:text-blue-300">
            <strong>This is an update to a published chapter.</strong> The
            original content is still visible to readers. Review the pending
            changes below.
          </AlertDescription>
        </Alert>
      )}

      {/* Chapter Content - Show pending content for pending_update, regular content otherwise */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {chapterDetails.status === "pending_update" ? (
              <>
                <span>Pending Changes</span>
                <Badge
                  variant="outline"
                  className="border-0 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                >
                  Update
                </Badge>
              </>
            ) : (
              "Chapter Content"
            )}
          </CardTitle>
          {chapterDetails.status === "pending_update" &&
            chapterDetails.pending_title && (
              <p className="text-muted-foreground text-sm">
                <strong>New Title:</strong> {chapterDetails.pending_title}
                {chapterDetails.pending_title !== chapterDetails.title && (
                  <span className="ml-2 text-xs">
                    (was: {chapterDetails.title})
                  </span>
                )}
              </p>
            )}
        </CardHeader>
        <CardContent>
          <MarkdownRenderer
            content={
              chapterDetails.status === "pending_update" &&
              chapterDetails.pending_content
                ? chapterDetails.pending_content
                : chapterDetails.content
            }
          />
        </CardContent>
      </Card>

      {/* Original Content (for pending_update only) */}
      {chapterDetails.status === "pending_update" && (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="text-muted-foreground flex items-center gap-2">
              <span>Original Published Content</span>
              <Badge
                variant="outline"
                className="border-0 bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
              >
                Current
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <MarkdownRenderer
              content={chapterDetails.content}
              className="opacity-75"
            />
          </CardContent>
        </Card>
      )}

      {/* Approve Dialog */}
      <Dialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {chapterDetails.status === "pending_update"
                ? "Approve Update"
                : "Approve Chapter"}
            </DialogTitle>
            <DialogDescription>
              {chapterDetails.status === "pending_update"
                ? "This will apply the pending changes to the published chapter."
                : "This will publish the chapter and make it visible to readers."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="approval-notes">Notes (optional)</Label>
              <Textarea
                id="approval-notes"
                placeholder="Add any notes for the author (optional)..."
                value={approvalNotes}
                onChange={(e) => setApprovalNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowApprovalDialog(false)}
              disabled={isApproving}
            >
              Cancel
            </Button>
            <Button onClick={handleApprove} disabled={isApproving}>
              {isApproving ? (
                <>
                  <span className="mr-2 animate-spin">⏳</span>
                  Approving...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  {chapterDetails.status === "pending_update"
                    ? "Approve Update"
                    : "Approve & Publish"}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Request Revision Dialog */}
      <Dialog open={showRevisionDialog} onOpenChange={setShowRevisionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {chapterDetails.status === "pending_update"
                ? "Reject Update"
                : "Request Revision"}
            </DialogTitle>
            <DialogDescription>
              {chapterDetails.status === "pending_update"
                ? "This will reject the pending changes. The original content will remain published."
                : "The author will receive your feedback and can resubmit the chapter after making changes."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="revision-notes">
                Revision Notes <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="revision-notes"
                placeholder="Explain what needs to be changed..."
                value={revisionNotes}
                onChange={(e) => setRevisionNotes(e.target.value)}
                rows={5}
                required
              />
              <p className="text-muted-foreground text-xs">
                Be specific about what needs to be improved or corrected.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowRevisionDialog(false)}
              disabled={isRequestingRevision}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRequestRevision}
              disabled={isRequestingRevision || !revisionNotes.trim()}
            >
              {isRequestingRevision ? (
                <>
                  <span className="mr-2 animate-spin">⏳</span>
                  Sending...
                </>
              ) : (
                <>
                  <AlertCircle className="mr-2 h-4 w-4" />
                  {chapterDetails.status === "pending_update"
                    ? "Reject Update"
                    : "Request Revision"}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
