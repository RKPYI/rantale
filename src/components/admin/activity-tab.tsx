import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Clock,
  UserPlus,
  Plus,
  MessageCircle,
  FileText,
  Activity,
} from "lucide-react";
import { useAdminRecentActivity } from "@/hooks/use-admin";
import { AdminActivity } from "@/types/api";

export function ActivityTab() {
  const { data: activities, loading, error } = useAdminRecentActivity(20);

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <Skeleton className="h-16 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-red-600">Failed to load activities: {error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Recent Activity</h3>
        <Badge variant="secondary">{activities?.length || 0} activities</Badge>
      </div>

      {!activities || activities.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground text-center">
              No recent activities
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {activities.map((activity: AdminActivity, index: number) => {
            const Icon = getActivityIcon(activity.activity_type);
            return (
              <Card key={`${activity.id}-${activity.activity_type}-${index}`}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="bg-primary/10 rounded-full p-2">
                      <Icon className="text-primary h-4 w-4" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm">
                        {getActivityDescription(activity)}
                      </p>
                      <div className="text-muted-foreground flex items-center gap-2 text-xs">
                        <Clock className="h-3 w-3" />
                        <span>{formatTimeAgo(activity.created_at)}</span>
                        {activity.status && (
                          <>
                            <span>•</span>
                            <Badge
                              variant={
                                activity.status === "pending"
                                  ? "secondary"
                                  : "default"
                              }
                              className="text-xs"
                            >
                              {activity.status}
                            </Badge>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Helper functions
function getActivityIcon(activityType: string) {
  switch (activityType) {
    case "user_registered":
      return UserPlus;
    case "novel_created":
      return Plus;
    case "comment_posted":
      return MessageCircle;
    case "application_submitted":
      return FileText;
    default:
      return Activity;
  }
}

function getActivityDescription(activity: AdminActivity) {
  switch (activity.activity_type) {
    case "user_registered":
      return `${activity.name} registered as a new user`;
    case "novel_created":
      return `"${activity.title}" was created by ${activity.author}`;
    case "comment_posted":
      return `${activity.user?.name} commented on "${activity.novel?.title}": ${activity.content?.substring(0, 100)}${(activity.content?.length ?? 0) > 100 ? "..." : ""}`;
    case "application_submitted":
      return `${activity.user?.name} submitted an author application`;
    default:
      return "Unknown activity";
  }
}

function formatTimeAgo(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (minutes < 60) {
    return `${minutes}m ago`;
  } else if (hours < 24) {
    return `${hours}h ago`;
  } else {
    return `${days}d ago`;
  }
}
