/**
 * Offline Downloads Page
 * Fully functional offline - no API calls, no authentication required
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Download, Trash2, Book, HardDrive, WifiOff, Wifi, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { offlineService, type OfflineChapter } from '@/services/offline';
import { useOfflineStatus } from '@/hooks/use-offline-chapter';

export default function OfflineDownloadsPage() {
  const [chapters, setChapters] = useState<OfflineChapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [storageUsage, setStorageUsage] = useState({ used: 0, quota: 0, percentage: 0 });
  const { isOnline, isOffline } = useOfflineStatus();

  useEffect(() => {
    loadDownloads();
  }, []);

  const loadDownloads = async () => {
    try {
      setLoading(true);
      const downloaded = await offlineService.getAllDownloadedChapters();
      const usage = await offlineService.getStorageUsage();
      
      setChapters(downloaded);
      setStorageUsage(usage);
    } catch (error) {
      console.error('Failed to load downloads:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveChapter = async (chapterId: number) => {
    try {
      await offlineService.removeChapter(chapterId.toString());
      await loadDownloads();
    } catch (error) {
      console.error('Failed to remove chapter:', error);
    }
  };

  const handleClearAll = async () => {
    if (!confirm('Are you sure you want to delete all downloaded chapters?')) {
      return;
    }

    try {
      await offlineService.clearAllDownloads();
      await loadDownloads();
    } catch (error) {
      console.error('Failed to clear downloads:', error);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  // Group chapters by novel
  const chaptersByNovel = chapters.reduce((acc, chapter) => {
    const novelTitle = chapter.novelTitle || 'Unknown Novel';
    if (!acc[novelTitle]) {
      acc[novelTitle] = [];
    }
    acc[novelTitle].push(chapter);
    return acc;
  }, {} as Record<string, OfflineChapter[]>);

  if (loading) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="text-center">
          <p className="text-muted-foreground">Loading downloads...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Download className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Offline Downloads</h1>
              <p className="text-muted-foreground">
                Read your downloaded chapters anytime, anywhere
              </p>
            </div>
          </div>
          <Badge variant={isOnline ? "default" : "secondary"} className="gap-2">
            {isOnline ? (
              <>
                <Wifi className="h-3 w-3" />
                Online
              </>
            ) : (
              <>
                <WifiOff className="h-3 w-3" />
                Offline
              </>
            )}
          </Badge>
        </div>
      </div>

      {/* Offline Notice */}
      {isOffline && (
        <Card className="mb-6 border-amber-500 bg-amber-50 dark:bg-amber-950/20">
          <CardContent className="flex items-center gap-3 p-4">
            <WifiOff className="h-5 w-5 text-amber-600 dark:text-amber-500" />
            <div className="flex-1">
              <p className="font-medium text-amber-900 dark:text-amber-100">
                Offline Mode Active
              </p>
              <p className="text-sm text-amber-700 dark:text-amber-300">
                You're viewing this page without an internet connection. All features work offline!
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Storage Usage */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HardDrive className="h-5 w-5" />
            Storage Usage
          </CardTitle>
          <CardDescription>
            Manage your offline storage
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Used Storage</span>
              <span className="font-medium">
                {formatBytes(storageUsage.used)} / {formatBytes(storageUsage.quota)}
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${Math.min(storageUsage.percentage, 100)}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {storageUsage.percentage.toFixed(1)}% of available storage used
            </p>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="text-sm">
              <p className="font-medium">{chapters.length} Chapters Downloaded</p>
              <p className="text-muted-foreground">
                From {Object.keys(chaptersByNovel).length} {Object.keys(chaptersByNovel).length === 1 ? 'novel' : 'novels'}
              </p>
            </div>
            {chapters.length > 0 && (
              <Button variant="destructive" size="sm" onClick={handleClearAll}>
                <Trash2 className="mr-2 h-4 w-4" />
                Clear All
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Downloaded Chapters by Novel */}
      {chapters.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookOpen className="h-12 w-12 text-muted-foreground/50" />
            <p className="mt-4 text-center text-muted-foreground">
              No chapters downloaded yet.
              <br />
              {isOnline ? (
                <>
                  Browse novels and download chapters to read them offline.
                </>
              ) : (
                <>
                  Connect to the internet to download chapters.
                </>
              )}
            </p>
            {isOnline && (
              <Link href="/" className="mt-4">
                <Button>Browse Novels</Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(chaptersByNovel).map(([novelTitle, novelChapters]) => (
            <Card key={novelTitle}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Book className="h-5 w-5" />
                  {novelTitle}
                </CardTitle>
                <CardDescription>
                  {novelChapters.length} {novelChapters.length === 1 ? 'chapter' : 'chapters'} downloaded
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {novelChapters
                  .sort((a, b) => a.chapter_number - b.chapter_number)
                  .map((chapter) => (
                    <div
                      key={chapter.id}
                      className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50"
                    >
                      <Link
                        href={`/offline/read/${chapter.id}`}
                        className="flex-1"
                      >
                        <div className="space-y-1">
                          <p className="font-medium hover:underline">
                            Chapter {chapter.chapter_number}: {chapter.title}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Downloaded {new Date(chapter.downloadedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveChapter(chapter.id)}
                        title="Remove download"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Help Section */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-lg">How Offline Reading Works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>• Downloaded chapters are stored in your browser's cache</p>
          <p>• You can read them anytime, even without internet</p>
          <p>• Navigate between chapters using the reader controls</p>
          <p>• Delete chapters you no longer need to free up space</p>
          {isOffline && (
            <p className="mt-4 font-medium text-amber-600 dark:text-amber-500">
              • This page works completely offline - no internet required!
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
