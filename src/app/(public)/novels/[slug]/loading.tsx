"use client";

import { Skeleton } from "@/components/ui/skeleton";

export default function NovelLoading() {
  return (
    <div className="pb-24 lg:pb-0">
      <section className="relative isolate overflow-hidden">
        <div className="relative container mx-auto max-w-7xl px-4 pt-6 pb-8 md:px-6 lg:px-8 lg:pt-10 lg:pb-12">
          <div className="flex flex-col gap-6 sm:flex-row sm:gap-8 lg:grid lg:grid-cols-[minmax(0,260px)_1fr] lg:gap-10">
            <div className="mx-auto w-[140px] shrink-0 sm:mx-0 sm:w-[160px] lg:w-full">
              <Skeleton className="aspect-[2/3] w-full rounded-2xl" />
              <div className="mt-5 hidden space-y-3 lg:block">
                <Skeleton className="h-11 w-full rounded-md" />
                <div className="flex gap-2">
                  <Skeleton className="h-9 flex-1 rounded-md" />
                  <Skeleton className="size-9 rounded-md" />
                </div>
              </div>
            </div>

            <div className="min-w-0 flex-1 space-y-5 text-center sm:text-left lg:space-y-6">
              <div className="space-y-3">
                <Skeleton className="mx-auto h-9 w-3/4 sm:mx-0 sm:h-10 lg:h-12" />
                <Skeleton className="mx-auto h-5 w-40 sm:mx-0" />
              </div>

              <div className="flex flex-wrap items-center justify-center gap-4 sm:justify-start">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
              </div>

              <div className="flex flex-wrap justify-center gap-2 sm:justify-start">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-6 w-16 rounded-full" />
                ))}
              </div>

              <div className="space-y-3 lg:hidden">
                <Skeleton className="h-11 w-full rounded-md" />
                <div className="flex gap-2">
                  <Skeleton className="h-9 flex-1 rounded-md" />
                  <Skeleton className="size-9 rounded-md" />
                </div>
              </div>

              <div className="space-y-2 text-left">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>

              <div className="flex flex-wrap justify-center gap-5 sm:justify-start">
                <Skeleton className="h-3 w-32" />
                <Skeleton className="h-3 w-28" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
        <div className="border-b">
          <div className="flex h-12 items-stretch gap-1">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-2 px-3.5 sm:px-4"
              >
                <Skeleton className="hidden size-3.5 sm:block" />
                <Skeleton className="h-4 w-16" />
                {i === 1 && <Skeleton className="h-5 w-7 rounded-md" />}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 py-8 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-36" />
              <Skeleton className="h-8 w-20" />
            </div>
            <div className="divide-y rounded-2xl border">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-3.5">
                  <Skeleton className="size-10 shrink-0 rounded-lg" />
                  <div className="min-w-0 flex-1 space-y-2">
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="lg:col-span-1">
            <Skeleton className="h-64 w-full rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
