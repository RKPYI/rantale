"use client";

import Link from "next/link";
import Script from "next/script";
import { TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  HeroSection,
  CallToActionSection,
  SectionHeader,
} from "@/components/sections";
import { NovelGrid, NovelsTabs } from "@/components/novels";
import { ContinueReading } from "@/components/sections/continue-reading";
import { usePopularNovels } from "@/hooks/use-novels";
import { useAuth } from "@/contexts/auth-context";

export default function Home() {
  const { data: popularNovels, loading: popularLoading } = usePopularNovels();
  const { isAuthenticated } = useAuth();

  const heroCovers =
    popularNovels
      ?.filter((n) => n.cover_image)
      .slice(0, 12)
      .map((n) => ({
        src: n.cover_image as string,
        alt: n.title,
      })) ?? [];

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Rantale",
    description:
      "Discover and read amazing novels on Rantale. Browse thousands of stories across multiple genres.",
    url: process.env.NEXT_PUBLIC_SITE_URL || "https://rantale.randk.me",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${process.env.NEXT_PUBLIC_SITE_URL || "https://rantale.randk.me"}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <>
      <Script
        id="structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <div className="bg-background min-h-screen">
        <HeroSection
          covers={heroCovers}
          primaryButtonScrollTo="main-content-tabs"
          secondaryButtonText="Browse Novels"
          secondaryButtonHref="/browse"
        />

        {isAuthenticated && (
          <section className="section-enter py-6 lg:py-8">
            <div className="container mx-auto px-4 md:px-6 lg:px-8">
              <ContinueReading variant="compact" showTitle={true} />
            </div>
          </section>
        )}

        <section className="section-enter py-8 lg:py-12">
          <div className="container mx-auto px-4 md:px-6 lg:px-8">
            <SectionHeader
              title="Popular right now"
              icon={TrendingUp}
              viewAllHref="/top-rated"
              className="mb-6"
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

        <section
          id="main-content-tabs"
          className="section-enter bg-muted/20 py-8 lg:py-12"
        >
          <div className="container mx-auto px-4 md:px-6 lg:px-8">
            <NovelsTabs maxItems={12} />

            <div className="mt-8 text-center">
              <Link href="/recently-updated">
                <Button size="lg" className="w-full sm:w-auto">
                  Explore More Novels
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {!isAuthenticated && <CallToActionSection />}
      </div>
    </>
  );
}
