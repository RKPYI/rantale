"use client";

import Link from "next/link";
import { 
  Sword, 
  Heart, 
  Zap, 
  Crown, 
  Sparkles, 
  Skull, 
  Globe, 
  Rocket, 
  BookOpen, 
  Users,
  Mountain,
  Gamepad2,
  GraduationCap,
  Briefcase,
  TreePine,
  Star
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Genre } from "@/types/api";

interface GenreCardProps {
  genre: Genre;
  novelCount?: number;
  variant?: "default" | "compact" | "featured";
  className?: string;
}

// Genre icon mapping
const genreIcons: Record<string, React.ElementType> = {
  "action": Sword,
  "adventure": Mountain,
  "romance": Heart,
  "fantasy": Sparkles,
  "sci-fi": Rocket,
  "science fiction": Rocket,
  "mystery": Skull,
  "thriller": Zap,
  "drama": Users,
  "comedy": Star,
  "horror": Skull,
  "supernatural": Sparkles,
  "martial arts": Sword,
  "cultivation": Crown,
  "system": Gamepad2,
  "litrpg": Gamepad2,
  "slice of life": TreePine,
  "school life": GraduationCap,
  "business": Briefcase,
  "historical": Crown,
  "contemporary": Globe,
  "urban": Globe,
  "xuanhuan": Sparkles,
  "xianxia": Crown,
  "wuxia": Sword,
};

// Genre color mapping for gradients
const genreColors: Record<string, string> = {
  "action": "from-red-500/20 to-orange-500/20 border-red-200/30",
  "adventure": "from-green-500/20 to-emerald-500/20 border-green-200/30",
  "romance": "from-pink-500/20 to-rose-500/20 border-pink-200/30",
  "fantasy": "from-purple-500/20 to-violet-500/20 border-purple-200/30",
  "sci-fi": "from-blue-500/20 to-cyan-500/20 border-blue-200/30",
  "science fiction": "from-blue-500/20 to-cyan-500/20 border-blue-200/30",
  "mystery": "from-gray-500/20 to-slate-500/20 border-gray-200/30",
  "thriller": "from-yellow-500/20 to-amber-500/20 border-yellow-200/30",
  "drama": "from-indigo-500/20 to-blue-500/20 border-indigo-200/30",
  "comedy": "from-yellow-400/20 to-orange-400/20 border-yellow-200/30",
  "horror": "from-red-900/20 to-gray-800/20 border-red-300/30",
  "supernatural": "from-purple-600/20 to-indigo-600/20 border-purple-200/30",
  "martial arts": "from-red-600/20 to-orange-600/20 border-red-200/30",
  "cultivation": "from-amber-500/20 to-yellow-500/20 border-amber-200/30",
  "system": "from-green-600/20 to-teal-600/20 border-green-200/30",
  "litrpg": "from-green-600/20 to-teal-600/20 border-green-200/30",
  "slice of life": "from-green-400/20 to-lime-400/20 border-green-200/30",
  "school life": "from-blue-400/20 to-sky-400/20 border-blue-200/30",
  "business": "from-gray-600/20 to-slate-600/20 border-gray-200/30",
  "historical": "from-amber-600/20 to-yellow-600/20 border-amber-200/30",
  "contemporary": "from-gray-400/20 to-zinc-400/20 border-gray-200/30",
  "urban": "from-gray-500/20 to-stone-500/20 border-gray-200/30",
  "xuanhuan": "from-purple-500/20 to-pink-500/20 border-purple-200/30",
  "xianxia": "from-yellow-500/20 to-red-500/20 border-yellow-200/30",
  "wuxia": "from-red-500/20 to-yellow-500/20 border-red-200/30",
};

function getGenreIcon(genreName: string): React.ElementType {
  const key = genreName.toLowerCase();
  return genreIcons[key] || BookOpen;
}

function getGenreColor(genreName: string): string {
  const key = genreName.toLowerCase();
  return genreColors[key] || "from-primary/10 to-primary/20 border-primary/20";
}

export function GenreCard({ genre, novelCount, variant = "default", className }: GenreCardProps) {
  const Icon = getGenreIcon(genre.name);
  const colorClass = getGenreColor(genre.name);
  const isCompact = variant === "compact";
  const isFeatured = variant === "featured";

  return (
    <Link href={`/genres/${genre.slug}`} className="block group">
      <div className={cn(
        "relative overflow-hidden rounded-lg transition-all duration-300",
        "hover:shadow-lg hover:scale-[1.02] hover:-translate-y-1",
        "bg-gradient-to-br border-2",
        colorClass,
        isFeatured && "ring-2 ring-primary/20",
        isCompact ? "p-3" : "p-6",
        className
      )}>
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_50%)]" />
        </div>
        
        {/* Content */}
        <div className="relative z-10 flex flex-col items-center text-center space-y-3">
          {/* Icon Container */}
          <div className={cn(
            "rounded-full bg-background/90 backdrop-blur-sm shadow-lg",
            "flex items-center justify-center transition-all duration-300",
            "group-hover:scale-110 group-hover:bg-background group-hover:shadow-xl",
            "border border-white/20",
            isCompact ? "w-10 h-10" : isFeatured ? "w-16 h-16" : "w-14 h-14"
          )}>
            <Icon className={cn(
              "text-foreground/80 group-hover:text-primary transition-colors duration-300",
              isCompact ? "w-5 h-5" : isFeatured ? "w-8 h-8" : "w-7 h-7"
            )} />
          </div>
          
          {/* Genre Info */}
          <div className="space-y-2">
            <h3 className={cn(
              "font-semibold text-foreground group-hover:text-primary transition-colors duration-300",
              isCompact ? "text-xs" : isFeatured ? "text-lg" : "text-sm"
            )}>
              {genre.name}
            </h3>
            
            {/* Novel Count Badge */}
            {novelCount !== undefined && (
              <Badge 
                variant="secondary" 
                className={cn(
                  "bg-background/80 backdrop-blur-sm text-foreground/70 border border-white/20",
                  "group-hover:bg-background group-hover:text-foreground transition-all duration-300",
                  isCompact ? "text-xs px-2 py-0.5" : "text-xs px-3 py-1"
                )}
              >
                {novelCount.toLocaleString()} novel{novelCount !== 1 ? 's' : ''}
              </Badge>
            )}
          </div>
        </div>
        
        {/* Subtle Shine Effect on Hover */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform group-hover:translate-x-full group-hover:translate-y-full" />
      </div>
    </Link>
  );
}