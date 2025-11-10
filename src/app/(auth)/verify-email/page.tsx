"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const status = searchParams.get("status");
  const message = searchParams.get("message");

  useEffect(() => {
    if (status && message) {
      if (status === "success") {
        toast.success(message, {
          duration: 4000,
        });
      } else if (status === "error") {
        toast.error(message, {
          duration: 5000,
        });
      }

      // Redirect to home page after showing toast
      const timeout = setTimeout(() => {
        router.push("/");
      }, 2000);

      return () => clearTimeout(timeout);
    }
  }, [status, message, router]);

  // Show loading state while processing
  if (!status || !message) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mb-4 flex justify-center">
              <Loader2 className="text-primary h-12 w-12 animate-spin" />
            </div>
            <CardTitle>Processing Verification</CardTitle>
            <CardDescription>
              Please wait while we verify your email...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mb-4 flex justify-center">
            {status === "success" ? (
              <CheckCircle2 className="h-12 w-12 text-green-500" />
            ) : (
              <XCircle className="text-destructive h-12 w-12" />
            )}
          </div>
          <CardTitle>
            {status === "success" ? "Email Verified!" : "Verification Failed"}
          </CardTitle>
          <CardDescription className="mt-2">
            {decodeURIComponent(message)}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-muted-foreground text-center text-sm">
          Redirecting to home page...
        </CardContent>
      </Card>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mb-4 flex justify-center">
                <Loader2 className="text-primary h-12 w-12 animate-spin" />
              </div>
              <CardTitle>Loading</CardTitle>
              <CardDescription>Please wait...</CardDescription>
            </CardHeader>
          </Card>
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
