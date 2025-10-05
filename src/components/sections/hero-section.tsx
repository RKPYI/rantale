"use client";

import Link from "next/link";
import { BookOpen, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface HeroSectionProps {
  title?: string;
  subtitle?: string;
  description?: string;
  primaryButtonText?: string;
  primaryButtonHref?: string;
  secondaryButtonText?: string;
  secondaryButtonHref?: string;
  className?: string;
}

export function HeroSection({
  title = "Discover Amazing",
  subtitle = "Web Novels",
  description = "Immerse yourself in captivating stories from talented authors around the world. Read, discover, and fall in love with your next favorite novel.",
  primaryButtonText = "Start Reading",
  primaryButtonHref = "/search",
  secondaryButtonText = "Browse Genres",
  secondaryButtonHref = "/genres",
  className,
}: HeroSectionProps) {
  return (
    <section
      className={cn(
        "from-primary/5 via-background to-secondary/5 bg-gradient-to-br py-12 lg:py-20",
        className,
      )}
    >
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl space-y-6 text-center">
          <h1 className="text-4xl font-bold tracking-tight md:text-6xl">
            {title}
            <span className="text-primary block">{subtitle}</span>
          </h1>
          <p className="text-muted-foreground mx-auto max-w-2xl text-lg md:text-xl">
            {description}
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link href={primaryButtonHref}>
              <Button size="lg" className="w-full sm:w-auto">
                <BookOpen className="mr-2 h-5 w-5" />
                {primaryButtonText}
              </Button>
            </Link>
            <Link href={secondaryButtonHref}>
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                <Filter className="mr-2 h-5 w-5" />
                {secondaryButtonText}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
