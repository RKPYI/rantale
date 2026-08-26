"use client";

import { KeyboardEvent, MouseEvent, ReactNode } from "react";
import { cn } from "@/lib/utils";

function isInteractiveClick(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false;

  return !!target.closest(
    'a, button, input, textarea, select, [role="menuitem"], [data-no-row-select]',
  );
}

interface SelectableListRowProps {
  selected: boolean;
  onSelect: (event: MouseEvent | KeyboardEvent) => void;
  ariaLabel: string;
  className?: string;
  children: ReactNode;
}

export function SelectableListRow({
  selected,
  onSelect,
  ariaLabel,
  className,
  children,
}: SelectableListRowProps) {
  const handleActivate = (event: MouseEvent | KeyboardEvent) => {
    if ("target" in event && isInteractiveClick(event.target)) {
      return;
    }

    onSelect(event);
  };

  return (
    <div
      role="option"
      aria-selected={selected}
      aria-label={ariaLabel}
      tabIndex={0}
      onClick={handleActivate}
      onKeyDown={(event) => {
        if (event.key === " " || event.key === "Enter") {
          event.preventDefault();
          handleActivate(event);
        }
      }}
      className={cn(
        "rounded-lg border transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        selected
          ? "border-primary bg-primary/5 ring-1 ring-primary/20"
          : "hover:bg-muted/50",
        className,
      )}
    >
      {children}
    </div>
  );
}

interface SelectableListProps {
  label: string;
  selectedCount: number;
  onKeyDown: (event: React.KeyboardEvent) => void;
  className?: string;
  children: ReactNode;
}

export function SelectableList({
  label,
  selectedCount,
  onKeyDown,
  className,
  children,
}: SelectableListProps) {
  return (
    <div
      role="listbox"
      aria-label={label}
      aria-multiselectable="true"
      tabIndex={0}
      onKeyDown={onKeyDown}
      className={cn(
        "rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        className,
      )}
    >
      <span className="sr-only" aria-live="polite">
        {selectedCount} selected
      </span>
      {children}
    </div>
  );
}

export function SelectionHint() {
  return (
    <p className="text-muted-foreground text-xs">
      Click a row to select.{" "}
      <kbd className="bg-muted rounded border px-1 py-0.5 font-mono text-[10px]">
        Shift
      </kbd>
      +click for a range,{" "}
      <kbd className="bg-muted rounded border px-1 py-0.5 font-mono text-[10px]">
        Ctrl
      </kbd>
      /{" "}
      <kbd className="bg-muted rounded border px-1 py-0.5 font-mono text-[10px]">
        ⌘
      </kbd>
      +click to toggle,{" "}
      <kbd className="bg-muted rounded border px-1 py-0.5 font-mono text-[10px]">
        Ctrl
      </kbd>
      +
      <kbd className="bg-muted rounded border px-1 py-0.5 font-mono text-[10px]">
        A
      </kbd>{" "}
      to select all,{" "}
      <kbd className="bg-muted rounded border px-1 py-0.5 font-mono text-[10px]">
        Esc
      </kbd>{" "}
      to clear.
    </p>
  );
}
