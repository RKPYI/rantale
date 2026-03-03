"use client";

import { EditorDashboard } from "@/components/editor";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Shield } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { getUserRole } from "@/lib/user-utils";

export default function EditorPage() {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return <EditorPageSkeleton />;
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="container mx-auto px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            Please sign in to access the editor dashboard.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const userRole = getUserRole(user);

  // Only editors and admins can access the editor dashboard
  if (userRole !== "admin" && userRole !== "editor") {
    return (
      <div className="container mx-auto px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <Alert variant="destructive">
          <Shield className="h-4 w-4" />
          <AlertDescription>
            You don&apos;t have permission to access the editor dashboard.
            Editor or admin privileges required.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <EditorDashboard />
    </div>
  );
}

function EditorPageSkeleton() {
  return (
    <div className="container mx-auto space-y-6 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div>
        <Skeleton className="h-8 w-64" />
        <Skeleton className="mt-2 h-4 w-96" />
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-muted h-24 animate-pulse rounded-lg" />
        ))}
      </div>

      <div className="bg-muted h-64 animate-pulse rounded-lg" />
    </div>
  );
}
