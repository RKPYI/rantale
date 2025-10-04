"use client";

import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { BookOpen, Loader2, Star, Eye, Clock } from "lucide-react";

export default function NovelLoading() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return prev;
        const increment = Math.random() * 10 + 5;
        return Math.min(prev + increment, 90);
      });
    }, 150);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-background min-h-screen">
      {/* Main Loading Content */}
      <div className="container mx-auto px-4 py-6">
        {/* Removed loading status message to prevent overlap with component loading states */}

        {/* Novel Detail Loading Layout */}
        <div className="mx-auto max-w-6xl space-y-8">
          {/* Hero Section Skeleton */}
          <Card>
            <CardContent className="p-6 md:p-8">
              <div className="flex flex-col gap-6 md:gap-8 lg:flex-row">
                {/* Cover Image Skeleton */}
                <div className="flex justify-center lg:justify-start">
                  <Skeleton className="h-64 w-48 rounded-lg md:h-80 md:w-56" />
                </div>

                {/* Novel Info Skeleton */}
                <div className="flex-1 space-y-4">
                  {/* Title and Author */}
                  <div className="space-y-2">
                    <Skeleton className="h-8 w-3/4" />
                    <Skeleton className="h-5 w-1/3" />
                  </div>

                  {/* Rating and Stats */}
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-400" />
                      <Skeleton className="h-4 w-8" />
                    </div>
                    <Skeleton className="h-4 w-16" />
                    <div className="flex items-center gap-1">
                      <Eye className="text-muted-foreground h-4 w-4" />
                      <Skeleton className="h-4 w-12" />
                    </div>
                  </div>

                  {/* Status and Genres */}
                  <div className="flex flex-wrap gap-2">
                    <Skeleton className="h-6 w-20 rounded-full" />
                    <Skeleton className="h-6 w-16 rounded-full" />
                    <Skeleton className="h-6 w-18 rounded-full" />
                    <Skeleton className="h-6 w-14 rounded-full" />
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4">
                    <Skeleton className="h-10 w-32" />
                    <Skeleton className="h-10 w-24" />
                    <Skeleton className="h-10 w-10" />
                    <Skeleton className="h-10 w-10" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Statistics Cards */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4 text-center">
                  <Skeleton className="mx-auto mb-2 h-8 w-12" />
                  <Skeleton className="mx-auto h-4 w-16" />
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Content Tabs Navigation */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-18" />
              </div>
            </CardHeader>
            <CardContent>
              {/* Chapter List Skeleton */}
              <div className="space-y-3">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded border p-3"
                  >
                    <div className="flex flex-1 items-center gap-3">
                      <Skeleton className="h-4 w-4" />
                      <div className="flex-1 space-y-1">
                        <Skeleton className="h-4 w-3/4" />
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <Clock className="text-muted-foreground h-3 w-3" />
                            <Skeleton className="h-3 w-16" />
                          </div>
                          <Skeleton className="h-3 w-12" />
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-12" />
                      <Skeleton className="h-6 w-6 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Comments Section Loading */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-8 w-24" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex gap-3 rounded border p-4">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                      <div className="flex items-center gap-3 pt-2">
                        <Skeleton className="h-6 w-12" />
                        <Skeleton className="h-6 w-12" />
                        <Skeleton className="h-6 w-16" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
