import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Crown, TrendingUp } from "lucide-react";
import { Novel } from "@/types";
import { getNovelBadgeConfig } from "@/lib/novel-utils";

interface NovelBadgeProps {
  novel: Novel;
  className?: string;
  positioned?: boolean;
  /** Icon + color only (no label). Use `"mobile"` to show the label from `sm` up. */
  iconOnly?: boolean | "mobile";
}

export function NovelBadge({
  novel,
  className,
  positioned = true,
  iconOnly = false,
}: NovelBadgeProps) {
  const badgeConfig = getNovelBadgeConfig(novel);

  if (!badgeConfig.show) return null;

  const alwaysIcon = iconOnly === true;
  const mobileIcon = iconOnly === "mobile";
  const isFeatured = novel.is_featured;

  const icon = isFeatured ? (
    <Crown className="size-3 text-white" aria-hidden />
  ) : (
    <TrendingUp className="size-3 text-white" aria-hidden />
  );

  const label = badgeConfig.label || (isFeatured ? "Featured" : "Trending");

  return (
    <Badge
      variant="default"
      aria-label={label}
      title={label}
      className={cn(
        positioned && "absolute top-2 right-2",
        badgeConfig.className,
        (alwaysIcon || mobileIcon) &&
          "size-7 justify-center gap-0 rounded-full p-0 shadow-md",
        mobileIcon &&
          "sm:h-auto sm:w-auto sm:gap-1 sm:rounded-md sm:px-2 sm:py-0.5 sm:shadow-none",
        className,
      )}
      tabIndex={-1}
    >
      {icon}
      <span
        className={cn(
          alwaysIcon && "hidden",
          mobileIcon && "hidden sm:inline",
        )}
      >
        {badgeConfig.label}
      </span>
    </Badge>
  );
}
