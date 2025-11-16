import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Crown, TrendingUp } from "lucide-react";
import { Novel } from "@/types";
import { getNovelBadgeConfig } from "@/lib/novel-utils";

interface NovelBadgeProps {
  novel: Novel;
  className?: string; // extra classes
  positioned?: boolean; // true = apply default absolute position
}

export function NovelBadge({
  novel,
  className,
  positioned = true,
}: NovelBadgeProps) {
  const badgeConfig = getNovelBadgeConfig(novel);

  if (!badgeConfig.show) return null;

  const icon = novel.is_featured ? (
    <Crown className="h-3 w-3 text-white" />
  ) : (
    <TrendingUp className="h-3 w-3 text-white" />
  );

  return (
    <Badge
      variant="default"
      className={cn(
        positioned && "absolute top-2 right-2",
        badgeConfig.className,
        className,
      )}
      tabIndex={-1}
    >
      {icon}
      {badgeConfig.label}
    </Badge>
  );
}
