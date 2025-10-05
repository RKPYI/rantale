import { PaginatedResponse } from "./common";

// Notification System Types
export interface Notification {
  id: number;
  user_id: number;
  type:
    | "new_chapter"
    | "comment_reply"
    | "author_status"
    | "novel_update"
    | "system";
  title: string;
  message: string;
  data: Record<string, any>;
  read_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface NotificationsResponse {
  notifications: PaginatedResponse<Notification>;
  stats: {
    total: number;
    unread: number;
    read: number;
  };
}