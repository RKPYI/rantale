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
  className,
}: SectionHeaderProps) {
  return (
    <div className={cn("mb-8 flex items-center justify-between", className)}>
      <h2 className="flex items-center gap-2 text-2xl font-bold md:text-3xl">
        {Icon && <Icon className="text-primary h-6 w-6" />}
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
