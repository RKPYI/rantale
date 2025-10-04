"use client";

import Link from "next/link";
import { TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HeroSection, CallToActionSection, SectionHeader } from "@/components/sections";
import { NovelGrid, NovelsTabs } from "@/components/novels";
import { GenreList } from "@/components/genres";
import { usePopularNovels, useGenres } from "@/hooks/use-novels";



export default function Home() {
  // Fetch data using hooks
  const { data: popularNovels, loading: popularLoading } = usePopularNovels();
  const { data: genres, loading: genresLoading } = useGenres();
  
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <HeroSection />

      {/* Featured/Popular Novels */}
      <section className="py-12 lg:py-16">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <SectionHeader 
            title="Featured Novels"
            icon={TrendingUp}
            viewAllHref="/top-rated"
          />
          
          <NovelGrid
            novels={popularNovels || []}
            loading={popularLoading}
            size="featured"
            maxItems={3}
            skeletonCount={3}
          />
        </div>
      </section>

      {/* Main Content Tabs */}
      <section className="py-12 lg:py-16 bg-muted/20">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <NovelsTabs maxItems={10} />
          
          <div className="text-center mt-8">
            <Link href="/search">
              <Button variant="outline" size="lg">
                Explore More Novels
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Genres Section */}
      <section className="py-12 lg:py-16">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
                    <GenreList
            genres={genres || []}
            loading={genresLoading}
          />
        </div>
      </section>

      {/* Call to Action */}
      <CallToActionSection />
    </div>
  );
}
