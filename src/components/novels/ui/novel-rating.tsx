import { formatRating, formatViewCount } from "@/lib/novel-utils";
import { cn } from "@/lib/utils";
import { Novel } from "@/types";
import { Star } from "lucide-react";

interface NovelRatingProps {
  novel: Novel;
  type?: "small" | "default";
}

export function NovelRating({ novel, type = "default" }: NovelRatingProps) {
  if (novel.rating === null || novel.rating === undefined) {
    return null;
  }

  return (
    <div className="flex items-center gap-1 font-medium text-yellow-600">
      <Star
        className={cn("h-4 w-4 fill-current", type === "small" && "h-3 w-3")}
      />
      <span className={cn(type === "small" && "text-xs")}>
        {formatRating(novel.rating)}
      </span>
      {novel.rating_count !== null && novel.rating_count !== undefined && (
        <span className="text-muted-foreground text-xs">
          ({formatViewCount(novel.rating_count)})
        </span>
      )}
    </div>
  );
}
