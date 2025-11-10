/**
 * Offline Downloads Component
 * Displays and manages all downloaded chapters
 */

"use client";

import { useState } from "react";
import { Trash2, Book, HardDrive, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useDownloadedChapters } from "@/hooks/use-offline-chapter";
import { offlineService } from "@/services/offline";
import Link from "next/link";

export function OfflineDownloads() {
  const { chapters, loading, storageUsage, refetch, clearAll } =
    useDownloadedChapters();
  const [isClearing, setIsClearing] = useState(false);

  const handleClearAll = async () => {
    if (!confirm("Are you sure you want to delete all downloaded chapters?")) {
      return;
    }

    setIsClearing(true);
    try {
      await clearAll();
    } catch (error) {
      console.error("Failed to clear downloads:", error);
    } finally {
      setIsClearing(false);
    }
  };

  const handleRemoveChapter = async (chapterId: number) => {
    try {
      await offlineService.removeChapter(chapterId.toString());
      await refetch();
    } catch (error) {
      console.error("Failed to remove chapter:", error);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Storage Usage Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HardDrive className="h-5 w-5" />
            Storage Usage
          </CardTitle>
          <CardDescription>
            Manage your offline storage and downloaded chapters
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Used Storage</span>
              <span className="font-medium">
                {formatBytes(storageUsage.used)} /{" "}
                {formatBytes(storageUsage.quota)}
              </span>
            </div>
            <div className="bg-secondary h-2 w-full rounded-full">
              <div
                className="bg-primary h-full rounded-full transition-all"
                style={{ width: `${Math.min(storageUsage.percentage, 100)}%` }}
              />
            </div>
            <p className="text-muted-foreground text-xs">
              {storageUsage.percentage.toFixed(1)}% of available storage used
            </p>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="text-sm">
              <p className="font-medium">
                {chapters.length} Chapters Downloaded
              </p>
              <p className="text-muted-foreground">
                Available for offline reading
              </p>
            </div>
            {chapters.length > 0 && (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleClearAll}
                disabled={isClearing}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Clear All
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Downloaded Chapters List */}
      {chapters.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Book className="text-muted-foreground/50 h-12 w-12" />
            <p className="text-muted-foreground mt-4 text-center">
              No chapters downloaded yet.
              <br />
              Download chapters to read them offline.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Downloaded Chapters</h3>
          {chapters.map((chapter) => (
            <Card key={chapter.id}>
              <CardContent className="space-y-3">
                <div className="flex-1 space-y-1">
                  <Link
                    href={`/offline/read/${chapter.id}`}
                    className="font-medium hover:underline"
                  >
                    {chapter.title}
                  </Link>
                  <p className="text-muted-foreground text-sm">
                    {chapter.novelTitle} • Chapter {chapter.chapter_number}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    Downloaded{" "}
                    {new Date(chapter.downloadedAt).toLocaleDateString()}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveChapter(chapter.id)}
                  title="Remove download"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
