"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { EditorOverviewTab } from "./overview-tab";
import { PendingChaptersTab } from "./pending-chapters-tab";
import { MyClaimsTab } from "./my-claims-tab";
import { ReviewHistoryTab } from "./review-history-tab";
import { ChapterReview } from "./chapter-review";

export function EditorDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [reviewingChapterId, setReviewingChapterId] = useState<number | null>(
    null,
  );

  const handleReviewChapter = (chapterId: number) => {
    setReviewingChapterId(chapterId);
  };

  const handleBackToQueue = () => {
    setReviewingChapterId(null);
  };

  const handleReviewComplete = () => {
    setReviewingChapterId(null);
  };

  // If a chapter is selected for review, show the review view
  if (reviewingChapterId !== null) {
    return (
      <ChapterReview
        chapterId={reviewingChapterId}
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
            <TabsTrigger value="claims" className="text-xs sm:text-sm">
              My Claims
            </TabsTrigger>
            <TabsTrigger value="pending" className="text-xs sm:text-sm">
              Pending Chapters
            </TabsTrigger>
            <TabsTrigger value="history" className="text-xs sm:text-sm">
              Review History
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="mt-6">
          <EditorOverviewTab />
        </TabsContent>

        <TabsContent value="claims" className="mt-6">
          <MyClaimsTab onReviewChapter={handleReviewChapter} />
        </TabsContent>

        <TabsContent value="pending" className="mt-6">
          <PendingChaptersTab onReviewChapter={handleReviewChapter} />
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <ReviewHistoryTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
