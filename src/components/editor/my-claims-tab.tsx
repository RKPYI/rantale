"use client";

import { useState } from "react";
import {
  Clock,
  Eye,
  Unlock,
  Loader2,
  AlertTriangle,
  Inbox,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useEditorClaimedChapters } from "@/hooks/use-editor";
import { editorService } from "@/services/editor";
import { ChapterStatusBadge } from "./chapter-status-badge";
import { logAndToastError } from "@/lib/error-utils";
import { toast } from "sonner";

interface MyClaimsTabProps {
  onReviewChapter: (chapterId: number) => void;
}

export function MyClaimsTab({ onReviewChapter }: MyClaimsTabProps) {
  const [unclaimingId, setUnclaimingId] = useState<number | null>(null);
  const {
    data: claimedChapters,
    loading,
    error,
    refetch,
  } = useEditorClaimedChapters();

  const handleUnclaim = async (chapterId: number) => {
    setUnclaimingId(chapterId);
    try {
      await editorService.unclaimChapter(chapterId);
      toast.success("Chapter claim released.");
      await refetch();
    } catch (err) {
      logAndToastError(err, "Failed to release claim");
    } finally {
      setUnclaimingId(null);
    }
  };

  if (loading) {
    return <ClaimedChaptersSkeleton />;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Failed to load claimed chapters: {error}
        </AlertDescription>
      </Alert>
    );
  }

  if (!claimedChapters || claimedChapters.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Inbox className="text-muted-foreground mb-4 h-12 w-12" />
          <p className="text-lg font-medium">No claimed chapters</p>
          <p className="text-muted-foreground text-sm">
            Claim a chapter from the Pending Chapters tab to start reviewing.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">
        My Claimed Chapters ({claimedChapters.length})
      </h3>

      <div className="space-y-3">
        {claimedChapters.map((chapter) => (
          <Card key={chapter.id} className="transition-shadow hover:shadow-md">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{chapter.title}</h4>
                    <ChapterStatusBadge status={chapter.status} />
                  </div>
                  <p className="text-muted-foreground text-sm">
                    Chapter {chapter.chapter_number} · {chapter.novel.title} ·
                    by {chapter.novel.author}
                  </p>
                  <div className="text-muted-foreground flex items-center gap-3 text-xs">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Claimed {new Date(chapter.claimed_at).toLocaleString()}
                    </span>
                    <Badge
                      variant={
                        chapter.claim_hours_remaining <= 4
                          ? "destructive"
                          : "outline"
                      }
                      className="text-xs"
                    >
                      <Clock className="mr-1 h-3 w-3" />
                      {Math.floor(chapter.claim_hours_remaining)}h remaining
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" onClick={() => onReviewChapter(chapter.id)}>
                    <Eye className="mr-2 h-4 w-4" />
                    Review
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleUnclaim(chapter.id)}
                    disabled={unclaimingId === chapter.id}
                  >
                    {unclaimingId === chapter.id ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Unlock className="mr-2 h-4 w-4" />
                    )}
                    Unclaim
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function ClaimedChaptersSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-4 w-72" />
                <Skeleton className="h-3 w-40" />
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-9 w-24" />
                <Skeleton className="h-9 w-24" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
