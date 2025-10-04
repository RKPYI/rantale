"use client";

import { cn } from "@/lib/utils";

interface SpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "default" | "dots" | "pulse" | "soft" | "minimal";
  className?: string;
}

export function Spinner({
  size = "md",
  variant = "default",
  className,
}: SpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
    xl: "w-12 h-12",
  };

  const dotSizeClasses = {
    sm: "w-1 h-1",
    md: "w-1.5 h-1.5",
    lg: "w-2 h-2",
    xl: "w-3 h-3",
  };

  if (variant === "dots") {
    return (
      <div className={cn("flex items-center gap-1", className)}>
        <div
          className={cn(
            "bg-primary animate-pulse rounded-full",
            dotSizeClasses[size],
          )}
          style={{ animationDelay: "0ms", animationDuration: "1000ms" }}
        />
        <div
          className={cn(
            "bg-primary/70 animate-pulse rounded-full",
            dotSizeClasses[size],
          )}
          style={{ animationDelay: "150ms", animationDuration: "1000ms" }}
        />
        <div
          className={cn(
            "bg-primary/40 animate-pulse rounded-full",
            dotSizeClasses[size],
          )}
          style={{ animationDelay: "300ms", animationDuration: "1000ms" }}
        />
      </div>
    );
  }

  if (variant === "pulse") {
    return (
      <div
        className={cn(
          "bg-primary/20 animate-pulse rounded-full",
          sizeClasses[size],
          className,
        )}
        style={{ animationDuration: "1500ms" }}
      >
        <div
          className={cn(
            "bg-primary/40 h-full w-full animate-pulse rounded-full",
          )}
          style={{ animationDelay: "250ms", animationDuration: "1500ms" }}
        >
          <div
            className={cn(
              "bg-primary/60 h-full w-full animate-pulse rounded-full",
            )}
            style={{ animationDelay: "500ms", animationDuration: "1500ms" }}
          />
        </div>
      </div>
    );
  }

  if (variant === "soft") {
    return (
      <div className={cn("relative", sizeClasses[size], className)}>
        <div className="border-primary/10 absolute inset-0 rounded-full border-2" />
        <div
          className="border-t-primary/60 absolute inset-0 animate-spin rounded-full border-2 border-transparent"
          style={{ animationDuration: "1200ms" }}
        />
        <div
          className="border-t-primary/30 absolute inset-1 animate-spin rounded-full border border-transparent"
          style={{ animationDuration: "1800ms", animationDirection: "reverse" }}
        />
      </div>
    );
  }

  if (variant === "minimal") {
    return (
      <div
        className={cn(
          "border-muted border-t-primary animate-spin rounded-full border-2",
          sizeClasses[size],
          className,
        )}
        style={{ animationDuration: "1000ms" }}
      />
    );
  }

  // Default variant - elegant spinning ring
  return (
    <div className={cn("relative", sizeClasses[size], className)}>
      <div className="border-primary/20 absolute inset-0 rounded-full border-2" />
      <div
        className="border-t-primary border-r-primary/60 absolute inset-0 animate-spin rounded-full border-2 border-transparent"
        style={{ animationDuration: "1200ms" }}
      />
    </div>
  );
}

// Specialized search spinner
export function SearchSpinner({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Spinner variant="soft" size="sm" />
      <span className="text-muted-foreground animate-pulse text-sm">
        Searching...
      </span>
    </div>
  );
}

// Loading throbber for various contexts
export function LoadingThrobber({
  message = "Loading...",
  variant = "soft",
  size = "md",
}: {
  message?: string;
  variant?: SpinnerProps["variant"];
  size?: SpinnerProps["size"];
}) {
  return (
    <div className="flex flex-col items-center gap-3 py-8">
      <Spinner variant={variant} size={size} />
      <p className="text-muted-foreground animate-pulse text-sm">{message}</p>
    </div>
  );
}

// Inline spinner for buttons and small spaces
export function InlineSpinner({
  size = "sm",
  className,
}: {
  size?: SpinnerProps["size"];
  className?: string;
}) {
  return <Spinner variant="minimal" size={size} className={className} />;
}
