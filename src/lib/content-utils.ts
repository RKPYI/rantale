import { Comment, Rating, ReadingProgressResponse } from '@/types/api';

/**
 * Utility functions for working with comments
 */

// Format comment timestamp for display
export function formatCommentTime(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  return date.toLocaleDateString();
}

// Get comment tree depth (for nested replies)
export function getCommentDepth(comment: Comment, maxDepth: number = 3): number {
  let depth = 0;
  let current = comment;
  
  while (current.parent_id && depth < maxDepth) {
    depth++;
    // Note: You'd need to pass parent comments to calculate this properly
    break;
  }
  
  return depth;
}

// Check if comment is edited
export function isCommentEdited(comment: Comment): boolean {
  const created = new Date(comment.created_at);
  const updated = new Date(comment.updated_at);
  return updated.getTime() - created.getTime() > 1000; // More than 1 second difference
}

// Get comment vote ratio
export function getCommentVoteRatio(comment: Comment): number {
  const total = comment.likes + comment.dislikes;
  if (total === 0) return 0;
  return (comment.likes / total) * 100;
}

// Sort comments by various criteria
export function sortComments(comments: Comment[], sortBy: 'newest' | 'oldest' | 'popular' | 'controversial'): Comment[] {
  return [...comments].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case 'oldest':
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      case 'popular':
        return (b.likes - b.dislikes) - (a.likes - a.dislikes);
      case 'controversial':
        const aRatio = Math.min(a.likes, a.dislikes) / Math.max(a.likes, a.dislikes, 1);
        const bRatio = Math.min(b.likes, b.dislikes) / Math.max(b.likes, b.dislikes, 1);
        return bRatio - aRatio;
      default:
        return 0;
    }
  });
}

/**
 * Utility functions for working with ratings
 */

// Format rating for display
export function formatRatingValue(rating: number): string {
  return rating.toFixed(1);
}

// Get rating stars array (for UI rendering)
export function getRatingStars(rating: number): Array<{ filled: boolean; half: boolean }> {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating - fullStars >= 0.5;
  
  for (let i = 1; i <= 5; i++) {
    if (i <= fullStars) {
      stars.push({ filled: true, half: false });
    } else if (i === fullStars + 1 && hasHalfStar) {
      stars.push({ filled: false, half: true });
    } else {
      stars.push({ filled: false, half: false });
    }
  }
  
  return stars;
}

// Get rating color based on value
export function getRatingColor(rating: number): string {
  if (rating >= 4.5) return '#10b981'; // green
  if (rating >= 4.0) return '#84cc16'; // lime
  if (rating >= 3.5) return '#eab308'; // yellow
  if (rating >= 3.0) return '#f97316'; // orange
  return '#ef4444'; // red
}

// Calculate rating distribution percentages
export function calculateRatingDistribution(ratings: Rating[]): Record<string, number> {
  const distribution = { '5': 0, '4': 0, '3': 0, '2': 0, '1': 0 };
  const total = ratings.length;
  
  if (total === 0) return distribution;
  
  ratings.forEach(rating => {
    distribution[rating.rating.toString() as keyof typeof distribution]++;
  });
  
  Object.keys(distribution).forEach(key => {
    distribution[key as keyof typeof distribution] = 
      (distribution[key as keyof typeof distribution] / total) * 100;
  });
  
  return distribution;
}

// Get rating statistics
export function getRatingStats(ratings: Rating[]): {
  average: number;
  total: number;
  distribution: Record<string, number>;
  median: number;
} {
  const total = ratings.length;
  
  if (total === 0) {
    return {
      average: 0,
      total: 0,
      distribution: { '5': 0, '4': 0, '3': 0, '2': 0, '1': 0 },
      median: 0
    };
  }
  
  const sum = ratings.reduce((acc, rating) => acc + rating.rating, 0);
  const average = sum / total;
  
  const sortedRatings = ratings.map(r => r.rating).sort((a, b) => a - b);
  const median = total % 2 === 0 
    ? (sortedRatings[total / 2 - 1] + sortedRatings[total / 2]) / 2
    : sortedRatings[Math.floor(total / 2)];
  
  const distribution = calculateRatingDistribution(ratings);
  
  return { average, total, distribution, median };
}

/**
 * Utility functions for reading progress
 */

// Format progress percentage
export function formatProgressPercentage(percentage: number): string {
  return `${Math.round(percentage)}%`;
}

// Get progress status message
export function getProgressStatusMessage(progress: ReadingProgressResponse): string {
  if (!progress.current_chapter) {
    return 'Not started';
  }
  
  if (progress.progress_percentage >= 100) {
    return 'Completed';
  }
  
  if (progress.progress_percentage > 0) {
    return `Reading - Chapter ${progress.current_chapter.chapter_number}`;
  }
  
  return 'Just started';
}

// Get estimated reading time remaining
export function getEstimatedReadingTime(
  currentChapter: number, 
  totalChapters: number, 
  averageWordsPerChapter: number = 2500,
  wordsPerMinute: number = 200
): string {
  const remainingChapters = totalChapters - currentChapter;
  const remainingWords = remainingChapters * averageWordsPerChapter;
  const remainingMinutes = remainingWords / wordsPerMinute;
  
  if (remainingMinutes < 60) {
    return `${Math.round(remainingMinutes)} minutes`;
  }
  
  const hours = Math.floor(remainingMinutes / 60);
  const minutes = Math.round(remainingMinutes % 60);
  
  if (hours < 24) {
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours} hours`;
  }
  
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  
  return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days} days`;
}

// Get progress color based on percentage
export function getProgressColor(percentage: number): string {
  if (percentage >= 100) return '#10b981'; // green - completed
  if (percentage >= 75) return '#3b82f6'; // blue - almost done
  if (percentage >= 50) return '#8b5cf6'; // purple - halfway
  if (percentage >= 25) return '#f59e0b'; // amber - getting started
  return '#6b7280'; // gray - just started
}

// Sort reading progress by various criteria
export function sortReadingProgress(
  progressList: ReadingProgressResponse[], 
  sortBy: 'recent' | 'title' | 'progress' | 'author'
): ReadingProgressResponse[] {
  return [...progressList].sort((a, b) => {
    switch (sortBy) {
      case 'recent':
        const aTime = a.last_read_at ? new Date(a.last_read_at).getTime() : 0;
        const bTime = b.last_read_at ? new Date(b.last_read_at).getTime() : 0;
        return bTime - aTime;
      case 'progress':
        return b.progress_percentage - a.progress_percentage;
      default:
        return 0;
    }
  });
}

/**
 * Content moderation utilities
 */

// Check if content might contain spoilers (basic keyword detection)
export function containsPotentialSpoilers(content: string): boolean {
  const spoilerKeywords = [
    'spoiler', 'dies', 'death', 'killed', 'ending', 'finale',
    'twist', 'reveal', 'secret', 'betrayal', 'turns out'
  ];
  
  const lowerContent = content.toLowerCase();
  return spoilerKeywords.some(keyword => lowerContent.includes(keyword));
}

// Clean content for display (remove excess whitespace, etc.)
export function cleanContent(content: string): string {
  return content
    .trim()
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .replace(/\n{3,}/g, '\n\n'); // Limit consecutive line breaks
}

// Truncate content for previews
export function truncateContent(content: string, maxLength: number = 100): string {
  const cleaned = cleanContent(content);
  if (cleaned.length <= maxLength) return cleaned;
  
  const truncated = cleaned.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  
  if (lastSpace > maxLength * 0.8) {
    return truncated.substring(0, lastSpace) + '...';
  }
  
  return truncated + '...';
}