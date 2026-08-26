"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  areAllSelected,
  areSomeSelected,
  selectIdRange,
  toggleAllInSet,
  toggleInSet,
} from "@/lib/state-utils";

type SelectEvent = Pick<
  MouseEvent | KeyboardEvent,
  "shiftKey" | "metaKey" | "ctrlKey"
>;

interface UseOrderedListSelectionOptions<TId> {
  orderedIds: TId[];
  resetKey?: string | number | null;
}

export function useOrderedListSelection<TId>({
  orderedIds,
  resetKey,
}: UseOrderedListSelectionOptions<TId>) {
  const [selectedIds, setSelectedIds] = useState<Set<TId>>(new Set());
  const anchorIndexRef = useRef<number | null>(null);

  useEffect(() => {
    setSelectedIds(new Set());
    anchorIndexRef.current = null;
  }, [resetKey]);

  const handleSelect = useCallback(
    (id: TId, event?: SelectEvent) => {
      const index = orderedIds.indexOf(id);
      if (index === -1) return;

      const isShift = event?.shiftKey ?? false;
      const isMod = (event?.metaKey ?? false) || (event?.ctrlKey ?? false);

      setSelectedIds((prev) => {
        if (isShift && anchorIndexRef.current !== null) {
          const range = selectIdRange(
            orderedIds,
            anchorIndexRef.current,
            index,
          );

          if (isMod) {
            return new Set([...prev, ...range]);
          }

          return range;
        }

        if (isMod) {
          return toggleInSet(prev, id);
        }

        return toggleInSet(prev, id);
      });

      if (!isShift) {
        anchorIndexRef.current = index;
      }
    },
    [orderedIds],
  );

  const toggleAll = useCallback(() => {
    setSelectedIds((prev) => {
      const placeholderItems = orderedIds.map((id) => ({ id }));
      return toggleAllInSet(prev, placeholderItems, (item) => item.id);
    });
    anchorIndexRef.current = orderedIds.length > 0 ? 0 : null;
  }, [orderedIds]);

  const selectAll = useCallback(() => {
    setSelectedIds(new Set(orderedIds));
    anchorIndexRef.current = orderedIds.length > 0 ? 0 : null;
  }, [orderedIds]);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
    anchorIndexRef.current = null;
  }, []);

  const handleListKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "a") {
        event.preventDefault();
        selectAll();
        return;
      }

      if (event.key === "Escape" && selectedIds.size > 0) {
        event.preventDefault();
        clearSelection();
      }
    },
    [clearSelection, selectAll, selectedIds.size],
  );

  const allSelected =
    orderedIds.length > 0 && areAllSelected(selectedIds, orderedIds.length);
  const someSelected = areSomeSelected(selectedIds, orderedIds.length);

  return {
    selectedIds,
    setSelectedIds,
    handleSelect,
    toggleAll,
    selectAll,
    clearSelection,
    handleListKeyDown,
    allSelected,
    someSelected,
  };
}
