"use client";

import { useState } from "react";
import {
  BookmarkPlus,
  BookmarkCheck,
  Heart,
  Loader2,
  ChevronDown,
  Check,
  Clock,
  Play,
  CheckCircle,
  Pause,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth-context";
import {
  useNovelLibraryStatus,
  useUpdateLibraryStatus,
  useRemoveFromLibrary,
  useToggleFavorite,
} from "@/hooks/use-library";
import { libraryService } from "@/services/library";
import { cn } from "@/lib/utils";
import { Novel } from "@/types/api";

interface LibraryActionButtonProps {
  novel: Novel;
  className?: string;
  showStatus?: boolean;
  showBadgeStyle?: boolean;
}

const libraryStatuses = [
  {
    value: "want_to_read",
    label: "Want to Read",
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    dotColor: "bg-blue-600",
    icon: Clock,
  },
  {
    value: "reading",
    label: "Reading",
    color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    dotColor: "bg-green-600",
    icon: Play,
  },
  {
    value: "completed",
    label: "Completed",
    color:
      "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
    dotColor: "bg-purple-600",
    icon: CheckCircle,
  },
  {
    value: "on_hold",
    label: "On Hold",
    color:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    dotColor: "bg-yellow-600",
    icon: Pause,
  },
  {
    value: "dropped",
    label: "Dropped",
    color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    dotColor: "bg-red-600",
    icon: X,
  },
] as const;

export function LibraryActionButton({
  novel,
  className,
  showStatus = true,
  showBadgeStyle = false,
}: LibraryActionButtonProps) {
  const { isAuthenticated } = useAuth();

  const {
    data: libraryStatus,
    loading: statusLoading,
    refetch: refetchStatus,
  } = useNovelLibraryStatus(novel.slug);
  const { execute: updateStatus, loading: updateLoading } =
    useUpdateLibraryStatus();
  const { execute: removeFromLibrary, loading: removeLoading } =
    useRemoveFromLibrary();
  const { execute: toggleFavorite, loading: favoriteLoading } =
    useToggleFavorite();

  const [isOpen, setIsOpen] = useState(false);

  const isInLibrary = libraryStatus?.in_library || false;
  const currentEntry = libraryStatus?.library_entry;
  const isLoading =
    statusLoading || updateLoading || removeLoading || favoriteLoading;

  const currentStatus = libraryStatuses.find(
    (s) => s.value === currentEntry?.status,
  );

  // Don't render if user is not authenticated
  if (!isAuthenticated) {
    return null;
  }

  const handleAddToLibrary = async (status: string) => {
    try {
      await libraryService.addToLibrary({
        novel_id: novel.id,
        status: status as
          | "want_to_read"
          | "reading"
          | "completed"
          | "dropped"
          | "on_hold",
        is_favorite: false,
      });

      await refetchStatus();

      toast.success(
        `"${novel.title}" has been added to your library as ${libraryStatuses.find((s) => s.value === status)?.label}.`,
      );

      setIsOpen(false);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to add novel to library";
      toast.error(message);
    }
  };

  const handleUpdateStatus = async (status: string) => {
    if (!currentEntry) return;

    try {
      await updateStatus(async () => {
        return libraryService.updateLibraryEntry(currentEntry.id, {
          status: status as
            | "want_to_read"
            | "reading"
            | "completed"
            | "dropped"
            | "on_hold",
        });
      });

      await refetchStatus();

      toast.success(
        `"${novel.title}" status changed to ${libraryStatuses.find((s) => s.value === status)?.label}.`,
      );

      setIsOpen(false);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to update status";
      toast.error(message);
    }
  };

  const handleRemoveFromLibrary = async () => {
    if (!currentEntry) return;

    try {
      await removeFromLibrary(async () => {
        await libraryService.removeFromLibrary(currentEntry.id);
      });

      await refetchStatus();

      toast.success(`"${novel.title}" has been removed from your library.`);

      setIsOpen(false);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to remove from library";
      toast.error(message);
    }
  };

  const handleToggleFavorite = async () => {
    if (!isInLibrary) return;

    try {
      await toggleFavorite(async () => {
        return libraryService.toggleFavorite(novel.slug);
      });

      await refetchStatus();

      const isFavorite = !currentEntry?.is_favorite;
      toast.success(
        `"${novel.title}" ${isFavorite ? "added to" : "removed from"} your favorites.`,
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to toggle favorite";
      toast.error(message);
    }
  };

  if (!isInLibrary) {
    return (
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className={cn("flex-1", className)}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <BookmarkPlus className="mr-2 h-4 w-4" />
                Add to Library
                <ChevronDown className="ml-2 h-3 w-3" />
              </>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48">
          {libraryStatuses.map((status) => {
            const Icon = status.icon;
            return (
              <DropdownMenuItem
                key={status.value}
                onClick={() => handleAddToLibrary(status.value)}
                className="cursor-pointer"
              >
                <Icon className="mr-2 h-4 w-4" />
                {status.label}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <div className={cn("flex gap-2", className)}>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="flex-1" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <BookmarkCheck className="mr-2 h-4 w-4" />
                {showStatus && currentStatus ? (
                  showBadgeStyle ? (
                    <Badge className={cn("px-2 text-xs", currentStatus.color)}>
                      {currentStatus.label}
                    </Badge>
                  ) : (
                    <div className="flex items-center gap-2">
                      <div
                        className={cn(
                          "h-2 w-2 rounded-full",
                          currentStatus.dotColor,
                        )}
                      />
                      {currentStatus.label}
                    </div>
                  )
                ) : (
                  "In Library"
                )}
                <ChevronDown className="ml-2 h-3 w-3" />
              </>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48">
          {libraryStatuses.map((status) => {
            const Icon = status.icon;
            return (
              <DropdownMenuItem
                key={status.value}
                onClick={() => handleUpdateStatus(status.value)}
                className="cursor-pointer"
              >
                <Icon className="mr-2 h-4 w-4" />
                {status.label}
                {currentEntry?.status === status.value && (
                  <Check className="ml-auto h-4 w-4 text-green-500" />
                )}
              </DropdownMenuItem>
            );
          })}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleRemoveFromLibrary}
            className="cursor-pointer text-red-600 focus:text-red-600"
          >
            Remove from Library
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Button
        variant="outline"
        size="icon"
        onClick={handleToggleFavorite}
        disabled={isLoading}
        className={cn(
          currentEntry?.is_favorite &&
            "border-red-200 bg-red-50 text-red-500 hover:bg-red-100",
        )}
      >
        <Heart
          className={cn("h-4 w-4", currentEntry?.is_favorite && "fill-current")}
        />
      </Button>
    </div>
  );
}
