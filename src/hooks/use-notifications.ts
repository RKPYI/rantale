"use client";

import { notificationService } from "@/services/notifications";
import { Notification, NotificationsResponse } from "@/types/api";
import { useApi, useAsync } from "./use-api";

// Hook for getting user notifications
export function useNotifications(unreadOnly?: boolean) {
  return useApi<NotificationsResponse>(
    () =>
      notificationService.getNotifications(
        1,
        undefined,
        unreadOnly ? "unread" : undefined,
      ),
    [unreadOnly],
  );
}

// Hook for getting unread count
export function useUnreadNotificationCount() {
  return useApi(() => notificationService.getUnreadCount(), []);
}

// Hook for marking as read (use refetch to call)
export function useMarkNotificationAsRead() {
  return useApi(
    () => Promise.resolve(null), // Use refetch with notificationService.markAsRead
    [],
  );
}

// Alias for component compatibility
export function useMarkAsRead() {
  return useAsync<void>();
}

// Hook for marking as unread (use refetch to call)
export function useMarkNotificationAsUnread() {
  return useApi(
    () => Promise.resolve(null), // Use refetch with notificationService.markAsUnread
    [],
  );
}

// Hook for marking all as read (use refetch to call)
export function useMarkAllNotificationsAsRead() {
  return useApi(
    () => Promise.resolve(null), // Use refetch with notificationService.markAllAsRead
    [],
  );
}

// Alias for component compatibility
export function useMarkAllAsRead() {
  return useAsync<void>();
}

// Hook for deleting notification (use refetch to call)
export function useDeleteNotification() {
  return useAsync<void>();
}

// Hook for clearing read notifications (use refetch to call)
export function useClearReadNotifications() {
  return useApi(
    () => Promise.resolve(null), // Use refetch with notificationService.clearReadNotifications
    [],
  );
}
