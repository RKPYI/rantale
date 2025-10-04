"use client";

import Link from "next/link";
import { ArrowRight, LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  title: string;
  icon?: LucideIcon;
  viewAllText?: string;
  viewAllHref?: string;
  className?: string;
}

export function SectionHeader({
  title,
  icon: Icon,
  viewAllText = "View All",
  viewAllHref,
  className
}: SectionHeaderProps) {
  return (
    <div className={cn("flex items-center justify-between mb-8", className)}>
      <h2 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
        {Icon && <Icon className="h-6 w-6 text-primary" />}
        {title}
      </h2>
      {viewAllHref && (
        <Link href={viewAllHref}>
          <Button variant="ghost" className="group">
            {viewAllText}
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </Link>
      )}
    </div>
  );
}