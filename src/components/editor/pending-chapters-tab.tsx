"use client";

import { useState } from "react";
import {
  FileText,
  Eye,
  Clock,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Lock,
  Unlock,
  Loader2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useEditorPendingChapters } from "@/hooks/use-editor";
import { editorService } from "@/services/editor";
import { PendingChapter } from "@/types/api";
import { ChapterStatusBadge } from "./chapter-status-badge";
import { logAndToastError } from "@/lib/error-utils";
import { toast } from "sonner";

interface PendingChaptersTabProps {
  onReviewChapter: (chapterId: number) => void;
}

export function PendingChaptersTab({
  onReviewChapter,
}: PendingChaptersTabProps) {
  const [page, setPage] = useState(1);
  const [claimingId, setClaimingId] = useState<number | null>(null);
  const {
    data: pendingData,
    loading,
    error,
    refetch,
  } = useEditorPendingChapters(page);

  const handleClaim = async (chapterId: number) => {
    setClaimingId(chapterId);
    try {
      await editorService.claimChapter(chapterId);
      toast.success("Chapter claimed! You have 24 hours to review it.");
      await refetch();
    } catch (err) {
      logAndToastError(err, "Failed to claim chapter");
    } finally {
      setClaimingId(null);
    }
  };

  if (loading) {
    return <PendingChaptersSkeleton />;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Failed to load pending chapters: {error}
        </AlertDescription>
      </Alert>
    );
  }

  if (!pendingData || pendingData.data.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <FileText className="text-muted-foreground mb-4 h-12 w-12" />
          <p className="text-lg font-medium">No pending chapters</p>
          <p className="text-muted-foreground text-sm">
            All chapters have been reviewed. Check back later!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">
          Pending Chapters ({pendingData.total})
        </h3>
      </div>

      <div className="space-y-3">
        {pendingData.data.map((chapter) => (
          <Card key={chapter.id} className="transition-shadow hover:shadow-md">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{chapter.title}</h4>
                    <ChapterStatusBadge status={chapter.status} />
                  </div>
                  <p className="text-muted-foreground text-sm">
                    Chapter {chapter.chapter_number} · {chapter.novel.title}
                  </p>
                  <div className="text-muted-foreground flex items-center gap-4 text-xs">
                    <span className="flex items-center gap-1">
                      <FileText className="h-3 w-3" />
                      {chapter.word_count.toLocaleString()} words
                    </span>
                    <span>by {chapter.novel.author}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(chapter.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {chapter.is_claimed_by_me ? (
                    <Button
                      size="sm"
                      onClick={() => onReviewChapter(chapter.id)}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      Review
                    </Button>
                  ) : chapter.is_claimed ? (
                    <Badge
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      <Lock className="h-3 w-3" />
                      Claimed by {chapter.claimed_by_editor?.name}
                    </Badge>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleClaim(chapter.id)}
                      disabled={claimingId === chapter.id}
                    >
                      {claimingId === chapter.id ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Unlock className="mr-2 h-4 w-4" />
                      )}
                      Claim
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {pendingData.last_page > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <span className="text-muted-foreground text-sm">
            Page {page} of {pendingData.last_page}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= pendingData.last_page}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

function PendingChaptersSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <Card key={i}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-4 w-72" />
                <Skeleton className="h-3 w-40" />
              </div>
              <Skeleton className="h-9 w-24" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
