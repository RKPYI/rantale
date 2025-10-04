"use client";

import { useState } from "react";
import { Clock, Star, Users } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NovelGrid } from "./novel-grid";
import { 
  usePopularNovels, 
  useLatestNovels, 
  useRecommendedNovels 
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
  className 
}: NovelsTabsProps) {
  const [activeTab, setActiveTab] = useState<string>(defaultTab);
  
  // Fetch data using hooks
  const { data: popularNovels, loading: popularLoading } = usePopularNovels();
  const { data: latestNovels, loading: latestLoading } = useLatestNovels();
  const { data: recommendedNovels, loading: recommendedLoading } = useRecommendedNovels();

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className={className}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <h2 className="text-2xl md:text-3xl font-bold">Latest & Popular</h2>
        
        <TabsList className="grid w-full sm:w-auto grid-cols-3">
          <TabsTrigger value="popular" className="text-xs sm:text-sm">
            <Users className="h-4 w-4 mr-2" />
            Popular
          </TabsTrigger>
          <TabsTrigger value="latest" className="text-xs sm:text-sm">
            <Clock className="h-4 w-4 mr-2" />
            Latest
          </TabsTrigger>
          <TabsTrigger value="recommended" className="text-xs sm:text-sm">
            <Star className="h-4 w-4 mr-2" />
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