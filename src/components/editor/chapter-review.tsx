"use client";

import { useState, useEffect } from "react";
import {
  ArrowLeft,
  CheckCircle,
  RotateCcw,
  Loader2,
  FileText,
  Clock,
  Unlock,
  AlertTriangle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { editorService } from "@/services/editor";
import { ChapterDetail } from "@/types/api";
import { logAndToastError } from "@/lib/error-utils";
import { toast } from "sonner";
import { ChapterStatusBadge } from "./chapter-status-badge";

interface ChapterReviewProps {
  chapterId: number;
  onBack: () => void;
  onReviewComplete: () => void;
}

export function ChapterReview({
  chapterId,
  onBack,
  onReviewComplete,
}: ChapterReviewProps) {
  const [chapter, setChapter] = useState<ChapterDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [action, setAction] = useState<"approve" | "revision" | null>(null);
  const [unclaiming, setUnclaiming] = useState(false);

  useEffect(() => {
    const fetchChapter = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await editorService.getChapterDetail(chapterId);
        setChapter(data);
      } catch (err) {
        const message =
          err && typeof err === "object" && "message" in err
            ? (err as { message: string }).message
            : "Failed to load chapter. You may need to claim it first.";
        setError(message);
      } finally {
        setLoading(false);
      }
    };
    fetchChapter();
  }, [chapterId]);

  const handleApprove = async () => {
    setAction("approve");
    setSubmitting(true);
    try {
      await editorService.approveChapter(chapterId, notes.trim() || undefined);
      toast.success("Chapter approved and published!");
      onReviewComplete();
    } catch (err) {
      logAndToastError(err, "Failed to approve chapter");
    } finally {
      setSubmitting(false);
      setAction(null);
    }
  };

  const handleRequestRevision = async () => {
    if (!notes.trim()) {
      toast.error("Please provide revision notes for the student.");
      return;
    }
    setAction("revision");
    setSubmitting(true);
    try {
      await editorService.requestRevision(chapterId, notes.trim());
      toast.success("Revision requested. The student has been notified.");
      onReviewComplete();
    } catch (err) {
      logAndToastError(err, "Failed to request revision");
    } finally {
      setSubmitting(false);
      setAction(null);
    }
  };

  const handleUnclaim = async () => {
    setUnclaiming(true);
    try {
      await editorService.unclaimChapter(chapterId);
      toast.success("Chapter claim released.");
      onBack();
    } catch (err) {
      logAndToastError(err, "Failed to release claim");
    } finally {
      setUnclaiming(false);
    }
  };

  if (loading) {
    return <ChapterReviewSkeleton />;
  }

  if (error || !chapter) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error || "Chapter not found."}</AlertDescription>
        </Alert>
      </div>
    );
  }

  const isPendingUpdate = chapter.status === "pending_update";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-xl font-bold sm:text-2xl">{chapter.title}</h1>
          <p className="text-muted-foreground text-sm">
            Chapter {chapter.chapter_number} · {chapter.novel.title} · by{" "}
            {chapter.novel.author}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleUnclaim}
          disabled={unclaiming}
        >
          {unclaiming ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Unlock className="mr-2 h-4 w-4" />
          )}
          Unclaim
        </Button>
      </div>

      {/* Meta Info */}
      <div className="flex flex-wrap gap-3">
        <Badge variant="outline" className="flex items-center gap-1">
          <FileText className="h-3 w-3" />
          {chapter.word_count.toLocaleString()} words
        </Badge>
        <ChapterStatusBadge status={chapter.status} />
        {chapter.claim_expires_at && (
          <Badge variant="outline" className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Claim expires {new Date(chapter.claim_expires_at).toLocaleString()}
          </Badge>
        )}
      </div>

      {/* Pending Update Notice */}
      {isPendingUpdate && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            This is a <strong>content update</strong> for an already-published
            chapter. The author has submitted changes to the title and/or
            content. Approving will apply the changes; requesting revision will
            discard them and keep the original.
          </AlertDescription>
        </Alert>
      )}

      {/* Chapter Content */}
      <Card>
        <CardHeader>
          <CardTitle>
            {isPendingUpdate ? "Published Content" : "Chapter Content"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className="prose prose-sm dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: chapter.content }}
          />
        </CardContent>
      </Card>

      {/* Pending Content (for updates) */}
      {isPendingUpdate && chapter.pending_content && (
        <Card className="border-amber-500/50">
          <CardHeader>
            <CardTitle className="text-amber-600 dark:text-amber-400">
              Proposed Changes
            </CardTitle>
            {chapter.pending_title && (
              <CardDescription>
                New title: <strong>{chapter.pending_title}</strong>
              </CardDescription>
            )}
          </CardHeader>
          <CardContent>
            <div
              className="prose prose-sm dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: chapter.pending_content }}
            />
          </CardContent>
        </Card>
      )}

      {/* Previous Reviews */}
      {chapter.reviews.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Previous Reviews</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {chapter.reviews.map((review) => (
                <div key={review.id} className="rounded-md border p-3">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          review.action === "approved"
                            ? "default"
                            : "destructive"
                        }
                        className="text-xs"
                      >
                        {review.action === "approved"
                          ? "Approved"
                          : "Revision Requested"}
                      </Badge>
                      <span className="text-muted-foreground">
                        by {review.editor.name}
                      </span>
                    </div>
                    <span className="text-muted-foreground text-xs">
                      {new Date(review.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  {review.notes && (
                    <p className="text-muted-foreground mt-2 text-sm">
                      {review.notes}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Review Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Review Decision</CardTitle>
          <CardDescription>
            {isPendingUpdate
              ? "Approve the content update or request revision (discards changes)."
              : "Approve the chapter for publication or request the student to revise it."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="review-notes">
              Review Notes{" "}
              <span className="text-muted-foreground text-xs">
                (required for revision requests, max 2000 chars)
              </span>
            </Label>
            <Textarea
              id="review-notes"
              placeholder="Add notes for the student..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              maxLength={2000}
            />
            <p className="text-muted-foreground text-right text-xs">
              {notes.length}/2000
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handleApprove}
              disabled={submitting}
              className="bg-green-600 hover:bg-green-700"
            >
              {submitting && action === "approve" ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle className="mr-2 h-4 w-4" />
              )}
              Approve
            </Button>
            <Button
              variant="destructive"
              onClick={handleRequestRevision}
              disabled={submitting}
            >
              {submitting && action === "revision" ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RotateCcw className="mr-2 h-4 w-4" />
              )}
              Request Revision
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ChapterReviewSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-10" />
        <div className="space-y-2">
          <Skeleton className="h-7 w-64" />
          <Skeleton className="h-4 w-48" />
        </div>
      </div>
      <div className="flex gap-3">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-6 w-24" />
      </div>
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}
