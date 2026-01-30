"use client";

import { NovelGrid } from "./novel-grid";
import { useLatestNovels } from "@/hooks/use-novels";

interface LatestUpdatesProps {
  maxItems?: number;
  className?: string;
}

export function LatestUpdates({
  maxItems = 10,
  className,
}: LatestUpdatesProps) {
  const { data: latestNovels, loading } = useLatestNovels();

  return (
    <div className={className}>
      <h2 className="mb-4 text-2xl font-bold">Latest Updates</h2>
      <NovelGrid
        novels={latestNovels || undefined}
        loading={loading}
        maxItems={maxItems}
        size="horizontal"
        emptyMessage="No latest updates found"
        emptyIcon="clock"
        skeletonCount={5}
      />
    </div>
  );
}
