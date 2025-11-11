"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  BookOpen,
  Heart,
  Clock,
  CheckCircle,
  Play,
  Pause,
  X,
  MoreHorizontal,
  Star,
  Calendar,
  Filter,
  SortAsc,
} from "lucide-react";
import {
  useLibrary,
  useUpdateLibraryStatus,
  useToggleFavorite,
  useRemoveFromLibrary,
} from "@/hooks/use-library";
import { libraryService } from "@/services/library";
import { formatDate } from "@/lib/novel-utils";
import { cn } from "@/lib/utils";
import { LibraryEntry } from "@/types/api";

type LibraryStatus =
  | "want_to_read"
  | "reading"
  | "completed"
  | "dropped"
  | "on_hold"
  | "all"
  | "favorites";

export function LibraryManager() {
  const [activeStatus, setActiveStatus] = useState<LibraryStatus>("all");

  const {
    data: library,
    loading,
    error,
    refetch,
  } = useLibrary(activeStatus === "all" ? undefined : activeStatus);
  const { loading: updating, execute: updateStatus } = useUpdateLibraryStatus();
  const { loading: toggling, execute: toggleFavorite } = useToggleFavorite();
  const { loading: removing, execute: removeFromLibrary } =
    useRemoveFromLibrary();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "want_to_read":
        return <Clock className="h-4 w-4" />;
      case "reading":
        return <Play className="h-4 w-4" />;
      case "completed":
        return <CheckCircle className="h-4 w-4" />;
      case "dropped":
        return <X className="h-4 w-4" />;
      case "on_hold":
        return <Pause className="h-4 w-4" />;
      default:
        return <BookOpen className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "want_to_read":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "reading":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "completed":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
      case "dropped":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      case "on_hold":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "want_to_read":
        return "Want to Read";
      case "reading":
        return "Reading";
      case "completed":
        return "Completed";
      case "dropped":
        return "Dropped";
      case "on_hold":
        return "On Hold";
      default:
        return status;
    }
  };

  const handleStatusChange = async (
    entryId: number,
    newStatus: LibraryStatus,
  ) => {
    if (newStatus === "all" || newStatus === "favorites") return;

    try {
      await updateStatus(() =>
        libraryService.updateLibraryEntry(entryId, { status: newStatus }),
      );
      refetch();
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handleToggleFavorite = async (novelSlug: string) => {
    try {
      await toggleFavorite(() => libraryService.toggleFavorite(novelSlug));
      refetch();
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  const handleRemove = async (entryId: number) => {
    if (
      confirm("Are you sure you want to remove this novel from your library?")
    ) {
      try {
        await removeFromLibrary(libraryService.removeFromLibrary, entryId);
        refetch();
      } catch (error) {
        console.error("Error removing from library:", error);
      }
    }
  };

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>Error loading library: {error}</AlertDescription>
      </Alert>
    );
  }

  const getTabCount = (status: string) => {
    if (!library?.stats) return 0;
    switch (status) {
      case "all":
        return library.stats.total;
      case "favorites":
        return library.stats.favorites;
      case "want_to_read":
        return library.stats.want_to_read;
      case "reading":
        return library.stats.reading;
      case "completed":
        return library.stats.completed;
      case "dropped":
        return library.stats.dropped;
      case "on_hold":
        return library.stats.on_hold;
      default:
        return 0;
    }
  };

  const getFilterLabel = (status: LibraryStatus) => {
    const count = getTabCount(status);
    switch (status) {
      case "all":
        return `All Novels (${count})`;
      case "favorites":
        return `Favorites (${count})`;
      case "want_to_read":
        return `Want to Read (${count})`;
      case "reading":
        return `Reading (${count})`;
      case "completed":
        return `Completed (${count})`;
      case "dropped":
        return `Dropped (${count})`;
      case "on_hold":
        return `On Hold (${count})`;
      default:
        return status;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">My Library</h1>
        <p className="text-muted-foreground">
          Organize and track your reading progress
        </p>
      </div>

      {/* Stats Cards */}
      {library?.stats && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-6">
          <Card>
            <CardContent className="p-3 text-center sm:p-4">
              <p className="text-xl font-bold sm:text-2xl">
                {library.stats.total}
              </p>
              <p className="text-muted-foreground text-xs sm:text-sm">Total</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center sm:p-4">
              <p className="text-xl font-bold sm:text-2xl">
                {library.stats.reading}
              </p>
              <p className="text-muted-foreground text-xs sm:text-sm">
                Reading
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center sm:p-4">
              <p className="text-xl font-bold sm:text-2xl">
                {library.stats.completed}
              </p>
              <p className="text-muted-foreground text-xs sm:text-sm">
                Completed
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center sm:p-4">
              <p className="text-xl font-bold sm:text-2xl">
                {library.stats.want_to_read}
              </p>
              <p className="text-muted-foreground text-xs sm:text-sm">
                Want to Read
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center sm:p-4">
              <p className="text-xl font-bold sm:text-2xl">
                {library.stats.on_hold}
              </p>
              <p className="text-muted-foreground text-xs sm:text-sm">
                On Hold
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center sm:p-4">
              <p className="text-xl font-bold text-red-500 sm:text-2xl">
                {library.stats.favorites}
              </p>
              <p className="text-muted-foreground text-xs sm:text-sm">
                Favorites
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filter Select */}
      <div className="flex items-center justify-between gap-4">
        <Select
          value={activeStatus}
          onValueChange={(value) => setActiveStatus(value as LibraryStatus)}
        >
          <SelectTrigger className="w-full sm:w-[280px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{getFilterLabel("all")}</SelectItem>
            <SelectItem value="reading">{getFilterLabel("reading")}</SelectItem>
            <SelectItem value="want_to_read">
              {getFilterLabel("want_to_read")}
            </SelectItem>
            <SelectItem value="completed">
              {getFilterLabel("completed")}
            </SelectItem>
            <SelectItem value="on_hold">{getFilterLabel("on_hold")}</SelectItem>
            <SelectItem value="dropped">{getFilterLabel("dropped")}</SelectItem>
            <SelectItem value="favorites">
              {getFilterLabel("favorites")}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Library Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            {activeStatus === "all"
              ? "All Novels"
              : activeStatus === "favorites"
                ? "Favorite Novels"
                : getStatusLabel(activeStatus)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="flex gap-3 rounded-lg border p-3 sm:gap-4 sm:p-4"
                >
                  <Skeleton className="h-16 w-12 flex-shrink-0 rounded sm:h-20 sm:w-16" />
                  <div className="min-w-0 flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                    <Skeleton className="h-3 w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : library && library.library.data.length > 0 ? (
            <div className="space-y-3">
              {library.library.data.map((entry: LibraryEntry) => (
                <div
                  key={entry.id}
                  className="hover:bg-muted/50 flex flex-col gap-3 rounded-lg border p-3 transition-colors sm:flex-row sm:items-center sm:justify-between sm:p-4"
                >
                  <div className="flex gap-3 sm:gap-4">
                    <div className="relative flex-shrink-0">
                      <img
                        src={entry.novel.cover_image || "/placeholder-book.jpg"}
                        alt={entry.novel.title}
                        className="h-16 w-12 rounded object-cover sm:h-20 sm:w-16"
                      />
                      {entry.is_favorite && (
                        <Heart className="absolute -top-1 -right-1 h-4 w-4 fill-red-500 text-red-500" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1 space-y-1.5">
                      <Link href={`/novels/${entry.novel.slug}`}>
                        <h4 className="hover:text-primary line-clamp-1 font-medium transition-colors sm:text-lg">
                          {entry.novel.title}
                        </h4>
                      </Link>
                      <p className="text-muted-foreground line-clamp-1 text-xs sm:text-sm">
                        by {entry.novel.author}
                      </p>
                      <div className="text-muted-foreground flex flex-wrap items-center gap-2 text-xs sm:gap-3 sm:text-sm">
                        <Badge
                          className={cn(
                            getStatusColor(entry.status),
                            "text-xs",
                          )}
                        >
                          <span className="flex items-center gap-1">
                            {getStatusIcon(entry.status)}
                            <span className="hidden sm:inline">
                              {getStatusLabel(entry.status)}
                            </span>
                          </span>
                        </Badge>
                        {entry.novel.rating && (
                          <span className="flex items-center gap-1">
                            <Star className="h-3 w-3" />
                            {entry.novel.rating}
                          </span>
                        )}
                        <span className="hidden items-center gap-1 sm:flex">
                          <Calendar className="h-3 w-3" />
                          {formatDate(entry.added_at)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-1 sm:gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleFavorite(entry.novel.slug)}
                      disabled={toggling}
                      className={cn(
                        "h-8 w-8 p-0 sm:h-9 sm:w-9",
                        entry.is_favorite && "text-red-500 hover:text-red-600",
                      )}
                    >
                      <Heart
                        className={cn(
                          "h-4 w-4",
                          entry.is_favorite && "fill-current",
                        )}
                      />
                    </Button>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={updating || removing}
                          className="h-8 w-8 p-0 sm:h-9 sm:w-9"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() =>
                            handleStatusChange(entry.id, "want_to_read")
                          }
                        >
                          <Clock className="mr-2 h-4 w-4" />
                          Want to Read
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            handleStatusChange(entry.id, "reading")
                          }
                        >
                          <Play className="mr-2 h-4 w-4" />
                          Reading
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            handleStatusChange(entry.id, "completed")
                          }
                        >
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Completed
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            handleStatusChange(entry.id, "on_hold")
                          }
                        >
                          <Pause className="mr-2 h-4 w-4" />
                          On Hold
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            handleStatusChange(entry.id, "dropped")
                          }
                        >
                          <X className="mr-2 h-4 w-4" />
                          Dropped
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleRemove(entry.id)}
                          className="text-red-600"
                        >
                          <X className="mr-2 h-4 w-4" />
                          Remove from Library
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center">
              <BookOpen className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
              <h3 className="text-lg font-medium">
                {activeStatus === "all"
                  ? "No novels in your library"
                  : activeStatus === "favorites"
                    ? "No favorite novels yet"
                    : `No ${getStatusLabel(activeStatus).toLowerCase()} novels`}
              </h3>
              <p className="text-muted-foreground mb-4">
                {activeStatus === "all"
                  ? "Start building your library by adding novels you want to read."
                  : "Add some novels to your library to get started."}
              </p>
              <Button asChild>
                <Link href="/novels">Browse Novels</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
