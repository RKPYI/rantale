# API Integration Setup

This document describes the API integration setup for the RDKNovel frontend application.

## 🚀 Quick Start

1. **Environment Setup**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your actual API configuration
   ```

2. **Basic Usage**
   ```tsx
   import { useAuth } from '@/hooks/use-auth';
   import { useNovels } from '@/hooks/use-novels';

   function MyComponent() {
     const { user, login, logout } = useAuth();
     const { data: novels, loading, error } = useNovels({ page: 1, limit: 10 });

     // Component logic here...
   }
   ```

## 📁 File Structure

```
src/
├── lib/
│   ├── env.ts              # Environment configuration & validation
│   └── api-client.ts       # Centralized API client with auth
├── types/
│   └── api.ts              # TypeScript interfaces for API responses
├── services/
│   ├── auth.ts             # Authentication service methods
│   ├── novels.ts           # Novel-related API calls
│   └── reading.ts          # Reading progress service
├── hooks/
│   ├── use-api.ts          # Generic API state management hooks
│   ├── use-auth.ts         # Authentication state hook
│   └── use-novels.ts       # Novel-specific data hooks
└── components/
    └── api-demo.tsx        # Example component showing API usage
```

## 🔧 Configuration

### Environment Variables

Required variables in `.env.local`:

```bash
# API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Authentication (if using NextAuth or similar)
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000
```

### API Client Features

- **Automatic Authentication**: JWT tokens automatically added to requests
- **Token Persistence**: Supports both session and persistent storage
- **Error Handling**: Consistent error formatting with `ApiError` interface
- **Type Safety**: Full TypeScript support for all endpoints
- **File Uploads**: Built-in support for `FormData` uploads

## 🎯 Usage Patterns

### 1. Authentication

```tsx
import { useAuth } from '@/hooks/use-auth';

function LoginComponent() {
  const { login, logout, user, isAuthenticated, loading } = useAuth();

  const handleLogin = async () => {
    const success = await login('user@example.com', 'password', true); // remember me
    if (success) {
      // Login successful
    }
  };

  return (
    <div>
      {isAuthenticated ? (
        <div>
          <p>Welcome, {user?.username}!</p>
          <button onClick={logout}>Logout</button>
        </div>
      ) : (
        <button onClick={handleLogin}>Login</button>
      )}
    </div>
  );
}
```

### 2. Data Fetching

```tsx
import { useNovels, useNovel } from '@/hooks/use-novels';

function NovelsComponent() {
  // List novels with pagination and filters
  const { data: novels, loading, error, refetch } = useNovels({
    page: 1,
    limit: 20,
    genre: ['fantasy', 'adventure'],
    sortBy: 'rating',
    sortOrder: 'desc'
  });

  // Single novel
  const { data: novel } = useNovel('novel-id-123');

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {novels?.data.map(novel => (
        <div key={novel.id}>{novel.title}</div>
      ))}
      <button onClick={refetch}>Refresh</button>
    </div>
  );
}
```

### 3. Async Operations

```tsx
import { useAsync } from '@/hooks/use-api';
import { novelService } from '@/services/novels';

function NovelActions({ novelId }: { novelId: string }) {
  const { loading, error, execute } = useAsync();

  const handleAddToLibrary = async () => {
    const result = await execute(novelService.addToLibrary, novelId);
    if (result) {
      // Success - show notification, update UI, etc.
    }
  };

  return (
    <button 
      onClick={handleAddToLibrary} 
      disabled={loading}
    >
      {loading ? 'Adding...' : 'Add to Library'}
    </button>
  );
}
```

### 4. Search with Debouncing

```tsx
import { useState } from 'react';
import { useSearchNovels } from '@/hooks/use-novels';

function SearchComponent() {
  const [query, setQuery] = useState('');
  
  // Only search when query is 3+ characters
  const { data: results, loading } = useSearchNovels(
    query.length >= 3 ? query : '',
    { limit: 10 }
  );

  return (
    <div>
      <input 
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search novels..."
      />
      
      {loading && <div>Searching...</div>}
      
      {results?.data.map(novel => (
        <div key={novel.id}>{novel.title}</div>
      ))}
    </div>
  );
}
```

## 🔐 Authentication Flow

1. **Login**: Call `authService.login()` → Token stored automatically
2. **Authenticated Requests**: Token added to all subsequent requests
3. **Token Persistence**: Supports session storage or localStorage (remember me)
4. **Auto-logout**: Invalid tokens automatically removed
5. **Profile Sync**: User profile automatically fetched and cached

## 📡 API Response Format

All API responses follow a consistent format:

```typescript
// Single item response
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

// Paginated response
interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}
```

## 🚨 Error Handling

Errors are consistently handled across all API calls:

```tsx
import { handleApiError } from '@/lib/api-client';

try {
  await novelService.addToLibrary(novelId);
} catch (error) {
  const errorMessage = handleApiError(error);
  // Display errorMessage to user
}
```

## 🎨 Integration with UI Components

The API hooks integrate seamlessly with shadcn/ui components:

```tsx
import { Skeleton } from '@/components/ui/skeleton';
import { useNovels } from '@/hooks/use-novels';

function NovelsList() {
  const { data: novels, loading, error } = useNovels();

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-destructive text-sm">
        Error: {error}
      </div>
    );
  }

  // Render novels...
}
```

## 📋 Best Practices

1. **Use Services**: Always use service methods rather than calling `apiClient` directly
2. **Type Safety**: Import and use TypeScript interfaces from `@/types/api`
3. **Error Handling**: Use `handleApiError()` for consistent error messages
4. **Loading States**: Always handle loading and error states in UI
5. **Token Management**: Let the auth system handle tokens automatically
6. **Environment Variables**: Validate required env vars in `src/lib/env.ts`

## 🔍 Example Component

See `src/components/api-demo.tsx` for a comprehensive example showing:
- Authentication flow
- Data fetching with loading states
- Search functionality
- Async operations
- Error handling
- Integration with shadcn/ui components