"use client";

import { useState } from "react";
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  History,
  CheckCircle,
  RotateCcw,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useEditorReviewHistory } from "@/hooks/use-editor";

export function ReviewHistoryTab() {
  const [page, setPage] = useState(1);
  const { data: historyData, loading, error } = useEditorReviewHistory(page);

  if (loading) {
    return <ReviewHistorySkeleton />;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Failed to load review history: {error}
        </AlertDescription>
      </Alert>
    );
  }

  if (!historyData || historyData.data.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <History className="text-muted-foreground mb-4 h-12 w-12" />
          <p className="text-lg font-medium">No review history</p>
          <p className="text-muted-foreground text-sm">
            Your reviewed chapters will appear here
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">
        Review History ({historyData.total})
      </h3>

      <div className="space-y-3">
        {historyData.data.map((item) => (
          <Card key={item.id}>
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">
                      Ch.{item.chapter.chapter_number} &quot;
                      {item.chapter.title}&quot;
                    </h4>
                    <Badge
                      variant={
                        item.action === "approved" ? "default" : "destructive"
                      }
                      className="flex items-center gap-1 text-xs"
                    >
                      {item.action === "approved" ? (
                        <CheckCircle className="h-3 w-3" />
                      ) : (
                        <RotateCcw className="h-3 w-3" />
                      )}
                      {item.action === "approved"
                        ? "Approved"
                        : "Revision Requested"}
                    </Badge>
                  </div>
                  <span className="text-muted-foreground flex items-center gap-1 text-xs">
                    <Clock className="h-3 w-3" />
                    {new Date(item.created_at).toLocaleDateString()}
                  </span>
                </div>
                {item.notes && (
                  <p className="bg-muted rounded-md p-2 text-sm">
                    {item.notes}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {historyData.last_page > 1 && (
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
            Page {page} of {historyData.last_page}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= historyData.last_page}
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

function ReviewHistorySkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <Card key={i}>
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-4 w-72" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
