"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { DeleteModal } from "@/components/ui/delete-modal";
import { Skeleton } from "@/components/ui/skeleton";
import { AuthModal } from "@/components/auth-modal";
import {
  Star,
  Pencil,
  Trash2,
  MessageSquareQuote,
  ChevronDown,
} from "lucide-react";
import { toast } from "sonner";

import { useNovelRatings, useUserRatingForNovel } from "@/hooks/use-ratings";
import { useAuth } from "@/contexts/auth-context";
import { ratingService } from "@/services/ratings";
import { useAsync } from "@/hooks/use-api";
import { formatRelativeTime, formatNumber, formatRating } from "@/lib/novel-utils";
import { getRatingStars } from "@/lib/content-utils";
import { cn } from "@/lib/utils";

import { CreateRatingRequest } from "@/types/api";
import { UserAvatar } from "./ui/user-avatar";

interface RatingSectionProps {
  novelSlug: string;
  novelId: number;
  title: string;
}

const RATING_LABELS: Record<number, string> = {
  1: "Poor",
  2: "Fair",
  3: "Okay",
  4: "Good",
  5: "Excellent",
};

const INITIAL_VISIBLE_REVIEWS = 5;

export function RatingSection({
  novelSlug,
  novelId,
  title,
}: RatingSectionProps) {
  const [userRating, setUserRating] = useState(0);
  const [userReview, setUserReview] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);

  const { isAuthenticated, loading: authLoading } = useAuth();

  const {
    data: ratingsData,
    loading: ratingsLoading,
    refetch: refetchRatings,
  } = useNovelRatings(novelSlug);
  const {
    data: existingUserRating,
    loading: userRatingLoading,
    refetch: refetchUserRating,
  } = useUserRatingForNovel(novelSlug);

  const isLoading = authLoading || userRatingLoading;
  const { loading: submitting, execute: executeRatingAction } = useAsync();

  const ratings = ratingsData?.ratings.data || [];
  const totalRatingsCount = ratingsData?.ratings.total ?? ratings.length;
  const stats = ratingsData?.stats || {
    average_rating: 0,
    total_ratings: 0,
    rating_breakdown: { "5": 0, "4": 0, "3": 0, "2": 0, "1": 0 },
  };

  const visibleRatings = showAllReviews
    ? ratings
    : ratings.slice(0, INITIAL_VISIBLE_REVIEWS);
  const hasMoreReviews = ratings.length > INITIAL_VISIBLE_REVIEWS;
  const previewStar = hoveredStar || userRating;

  const handleSubmitRating = async () => {
    if (!userRating || !isAuthenticated) {
      toast.error("Please select a rating");
      return;
    }

    const ratingData: CreateRatingRequest = {
      novel_id: novelId,
      rating: userRating,
      ...(userReview.trim() && { review: userReview.trim() }),
    };

    try {
      const result = (await executeRatingAction(
        ratingService.createOrUpdateRating,
        ratingData,
      )) as Awaited<ReturnType<typeof ratingService.createOrUpdateRating>>;

      if (result?.isNew) {
        toast.success("Rating submitted successfully!");
      } else {
        toast.success("Rating updated successfully!");
      }

      setIsEditing(false);
      setUserRating(0);
      setUserReview("");
      refetchRatings();
      refetchUserRating();
    } catch (error) {
      console.error("Error submitting rating:", error);
      toast.error("Failed to submit rating. Please try again.");
    }
  };

  const handleDeleteRating = async () => {
    if (!existingUserRating) return;

    try {
      await executeRatingAction(
        ratingService.deleteRating,
        existingUserRating.id,
      );
      toast.success("Rating deleted successfully!");
      setShowDeleteModal(false);
      refetchRatings();
      refetchUserRating();
    } catch (error) {
      console.error("Error deleting rating:", error);
      toast.error("Failed to delete rating. Please try again.");
    }
  };

  const startEditing = () => {
    if (existingUserRating) {
      setUserRating(existingUserRating.rating);
      setUserReview(existingUserRating.review || "");
    }
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setUserRating(0);
    setUserReview("");
    setHoveredStar(0);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-border/70 space-y-1 border-b pb-4">
        <div className="flex items-center gap-2">
          <Star className="size-5 fill-amber-500 text-amber-500" />
          <h2 className="text-base font-semibold md:text-lg">Ratings</h2>
        </div>
        <p className="text-muted-foreground text-sm">
          {stats.total_ratings > 0
            ? `${formatNumber(stats.total_ratings)} rating${stats.total_ratings === 1 ? "" : "s"} on ${title}`
            : `No ratings yet on ${title}`}
        </p>
      </div>

      {/* Overview */}
      <div className="border-border/70 rounded-md border p-4 sm:p-5">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:gap-8">
          <div className="flex shrink-0 flex-col items-center gap-2 sm:min-w-28">
            <div className="text-5xl font-semibold tracking-tight tabular-nums">
              {stats.total_ratings > 0
                ? formatRating(stats.average_rating)
                : "—"}
            </div>
            <RatingStars rating={stats.average_rating} size="md" />
            <p className="text-muted-foreground text-xs">
              {stats.total_ratings > 0
                ? `${formatNumber(stats.total_ratings)} rating${stats.total_ratings === 1 ? "" : "s"}`
                : "Awaiting first rating"}
            </p>
          </div>

          <div className="w-full flex-1 space-y-2.5">
            {(["5", "4", "3", "2", "1"] as const).map((star) => {
              const count = stats.rating_breakdown[star];
              const percentage =
                stats.total_ratings > 0
                  ? (count / stats.total_ratings) * 100
                  : 0;

              return (
                <div
                  key={star}
                  className="grid grid-cols-[2.5rem_1fr_2rem] items-center gap-2.5 text-sm"
                >
                  <div className="text-muted-foreground flex items-center gap-1 tabular-nums">
                    <span>{star}</span>
                    <Star className="size-3 fill-amber-500/80 text-amber-500/80" />
                  </div>
                  <div className="bg-muted h-2 overflow-hidden rounded-full">
                    <div
                      className="h-full rounded-full bg-amber-500 transition-[width] duration-500 ease-out"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-muted-foreground text-right text-xs tabular-nums">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Your rating */}
      {isLoading ? (
        <div className="border-border/70 space-y-4 rounded-md border p-4">
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-20 w-full rounded-md" />
          <Skeleton className="h-9 w-32 rounded-md" />
        </div>
      ) : isAuthenticated ? (
        <div className="border-border/70 rounded-md border p-4 sm:p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h3 className="text-sm font-semibold">Your rating</h3>
            {existingUserRating && !isEditing && (
              <div className="flex items-center gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 gap-1.5 px-2"
                  onClick={startEditing}
                >
                  <Pencil className="size-3.5" />
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-destructive hover:text-destructive h-8 gap-1.5 px-2"
                  onClick={() => setShowDeleteModal(true)}
                >
                  <Trash2 className="size-3.5" />
                  Delete
                </Button>
              </div>
            )}
          </div>

          {existingUserRating && !isEditing ? (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <RatingStars rating={existingUserRating.rating} size="md" />
                <span className="text-sm font-medium">
                  {RATING_LABELS[existingUserRating.rating]}
                </span>
                <span className="text-muted-foreground text-xs">
                  · {formatRelativeTime(existingUserRating.created_at)}
                </span>
              </div>
              {existingUserRating.review ? (
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {existingUserRating.review}
                </p>
              ) : (
                <button
                  type="button"
                  onClick={startEditing}
                  className="text-muted-foreground hover:text-foreground text-sm underline-offset-2 transition-colors hover:underline"
                >
                  Add a written review
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-5">
              <div className="space-y-3">
                <p className="text-muted-foreground text-sm">
                  Tap a star to rate this novel
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  <InteractiveStars
                    rating={userRating}
                    hoveredStar={hoveredStar}
                    onRate={setUserRating}
                    onHover={setHoveredStar}
                  />
                  <div
                    className={cn(
                      "min-h-5 text-sm transition-opacity",
                      previewStar > 0 ? "opacity-100" : "opacity-0",
                    )}
                    aria-live="polite"
                  >
                    {previewStar > 0 && (
                      <span className="font-medium">
                        {previewStar} · {RATING_LABELS[previewStar]}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="rating-review"
                  className="text-muted-foreground text-sm"
                >
                  Review{" "}
                  <span className="text-muted-foreground/70">(optional)</span>
                </label>
                <Textarea
                  id="rating-review"
                  value={userReview}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setUserReview(e.target.value)
                  }
                  placeholder="What stood out — plot, characters, pacing?"
                  rows={3}
                  className="resize-none"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={handleSubmitRating}
                  disabled={!userRating || submitting}
                >
                  {submitting
                    ? "Saving..."
                    : existingUserRating
                      ? "Update rating"
                      : "Submit rating"}
                </Button>
                {isEditing && (
                  <Button variant="outline" onClick={cancelEditing}>
                    Cancel
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="border-border/70 rounded-md border p-6 text-center">
          <Star className="text-muted-foreground mx-auto mb-3 size-8" />
          <p className="mb-1 text-sm font-medium">Rate this novel</p>
          <p className="text-muted-foreground mb-4 text-sm">
            Sign in to share your score and help other readers decide.
          </p>
          <AuthModal
            trigger={<Button variant="outline">Sign in to rate</Button>}
            onSuccess={() => {
              refetchRatings();
              refetchUserRating();
            }}
          />
        </div>
      )}

      {/* Community reviews */}
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-semibold">
            Reader reviews
            {totalRatingsCount > 0 && (
              <span className="text-muted-foreground ml-1.5 font-normal">
                ({formatNumber(totalRatingsCount)})
              </span>
            )}
          </h3>
        </div>

        {ratingsLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="border-border/70 space-y-3 rounded-md border p-4"
              >
                <div className="flex items-center gap-2">
                  <Skeleton className="size-8 rounded-full" />
                  <Skeleton className="h-4 w-28" />
                </div>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            ))}
          </div>
        ) : ratings.length > 0 ? (
          <div className="space-y-3">
            {visibleRatings.map((rating) => (
              <article
                key={rating.id}
                className="border-border/70 rounded-md border p-4"
              >
                <div className="flex items-start gap-3">
                  <UserAvatar user={rating.user} size="md" showBadge />
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span className="truncate text-sm font-medium">
                        {rating.user.name}
                      </span>
                      <RatingStars rating={rating.rating} size="sm" />
                      <span className="text-muted-foreground text-xs">
                        {formatRelativeTime(rating.created_at)}
                      </span>
                    </div>
                    {rating.review ? (
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {rating.review}
                      </p>
                    ) : (
                      <p className="text-muted-foreground/70 text-sm italic">
                        Rated {rating.rating}/5 · no written review
                      </p>
                    )}
                  </div>
                </div>
              </article>
            ))}

            {hasMoreReviews && !showAllReviews && (
              <div className="pt-1 text-center">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  onClick={() => setShowAllReviews(true)}
                >
                  <ChevronDown className="size-3.5" />
                  Show more reviews
                  {totalRatingsCount > ratings.length
                    ? ` (${ratings.length} of ${formatNumber(totalRatingsCount)})`
                    : ` (${ratings.length - INITIAL_VISIBLE_REVIEWS} more)`}
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="border-border/70 rounded-md border border-dashed p-8 text-center">
            <MessageSquareQuote className="text-muted-foreground mx-auto mb-4 size-10" />
            <h3 className="mb-1 font-medium">No reviews yet</h3>
            <p className="text-muted-foreground text-sm">
              Be the first to rate this novel and share what you thought.
            </p>
          </div>
        )}
      </div>

      <DeleteModal
        open={showDeleteModal}
        onOpenChange={setShowDeleteModal}
        onConfirm={handleDeleteRating}
        title="Delete rating?"
        description={`Are you sure you want to delete your rating for "${title}"? This cannot be undone.`}
        confirmText="Delete rating"
        isLoading={submitting}
      />
    </div>
  );
}

function RatingStars({
  rating,
  size = "sm",
}: {
  rating: number;
  size?: "sm" | "md" | "lg";
}) {
  const stars = getRatingStars(rating);
  const sizeClass =
    size === "lg" ? "size-8" : size === "md" ? "size-5" : "size-3.5";

  return (
    <div className="flex items-center gap-0.5" aria-hidden>
      {stars.map((star, index) => (
        <span key={index} className={cn("relative inline-flex", sizeClass)}>
          <Star
            className={cn(sizeClass, "text-muted-foreground/30")}
          />
          {(star.filled || star.half) && (
            <span
              className="absolute inset-0 overflow-hidden"
              style={{ width: star.half ? "50%" : "100%" }}
            >
              <Star
                className={cn(sizeClass, "fill-amber-500 text-amber-500")}
              />
            </span>
          )}
        </span>
      ))}
    </div>
  );
}

function InteractiveStars({
  rating,
  hoveredStar,
  onRate,
  onHover,
}: {
  rating: number;
  hoveredStar: number;
  onRate: (rating: number) => void;
  onHover: (rating: number) => void;
}) {
  const active = hoveredStar || rating;

  return (
    <div
      className="flex items-center gap-1"
      role="radiogroup"
      aria-label="Novel rating"
      onMouseLeave={() => onHover(0)}
    >
      {Array.from({ length: 5 }, (_, index) => {
        const value = index + 1;
        const filled = value <= active;

        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={rating === value}
            aria-label={`${value} star${value === 1 ? "" : "s"} — ${RATING_LABELS[value]}`}
            className={cn(
              "rounded-md p-1 transition-transform duration-150",
              "hover:scale-110 focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none",
              "active:scale-95",
            )}
            onClick={() => onRate(value)}
            onMouseEnter={() => onHover(value)}
            onFocus={() => onHover(value)}
            onBlur={() => onHover(0)}
          >
            <Star
              className={cn(
                "size-8 transition-colors duration-150",
                filled
                  ? "fill-amber-500 text-amber-500"
                  : "text-muted-foreground/35",
              )}
            />
          </button>
        );
      })}
    </div>
  );
}
