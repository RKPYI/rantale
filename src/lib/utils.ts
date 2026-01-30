import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Re-export error utilities
export * from "./error-utils";

// Re-export state utilities
export * from "./state-utils";
