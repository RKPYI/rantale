# Novel API Integration Guide

This document provides comprehensive examples of how to use the Novel API
integration in the Rantale frontend.

## Quick Start

The novel API is fully integrated with TypeScript types, React hooks, and
service layers. Here's how to get started:

```tsx
import {
  useNovels,
  useSearchNovels,
  usePopularNovels,
} from "@/hooks/use-novels";
import { novelService } from "@/services/novels";
import { formatRating, formatChapterCount } from "@/lib/novel-utils";
```

## Available Endpoints

### Public Endpoints (No Authentication Required)

1. **Get Novels with Pagination & Filtering**
   - `GET /novels` - List novels with optional filters
   - `GET /novels/search` - Search novels by query
   - `GET /novels/popular` - Get popular novels
   - `GET /novels/latest` - Get latest novels
   - `GET /novels/recommendations` - Get recommended novels
   - `GET /novels/genres` - Get available genres
   - `GET /novels/{slug}` - Get novel details by slug

### Admin Endpoints (Authentication + Admin Role Required)

1. **Novel Management**
   - `POST /novels` - Create new novel
   - `PUT /novels/{slug}` - Update novel
   - `DELETE /novels/{slug}` - Delete novel

## React Hooks Usage

### Basic Novel Listing

```tsx
import { useNovels } from "@/hooks/use-novels";
import { NovelListParams } from "@/types/api";

function NovelList() {
  const params: NovelListParams = {
    page: 1,
    per_page: 12,
    sort_by: "latest",
    sort_order: "desc",
  };

  const { data: novels, loading, error, refetch } = useNovels(params);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {novels?.data.map((novel) => (
        <div key={novel.id}>
          <h3>{novel.title}</h3>
          <p>by {novel.author}</p>
          <p>Rating: {formatRating(novel.rating)}</p>
        </div>
      ))}
    </div>
  );
}
```

### Search Functionality

```tsx
import { useSearchNovels } from "@/hooks/use-novels";
import { useState } from "react";

function NovelSearch() {
  const [query, setQuery] = useState("");
  const { data: searchResults, loading } = useSearchNovels(query);

  return (
    <div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search novels..."
        minLength={3} // Search triggers at 3+ characters
      />

      {loading && <div>Searching...</div>}

      {searchResults?.map((novel) => (
        <div key={novel.id}>{novel.title}</div>
      ))}
    </div>
  );
}
```

### Popular/Latest/Recommended Novels

```tsx
import {
  usePopularNovels,
  useLatestNovels,
  useRecommendedNovels,
} from "@/hooks/use-novels";

function FeaturedSections() {
  const { data: popular } = usePopularNovels();
  const { data: latest } = useLatestNovels();
  const { data: recommended } = useRecommendedNovels();

  return (
    <div>
      <section>
        <h2>Popular Novels</h2>
        {popular?.slice(0, 6).map((novel) => (
          <NovelCard key={novel.id} novel={novel} />
        ))}
      </section>

      <section>
        <h2>Latest Updates</h2>
        {latest?.slice(0, 6).map((novel) => (
          <NovelCard key={novel.id} novel={novel} />
        ))}
      </section>

      <section>
        <h2>Recommended for You</h2>
        {recommended?.slice(0, 6).map((novel) => (
          <NovelCard key={novel.id} novel={novel} />
        ))}
      </section>
    </div>
  );
}
```

### Single Novel Details

```tsx
import { useNovel } from "@/hooks/use-novels";

function NovelDetails({ slug }: { slug: string }) {
  const { data: novel, loading, error } = useNovel(slug);

  if (loading) return <div>Loading novel...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!novel) return <div>Novel not found</div>;

  return (
    <div>
      <h1>{novel.title}</h1>
      <p>by {novel.author}</p>
      <p>{novel.description}</p>

      <div>
        <span>Status: {novel.status}</span>
        <span>Rating: {formatRating(novel.rating)}</span>
        <span>Chapters: {formatChapterCount(novel.total_chapters)}</span>
      </div>

      <div>
        <h3>Genres</h3>
        {novel.genres.map((genre) => (
          <span key={genre.id}>{genre.name}</span>
        ))}
      </div>

      <div>
        <h3>Chapters</h3>
        {novel.chapters?.map((chapter) => (
          <div key={chapter.id}>
            Chapter {chapter.chapter_number}: {chapter.title}
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Filtering by Genre/Status

```tsx
import { useNovelsByGenre, useNovelsByStatus } from "@/hooks/use-novels";

function FilteredNovels() {
  // Filter by genre
  const { data: fantasyNovels } = useNovelsByGenre("fantasy", {
    page: 1,
    per_page: 10,
  });

  // Filter by status
  const { data: ongoingNovels } = useNovelsByStatus("ongoing", {
    sort_by: "updated",
    sort_order: "desc",
  });

  return (
    <div>
      <section>
        <h2>Fantasy Novels</h2>
        {fantasyNovels?.data.map((novel) => (
          <NovelCard key={novel.id} novel={novel} />
        ))}
      </section>

      <section>
        <h2>Ongoing Novels</h2>
        {ongoingNovels?.data.map((novel) => (
          <NovelCard key={novel.id} novel={novel} />
        ))}
      </section>
    </div>
  );
}
```

### Pagination Handling

```tsx
import { useNovels } from "@/hooks/use-novels";
import { simplifyPagination } from "@/lib/novel-utils";
import { useState } from "react";

function PaginatedNovels() {
  const [currentPage, setCurrentPage] = useState(1);

  const {
    data: novels,
    loading,
    refetch,
  } = useNovels({
    page: currentPage,
    per_page: 12,
  });

  const pagination = novels ? simplifyPagination(novels) : null;

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    refetch(); // Refetch with new page
  };

  return (
    <div>
      {/* Novel grid */}
      <div className="grid grid-cols-3 gap-4">
        {novels?.data.map((novel) => (
          <NovelCard key={novel.id} novel={novel} />
        ))}
      </div>

      {/* Pagination controls */}
      {pagination && pagination.totalPages > 1 && (
        <div className="mt-6 flex justify-center gap-2">
          <button
            onClick={() => handlePageChange(pagination.currentPage - 1)}
            disabled={!pagination.hasPrev}
          >
            Previous
          </button>

          <span>
            Page {pagination.currentPage} of {pagination.totalPages}
          </span>

          <button
            onClick={() => handlePageChange(pagination.currentPage + 1)}
            disabled={!pagination.hasNext}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
```

## Service Layer Usage (Direct API Calls)

For more control, you can use the service layer directly:

```tsx
import { novelService } from "@/services/novels";
import { useAsync } from "@/hooks/use-api";

function ManualApiCalls() {
  const { loading, execute } = useAsync();

  const loadNovels = async () => {
    try {
      const novels = await execute(novelService.getNovels, {
        page: 1,
        per_page: 10,
        genre: "fantasy",
      });
      console.log("Loaded novels:", novels);
    } catch (error) {
      console.error("Error loading novels:", error);
    }
  };

  const searchNovels = async (query: string) => {
    try {
      const results = await execute(novelService.searchNovels, query);
      console.log("Search results:", results);
    } catch (error) {
      console.error("Search error:", error);
    }
  };

  return (
    <div>
      <button onClick={loadNovels} disabled={loading}>
        Load Novels
      </button>

      <button onClick={() => searchNovels("fantasy")} disabled={loading}>
        Search Fantasy
      </button>
    </div>
  );
}
```

## Utility Functions

The `novel-utils.ts` file provides helpful utility functions:

```tsx
import {
  formatRating,
  formatChapterCount,
  formatViewCount,
  formatStatus,
  getStatusColor,
  truncateDescription,
  formatRelativeTime,
  sortNovels,
  filterNovelsByGenre,
  getUniqueGenres,
} from "@/lib/novel-utils";

function NovelCard({ novel }: { novel: Novel }) {
  return (
    <div className="novel-card">
      <h3>{novel.title}</h3>
      <p>by {novel.author}</p>
      <p>{truncateDescription(novel.description, 100)}</p>

      <div className="stats">
        <span>Rating: {formatRating(novel.rating)}</span>
        <span>{formatChapterCount(novel.total_chapters)}</span>
        <span>{formatViewCount(novel.views)} views</span>
      </div>

      <div className="meta">
        <Badge variant={getStatusColor(novel.status)}>
          {formatStatus(novel.status)}
        </Badge>
        <span>Updated {formatRelativeTime(novel.updated_at)}</span>
      </div>

      <div className="genres">
        {novel.genres.map((genre) => (
          <Badge key={genre.id} variant="secondary">
            {genre.name}
          </Badge>
        ))}
      </div>
    </div>
  );
}
```

## Admin Operations (Requires Authentication)

```tsx
import { novelService } from "@/services/novels";
import { useAuth } from "@/hooks/use-auth";
import { useAsync } from "@/hooks/use-api";

function AdminNovelManagement() {
  const { user, isAuthenticated } = useAuth();
  const { loading, execute } = useAsync();

  // Check if user is admin
  const isAdmin = isAuthenticated && user?.is_admin;

  const createNovel = async () => {
    if (!isAdmin) return;

    try {
      const newNovel = await execute(novelService.createNovel, {
        title: "New Novel",
        author: "Author Name",
        description: "Novel description...",
        status: "ongoing",
        genres: [1, 2, 3], // Genre IDs
      });
      console.log("Created novel:", newNovel);
    } catch (error) {
      console.error("Error creating novel:", error);
    }
  };

  const updateNovel = async (slug: string) => {
    if (!isAdmin) return;

    try {
      const updatedNovel = await execute(novelService.updateNovel, slug, {
        title: "Updated Title",
        status: "completed",
      });
      console.log("Updated novel:", updatedNovel);
    } catch (error) {
      console.error("Error updating novel:", error);
    }
  };

  const deleteNovel = async (slug: string) => {
    if (!isAdmin) return;

    try {
      await execute(novelService.deleteNovel, slug);
      console.log("Novel deleted successfully");
    } catch (error) {
      console.error("Error deleting novel:", error);
    }
  };

  if (!isAdmin) {
    return <div>Admin access required</div>;
  }

  return (
    <div>
      <button onClick={createNovel} disabled={loading}>
        Create Novel
      </button>
      {/* Add more admin controls */}
    </div>
  );
}
```

## Error Handling

All hooks return error states that you should handle:

```tsx
function NovelListWithErrorHandling() {
  const { data: novels, loading, error, refetch } = useNovels();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="error-state">
        <h3>Error Loading Novels</h3>
        <p>{error}</p>
        <button onClick={refetch}>Try Again</button>
      </div>
    );
  }

  if (!novels || novels.data.length === 0) {
    return (
      <div className="empty-state">
        <h3>No Novels Found</h3>
        <p>Try adjusting your filters or search terms.</p>
      </div>
    );
  }

  return (
    <div>
      {novels.data.map((novel) => (
        <NovelCard key={novel.id} novel={novel} />
      ))}
    </div>
  );
}
```

## Complete Example Components

See the following example components for complete implementations:

1. **`/src/components/api-demo.tsx`** - Basic API integration demo
2. **`/src/components/novel-browser.tsx`** - Advanced novel browser with filters
   and tabs
3. **`/src/lib/novel-utils.ts`** - Utility functions for novel data manipulation

These components demonstrate all the patterns and best practices for working
with the Novel API in the Rantale frontend application.
