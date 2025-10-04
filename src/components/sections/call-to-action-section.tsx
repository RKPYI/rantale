"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CallToActionSectionProps {
  title?: string;
  description?: string;
  primaryButtonText?: string;
  primaryButtonHref?: string;
  secondaryButtonText?: string;
  secondaryButtonHref?: string;
  className?: string;
}

export function CallToActionSection({
  title = "Ready to Start Your Reading Journey?",
  description = "Join thousands of readers discovering amazing stories every day. Create your free account and dive into a world of endless possibilities.",
  primaryButtonText = "Sign Up Free",
  primaryButtonHref = "/register",
  secondaryButtonText = "Learn More",
  secondaryButtonHref = "/help",
  className,
}: CallToActionSectionProps) {
  return (
    <section
      className={cn(
        "from-primary/10 via-primary/5 to-secondary/10 bg-gradient-to-r py-12 lg:py-16",
        className,
      )}
    >
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl space-y-6 text-center">
          <h2 className="text-2xl font-bold md:text-3xl">{title}</h2>
          <p className="text-muted-foreground text-lg">{description}</p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link href={primaryButtonHref}>
              <Button size="lg" className="w-full sm:w-auto">
                {primaryButtonText}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href={secondaryButtonHref}>
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                {secondaryButtonText}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
