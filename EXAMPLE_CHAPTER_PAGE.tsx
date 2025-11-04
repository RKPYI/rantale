/**
 * Example: Chapter Reading Page with Offline Download
 * 
 * This example shows how to integrate the offline download feature
 * into a chapter reading page.
 */

'use client';

import { useState, useEffect } from 'react';
import { ChapterDownloadButton } from '@/components/chapters';
import { offlineService } from '@/services/offline';
import { useOfflineStatus } from '@/hooks/use-offline-chapter';
import type { Chapter } from '@/types/api';

interface ChapterPageProps {
  params: { id: string };
}

export default function ChapterPage({ params }: ChapterPageProps) {
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [loading, setLoading] = useState(true);
  const { isOffline } = useOfflineStatus();

  useEffect(() => {
    async function loadChapter() {
      try {
        // Try to load from offline cache first
        const offlineChapter = await offlineService.getOfflineChapter(params.id);
        
        if (offlineChapter) {
          // Use offline chapter
          setChapter({
            id: offlineChapter.id,
            novel_id: offlineChapter.novel_id,
            chapter_number: offlineChapter.chapter_number,
            title: offlineChapter.title,
            content: offlineChapter.content,
            word_count: 0,
            views: null,
            is_free: true,
            published_at: '',
            created_at: '',
            updated_at: '',
          });
        } else if (!isOffline) {
          // Fetch from API if online
          const response = await fetch(`/api/chapters/${params.id}`);
          const data = await response.json();
          setChapter(data.chapter);
        }
      } catch (error) {
        console.error('Failed to load chapter:', error);
      } finally {
        setLoading(false);
      }
    }

    loadChapter();
  }, [params.id, isOffline]);

  if (loading) {
    return <div>Loading chapter...</div>;
  }

  if (!chapter) {
    return (
      <div>
        <p>Chapter not available</p>
        {isOffline && (
          <p className="text-muted-foreground">
            You are offline. Please connect to the internet or download this chapter for offline reading.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      {/* Chapter Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{chapter.title}</h1>
          <p className="text-muted-foreground">
            Chapter {chapter.chapter_number}
          </p>
        </div>

        {/* Download Button */}
        <ChapterDownloadButton
          chapter={chapter}
          novelTitle="My Novel Title" // Pass from parent or fetch
          onSuccess={() => {
            console.log('Chapter downloaded successfully');
            // Optionally show a toast notification
          }}
          onError={(error) => {
            console.error('Download failed:', error);
            // Optionally show error notification
          }}
        />
      </div>

      {/* Offline Indicator */}
      {isOffline && (
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm dark:border-yellow-900 dark:bg-yellow-950">
          <p className="font-medium">📱 Reading Offline</p>
          <p className="text-muted-foreground">
            You are viewing a downloaded copy of this chapter.
          </p>
        </div>
      )}

      {/* Chapter Content */}
      <div className="prose prose-neutral dark:prose-invert max-w-none">
        <div dangerouslySetInnerHTML={{ __html: chapter.content }} />
      </div>

      {/* Chapter Navigation */}
      <div className="flex items-center justify-between border-t pt-6">
        {chapter.previous_chapter && (
          <a href={`/chapters/${chapter.previous_chapter}`}>
            ← Previous Chapter
          </a>
        )}
        {chapter.next_chapter && (
          <a href={`/chapters/${chapter.next_chapter}`}>
            Next Chapter →
          </a>
        )}
      </div>
    </div>
  );
}
