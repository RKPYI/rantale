"use client";

import { useState, useMemo, useCallback, memo, useRef } from "react";
import Link from "next/link";
import { Search, ChevronDown, ChevronUp, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { ChapterSummary } from "@/types/api";

interface ChapterNavigatorProps {
  allChapters: ChapterSummary[];
  currentChapterId: number;
  novelSlug: string;
}

const ITEMS_PER_PAGE = 100;
const SEARCH_MIN_LENGTH = 2;

// Memoized chapter item to prevent unnecessary re-renders
const ChapterItem = memo(
  ({
    chapter,
    isCurrentChapter,
    novelSlug,
    onNavigate,
    itemRef,
  }: {
    chapter: ChapterSummary;
    isCurrentChapter: boolean;
    novelSlug: string;
    onNavigate: () => void;
    itemRef?: React.RefObject<HTMLDivElement | null>;
  }) => (
    <div ref={isCurrentChapter ? itemRef : undefined}>
      <Link
        href={`/novels/${novelSlug}/chapters/${chapter.chapter_number}`}
        onClick={onNavigate}
        className={cn(
          "hover:bg-accent block w-full rounded-md p-2 text-left transition-colors",
          isCurrentChapter &&
            "bg-primary text-primary-foreground hover:bg-primary/90",
        )}
      >
        <div className="flex items-center justify-between gap-2">
          <span className="truncate text-sm">
            Ch. {chapter.chapter_number}: {chapter.title}
          </span>
          {isCurrentChapter && (
            <Badge variant="secondary" className="text-xs">
              Current
            </Badge>
          )}
        </div>
      </Link>
    </div>
  ),
);
ChapterItem.displayName = "ChapterItem";

export function ChapterNavigator({
  allChapters,
  currentChapterId,
  novelSlug,
}: ChapterNavigatorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const currentChapterRef = useRef<HTMLDivElement>(null);

  // Find current chapter index
  const currentIndex = allChapters.findIndex(
    (ch) => ch.id === currentChapterId,
  );

  // Filter chapters based on search query
  const filteredChapters = useMemo(() => {
    if (searchQuery.length < SEARCH_MIN_LENGTH) {
      return allChapters;
    }

    const query = searchQuery.toLowerCase();
    return allChapters.filter(
      (chapter) =>
        chapter.title.toLowerCase().includes(query) ||
        chapter.chapter_number.toString().includes(query),
    );
  }, [allChapters, searchQuery]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredChapters.length / ITEMS_PER_PAGE);
  const startIndex = currentPage * ITEMS_PER_PAGE;
  const endIndex = Math.min(
    startIndex + ITEMS_PER_PAGE,
    filteredChapters.length,
  );
  const paginatedChapters = filteredChapters.slice(startIndex, endIndex);

  // Reset to first page when search changes
  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
    setCurrentPage(0);
  }, []);

  // Jump to current chapter function with proper scrolling
  const jumpToCurrentChapter = useCallback(() => {
    if (currentIndex >= 0) {
      // Navigate to the correct page
      const currentPageIndex = Math.floor(currentIndex / ITEMS_PER_PAGE);
      setCurrentPage(currentPageIndex);

      // Scroll to the current chapter item after DOM update
      setTimeout(() => {
        if (currentChapterRef.current) {
          currentChapterRef.current.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }
      }, 150);
    }
  }, [currentIndex]);

  // Smart navigation - when opened, jump to current chapter
  const handleOpenChange = useCallback(
    (open: boolean) => {
      setIsOpen(open);
      if (open && searchQuery.length < SEARCH_MIN_LENGTH) {
        jumpToCurrentChapter();
      }
    },
    [searchQuery.length, jumpToCurrentChapter],
  );

  return (
    <DropdownMenu open={isOpen} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <List className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="mr-2 w-80 p-0">
        <div className="border-b p-3">
          <div className="mb-2 flex items-center gap-2">
            <Search className="text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search chapters..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="h-8"
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="text-muted-foreground text-xs">
              {filteredChapters.length} of {allChapters.length} chapters
            </div>
            {searchQuery.length < SEARCH_MIN_LENGTH && currentIndex >= 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={jumpToCurrentChapter}
                className="h-6 px-2 text-xs"
              >
                Jump to Current
              </Button>
            )}
          </div>
        </div>

        <ScrollArea className="h-80" ref={scrollAreaRef}>
          <div className="space-y-1 p-1">
            {paginatedChapters.map((ch) => (
              <ChapterItem
                key={ch.id}
                chapter={ch}
                isCurrentChapter={ch.id === currentChapterId}
                novelSlug={novelSlug}
                onNavigate={() => setIsOpen(false)}
                itemRef={
                  ch.id === currentChapterId ? currentChapterRef : undefined
                }
              />
            ))}

            {paginatedChapters.length === 0 && (
              <div className="text-muted-foreground p-4 text-center text-sm">
                {searchQuery.length >= SEARCH_MIN_LENGTH
                  ? "No chapters found matching your search."
                  : "No chapters available."}
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="bg-muted/50 border-t p-2">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                disabled={currentPage === 0}
                className="h-7 px-2"
              >
                <ChevronUp className="mr-1 h-3 w-3" />
                Prev
              </Button>

              <span className="text-muted-foreground text-xs">
                Page {currentPage + 1} of {totalPages}
              </span>

              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  setCurrentPage(Math.min(totalPages - 1, currentPage + 1))
                }
                disabled={currentPage === totalPages - 1}
                className="h-7 px-2"
              >
                Next
                <ChevronDown className="ml-1 h-3 w-3" />
              </Button>
            </div>

            <div className="text-muted-foreground mt-1 text-center text-xs">
              Showing {startIndex + 1}-{endIndex} of {filteredChapters.length}
            </div>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
