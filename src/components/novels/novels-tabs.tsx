"use client";

import { useState } from "react";
import { Clock, Star, Users } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NovelGrid } from "./novel-grid";
import {
  usePopularNovels,
  useLatestNovels,
  useRecommendedNovels,
} from "@/hooks/use-novels";

interface NovelsTabsProps {
  defaultTab?: "popular" | "latest" | "recommended";
  maxItems?: number;
  size?: "default" | "compact" | "featured" | "horizontal";
  className?: string;
}

export function NovelsTabs({
  defaultTab = "popular",
  maxItems = 10,
  size = "compact",
  className,
}: NovelsTabsProps) {
  const [activeTab, setActiveTab] = useState<string>(defaultTab);

  const { data: popularNovels, loading: popularLoading } = usePopularNovels();
  const { data: latestNovels, loading: latestLoading } = useLatestNovels();
  const { data: recommendedNovels, loading: recommendedLoading } =
    useRecommendedNovels();

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className={className}>
      <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
            Find your next read
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base">
            Browse what&apos;s popular, new, and recommended for you
          </p>
        </div>

        <TabsList className="grid h-11 w-full grid-cols-3 p-1 sm:h-10 sm:w-auto">
          <TabsTrigger
            value="popular"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-1.5 text-xs sm:text-sm"
          >
            <Users className="hidden h-4 w-4 sm:block" />
            Popular
          </TabsTrigger>
          <TabsTrigger
            value="latest"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-1.5 text-xs sm:text-sm"
          >
            <Clock className="hidden h-4 w-4 sm:block" />
            Latest
          </TabsTrigger>
          <TabsTrigger
            value="recommended"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-1.5 text-xs sm:text-sm"
          >
            <Star className="hidden h-4 w-4 sm:block" />
            Recommended
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="popular" className="mt-0">
        <NovelGrid
          novels={popularNovels || undefined}
          loading={popularLoading}
          maxItems={maxItems}
          size={size}
          emptyMessage="No popular novels found"
          emptyIcon="book"
        />
      </TabsContent>

      <TabsContent value="latest" className="mt-0">
        <NovelGrid
          novels={latestNovels || undefined}
          loading={latestLoading}
          maxItems={maxItems}
          size={size}
          emptyMessage="No latest novels found"
          emptyIcon="clock"
        />
      </TabsContent>

      <TabsContent value="recommended" className="mt-0">
        <NovelGrid
          novels={recommendedNovels || undefined}
          loading={recommendedLoading}
          maxItems={maxItems}
          size={size}
          emptyMessage="No recommended novels found"
          emptyIcon="star"
        />
      </TabsContent>
    </Tabs>
  );
}
