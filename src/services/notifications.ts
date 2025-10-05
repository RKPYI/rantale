import { apiClient } from "@/lib/api-client";
import {
  Notification,
  NotificationsResponse,
  MessageResponse,
} from "@/types/api";

export const notificationService = {
  // Get user notifications
  async getNotifications(
    page?: number,
    type?: string,
    read?: string,
  ): Promise<NotificationsResponse> {
    const params: Record<string, string | number> = {};
    if (page) params.page = page;
    if (type && type !== "all") params.type = type;
    if (read && read !== "all") params.read = read;

    const response = await apiClient.get<NotificationsResponse>(
      "/notifications",
      params,
    );
    return response.data;
  },

  // Get unread count
  async getUnreadCount(): Promise<number> {
    const response = await apiClient.get<{ unread_count: number }>(
      "/notifications/unread-count",
    );
    return response.data.unread_count;
  },

  // Mark notification as read
  async markAsRead(notificationId: number): Promise<Notification> {
    const response = await apiClient.put<{
      message: string;
      notification: Notification;
    }>(`/notifications/${notificationId}/read`);
    return response.data.notification;
  },

  // Mark notification as unread
  async markAsUnread(notificationId: number): Promise<Notification> {
    const response = await apiClient.put<{
      message: string;
      notification: Notification;
    }>(`/notifications/${notificationId}/unread`);
    return response.data.notification;
  },

  // Mark all notifications as read
  async markAllAsRead(): Promise<number> {
    const response = await apiClient.put<{
      message: string;
      updated_count: number;
    }>("/notifications/mark-all-read");
    return response.data.updated_count;
  },

  // Delete notification
  async deleteNotification(notificationId: number): Promise<void> {
    await apiClient.delete(`/notifications/${notificationId}`);
  },

  // Clear all read notifications
  async clearReadNotifications(): Promise<number> {
    const response = await apiClient.delete<{
      message: string;
      deleted_count: number;
    }>("/notifications/clear-read");
    return response.data.deleted_count;
  },
};
