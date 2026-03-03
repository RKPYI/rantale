"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FileText,
  Eye,
  Clock,
  User,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Lock,
  Unlock,
  Search,
  Filter,
  X,
} from "lucide-react";
import { useEditorPendingChapters } from "@/hooks/use-editor";
import { editorService } from "@/services/editor";
import { PendingChapter } from "@/types/api";
import { ChapterStatusBadge } from "./chapter-status-badge";
import { formatDistanceToNow } from "date-fns";
import { formatNumber } from "@/lib/novel-utils";
import { toast } from "sonner";
import { logAndToastError } from "@/lib/utils";

type ClaimFilter = "all" | "unclaimed" | "claimed_by_me" | "claimed_by_others";
type StatusFilter = "all" | "pending_review" | "pending_update";

interface PendingChaptersTabProps {
  onReviewChapter: (chapter: PendingChapter) => void;
  onClaimSuccess?: () => void;
}

export function PendingChaptersTab({
  onReviewChapter,
  onClaimSuccess,
}: PendingChaptersTabProps) {
  const [page, setPage] = useState(1);
  const [claimingId, setClaimingId] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [claimFilter, setClaimFilter] = useState<ClaimFilter>("all");
  const [authorFilter, setAuthorFilter] = useState("all");
  const [novelFilter, setNovelFilter] = useState("all");

  const {
    data: pendingChapters,
    loading,
    refetch,
  } = useEditorPendingChapters(page, 15);

  // Derive unique authors and novels from the data for the filter dropdowns
  const { uniqueAuthors, uniqueNovels } = useMemo(() => {
    const chapters = pendingChapters?.data || [];
    const authorsMap = new Map<string, string>();
    const novelsMap = new Map<number, string>();

    for (const ch of chapters) {
      authorsMap.set(ch.novel.author, ch.novel.author);
      novelsMap.set(ch.novel.id, ch.novel.title);
    }

    return {
      uniqueAuthors: Array.from(authorsMap.values()).sort((a, b) =>
        a.localeCompare(b),
      ),
      uniqueNovels: Array.from(novelsMap.entries())
        .map(([id, title]) => ({ id, title }))
        .sort((a, b) => a.title.localeCompare(b.title)),
    };
  }, [pendingChapters]);

  // Apply filters client-side
  const filteredChapters = useMemo(() => {
    const chapters = pendingChapters?.data || [];
    const query = searchQuery.toLowerCase().trim();

    return chapters.filter((chapter) => {
      // Text search across chapter title, novel title, and author name
      if (query) {
        const matchesSearch =
          chapter.title.toLowerCase().includes(query) ||
          chapter.novel.title.toLowerCase().includes(query) ||
          chapter.novel.author.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      // Status filter
      if (statusFilter !== "all" && chapter.status !== statusFilter) {
        return false;
      }

      // Claim filter
      if (claimFilter === "unclaimed" && chapter.is_claimed) return false;
      if (claimFilter === "claimed_by_me" && !chapter.is_claimed_by_me)
        return false;
      if (
        claimFilter === "claimed_by_others" &&
        (!chapter.is_claimed || chapter.is_claimed_by_me)
      )
        return false;

      // Author filter
      if (authorFilter !== "all" && chapter.novel.author !== authorFilter) {
        return false;
      }

      // Novel filter
      if (
        novelFilter !== "all" &&
        chapter.novel.id !== parseInt(novelFilter, 10)
      ) {
        return false;
      }

      return true;
    });
  }, [
    pendingChapters,
    searchQuery,
    statusFilter,
    claimFilter,
    authorFilter,
    novelFilter,
  ]);

  const activeFilterCount = [
    searchQuery.trim() !== "",
    statusFilter !== "all",
    claimFilter !== "all",
    authorFilter !== "all",
    novelFilter !== "all",
  ].filter(Boolean).length;

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setClaimFilter("all");
    setAuthorFilter("all");
    setNovelFilter("all");
  };

  const handlePreviousPage = () => {
    if (page > 1) {
      setPage((prev) => prev - 1);
    }
  };

  const handleNextPage = () => {
    if (pendingChapters && page < pendingChapters.last_page) {
      setPage((prev) => prev + 1);
    }
  };

  const handleClaimChapter = async (chapter: PendingChapter) => {
    setClaimingId(chapter.id);
    try {
      await editorService.claimChapter(chapter.id);
      toast.success(
        "Chapter claimed successfully. You have 24 hours to review it.",
      );
      await refetch();
      onClaimSuccess?.();
    } catch (err) {
      logAndToastError(err, "Failed to claim chapter");
    } finally {
      setClaimingId(null);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Pending Review Queue
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const chapters = pendingChapters?.data || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Pending Review Queue
          </span>
          <div className="flex items-center gap-2">
            {pendingChapters && (
              <Badge variant="secondary">{pendingChapters.total} pending</Badge>
            )}
            <Button
              variant={showFilters ? "default" : "outline"}
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="mr-2 h-4 w-4" />
              Filters
              {activeFilterCount > 0 && (
                <Badge
                  variant="secondary"
                  className="ml-1.5 h-5 min-w-5 rounded-full px-1.5 text-xs"
                >
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </div>
        </CardTitle>

        {/* Filter Bar */}
        {showFilters && (
          <div className="bg-muted/30 mt-4 space-y-3 rounded-lg border p-4">
            {/* Search */}
            <div className="relative">
              <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <Input
                placeholder="Search by chapter title, novel, or author..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10 pl-10"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-1/2 right-1 h-6 w-6 -translate-y-1/2 p-0"
                  onClick={() => setSearchQuery("")}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>

            {/* Filter Dropdowns */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {/* Status Filter */}
              <div className="space-y-1">
                <label className="text-muted-foreground text-xs font-medium">
                  Status
                </label>
                <Select
                  value={statusFilter}
                  onValueChange={(v) => setStatusFilter(v as StatusFilter)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending_review">
                      Pending Review
                    </SelectItem>
                    <SelectItem value="pending_update">
                      Pending Update
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Claim Status Filter */}
              <div className="space-y-1">
                <label className="text-muted-foreground text-xs font-medium">
                  Claim Status
                </label>
                <Select
                  value={claimFilter}
                  onValueChange={(v) => setClaimFilter(v as ClaimFilter)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="unclaimed">Unclaimed</SelectItem>
                    <SelectItem value="claimed_by_me">Claimed by Me</SelectItem>
                    <SelectItem value="claimed_by_others">
                      Claimed by Others
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Author Filter */}
              <div className="space-y-1">
                <label className="text-muted-foreground text-xs font-medium">
                  Author
                </label>
                <Select value={authorFilter} onValueChange={setAuthorFilter}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All Authors" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Authors</SelectItem>
                    {uniqueAuthors.map((author) => (
                      <SelectItem key={author} value={author}>
                        {author}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Novel Filter */}
              <div className="space-y-1">
                <label className="text-muted-foreground text-xs font-medium">
                  Novel
                </label>
                <Select value={novelFilter} onValueChange={setNovelFilter}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All Novels" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Novels</SelectItem>
                    {uniqueNovels.map((novel) => (
                      <SelectItem key={novel.id} value={novel.id.toString()}>
                        {novel.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Active Filters Summary */}
            {activeFilterCount > 0 && (
              <div className="flex items-center justify-between">
                <p className="text-muted-foreground text-sm">
                  Showing {filteredChapters.length} of {chapters.length}{" "}
                  chapters
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="mr-1 h-3 w-3" />
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        )}
      </CardHeader>
      <CardContent>
        {chapters.length === 0 ? (
          <div className="py-12 text-center">
            <FileText className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
            <h3 className="text-lg font-medium">No Chapters Pending Review</h3>
            <p className="text-muted-foreground">
              All caught up! Check back later for new submissions.
            </p>
          </div>
        ) : filteredChapters.length === 0 ? (
          <div className="py-12 text-center">
            <Search className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
            <h3 className="text-lg font-medium">No Matching Chapters</h3>
            <p className="text-muted-foreground">
              No chapters match your current filters. Try adjusting or clearing
              them.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={clearFilters}
              className="mt-4"
            >
              <X className="mr-2 h-4 w-4" />
              Clear Filters
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredChapters.map((chapter) => (
              <div
                key={chapter.id}
                className="hover:bg-muted/50 flex flex-col gap-4 rounded-lg border p-4 transition-colors sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <BookOpen className="text-muted-foreground h-4 w-4 flex-shrink-0" />
                    <span className="text-muted-foreground truncate text-sm">
                      {chapter.novel.title}
                    </span>
                    <ChapterStatusBadge status={chapter.status} />
                    {/* Claim status indicator */}
                    {chapter.is_claimed && !chapter.is_claimed_by_me && (
                      <Badge
                        variant="outline"
                        className="border-0 bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400"
                      >
                        <Lock className="mr-1 h-3 w-3" />
                        Claimed by {chapter.claimed_by_editor}
                      </Badge>
                    )}
                    {chapter.is_claimed_by_me && (
                      <Badge
                        variant="outline"
                        className="border-0 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                      >
                        <Lock className="mr-1 h-3 w-3" />
                        Claimed by you
                      </Badge>
                    )}
                  </div>
                  <h4 className="font-medium">
                    Chapter {chapter.chapter_number}: {chapter.title}
                  </h4>
                  <div className="text-muted-foreground flex flex-wrap items-center gap-3 text-sm">
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {chapter.novel.author}
                    </span>
                    <span>{formatNumber(chapter.word_count)} words</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDistanceToNow(new Date(chapter.created_at), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                </div>

                {/* Action buttons based on claim status */}
                <div className="flex gap-2">
                  {chapter.is_claimed_by_me ? (
                    // Already claimed by this editor — go straight to review
                    <Button
                      onClick={() => onReviewChapter(chapter)}
                      className="w-full sm:w-auto"
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      Review
                    </Button>
                  ) : chapter.is_claimed ? (
                    // Claimed by another editor — disabled
                    <Button
                      disabled
                      variant="outline"
                      className="w-full sm:w-auto"
                    >
                      <Lock className="mr-2 h-4 w-4" />
                      Claimed
                    </Button>
                  ) : (
                    // Not claimed — allow claiming
                    <Button
                      onClick={() => handleClaimChapter(chapter)}
                      disabled={claimingId === chapter.id}
                      variant="outline"
                      className="w-full sm:w-auto"
                    >
                      {claimingId === chapter.id ? (
                        <>
                          <span className="mr-2 animate-spin">⏳</span>
                          Claiming...
                        </>
                      ) : (
                        <>
                          <Unlock className="mr-2 h-4 w-4" />
                          Claim
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            ))}

            {/* Pagination */}
            {pendingChapters && pendingChapters.last_page > 1 && (
              <div className="flex items-center justify-between border-t pt-4">
                <p className="text-muted-foreground text-sm">
                  Page {page} of {pendingChapters.last_page}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePreviousPage}
                    disabled={page === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNextPage}
                    disabled={page === pendingChapters.last_page}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
