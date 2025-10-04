"use client";

import { cn } from "@/lib/utils";

interface SpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "default" | "dots" | "pulse" | "soft" | "minimal";
  className?: string;
}

export function Spinner({ size = "md", variant = "default", className }: SpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6", 
    lg: "w-8 h-8",
    xl: "w-12 h-12"
  };

  const dotSizeClasses = {
    sm: "w-1 h-1",
    md: "w-1.5 h-1.5",
    lg: "w-2 h-2", 
    xl: "w-3 h-3"
  };

  if (variant === "dots") {
    return (
      <div className={cn("flex items-center gap-1", className)}>
        <div 
          className={cn(
            "bg-primary rounded-full animate-pulse",
            dotSizeClasses[size]
          )}
          style={{ animationDelay: "0ms", animationDuration: "1000ms" }}
        />
        <div 
          className={cn(
            "bg-primary/70 rounded-full animate-pulse",
            dotSizeClasses[size]
          )}
          style={{ animationDelay: "150ms", animationDuration: "1000ms" }}
        />
        <div 
          className={cn(
            "bg-primary/40 rounded-full animate-pulse", 
            dotSizeClasses[size]
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
          "rounded-full bg-primary/20 animate-pulse",
          sizeClasses[size],
          className
        )}
        style={{ animationDuration: "1500ms" }}
      >
        <div 
          className={cn(
            "w-full h-full rounded-full bg-primary/40 animate-pulse"
          )}
          style={{ animationDelay: "250ms", animationDuration: "1500ms" }}
        >
          <div 
            className={cn(
              "w-full h-full rounded-full bg-primary/60 animate-pulse"
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
        <div 
          className="absolute inset-0 rounded-full border-2 border-primary/10"
        />
        <div 
          className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary/60 animate-spin"
          style={{ animationDuration: "1200ms" }}
        />
        <div 
          className="absolute inset-1 rounded-full border border-transparent border-t-primary/30 animate-spin"
          style={{ animationDuration: "1800ms", animationDirection: "reverse" }}
        />
      </div>
    );
  }

  if (variant === "minimal") {
    return (
      <div 
        className={cn(
          "border-2 border-muted border-t-primary rounded-full animate-spin",
          sizeClasses[size],
          className
        )}
        style={{ animationDuration: "1000ms" }}
      />
    );
  }

  // Default variant - elegant spinning ring
  return (
    <div className={cn("relative", sizeClasses[size], className)}>
      <div 
        className="absolute inset-0 rounded-full border-2 border-primary/20"
      />
      <div 
        className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary border-r-primary/60 animate-spin"
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
      <span className="text-sm text-muted-foreground animate-pulse">
        Searching...
      </span>
    </div>
  );
}

// Loading throbber for various contexts
export function LoadingThrobber({ 
  message = "Loading...", 
  variant = "soft",
  size = "md" 
}: { 
  message?: string;
  variant?: SpinnerProps["variant"];
  size?: SpinnerProps["size"];
}) {
  return (
    <div className="flex flex-col items-center gap-3 py-8">
      <Spinner variant={variant} size={size} />
      <p className="text-sm text-muted-foreground animate-pulse">
        {message}
      </p>
    </div>
  );
}

// Inline spinner for buttons and small spaces
export function InlineSpinner({ 
  size = "sm", 
  className 
}: { 
  size?: SpinnerProps["size"];
  className?: string;
}) {
  return <Spinner variant="minimal" size={size} className={className} />;
}