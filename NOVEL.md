# Rantale Frontend - API Integration Guide

This document provides a comprehensive step-by-step guide for adding new APIs to
your Rantale frontend application.

## Architecture Overview

The Rantale frontend follows a layered architecture pattern:

- **Types Layer**: TypeScript interfaces and types (`src/types/api.ts`)
- **Service Layer**: API calls and data fetching (`src/services/`)
- **Hook Layer**: React state management (`src/hooks/`)
- **Component Layer**: UI components (`src/components/`)
- **Page Layer**: Route components (`src/app/`)

## Step-by-Step Guide to Add New APIs

### 1. **Define Types First** (`src/types/api.ts`)

Add your new data types and request/response interfaces:

```typescript
// Example: Adding Book Review API types
export interface BookReview {
  id: string;
  userId: string;
  novelId: string;
  rating: number; // 1-5
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  user?: User; // Optional populated user data
}

export interface CreateReviewRequest {
  novelId: string;
  rating: number;
  title: string;
  content: string;
}

export interface UpdateReviewRequest {
  rating?: number;
  title?: string;
  content?: string;
}

// Example: Adding Bookmark API types
export interface Bookmark {
  id: string;
  userId: string;
  novelId: string;
  chapterId?: string;
  note?: string;
  createdAt: string;
  novel?: Novel; // Optional populated novel data
}

export interface CreateBookmarkRequest {
  novelId: string;
  chapterId?: string;
  note?: string;
}
```

### 2. **Create Service Layer** (`src/services/[feature].ts`)

Create a new service file for your API endpoints:

```typescript
// Example: src/services/reviews.ts
import { apiClient } from "@/lib/api-client";
import {
  BookReview,
  CreateReviewRequest,
  UpdateReviewRequest,
  PaginatedResponse,
} from "@/types/api";

export const reviewService = {
  // Get reviews for a novel
  async getNovelReviews(
    novelId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<PaginatedResponse<BookReview>> {
    const response = await apiClient.get<PaginatedResponse<BookReview>>(
      `/novels/${novelId}/reviews`,
      { page, limit },
    );
    return response.data;
  },

  // Get user's reviews
  async getUserReviews(
    page: number = 1,
    limit: number = 10,
  ): Promise<PaginatedResponse<BookReview>> {
    const response = await apiClient.get<PaginatedResponse<BookReview>>(
      "/reviews/my-reviews",
      { page, limit },
    );
    return response.data;
  },

  // Create new review
  async createReview(reviewData: CreateReviewRequest): Promise<BookReview> {
    const response = await apiClient.post<BookReview>("/reviews", reviewData);
    return response.data;
  },

  // Update existing review
  async updateReview(
    reviewId: string,
    reviewData: UpdateReviewRequest,
  ): Promise<BookReview> {
    const response = await apiClient.put<BookReview>(
      `/reviews/${reviewId}`,
      reviewData,
    );
    return response.data;
  },

  // Delete review
  async deleteReview(reviewId: string): Promise<void> {
    await apiClient.delete(`/reviews/${reviewId}`);
  },

  // Get single review
  async getReview(reviewId: string): Promise<BookReview> {
    const response = await apiClient.get<BookReview>(`/reviews/${reviewId}`);
    return response.data;
  },

  // Like/Unlike review
  async likeReview(reviewId: string): Promise<void> {
    await apiClient.post(`/reviews/${reviewId}/like`);
  },

  async unlikeReview(reviewId: string): Promise<void> {
    await apiClient.delete(`/reviews/${reviewId}/like`);
  },
};
```

```typescript
// Example: src/services/bookmarks.ts
import { apiClient } from "@/lib/api-client";
import {
  Bookmark,
  CreateBookmarkRequest,
  PaginatedResponse,
} from "@/types/api";

export const bookmarkService = {
  // Get user's bookmarks
  async getUserBookmarks(
    page: number = 1,
    limit: number = 20,
  ): Promise<PaginatedResponse<Bookmark>> {
    const response = await apiClient.get<PaginatedResponse<Bookmark>>(
      "/bookmarks",
      { page, limit },
    );
    return response.data;
  },

  // Create bookmark
  async createBookmark(bookmarkData: CreateBookmarkRequest): Promise<Bookmark> {
    const response = await apiClient.post<Bookmark>("/bookmarks", bookmarkData);
    return response.data;
  },

  // Remove bookmark
  async removeBookmark(bookmarkId: string): Promise<void> {
    await apiClient.delete(`/bookmarks/${bookmarkId}`);
  },

  // Check if novel is bookmarked
  async isBookmarked(novelId: string): Promise<boolean> {
    try {
      const response = await apiClient.get<{ bookmarked: boolean }>(
        `/bookmarks/check/${novelId}`,
      );
      return response.data.bookmarked;
    } catch {
      return false;
    }
  },
};
```

### 3. **Create Custom Hook** (`src/hooks/use-[feature].ts`)

Build React hooks for state management:

```typescript
// Example: src/hooks/use-reviews.ts
"use client";

import { useState, useEffect, useCallback } from "react";
import { reviewService } from "@/services/reviews";
import {
  BookReview,
  CreateReviewRequest,
  UpdateReviewRequest,
} from "@/types/api";
import { handleApiError } from "@/lib/api-client";
import { useAsync } from "./use-api";

export function useReviews(novelId?: string) {
  const [reviews, setReviews] = useState<BookReview[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });

  // Fetch reviews
  const fetchReviews = useCallback(
    async (page: number = 1) => {
      if (!novelId) return;

      try {
        setLoading(true);
        setError(null);

        const response = await reviewService.getNovelReviews(novelId, page);
        setReviews(response.data);
        setPagination(response.pagination);
      } catch (err) {
        setError(handleApiError(err));
      } finally {
        setLoading(false);
      }
    },
    [novelId],
  );

  // Create review
  const createReview = useAsync(async (reviewData: CreateReviewRequest) => {
    const newReview = await reviewService.createReview(reviewData);
    setReviews((prev) => [newReview, ...prev]);
    return newReview;
  });

  // Update review
  const updateReview = useAsync(
    async (reviewId: string, reviewData: UpdateReviewRequest) => {
      const updatedReview = await reviewService.updateReview(
        reviewId,
        reviewData,
      );
      setReviews((prev) =>
        prev.map((review) => (review.id === reviewId ? updatedReview : review)),
      );
      return updatedReview;
    },
  );

  // Delete review
  const deleteReview = useAsync(async (reviewId: string) => {
    await reviewService.deleteReview(reviewId);
    setReviews((prev) => prev.filter((review) => review.id !== reviewId));
  });

  // Initial load
  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  return {
    // State
    reviews,
    loading,
    error,
    pagination,

    // Actions
    fetchReviews,
    createReview,
    updateReview,
    deleteReview,
    refetch: () => fetchReviews(pagination.page),
  };
}

// Hook for user's own reviews
export function useUserReviews() {
  const [reviews, setReviews] = useState<BookReview[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUserReviews = useCallback(async () => {
    try {
      setLoading(true);
      const response = await reviewService.getUserReviews();
      setReviews(response.data);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUserReviews();
  }, [fetchUserReviews]);

  return {
    reviews,
    loading,
    error,
    refetch: fetchUserReviews,
  };
}
```

```typescript
// Example: src/hooks/use-bookmarks.ts
"use client";

import { useState, useEffect, useCallback } from "react";
import { bookmarkService } from "@/services/bookmarks";
import { Bookmark, CreateBookmarkRequest } from "@/types/api";
import { handleApiError } from "@/lib/api-client";
import { useAsync } from "./use-api";

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBookmarks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await bookmarkService.getUserBookmarks();
      setBookmarks(response.data);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  const addBookmark = useAsync(async (bookmarkData: CreateBookmarkRequest) => {
    const newBookmark = await bookmarkService.createBookmark(bookmarkData);
    setBookmarks((prev) => [newBookmark, ...prev]);
    return newBookmark;
  });

  const removeBookmark = useAsync(async (bookmarkId: string) => {
    await bookmarkService.removeBookmark(bookmarkId);
    setBookmarks((prev) =>
      prev.filter((bookmark) => bookmark.id !== bookmarkId),
    );
  });

  useEffect(() => {
    fetchBookmarks();
  }, [fetchBookmarks]);

  return {
    bookmarks,
    loading,
    error,
    addBookmark,
    removeBookmark,
    refetch: fetchBookmarks,
  };
}

// Hook for checking if a novel is bookmarked
export function useBookmarkStatus(novelId: string) {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [loading, setLoading] = useState(false);

  const checkBookmarkStatus = useCallback(async () => {
    if (!novelId) return;

    try {
      setLoading(true);
      const bookmarked = await bookmarkService.isBookmarked(novelId);
      setIsBookmarked(bookmarked);
    } catch (err) {
      console.error("Error checking bookmark status:", err);
    } finally {
      setLoading(false);
    }
  }, [novelId]);

  const toggleBookmark = useAsync(async () => {
    if (isBookmarked) {
      // Find and remove bookmark
      // Note: You might need to modify this based on your API design
      await bookmarkService.removeBookmark(novelId);
      setIsBookmarked(false);
    } else {
      await bookmarkService.createBookmark({ novelId });
      setIsBookmarked(true);
    }
  });

  useEffect(() => {
    checkBookmarkStatus();
  }, [checkBookmarkStatus]);

  return {
    isBookmarked,
    loading,
    toggleBookmark,
    refetch: checkBookmarkStatus,
  };
}
```

### 4. **Create UI Components** (`src/components/[feature]/`)

Build reusable components:

```typescript
// Example: src/components/reviews/ReviewForm.tsx
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Star } from 'lucide-react';
import { CreateReviewRequest } from '@/types/api';

interface ReviewFormProps {
  novelId: string;
  onSubmit: (data: CreateReviewRequest) => Promise<void>;
  loading?: boolean;
}

export function ReviewForm({ novelId, onSubmit, loading }: ReviewFormProps) {
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [hoveredStar, setHoveredStar] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      novelId,
      rating,
      title,
      content,
    });

    // Reset form
    setRating(5);
    setTitle('');
    setContent('');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Write a Review</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Rating</Label>
            <div className="flex gap-1 mt-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredStar(star)}
                  onMouseLeave={() => setHoveredStar(0)}
                  className="p-1 hover:scale-110 transition-transform"
                >
                  <Star
                    className={`h-6 w-6 ${
                      star <= (hoveredStar || rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="title">Review Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Write a title for your review..."
              required
            />
          </div>

          <div>
            <Label htmlFor="content">Review Content</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share your thoughts about this novel..."
              rows={5}
              required
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Submitting...' : 'Submit Review'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
```

```typescript
// Example: src/components/reviews/ReviewCard.tsx
"use client";

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Star, ThumbsUp, MoreHorizontal, Edit, Trash } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { BookReview } from '@/types/api';
import { formatDistance } from 'date-fns';

interface ReviewCardProps {
  review: BookReview;
  canEdit?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onLike?: () => void;
}

export function ReviewCard({ review, canEdit, onEdit, onDelete, onLike }: ReviewCardProps) {
  const [isLiked, setIsLiked] = useState(false);

  const handleLike = () => {
    setIsLiked(!isLiked);
    onLike?.();
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={review.user?.avatar} />
              <AvatarFallback>
                {review.user?.name?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{review.user?.name || 'Anonymous'}</p>
              <p className="text-sm text-muted-foreground">
                {formatDistance(new Date(review.createdAt), new Date(), { addSuffix: true })}
              </p>
            </div>
          </div>

          {canEdit && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onEdit}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onDelete} className="text-destructive">
                  <Trash className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="flex">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < review.rating
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <Badge variant="secondary">{review.rating}/5</Badge>
          </div>

          <h4 className="font-semibold text-lg">{review.title}</h4>

          <p className="text-muted-foreground leading-relaxed">
            {review.content}
          </p>

          <div className="flex items-center justify-between pt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              className={isLiked ? 'text-blue-600' : 'text-muted-foreground'}
            >
              <ThumbsUp className={`h-4 w-4 mr-2 ${isLiked ? 'fill-current' : ''}`} />
              {isLiked ? 'Liked' : 'Like'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
```

```typescript
// Example: src/components/bookmarks/BookmarkButton.tsx
"use client";

import { Button } from '@/components/ui/button';
import { Bookmark, BookmarkCheck } from 'lucide-react';
import { useBookmarkStatus } from '@/hooks/use-bookmarks';
import { useAuth } from '@/hooks/use-auth';

interface BookmarkButtonProps {
  novelId: string;
  variant?: 'default' | 'ghost' | 'outline';
}

export function BookmarkButton({ novelId, variant = 'outline' }: BookmarkButtonProps) {
  const { isAuthenticated } = useAuth();
  const { isBookmarked, loading, toggleBookmark } = useBookmarkStatus(novelId);

  if (!isAuthenticated) return null;

  return (
    <Button
      variant={variant}
      size="sm"
      onClick={() => toggleBookmark.execute()}
      disabled={loading || toggleBookmark.loading}
      className="flex items-center gap-2"
    >
      {isBookmarked ? (
        <>
          <BookmarkCheck className="h-4 w-4" />
          Bookmarked
        </>
      ) : (
        <>
          <Bookmark className="h-4 w-4" />
          Bookmark
        </>
      )}
    </Button>
  );
}
```

### 5. **Use in Pages/Components**

Integrate your new API in your pages:

```typescript
// Example: src/app/novels/[id]/page.tsx
"use client";

import { useReviews } from '@/hooks/use-reviews';
import { useBookmarks } from '@/hooks/use-bookmarks';
import { ReviewForm } from '@/components/reviews/ReviewForm';
import { ReviewCard } from '@/components/reviews/ReviewCard';
import { BookmarkButton } from '@/components/bookmarks/BookmarkButton';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function NovelDetailPage({ params }: { params: { id: string } }) {
  const { user, isAuthenticated } = useAuth();
  const { reviews, loading, createReview, deleteReview, pagination, fetchReviews } = useReviews(params.id);

  const handleCreateReview = async (reviewData: CreateReviewRequest) => {
    await createReview.execute(reviewData);
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (confirm('Are you sure you want to delete this review?')) {
      await deleteReview.execute(reviewId);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Novel Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Novel Title</h1>
          <p className="text-muted-foreground">By Author Name</p>
        </div>

        <div className="flex gap-2">
          <BookmarkButton novelId={params.id} />
          <Button>Start Reading</Button>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">
            Reviews ({pagination.total})
          </h2>
        </div>

        {/* Review Form */}
        {isAuthenticated && (
          <div className="mb-8">
            <ReviewForm
              novelId={params.id}
              onSubmit={handleCreateReview}
              loading={createReview.loading}
            />
          </div>
        )}

        {/* Reviews List */}
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-48 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        ) : (
          <>
            <div className="space-y-4 mb-6">
              {reviews.map(review => (
                <ReviewCard
                  key={review.id}
                  review={review}
                  canEdit={user?.id === review.userId}
                  onDelete={() => handleDeleteReview(review.id)}
                />
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchReviews(pagination.page - 1)}
                  disabled={!pagination.hasPrev}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>

                <span className="text-sm text-muted-foreground">
                  Page {pagination.page} of {pagination.totalPages}
                </span>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchReviews(pagination.page + 1)}
                  disabled={!pagination.hasNext}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
```

### 6. **Update Environment Variables** (if needed)

If you need additional API endpoints or configurations, update your
`.env.local`:

```env
# Add any new environment variables
NEXT_PUBLIC_REVIEWS_ENDPOINT=https://api.example.com/reviews
NEXT_PUBLIC_ENABLE_REVIEWS=true
NEXT_PUBLIC_MAX_REVIEW_LENGTH=2000
```

### 7. **Error Handling & Loading States**

Always implement proper error handling:

```typescript
// In your components
if (loading) {
  return (
    <div className="flex items-center justify-center py-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );
}

if (error) {
  return (
    <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
      <p className="text-destructive text-sm">Error: {error}</p>
      <Button variant="outline" size="sm" onClick={refetch} className="mt-2">
        Try Again
      </Button>
    </div>
  );
}
```

## Common API Patterns

### Authentication-Required APIs

```typescript
// In your service
export const protectedService = {
  async createResource(data: CreateRequest): Promise<Resource> {
    // apiClient automatically adds auth token
    const response = await apiClient.post<Resource>(
      "/protected-resource",
      data,
    );
    return response.data;
  },
};
```

### File Upload APIs

```typescript
// In your service
export const uploadService = {
  async uploadAvatar(file: File): Promise<{ url: string }> {
    const response = await apiClient.uploadFile<{ url: string }>(
      "/upload/avatar",
      file,
      "avatar",
    );
    return response.data;
  },
};
```

### Real-time Updates with WebSockets

```typescript
// In your hook
export function useRealTimeUpdates(resourceId: string) {
  useEffect(() => {
    const ws = new WebSocket(`${env.WS_URL}/updates/${resourceId}`);

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      // Update your state based on real-time data
    };

    return () => ws.close();
  }, [resourceId]);
}
```

## Summary of Files to Create/Modify:

1. **Types**: `src/types/api.ts` - Add new interfaces
2. **Service**: `src/services/[feature].ts` - API calls
3. **Hook**: `src/hooks/use-[feature].ts` - State management
4. **Components**: `src/components/[feature]/` - UI components
5. **Pages**: Use hooks and components in your pages
6. **Environment**: Update `.env.local` if needed

## Benefits of This Pattern:

- ✅ **Type Safety** - TypeScript throughout the entire flow
- ✅ **Separation of Concerns** - Clear layer separation
- ✅ **Reusability** - Hooks and components can be reused across pages
- ✅ **Error Handling** - Consistent error management with user feedback
- ✅ **Loading States** - Built-in loading indicators
- ✅ **Authentication** - Automatic token handling via apiClient
- ✅ **Caching** - State management prevents unnecessary API calls
- ✅ **Optimistic Updates** - Immediate UI updates for better UX

## Next Steps

1. Choose the API feature you want to implement
2. Follow the 7-step process outlined above
3. Test your implementation thoroughly
4. Add error boundaries for production resilience
5. Consider implementing caching strategies for performance
6. Add loading skeletons for better user experience

This pattern ensures consistent, maintainable, and scalable API integrations
throughout your Rantale application.
