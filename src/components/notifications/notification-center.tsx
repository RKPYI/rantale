"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Bell,
  BellRing,
  Check,
  CheckCheck,
  Trash2,
  MoreHorizontal,
  AlertCircle,
  BookOpen,
  MessageCircle,
  Star,
  Users,
  Settings,
} from "lucide-react";
import {
  useNotifications,
  useMarkAsRead,
  useMarkAllAsRead,
  useDeleteNotification,
} from "@/hooks/use-notifications";
import { notificationService } from "@/services/notifications";
import { formatDate } from "@/lib/novel-utils";
import { cn } from "@/lib/utils";
import { Notification } from "@/types/api";

interface NotificationCenterProps {
  className?: string;
}

export function NotificationCenter({ className }: NotificationCenterProps) {
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const {
    data: notifications,
    loading,
    error,
    refetch,
  } = useNotifications(filter === "unread");
  const { loading: markingAsRead, execute: markAsRead } = useMarkAsRead();
  const { loading: markingAllAsRead, execute: markAllAsRead } =
    useMarkAllAsRead();
  const { loading: deleting, execute: deleteNotification } =
    useDeleteNotification();

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "new_chapter":
      case "novel_updated":
        return <BookOpen className="h-4 w-4" />;
      case "new_comment":
      case "comment_reply":
        return <MessageCircle className="h-4 w-4" />;
      case "new_rating":
      case "rating_updated":
        return <Star className="h-4 w-4" />;
      case "new_follower":
        return <Users className="h-4 w-4" />;
      case "author_application_approved":
      case "author_application_rejected":
        return <Settings className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "new_chapter":
      case "novel_updated":
        return "text-blue-500";
      case "new_comment":
      case "comment_reply":
        return "text-green-500";
      case "new_rating":
      case "rating_updated":
        return "text-yellow-500";
      case "new_follower":
        return "text-purple-500";
      case "author_application_approved":
        return "text-green-600";
      case "author_application_rejected":
        return "text-red-500";
      default:
        return "text-gray-500";
    }
  };

  const handleMarkAsRead = async (notificationId: number) => {
    try {
      await markAsRead(notificationService.markAsRead, notificationId);
      refetch();
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead(notificationService.markAllAsRead);
      refetch();
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  const handleDelete = async (notificationId: number) => {
    try {
      await deleteNotification(
        notificationService.deleteNotification,
        notificationId,
      );
      refetch();
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const unreadCount = notifications?.stats?.unread || 0;

  if (error) {
    return (
      <Alert variant="destructive" className={className}>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Error loading notifications: {error}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {unreadCount > 0 ? (
              <BellRing className="h-5 w-5" />
            ) : (
              <Bell className="h-5 w-5" />
            )}
            Notifications
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {/* Filter Toggle */}
            <Button
              variant={filter === "unread" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(filter === "all" ? "unread" : "all")}
            >
              {filter === "all" ? "Show Unread" : "Show All"}
            </Button>

            {/* Mark All as Read */}
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllAsRead}
                disabled={markingAllAsRead}
              >
                <CheckCheck className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-96">
          {loading ? (
            <div className="space-y-4 p-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-start space-x-3">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : notifications && notifications.notifications.data.length > 0 ? (
            <div className="divide-y">
              {notifications.notifications.data.map(
                (notification: Notification) => (
                  <div
                    key={notification.id}
                    className={cn(
                      "hover:bg-muted/50 flex items-start justify-between p-4 transition-colors",
                      !notification.read_at && "bg-blue-50 dark:bg-blue-950/20",
                    )}
                  >
                    <div className="flex flex-1 items-start space-x-3">
                      <div
                        className={cn(
                          "bg-muted mt-1 rounded-full p-2",
                          getNotificationColor(notification.type),
                        )}
                      >
                        {getNotificationIcon(notification.type)}
                      </div>

                      <div className="flex-1 space-y-1">
                        <p
                          className={cn(
                            "text-sm",
                            !notification.read_at && "font-medium",
                          )}
                        >
                          {notification.message}
                        </p>
                        <div className="text-muted-foreground flex items-center gap-2 text-xs">
                          <span>{formatDate(notification.created_at)}</span>
                          {!notification.read_at && (
                            <Badge variant="secondary" className="text-xs">
                              New
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="ml-2 flex items-center space-x-1">
                      {!notification.read_at && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleMarkAsRead(notification.id)}
                          disabled={markingAsRead}
                        >
                          <Check className="h-3 w-3" />
                        </Button>
                      )}

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" disabled={deleting}>
                            <MoreHorizontal className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {!notification.read_at && (
                            <DropdownMenuItem
                              onClick={() => handleMarkAsRead(notification.id)}
                            >
                              <Check className="mr-2 h-4 w-4" />
                              Mark as Read
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() => handleDelete(notification.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ),
              )}
            </div>
          ) : (
            <div className="px-4 py-12 text-center">
              <Bell className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
              <h3 className="text-lg font-medium">
                {filter === "unread"
                  ? "No unread notifications"
                  : "No notifications"}
              </h3>
              <p className="text-muted-foreground">
                {filter === "unread"
                  ? "All caught up! Check back later for new updates."
                  : "You'll see notifications here when you have updates."}
              </p>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
