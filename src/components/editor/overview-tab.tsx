"use client";

import {
  Users,
  Clock,
  CheckCircle,
  Eye,
  CalendarDays,
  BarChart3,
  AlertTriangle,
  RotateCcw,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  useEditorStats,
  useEditorGroupInfo,
  useEditorClaimedChapters,
} from "@/hooks/use-editor";

export function EditorOverviewTab() {
  const {
    data: stats,
    loading: statsLoading,
    error: statsError,
  } = useEditorStats();
  const {
    data: groupInfo,
    loading: groupLoading,
    error: groupError,
  } = useEditorGroupInfo();
  const { data: claimedChapters, loading: claimedLoading } =
    useEditorClaimedChapters();

  if (statsLoading || groupLoading || claimedLoading) {
    return <OverviewSkeleton />;
  }

  return (
    <div className="space-y-6">
      {statsError && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Failed to load editor stats: {statsError}
          </AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          <StatCard
            icon={<Clock className="h-5 w-5 text-amber-500" />}
            iconBg="bg-amber-500/10"
            label="Pending Review"
            value={stats.pending_review}
          />
          <StatCard
            icon={<Eye className="h-5 w-5 text-blue-500" />}
            iconBg="bg-blue-500/10"
            label="Available to Claim"
            value={stats.available_to_claim}
          />
          <StatCard
            icon={<BarChart3 className="h-5 w-5 text-purple-500" />}
            iconBg="bg-purple-500/10"
            label="My Claims"
            value={stats.my_claimed_chapters}
          />
          <StatCard
            icon={<CheckCircle className="h-5 w-5 text-green-500" />}
            iconBg="bg-green-500/10"
            label="Reviews Today"
            value={stats.my_reviews_today}
          />
          <StatCard
            icon={<CalendarDays className="h-5 w-5 text-indigo-500" />}
            iconBg="bg-indigo-500/10"
            label="This Week"
            value={stats.my_reviews_this_week}
          />
          <StatCard
            icon={<BarChart3 className="h-5 w-5 text-slate-500" />}
            iconBg="bg-slate-500/10"
            label="Total Reviews"
            value={stats.my_total_reviews}
          />
          <StatCard
            icon={<CheckCircle className="h-5 w-5 text-emerald-500" />}
            iconBg="bg-emerald-500/10"
            label="Approved Today"
            value={stats.approvals_today}
          />
          <StatCard
            icon={<RotateCcw className="h-5 w-5 text-orange-500" />}
            iconBg="bg-orange-500/10"
            label="Revisions Today"
            value={stats.revisions_requested_today}
          />
        </div>
      )}

      {/* Group Info */}
      {groupInfo ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="h-5 w-5" />
              My Group: {groupInfo.name}
              <Badge variant="outline" className="text-xs">
                {groupInfo.tag}
              </Badge>
            </CardTitle>
            {groupInfo.description && (
              <p className="text-muted-foreground text-sm">
                {groupInfo.description}
              </p>
            )}
          </CardHeader>
          <CardContent>
            <div className="text-muted-foreground mb-3 text-sm">
              {groupInfo.member_count} member(s) ·{" "}
              {groupInfo.pending_chapters_from_group} chapter(s) pending from
              this group
            </div>
            <div className="flex flex-wrap gap-3">
              {groupInfo.members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center gap-2 rounded-md border p-2"
                >
                  <div className="bg-muted flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium">
                    {member.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">{member.name}</span>
                    <span className="text-muted-foreground ml-1">
                      @{member.username}
                    </span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {member.group_role}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : groupError ? (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Could not load group info. You may not be assigned to a group yet.
          </AlertDescription>
        </Alert>
      ) : (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            You are not assigned to any editorial group.
          </AlertDescription>
        </Alert>
      )}

      {/* My Claimed Chapters Summary */}
      {claimedChapters && claimedChapters.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              My Claimed Chapters ({claimedChapters.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {claimedChapters.map((ch) => (
                <div
                  key={ch.id}
                  className="flex items-center justify-between rounded-md border p-3"
                >
                  <div>
                    <p className="text-sm font-medium">
                      Ch.{ch.chapter_number} &quot;{ch.title}&quot;
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {ch.novel.title} · by {ch.novel.author}
                    </p>
                  </div>
                  <Badge
                    variant={
                      ch.claim_hours_remaining <= 4 ? "destructive" : "outline"
                    }
                    className="text-xs"
                  >
                    <Clock className="mr-1 h-3 w-3" />
                    {Math.floor(ch.claim_hours_remaining)}h left
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function StatCard({
  icon,
  iconBg,
  label,
  value,
}: {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  value: number;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <div className={`rounded-lg p-2.5 ${iconBg}`}>{icon}</div>
        <div>
          <p className="text-muted-foreground text-xs">{label}</p>
          <p className="text-xl font-bold">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function OverviewSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <Skeleton className="h-14 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}
