"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTheme } from "next-themes";
import { BookOpen, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface HeroCover {
  src: string;
  alt: string;
}

interface HeroSectionProps {
  headline?: string;
  description?: string;
  primaryButtonText?: string;
  primaryButtonHref?: string;
  primaryButtonScrollTo?: string;
  secondaryButtonText?: string;
  secondaryButtonHref?: string;
  covers?: HeroCover[];
  className?: string;
}

const FALLBACK_TILES = 18;

export function HeroSection({
  headline = "Open a chapter. Stay for the story.",
  description = "Free novels across genres — start in one tap.",
  primaryButtonText = "Start Reading",
  primaryButtonHref = "/search",
  primaryButtonScrollTo,
  secondaryButtonText = "Browse Novels",
  secondaryButtonHref = "/browse",
  covers = [],
  className,
}: HeroSectionProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handlePrimaryClick = (e: React.MouseEvent) => {
    if (primaryButtonScrollTo) {
      e.preventDefault();
      const element = document.getElementById(primaryButtonScrollTo);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  const coverTiles =
    covers.length > 0
      ? Array.from(
          { length: Math.max(FALLBACK_TILES, covers.length * 2) },
          (_, i) => covers[i % covers.length],
        )
      : [];

  const logoSrc =
    mounted && resolvedTheme === "dark"
      ? "/rantale-dark.svg"
      : "/rantale-light.svg";

  return (
    <section
      className={cn(
        "relative isolate flex min-h-[70vh] items-end overflow-hidden sm:min-h-[75vh] lg:min-h-[85vh]",
        className,
      )}
    >
      {/* Cover wall — full-bleed atmosphere */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden bg-background dark:bg-zinc-950"
      >
        {coverTiles.length > 0 ? (
          <div className="hero-cover-drift absolute inset-[-8%] grid grid-cols-4 gap-2 opacity-60 sm:grid-cols-5 sm:gap-3 md:grid-cols-6 md:opacity-70 lg:grid-cols-8 lg:gap-3 dark:opacity-90">
            {coverTiles.map((cover, i) => (
              <div
                key={`${cover.src}-${i}`}
                className={cn(
                  "relative aspect-[2/3] overflow-hidden rounded-sm shadow-lg shadow-black/10 dark:shadow-black/40",
                  i % 3 === 1 && "translate-y-4 sm:translate-y-6",
                  i % 5 === 2 && "-translate-y-2 sm:-translate-y-4",
                )}
              >
                <Image
                  src={cover.src}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 25vw, (max-width: 1024px) 16vw, 12vw"
                  priority={i < 4}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="from-primary/15 via-background to-background dark:from-primary/40 dark:via-zinc-950 dark:to-zinc-950 absolute inset-0 bg-gradient-to-br" />
        )}

        {/* Light mode scrims */}
        <div className="absolute inset-0 bg-gradient-to-t from-white via-white/90 to-white/55 dark:hidden" />
        <div className="absolute inset-0 hidden bg-gradient-to-r from-white/95 via-white/50 to-white/75 dark:hidden" />

        {/* Dark mode scrims */}
        <div className="absolute inset-0 hidden bg-gradient-to-t from-zinc-950 via-zinc-950/75 to-zinc-950/40 dark:block" />
        <div className="absolute inset-0 hidden bg-gradient-to-r from-zinc-950/80 via-zinc-950/30 to-zinc-950/60 dark:block" />
      </div>

      <div className="container relative mx-auto px-4 pt-28 pb-14 md:px-6 md:pb-20 lg:px-8 lg:pb-24">
        <div className="hero-content-enter max-w-2xl space-y-5 text-left sm:space-y-6">
          <h1 className="flex items-center">
            {!mounted ? (
              <span
                aria-hidden="true"
                className="bg-muted inline-block h-10 w-[108px] animate-pulse rounded-md sm:h-12 sm:w-[130px] md:h-14 md:w-[152px] lg:h-16 lg:w-[174px]"
              />
            ) : (
              <Image
                src={logoSrc}
                alt="Rantale"
                width={442}
                height={163}
                className="h-10 w-auto sm:h-12 md:h-14 lg:h-16"
                priority
              />
            )}
          </h1>
          <p className="text-foreground text-2xl font-semibold tracking-tight text-balance sm:text-3xl md:text-4xl dark:text-white">
            {headline}
          </p>
          <p className="text-muted-foreground max-w-lg text-base sm:text-lg dark:text-white/75">
            {description}
          </p>
          <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center">
            {primaryButtonScrollTo ? (
              <Button
                size="lg"
                className="w-full shadow-md shadow-black/10 sm:w-auto dark:shadow-lg dark:shadow-black/30"
                onClick={handlePrimaryClick}
              >
                <BookOpen className="mr-2 h-5 w-5" />
                {primaryButtonText}
              </Button>
            ) : (
              <Link href={primaryButtonHref}>
                <Button
                  size="lg"
                  className="w-full shadow-md shadow-black/10 sm:w-auto dark:shadow-lg dark:shadow-black/30"
                >
                  <BookOpen className="mr-2 h-5 w-5" />
                  {primaryButtonText}
                </Button>
              </Link>
            )}
            <Link href={secondaryButtonHref}>
              <Button
                variant="outline"
                size="lg"
                className={cn(
                  "w-full sm:w-auto",
                  "border-border bg-background/80 text-foreground hover:bg-muted",
                  "dark:border-white/25 dark:bg-white/5 dark:text-white dark:hover:bg-white/15 dark:hover:text-white",
                )}
              >
                <Search className="mr-2 h-5 w-5" />
                {secondaryButtonText}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
