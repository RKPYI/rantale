"use client";

import Link from "next/link";
import Image from "next/image";
import { BookOpen, TrendingUp, Star, Eye, Heart } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatRating, truncateDescription } from "@/lib/novel-utils";
import { cn } from "@/lib/utils";
import { Novel } from "@/types/api";

interface NovelCardProps {
  novel: Novel;
  size?: "default" | "compact" | "featured";
  className?: string;
}

export function NovelCard({ novel, size = "default", className }: NovelCardProps) {
  const isCompact = size === "compact";
  const isFeatured = size === "featured";
  
  return (
    <Link href={`/novels/${novel.slug}`} className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-lg">
      <Card className={cn(
        "group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-[1.02] focus-within:shadow-lg focus-within:scale-[1.02]",
        isFeatured && "border-primary/20",
        isCompact ? "h-auto" : "h-full",
        className
      )}>
      <div className={cn(
        "relative overflow-hidden",
        isCompact ? "aspect-[3/2]" : "aspect-[2/3]",
        isFeatured && "aspect-[2/3]"
      )}>
        {novel.cover_image ? (
          <Image
            src={novel.cover_image}
            alt={novel.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-110"
            sizes={isFeatured ? "(max-width: 768px) 100vw, 50vw" : "(max-width: 768px) 50vw, 25vw"}
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
            <BookOpen className="h-12 w-12 text-muted-foreground" />
          </div>
        )}
        
        {/* Status Badge */}
        <Badge 
          variant={novel.status === 'completed' ? 'default' : novel.status === 'ongoing' ? 'secondary' : 'outline'}
          className="absolute top-2 left-2 text-xs"
          tabIndex={-1}
        >
          {novel.status}
        </Badge>
        
        {/* Featured/Trending Badges */}
        {novel.is_featured && (
          <Badge variant="destructive" className="absolute top-2 right-2 text-xs" tabIndex={-1}>
            Featured
          </Badge>
        )}
        {novel.is_trending && !novel.is_featured && (
          <Badge className="absolute top-2 right-2 text-xs bg-orange-500 hover:bg-orange-600" tabIndex={-1}>
            <TrendingUp className="w-3 h-3 mr-1" />
            Trending
          </Badge>
        )}
        
        {/* Overlay for featured cards */}
        {isFeatured && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        )}
      </div>
      
      <CardContent className={cn("p-4", isCompact && "p-3")}>
        <div className="space-y-2">
          <div>
            <h3 className={cn(
              "font-semibold line-clamp-2 group-hover:text-primary transition-colors",
              isCompact ? "text-sm" : "text-base",
              isFeatured && "text-lg"
            )}>
              {novel.title}
            </h3>
            <p className={cn(
              "text-muted-foreground",
              isCompact ? "text-xs" : "text-sm"
            )}>
              by {novel.author}
            </p>
          </div>
          
          {!isCompact && novel.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {truncateDescription(novel.description, 100)}
            </p>
          )}
          
          {/* Genres */}
          <div className="flex flex-wrap gap-1">
            {novel.genres.slice(0, isCompact ? 2 : 3).map((genre) => (
              <Badge key={genre.id} variant="outline" className="text-xs h-5" tabIndex={-1}>
                {genre.name}
              </Badge>
            ))}
            {novel.genres.length > (isCompact ? 2 : 3) && (
              <Badge variant="outline" className="text-xs h-5" tabIndex={-1}>
                +{novel.genres.length - (isCompact ? 2 : 3)}
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
      
      <CardFooter className={cn("pt-0 pb-4 px-4 flex justify-between items-center", isCompact && "px-3 pb-3")}>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          {novel.rating && (
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-current text-yellow-400" />
              <span>{formatRating(novel.rating)}</span>
              {novel.rating_count && <span>({novel.rating_count})</span>}
            </div>
          )}
          
          {novel.total_chapters && (
            <div className="flex items-center gap-1">
              <BookOpen className="h-3 w-3" />
              <span>{novel.total_chapters} ch</span>
            </div>
          )}
          
          {novel.views && (
            <div className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              <span>{novel.views > 1000 ? `${Math.floor(novel.views / 1000)}k` : novel.views}</span>
            </div>
          )}
          
          {novel.likes && (
            <div className="flex items-center gap-1">
              <Heart className="h-3 w-3" />
              <span>{novel.likes > 1000 ? `${Math.floor(novel.likes / 1000)}k` : novel.likes}</span>
            </div>
          )}
        </div>
      </CardFooter>
    </Card>
    </Link>
  );
}