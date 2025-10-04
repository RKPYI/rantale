"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Star, Clock, User } from "lucide-react";
import {
  useNovels,
  useSearchNovels,
  usePopularNovels,
  useLatestNovels,
} from "@/hooks/use-novels";
import { useAuth } from "@/hooks/use-auth";
import { novelService } from "@/services/novels";
import { useAsync } from "@/hooks/use-api";
import { Novel, NovelListParams } from "@/types/api";

export function ApiDemoComponent() {
  const [searchQuery, setSearchQuery] = useState("");
  const { user, isAuthenticated, login, logout } = useAuth();

  // API hooks examples
  const novelParams: NovelListParams = {
    page: 1,
    per_page: 6,
    sort_by: "rating",
    sort_order: "desc",
  };
  const {
    data: novels,
    loading: novelsLoading,
    error: novelsError,
  } = useNovels(novelParams);

  const { data: popularNovels, loading: popularLoading } = usePopularNovels();

  const { data: searchResults, loading: searchLoading } = useSearchNovels(
    searchQuery.length > 2 ? searchQuery : "",
  );

  // Async operations example (placeholder for future library functionality)
  const { loading: addingToLibrary, execute: addToLibrary } = useAsync<void>();

  const handleAddToLibrary = async (novelId: string) => {
    // Placeholder - library functionality not yet implemented in backend
    console.log("Add to library clicked for novel:", novelId);
    alert("Library functionality coming soon!");
  };

  const handleLogin = async () => {
    const success = await login("demo@example.com", "password", true);
    if (success) {
      console.log("Login successful");
    }
  };

  return (
    <div className="container mx-auto space-y-8 px-4 py-8">
      <div className="text-center">
        <h1 className="mb-4 text-3xl font-bold">API Integration Demo</h1>
        <p className="text-muted-foreground">
          Demonstrating the API client setup and usage patterns
        </p>
      </div>

      {/* Authentication Demo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Authentication
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isAuthenticated && user ? (
            <div className="flex items-center justify-between">
              <div>
                <p>
                  Welcome, <span className="font-semibold">{user.name}</span>!
                </p>
                <p className="text-muted-foreground text-sm">{user.email}</p>
              </div>
              <Button onClick={logout} variant="outline">
                Logout
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <p>Not authenticated</p>
              <Button onClick={handleLogin}>Demo Login</Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Search Demo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Novel Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="relative">
              <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
              <Input
                placeholder="Search novels... (type at least 3 characters)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {searchLoading && (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            )}

            {searchResults && searchResults.length > 0 && (
              <div className="space-y-2">
                {searchResults.map((novel) => (
                  <div
                    key={novel.id}
                    className="flex items-center justify-between rounded border p-2"
                  >
                    <div>
                      <h4 className="font-medium">{novel.title}</h4>
                      <p className="text-muted-foreground text-sm">
                        by {novel.author}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">
                        {novel.genres.map((g) => g.name).join(", ")}
                      </Badge>
                      <div className="flex items-center gap-1 text-sm">
                        <Star className="h-3 w-3 fill-current" />
                        {novel.rating
                          ? parseFloat(novel.rating).toFixed(1)
                          : "0.0"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Popular Novels */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Popular Novels
          </CardTitle>
        </CardHeader>
        <CardContent>
          {popularLoading ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
          ) : popularNovels ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {popularNovels.slice(0, 3).map((novel) => (
                <Card
                  key={novel.id}
                  className="transition-shadow hover:shadow-lg"
                >
                  <CardContent className="p-4">
                    <h3 className="mb-2 font-semibold">{novel.title}</h3>
                    <p className="text-muted-foreground mb-2 text-sm">
                      by {novel.author}
                    </p>
                    <div className="flex items-center justify-between text-sm">
                      <Badge variant="outline">{novel.status}</Badge>
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-current" />
                        {novel.rating
                          ? parseFloat(novel.rating).toFixed(1)
                          : "0.0"}
                      </div>
                    </div>
                    {isAuthenticated && (
                      <Button
                        size="sm"
                        className="mt-3 w-full"
                        onClick={() => handleAddToLibrary(novel.id.toString())}
                        disabled={addingToLibrary}
                      >
                        {addingToLibrary ? "Adding..." : "Add to Library"}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No popular novels available</p>
          )}
        </CardContent>
      </Card>

      {/* All Novels */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Latest Novels
          </CardTitle>
        </CardHeader>
        <CardContent>
          {novelsError && (
            <div className="mb-4 text-sm text-red-500">
              Error loading novels: {novelsError}
            </div>
          )}

          {novelsLoading ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="h-40 w-full" />
              ))}
            </div>
          ) : novels && novels.data ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {novels.data.map((novel) => (
                  <Card
                    key={novel.id}
                    className="transition-shadow hover:shadow-lg"
                  >
                    <CardContent className="p-4">
                      <h3 className="mb-2 truncate font-semibold">
                        {novel.title}
                      </h3>
                      <p className="text-muted-foreground mb-2 text-sm">
                        by {novel.author}
                      </p>
                      <p className="text-muted-foreground mb-3 line-clamp-2 text-xs">
                        {novel.description}
                      </p>
                      <div className="mb-3 flex flex-wrap gap-1">
                        {novel.genres.slice(0, 2).map((g) => (
                          <Badge
                            key={g.id}
                            variant="secondary"
                            className="text-xs"
                          >
                            {g.name}
                          </Badge>
                        ))}
                        {novel.genres.length > 2 && (
                          <Badge variant="secondary" className="text-xs">
                            +{novel.genres.length - 2}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <Badge variant="outline">{novel.status}</Badge>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-current" />
                          {novel.rating
                            ? parseFloat(novel.rating).toFixed(1)
                            : "0.0"}
                        </div>
                      </div>
                      <div className="text-muted-foreground mt-2 text-xs">
                        {novel.total_chapters} chapters • {novel.views} views
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="text-muted-foreground text-center text-sm">
                Showing {novels.data.length} of {novels.total} novels (Page{" "}
                {novels.current_page} of {novels.last_page})
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground">No novels available</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
