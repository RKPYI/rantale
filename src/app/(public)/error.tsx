"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RefreshCw, Home, AlertCircle, Search } from "lucide-react";
import Link from "next/link";

interface PublicErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function PublicError({ error, reset }: PublicErrorProps) {
  useEffect(() => {
    console.error("Public page error:", error);
  }, [error]);

  return (
    <div className="container mx-auto px-4 py-16">
      <Card className="mx-auto max-w-md text-center">
        <CardContent className="p-8">
          <div className="mb-6 flex justify-center">
            <div className="bg-destructive/10 rounded-full p-3">
              <AlertCircle className="text-destructive h-8 w-8" />
            </div>
          </div>

          <h1 className="mb-4 text-2xl font-bold">Something went wrong</h1>

          <Alert variant="destructive" className="mb-6 text-left">
            <AlertDescription>
              We&apos;re having trouble loading this page. Please try refreshing
              or check back later.
            </AlertDescription>
          </Alert>

          <div className="space-y-3">
            <Button onClick={reset} className="w-full">
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>

            <div className="flex gap-2">
              <Link href="/" className="flex-1">
                <Button variant="outline" className="w-full">
                  <Home className="mr-2 h-4 w-4" />
                  Home
                </Button>
              </Link>

              <Link href="/search" className="flex-1">
                <Button variant="outline" className="w-full">
                  <Search className="mr-2 h-4 w-4" />
                  Search
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
