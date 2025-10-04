"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTheme } from "next-themes";
import { Search, User, Settings, BookOpen, LogOut, Mail, MailCheck, X, Clock, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { useAuth } from "@/hooks/use-auth";
import { useSearchNovels } from "@/hooks/use-novels";
import { formatRating, truncateDescription } from "@/lib/novel-utils";
import { SearchSpinner } from "@/components/ui/spinner";
import { Novel } from "@/types/api";

export function Navbar() {
  const { user, isAuthenticated, logout, loading, sendEmailVerification } = useAuth();
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  
  // Search novels with debouncing (minimum 3 characters)
  const { data: searchResults, loading: searchLoading } = useSearchNovels(
    searchQuery.length >= 3 ? searchQuery : ''
  );

  // Prevent hydration mismatch by ensuring component is mounted
  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle click outside to close search results
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
        setIsSearchFocused(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
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
    setSearchQuery('');
    setShowResults(false);
  };

  const handleResultClick = () => {
    setShowResults(false);
    setIsSearchFocused(false);
  };

  return (
    <nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-4 md:px-6 lg:px-8">
        {/* Left side - Logo and Navigation */}
        <div className="flex items-center space-x-6">
          <Link 
            href="/" 
            className="flex items-center hover:opacity-80 transition-opacity"
          >
            {/* Render a placeholder during hydration, then the actual logo */}
            {!mounted ? (
              <div className="h-8 w-[120px] bg-muted animate-pulse rounded" />
            ) : (
              <Image
                src={resolvedTheme === 'dark' ? '/logo-dark.svg' : '/logo-light.svg'}
                alt="RANOVEL"
                width={120}
                height={40}
                className="h-8 w-auto"
                priority
              />
            )}
          </Link>
          
          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-4">
            <Link 
              href="/search"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Browse
            </Link>
            <Link 
              href="/genres"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Genres
            </Link>
            <Link 
              href="/top-rated"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Top Rated
            </Link>
          </div>
        </div>

        {/* Middle - Enhanced Search bar */}
        <div className="flex-1 max-w-md mx-4 md:mx-8 relative" ref={searchRef}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search novels, authors..."
              className="pl-10 pr-10 w-full"
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={handleSearchFocus}
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                onClick={handleSearchClear}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>

          {/* Search Results Dropdown */}
          {showResults && (
            <Card className="absolute top-full left-0 right-0 mt-1 z-50 max-h-96 overflow-y-auto py-0">
              <CardContent className="p-0">
                {searchQuery.length < 3 ? (
                  <div className="p-4 text-sm text-muted-foreground text-center">
                    Type at least 3 characters to search
                  </div>
                ) : searchLoading ? (
                  <div className="p-6 text-center">
                    <SearchSpinner />
                  </div>
                ) : searchResults && searchResults.length > 0 ? (
                  <div className="py-2">
                    <div className="px-3 py-2 text-xs font-medium text-muted-foreground border-b">
                      {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} found
                    </div>
                    {searchResults.slice(0, 8).map((novel: Novel) => (
                      <Link
                        key={novel.id}
                        href={`/novels/${novel.slug}`}
                        className="block hover:bg-muted/50 transition-colors"
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
                                className="rounded object-cover bg-muted"
                              />
                            ) : (
                              <div className="w-12 h-16 bg-muted rounded flex items-center justify-center">
                                <BookOpen className="h-6 w-6 text-muted-foreground" />
                              </div>
                            )}
                          </div>
                          
                          {/* Novel Info */}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm truncate">{novel.title}</h4>
                            <p className="text-xs text-muted-foreground truncate">by {novel.author}</p>
                            
                            {/* Novel Stats */}
                            <div className="flex items-center gap-3 mt-1">
                              <div className="flex items-center gap-1">
                                <Star className="h-3 w-3 fill-current text-yellow-400" />
                                <span className="text-xs">{formatRating(novel.rating)}</span>
                              </div>
                              <Badge variant="outline" className="text-xs h-4">
                                {novel.status}
                              </Badge>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                {novel.total_chapters} ch
                              </div>
                            </div>
                            
                            {/* Genres */}
                            {novel.genres.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {novel.genres.slice(0, 2).map((genre) => (
                                  <Badge key={genre.id} variant="secondary" className="text-xs h-4">
                                    {genre.name}
                                  </Badge>
                                ))}
                                {novel.genres.length > 2 && (
                                  <span className="text-xs text-muted-foreground">+{novel.genres.length - 2}</span>
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
                        className="text-sm text-primary hover:underline font-medium"
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
                    <BookOpen className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No novels found</p>
                    <p className="text-xs text-muted-foreground">Try different keywords</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right side - Auth section */}
        <div className="flex items-center space-x-4">
          <ModeToggle />
          {loading ? (
            <div className="h-8 w-8 animate-pulse bg-muted rounded-full" />
          ) : isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar || undefined} alt={user.name} />
                    <AvatarFallback>
                      {user.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {!user.email_verified && (
                    <div className="absolute -top-1 -right-1">
                      <Badge variant="destructive" className="h-3 w-3 p-0 flex items-center justify-center">
                        {/* <Mail className="" /> */}
                      </Badge>
                    </div>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64" align="end" forceMount>
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                  {!user.email_verified && (
                    <div className="flex items-center gap-1 mt-1">
                      <Mail className="h-3 w-3 text-destructive" />
                      <span className="text-xs text-destructive">Email not verified</span>
                    </div>
                  )}
                  {user.is_admin && (
                    <Badge variant="secondary" className="mt-1 text-xs">
                      Admin
                    </Badge>
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
                
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <BookOpen className="mr-2 h-4 w-4" />
                  My Library
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                
                <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center space-x-2">
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Sign in
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm">
                  Sign up
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}