"use client";

import { useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { BookOpen, Loader2 } from 'lucide-react';

export default function PublicLoading() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return prev;
        const increment = Math.random() * 20 + 10;
        return Math.min(prev + increment, 90);
      });
    }, 300);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Loading Header with Progress */}
      <div className="flex flex-col items-center justify-center mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="relative">
            <BookOpen className="h-6 w-6 text-primary" />
            <Loader2 className="h-3 w-3 animate-spin absolute -top-1 -right-1 text-primary" />
          </div>
          <div className="space-y-1">
            <div className="text-base font-medium">Loading content...</div>
            <div className="text-sm text-muted-foreground">Getting everything ready</div>
          </div>
        </div>
        
        {/* Compact Progress Bar */}
        <div className="w-full max-w-xs space-y-1">
          <Progress value={progress} className="h-1.5" />
          <div className="text-center text-xs text-muted-foreground">
            {Math.round(progress)}%
          </div>
        </div>
      </div>

      {/* Page Content Skeleton */}
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 9 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex gap-3">
                  <Skeleton className="h-20 w-16 rounded flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <div className="flex gap-1">
                      <Skeleton className="h-4 w-12" />
                      <Skeleton className="h-4 w-12" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}