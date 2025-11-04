/**
 * Offline Fallback Page
 * Shown when user tries to access a page without internet connection
 */

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { WifiOff, RefreshCw, Download, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { offlineService } from '@/services/offline';

export default function OfflinePage() {
  const [downloadCount, setDownloadCount] = useState(0);
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    // Check online status
    setIsOnline(navigator.onLine);

    // Get download count
    const count = offlineService.getDownloadedChapters().size;
    setDownloadCount(count);

    // Listen for online/offline events
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/20">
            <WifiOff className="h-8 w-8 text-amber-600 dark:text-amber-500" />
          </div>
          <CardTitle className="text-2xl">You&apos;re Offline</CardTitle>
          <CardDescription>
            {isOnline
              ? "Connection restored! Click refresh to continue."
              : "No internet connection available"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isOnline ? (
            <Button onClick={handleRefresh} className="w-full" size="lg">
              <RefreshCw className="mr-2 h-5 w-5" />
              Refresh Page
            </Button>
          ) : (
            <>
              <div className="rounded-lg border bg-muted/50 p-4 text-center">
                <p className="text-sm text-muted-foreground">
                  You can still access your downloaded content
                </p>
                <div className="mt-2 flex items-center justify-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  <span className="text-lg font-semibold">
                    {downloadCount} {downloadCount === 1 ? 'Chapter' : 'Chapters'}
                  </span>
                </div>
              </div>

              {downloadCount > 0 ? (
                <Link href="/offline/downloads" className="block">
                  <Button className="w-full" size="lg">
                    <Download className="mr-2 h-5 w-5" />
                    View Downloads
                  </Button>
                </Link>
              ) : (
                <div className="text-center text-sm text-muted-foreground">
                  <p>No downloaded chapters available.</p>
                  <p className="mt-1">Download chapters while online to read them offline.</p>
                </div>
              )}

              <Link href="/" className="block">
                <Button variant="outline" className="w-full">
                  Go to Home
                </Button>
              </Link>
            </>
          )}

          <div className="pt-4 text-center text-xs text-muted-foreground">
            <p>This page works without an internet connection</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
