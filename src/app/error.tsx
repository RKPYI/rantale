"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RefreshCw, Home, AlertTriangle, Bug } from "lucide-react";
import Link from "next/link";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Application error:", error);
  }, [error]);

  const isDevelopment = process.env.NODE_ENV === "development";

  return (
    <div className="bg-background flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mb-4 flex justify-center">
            <div className="bg-destructive/10 rounded-full p-3">
              <AlertTriangle className="text-destructive h-8 w-8" />
            </div>
          </div>
          <CardTitle className="text-2xl">Something went wrong!</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <Bug className="h-4 w-4" />
            <AlertDescription>
              An unexpected error occurred while processing your request. Our
              team has been notified.
            </AlertDescription>
          </Alert>

          {/* Development Error Details */}
          {isDevelopment && (
            <Alert>
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-semibold">Error Details (Development):</p>
                  <p className="bg-muted rounded p-2 font-mono text-sm">
                    {error.message}
                  </p>
                  {error.digest && (
                    <p className="text-muted-foreground text-xs">
                      Error ID: {error.digest}
                    </p>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="space-y-3 pt-4">
            <Button onClick={reset} className="w-full">
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>

            <Link href="/" className="w-full">
              <Button variant="outline" className="w-full">
                <Home className="mr-2 h-4 w-4" />
                Go Home
              </Button>
            </Link>
          </div>

          {/* Help Information */}
          <div className="border-t pt-4 text-center">
            <p className="text-muted-foreground mb-2 text-sm">
              If this problem persists, please contact our support team.
            </p>
            <div className="flex justify-center gap-4 text-xs">
              <Link href="/contact" className="text-primary hover:underline">
                Contact Support
              </Link>
              <Link href="/help" className="text-primary hover:underline">
                Help Center
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
