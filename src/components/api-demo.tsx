"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Star, Clock, User } from 'lucide-react';
import { useNovels, useSearchNovels, useFeaturedNovels } from '@/hooks/use-novels';
import { useAuth } from '@/hooks/use-auth';
import { novelService } from '@/services/novels';
import { useAsync } from '@/hooks/use-api';
import { Novel } from '@/types/api';

export function ApiDemoComponent() {
  const [searchQuery, setSearchQuery] = useState('');
  const { user, isAuthenticated, login, logout } = useAuth();
  
  // API hooks examples
  const { data: novels, loading: novelsLoading, error: novelsError } = useNovels({ 
    page: 1, 
    limit: 6,
    sortBy: 'rating',
    sortOrder: 'desc'
  });
  
  const { data: featuredNovels, loading: featuredLoading } = useFeaturedNovels(3);
  
  const { data: searchResults, loading: searchLoading } = useSearchNovels(
    searchQuery.length > 2 ? searchQuery : '',
    { limit: 5 }
  );

  // Async operations example
  const { loading: addingToLibrary, execute: addToLibrary } = useAsync<void>();

  const handleAddToLibrary = async (novelId: string) => {
    const result = await addToLibrary(novelService.addToLibrary, novelId);
    if (result !== null) {
      // Success - you could show a toast notification here
      console.log('Added to library successfully');
    }
  };

  const handleLogin = async () => {
    const success = await login('demo@example.com', 'password', true);
    if (success) {
      console.log('Login successful');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">API Integration Demo</h1>
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
                <p>Welcome, <span className="font-semibold">{user.username}</span>!</p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
              <Button onClick={logout} variant="outline">
                Logout
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <p>Not authenticated</p>
              <Button onClick={handleLogin}>
                Demo Login
              </Button>
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
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
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
            
            {searchResults && searchResults.data.length > 0 && (
              <div className="space-y-2">
                {searchResults.data.map((novel) => (
                  <div key={novel.id} className="flex items-center justify-between p-2 border rounded">
                    <div>
                      <h4 className="font-medium">{novel.title}</h4>
                      <p className="text-sm text-muted-foreground">by {novel.author}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{novel.genre.join(', ')}</Badge>
                      <div className="flex items-center gap-1 text-sm">
                        <Star className="h-3 w-3 fill-current" />
                        {novel.rating.toFixed(1)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Featured Novels */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Featured Novels
          </CardTitle>
        </CardHeader>
        <CardContent>
          {featuredLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
          ) : featuredNovels ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {featuredNovels.map((novel) => (
                <Card key={novel.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-2">{novel.title}</h3>
                    <p className="text-sm text-muted-foreground mb-2">by {novel.author}</p>
                    <div className="flex items-center justify-between text-sm">
                      <Badge variant="outline">{novel.status}</Badge>
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-current" />
                        {novel.rating.toFixed(1)}
                      </div>
                    </div>
                    {isAuthenticated && (
                      <Button
                        size="sm"
                        className="w-full mt-3"
                        onClick={() => handleAddToLibrary(novel.id)}
                        disabled={addingToLibrary}
                      >
                        {addingToLibrary ? 'Adding...' : 'Add to Library'}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No featured novels available</p>
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
            <div className="text-red-500 text-sm mb-4">
              Error loading novels: {novelsError}
            </div>
          )}
          
          {novelsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="h-40 w-full" />
              ))}
            </div>
          ) : novels && novels.data ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {novels.data.map((novel) => (
                  <Card key={novel.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-2 truncate">{novel.title}</h3>
                      <p className="text-sm text-muted-foreground mb-2">by {novel.author}</p>
                      <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                        {novel.description}
                      </p>
                      <div className="flex flex-wrap gap-1 mb-3">
                        {novel.genre.slice(0, 2).map((g) => (
                          <Badge key={g} variant="secondary" className="text-xs">
                            {g}
                          </Badge>
                        ))}
                        {novel.genre.length > 2 && (
                          <Badge variant="secondary" className="text-xs">
                            +{novel.genre.length - 2}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <Badge variant="outline">{novel.status}</Badge>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-current" />
                          {novel.rating.toFixed(1)}
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground mt-2">
                        {novel.chapters} chapters • {novel.views} views
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              {novels.pagination && (
                <div className="text-center text-sm text-muted-foreground">
                  Showing {novels.data.length} of {novels.pagination.total} novels 
                  (Page {novels.pagination.page} of {novels.pagination.totalPages})
                </div>
              )}
            </div>
          ) : (
            <p className="text-muted-foreground">No novels available</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}