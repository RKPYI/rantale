# Code Refactoring Report: Redundancy Analysis

## 📊 Summary

This report identifies redundant/duplicate code patterns in the RDKNovel
frontend codebase and provides refactoring solutions.

**Date:** January 14, 2026  
**Total Redundancies Found:** 3 major patterns  
**Estimated LOC Reduction:** ~150-200 lines  
**Priority:** HIGH

---

## 🔴 Priority 1: Error Handling Pattern (CRITICAL)

### Affected Files (15+ occurrences)

- `/src/components/author/author-dashboard.tsx` (3 instances)
- `/src/components/author/chapters-tab.tsx` (2 instances) ✅ **REFACTORED**
- `/src/components/author/novel-dialog.tsx` (1 instance)
- `/src/components/author/chapter-dialog.tsx` (1 instance)
- `/src/components/admin/contacts-tab.tsx`
- `/src/components/admin/author-applications-tab.tsx`
- And more across the codebase...

### Duplicate Code Pattern

```typescript
// ❌ BEFORE: Repeated 15+ times
try {
  await someApiCall();
  toast.success("Success!");
} catch (error) {
  console.error("Failed to do something:", error);

  let errorMessage = "Failed to do something. Please try again.";
  if (error && typeof error === "object" && "error" in error) {
    const apiError = error as { error: string };
    errorMessage = apiError.error || errorMessage;
  } else if (error instanceof Error) {
    errorMessage = error.message;
  }

  toast.error(errorMessage);
}
```

### Solution Created

**New Utility:** `/src/lib/error-utils.ts`

Provides:

- `getErrorMessage(error, fallback)` - Extract message from any error type
- `handleErrorWithToast(error, fallback)` - Extract + show toast
- `logAndToastError(error, context, fallback)` - Log + show toast (most common)
- `getValidationErrors(error)` - Extract field validation errors
- `handleErrorWithState(error, setError, fallback)` - For state management

### Usage Examples

```typescript
// ✅ AFTER: Single line
import { logAndToastError } from "@/lib/utils";

try {
  await someApiCall();
  toast.success("Success!");
} catch (error) {
  logAndToastError(
    error,
    "Failed to do something",
    "Failed to do something. Please try again.",
  );
}
```

```typescript
// For components with error state
import { handleErrorWithState } from "@/lib/utils";

try {
  await someApiCall();
} catch (error) {
  handleErrorWithState(error, setError, "Failed to save");
}
```

```typescript
// Just get the message without toast
import { getErrorMessage } from "@/lib/utils";

const errorMsg = getErrorMessage(error, "Something went wrong");
```

---

## 🟡 Priority 2: Set Toggle Pattern (MEDIUM)

### Affected Files (8+ occurrences)

- `/src/components/author/author-dashboard.tsx` (2 instances)
- `/src/components/author/chapters-tab.tsx` (2 instances) ✅ **REFACTORED**
- `/src/components/admin/*` (multiple instances)

### Duplicate Code Pattern

```typescript
// ❌ BEFORE: Repeated in every component with selection
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

### Solution Created

**New Utility:** `/src/lib/state-utils.ts`

Provides:

- `toggleInSet(set, item)` - Toggle single item
- `toggleAllInSet(set, items, getId)` - Toggle all items
- `clearSet()` - Clear a set
- `areAllSelected(set, count)` - Check if all selected
- `areSomeSelected(set, count)` - Check if some selected

### Usage Examples

```typescript
// ✅ AFTER: Simplified
import { toggleInSet, toggleAllInSet } from "@/lib/utils";

const toggleNovelSelection = (novelId: number) => {
  setSelectedNovelIds((prev) => toggleInSet(prev, novelId));
};

const toggleAllNovels = () => {
  if (!novels) return;
  setSelectedNovelIds((prev) => toggleAllInSet(prev, novels, (n) => n.id));
};
```

---

## 🟢 Priority 3: Loading/Error/Success State Pattern (LOW)

### Pattern Identified

Multiple custom hooks have similar state management:

```typescript
// Repeated pattern in use-contact.ts, use-image-upload.ts, etc.
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);
const [success, setSuccess] = useState<string | null>(null);
```

### Recommendation

This is already well-abstracted in `use-api.ts` and `use-async.ts`. Components
should prefer using these hooks over custom implementations.

**Good Pattern (already in use):**

```typescript
// ✅ Use the existing useAsync hook
const { loading, error, execute } = useAsync();
```

---

## 📋 Refactoring Checklist

### Completed ✅

- [x] Created `/src/lib/error-utils.ts`
- [x] Created `/src/lib/state-utils.ts`
- [x] Exported utilities from `/src/lib/utils.ts`
- [x] Refactored `/src/components/author/chapters-tab.tsx` as example

### Recommended Next Steps

- [ ] Refactor `/src/components/author/author-dashboard.tsx`
- [ ] Refactor `/src/components/author/novel-dialog.tsx`
- [ ] Refactor `/src/components/author/chapter-dialog.tsx`
- [ ] Refactor admin components
- [ ] Search codebase for remaining error handling patterns
- [ ] Update TypeScript types to export ApiError interface

---

## 🎯 Impact Analysis

### Before Refactoring

- **Error handling code:** ~10-15 lines per occurrence × 15 occurrences =
  **150-225 lines**
- **Toggle functions:** ~8-12 lines per occurrence × 8 occurrences = **64-96
  lines**
- **Total redundant code:** ~**214-321 lines**

### After Refactoring

- **Error handling:** 1 line per occurrence
- **Toggle functions:** 1 line per occurrence
- **Utility libraries:** ~150 lines (reusable)
- **Net reduction:** ~**100-200 lines** of duplicate code

### Additional Benefits

- ✅ Consistent error handling across entire app
- ✅ Type-safe utilities with full TypeScript support
- ✅ Easier to maintain and test
- ✅ Improved code readability
- ✅ Single source of truth for common patterns

---

## 🔧 Migration Guide

### Step 1: Import the utilities

```typescript
import { logAndToastError, toggleInSet } from "@/lib/utils";
```

### Step 2: Replace error handling

```typescript
// Before
catch (error) {
  console.error("Context:", error);
  let errorMessage = "Fallback message";
  if (error && typeof error === "object" && "error" in error) {
    const apiError = error as { error: string };
    errorMessage = apiError.error || errorMessage;
  } else if (error instanceof Error) {
    errorMessage = error.message;
  }
  toast.error(errorMessage);
}

// After
catch (error) {
  logAndToastError(error, "Context", "Fallback message");
}
```

### Step 3: Replace toggle functions

```typescript
// Before
const toggle = (id: number) => {
  setSelected((prev) => {
    const newSet = new Set(prev);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    return newSet;
  });
};

// After
const toggle = (id: number) => {
  setSelected((prev) => toggleInSet(prev, id));
};
```

---

## 📚 API Reference

### Error Utilities (`/src/lib/error-utils.ts`)

#### `getErrorMessage(error, fallback?)`

Extracts error message from any error type.

**Parameters:**

- `error: unknown` - The error object
- `fallback?: string` - Fallback message (default: "An unexpected error
  occurred")

**Returns:** `string` - The error message

---

#### `handleErrorWithToast(error, fallback?)`

Extracts error message and displays toast.

**Parameters:**

- `error: unknown` - The error object
- `fallback?: string` - Fallback message

**Returns:** `string` - The error message

---

#### `logAndToastError(error, context, fallback?)`

Logs error to console and displays toast.

**Parameters:**

- `error: unknown` - The error object
- `context: string` - Context for console.error
- `fallback?: string` - Fallback message

**Returns:** `string` - The error message

**Example:**

```typescript
catch (error) {
  logAndToastError(error, "Failed to save novel", "Could not save. Try again.");
}
```

---

#### `getValidationErrors(error)`

Extracts field-level validation errors from ApiError.

**Returns:** `Record<string, string[]> | null`

---

#### `handleErrorWithState(error, setError, fallback?)`

Sets error state and shows toast (common in forms).

**Parameters:**

- `error: unknown` - The error object
- `setError: (msg: string) => void` - State setter
- `fallback?: string` - Fallback message

---

### State Utilities (`/src/lib/state-utils.ts`)

#### `toggleInSet<T>(set, item)`

Toggles an item in a Set.

**Returns:** New Set with item toggled

---

#### `toggleAllInSet<TItem, TId>(set, items, getId)`

Toggles all items (select all / deselect all).

**Parameters:**

- `set: Set<TId>` - Current selection
- `items: TItem[]` - All available items
- `getId: (item: TItem) => TId` - Function to extract ID

**Returns:** New Set with all items or empty Set

**Example:**

```typescript
toggleAllInSet(selectedIds, novels, (n) => n.id);
```

---

#### `areAllSelected<T>(set, totalCount)`

Checks if all items are selected.

---

#### `areSomeSelected<T>(set, totalCount)`

Checks if some (but not all) items are selected.

---

## 🚀 Performance Considerations

These utilities are **zero-overhead abstractions**:

- No external dependencies (except existing `sonner`)
- Pure functions with minimal logic
- TypeScript optimizations via generics
- Tree-shakeable exports

---

## 🧪 Testing Recommendations

Create tests for the new utilities:

```typescript
// __tests__/lib/error-utils.test.ts
describe("getErrorMessage", () => {
  it("should extract message from ApiError", () => {
    const error = { error: "Custom error" };
    expect(getErrorMessage(error)).toBe("Custom error");
  });

  it("should use fallback for unknown errors", () => {
    expect(getErrorMessage(null, "Fallback")).toBe("Fallback");
  });
});
```

---

## 📖 Related Files

- **Utility Libraries:**
  - `/src/lib/error-utils.ts` - Error handling utilities ✨ NEW
  - `/src/lib/state-utils.ts` - State management utilities ✨ NEW
  - `/src/lib/utils.ts` - Main exports (updated)
- **Example Refactoring:**
  - `/src/components/author/chapters-tab.tsx` - Fully refactored ✅

---

## 🤝 Contributing

When you encounter similar patterns:

1. Check if a utility exists in `/src/lib/`
2. If not, consider adding it following this pattern
3. Keep utilities focused and single-purpose
4. Add TypeScript types and JSDoc comments
5. Export from `/src/lib/utils.ts` for convenience

---

**Report prepared by:** GitHub Copilot  
**For questions:** Review the implementation in the source files
