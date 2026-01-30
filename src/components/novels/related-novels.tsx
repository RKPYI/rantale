"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NovelGrid } from "./novel-grid";
import { useRelatedNovels } from "@/hooks/use-novels";
import { useMediaQuery } from "@/hooks/use-media-query";

interface RelatedNovelsProps {
  novelSlug: string;
  className?: string;
  layout?: "horizontal" | "compact";
  maxItems?: number;
  mobileMaxItems?: number;
  desktopMaxItems?: number;
}

export function RelatedNovels({
  novelSlug,
  className,
  layout = "horizontal",
  maxItems,
  mobileMaxItems = 6,
  desktopMaxItems = 3,
}: RelatedNovelsProps) {
  const { data: relatedNovels, loading } = useRelatedNovels(novelSlug);
  const isDesktop = useMediaQuery("(min-width: 1024px)"); // lg breakpoint

  // Determine the actual maxItems to use
  const actualMaxItems =
    maxItems ?? (isDesktop ? desktopMaxItems : mobileMaxItems);

  // Don't render if no related novels
  if (!loading && (!relatedNovels || relatedNovels.length === 0)) {
    return null;
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>You Might Also Like</CardTitle>
      </CardHeader>
      <CardContent>
        <NovelGrid
          novels={relatedNovels || undefined}
          loading={loading}
          maxItems={actualMaxItems}
          size={layout}
          emptyMessage="No related novels found"
          emptyIcon="book"
          skeletonCount={isDesktop ? desktopMaxItems : mobileMaxItems}
        />
      </CardContent>
    </Card>
  );
}
