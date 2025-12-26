import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Database, Server, HardDrive, AlertTriangle } from "lucide-react";
import { useAdminSystemHealth } from "@/hooks/use-admin";
import { StatusBadge } from "./status-badge";

export function SystemHealthTab() {
  const { data: health, loading } = useAdminSystemHealth();

  if (loading) {
    return (
      <div className="space-y-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Database Health */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Database Health
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Status</span>
              <StatusBadge
                status={health?.health?.database?.status || "critical"}
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Total Tables</span>
              <span className="text-sm font-medium">
                {health?.health?.database?.total_tables || 0}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Cache Health */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5" />
              Cache Health
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Status</span>
              <StatusBadge
                status={health?.health?.cache?.status || "critical"}
              />
            </div>
          </CardContent>
        </Card>

        {/* Storage Health */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <HardDrive className="h-5 w-5" />
              Storage Health
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Status</span>
              <StatusBadge
                status={health?.health?.storage?.status || "critical"}
              />
            </div>
          </CardContent>
        </Card>

        {/* Recent Errors */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Error Monitoring
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Errors Today</span>
              <span className="text-sm font-medium">
                {health?.health?.recent_errors?.count_today || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Critical Errors</span>
              <span className="text-sm font-medium">
                {health?.health?.recent_errors?.critical_errors || 0}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
