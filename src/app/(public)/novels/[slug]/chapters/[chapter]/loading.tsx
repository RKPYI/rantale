"use client";

import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  BookOpen,
  Loader2,
  Settings,
  List,
  Share2,
  Home,
  Clock,
  Eye,
} from "lucide-react";

export default function ChapterLoading() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 85) return prev;
        const increment = Math.random() * 8 + 4;
        return Math.min(prev + increment, 85);
      });
    }, 180);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-background min-h-screen">
      {/* Loading Progress Bar */}
      <div className="bg-background/80 fixed top-0 right-0 left-0 z-[60] backdrop-blur-sm">
        <Progress value={progress} className="h-1 rounded-none" />
      </div>

      {/* Sticky Header Navigation Skeleton */}
      <div className="bg-background/95 sticky top-1 z-50 border-b shadow-sm backdrop-blur-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Left: Back Navigation */}
            <div className="flex items-center gap-1 md:gap-2">
              <Skeleton className="h-8 w-8 rounded" />
              <div className="bg-border hidden h-6 w-px sm:block" />
              <Skeleton className="h-8 w-8 rounded" />
            </div>

            {/* Center: Chapter Info */}
            <div className="flex-1 px-2 text-center md:px-4">
              <Skeleton className="mx-auto mb-1 h-4 w-32" />
              <Skeleton className="mx-auto h-3 w-48" />
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-1 md:gap-2">
              <Skeleton className="h-8 w-8 rounded" />
              <Skeleton className="h-8 w-8 rounded" />
              <Skeleton className="h-8 w-8 rounded" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Loading Content */}
      <main className="container mx-auto px-4 py-6 md:py-8">
        <div className="flex flex-col items-center">
          {/* Removed loading status message to prevent overlap with component loading states */}

          {/* Chapter Header Skeleton */}
          <div className="mb-8 w-full max-w-4xl">
            <Card>
              <CardHeader className="text-center">
                <div className="space-y-3">
                  <Skeleton className="mx-auto h-6 w-24 rounded-full" />
                  <Skeleton className="mx-auto h-8 w-3/4" />
                  <Skeleton className="mx-auto h-7 w-2/3" />
                </div>
              </CardHeader>
              <CardContent className="space-y-3 text-center">
                <div className="flex items-center justify-center gap-6 text-sm">
                  <div className="flex items-center gap-1">
                    <Clock className="text-muted-foreground h-4 w-4" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <div className="flex items-center gap-1">
                    <BookOpen className="text-muted-foreground h-4 w-4" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="text-muted-foreground h-4 w-4" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                </div>
                <Skeleton className="mx-auto h-6 w-32 rounded-full" />
              </CardContent>
            </Card>
          </div>

          {/* Chapter Content Skeleton */}
          <div className="mb-8 w-full max-w-4xl">
            <Card>
              <CardContent className="p-6 md:p-8">
                <div className="space-y-4">
                  {/* Simulate chapter content paragraphs */}
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton
                        className={`h-4 ${i % 3 === 0 ? "w-3/4" : i % 3 === 1 ? "w-5/6" : "w-4/5"}`}
                      />
                      {i < 11 && <div className="h-3" />}{" "}
                      {/* Paragraph spacing */}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Navigation Footer Skeleton */}
          <div className="mb-8 w-full max-w-4xl">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  {/* Previous Chapter */}
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-10 w-32" />
                  </div>

                  {/* Chapter Progress */}
                  <div className="text-center">
                    <Skeleton className="mx-auto h-4 w-32" />
                  </div>

                  {/* Next Chapter */}
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-10 w-32" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Comments Section Toggle Skeleton */}
          <div className="w-full max-w-4xl">
            <div className="mb-4">
              <Skeleton className="h-10 w-full" />
            </div>

            {/* Comments Loading Skeleton */}
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <div className="animate-pulse space-y-3">
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                      </div>
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-6 w-12" />
                        <Skeleton className="h-6 w-12" />
                        <Skeleton className="h-6 w-16" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Scroll to Top Button Skeleton (positioned like real button) */}
      <div className="fixed right-6 bottom-6 z-40">
        <Skeleton className="h-10 w-10 rounded-full" />
      </div>

      {/* Mobile Navigation Buttons Skeleton */}
      <div className="fixed right-6 bottom-6 flex flex-col gap-2 md:hidden">
        <Skeleton className="h-10 w-10 rounded-full" />
        <Skeleton className="h-10 w-10 rounded-full" />
      </div>
    </div>
  );
}
