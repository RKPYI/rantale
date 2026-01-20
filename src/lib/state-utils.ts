/**
 * State Management Utilities
 * Reusable state management patterns to reduce duplication
 */

/**
 * Toggle item in a Set
 * Common pattern for selection management
 */
export function toggleInSet<T>(set: Set<T>, item: T): Set<T> {
  const newSet = new Set(set);
  if (newSet.has(item)) {
    newSet.delete(item);
  } else {
    newSet.add(item);
  }
  return newSet;
}

/**
 * Toggle all items in a Set
 * Selects all if none selected, deselects all if all selected
 */
export function toggleAllInSet<TItem, TId>(
  currentSet: Set<TId>,
  allItems: TItem[],
  getId: (item: TItem) => TId,
): Set<TId> {
  if (currentSet.size === allItems.length) {
    return new Set(); // Deselect all
  }
  return new Set(allItems.map(getId)); // Select all
}

/**
 * Clear a Set and return new empty Set
 */
export function clearSet<T>(): Set<T> {
  return new Set();
}

/**
 * Check if all items are selected
 */
export function areAllSelected<T>(set: Set<T>, totalCount: number): boolean {
  return set.size === totalCount;
}

/**
 * Check if some items are selected (but not all)
 */
export function areSomeSelected<T>(set: Set<T>, totalCount: number): boolean {
  return set.size > 0 && set.size < totalCount;
}
