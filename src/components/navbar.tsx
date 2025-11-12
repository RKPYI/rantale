"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTheme } from "next-themes";
import {
  Search,
  User,
  Settings,
  BookOpen,
  LogOut,
  Mail,
  MailCheck,
  X,
  Clock,
  Star,
  Shield,
  PenTool,
  Download,
  Library,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserAvatar, UserInfo } from "@/components/ui/user-avatar";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ModeToggle from "@/components/mode-toggle";
import { useAuth } from "@/contexts/auth-context";
import { useSearchNovels } from "@/hooks/use-novels";
import { formatRating, truncateDescription } from "@/lib/novel-utils";
import { getUserRole } from "@/lib/user-utils";
import { SearchSpinner } from "@/components/ui/spinner";
import { Novel } from "@/types/api";
import { AuthModal } from "@/components/auth-modal";
import { SearchSheet } from "@/components/search-sheet";

export function Navbar() {
  const { user, isAuthenticated, logout, loading, sendEmailVerification } =
    useAuth();
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Search novels with debouncing (minimum 3 characters)
  const { data: searchResults, loading: searchLoading } = useSearchNovels(
    searchQuery.length >= 3 ? searchQuery : "",
  );

  // Prevent hydration mismatch by ensuring component is mounted
  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle click outside to close search results
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowResults(false);
        setIsSearchFocused(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Show/hide results based on search state
  useEffect(() => {
    if (searchQuery.length >= 3 && isSearchFocused) {
      setShowResults(true);
    } else {
      setShowResults(false);
    }
  }, [searchQuery, isSearchFocused]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchFocus = () => {
    setIsSearchFocused(true);
    if (searchQuery.length >= 3) {
      setShowResults(true);
    }
  };

  const handleSearchClear = () => {
    setSearchQuery("");
    setShowResults(false);
  };

  const handleResultClick = () => {
    setShowResults(false);
    setIsSearchFocused(false);
  };

  return (
    <nav
      className={`bg-background/95 supports-[backdrop-filter]:bg-background/80 sticky top-0 border-b backdrop-blur ${showResults ? "z-[100]" : "z-50"}`}
    >
      <div className="flex h-14 items-center justify-between px-4 md:h-16 md:px-6 lg:px-8">
        {/* Left side - Logo */}
        <div className="flex items-center space-x-4 md:space-x-6">
          <Link
            href="/"
            className="flex items-center transition-opacity hover:opacity-80"
          >
            {/* Render a placeholder during hydration, then the actual logo */}
            {!mounted ? (
              <div className="bg-muted h-7 w-[100px] animate-pulse rounded md:h-8 md:w-[120px]" />
            ) : (
              <Image
                src={
                  resolvedTheme === "dark"
                    ? "/rantale-dark.svg"
                    : "/rantale-light.svg"
                }
                alt="Rantale"
                width={120}
                height={40}
                className="h-7 w-auto md:h-8"
                priority
              />
            )}
          </Link>

          {/* Navigation Links - Desktop only */}
          <div className="hidden items-center space-x-4 lg:flex">
            <Link
              href="/search"
              className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"
            >
              Browse
            </Link>
            <Link
              href="/genres"
              className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"
            >
              Genres
            </Link>
            <Link
              href="/top-rated"
              className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"
            >
              Top Rated
            </Link>
          </div>
        </div>

        {/* Middle - Enhanced Search bar (Desktop only) */}
        <div
          className="relative mx-4 hidden max-w-md flex-1 md:mx-8 md:block"
          ref={searchRef}
        >
          <div className="relative">
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
            <Input
              placeholder="Search novels, authors..."
              className="w-full pr-10 pl-10"
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={handleSearchFocus}
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-1/2 right-1 h-6 w-6 -translate-y-1/2 transform p-0"
                onClick={handleSearchClear}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>

          {/* Search Results Dropdown */}
          {showResults && (
            <Card className="absolute top-full right-0 left-0 z-50 mt-1 max-h-96 overflow-y-auto py-0">
              <CardContent className="p-0">
                {searchQuery.length < 3 ? (
                  <div className="text-muted-foreground p-4 text-center text-sm">
                    Type at least 3 characters to search
                  </div>
                ) : searchLoading ? (
                  <div className="p-6 text-center">
                    <SearchSpinner />
                  </div>
                ) : searchResults && searchResults.length > 0 ? (
                  <div className="py-2">
                    <div className="text-muted-foreground border-b px-3 py-2 text-xs font-medium">
                      {searchResults.length} result
                      {searchResults.length !== 1 ? "s" : ""} found
                    </div>
                    {searchResults.slice(0, 8).map((novel: Novel) => (
                      <Link
                        key={novel.id}
                        href={`/novels/${novel.slug}`}
                        className="hover:bg-muted/50 block transition-colors"
                        onClick={handleResultClick}
                      >
                        <div className="flex items-center gap-3 p-3">
                          {/* Novel Cover */}
                          <div className="flex-shrink-0">
                            {novel.cover_image ? (
                              <Image
                                src={novel.cover_image}
                                alt={novel.title}
                                width={48}
                                height={64}
                                className="bg-muted rounded object-cover"
                              />
                            ) : (
                              <div className="bg-muted flex h-16 w-12 items-center justify-center rounded">
                                <BookOpen className="text-muted-foreground h-6 w-6" />
                              </div>
                            )}
                          </div>

                          {/* Novel Info */}
                          <div className="min-w-0 flex-1">
                            <h4 className="truncate text-sm font-medium">
                              {novel.title}
                            </h4>
                            <p className="text-muted-foreground truncate text-xs">
                              by {novel.author}
                            </p>

                            {/* Novel Stats */}
                            <div className="mt-1 flex items-center gap-3">
                              <div className="flex items-center gap-1">
                                <Star className="h-3 w-3 fill-current text-yellow-400" />
                                <span className="text-xs">
                                  {formatRating(novel.rating)}
                                </span>
                              </div>
                              <Badge variant="outline" className="h-4 text-xs">
                                {novel.status}
                              </Badge>
                              <div className="text-muted-foreground flex items-center gap-1 text-xs">
                                <Clock className="h-3 w-3" />
                                {novel.total_chapters} ch
                              </div>
                            </div>

                            {/* Genres */}
                            {novel.genres.length > 0 && (
                              <div className="mt-1 flex flex-wrap gap-1">
                                {novel.genres.slice(0, 2).map((genre) => (
                                  <Badge
                                    key={genre.id}
                                    variant="secondary"
                                    className="h-4 text-xs"
                                  >
                                    {genre.name}
                                  </Badge>
                                ))}
                                {novel.genres.length > 2 && (
                                  <span className="text-muted-foreground text-xs">
                                    +{novel.genres.length - 2}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </Link>
                    ))}

                    <div className="border-t p-3 text-center">
                      <Link
                        href={`/search?q=${encodeURIComponent(searchQuery)}`}
                        className="text-primary text-sm font-medium hover:underline"
                        onClick={handleResultClick}
                      >
                        {searchResults.length > 8 ? (
                          <>View all {searchResults.length} results</>
                        ) : (
                          <>Advanced search & filters</>
                        )}
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 text-center">
                    <BookOpen className="text-muted-foreground mx-auto mb-2 h-8 w-8" />
                    <p className="text-muted-foreground text-sm">
                      No novels found
                    </p>
                    <p className="text-muted-foreground text-xs">
                      Try different keywords
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center space-x-2 md:space-x-3">
          {/* Search Sheet - Mobile only */}
          <div className="md:hidden">
            <SearchSheet
              trigger={
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Search className="h-4 w-4" />
                </Button>
              }
            />
          </div>

          {/* Theme Toggle - Desktop & Mobile */}
          <div>
            <ModeToggle />
          </div>

          {loading ? (
            <div className="bg-muted h-8 w-8 animate-pulse rounded-full" />
          ) : isAuthenticated && user ? (
            <>
              {/* Notifications - Desktop only */}
              <div className="hidden md:block">
                <NotificationBell />
              </div>

              {/* User Menu - Desktop & Mobile */}
              <div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative h-8 w-8 rounded-full p-0"
                    >
                      <UserAvatar user={user} size="md" showBadge={true} />
                      {!user.email_verified && (
                        <div className="absolute -top-1 -left-1">
                          <Badge
                            variant="destructive"
                            className="flex h-3 w-3 items-center justify-center p-0"
                          >
                            <Mail className="h-2 w-2" />
                          </Badge>
                        </div>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-64" align="end" forceMount>
                    <div className="px-2 py-1.5">
                      <UserInfo
                        user={user}
                        showRole={true}
                        showVerificationStatus={false}
                        className="mb-1"
                      />
                      <p className="text-muted-foreground text-xs">
                        {user.email}
                      </p>
                      {!user.email_verified && (
                        <div className="mt-1 flex items-center gap-1">
                          <Mail className="text-destructive h-3 w-3" />
                          <span className="text-destructive text-xs">
                            Email not verified
                          </span>
                        </div>
                      )}
                    </div>

                    <DropdownMenuSeparator />

                    {!user.email_verified && (
                      <>
                        <DropdownMenuItem onClick={sendEmailVerification}>
                          <MailCheck className="mr-2 h-4 w-4" />
                          Verify Email
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                      </>
                    )}

                    <DropdownMenuItem asChild>
                      <Link href="/profile">
                        <User className="mr-2 h-4 w-4" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="hidden md:flex">
                      <Link href="/library">
                        <Library className="mr-2 h-4 w-4" />
                        My Library
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="hidden md:flex">
                      <Link href="/profile/downloads">
                        <Download className="mr-2 h-4 w-4" />
                        Downloads
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/notifications">
                        <Star className="mr-2 h-4 w-4" />
                        Notifications
                      </Link>
                    </DropdownMenuItem>

                    {/* Author Dashboard Link */}
                    {(getUserRole(user) === "author" ||
                      getUserRole(user) === "moderator" ||
                      getUserRole(user) === "admin") && (
                      <DropdownMenuItem asChild>
                        <Link href="/author">
                          <PenTool className="mr-2 h-4 w-4" />
                          Author Dashboard
                        </Link>
                      </DropdownMenuItem>
                    )}

                    {/* Admin Dashboard Link */}
                    {(getUserRole(user) === "admin" ||
                      getUserRole(user) === "moderator") && (
                      <DropdownMenuItem asChild>
                        <Link href="/admin">
                          <Shield className="mr-2 h-4 w-4" />
                          Admin Dashboard
                        </Link>
                      </DropdownMenuItem>
                    )}

                    <DropdownMenuSeparator />

                    <DropdownMenuItem
                      onClick={logout}
                      className="text-destructive focus:text-destructive"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </>
          ) : (
            <div className="flex items-center space-x-2">
              <AuthModal
                trigger={
                  <Button variant="ghost" size="sm">
                    Sign in
                  </Button>
                }
                defaultTab="signin"
              />
              <AuthModal
                trigger={
                  <Button size="sm" className="hidden md:flex">
                    Sign up
                  </Button>
                }
                defaultTab="signup"
              />
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
