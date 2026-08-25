"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Clock, Heart, TrendingUp } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { NovelGrid } from "./novel-grid";
import {
  usePopularNovels,
  useLatestNovels,
  useRecommendedNovels,
} from "@/hooks/use-novels";
import { cn } from "@/lib/utils";

const TABS = [
  {
    value: "popular",
    label: "Popular",
    description: "Stories readers keep coming back to",
    icon: TrendingUp,
    href: "/top-rated",
    viewAllLabel: "View top rated",
    emptyMessage: "No popular novels yet — check back soon",
    emptyIcon: "book" as const,
  },
  {
    value: "latest",
    label: "Latest",
    description: "Fresh titles newly added to the library",
    icon: Clock,
    href: "/recently-updated",
    viewAllLabel: "See recent updates",
    emptyMessage: "No new novels yet — check back soon",
    emptyIcon: "clock" as const,
  },
  {
    value: "recommended",
    label: "For you",
    description: "Picks based on what readers like",
    icon: Heart,
    href: "/browse",
    viewAllLabel: "Browse all novels",
    emptyMessage: "No recommendations yet — explore the catalog",
    emptyIcon: "star" as const,
  },
] as const;

type TabValue = (typeof TABS)[number]["value"];

interface NovelsTabsProps {
  defaultTab?: TabValue;
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
  const [activeTab, setActiveTab] = useState<TabValue>(defaultTab);

  const { data: popularNovels, loading: popularLoading } = usePopularNovels();
  const { data: latestNovels, loading: latestLoading } = useLatestNovels();
  const { data: recommendedNovels, loading: recommendedLoading } =
    useRecommendedNovels();

  const active = TABS.find((tab) => tab.value === activeTab) ?? TABS[0];

  const grids = {
    popular: {
      novels: popularNovels,
      loading: popularLoading,
    },
    latest: {
      novels: latestNovels,
      loading: latestLoading,
    },
    recommended: {
      novels: recommendedNovels,
      loading: recommendedLoading,
    },
  } as const;

  return (
    <Tabs
      value={activeTab}
      onValueChange={(value) => setActiveTab(value as TabValue)}
      className={cn("flex flex-col gap-6", className)}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex min-w-0 flex-col gap-1">
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
            Find your next read
          </h2>
          <p
            key={active.value}
            className="text-muted-foreground animate-in fade-in-0 slide-in-from-bottom-1 text-sm duration-200 motion-reduce:animate-none sm:text-base"
          >
            {active.description}
          </p>
        </div>

        <Button
          variant="ghost"
          className="group text-primary hidden self-start sm:inline-flex sm:self-auto"
          asChild
        >
          <Link href={active.href}>
            {active.viewAllLabel}
            <ArrowRight className="transition-transform group-hover:translate-x-0.5" />
          </Link>
        </Button>
      </div>

      <div className="bg-background/95 sticky top-14 z-10 -mx-4 border-b backdrop-blur supports-[backdrop-filter]:bg-background/80 md:top-16 md:-mx-6 lg:-mx-8">
        <div className="scrollbar-hide overflow-x-auto px-4 md:px-6 lg:px-8">
          <TabsList className="bg-transparent text-muted-foreground inline-flex h-auto min-w-full w-max items-stretch justify-start gap-0 rounded-none p-0">
            {TABS.map((tab) => {
              const Icon = tab.icon;

              return (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className={cn(
                    "group relative h-12 flex-none gap-2 rounded-none border-0 bg-transparent px-3.5 text-sm font-medium shadow-none",
                    "text-muted-foreground hover:text-foreground",
                    "data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none",
                    "dark:data-[state=active]:border-transparent dark:data-[state=active]:bg-transparent",
                    "after:bg-primary after:absolute after:inset-x-2 after:bottom-0 after:h-0.5 after:origin-left after:scale-x-0 after:rounded-full after:transition-transform after:duration-200",
                    "data-[state=active]:after:scale-x-100",
                    "sm:px-4",
                  )}
                >
                  <Icon className="size-3.5 group-data-[state=active]:text-primary" />
                  <span>{tab.label}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>
        </div>
      </div>

      {TABS.map((tab) => {
        const grid = grids[tab.value];

        return (
          <TabsContent
            key={tab.value}
            value={tab.value}
            className="mt-0 outline-none"
          >
            <div className="animate-in fade-in-0 slide-in-from-bottom-1 duration-300 motion-reduce:animate-none">
              <NovelGrid
                novels={grid.novels || undefined}
                loading={grid.loading}
                maxItems={maxItems}
                size={size}
                skeletonCount={maxItems}
                emptyMessage={tab.emptyMessage}
                emptyIcon={tab.emptyIcon}
              />
            </div>
          </TabsContent>
        );
      })}

      <div className="flex justify-center sm:hidden">
        <Button variant="outline" className="group w-full" asChild>
          <Link href={active.href}>
            {active.viewAllLabel}
            <ArrowRight className="transition-transform group-hover:translate-x-0.5" />
          </Link>
        </Button>
      </div>
    </Tabs>
  );
}
