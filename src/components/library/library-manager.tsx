"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { DeleteModal } from "@/components/ui/delete-modal";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
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
  ArrowRight,
  LayoutGrid,
  List,
  Library,
  Trash2,
  ChevronLeft,
  ChevronRight,
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
import { useAuth } from "@/contexts/auth-context";
import { AuthModal } from "@/components/auth-modal";
import { ContinueReading } from "@/components/sections/continue-reading";

type LibraryStatus =
  | "want_to_read"
  | "reading"
  | "completed"
  | "dropped"
  | "on_hold"
  | "all"
  | "favorites";

type ViewMode = "list" | "grid";

const FILTERS: Array<{
  value: LibraryStatus;
  label: string;
  shortLabel: string;
  icon: React.ElementType;
}> = [
  { value: "all", label: "All", shortLabel: "All", icon: Library },
  { value: "reading", label: "Reading", shortLabel: "Reading", icon: Play },
  {
    value: "want_to_read",
    label: "Want to read",
    shortLabel: "Want",
    icon: Clock,
  },
  {
    value: "completed",
    label: "Completed",
    shortLabel: "Done",
    icon: CheckCircle,
  },
  { value: "on_hold", label: "On hold", shortLabel: "Hold", icon: Pause },
  { value: "dropped", label: "Dropped", shortLabel: "Dropped", icon: X },
  { value: "favorites", label: "Favorites", shortLabel: "♥", icon: Heart },
];

function getStatusIcon(status: string) {
  switch (status) {
    case "want_to_read":
      return Clock;
    case "reading":
      return Play;
    case "completed":
      return CheckCircle;
    case "dropped":
      return X;
    case "on_hold":
      return Pause;
    default:
      return BookOpen;
  }
}

function getStatusLabel(status: string) {
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
}

function getStatusBadgeClass(status: string) {
  switch (status) {
    case "want_to_read":
      return "bg-sky-500/10 text-sky-700 border-sky-500/20 dark:text-sky-300";
    case "reading":
      return "bg-emerald-500/10 text-emerald-700 border-emerald-500/20 dark:text-emerald-300";
    case "completed":
      return "bg-violet-500/10 text-violet-700 border-violet-500/20 dark:text-violet-300";
    case "on_hold":
      return "bg-amber-500/10 text-amber-700 border-amber-500/20 dark:text-amber-300";
    case "dropped":
      return "bg-destructive/10 text-destructive border-destructive/20";
    default:
      return "";
  }
}

export function LibraryManager() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [activeStatus, setActiveStatus] = useState<LibraryStatus>("all");
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    entry: LibraryEntry | null;
  }>({ isOpen: false, entry: null });

  useEffect(() => {
    const stored = window.localStorage.getItem("library-view");
    if (stored === "list" || stored === "grid") {
      setViewMode(stored);
    }
  }, []);

  const setView = (mode: ViewMode) => {
    setViewMode(mode);
    window.localStorage.setItem("library-view", mode);
  };

  const {
    data: library,
    loading,
    error,
    refetch,
  } = useLibrary(activeStatus, page);
  const { loading: updating, execute: updateStatus } = useUpdateLibraryStatus();
  const { loading: toggling, execute: toggleFavorite } = useToggleFavorite();
  const { loading: removing, execute: removeFromLibrary } =
    useRemoveFromLibrary();

  const handleFilterChange = (status: LibraryStatus) => {
    setActiveStatus(status);
    setPage(1);
  };

  const handleStatusChange = async (
    entryId: number,
    newStatus: LibraryStatus,
    title: string,
  ) => {
    if (newStatus === "all" || newStatus === "favorites") return;

    try {
      await updateStatus(() =>
        libraryService.updateLibraryEntry(entryId, { status: newStatus }),
      );
      refetch();
      toast.success(`Moved "${title}" to ${getStatusLabel(newStatus)}`);
    } catch (err) {
      console.error("Error updating status:", err);
      toast.error("Couldn't update status. Try again.");
    }
  };

  const handleToggleFavorite = async (novelSlug: string, title: string, wasFavorite: boolean) => {
    try {
      await toggleFavorite(() => libraryService.toggleFavorite(novelSlug));
      refetch();
      toast.success(
        wasFavorite
          ? `Removed "${title}" from favorites`
          : `Added "${title}" to favorites`,
      );
    } catch (err) {
      console.error("Error toggling favorite:", err);
      toast.error("Couldn't update favorite. Try again.");
    }
  };

  const handleRemove = async () => {
    if (!deleteDialog.entry) return;

    const novelTitle = deleteDialog.entry.novel.title;

    try {
      await removeFromLibrary(
        libraryService.removeFromLibrary,
        deleteDialog.entry.id,
      );
      setDeleteDialog({ isOpen: false, entry: null });
      refetch();
      toast.success(`Removed "${novelTitle}" from your library`);
    } catch (err) {
      console.error("Error removing from library:", err);
      const message =
        err instanceof Error ? err.message : "Failed to remove from library";
      toast.error(message);
    }
  };

  const getTabCount = (status: LibraryStatus) => {
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

  if (authLoading) {
    return <LibrarySkeleton />;
  }

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-3xl py-8 sm:py-12">
        <div className="relative overflow-hidden rounded-3xl border border-primary/10 bg-gradient-to-br from-primary/[0.07] via-background to-muted/50 px-6 py-14 text-center sm:px-10">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-20 left-1/2 size-56 -translate-x-1/2 rounded-full bg-primary/15 blur-3xl"
          />
          <div className="relative mx-auto flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Library className="size-7" aria-hidden />
          </div>
          <h1 className="relative mt-6 text-2xl font-semibold tracking-tight sm:text-3xl">
            Your personal shelf
          </h1>
          <p className="text-muted-foreground relative mx-auto mt-3 max-w-md text-sm leading-relaxed sm:text-base">
            Sign in to save novels, track what you are reading, and keep
            favorites in one place.
          </p>
          <div className="relative mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <AuthModal
              defaultTab="signin"
              trigger={<Button size="lg">Sign in</Button>}
            />
            <AuthModal
              defaultTab="signup"
              trigger={
                <Button size="lg" variant="outline">
                  Create account
                </Button>
              }
            />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="mt-4">
        <AlertDescription className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <span>Could not load your library: {error}</span>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Try again
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  const total = library?.stats.total ?? 0;
  const favorites = library?.stats.favorites ?? 0;
  const entries = library?.library.data ?? [];
  const currentPage = library?.library.current_page ?? 1;
  const lastPage = library?.library.last_page ?? 1;
  const filterLabel =
    activeStatus === "all"
      ? "All novels"
      : activeStatus === "favorites"
        ? "Favorites"
        : getStatusLabel(activeStatus);

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Header */}
      <section className="relative overflow-hidden rounded-3xl border border-primary/10 bg-gradient-to-br from-primary/[0.08] via-background to-muted/40 px-5 py-6 sm:px-7 sm:py-8">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-16 right-0 size-56 rounded-full bg-primary/15 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-20 left-8 size-40 rounded-full bg-primary/5 blur-3xl"
        />

        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
              Reading shelf
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
              My library
            </h1>
            <p className="text-muted-foreground mt-1.5 text-sm">
              {total === 0
                ? "Nothing saved yet — start building your shelf"
                : `${total} novel${total === 1 ? "" : "s"}${
                    favorites > 0
                      ? ` · ${favorites} favorite${favorites === 1 ? "" : "s"}`
                      : ""
                  }`}
            </p>
          </div>
          <Button asChild variant="outline" size="sm" className="w-full sm:w-auto">
            <Link href="/browse">
              Browse novels
              <ArrowRight className="size-3.5" aria-hidden />
            </Link>
          </Button>
        </div>

        {total > 0 && (
          <div className="relative mt-5">
            <ContinueReading variant="compact" showTitle={true} />
          </div>
        )}
      </section>

      {/* Status rail */}
      <div className="sticky top-0 z-10 -mx-4 bg-background/90 px-4 py-2 backdrop-blur supports-[backdrop-filter]:bg-background/80 sm:-mx-0 sm:px-0">
        <div className="flex items-center gap-2">
          <div
            role="tablist"
            aria-label="Library filters"
            className="flex flex-1 gap-1.5 overflow-x-auto pb-1 scrollbar-hide"
          >
            {FILTERS.map(({ value, label, shortLabel, icon: Icon }) => {
              const count = getTabCount(value);
              const active = activeStatus === value;
              return (
                <button
                  key={value}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => handleFilterChange(value)}
                  className={cn(
                    "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-2 text-xs font-medium transition-colors sm:text-sm",
                    "focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none",
                    active
                      ? "border-primary/30 bg-primary text-primary-foreground shadow-sm"
                      : "border-border/70 bg-background text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <Icon
                    className={cn(
                      "size-3.5",
                      value === "favorites" && active && "fill-current",
                    )}
                    aria-hidden
                  />
                  <span className="sm:hidden">{shortLabel}</span>
                  <span className="hidden sm:inline">{label}</span>
                  <span
                    className={cn(
                      "tabular-nums rounded-full px-1.5 py-0.5 text-[10px] sm:text-xs",
                      active
                        ? "bg-primary-foreground/20"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="hidden shrink-0 items-center rounded-lg border border-border/70 p-0.5 sm:flex">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className={cn(
                "size-8",
                viewMode === "list" && "bg-muted text-foreground",
              )}
              onClick={() => setView("list")}
              aria-label="List view"
              aria-pressed={viewMode === "list"}
            >
              <List className="size-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className={cn(
                "size-8",
                viewMode === "grid" && "bg-muted text-foreground",
              )}
              onClick={() => setView("grid")}
              aria-label="Grid view"
              aria-pressed={viewMode === "grid"}
            >
              <LayoutGrid className="size-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Results meta + mobile view toggle */}
      <div className="flex items-center justify-between gap-3">
        <p className="text-muted-foreground text-sm">
          <span className="text-foreground font-medium">{filterLabel}</span>
          {library && (
            <span>
              {" "}
              · {library.library.total} result
              {library.library.total === 1 ? "" : "s"}
            </span>
          )}
        </p>
        <div className="flex items-center rounded-lg border border-border/70 p-0.5 sm:hidden">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={cn(
              "size-8",
              viewMode === "list" && "bg-muted text-foreground",
            )}
            onClick={() => setView("list")}
            aria-label="List view"
          >
            <List className="size-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={cn(
              "size-8",
              viewMode === "grid" && "bg-muted text-foreground",
            )}
            onClick={() => setView("grid")}
            aria-label="Grid view"
          >
            <LayoutGrid className="size-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <LibraryContentSkeleton viewMode={viewMode} />
      ) : entries.length > 0 ? (
        <>
          {viewMode === "list" ? (
            <ul className="divide-y overflow-hidden rounded-2xl border border-border/80">
              {entries.map((entry) => (
                <LibraryListItem
                  key={entry.id}
                  entry={entry}
                  disabled={updating || removing || toggling}
                  onToggleFavorite={() =>
                    handleToggleFavorite(
                      entry.novel.slug,
                      entry.novel.title,
                      entry.is_favorite,
                    )
                  }
                  onStatusChange={(status) =>
                    handleStatusChange(entry.id, status, entry.novel.title)
                  }
                  onRemove={() =>
                    setDeleteDialog({ isOpen: true, entry })
                  }
                />
              ))}
            </ul>
          ) : (
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5">
              {entries.map((entry) => (
                <LibraryGridItem
                  key={entry.id}
                  entry={entry}
                  disabled={updating || removing || toggling}
                  onToggleFavorite={() =>
                    handleToggleFavorite(
                      entry.novel.slug,
                      entry.novel.title,
                      entry.is_favorite,
                    )
                  }
                  onStatusChange={(status) =>
                    handleStatusChange(entry.id, status, entry.novel.title)
                  }
                  onRemove={() =>
                    setDeleteDialog({ isOpen: true, entry })
                  }
                />
              ))}
            </ul>
          )}

          {lastPage > 1 && (
            <div className="flex items-center justify-between gap-3 border-t border-border/60 pt-4">
              <p className="text-muted-foreground text-sm">
                Page {currentPage} of {lastPage}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage <= 1 || loading}
                >
                  <ChevronLeft className="size-4" aria-hidden />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
                  disabled={currentPage >= lastPage || loading}
                >
                  Next
                  <ChevronRight className="size-4" aria-hidden />
                </Button>
              </div>
            </div>
          )}
        </>
      ) : (
        <EmptyLibraryState activeStatus={activeStatus} />
      )}

      <DeleteModal
        open={deleteDialog.isOpen}
        onOpenChange={(isOpen) =>
          setDeleteDialog({ isOpen, entry: deleteDialog.entry })
        }
        onConfirm={handleRemove}
        title="Remove from library?"
        description={
          deleteDialog.entry
            ? `Remove "${deleteDialog.entry.novel.title}" from your library? You can add it again later.`
            : "Remove this novel from your library?"
        }
        confirmText="Remove"
        isLoading={removing}
        variant="danger"
      />
    </div>
  );
}

function LibraryListItem({
  entry,
  disabled,
  onToggleFavorite,
  onStatusChange,
  onRemove,
}: {
  entry: LibraryEntry;
  disabled?: boolean;
  onToggleFavorite: () => void;
  onStatusChange: (status: LibraryStatus) => void;
  onRemove: () => void;
}) {
  const StatusIcon = getStatusIcon(entry.status);

  return (
    <li>
      <div className="hover:bg-muted/40 flex items-center gap-3 p-3 transition-colors sm:gap-4 sm:p-4">
        <Link
          href={`/novels/${entry.novel.slug}`}
          className="relative h-16 w-11 shrink-0 overflow-hidden rounded-md bg-muted sm:h-20 sm:w-14"
        >
          {entry.novel.cover_image ? (
            <Image
              src={entry.novel.cover_image}
              alt=""
              fill
              className="object-cover"
              sizes="56px"
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center">
              <BookOpen className="text-muted-foreground size-5" aria-hidden />
            </span>
          )}
        </Link>

        <div className="min-w-0 flex-1">
          <Link
            href={`/novels/${entry.novel.slug}`}
            className="hover:text-primary line-clamp-1 text-sm font-medium transition-colors sm:text-base"
          >
            {entry.novel.title}
          </Link>
          <p className="text-muted-foreground line-clamp-1 text-xs sm:text-sm">
            by {entry.novel.author}
          </p>
          <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs">
            <Badge
              variant="outline"
              className={cn(
                "gap-1 text-[10px] font-medium sm:text-xs",
                getStatusBadgeClass(entry.status),
              )}
            >
              <StatusIcon className="size-3" aria-hidden />
              {getStatusLabel(entry.status)}
            </Badge>
            {entry.novel.rating && (
              <span className="text-muted-foreground inline-flex items-center gap-1">
                <Star className="size-3" aria-hidden />
                {entry.novel.rating}
              </span>
            )}
            <span className="text-muted-foreground hidden items-center gap-1 sm:inline-flex">
              <Calendar className="size-3" aria-hidden />
              Added {formatDate(entry.added_at)}
            </span>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-0.5">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleFavorite}
            disabled={disabled}
            className={cn(
              "size-9",
              entry.is_favorite && "text-primary hover:text-primary",
            )}
            aria-label={
              entry.is_favorite ? "Remove from favorites" : "Add to favorites"
            }
          >
            <Heart
              className={cn("size-4", entry.is_favorite && "fill-current")}
            />
          </Button>
          <StatusMenu
            disabled={disabled}
            currentStatus={entry.status}
            onStatusChange={onStatusChange}
            onRemove={onRemove}
          />
        </div>
      </div>
    </li>
  );
}

function LibraryGridItem({
  entry,
  disabled,
  onToggleFavorite,
  onStatusChange,
  onRemove,
}: {
  entry: LibraryEntry;
  disabled?: boolean;
  onToggleFavorite: () => void;
  onStatusChange: (status: LibraryStatus) => void;
  onRemove: () => void;
}) {
  return (
    <li className="group relative flex flex-col overflow-hidden rounded-2xl border border-border/80 bg-card transition-shadow hover:shadow-md">
      <Link
        href={`/novels/${entry.novel.slug}`}
        className="relative aspect-[2/3] overflow-hidden bg-muted"
      >
        {entry.novel.cover_image ? (
          <Image
            src={entry.novel.cover_image}
            alt=""
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            sizes="(max-width: 640px) 50vw, 20vw"
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center">
            <BookOpen className="text-muted-foreground size-8" aria-hidden />
          </span>
        )}
        <Badge
          variant="outline"
          className={cn(
            "absolute top-2 left-2 border-0 text-[10px] backdrop-blur-sm",
            getStatusBadgeClass(entry.status),
          )}
        >
          {getStatusLabel(entry.status)}
        </Badge>
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-3">
        <div className="min-w-0 flex-1">
          <Link
            href={`/novels/${entry.novel.slug}`}
            className="hover:text-primary line-clamp-2 text-sm font-medium leading-snug transition-colors"
          >
            {entry.novel.title}
          </Link>
          <p className="text-muted-foreground mt-0.5 line-clamp-1 text-xs">
            {entry.novel.author}
          </p>
        </div>
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleFavorite}
            disabled={disabled}
            className={cn(
              "size-8",
              entry.is_favorite && "text-primary hover:text-primary",
            )}
            aria-label={
              entry.is_favorite ? "Remove from favorites" : "Add to favorites"
            }
          >
            <Heart
              className={cn("size-4", entry.is_favorite && "fill-current")}
            />
          </Button>
          <StatusMenu
            disabled={disabled}
            currentStatus={entry.status}
            onStatusChange={onStatusChange}
            onRemove={onRemove}
          />
        </div>
      </div>
    </li>
  );
}

function StatusMenu({
  disabled,
  currentStatus,
  onStatusChange,
  onRemove,
}: {
  disabled?: boolean;
  currentStatus: string;
  onStatusChange: (status: LibraryStatus) => void;
  onRemove: () => void;
}) {
  const items: Array<{
    value: LibraryStatus;
    label: string;
    icon: React.ElementType;
  }> = [
    { value: "want_to_read", label: "Want to Read", icon: Clock },
    { value: "reading", label: "Reading", icon: Play },
    { value: "completed", label: "Completed", icon: CheckCircle },
    { value: "on_hold", label: "On Hold", icon: Pause },
    { value: "dropped", label: "Dropped", icon: X },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          disabled={disabled}
          className="size-8 sm:size-9"
          aria-label="More actions"
        >
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {items.map(({ value, label, icon: Icon }) => (
          <DropdownMenuItem
            key={value}
            onClick={() => onStatusChange(value)}
            disabled={currentStatus === value}
          >
            <Icon className="size-4" aria-hidden />
            {label}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={onRemove}
          className="text-destructive focus:text-destructive"
        >
          <Trash2 className="size-4" aria-hidden />
          Remove from library
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function EmptyLibraryState({ activeStatus }: { activeStatus: LibraryStatus }) {
  const title =
    activeStatus === "all"
      ? "Your shelf is empty"
      : activeStatus === "favorites"
        ? "No favorites yet"
        : `No ${getStatusLabel(activeStatus).toLowerCase()} novels`;

  const description =
    activeStatus === "all"
      ? "Browse novels and add the ones you want to track."
      : activeStatus === "favorites"
        ? "Tap the heart on any library novel to pin it here."
        : "Move a novel into this status from its menu, or browse for something new.";

  return (
    <div className="rounded-2xl border border-dashed px-6 py-14 text-center">
      <BookOpen
        className="text-muted-foreground mx-auto mb-3 size-10 opacity-60"
        aria-hidden
      />
      <h3 className="text-base font-medium sm:text-lg">{title}</h3>
      <p className="text-muted-foreground mx-auto mt-1 max-w-sm text-sm">
        {description}
      </p>
      <Button asChild size="sm" className="mt-5">
        <Link href="/browse">
          Browse novels
          <ArrowRight className="size-3.5" aria-hidden />
        </Link>
      </Button>
    </div>
  );
}

function LibrarySkeleton() {
  return (
    <div className="space-y-5 sm:space-y-6">
      <Skeleton className="h-36 w-full rounded-3xl" />
      <Skeleton className="h-11 w-full rounded-full" />
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

function LibraryContentSkeleton({ viewMode }: { viewMode: ViewMode }) {
  if (viewMode === "grid") {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="aspect-[2/3] rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-0 overflow-hidden rounded-2xl border">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 border-b p-3 last:border-b-0 sm:gap-4 sm:p-4"
        >
          <Skeleton className="h-16 w-11 shrink-0 rounded-md sm:h-20 sm:w-14" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-1/3" />
            <Skeleton className="h-5 w-24" />
          </div>
        </div>
      ))}
    </div>
  );
}
