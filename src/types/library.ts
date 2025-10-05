import { PaginatedResponse } from "./common";
import { Novel } from "./novel";

// Library System Types
export interface LibraryEntry {
  id: number;
  user_id: number;
  novel_id: number;
  status: "want_to_read" | "reading" | "completed" | "dropped" | "on_hold";
  is_favorite: boolean;
  added_at: string;
  status_updated_at: string;
  created_at: string;
  updated_at: string;
  novel: Novel;
}

export interface LibraryResponse {
  message: string;
  library: PaginatedResponse<LibraryEntry>;
  stats: {
    total: number;
    want_to_read: number;
    reading: number;
    completed: number;
    dropped: number;
    on_hold: number;
    favorites: number;
  };
}

export interface LibraryStatusResponse {
  in_library: boolean;
  library_entry?: LibraryEntry;
  novel_id: number;
  novel_title: string;
}

export interface AddToLibraryRequest {
  novel_id: number;
  status: "want_to_read" | "reading" | "completed" | "dropped" | "on_hold";
  is_favorite?: boolean;
}

export interface UpdateLibraryEntryRequest {
  status?: "want_to_read" | "reading" | "completed" | "dropped" | "on_hold";
  is_favorite?: boolean;
}