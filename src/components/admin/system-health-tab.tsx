import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Database, Server, HardDrive, AlertTriangle } from "lucide-react";
import { useAdminSystemHealth } from "@/hooks/use-admin";
import { StatusBadge } from "./status-badge";
import type { ErrorMessage } from "@/types/admin";

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

  const criticalMessages =
    health?.health?.recent_errors?.critical_messages || [];
  const errorMessages = health?.health?.recent_errors?.error_messages || [];

  const formatErrorMessage = (msg: string) => {
    // Truncate very long error messages and extract key parts
    if (msg.length > 300) {
      const firstLine = msg.split("\n")[0];
      return firstLine.substring(0, 300) + "...";
    }
    return msg;
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleString();
    } catch {
      return timestamp;
    }
  };

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

      {/* Critical Error Messages */}
      {criticalMessages.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="text-destructive h-5 w-5" />
              Critical Error Messages
              <Badge variant="destructive" className="ml-2">
                {criticalMessages.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px] w-full rounded-md border p-4">
              <div className="space-y-4">
                {criticalMessages.map((error, index) => (
                  <div
                    key={index}
                    className="border-destructive/20 bg-destructive/5 rounded-lg border p-3"
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <Badge variant="destructive" className="text-xs">
                        {error.level}
                      </Badge>
                      <span className="text-muted-foreground text-xs">
                        {formatTimestamp(error.timestamp)}
                      </span>
                    </div>
                    <p className="font-mono text-sm break-words whitespace-pre-wrap">
                      {formatErrorMessage(error.message)}
                    </p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Error Messages */}
      {errorMessages.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Recent Error Messages
              <Badge variant="secondary" className="ml-2">
                {errorMessages.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px] w-full rounded-md border p-4">
              <div className="space-y-4">
                {errorMessages.map((error, index) => (
                  <div
                    key={index}
                    className="rounded-lg border border-orange-200 bg-orange-50 p-3 dark:border-orange-900/20 dark:bg-orange-950/20"
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <Badge variant="secondary" className="text-xs">
                        {error.level}
                      </Badge>
                      <span className="text-muted-foreground text-xs">
                        {formatTimestamp(error.timestamp)}
                      </span>
                    </div>
                    <p className="font-mono text-sm break-words whitespace-pre-wrap">
                      {formatErrorMessage(error.message)}
                    </p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
