"use client";

import { AuthorApplicationForm, AuthorDashboard } from "@/components/author";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/auth-context";
import { getUserRole } from "@/lib/user-utils";

export default function AuthorPage() {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return <AuthorPageSkeleton />;
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="container mx-auto px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <Alert>
          <AlertDescription>
            Please sign in to access the author section.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const userRole = getUserRole(user);
  const showDashboard =
    userRole === "author" || userRole === "moderator" || userRole === "admin";

  return (
    <div className="container mx-auto px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      {showDashboard ? <AuthorDashboard /> : <AuthorApplicationForm />}
    </div>
  );
}

function AuthorPageSkeleton() {
  return (
    <div className="container mx-auto space-y-6 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    </div>
  );
}
