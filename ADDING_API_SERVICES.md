# Adding New API Services - Complete Guide

This guide explains how to integrate new backend APIs into the RDKNovel frontend
following the established architecture patterns.

## Architecture Overview

The frontend follows a **layered architecture**:

```
Page/Component → Hook → Service → API Client → Backend
```

- **API Client**: Centralized HTTP client with auth token management
- **Service**: API endpoint methods organized by domain
- **Hook**: React state management and data fetching logic
- **Component/Page**: UI that consumes the hook

---

## Step-by-Step Process

### Step 1: Define TypeScript Types

Create type definitions in `src/types/`.

**Example: Contact Form Types**

```typescript
// src/types/contact.ts

// Request payload
export interface ContactRequest {
  name: string;
  email: string;
  subject: string;
  message: string;
}

// API response
export interface ContactResponse {
  success: boolean;
  message: string;
}
```

**Export from `src/types/api.ts`:**

```typescript
export * from "./contact";
```

---

### Step 2: Create API Service

Create a service file in `src/services/` using the `apiClient`.

**Example: Contact Service**

```typescript
// src/services/contact.ts

import { apiClient } from "@/lib/api-client";
import { ContactRequest, ContactResponse } from "@/types/api";

export const contactService = {
  async submit(data: ContactRequest): Promise<ContactResponse> {
    const response = await apiClient.post<ContactResponse>(
      "/contact", // Backend endpoint
      data,
    );

    // Handle both wrapped and direct responses
    return response.data || (response as unknown as ContactResponse);
  },
};
```

**API Client Methods Available:**

- `apiClient.get<T>(url, config?)`
- `apiClient.post<T>(url, data, config?)`
- `apiClient.put<T>(url, data, config?)`
- `apiClient.patch<T>(url, data, config?)`
- `apiClient.delete<T>(url, config?)`

---

### Step 3: Create Custom React Hook

Create a hook in `src/hooks/` for state management.

**Example: Contact Hook**

```typescript
// src/hooks/use-contact.ts

"use client";

import { useState } from "react";
import { contactService } from "@/services/contact";
import { ContactRequest } from "@/types/api";

export function useContact() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const submitContact = async (data: ContactRequest) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await contactService.submit(data);
      setSuccess(true);
      return response;
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to send message. Please try again.";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setError(null);
    setSuccess(false);
    setLoading(false);
  };

  return {
    submitContact,
    loading,
    error,
    success,
    reset,
  };
}
```

---

### Step 4: Use Hook in Component/Page

Use the hook in your React component.

**Example: Contact Page**

```typescript
// src/app/(public)/contact/page.tsx

"use client";

import { useState } from "react";
import { useContact } from "@/hooks/use-contact";
import { ContactRequest } from "@/types/api";

export default function ContactPage() {
  const { submitContact, loading, error, success, reset } = useContact();
  const [formData, setFormData] = useState<ContactRequest>({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await submitContact(formData);
      // Reset form on success
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (err) {
      console.error("Submission error:", err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Show success/error states */}
      {success && <div>Message sent!</div>}
      {error && <div>{error}</div>}

      {/* Form fields with controlled inputs */}
      <input
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        disabled={loading}
      />

      <button type="submit" disabled={loading}>
        {loading ? "Sending..." : "Send"}
      </button>
    </form>
  );
}
```

---

## Common Patterns

### Pattern 1: GET Request with Filters

```typescript
// Service
export const novelService = {
  async getAll(filters?: NovelFilters): Promise<PaginatedResponse<Novel>> {
    const response = await apiClient.get<PaginatedResponse<Novel>>("/novels", {
      params: filters,
    });
    return response.data || response;
  },
};

// Hook
export function useNovels(filters?: NovelFilters) {
  const [data, setData] = useState<Novel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    novelService.getAll(filters).then((res) => {
      setData(res.data);
      setLoading(false);
    });
  }, [filters]);

  return { data, loading };
}
```

### Pattern 2: Authenticated Requests

The `apiClient` automatically includes the auth token from
`localStorage`/`sessionStorage`:

```typescript
// No special handling needed - just use the service
export const profileService = {
  async update(data: UpdateProfileRequest): Promise<User> {
    // Token automatically added by apiClient
    const response = await apiClient.put<User>("/user/profile", data);
    return response.data || response;
  },
};
```

### Pattern 3: File Upload

```typescript
export const uploadService = {
  async uploadImage(file: File): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append("image", file);

    const response = await apiClient.post<{ url: string }>(
      "/upload/image",
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );
    return response.data || response;
  },
};
```

### Pattern 4: Pagination

```typescript
export function usePaginatedNovels(page: number = 1) {
  const [data, setData] = useState<PaginatedResponse<Novel> | null>(null);

  useEffect(() => {
    novelService.getAll({ page }).then(setData);
  }, [page]);

  return {
    novels: data?.data || [],
    pagination: {
      currentPage: data?.current_page || 1,
      lastPage: data?.last_page || 1,
      total: data?.total || 0,
    },
  };
}
```

---

## Environment Configuration

All API requests use the base URL from environment variables:

```bash
# .env.local
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api
```

Validation happens in `src/lib/env.ts`:

```typescript
export const env = {
  API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL!,
};
```

---

## Error Handling

The `apiClient` provides automatic error handling:

```typescript
// Errors are thrown with detailed messages
try {
  await contactService.submit(data);
} catch (error) {
  // Error contains:
  // - error.message: Human-readable error
  // - error.status: HTTP status code
  console.error(error);
}
```

---

## Testing Your Integration

1. **Check types compile**: `npm run build`
2. **Test the endpoint**: Use the component in the browser
3. **Verify auth**: Check network tab for `Authorization: Bearer {token}` header
4. **Handle errors**: Test with invalid data or network issues

---

## Real-World Example: Contact Form

See the complete implementation:

- **Types**: `src/types/contact.ts`
- **Service**: `src/services/contact.ts`
- **Hook**: `src/hooks/use-contact.ts`
- **Page**: `src/app/(public)/contact/page.tsx`

This follows the exact pattern for all API integrations in the project.

---

## Quick Reference

| Layer         | Location                        | Purpose                |
| ------------- | ------------------------------- | ---------------------- |
| **Types**     | `src/types/`                    | TypeScript interfaces  |
| **Service**   | `src/services/`                 | API endpoint methods   |
| **Hook**      | `src/hooks/`                    | React state management |
| **Component** | `src/app/` or `src/components/` | UI implementation      |

**Always follow this order**: Types → Service → Hook → Component
