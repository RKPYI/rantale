"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { BookOpen, Star, Eye, User, Calendar, Clock } from "lucide-react";

export default function NovelLoading() {
  return (
    <div className="container mx-auto max-w-7xl px-4 py-6">
      {/* Header Section */}
      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Cover Image */}
        <div className="lg:col-span-1">
          <div className="sticky top-6">
            <div className="relative aspect-[2/3] overflow-hidden rounded-lg shadow-lg">
              <Skeleton className="h-full w-full" />
            </div>

            {/* Action Buttons */}
            <div className="mt-4 space-y-2">
              <Skeleton className="h-11 w-full" />
              <div className="flex gap-2">
                <Skeleton className="h-10 flex-1" />
                <Skeleton className="h-10 w-10" />
              </div>
            </div>
          </div>
        </div>

        {/* Novel Info */}
        <div className="lg:col-span-2">
          <div className="space-y-4">
            <div>
              <Skeleton className="mb-2 h-10 w-3/4" />
              <div className="mb-4 flex items-center gap-2">
                <User className="text-muted-foreground h-4 w-4" />
                <Skeleton className="h-5 w-32" />
              </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-muted rounded-lg p-3 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Skeleton className="h-5 w-16" />
                  </div>
                  <Skeleton className="mx-auto mt-1 h-3 w-12" />
                </div>
              ))}
            </div>

            {/* Genres */}
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-6 w-20 rounded-full" />
              ))}
            </div>

            {/* Description */}
            <Card>
              <CardContent className="p-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </CardContent>
            </Card>

            {/* Metadata */}
            <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
              <div className="flex items-center gap-2">
                <Calendar className="text-muted-foreground h-4 w-4" />
                <Skeleton className="h-4 w-32" />
              </div>
              <div className="flex items-center gap-2">
                <Clock className="text-muted-foreground h-4 w-4" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <Separator className="my-8" />

      {/* Tabs Section */}
      <div className="space-y-6">
        {/* Tabs List */}
        <div className="bg-muted inline-flex h-10 items-center justify-center rounded-md p-1">
          <Skeleton className="h-8 w-20 rounded-sm" />
          <Skeleton className="ml-1 h-8 w-20 rounded-sm" />
          <Skeleton className="ml-1 h-8 w-20 rounded-sm" />
          <Skeleton className="ml-1 h-8 w-24 rounded-sm" />
        </div>

        {/* Overview Tab Content */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="space-y-6 lg:col-span-2">
            {/* Latest Chapters */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-9 w-24 rounded-md" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className="hover:bg-muted rounded-lg p-3 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-5 w-3/4" />
                          <Skeleton className="h-4 w-24" />
                        </div>
                        <Skeleton className="h-4 w-4" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6 lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>
                  <Skeleton className="h-6 w-32" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
