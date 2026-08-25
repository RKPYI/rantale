"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AuthModal } from "@/components/auth-modal";

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
  title = "Save your place. Never lose a chapter.",
  description = "Create a free account to track progress, get recommendations, and pick up where you left off.",
  primaryButtonText = "Sign Up Free",
  primaryButtonHref = "/register",
  secondaryButtonText = "Learn More",
  secondaryButtonHref = "/help",
  className,
}: CallToActionSectionProps) {
  return (
    <section
      className={cn(
        "section-enter relative overflow-hidden py-12 lg:py-16",
        className,
      )}
    >
      <div
        aria-hidden="true"
        className="from-primary/15 via-primary/5 to-background absolute inset-0 bg-gradient-to-br"
      />
      <div className="container relative mx-auto px-4 md:px-6 lg:px-8">
        <div className="mx-auto max-w-xl space-y-5 text-center">
          <h2 className="text-2xl font-bold tracking-tight text-balance md:text-3xl">
            {title}
          </h2>
          <p className="text-muted-foreground text-base md:text-lg">
            {description}
          </p>
          <div className="flex flex-col justify-center gap-3 pt-1 sm:flex-row">
            <AuthModal
              defaultTab="signup"
              trigger={
                <Button size="lg" className="w-full sm:w-auto">
                  {primaryButtonText}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              }
            />
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
