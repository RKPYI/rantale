"use client";

import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { BookOpen, Loader2 } from "lucide-react";

export default function Loading() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) return prev;
        const increment = Math.random() * 15 + 5;
        return Math.min(prev + increment, 95);
      });
    }, 200);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-background min-h-screen">
      {/* Loading Progress Bar */}
      <div className="w-full">
        <Progress value={progress} className="h-1 rounded-none" />
      </div>

      {/* Loading Navbar Skeleton */}
      <nav className="bg-background border-b">
        <div className="flex h-16 items-center justify-between px-4 md:px-6 lg:px-8">
          <div className="flex items-center space-x-6">
            <Skeleton className="h-8 w-[120px]" />
            <div className="hidden items-center space-x-4 md:flex">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-20" />
            </div>
          </div>

          <div className="mx-4 max-w-md flex-1 md:mx-8">
            <Skeleton className="h-10 w-full rounded-md" />
          </div>

          <div className="flex items-center space-x-4">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        </div>
      </nav>

      {/* Main Loading Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex flex-col items-center justify-center">
          <div className="mb-4 flex items-center gap-3">
            <div className="relative">
              <BookOpen className="text-primary h-8 w-8" />
              <Loader2 className="text-primary absolute -top-1 -right-1 h-4 w-4 animate-spin" />
            </div>
            <div className="space-y-1">
              <div className="text-lg font-medium">Loading Ranovel...</div>
              <div className="text-muted-foreground text-sm">
                Please wait while we prepare your content
              </div>
            </div>
          </div>

          {/* Progress Bar with Percentage */}
          <div className="w-full max-w-md space-y-2">
            <Progress value={progress} className="h-2" />
            <div className="text-muted-foreground text-center text-xs">
              {Math.round(progress)}% complete
            </div>
          </div>
        </div>

        {/* Content Skeletons */}
        <div className="space-y-6">
          {/* Header Skeleton */}
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-96" />
          </div>

          {/* Cards Grid Skeleton */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}>
                <CardHeader className="pb-3">
                  <div className="flex gap-3">
                    <Skeleton className="h-20 w-16 rounded" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                      <div className="flex gap-1">
                        <Skeleton className="h-4 w-12" />
                        <Skeleton className="h-4 w-12" />
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* List Items Skeleton */}
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <Skeleton className="h-16 w-12 rounded" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-4 w-full" />
                      <div className="flex gap-2">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
