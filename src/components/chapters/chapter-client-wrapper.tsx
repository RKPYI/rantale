/**
 * Chapter Page Client Wrapper
 * Handles offline content loading and fallback
 */

"use client";

import { useEffect, useState } from "react";
import { notFound } from "next/navigation";
import { ChapterReadingView } from "@/components/chapters";
import { offlineService, type OfflineChapter } from "@/services/offline";
import { useOfflineStatus } from "@/hooks/use-offline-chapter";
import type { Chapter, ChapterSummary } from "@/types/api";
import { Loader2 } from "lucide-react";

interface ChapterClientWrapperProps {
  initialChapter: Chapter;
  novel: {
    id: number;
    title: string;
    slug: string;
    author: string;
  };
  allChapters: ChapterSummary[];
}

export function ChapterClientWrapper({
  initialChapter,
  novel,
  allChapters,
}: ChapterClientWrapperProps) {
  const [chapter, setChapter] = useState<Chapter>(initialChapter);
  const [loading, setLoading] = useState(false);
  const { isOffline } = useOfflineStatus();

  // Try to load from offline cache if available
  useEffect(() => {
    async function checkOfflineVersion() {
      if (!offlineService.isSupported()) return;

      try {
        const offlineChapter = await offlineService.getOfflineChapter(
          initialChapter.id.toString(),
        );

        // If we have an offline version and we're offline, use it
        if (offlineChapter && isOffline) {
          setChapter({
            ...initialChapter,
            content: offlineChapter.content,
          });
        }
      } catch (error) {
        console.error("Failed to load offline chapter:", error);
      }
    }

    checkOfflineVersion();
  }, [initialChapter, isOffline]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin" />
          <p className="text-muted-foreground mt-4">Loading chapter...</p>
        </div>
      </div>
    );
  }

  return (
    <ChapterReadingView
      chapter={chapter}
      novel={novel}
      allChapters={allChapters}
    />
  );
}
