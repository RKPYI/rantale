"use client";

import Link from "next/link";
import { KeyboardEvent, MouseEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  BookOpen,
  PlusCircle,
  Eye,
  Star,
  Calendar,
  Edit,
  FileText,
  Trash2,
  MoreHorizontal,
  X,
} from "lucide-react";
import { formatDate, formatNumber } from "@/lib/novel-utils";
import { AuthorNovel } from "@/types/api";
import { cn } from "@/lib/utils";
import {
  SelectableList,
  SelectableListRow,
  SelectionHint,
} from "@/components/author/selectable-list-row";

interface NovelsTabProps {
  novels: AuthorNovel[] | null;
  novelsLoading: boolean;
  selectedNovelIds: Set<number>;
  isBulkDeleting: boolean;
  allSelected: boolean;
  someSelected: boolean;
  onCreateNovel: () => void;
  onEditNovel: (novel: AuthorNovel) => void;
  onManageChapters: (novel: AuthorNovel) => void;
  onDeleteNovel: (novel: { id: number; slug: string; title: string }) => void;
  onBulkDelete: () => void;
  onSelectNovel: (novelId: number, event?: MouseEvent | KeyboardEvent) => void;
  onToggleAll: () => void;
  onListKeyDown: (event: KeyboardEvent) => void;
  onClearSelection: () => void;
  getStatusColor: (status: string) => string;
}

export function NovelsTab({
  novels,
  novelsLoading,
  selectedNovelIds,
  isBulkDeleting,
  allSelected,
  someSelected,
  onCreateNovel,
  onEditNovel,
  onManageChapters,
  onDeleteNovel,
  onBulkDelete,
  onSelectNovel,
  onToggleAll,
  onListKeyDown,
  onClearSelection,
  getStatusColor,
}: NovelsTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <span className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 flex-shrink-0" />
            <span className="truncate">My Novels</span>
          </span>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            {selectedNovelIds.size > 0 && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onClearSelection}
                  className="w-full sm:w-auto"
                >
                  <X className="mr-2 h-4 w-4" />
                  Clear ({selectedNovelIds.size})
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={onBulkDelete}
                  disabled={isBulkDeleting}
                  className="w-full sm:w-auto"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete ({selectedNovelIds.size})
                </Button>
              </>
            )}
            <Button onClick={onCreateNovel} className="w-full sm:w-auto">
              <PlusCircle className="mr-2 h-4 w-4" />
              <span className="sm:inline">New Novel</span>
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {novelsLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center space-x-4 rounded-lg border p-4"
              >
                <Skeleton className="h-16 w-12 flex-shrink-0 rounded" />
                <div className="min-w-0 flex-1 space-y-2">
                  <Skeleton className="h-4 w-full max-w-[200px]" />
                  <Skeleton className="h-3 w-full max-w-[250px]" />
                  <Skeleton className="h-3 w-full max-w-[150px]" />
                </div>
              </div>
            ))}
          </div>
        ) : novels && novels.length > 0 ? (
          <SelectableList
            label="Novel list"
            selectedCount={selectedNovelIds.size}
            onKeyDown={onListKeyDown}
            className="space-y-4"
          >
            <div className="space-y-3 border-b pb-3">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={
                    allSelected ? true : someSelected ? "indeterminate" : false
                  }
                  onClick={(event) => event.stopPropagation()}
                  onCheckedChange={onToggleAll}
                  aria-label="Select all novels"
                />
                <label className="text-xs font-medium sm:text-sm">
                  Select All ({novels.length})
                </label>
              </div>
              <SelectionHint />
            </div>

            {novels.map((novel) => {
              const isSelected = selectedNovelIds.has(novel.id);

              return (
                <SelectableListRow
                  key={novel.id}
                  selected={isSelected}
                  onSelect={(event) => onSelectNovel(novel.id, event)}
                  ariaLabel={`${novel.title}, ${novel.chapters_count} chapters`}
                  className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4"
                >
                  <div className="flex min-w-0 flex-1 items-start space-x-3 sm:items-center sm:space-x-4">
                    <Checkbox
                      checked={isSelected}
                      onClick={(event) => {
                        event.stopPropagation();
                        onSelectNovel(novel.id, event);
                      }}
                      aria-label={`Select ${novel.title}`}
                    />
                    <img
                      src={novel.cover_image || "/placeholder-book.jpg"}
                      alt=""
                      className="h-16 w-12 flex-shrink-0 rounded object-cover"
                    />
                    <div className="min-w-0 flex-1 space-y-1">
                      <h4 className="truncate text-sm font-medium sm:text-base">
                        {novel.title}
                      </h4>
                      <p className="text-muted-foreground line-clamp-2 text-xs sm:text-sm">
                        {novel.description}
                      </p>
                      <div className="text-muted-foreground flex flex-wrap items-center gap-2 text-xs sm:gap-3 sm:text-sm">
                        <Badge
                          className={cn(getStatusColor(novel.status), "text-xs")}
                        >
                          {novel.status.charAt(0).toUpperCase() +
                            novel.status.slice(1)}
                        </Badge>
                        <span className="flex items-center gap-1">
                          <BookOpen className="h-3 w-3" />
                          {novel.chapters_count} ch
                        </span>
                        <span className="hidden items-center gap-1 sm:flex">
                          <Eye className="h-3 w-3" />
                          {formatNumber(novel.views_count)}
                        </span>
                        <span className="hidden items-center gap-1 sm:flex">
                          <Star className="h-3 w-3" />
                          {novel.rating_avg
                            ? parseFloat(novel.rating_avg).toFixed(1)
                            : "—"}
                        </span>
                        <span className="hidden items-center gap-1 sm:flex">
                          <Calendar className="h-3 w-3" />
                          {formatDate(novel.updated_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div
                    className="flex items-center justify-end space-x-2 sm:flex-shrink-0"
                    data-no-row-select
                  >
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/novels/${novel.slug}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEditNovel(novel)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Novel
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onManageChapters(novel)}
                        >
                          <FileText className="mr-2 h-4 w-4" />
                          Manage Chapters
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() =>
                            onDeleteNovel({
                              id: novel.id,
                              slug: novel.slug,
                              title: novel.title,
                            })
                          }
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Novel
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </SelectableListRow>
              );
            })}
          </SelectableList>
        ) : (
          <div className="py-8 text-center">
            <BookOpen className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
            <h3 className="text-base font-medium sm:text-lg">No novels yet</h3>
            <p className="text-muted-foreground mb-4 text-sm sm:text-base">
              Start your writing journey by creating your first novel.
            </p>
            <Button onClick={onCreateNovel}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Novel
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
