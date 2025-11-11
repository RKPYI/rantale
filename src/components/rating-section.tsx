"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { DeleteModal } from "@/components/ui/delete-modal";
import { Star, Edit, Trash2, TrendingUp, BarChart3 } from "lucide-react";
import { toast } from "sonner";

import { useNovelRatings, useUserRatingForNovel } from "@/hooks/use-ratings";
import { useAuth } from "@/hooks/use-auth";
import { ratingService } from "@/services/ratings";
import { useAsync } from "@/hooks/use-api";

import {
  formatRatingValue,
  getRatingStars,
  getRatingColor,
  calculateRatingDistribution,
  getRatingStats,
} from "@/lib/content-utils";

import { CreateRatingRequest } from "@/types/api";
import { UserAvatar } from "./ui/user-avatar";
import { Skeleton } from "./ui/skeleton";

interface RatingSectionProps {
  novelSlug: string;
  novelId: number;
  title: string;
}

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

  const { user, isAuthenticated, loading: authLoading } = useAuth();

  // Fetch ratings and user's rating
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

  // Loading state
  const isLoading = authLoading || userRatingLoading;

  // Async operations
  const { loading: submitting, execute: executeRatingAction } = useAsync();

  const ratings = ratingsData?.ratings.data || [];
  const stats = ratingsData?.stats || {
    average_rating: 0,
    total_ratings: 0,
    rating_breakdown: { "5": 0, "4": 0, "3": 0, "2": 0, "1": 0 },
  };

  // Submit rating
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

  // Delete rating
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

  // Start editing existing rating
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
  };

  // Rating stars component
  const RatingStars = ({
    rating,
    size = "sm",
    interactive = false,
    onRate,
  }: {
    rating: number;
    size?: "sm" | "md" | "lg";
    interactive?: boolean;
    onRate?: (rating: number) => void;
  }) => {
    const stars = getRatingStars(rating);
    const sizeClass =
      size === "lg" ? "h-8 w-8" : size === "md" ? "h-6 w-6" : "h-4 w-4";

    return (
      <div className="flex items-center gap-1">
        {stars.map((star, index) => (
          <Star
            key={index}
            className={`${sizeClass} cursor-pointer transition-colors ${
              interactive
                ? `hover:text-yellow-400 ${
                    (
                      hoveredStar > 0
                        ? index < hoveredStar
                        : star.filled || star.half
                    )
                      ? "fill-current text-yellow-400"
                      : "text-gray-300"
                  }`
                : star.filled || star.half
                  ? "fill-current text-yellow-400"
                  : "text-gray-300"
            }`}
            onClick={() => interactive && onRate?.(index + 1)}
            onMouseEnter={() => interactive && setHoveredStar(index + 1)}
            onMouseLeave={() => interactive && setHoveredStar(0)}
          />
        ))}
      </div>
    );
  };

  // Rating distribution bar
  const RatingDistributionBar = ({
    label,
    count,
    percentage,
  }: {
    label: string;
    count: number;
    percentage: number;
  }) => (
    <div className="flex items-center gap-2 text-sm">
      <div className="flex w-12 items-center gap-1">
        <Star className="h-3 w-3 fill-current text-yellow-400" />
        <span>{label}</span>
      </div>
      <div className="bg-muted h-2 flex-1 overflow-hidden rounded-full">
        <div
          className="h-full bg-yellow-400 transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-muted-foreground w-8 text-xs">{count}</span>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Rating Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Ratings for {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Overall rating */}
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div
                className="text-4xl font-bold"
                style={{ color: getRatingColor(stats.average_rating) }}
              >
                {formatRatingValue(stats.average_rating)}
              </div>
              <RatingStars rating={stats.average_rating} size="md" />
              <div className="text-muted-foreground mt-1 text-sm">
                {stats.total_ratings} ratings
              </div>
            </div>

            <div className="flex-1 space-y-2">
              {["5", "4", "3", "2", "1"].map((star) => (
                <RatingDistributionBar
                  key={star}
                  label={star}
                  count={
                    stats.rating_breakdown[
                      star as keyof typeof stats.rating_breakdown
                    ]
                  }
                  percentage={
                    (stats.rating_breakdown[
                      star as keyof typeof stats.rating_breakdown
                    ] /
                      stats.total_ratings) *
                      100 || 0
                  }
                />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* User Rating Section */}
      {isLoading ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <Skeleton className="h-5 w-28" /> {/* “Your Rating” text */}
              <div className="flex gap-2">
                <Skeleton className="h-8 w-16 rounded-md" /> {/* Edit button */}
                <Skeleton className="h-8 w-16 rounded-md" />
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-6 w-36" /> {/* Stars */}
              <Skeleton className="h-4 w-12" /> {/* rating text */}
            </div>
            <Skeleton className="h-16 w-full rounded-md" />
            <div className="flex gap-2">
              <Skeleton className="h-9 w-28 rounded-md" /> {/* submit/update */}
              <Skeleton className="h-9 w-24 rounded-md" /> {/* cancel */}
            </div>
          </CardContent>
        </Card>
      ) : isAuthenticated ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Your Rating</span>
              {existingUserRating && !isEditing && (
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={startEditing}>
                    <Edit className="h-3 w-3" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowDeleteModal(true)}
                  >
                    <Trash2 className="h-3 w-3" />
                    Delete
                  </Button>
                </div>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {existingUserRating && !isEditing ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <RatingStars rating={existingUserRating.rating} size="md" />
                  <span className="font-medium">
                    {formatRatingValue(existingUserRating.rating)}
                  </span>
                </div>
                {existingUserRating.review && (
                  <div className="bg-muted rounded p-3">
                    <p className="text-sm">{existingUserRating.review}</p>
                  </div>
                )}
                <div className="text-muted-foreground text-xs">
                  Rated on{" "}
                  {new Date(existingUserRating.created_at).toLocaleDateString()}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Rating
                  </label>
                  <RatingStars
                    rating={userRating}
                    size="lg"
                    interactive
                    onRate={setUserRating}
                  />
                  {userRating > 0 && (
                    <span className="text-muted-foreground ml-2 text-sm">
                      {userRating} star{userRating !== 1 ? "s" : ""}
                    </span>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Review (Optional)
                  </label>
                  <Textarea
                    value={userReview}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                      setUserReview(e.target.value)
                    }
                    placeholder="Share your thoughts about this novel..."
                    rows={3}
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleSubmitRating}
                    disabled={!userRating || submitting}
                  >
                    {submitting
                      ? "Submitting..."
                      : existingUserRating
                        ? "Update Rating"
                        : "Submit Rating"}
                  </Button>
                  {isEditing && (
                    <Button variant="outline" onClick={cancelEditing}>
                      Cancel
                    </Button>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-muted-foreground mb-3">
              Please sign in to rate this novel
            </p>
            <Button variant="outline">Sign In</Button>
          </CardContent>
        </Card>
      )}

      {/* Recent Ratings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Recent Ratings
          </CardTitle>
        </CardHeader>
        <CardContent>
          {ratingsLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="flex items-start gap-3">
                    <div className="bg-muted h-10 w-10 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="bg-muted h-4 w-32 rounded"></div>
                      <div className="bg-muted h-4 w-full rounded"></div>
                      <div className="bg-muted h-4 w-2/3 rounded"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : ratings.length > 0 ? (
            <div className="space-y-4">
              {ratings.slice(0, 5).map((rating) => (
                <div key={rating.id} className="flex items-start gap-3">
                  <UserAvatar user={rating.user} size="md" showBadge={true} />
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{rating.user.name}</span>
                      <RatingStars rating={rating.rating} size="sm" />
                      <span className="text-muted-foreground text-sm">
                        {formatRatingValue(rating.rating)}
                      </span>
                    </div>
                    {rating.review && (
                      <p className="text-muted-foreground text-sm">
                        {rating.review}
                      </p>
                    )}
                    <div className="text-muted-foreground text-xs">
                      {new Date(rating.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}

              {ratings.length > 5 && (
                <div className="pt-4 text-center">
                  <Button variant="outline" size="sm">
                    View All Ratings ({ratingsData?.ratings.total})
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="py-8 text-center">
              <BarChart3 className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
              <h3 className="mb-2 font-medium">No ratings yet</h3>
              <p className="text-muted-foreground">
                Be the first to rate this novel!
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Modal */}
      <DeleteModal
        open={showDeleteModal}
        onOpenChange={setShowDeleteModal}
        onConfirm={handleDeleteRating}
        title="Delete Rating?"
        description={`Are you sure you want to delete your rating for "${title}"? This action cannot be undone.`}
        confirmText="Delete Rating"
        isLoading={submitting}
      />
    </div>
  );
}
