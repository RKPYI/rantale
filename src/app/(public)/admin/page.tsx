"use client";

import { AdminDashboard } from "@/components/admin";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Shield } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { getUserRole } from "@/lib/user-utils";

export default function AdminPage() {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return <AdminPageSkeleton />;
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="container mx-auto px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            Please sign in to access the admin dashboard.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const userRole = getUserRole(user);

  if (userRole !== "admin" && userRole !== "moderator") {
    return (
      <div className="container mx-auto px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <Alert variant="destructive">
          <Shield className="h-4 w-4" />
          <AlertDescription>
            You don't have permission to access the admin dashboard. Admin or
            moderator privileges required.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <AdminDashboard />
    </div>
  );
}

function AdminPageSkeleton() {
  return (
    <div className="container mx-auto space-y-6 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div>
        <Skeleton className="h-8 w-64" />
        <Skeleton className="mt-2 h-4 w-96" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-muted h-24 animate-pulse rounded-lg" />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="bg-muted h-48 animate-pulse rounded-lg" />
        ))}
      </div>
    </div>
  );
}
