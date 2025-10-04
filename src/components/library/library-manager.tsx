"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
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
      await updateStatus(libraryService.updateLibraryEntry, {
        entry_id: entryId,
        status: newStatus,
      });
      refetch();
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handleToggleFavorite = async (novelId: number) => {
    try {
      await toggleFavorite(libraryService.toggleFavorite, {
        novel_id: novelId,
      });
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
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{library.stats.total}</p>
              <p className="text-muted-foreground text-sm">Total</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{library.stats.reading}</p>
              <p className="text-muted-foreground text-sm">Reading</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{library.stats.completed}</p>
              <p className="text-muted-foreground text-sm">Completed</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{library.stats.want_to_read}</p>
              <p className="text-muted-foreground text-sm">Want to Read</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{library.stats.on_hold}</p>
              <p className="text-muted-foreground text-sm">On Hold</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-red-500">
                {library.stats.favorites}
              </p>
              <p className="text-muted-foreground text-sm">Favorites</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filter Tabs */}
      <Tabs
        value={activeStatus}
        onValueChange={(value) => setActiveStatus(value as LibraryStatus)}
      >
        <TabsList className="grid w-full grid-cols-3 md:grid-cols-6">
          <TabsTrigger value="all">All ({getTabCount("all")})</TabsTrigger>
          <TabsTrigger value="reading">
            Reading ({getTabCount("reading")})
          </TabsTrigger>
          <TabsTrigger value="want_to_read">
            Want to Read ({getTabCount("want_to_read")})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed ({getTabCount("completed")})
          </TabsTrigger>
          <TabsTrigger value="on_hold">
            On Hold ({getTabCount("on_hold")})
          </TabsTrigger>
          <TabsTrigger value="favorites">
            Favorites ({getTabCount("favorites")})
          </TabsTrigger>
        </TabsList>

        {/* Library Content */}
        <TabsContent value={activeStatus}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  {activeStatus === "all"
                    ? "All Novels"
                    : activeStatus === "favorites"
                      ? "Favorite Novels"
                      : getStatusLabel(activeStatus)}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className="flex items-center space-x-4 rounded-lg border p-4"
                    >
                      <Skeleton className="h-20 w-16 rounded" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-48" />
                        <Skeleton className="h-3 w-32" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : library && library.library.data.length > 0 ? (
                <div className="space-y-4">
                  {library.library.data.map((entry: LibraryEntry) => (
                    <div
                      key={entry.id}
                      className="hover:bg-muted/50 flex items-center justify-between rounded-lg border p-4 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="relative">
                          <img
                            src={
                              entry.novel.cover_image || "/placeholder-book.jpg"
                            }
                            alt={entry.novel.title}
                            className="h-20 w-16 rounded object-cover"
                          />
                          {entry.is_favorite && (
                            <Heart className="absolute -top-2 -right-2 h-4 w-4 fill-red-500 text-red-500" />
                          )}
                        </div>
                        <div className="space-y-2">
                          <h4 className="text-lg font-medium">
                            {entry.novel.title}
                          </h4>
                          <p className="text-muted-foreground text-sm">
                            by {entry.novel.author}
                          </p>
                          <div className="text-muted-foreground flex items-center gap-4 text-sm">
                            <Badge className={getStatusColor(entry.status)}>
                              <span className="flex items-center gap-1">
                                {getStatusIcon(entry.status)}
                                {getStatusLabel(entry.status)}
                              </span>
                            </Badge>
                            {entry.novel.rating && (
                              <span className="flex items-center gap-1">
                                <Star className="h-3 w-3" />
                                {entry.novel.rating}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Added {formatDate(entry.added_at)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/novels/${entry.novel.slug}`}>
                            <BookOpen className="h-4 w-4" />
                          </Link>
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleFavorite(entry.novel.id)}
                          disabled={toggling}
                          className={cn(
                            entry.is_favorite &&
                              "text-red-500 hover:text-red-600",
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
        </TabsContent>
      </Tabs>
    </div>
  );
}
