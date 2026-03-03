"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Clock,
  CheckCircle,
  AlertCircle,
  FileText,
  TrendingUp,
  Calendar,
} from "lucide-react";
import { useEditorStats } from "@/hooks/use-editor";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  subtitle?: string;
  variant?: "default" | "primary" | "success" | "warning" | "danger";
}

function StatCard({
  title,
  value,
  icon: Icon,
  subtitle,
  variant = "default",
}: StatCardProps) {
  const variantStyles = {
    default: "bg-background",
    primary: "bg-primary/5 border-primary/20",
    success: "bg-green-500/5 border-green-500/20",
    warning: "bg-yellow-500/5 border-yellow-500/20",
    danger: "bg-red-500/5 border-red-500/20",
  };

  const iconStyles = {
    default: "bg-muted text-muted-foreground",
    primary: "bg-primary/10 text-primary",
    success: "bg-green-500/10 text-green-600 dark:text-green-400",
    warning: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
    danger: "bg-red-500/10 text-red-600 dark:text-red-400",
  };

  return (
    <Card
      className={cn("transition-all hover:shadow-md", variantStyles[variant])}
    >
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <p className="text-muted-foreground truncate text-xs font-medium sm:text-sm">
              {title}
            </p>
            <p className="truncate text-xl font-bold sm:text-2xl">{value}</p>
            {subtitle && (
              <p className="text-muted-foreground truncate text-xs">
                {subtitle}
              </p>
            )}
          </div>
          <div
            className={cn(
              "flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg sm:h-12 sm:w-12",
              iconStyles[variant],
            )}
          >
            <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function EditorOverviewTab() {
  const { data: stats, loading } = useEditorStats();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4 sm:p-6">
                <Skeleton className="mb-2 h-4 w-24" />
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard
          title="Pending Review"
          value={stats.pending_review}
          icon={Clock}
          variant={stats.pending_review > 0 ? "warning" : "default"}
          subtitle={stats.pending_review > 0 ? "Awaiting action" : "All clear"}
        />
        <StatCard
          title="Reviews Today"
          value={stats.my_reviews_today}
          icon={FileText}
          variant="primary"
        />
        <StatCard
          title="This Week"
          value={stats.my_reviews_this_week}
          icon={Calendar}
        />
        <StatCard
          title="Total Reviews"
          value={stats.my_total_reviews}
          icon={TrendingUp}
        />
        <StatCard
          title="Approved Today"
          value={stats.approvals_today}
          icon={CheckCircle}
          variant="success"
        />
        <StatCard
          title="Revisions Today"
          value={stats.revisions_requested_today}
          icon={AlertCircle}
          variant={stats.revisions_requested_today > 0 ? "danger" : "default"}
        />
      </div>

      {/* Quick Tips Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Editor Guidelines</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="text-muted-foreground space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <Clock className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600" />
              <span>
                <strong>Claim</strong> a chapter before reviewing it. Claims
                last 24 hours and prevent other editors from reviewing the same
                chapter simultaneously.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
              <span>
                <strong>Approve</strong> chapters that meet quality standards
                and are ready for publication.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-600" />
              <span>
                <strong>Request revision</strong> for chapters that need
                improvements. Always provide specific, constructive feedback.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <Clock className="mt-0.5 h-4 w-4 flex-shrink-0 text-yellow-600" />
              <span>
                Review chapters in order of submission (oldest first) to ensure
                fair treatment of all authors. Claims expire after 24 hours if
                no action is taken.
              </span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
