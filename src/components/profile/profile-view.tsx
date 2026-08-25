"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Settings,
  BookOpen,
  Heart,
  Calendar,
  Mail,
  Edit,
  PenTool,
  TrendingUp,
  Library,
  LayoutDashboard,
  Star,
  ArrowRight,
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { useProfileStats } from "@/hooks/use-profile-stats";
import { useLibrary } from "@/hooks/use-library";
import { UserAvatar } from "@/components/ui/user-avatar";
import { formatDate } from "@/lib/novel-utils";
import { getUserRole, getRoleInfo } from "@/lib/user-utils";
import { ProfileSettings } from "@/components/profile/profile-settings";
import { ProfileOverview } from "@/components/profile/profile-overview";
import { ReadingStats } from "@/components/profile/reading-stats";
import { UserRatings } from "@/components/profile/user-ratings";
import { AuthModal } from "@/components/auth-modal";
import { cn } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";

const PROFILE_TABS = [
  {
    value: "overview",
    label: "Overview",
    shortLabel: "Home",
    icon: LayoutDashboard,
  },
  {
    value: "library",
    label: "Library",
    shortLabel: "Library",
    icon: Library,
    countKey: "library" as const,
  },
  {
    value: "ratings",
    label: "Ratings",
    shortLabel: "Ratings",
    icon: Star,
    countKey: "ratings" as const,
  },
  {
    value: "reading",
    label: "Reading",
    shortLabel: "Stats",
    icon: TrendingUp,
  },
  {
    value: "settings",
    label: "Settings",
    shortLabel: "Settings",
    icon: Settings,
  },
  {
    value: "author",
    label: "Author",
    shortLabel: "Author",
    icon: PenTool,
    authorOnly: true,
  },
] as const;

function statusLabel(status: string) {
  switch (status) {
    case "want_to_read":
      return "Want to Read";
    case "reading":
      return "Reading";
    case "completed":
      return "Completed";
    case "on_hold":
      return "On Hold";
    case "dropped":
      return "Dropped";
    default:
      return status;
  }
}

function statusBadgeClass(status: string) {
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

export function ProfileView() {
  const [activeTab, setActiveTab] = useState("overview");
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { data: profileStats, loading: statsLoading } = useProfileStats();
  const shouldLoadLibrary = activeTab === "library";
  const { data: library, loading: libraryLoading } = useLibrary(
    shouldLoadLibrary ? undefined : "",
  );

  const userRole = user ? getUserRole(user) : "user";
  const roleInfo = user ? getRoleInfo(user) : null;

  useEffect(() => {
    const hash = window.location.hash.slice(1);
    const validTabs = [
      "overview",
      "library",
      "ratings",
      "reading",
      "settings",
      "author",
    ];

    if (hash && validTabs.includes(hash)) {
      setActiveTab(hash);
      setTimeout(() => {
        const tabsElement = document.querySelector('[role="tablist"]');
        if (tabsElement) {
          tabsElement.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);
    }
  }, []);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    window.history.replaceState(null, "", `#${value}`);
  };

  const loading = authLoading || statsLoading;

  if (loading) {
    return <ProfileViewSkeleton />;
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="container mx-auto max-w-3xl px-4 py-12 pb-24 sm:px-6 sm:py-16 lg:px-8 md:pb-16">
        <div className="relative overflow-hidden rounded-3xl border border-primary/10 bg-gradient-to-br from-primary/[0.07] via-background to-muted/50 px-6 py-14 text-center sm:px-10">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-20 left-1/2 size-56 -translate-x-1/2 rounded-full bg-primary/15 blur-3xl"
          />
          <div className="relative mx-auto flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Library className="size-7" aria-hidden />
          </div>
          <h1 className="relative mt-6 text-2xl font-semibold tracking-tight sm:text-3xl">
            Your reading home
          </h1>
          <p className="text-muted-foreground relative mx-auto mt-3 max-w-md text-sm leading-relaxed sm:text-base">
            Sign in to track progress, keep favorites, and pick up where you left
            off.
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

  const joinedDate = user.created_at ? new Date(user.created_at) : new Date();
  const isVerified = user.email_verified_at !== null;
  const libraryTotal = profileStats?.library.total_novels || 0;
  const favorites = profileStats?.library.favorites || 0;
  const completed = profileStats?.reading_progress.completed_novels || 0;

  return (
    <div className="pb-24 md:pb-8">
      {/* Identity header */}
      <section className="relative overflow-hidden border-b">
        <div
          aria-hidden
          className="from-primary/[0.12] via-primary/[0.04] to-background absolute inset-0 bg-gradient-to-b"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 right-0 size-72 rounded-full bg-primary/10 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-16 left-0 size-56 rounded-full bg-primary/5 blur-3xl"
        />

        <div className="container relative mx-auto px-4 pt-8 pb-6 sm:px-6 sm:pt-10 sm:pb-8 lg:px-8">
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start sm:gap-8">
            <UserAvatar user={user} size="xl" showBadge={true} />

            <div className="min-w-0 flex-1 text-center sm:text-left">
              <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                <h1 className="text-2xl font-semibold tracking-tight break-words sm:text-3xl">
                  {user.name}
                </h1>
                {roleInfo && userRole !== "user" && (
                  <Badge
                    className={cn(
                      "border-transparent",
                      roleInfo.bgColor,
                    )}
                  >
                    {roleInfo.name}
                  </Badge>
                )}
                {!isVerified && (
                  <Badge variant="outline" className="text-xs font-normal">
                    <Mail className="mr-1 size-3" aria-hidden />
                    Unverified
                  </Badge>
                )}
              </div>

              {user.bio ? (
                <p className="text-muted-foreground mx-auto mt-2 max-w-xl text-sm leading-relaxed break-words sm:mx-0">
                  {user.bio}
                </p>
              ) : (
                <p className="text-muted-foreground mt-2 text-sm">
                  {userRole === "user" ? "Reader" : roleInfo?.name} · Member
                  since {formatDate(joinedDate.toISOString())}
                </p>
              )}

              <p className="text-muted-foreground mt-1 flex items-center justify-center gap-1.5 text-xs sm:justify-start">
                <Calendar className="size-3.5 shrink-0" aria-hidden />
                <span>
                  Joined {formatDate(joinedDate.toISOString())}
                  {user.bio ? ` · ${user.email}` : ""}
                </span>
              </p>

              {/* Value-first metrics */}
              <div className="mt-5 grid grid-cols-3 gap-2 sm:max-w-md sm:gap-3">
                <Metric
                  value={libraryTotal}
                  label="Library"
                  onClick={() => handleTabChange("library")}
                />
                <Metric
                  value={favorites}
                  label="Favorites"
                  onClick={() => handleTabChange("library")}
                />
                <Metric
                  value={completed}
                  label="Finished"
                  onClick={() => handleTabChange("reading")}
                />
              </div>

              <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleTabChange("settings")}
                  className="w-full sm:w-auto"
                >
                  <Edit className="size-4" aria-hidden />
                  Edit profile
                </Button>
                {(userRole === "author" || userRole === "admin") && (
                  <Button size="sm" asChild className="w-full sm:w-auto">
                    <Link href="/author">
                      <PenTool className="size-4" aria-hidden />
                      Author dashboard
                    </Link>
                  </Button>
                )}
                {userRole === "user" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    asChild
                    className="w-full sm:w-auto"
                  >
                    <Link href="/author">
                      <PenTool className="size-4" aria-hidden />
                      Become an author
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 pt-4 sm:px-6 sm:pt-6 lg:px-8">
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <div className="sticky top-0 z-10 -mx-4 bg-background/90 px-4 py-2 backdrop-blur supports-[backdrop-filter]:bg-background/80 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
            <TabsList
              aria-label="Profile sections"
              className="h-auto w-full justify-start gap-1.5 overflow-x-auto rounded-none bg-transparent p-0 pb-1 scrollbar-hide"
            >
              {PROFILE_TABS.filter((tab) => {
                if ("authorOnly" in tab && tab.authorOnly) {
                  return userRole === "author" || userRole === "admin";
                }
                return true;
              }).map((tab) => {
                const Icon = tab.icon;
                const active = activeTab === tab.value;
                const count =
                  "countKey" in tab && tab.countKey === "library"
                    ? libraryTotal
                    : "countKey" in tab && tab.countKey === "ratings"
                      ? (profileStats?.activity.total_ratings ?? 0)
                      : undefined;

                return (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className={cn(
                      "h-auto shrink-0 flex-none gap-1.5 rounded-full border px-3 py-2 text-xs font-medium shadow-none transition-colors sm:text-sm",
                      "border-border/70 bg-background text-muted-foreground",
                      "hover:bg-muted hover:text-foreground",
                      "data-[state=active]:border-primary/30 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm",
                      "dark:data-[state=active]:border-primary/30 dark:data-[state=active]:bg-primary dark:data-[state=active]:text-primary-foreground",
                      "focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none",
                    )}
                  >
                    <Icon className="size-3.5" aria-hidden />
                    <span className="sm:hidden">{tab.shortLabel}</span>
                    <span className="hidden sm:inline">{tab.label}</span>
                    {count !== undefined && (
                      <span
                        className={cn(
                          "rounded-full px-1.5 py-0.5 text-[10px] tabular-nums sm:text-xs",
                          active
                            ? "bg-primary-foreground/20 text-primary-foreground"
                            : "bg-muted text-muted-foreground",
                        )}
                      >
                        {count}
                      </span>
                    )}
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </div>

          {/* Overview */}
          <TabsContent value="overview" className="mt-4 sm:mt-6">
            <ProfileOverview
              stats={profileStats}
              userRole={userRole}
              onNavigateTab={handleTabChange}
            />
          </TabsContent>

          {/* Library */}
          <TabsContent value="library" className="mt-4 sm:mt-6">
            {libraryLoading ? (
              <Card className="border-border/80 shadow-none">
                <CardContent className="space-y-4 p-5">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <Skeleton className="h-16 w-12 rounded-md" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-48" />
                        <Skeleton className="h-3 w-32" />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ) : (
              <Card className="overflow-hidden border-border/80 shadow-none">
                <CardHeader className="flex-row items-center justify-between gap-3 space-y-0 pb-3">
                  <div>
                    <CardTitle className="text-base font-semibold tracking-tight sm:text-lg">
                      My library
                    </CardTitle>
                    <p className="text-muted-foreground mt-1 text-sm">
                      {library?.library.data.length
                        ? `Showing ${Math.min(library.library.data.length, 10)} recent`
                        : "Track novels as you read"}
                    </p>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/library">
                      View all
                      <ArrowRight className="size-3.5" aria-hidden />
                    </Link>
                  </Button>
                </CardHeader>
                <CardContent className="pt-0">
                  {library && library.library.data.length > 0 ? (
                    <ul className="divide-y rounded-2xl border">
                      {library.library.data.slice(0, 10).map((entry) => (
                        <li key={entry.id}>
                          <Link
                            href={`/novels/${entry.novel.slug}`}
                            className="hover:bg-muted/50 flex items-center gap-3 p-3 transition-colors sm:gap-4 sm:p-4"
                          >
                            <div className="relative h-14 w-10 shrink-0 overflow-hidden rounded-md bg-muted sm:h-16 sm:w-12">
                              <Image
                                src={
                                  entry.novel.cover_image ||
                                  "/placeholder-book.jpg"
                                }
                                alt=""
                                fill
                                className="object-cover"
                                sizes="48px"
                              />
                            </div>
                            <div className="min-w-0 flex-1">
                              <h4 className="truncate text-sm font-medium sm:text-base">
                                {entry.novel.title}
                              </h4>
                              <p className="text-muted-foreground truncate text-xs sm:text-sm">
                                by {entry.novel.author}
                              </p>
                              <div className="mt-1.5 flex items-center gap-2">
                                <Badge
                                  variant="outline"
                                  className={cn(
                                    "text-[10px] font-medium sm:text-xs",
                                    statusBadgeClass(entry.status),
                                  )}
                                >
                                  {statusLabel(entry.status)}
                                </Badge>
                                {entry.is_favorite && (
                                  <Heart
                                    className="size-3.5 fill-current text-primary sm:size-4"
                                    aria-label="Favorite"
                                  />
                                )}
                              </div>
                            </div>
                            <ArrowRight
                              className="text-muted-foreground size-4 shrink-0 opacity-40"
                              aria-hidden
                            />
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <EmptyShelf />
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="ratings" className="mt-4 sm:mt-6">
            <UserRatings />
          </TabsContent>

          <TabsContent value="reading" className="mt-4 sm:mt-6">
            <ReadingStats />
          </TabsContent>

          <TabsContent value="settings" className="mt-4 sm:mt-6">
            <ProfileSettings />
          </TabsContent>

          {(userRole === "author" || userRole === "admin") && (
            <TabsContent value="author" className="mt-4 sm:mt-6">
              <Card className="overflow-hidden border-border/80 shadow-none">
                <CardContent className="flex flex-col items-start gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold tracking-tight">
                      Author dashboard
                    </h3>
                    <p className="text-muted-foreground mt-1 text-sm">
                      Manage novels, chapters, and analytics.
                    </p>
                  </div>
                  <Button asChild>
                    <Link href="/author">
                      <PenTool className="size-4" aria-hidden />
                      Open dashboard
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}

function Metric({
  value,
  label,
  onClick,
}: {
  value: number;
  label: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="hover:bg-background/80 focus-visible:ring-ring rounded-2xl border border-border/60 bg-background/60 px-2 py-3 text-center backdrop-blur transition-colors focus-visible:ring-2 focus-visible:outline-none sm:px-3"
    >
      <p className="text-xl font-semibold tabular-nums tracking-tight sm:text-2xl">
        {value}
      </p>
      <p className="text-muted-foreground mt-0.5 text-[11px] sm:text-xs">
        {label}
      </p>
    </button>
  );
}

function EmptyShelf() {
  return (
    <div className="rounded-2xl border border-dashed px-6 py-10 text-center">
      <BookOpen
        className="text-muted-foreground mx-auto mb-3 size-10 opacity-60"
        aria-hidden
      />
      <h3 className="text-sm font-medium sm:text-base">Your shelf is empty</h3>
      <p className="text-muted-foreground mx-auto mt-1 max-w-xs text-xs sm:text-sm">
        Add novels as you browse to track progress and favorites.
      </p>
      <Button asChild size="sm" className="mt-4">
        <Link href="/browse">
          Browse novels
          <ArrowRight className="size-3.5" aria-hidden />
        </Link>
      </Button>
    </div>
  );
}

function ProfileViewSkeleton() {
  return (
    <div className="pb-24 md:pb-8">
      <section className="relative overflow-hidden border-b">
        <div className="from-muted/40 to-background absolute inset-0 bg-gradient-to-b" />
        <div className="container relative mx-auto px-4 pt-8 pb-6 sm:px-6 sm:pt-10 sm:pb-8 lg:px-8">
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start sm:gap-8">
            <Skeleton className="h-24 w-24 rounded-full sm:h-28 sm:w-28" />
            <div className="w-full flex-1 space-y-3 text-center sm:text-left">
              <Skeleton className="mx-auto h-8 w-48 sm:mx-0" />
              <Skeleton className="mx-auto h-4 w-64 sm:mx-0" />
              <div className="mt-4 grid grid-cols-3 gap-2 sm:max-w-md">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 rounded-2xl" />
                ))}
              </div>
              <Skeleton className="mx-auto mt-2 h-9 w-32 sm:mx-0" />
            </div>
          </div>
        </div>
      </section>
      <div className="container mx-auto space-y-4 px-4 pt-4 sm:px-6 sm:pt-6 lg:px-8">
        <Skeleton className="h-11 w-full rounded-lg" />
        <Skeleton className="h-40 w-full rounded-2xl" />
        <div className="grid gap-4 lg:grid-cols-5">
          <Skeleton className="h-56 rounded-2xl lg:col-span-3" />
          <Skeleton className="h-56 rounded-2xl lg:col-span-2" />
        </div>
      </div>
    </div>
  );
}
