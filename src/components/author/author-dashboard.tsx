"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
  MessageSquare,
  Star,
  TrendingUp,
  Edit,
  Settings,
  Users,
  DollarSign,
  Calendar,
  BarChart3,
  Trash2,
  MoreHorizontal,
  Save,
  X,
  Upload,
  FileText,
  Plus,
} from "lucide-react";
import { useAuthorNovels, useAuthorStats } from "@/hooks/use-author";
import {
  useGenres,
  useCreateNovel,
  useUpdateNovel,
  useDeleteNovel,
} from "@/hooks/use-novels";
import {
  useNovelChapters,
  useCreateChapter,
  useUpdateChapter,
  useDeleteChapter,
} from "@/hooks/use-chapters";
import { formatDate, formatNumber } from "@/lib/novel-utils";
import { novelService } from "@/services/novels";
import { chapterService } from "@/services/chapters";
import { cn } from "@/lib/utils";
import { AuthorNovel, Genre, ChapterSummary, Chapter } from "@/types/api";
import { toast } from "sonner";
import { MarkdownEditor } from "@/components/chapters/markdown-editor";

export function AuthorDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [isNovelDialogOpen, setIsNovelDialogOpen] = useState(false);
  const [isChapterDialogOpen, setIsChapterDialogOpen] = useState(false);
  const [selectedNovel, setSelectedNovel] = useState<AuthorNovel | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [deleteNovelDialog, setDeleteNovelDialog] = useState<{
    isOpen: boolean;
    novel: { id: number; slug: string; title: string } | null;
  }>({ isOpen: false, novel: null });

  const {
    data: novels,
    loading: novelsLoading,
    error: novelsError,
    refetch: refetchNovels,
  } = useAuthorNovels();
  const {
    data: stats,
    loading: statsLoading,
    error: statsError,
  } = useAuthorStats();
  const { data: genres } = useGenres();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ongoing":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "hiatus":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const StatCard = ({
    title,
    value,
    icon: Icon,
    change,
    changeType = "positive",
  }: {
    title: string;
    value: string | number;
    icon: React.ElementType;
    change?: string;
    changeType?: "positive" | "negative" | "neutral";
  }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-muted-foreground text-sm font-medium">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {change && (
              <p
                className={cn(
                  "text-xs",
                  changeType === "positive" && "text-green-600",
                  changeType === "negative" && "text-red-600",
                  changeType === "neutral" && "text-muted-foreground",
                )}
              >
                {change}
              </p>
            )}
          </div>
          <Icon className="text-muted-foreground h-8 w-8" />
        </div>
      </CardContent>
    </Card>
  );

  const handleDeleteNovel = async () => {
    if (!deleteNovelDialog.novel) return;

    try {
      await novelService.deleteNovel(deleteNovelDialog.novel.slug);
      await refetchNovels();
      toast.success("Novel deleted successfully!");
      setDeleteNovelDialog({ isOpen: false, novel: null });
    } catch (error) {
      console.error("Failed to delete novel:", error);

      let errorMessage = "Failed to delete novel. Please try again.";
      if (error && typeof error === "object" && "error" in error) {
        const apiError = error as { error: string };
        errorMessage = apiError.error;
      }

      toast.error(errorMessage);
    }
  };

  if (novelsError || statsError) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Error loading dashboard data. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Author Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your novels and track your performance
          </p>
        </div>
        <Button
          onClick={() => {
            setSelectedNovel(null);
            setIsEditing(false);
            setIsNovelDialogOpen(true);
          }}
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          New Novel
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="novels">My Novels</TabsTrigger>
          <TabsTrigger value="chapters">Manage Chapters</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {statsLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <Skeleton className="mb-2 h-4 w-24" />
                    <Skeleton className="mb-2 h-8 w-16" />
                    <Skeleton className="h-3 w-20" />
                  </CardContent>
                </Card>
              ))
            ) : stats ? (
              <>
                <StatCard
                  title="Total Novels"
                  value={stats.total_novels}
                  icon={BookOpen}
                />
                <StatCard
                  title="Total Views"
                  value={formatNumber(stats.total_views)}
                  icon={Eye}
                  change={
                    stats.monthly_views
                      ? `+${formatNumber(stats.monthly_views)} this month`
                      : undefined
                  }
                />
                <StatCard
                  title="Total Followers"
                  value={formatNumber(stats.total_followers)}
                  icon={Users}
                  change={
                    stats.monthly_followers
                      ? `+${stats.monthly_followers} this month`
                      : undefined
                  }
                />
                <StatCard
                  title="Avg. Rating"
                  value={
                    stats.average_rating ? stats.average_rating.toFixed(1) : "—"
                  }
                  icon={Star}
                />
              </>
            ) : (
              <div className="col-span-full">
                <Alert>
                  <AlertDescription>
                    Unable to load statistics.
                  </AlertDescription>
                </Alert>
              </div>
            )}
          </div>

          {/* Recent Novels */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Recent Novels
                </span>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="#novels" onClick={() => setActiveTab("novels")}>
                    View All
                  </Link>
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {novelsLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-center space-x-4">
                      <Skeleton className="h-12 w-12 rounded" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-48" />
                        <Skeleton className="h-3 w-32" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : novels && novels.length > 0 ? (
                <div className="space-y-4">
                  {novels.slice(0, 5).map((novel) => (
                    <div
                      key={novel.id}
                      className="hover:bg-muted/50 flex items-center justify-between rounded-lg border p-4 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <img
                          src={novel.cover_image || "/placeholder-book.jpg"}
                          alt={novel.title}
                          className="h-16 w-12 rounded object-cover"
                        />
                        <div>
                          <h4 className="font-medium">{novel.title}</h4>
                          <div className="text-muted-foreground flex items-center gap-2 text-sm">
                            <Badge className={getStatusColor(novel.status)}>
                              {novel.status.charAt(0).toUpperCase() +
                                novel.status.slice(1)}
                            </Badge>
                            <span>•</span>
                            <span>{novel.chapters_count} chapters</span>
                            <span>•</span>
                            <span>Updated {formatDate(novel.updated_at)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/novels/${novel.slug}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedNovel(novel);
                            setIsEditing(true);
                            setIsNovelDialogOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <BookOpen className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
                  <h3 className="text-lg font-medium">No novels yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Start your writing journey by creating your first novel.
                  </p>
                  <Button
                    onClick={() => {
                      setSelectedNovel(null);
                      setIsEditing(false);
                      setIsNovelDialogOpen(true);
                    }}
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create Novel
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Novels Tab */}
        <TabsContent value="novels">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  My Novels
                </span>
                <Button
                  onClick={() => {
                    setSelectedNovel(null);
                    setIsEditing(false);
                    setIsNovelDialogOpen(true);
                  }}
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  New Novel
                </Button>
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
                      <Skeleton className="h-16 w-12 rounded" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-48" />
                        <Skeleton className="h-3 w-64" />
                        <Skeleton className="h-3 w-32" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : novels && novels.length > 0 ? (
                <div className="space-y-4">
                  {novels.map((novel) => (
                    <div
                      key={novel.id}
                      className="hover:bg-muted/50 flex items-center justify-between rounded-lg border p-4 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <img
                          src={novel.cover_image || "/placeholder-book.jpg"}
                          alt={novel.title}
                          className="h-16 w-12 rounded object-cover"
                        />
                        <div className="space-y-1">
                          <h4 className="font-medium">{novel.title}</h4>
                          <p className="text-muted-foreground line-clamp-2 text-sm">
                            {novel.description}
                          </p>
                          <div className="text-muted-foreground flex items-center gap-4 text-sm">
                            <Badge className={getStatusColor(novel.status)}>
                              {novel.status.charAt(0).toUpperCase() +
                                novel.status.slice(1)}
                            </Badge>
                            <span className="flex items-center gap-1">
                              <BookOpen className="h-3 w-3" />
                              {novel.chapters_count} chapters
                            </span>
                            <span className="flex items-center gap-1">
                              <Eye className="h-3 w-3" />
                              {formatNumber(novel.views_count)} views
                            </span>
                            <span className="flex items-center gap-1">
                              <Star className="h-3 w-3" />
                              {novel.rating_avg
                                ? parseFloat(novel.rating_avg).toFixed(1)
                                : "—"}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatDate(novel.updated_at)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
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
                          <DropdownMenuContent>
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedNovel(novel);
                                setIsEditing(true);
                                setIsNovelDialogOpen(true);
                              }}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Novel
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedNovel(novel);
                                setActiveTab("chapters");
                              }}
                            >
                              <FileText className="mr-2 h-4 w-4" />
                              Manage Chapters
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() =>
                                setDeleteNovelDialog({
                                  isOpen: true,
                                  novel: {
                                    id: novel.id,
                                    slug: novel.slug,
                                    title: novel.title,
                                  },
                                })
                              }
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete Novel
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <BookOpen className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
                  <h3 className="text-lg font-medium">No novels yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Start your writing journey by creating your first novel.
                  </p>
                  <Button
                    onClick={() => {
                      setSelectedNovel(null);
                      setIsEditing(false);
                      setIsNovelDialogOpen(true);
                    }}
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create Novel
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Chapters Tab */}
        <TabsContent value="chapters">
          <ChapterManagement
            selectedNovel={selectedNovel}
            novels={novels}
            refetchNovels={refetchNovels}
          />
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Performance Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                {statsLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ) : stats ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Total Views</span>
                      <span className="font-medium">
                        {formatNumber(stats.total_views)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Monthly Views</span>
                      <span className="font-medium">
                        {formatNumber(stats.monthly_views || 0)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Total Followers</span>
                      <span className="font-medium">
                        {formatNumber(stats.total_followers)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Monthly Followers</span>
                      <span className="font-medium">
                        +{stats.monthly_followers || 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Average Rating</span>
                      <span className="font-medium">
                        {stats.average_rating
                          ? stats.average_rating.toFixed(1)
                          : "—"}
                      </span>
                    </div>
                  </div>
                ) : (
                  <Alert>
                    <AlertDescription>
                      Unable to load analytics data.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Top Performing Novels
                </CardTitle>
              </CardHeader>
              <CardContent>
                {novelsLoading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between"
                      >
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                    ))}
                  </div>
                ) : novels && novels.length > 0 ? (
                  <div className="space-y-3">
                    {novels
                      .filter(
                        (n) =>
                          n.status === "ongoing" || n.status === "completed",
                      )
                      .sort((a, b) => b.views_count - a.views_count)
                      .slice(0, 5)
                      .map((novel, index) => (
                        <div
                          key={novel.id}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-4 font-mono text-sm">
                              #{index + 1}
                            </span>
                            <span className="truncate text-sm">
                              {novel.title}
                            </span>
                          </div>
                          <span className="text-muted-foreground text-sm">
                            {formatNumber(novel.views_count)} views
                          </span>
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">
                    No published novels yet.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Novel Creation/Editing Dialog */}
      <NovelDialog
        isOpen={isNovelDialogOpen}
        onClose={() => setIsNovelDialogOpen(false)}
        novel={selectedNovel}
        isEditing={isEditing}
        genres={genres || []}
        onSuccess={refetchNovels}
      />

      {/* Delete Novel Confirmation Dialog */}
      <AlertDialog
        open={deleteNovelDialog.isOpen}
        onOpenChange={(isOpen) =>
          setDeleteNovelDialog({ isOpen, novel: deleteNovelDialog.novel })
        }
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete{" "}
              <span className="font-semibold">
                {deleteNovelDialog.novel?.title}
              </span>{" "}
              and all its chapters. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteNovel}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Novel
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// Novel Creation/Editing Dialog Component
function NovelDialog({
  isOpen,
  onClose,
  novel,
  isEditing,
  genres,
  onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  novel?: AuthorNovel | null;
  isEditing: boolean;
  genres: Genre[];
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "ongoing" as "ongoing" | "completed" | "hiatus",
    cover_image: "",
    genres: [] as number[],
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    setError(""); // Clear error when dialog opens/closes
    if (isEditing && novel) {
      setFormData({
        title: novel.title,
        description: novel.description,
        status: novel.status,
        cover_image: novel.cover_image || "",
        genres: novel.genres?.map((g) => g.id) || [],
      });
    } else {
      setFormData({
        title: "",
        description: "",
        status: "ongoing",
        cover_image: "",
        genres: [],
      });
    }
  }, [isEditing, novel, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      if (isEditing && novel) {
        await novelService.updateNovel(novel.slug, formData);
        toast.success("Novel updated successfully!");
      } else {
        await novelService.createNovel({
          ...formData,
          author: "", // This should be set by the backend based on authenticated user
        });
        toast.success("Novel created successfully!");
      }
      onSuccess();
      onClose();
    } catch (error: unknown) {
      console.error("Failed to save novel:", error);

      // Handle ApiError from api-client
      if (error && typeof error === "object" && "error" in error) {
        const apiError = error as {
          success: false;
          error: string;
          details?: Record<string, string[]>;
          statusCode?: number;
        };

        const errorMessage =
          apiError.error || "Failed to save novel. Please try again.";
        setError(errorMessage);
        toast.error(errorMessage);
      } else if (error instanceof Error) {
        setError(error.message);
        toast.error(error.message);
      } else {
        const fallbackMessage = "Failed to save novel. Please try again.";
        setError(fallbackMessage);
        toast.error(fallbackMessage);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleGenreToggle = (genreId: number) => {
    setFormData((prev) => ({
      ...prev,
      genres: prev.genres.includes(genreId)
        ? prev.genres.filter((id) => id !== genreId)
        : [...prev.genres, genreId],
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Novel" : "Create New Novel"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update your novel details"
              : "Create a new novel to start your writing journey"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
              }
              placeholder="Enter novel title"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder="Write a compelling description for your novel..."
              rows={4}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cover_image">Cover Image URL</Label>
            <Input
              id="cover_image"
              value={formData.cover_image}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  cover_image: e.target.value,
                }))
              }
              placeholder="https://example.com/cover.jpg"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <div className="flex gap-2">
              {["ongoing", "completed", "hiatus"].map((status) => (
                <Button
                  key={status}
                  type="button"
                  variant={formData.status === status ? "default" : "outline"}
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      status: status as "ongoing" | "completed" | "hiatus",
                    }))
                  }
                  className="capitalize"
                >
                  {status}
                </Button>
              ))}
            </div>
          </div>

          {genres && genres.length > 0 && (
            <div className="space-y-2">
              <Label>Genres</Label>
              <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                {genres.map((genre) => (
                  <div key={genre.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`genre-${genre.id}`}
                      checked={formData.genres.includes(genre.id)}
                      onCheckedChange={() => handleGenreToggle(genre.id)}
                    />
                    <Label
                      htmlFor={`genre-${genre.id}`}
                      className="cursor-pointer text-sm font-normal"
                    >
                      {genre.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? (
                <>
                  <span className="mr-2 animate-spin">⏳</span>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  {isEditing ? "Update Novel" : "Create Novel"}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Chapter Management Component
function ChapterManagement({
  selectedNovel,
  novels,
  refetchNovels,
}: {
  selectedNovel: AuthorNovel | null;
  novels: AuthorNovel[] | null;
  refetchNovels: () => void;
}) {
  const [currentNovel, setCurrentNovel] = useState<AuthorNovel | null>(
    selectedNovel,
  );
  const [isChapterDialogOpen, setIsChapterDialogOpen] = useState(false);
  const [selectedChapter, setSelectedChapter] = useState<ChapterSummary | null>(
    null,
  );
  const [isEditingChapter, setIsEditingChapter] = useState(false);
  const [deleteChapterDialog, setDeleteChapterDialog] = useState<{
    isOpen: boolean;
    chapter: { id: number; number: number; title: string } | null;
  }>({ isOpen: false, chapter: null });

  const {
    data: chapters,
    loading: chaptersLoading,
    refetch: refetchChapters,
  } = useNovelChapters(currentNovel?.slug || "");

  const handleDeleteChapter = async () => {
    if (!deleteChapterDialog.chapter || !currentNovel) return;

    try {
      await chapterService.deleteChapter(
        currentNovel.slug,
        deleteChapterDialog.chapter.id,
      );
      await refetchChapters();
      await refetchNovels();
      toast.success("Chapter deleted successfully!");
      setDeleteChapterDialog({ isOpen: false, chapter: null });
    } catch (error) {
      console.error("Failed to delete chapter:", error);

      let errorMessage = "Failed to delete chapter. Please try again.";
      if (error && typeof error === "object" && "error" in error) {
        const apiError = error as { error: string };
        errorMessage = apiError.error;
      }

      toast.error(errorMessage);
    }
  };

  if (!novels || novels.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="py-8 text-center">
            <BookOpen className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
            <h3 className="text-lg font-medium">No Novels Available</h3>
            <p className="text-muted-foreground">
              Create a novel first to manage chapters.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Novel Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Select Novel
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {novels.map((novel) => (
              <div
                key={novel.id}
                className={cn(
                  "cursor-pointer rounded-lg border p-4 transition-colors",
                  currentNovel?.id === novel.id
                    ? "border-primary bg-primary/5"
                    : "hover:bg-muted/50",
                )}
                onClick={() => setCurrentNovel(novel)}
              >
                <h4 className="font-medium">{novel.title}</h4>
                <p className="text-muted-foreground text-sm">
                  {novel.chapters_count} chapters
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Chapter Management */}
      {currentNovel && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Chapters - {currentNovel.title}
              </span>
              <Button
                onClick={() => {
                  setSelectedChapter(null);
                  setIsEditingChapter(false);
                  setIsChapterDialogOpen(true);
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                New Chapter
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {chaptersLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : chapters?.chapters && chapters.chapters.length > 0 ? (
              <div className="space-y-3">
                {chapters.chapters.map((chapter) => (
                  <div
                    key={chapter.id}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div>
                      <h4 className="font-medium">
                        Chapter {chapter.chapter_number}: {chapter.title}
                      </h4>
                      <p className="text-muted-foreground text-sm">
                        {chapter.word_count} words
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm" asChild>
                        <Link
                          href={`/novels/${currentNovel.slug}/chapters/${chapter.chapter_number}`}
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedChapter(chapter);
                          setIsEditingChapter(true);
                          setIsChapterDialogOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setDeleteChapterDialog({
                            isOpen: true,
                            chapter: {
                              id: chapter.id,
                              number: chapter.chapter_number,
                              title: chapter.title,
                            },
                          })
                        }
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center">
                <FileText className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
                <h3 className="text-lg font-medium">No Chapters Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start writing by creating your first chapter.
                </p>
                <Button
                  onClick={() => {
                    setSelectedChapter(null);
                    setIsEditingChapter(false);
                    setIsChapterDialogOpen(true);
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create Chapter
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Chapter Creation/Editing Dialog */}
      <ChapterDialog
        isOpen={isChapterDialogOpen}
        onClose={() => setIsChapterDialogOpen(false)}
        chapter={selectedChapter ?? undefined}
        isEditing={isEditingChapter}
        novel={currentNovel}
        onSuccess={() => {
          refetchChapters();
          refetchNovels();
        }}
      />

      {/* Delete Chapter Confirmation Dialog */}
      <AlertDialog
        open={deleteChapterDialog.isOpen}
        onOpenChange={(isOpen: boolean) =>
          setDeleteChapterDialog({
            isOpen,
            chapter: deleteChapterDialog.chapter,
          })
        }
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Chapter?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete{" "}
              <span className="font-semibold">
                Chapter {deleteChapterDialog.chapter?.number}:{" "}
                {deleteChapterDialog.chapter?.title}
              </span>
              . This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteChapter}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Chapter
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// Chapter Creation/Editing Dialog Component
function ChapterDialog({
  isOpen,
  onClose,
  chapter,
  isEditing,
  novel,
  onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  chapter?: ChapterSummary | Chapter;
  isEditing: boolean;
  novel: AuthorNovel | null;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    chapter_number: 1,
    title: "",
    content: "",
    is_free: true,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>("");
  const [loadingContent, setLoadingContent] = useState(false);

  // Get chapters data to determine next chapter number
  const { data: chaptersData } = useNovelChapters(novel?.slug || "");

  useEffect(() => {
    setError(""); // Clear error when dialog opens/closes

    const loadChapterContent = async () => {
      if (isEditing && chapter && novel) {
        // Check if we already have the content (full Chapter object)
        if ("content" in chapter && chapter.content) {
          setFormData({
            chapter_number: chapter.chapter_number,
            title: chapter.title,
            content: chapter.content,
            is_free: chapter.is_free !== false,
          });
        } else {
          // Fetch full chapter content from API
          setLoadingContent(true);
          try {
            const response = await chapterService.getChapter(
              novel.slug,
              chapter.chapter_number,
            );
            setFormData({
              chapter_number: response.chapter.chapter_number,
              title: response.chapter.title,
              content: response.chapter.content,
              is_free: response.chapter.is_free !== false,
            });
          } catch (error) {
            console.error("Failed to load chapter content:", error);
            toast.error("Failed to load chapter content");
            setFormData({
              chapter_number: chapter.chapter_number,
              title: chapter.title,
              content: "",
              is_free: true,
            });
          } finally {
            setLoadingContent(false);
          }
        }
      } else {
        // When creating new chapter, set next available number
        const nextChapterNumber = chaptersData?.chapters
          ? Math.max(
              ...chaptersData.chapters.map((ch) => ch.chapter_number),
              0,
            ) + 1
          : 1;

        setFormData({
          chapter_number: nextChapterNumber,
          title: "",
          content: "",
          is_free: true,
        });
      }
    };

    if (isOpen) {
      loadChapterContent();
    }
  }, [isEditing, chapter, isOpen, novel, chaptersData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novel) return;

    setError("");
    setSaving(true);

    try {
      if (isEditing && chapter) {
        await chapterService.updateChapter(chapter.id, formData);
        toast.success("Chapter updated successfully!");
      } else {
        await chapterService.createChapter(novel.slug, formData);
        toast.success("Chapter created successfully!");
      }
      onSuccess();
      onClose();
    } catch (error: unknown) {
      console.error("Failed to save chapter:", error);

      // Handle ApiError from api-client
      if (error && typeof error === "object" && "error" in error) {
        const apiError = error as {
          success: false;
          error: string;
          details?: Record<string, string[]>;
          statusCode?: number;
          rawData?: Record<string, unknown>;
        };

        let errorMessage =
          apiError.error || "Failed to save chapter. Please try again.";

        // Handle chapter number conflict - check rawData for existing_chapter
        if (apiError.rawData && "existing_chapter" in apiError.rawData) {
          const existing = apiError.rawData.existing_chapter as {
            id: number;
            chapter_number: number;
            title: string;
          };
          errorMessage = `Chapter ${existing.chapter_number} already exists: "${existing.title}". Please use a different chapter number or edit the existing chapter.`;
        }

        setError(errorMessage);
        toast.error(errorMessage);
      } else if (error instanceof Error) {
        setError(error.message);
        toast.error(error.message);
      } else {
        const fallbackMessage = "Failed to save chapter. Please try again.";
        setError(fallbackMessage);
        toast.error(fallbackMessage);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[95vh] max-w-[95vw] overflow-y-auto lg:max-w-6xl">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Chapter" : "Create New Chapter"}
          </DialogTitle>
          <DialogDescription>
            {novel
              ? `Managing chapters for "${novel.title}"`
              : "Chapter management"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {loadingContent && (
            <Alert>
              <AlertDescription className="flex items-center gap-2">
                <span className="animate-spin">⏳</span>
                Loading chapter content...
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="chapter_number">
                Chapter Number *
                {!isEditing &&
                  chaptersData?.chapters &&
                  chaptersData.chapters.length > 0 && (
                    <span className="text-muted-foreground ml-2 text-xs font-normal">
                      (Next:{" "}
                      {Math.max(
                        ...chaptersData.chapters.map((ch) => ch.chapter_number),
                      ) + 1}
                      )
                    </span>
                  )}
              </Label>
              <Input
                id="chapter_number"
                type="number"
                value={formData.chapter_number}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    chapter_number: parseInt(e.target.value),
                  }))
                }
                min={1}
                required
                disabled={loadingContent}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Chapter Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder="Enter chapter title"
                required
                disabled={loadingContent}
              />
            </div>
          </div>

          <div className="space-y-2">
            <MarkdownEditor
              value={formData.content}
              onChange={(content) =>
                setFormData((prev) => ({ ...prev, content }))
              }
              label="Chapter Content"
              placeholder="Write your chapter content here... (Markdown supported)"
              rows={20}
              required
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_free"
              checked={formData.is_free}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({ ...prev, is_free: !!checked }))
              }
              disabled={loadingContent}
            />
            <Label
              htmlFor="is_free"
              className="cursor-pointer text-sm font-normal"
            >
              This is a free chapter
            </Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving || loadingContent}>
              {saving ? (
                <>
                  <span className="mr-2 animate-spin">⏳</span>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  {isEditing ? "Update Chapter" : "Create Chapter"}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
