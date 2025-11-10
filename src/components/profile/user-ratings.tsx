"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DeleteModal } from "@/components/ui/delete-modal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Star,
  BookOpen,
  Trash2,
  Edit,
  Calendar,
  ArrowUpDown,
} from "lucide-react";
import { useUserRatings } from "@/hooks/use-ratings";
import { ratingService } from "@/services/ratings";
import { useAsync } from "@/hooks/use-api";
import { formatDate } from "@/lib/novel-utils";
import {
  formatRatingValue,
  getRatingStars,
  getRatingColor,
} from "@/lib/content-utils";
import { toast } from "sonner";

type SortOption = "newest" | "oldest" | "highest" | "lowest";

export function UserRatings() {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [ratingToDelete, setRatingToDelete] = useState<{
    id: number;
    title: string;
  } | null>(null);
  const { data: ratingsData, loading, refetch } = useUserRatings(currentPage);
  const { loading: deleting, execute: executeDelete } = useAsync();

  const rawRatings = ratingsData?.data || [];

  // Sort ratings based on selected option
  const ratings = [...rawRatings].sort((a, b) => {
    switch (sortBy) {
      case "highest":
        return b.rating - a.rating;
      case "lowest":
        return a.rating - b.rating;
      case "oldest":
        return (
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
      case "newest":
      default:
        return (
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
    }
  });
  const currentPageNum = ratingsData?.current_page || 1;
  const totalPages = ratingsData?.last_page || 1;
  const total = ratingsData?.total || 0;

  const openDeleteModal = (ratingId: number, novelTitle: string) => {
    setRatingToDelete({ id: ratingId, title: novelTitle });
    setDeleteModalOpen(true);
  };

  const handleDeleteRating = async () => {
    if (!ratingToDelete) return;

    try {
      await executeDelete(ratingService.deleteRating, ratingToDelete.id);
      toast.success("Rating deleted successfully");
      setDeleteModalOpen(false);
      setRatingToDelete(null);
      refetch();
    } catch (error) {
      toast.error("Failed to delete rating. Please try again.");
      console.error("Error deleting rating:", error);
    }
  };

  // Rating stars component
  const RatingStars = ({ rating }: { rating: number }) => {
    const stars = getRatingStars(rating);
    return (
      <div className="flex items-center gap-0.5">
        {stars.map((star, index) => (
          <Star
            key={index}
            className={`h-4 w-4 ${
              star.filled || star.half
                ? "fill-current text-yellow-400"
                : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  if (loading && !ratings.length) {
    return <UserRatingsSkeleton />;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            My Ratings & Reviews
            <Badge variant="secondary" className="ml-2">
              {total}
            </Badge>
          </CardTitle>

          {/* Sort Dropdown */}
          {ratings.length > 0 && (
            <div className="flex items-center gap-2">
              <ArrowUpDown className="text-muted-foreground h-4 w-4" />
              <Select
                value={sortBy}
                onValueChange={(value: SortOption) => setSortBy(value)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="highest">Highest Rating</SelectItem>
                  <SelectItem value="lowest">Lowest Rating</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {ratings.length > 0 ? (
          <div className="space-y-4">
            {ratings.map((rating) => (
              <div
                key={rating.id}
                className="hover:bg-muted/50 flex flex-col gap-3 rounded-lg border p-4 transition-colors sm:flex-row sm:gap-4"
              >
                {/* Novel Cover */}
                <Link
                  href={`/novels/${rating.novel.slug}`}
                  className="flex-shrink-0"
                >
                  <div className="relative h-32 w-24 overflow-hidden rounded">
                    {rating.novel.cover_image ? (
                      <Image
                        src={rating.novel.cover_image}
                        alt={rating.novel.title}
                        fill
                        className="object-cover"
                        sizes="96px"
                      />
                    ) : (
                      <div className="bg-muted flex h-full w-full items-center justify-center">
                        <BookOpen className="text-muted-foreground h-8 w-8" />
                      </div>
                    )}
                  </div>
                </Link>

                {/* Rating Content */}
                <div className="flex flex-1 flex-col gap-2">
                  <div>
                    <Link
                      href={`/novels/${rating.novel.slug}`}
                      className="text-lg font-semibold hover:underline"
                    >
                      {rating.novel.title}
                    </Link>
                    <p className="text-muted-foreground text-sm">
                      by {rating.novel.author}
                    </p>
                  </div>

                  {/* Rating Display */}
                  <div className="flex items-center gap-2">
                    <RatingStars rating={rating.rating} />
                    <span
                      className="text-lg font-bold"
                      style={{ color: getRatingColor(rating.rating) }}
                    >
                      {formatRatingValue(rating.rating)}
                    </span>
                  </div>

                  {/* Review Text */}
                  {rating.review && (
                    <div className="bg-muted rounded-lg p-3">
                      <p className="text-sm leading-relaxed">{rating.review}</p>
                    </div>
                  )}

                  {/* Metadata */}
                  <div className="text-muted-foreground flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>Rated on {formatDate(rating.created_at)}</span>
                    </div>
                    {rating.created_at !== rating.updated_at && (
                      <span>(Updated {formatDate(rating.updated_at)})</span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-row gap-2 sm:flex-col sm:justify-start">
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="flex-1 sm:flex-none"
                  >
                    <Link href={`/novels/${rating.novel.slug}#reviews`}>
                      <Edit className="h-3 w-3 sm:mr-2" />
                      <span className="hidden sm:inline">Edit</span>
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      openDeleteModal(rating.id, rating.novel.title)
                    }
                    disabled={deleting}
                    className="flex-1 sm:flex-none"
                  >
                    <Trash2 className="h-3 w-3 sm:mr-2" />
                    <span className="hidden sm:inline">Delete</span>
                  </Button>
                </div>
              </div>
            ))}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t pt-4">
                <p className="text-muted-foreground text-sm">
                  Page {currentPageNum} of {totalPages}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPageNum === 1 || loading}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={currentPageNum === totalPages || loading}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="py-12 text-center">
            <Star className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
            <h3 className="mb-2 text-lg font-medium">No ratings yet</h3>
            <p className="text-muted-foreground mb-4">
              You haven't rated any novels yet. Start reading and share your
              thoughts!
            </p>
            <Button asChild variant="outline">
              <Link href="/">Browse Novels</Link>
            </Button>
          </div>
        )}
      </CardContent>

      {/* Delete Confirmation Modal */}
      <DeleteModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        onConfirm={handleDeleteRating}
        title="Delete Rating?"
        description={
          ratingToDelete
            ? `Are you sure you want to delete your rating for "${ratingToDelete.title}"? This action cannot be undone.`
            : "Are you sure you want to delete this rating?"
        }
        confirmText="Delete Rating"
        isLoading={deleting}
      />
    </Card>
  );
}

function UserRatingsSkeleton() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="h-5 w-5" />
          My Ratings & Reviews
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:gap-4"
            >
              <Skeleton className="h-32 w-24 rounded" />
              <div className="flex-1 space-y-3">
                <div>
                  <Skeleton className="mb-2 h-6 w-48" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-16 w-full rounded-lg" />
                <Skeleton className="h-3 w-40" />
              </div>
              <div className="flex flex-row gap-2 sm:flex-col">
                <Skeleton className="h-9 w-20" />
                <Skeleton className="h-9 w-20" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
