"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  Clock,
  TrendingUp,
  PlayCircle,
  CheckCircle,
  RotateCcw,
} from "lucide-react";

import {
  useNovelProgress,
  useUserReadingProgress,
} from "@/hooks/use-reading-progress";
import { useAuth } from "@/contexts/auth-context";
import { readingProgressService } from "@/services/reading-progress";
import { useAsync } from "@/hooks/use-api";

import {
  formatProgressPercentage,
  getProgressStatusMessage,
  getEstimatedReadingTime,
  getProgressColor,
  sortReadingProgress,
} from "@/lib/content-utils";

import { ReadingProgressResponse } from "@/types/api";

interface ReadingProgressProps {
  novelSlug: string;
  novelTitle: string;
  totalChapters: number;
  showUserLibrary?: boolean;
}

export function ReadingProgress({
  novelSlug,
  novelTitle,
  totalChapters,
  showUserLibrary = false,
}: ReadingProgressProps) {
  const { user, isAuthenticated } = useAuth();

  // Fetch novel progress and user's full reading progress
  const {
    data: novelProgress,
    loading: progressLoading,
    refetch: refetchProgress,
  } = useNovelProgress(novelSlug);
  const {
    data: userLibrary,
    loading: libraryLoading,
    refetch: refetchLibrary,
  } = useUserReadingProgress();

  // Async operations
  const { loading: updating, execute: executeProgressAction } = useAsync();

  // Start reading
  const handleStartReading = async () => {
    if (!isAuthenticated) return;

    try {
      await executeProgressAction(
        readingProgressService.startReading,
        novelSlug,
      );
      refetchProgress();
      refetchLibrary();
    } catch (error) {
      console.error("Error starting reading:", error);
    }
  };

  // Continue reading to next chapter
  const handleContinueReading = async () => {
    if (!novelProgress?.current_chapter) return;

    const nextChapter = novelProgress.current_chapter.chapter_number + 1;
    if (nextChapter > totalChapters) return;

    try {
      await executeProgressAction(
        readingProgressService.continueReading,
        novelSlug,
        nextChapter,
      );
      refetchProgress();
      refetchLibrary();
    } catch (error) {
      console.error("Error updating progress:", error);
    }
  };

  // Reset progress
  const handleResetProgress = async () => {
    if (!confirm("Are you sure you want to reset your reading progress?"))
      return;

    try {
      await executeProgressAction(
        readingProgressService.deleteProgress,
        novelSlug,
      );
      refetchProgress();
      refetchLibrary();
    } catch (error) {
      console.error("Error resetting progress:", error);
    }
  };

  // Progress bar component
  const ProgressBar = ({
    progress,
    className = "",
  }: {
    progress: ReadingProgressResponse;
    className?: string;
  }) => {
    const percentage = progress.progress_percentage;
    const color = getProgressColor(percentage);

    return (
      <div className={`space-y-2 ${className}`}>
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">{progress.novel_slug}</span>
          <span className="text-muted-foreground">
            {formatProgressPercentage(percentage)}
          </span>
        </div>
        <div className="bg-muted h-2 w-full overflow-hidden rounded-full">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${Math.min(percentage, 100)}%`,
              backgroundColor: color,
            }}
          />
        </div>
        <div className="text-muted-foreground flex items-center justify-between text-xs">
          <span>
            {progress.current_chapter
              ? `Chapter ${progress.current_chapter.chapter_number}`
              : "Not started"}
          </span>
          <span>{progress.total_chapters} chapters total</span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Novel Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Reading Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!isAuthenticated ? (
            <div className="py-8 text-center">
              <BookOpen className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
              <h3 className="mb-2 font-medium">Track Your Progress</h3>
              <p className="text-muted-foreground mb-4">
                Sign in to track your reading progress across all novels
              </p>
              <Button variant="outline">Sign In</Button>
            </div>
          ) : progressLoading ? (
            <div className="animate-pulse space-y-3">
              <div className="bg-muted h-4 w-3/4 rounded"></div>
              <div className="bg-muted h-2 w-full rounded"></div>
              <div className="flex justify-between">
                <div className="bg-muted h-3 w-24 rounded"></div>
                <div className="bg-muted h-3 w-24 rounded"></div>
              </div>
            </div>
          ) : novelProgress ? (
            <div className="space-y-4">
              <ProgressBar progress={novelProgress} />

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      {getProgressStatusMessage(novelProgress)}
                    </Badge>
                    {novelProgress.progress_percentage >= 100 && (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    )}
                  </div>
                  {novelProgress.last_read_at && (
                    <div className="text-muted-foreground flex items-center gap-1 text-xs">
                      <Clock className="h-3 w-3" />
                      Last read{" "}
                      {new Date(
                        novelProgress.last_read_at,
                      ).toLocaleDateString()}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {novelProgress.current_chapter &&
                    novelProgress.progress_percentage < 100 && (
                      <Button
                        size="sm"
                        onClick={handleContinueReading}
                        disabled={updating}
                      >
                        <PlayCircle className="mr-1 h-3 w-3" />
                        Continue Reading
                      </Button>
                    )}
                  {!novelProgress.current_chapter && (
                    <Button
                      size="sm"
                      onClick={handleStartReading}
                      disabled={updating}
                    >
                      <BookOpen className="mr-1 h-3 w-3" />
                      Start Reading
                    </Button>
                  )}
                  {novelProgress.current_chapter && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleResetProgress}
                      disabled={updating}
                    >
                      <RotateCcw className="mr-1 h-3 w-3" />
                      Reset
                    </Button>
                  )}
                </div>
              </div>

              {/* Estimated reading time */}
              {novelProgress.current_chapter &&
                novelProgress.progress_percentage < 100 && (
                  <div className="bg-muted rounded p-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="text-muted-foreground h-4 w-4" />
                      <span>
                        Estimated time remaining:{" "}
                        <span className="font-medium">
                          {getEstimatedReadingTime(
                            novelProgress.current_chapter.chapter_number,
                            novelProgress.total_chapters,
                          )}
                        </span>
                      </span>
                    </div>
                  </div>
                )}
            </div>
          ) : (
            <div className="py-8 text-center">
              <BookOpen className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
              <h3 className="mb-2 font-medium">Start Your Journey</h3>
              <p className="text-muted-foreground mb-4">
                Begin reading {novelTitle} and track your progress
              </p>
              <Button onClick={handleStartReading} disabled={updating}>
                <PlayCircle className="mr-2 h-4 w-4" />
                Start Reading
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* User's Reading Library */}
      {showUserLibrary && isAuthenticated && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Your Reading Library
            </CardTitle>
          </CardHeader>
          <CardContent>
            {libraryLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="mb-2 flex items-center gap-3">
                      <div className="bg-muted h-4 w-48 rounded"></div>
                      <div className="bg-muted h-4 w-16 rounded"></div>
                    </div>
                    <div className="bg-muted h-2 w-full rounded"></div>
                  </div>
                ))}
              </div>
            ) : userLibrary && userLibrary.reading_progress.length > 0 ? (
              <div className="space-y-4">
                {userLibrary.reading_progress.slice(0, 5).map((progress) => (
                  <div key={progress.novel.slug} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium">
                          {progress.novel.title}
                        </h4>
                        <p className="text-muted-foreground text-xs">
                          by {progress.novel.author}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {formatProgressPercentage(progress.progress_percentage)}
                      </Badge>
                    </div>

                    <div className="bg-muted h-1.5 w-full overflow-hidden rounded-full">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${Math.min(progress.progress_percentage, 100)}%`,
                          backgroundColor: getProgressColor(
                            progress.progress_percentage,
                          ),
                        }}
                      />
                    </div>

                    <div className="text-muted-foreground flex items-center justify-between text-xs">
                      <span>
                        {progress.current_chapter
                          ? `Chapter ${progress.current_chapter.chapter_number}/${progress.total_chapters}`
                          : "Not started"}
                      </span>
                      <span>
                        {progress.last_read_at
                          ? `Read ${new Date(progress.last_read_at).toLocaleDateString()}`
                          : "Never read"}
                      </span>
                    </div>
                  </div>
                ))}

                {userLibrary.reading_progress.length > 5 && (
                  <div className="pt-2 text-center">
                    <Button variant="outline" size="sm">
                      View Full Library ({userLibrary.reading_progress.length}{" "}
                      novels)
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-8 text-center">
                <BookOpen className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
                <h3 className="mb-2 font-medium">No Reading Progress</h3>
                <p className="text-muted-foreground">
                  Start reading novels to build your library
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
