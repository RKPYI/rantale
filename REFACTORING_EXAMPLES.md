# Quick Refactoring Guide

This guide shows how to apply the new utilities to refactor existing code.

## Example 1: Refactoring Error Handling in author-dashboard.tsx

### Before (Lines 88-95)

```typescript
} catch (error) {
  console.error("Failed to delete novel:", error);

  let errorMessage = "Failed to delete novel. Please try again.";
  if (error && typeof error === "object" && "error" in error) {
    const apiError = error as { error: string };
    errorMessage = apiError.error;
  }

  toast.error(errorMessage);
}
```

### After (1 line)

```typescript
} catch (error) {
  logAndToastError(error, "Failed to delete novel", "Failed to delete novel. Please try again.");
}
```

---

## Example 2: Refactoring Toggle Functions in author-dashboard.tsx

### Before (Lines 140-153)

```typescript
const toggleNovelSelection = (novelId: number) => {
  setSelectedNovelIds((prev) => {
    const newSet = new Set(prev);
    if (newSet.has(novelId)) {
      newSet.delete(novelId);
    } else {
      newSet.add(novelId);
    }
    return newSet;
  });
};

const toggleAllNovels = () => {
  if (!novels) return;
  if (selectedNovelIds.size === novels.length) {
    setSelectedNovelIds(new Set());
  } else {
    setSelectedNovelIds(new Set(novels.map((n) => n.id)));
  }
};
```

### After (4 lines)

```typescript
const toggleNovelSelection = (novelId: number) => {
  setSelectedNovelIds((prev) => toggleInSet(prev, novelId));
};

const toggleAllNovels = () => {
  if (!novels) return;
  setSelectedNovelIds((prev) => toggleAllInSet(prev, novels, (n) => n.id));
};
```

---

## Example 3: Refactoring Error Handling in chapter-dialog.tsx

### Before (Lines 138-173)

```typescript
} catch (error: unknown) {
  console.error("Failed to save chapter:", error);

  // Handle ApiError from api-client
  if (error && typeof error === "object" && "error" in error) {
    const apiError = error as {
      success: false;
      error: string;
      details?: Record<string, string[]>;
      statusCode?: number;
      rawData?: unknown;
    };

    let errorMessage =
      apiError.error || "Failed to save chapter. Please try again.";

    // Handle chapter number conflict - check rawData for existing_chapter
    if (
      apiError.rawData &&
      typeof apiError.rawData === "object" &&
      apiError.rawData !== null &&
      "existing_chapter" in apiError.rawData
    ) {
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
}
```

### After (Custom handling with utilities)

```typescript
} catch (error: unknown) {
  console.error("Failed to save chapter:", error);

  // Special handling for chapter conflict
  if (error && typeof error === "object" && "rawData" in error) {
    const apiError = error as ApiError;
    if (apiError.rawData &&
        typeof apiError.rawData === "object" &&
        "existing_chapter" in apiError.rawData) {
      const existing = apiError.rawData.existing_chapter as {
        chapter_number: number;
        title: string;
      };
      const errorMessage = `Chapter ${existing.chapter_number} already exists: "${existing.title}". Please use a different chapter number or edit the existing chapter.`;
      setError(errorMessage);
      toast.error(errorMessage);
      return;
    }
  }

  // Default error handling
  handleErrorWithState(error, setError, "Failed to save chapter. Please try again.");
}
```

**OR** even simpler if you don't need the special conflict handling:

```typescript
} catch (error: unknown) {
  handleErrorWithState(error, setError, "Failed to save chapter. Please try again.");
}
```

---

## Example 4: Refactoring novel-dialog.tsx

### Import Change

```typescript
// Add to imports at top of file
import { handleErrorWithState } from "@/lib/utils";
```

### Before (Lines 115-130)

```typescript
} catch (error: unknown) {
  console.error("Failed to save novel:", error);

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
}
```

### After (1-2 lines)

```typescript
} catch (error: unknown) {
  console.error("Failed to save novel:", error);
  handleErrorWithState(error, setError, "Failed to save novel. Please try again.");
}
```

---

## Automated Refactoring Steps

1. **Add imports:**

   ```typescript
   import {
     logAndToastError,
     handleErrorWithState,
     toggleInSet,
     toggleAllInSet,
   } from "@/lib/utils";
   ```

2. **Replace error handling:**
   - Use `logAndToastError()` when you just need to log and show toast
   - Use `handleErrorWithState()` when you also need to set component error
     state
   - Use `getErrorMessage()` when you need the message but want custom logic

3. **Replace toggle functions:**
   - Use `toggleInSet()` for single item toggles
   - Use `toggleAllInSet()` for select all/deselect all

4. **Test the component:**
   - Verify error messages still appear correctly
   - Verify selection/toggle behavior still works
   - Check TypeScript compilation

---

## Files to Refactor (Prioritized)

### High Priority (Author Components)

- [ ] `/src/components/author/author-dashboard.tsx`
- [ ] `/src/components/author/novel-dialog.tsx`
- [ ] `/src/components/author/chapter-dialog.tsx`

### Medium Priority (Admin Components)

- [ ] `/src/components/admin/contacts-tab.tsx`
- [ ] `/src/components/admin/author-applications-tab.tsx`

### Low Priority (Other Components)

- Search for pattern: `error && typeof error === "object" && "error" in error`
- Replace all occurrences using the utilities

---

## Quick Search Commands

Find all error handling patterns:

```bash
grep -r "typeof error === \"object\"" src/components/
```

Find all toggle functions:

```bash
grep -r "const newSet = new Set(prev)" src/components/
```

---

## Validation

After refactoring, verify:

1. ✅ No TypeScript errors
2. ✅ Error messages still display correctly
3. ✅ Toasts still appear
4. ✅ Selection toggles still work
5. ✅ Code is shorter and more readable
