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
  className
}: CallToActionSectionProps) {
  return (
    <section className={cn(
      "py-12 lg:py-16 bg-gradient-to-r from-primary/10 via-primary/5 to-secondary/10",
      className
    )}>
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="text-center space-y-6 max-w-2xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold">{title}</h2>
          <p className="text-lg text-muted-foreground">{description}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
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