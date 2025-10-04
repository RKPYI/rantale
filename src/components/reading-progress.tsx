"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  Clock, 
  TrendingUp,
  PlayCircle,
  CheckCircle,
  RotateCcw
} from 'lucide-react';

import { useNovelProgress, useUserReadingProgress } from '@/hooks/use-reading-progress';
import { useAuth } from '@/hooks/use-auth';
import { readingProgressService } from '@/services/reading-progress';
import { useAsync } from '@/hooks/use-api';

import {
  formatProgressPercentage,
  getProgressStatusMessage,
  getEstimatedReadingTime,
  getProgressColor,
  sortReadingProgress
} from '@/lib/content-utils';

import { ReadingProgressResponse } from '@/types/api';

interface ReadingProgressProps {
  novelSlug: string;
  novelTitle: string;
  totalChapters: number;
  showUserLibrary?: boolean;
}

export function ReadingProgress({ novelSlug, novelTitle, totalChapters, showUserLibrary = false }: ReadingProgressProps) {
  const { user, isAuthenticated } = useAuth();
  
  // Fetch novel progress and user's full reading progress
  const { data: novelProgress, loading: progressLoading, refetch: refetchProgress } = useNovelProgress(novelSlug);
  const { data: userLibrary, loading: libraryLoading, refetch: refetchLibrary } = useUserReadingProgress();

  // Async operations
  const { loading: updating, execute: executeProgressAction } = useAsync();

  // Start reading
  const handleStartReading = async () => {
    if (!isAuthenticated) return;

    try {
      await executeProgressAction(readingProgressService.startReading, novelSlug);
      refetchProgress();
      refetchLibrary();
    } catch (error) {
      console.error('Error starting reading:', error);
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
        nextChapter
      );
      refetchProgress();
      refetchLibrary();
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  // Reset progress
  const handleResetProgress = async () => {
    if (!confirm('Are you sure you want to reset your reading progress?')) return;

    try {
      await executeProgressAction(readingProgressService.deleteProgress, novelSlug);
      refetchProgress();
      refetchLibrary();
    } catch (error) {
      console.error('Error resetting progress:', error);
    }
  };

  // Progress bar component
  const ProgressBar = ({ progress, className = '' }: { progress: ReadingProgressResponse; className?: string }) => {
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
        <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
          <div
            className="h-full transition-all duration-300 rounded-full"
            style={{ 
              width: `${Math.min(percentage, 100)}%`,
              backgroundColor: color
            }}
          />
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {progress.current_chapter 
              ? `Chapter ${progress.current_chapter.chapter_number}` 
              : 'Not started'
            }
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
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-medium mb-2">Track Your Progress</h3>
              <p className="text-muted-foreground mb-4">
                Sign in to track your reading progress across all novels
              </p>
              <Button variant="outline">Sign In</Button>
            </div>
          ) : progressLoading ? (
            <div className="animate-pulse space-y-3">
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-2 bg-muted rounded w-full"></div>
              <div className="flex justify-between">
                <div className="h-3 bg-muted rounded w-24"></div>
                <div className="h-3 bg-muted rounded w-24"></div>
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
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      Last read {new Date(novelProgress.last_read_at).toLocaleDateString()}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {novelProgress.current_chapter && novelProgress.progress_percentage < 100 && (
                    <Button 
                      size="sm" 
                      onClick={handleContinueReading}
                      disabled={updating}
                    >
                      <PlayCircle className="h-3 w-3 mr-1" />
                      Continue Reading
                    </Button>
                  )}
                  {!novelProgress.current_chapter && (
                    <Button 
                      size="sm" 
                      onClick={handleStartReading}
                      disabled={updating}
                    >
                      <BookOpen className="h-3 w-3 mr-1" />
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
                      <RotateCcw className="h-3 w-3 mr-1" />
                      Reset
                    </Button>
                  )}
                </div>
              </div>

              {/* Estimated reading time */}
              {novelProgress.current_chapter && novelProgress.progress_percentage < 100 && (
                <div className="bg-muted p-3 rounded text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>
                      Estimated time remaining: {' '}
                      <span className="font-medium">
                        {getEstimatedReadingTime(
                          novelProgress.current_chapter.chapter_number,
                          novelProgress.total_chapters
                        )}
                      </span>
                    </span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-medium mb-2">Start Your Journey</h3>
              <p className="text-muted-foreground mb-4">
                Begin reading {novelTitle} and track your progress
              </p>
              <Button onClick={handleStartReading} disabled={updating}>
                <PlayCircle className="h-4 w-4 mr-2" />
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
                    <div className="flex items-center gap-3 mb-2">
                      <div className="h-4 bg-muted rounded w-48"></div>
                      <div className="h-4 bg-muted rounded w-16"></div>
                    </div>
                    <div className="h-2 bg-muted rounded w-full"></div>
                  </div>
                ))}
              </div>
            ) : userLibrary && userLibrary.reading_progress.length > 0 ? (
              <div className="space-y-4">
                {userLibrary.reading_progress.slice(0, 5).map((progress) => (
                  <div key={progress.novel.slug} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-sm">{progress.novel.title}</h4>
                        <p className="text-xs text-muted-foreground">by {progress.novel.author}</p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {formatProgressPercentage(progress.progress_percentage)}
                      </Badge>
                    </div>
                    
                    <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                      <div
                        className="h-full transition-all duration-300 rounded-full"
                        style={{ 
                          width: `${Math.min(progress.progress_percentage, 100)}%`,
                          backgroundColor: getProgressColor(progress.progress_percentage)
                        }}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>
                        {progress.current_chapter 
                          ? `Chapter ${progress.current_chapter.chapter_number}/${progress.total_chapters}`
                          : 'Not started'
                        }
                      </span>
                      <span>
                        {progress.last_read_at 
                          ? `Read ${new Date(progress.last_read_at).toLocaleDateString()}`
                          : 'Never read'
                        }
                      </span>
                    </div>
                  </div>
                ))}
                
                {userLibrary.reading_progress.length > 5 && (
                  <div className="text-center pt-2">
                    <Button variant="outline" size="sm">
                      View Full Library ({userLibrary.reading_progress.length} novels)
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-medium mb-2">No Reading Progress</h3>
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