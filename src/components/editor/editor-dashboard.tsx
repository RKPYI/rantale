"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import {
  useEditorStats,
  useEditorPendingChapters,
  useEditorMyClaimedChapters,
} from "@/hooks/use-editor";
import { PendingChapter, ClaimedChapter } from "@/types/api";

import { EditorOverviewTab } from "./overview-tab";
import { PendingChaptersTab } from "./pending-chapters-tab";
import { MyClaimedChaptersTab } from "./my-claimed-chapters-tab";
import { ReviewHistoryTab } from "./review-history-tab";
import { ChapterReview } from "./chapter-review";

export function EditorDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedChapter, setSelectedChapter] = useState<
    PendingChapter | ClaimedChapter | null
  >(null);

  const { error: statsError, refetch: refetchStats } = useEditorStats();
  const { refetch: refetchPending } = useEditorPendingChapters();
  const { refetch: refetchClaimed } = useEditorMyClaimedChapters();

  if (statsError) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Failed to load editor dashboard: {statsError}
        </AlertDescription>
      </Alert>
    );
  }

  const handleReviewChapter = (chapter: PendingChapter | ClaimedChapter) => {
    setSelectedChapter(chapter);
  };

  const handleBackToQueue = () => {
    setSelectedChapter(null);
  };

  const handleReviewComplete = async () => {
    setSelectedChapter(null);
    // Refresh all data after review
    await Promise.all([refetchStats(), refetchPending(), refetchClaimed()]);
  };

  const handleClaimSuccess = async () => {
    // Refresh claimed chapters when a claim is made from the pending queue
    await refetchClaimed();
  };

  // If a chapter is selected for review, show the review view
  if (selectedChapter) {
    return (
      <ChapterReview
        chapter={selectedChapter}
        onBack={handleBackToQueue}
        onReviewComplete={handleReviewComplete}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold sm:text-3xl">Editor Dashboard</h1>
        <p className="text-muted-foreground">
          Review and manage chapter submissions
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="overflow-x-auto">
          <TabsList className="inline-flex w-full min-w-max sm:w-auto">
            <TabsTrigger value="overview" className="text-xs sm:text-sm">
              Overview
            </TabsTrigger>
            <TabsTrigger value="pending" className="text-xs sm:text-sm">
              Pending Review
            </TabsTrigger>
            <TabsTrigger value="claimed" className="text-xs sm:text-sm">
              My Claims
            </TabsTrigger>
            <TabsTrigger value="history" className="text-xs sm:text-sm">
              Review History
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="mt-6">
          <EditorOverviewTab />
        </TabsContent>

        <TabsContent value="pending" className="mt-6">
          <PendingChaptersTab
            onReviewChapter={handleReviewChapter}
            onClaimSuccess={handleClaimSuccess}
          />
        </TabsContent>

        <TabsContent value="claimed" className="mt-6">
          <MyClaimedChaptersTab onReviewChapter={handleReviewChapter} />
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <ReviewHistoryTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
