import { Novel, Genre, PaginatedResponse } from "@/types/api";

/**
 * Utility functions for working with novel data
 */

// Format novel rating for display
export function formatRating(
  rating: string | number | undefined | null,
): string {
  if (!rating && rating !== 0) return "0.0";
  const numRating = typeof rating === "string" ? parseFloat(rating) : rating;
  return isNaN(numRating) ? "0.0" : numRating.toFixed(1);
}

// Get genre names from genre objects
export function getGenreNames(genres: Genre[]): string[] {
  return genres.map((genre) => genre.name);
}

// Get genre slugs from genre objects
export function getGenreSlugs(genres: Genre[]): string[] {
  return genres.map((genre) => genre.slug);
}

// Format status for display
export function formatStatus(status: string): string {
  switch (status.toLowerCase()) {
    case "ongoing":
      return "Ongoing";
    case "completed":
      return "Completed";
    case "hiatus":
      return "On Hiatus";
    default:
      return status;
  }
}

// Get status color for badges
export function getStatusColor(
  status: string,
): "default" | "secondary" | "destructive" | "outline" {
  switch (status.toLowerCase()) {
    case "ongoing":
      return "default";
    case "completed":
      return "secondary";
    case "hiatus":
      return "outline";
    default:
      return "outline";
  }
}

// Format chapter count for display
export function formatChapterCount(count: number | undefined | null): string {
  if (!count || count === 0) return "No chapters";
  if (count === 1) return "1 chapter";
  return `${count.toLocaleString()} chapters`;
}

// Format view count for display
export function formatViewCount(views: number | undefined | null): string {
  if (!views || views === 0) return "0";
  if (views < 1000) return views.toString();
  if (views < 1000000) return `${(views / 1000).toFixed(1)}K`;
  return `${(views / 1000000).toFixed(1)}M`;
}

// Check if novel has cover image
export function hasCoverImage(novel: Novel): boolean {
  return novel.cover_image !== null && novel.cover_image !== "";
}

// Get fallback cover URL or null
export function getCoverImageUrl(novel: Novel): string | null {
  return novel.cover_image || null;
}

// Truncate description text
export function truncateDescription(
  description: string,
  maxLength: number = 150,
): string {
  if (description.length <= maxLength) return description;
  return description.substring(0, maxLength).trim() + "...";
}

// Extract pagination info in a more readable format
export interface SimplePagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNext: boolean;
  hasPrev: boolean;
  from: number;
  to: number;
}

export function simplifyPagination<T>(
  paginatedResponse: PaginatedResponse<T>,
): SimplePagination {
  return {
    currentPage: paginatedResponse.current_page,
    totalPages: paginatedResponse.last_page,
    totalItems: paginatedResponse.total,
    itemsPerPage: paginatedResponse.per_page,
    hasNext: paginatedResponse.next_page_url !== null,
    hasPrev: paginatedResponse.prev_page_url !== null,
    from: paginatedResponse.from ?? 0,
    to: paginatedResponse.to ?? 0,
  };
}

// Filter novels by genre
export function filterNovelsByGenre(
  novels: Novel[],
  genreSlug: string,
): Novel[] {
  return novels.filter((novel) =>
    novel.genres.some((genre) => genre.slug === genreSlug),
  );
}

// Sort novels by various criteria
export function sortNovels(
  novels: Novel[],
  sortBy: "rating" | "views" | "chapters" | "updated" | "created",
  order: "asc" | "desc" = "desc",
): Novel[] {
  return [...novels].sort((a, b) => {
    let aValue: number | string;
    let bValue: number | string;

    switch (sortBy) {
      case "rating":
        aValue = parseFloat(a.rating || "0");
        bValue = parseFloat(b.rating || "0");
        break;
      case "views":
        aValue = a.views || 0;
        bValue = b.views || 0;
        break;
      case "chapters":
        aValue = a.total_chapters || 0;
        bValue = b.total_chapters || 0;
        break;
      case "updated":
        aValue = new Date(a.updated_at).getTime();
        bValue = new Date(b.updated_at).getTime();
        break;
      case "created":
        aValue = new Date(a.created_at).getTime();
        bValue = new Date(b.created_at).getTime();
        break;
      default:
        return 0;
    }

    if (order === "asc") {
      return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
    } else {
      return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
    }
  });
}

// Search novels by title or author (client-side)
export function searchNovels(novels: Novel[], query: string): Novel[] {
  const lowerQuery = query.toLowerCase();
  return novels.filter(
    (novel) =>
      novel.title.toLowerCase().includes(lowerQuery) ||
      novel.author.toLowerCase().includes(lowerQuery) ||
      novel.description.toLowerCase().includes(lowerQuery),
  );
}

// Get unique genres from a list of novels
export function getUniqueGenres(novels: Novel[]): Genre[] {
  const genreMap = new Map<number, Genre>();

  novels.forEach((novel) => {
    novel.genres.forEach((genre) => {
      genreMap.set(genre.id, genre);
    });
  });

  return Array.from(genreMap.values()).sort((a, b) =>
    a.name.localeCompare(b.name),
  );
}

// Calculate average rating from novels
export function calculateAverageRating(novels: Novel[]): number {
  if (novels.length === 0) return 0;

  const total = novels.reduce(
    (sum, novel) => sum + parseFloat(novel.rating || "0"),
    0,
  );
  return total / novels.length;
}

// Get novels by status
export function getNovelsByStatus(
  novels: Novel[],
  status: "ongoing" | "completed" | "hiatus",
): Novel[] {
  return novels.filter((novel) => novel.status === status);
}

// Format date for display
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// Format relative time (e.g., "2 days ago")
export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 2592000)
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  if (diffInSeconds < 31536000)
    return `${Math.floor(diffInSeconds / 2592000)}mo ago`;
  return `${Math.floor(diffInSeconds / 31536000)}y ago`;
}

// Format numbers for display (e.g., 1000 -> 1K)
export function formatNumber(num: number): string {
  if (num < 1000) return num.toString();
  if (num < 1000000) return `${(num / 1000).toFixed(1)}K`;
  if (num < 1000000000) return `${(num / 1000000).toFixed(1)}M`;
  return `${(num / 1000000000).toFixed(1)}B`;
}
