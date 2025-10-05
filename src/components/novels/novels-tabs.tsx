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
  size?: "default" | "compact" | "featured";
  className?: string;
}

export function NovelsTabs({
  defaultTab = "popular",
  maxItems = 10,
  size = "default",
  className,
}: NovelsTabsProps) {
  const [activeTab, setActiveTab] = useState<string>(defaultTab);

  // Fetch data using hooks
  const { data: popularNovels, loading: popularLoading } = usePopularNovels();
  const { data: latestNovels, loading: latestLoading } = useLatestNovels();
  const { data: recommendedNovels, loading: recommendedLoading } =
    useRecommendedNovels();

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className={className}>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold md:text-3xl">Latest & Popular</h2>

        <TabsList className="grid w-full grid-cols-3 sm:w-auto">
          <TabsTrigger value="popular" className="text-xs sm:text-sm">
            <Users className="mr-2 h-4 w-4" />
            Popular
          </TabsTrigger>
          <TabsTrigger value="latest" className="text-xs sm:text-sm">
            <Clock className="mr-2 h-4 w-4" />
            Latest
          </TabsTrigger>
          <TabsTrigger value="recommended" className="text-xs sm:text-sm">
            <Star className="mr-2 h-4 w-4" />
            Recommended
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="popular">
        <NovelGrid
          novels={popularNovels || undefined}
          loading={popularLoading}
          maxItems={maxItems}
          size={size}
          emptyMessage="No popular novels found"
          emptyIcon="book"
        />
      </TabsContent>

      <TabsContent value="latest">
        <NovelGrid
          novels={latestNovels || undefined}
          loading={latestLoading}
          maxItems={maxItems}
          size={size}
          emptyMessage="No latest novels found"
          emptyIcon="clock"
        />
      </TabsContent>

      <TabsContent value="recommended">
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
