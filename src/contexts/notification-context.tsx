"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { notificationService } from "@/services/notifications";
import { useAuth } from "@/contexts/auth-context";

interface NotificationContextType {
  unreadCount: number;
  loading: boolean;
  refreshUnreadCount: () => Promise<void>;
  markAsRead: (notificationId: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: number) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined,
);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Fetch unread count
  const refreshUnreadCount = useCallback(async () => {
    if (!isAuthenticated) {
      setUnreadCount(0);
      return;
    }

    try {
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      console.error("Failed to fetch unread notifications count:", error);
    }
  }, [isAuthenticated]);

  // Initial fetch when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      refreshUnreadCount();

      // Optional: Poll for notifications every minute
      const interval = setInterval(refreshUnreadCount, 60000);
      return () => clearInterval(interval);
    } else {
      setUnreadCount(0);
    }
  }, [isAuthenticated, refreshUnreadCount]);

  const markAsRead = useCallback(
    async (notificationId: number) => {
      try {
        setLoading(true);
        await notificationService.markAsRead(notificationId);
        // Decrease count optimistically
        setUnreadCount((prev) => Math.max(0, prev - 1));
        // Verify with server
        await refreshUnreadCount();
      } catch (error) {
        console.error("Failed to mark notification as read:", error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [refreshUnreadCount],
  );

  const markAllAsRead = useCallback(async () => {
    try {
      setLoading(true);
      await notificationService.markAllAsRead();
      setUnreadCount(0);
      await refreshUnreadCount();
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [refreshUnreadCount]);

  const deleteNotification = useCallback(
    async (notificationId: number) => {
      try {
        setLoading(true);
        await notificationService.deleteNotification(notificationId);
        await refreshUnreadCount();
      } catch (error) {
        console.error("Failed to delete notification:", error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [refreshUnreadCount],
  );

  const value = {
    unreadCount,
    loading,
    refreshUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotificationContext() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      "useNotificationContext must be used within a NotificationProvider",
    );
  }
  return context;
}
