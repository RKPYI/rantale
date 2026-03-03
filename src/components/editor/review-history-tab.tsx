"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  History,
  CheckCircle,
  AlertCircle,
  BookOpen,
  ExternalLink,
} from "lucide-react";
import { useEditorReviewHistory } from "@/hooks/use-editor";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

export function ReviewHistoryTab() {
  const { data: reviewHistory, loading } = useEditorReviewHistory(20);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Review History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const reviews = reviewHistory?.data || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Review History
          </span>
          {reviewHistory && (
            <Badge variant="secondary">{reviewHistory.total} reviews</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {reviews.length === 0 ? (
          <div className="py-12 text-center">
            <History className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
            <h3 className="text-lg font-medium">No Reviews Yet</h3>
            <p className="text-muted-foreground">
              Your review history will appear here once you start reviewing
              chapters.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={cn(
                        "border-0",
                        review.action === "approved"
                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
                      )}
                    >
                      {review.action === "approved" ? (
                        <>
                          <CheckCircle className="mr-1 h-3 w-3" />
                          Approved
                        </>
                      ) : (
                        <>
                          <AlertCircle className="mr-1 h-3 w-3" />
                          Revision Requested
                        </>
                      )}
                    </Badge>
                    <span className="text-muted-foreground text-sm">
                      {formatDistanceToNow(new Date(review.created_at), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                  <h4 className="font-medium">
                    Chapter {review.chapter.chapter_number}:{" "}
                    {review.chapter.title}
                  </h4>
                  <div className="text-muted-foreground flex items-center gap-2 text-sm">
                    <BookOpen className="h-3 w-3" />
                    <span>{review.chapter.novel.title}</span>
                  </div>
                  {review.notes && (
                    <p className="text-muted-foreground mt-2 line-clamp-2 text-sm">
                      {review.notes}
                    </p>
                  )}
                </div>
                <Link
                  href={`/novels/${review.chapter.novel.slug}/chapters/${review.chapter.chapter_number}`}
                  className="text-primary inline-flex items-center gap-1 text-sm hover:underline"
                >
                  View Chapter
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
