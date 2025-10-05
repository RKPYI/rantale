"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api-client";

export default function GoogleCallbackPage() {
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [message, setMessage] = useState("");

  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the token from URL parameters
        const token = searchParams.get("token");
        const error = searchParams.get("error");

        if (error) {
          setStatus("error");
          setMessage(error);
          return;
        }

        if (!token) {
          setStatus("error");
          setMessage("No authentication token received");
          return;
        }

        // Store the token
        apiClient.setAuthToken(token, true); // Remember the user

        setStatus("success");
        setMessage("Successfully signed in with Google!");

        // Redirect to home page after a short delay
        setTimeout(() => {
          router.push("/");
        }, 2000);
      } catch (err) {
        setStatus("error");
        setMessage("Authentication failed. Please try again.");
      }
    };

    handleCallback();
  }, [searchParams, router]);

  return (
    <div className="relative container grid min-h-screen flex-col items-center justify-center lg:max-w-none lg:px-0">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]">
        <Card
          className={`${status === "success" ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950" : status === "error" ? "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950" : ""}`}
        >
          <CardHeader className="space-y-1 text-center">
            <CardTitle
              className={`text-2xl ${status === "success" ? "text-green-700 dark:text-green-400" : status === "error" ? "text-red-700 dark:text-red-400" : ""}`}
            >
              {status === "loading" && "Signing you in..."}
              {status === "success" && "Welcome to Ranovel!"}
              {status === "error" && "Authentication Error"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            {status === "loading" && (
              <div className="space-y-4">
                <Loader2 className="text-primary mx-auto h-16 w-16 animate-spin" />
                <p className="text-muted-foreground text-sm">
                  Please wait while we complete your Google sign-in...
                </p>
              </div>
            )}

            {status === "success" && (
              <div className="space-y-4">
                <CheckCircle className="mx-auto h-16 w-16 text-green-600" />
                <p className="text-sm font-medium text-green-700 dark:text-green-300">
                  {message}
                </p>
                <p className="text-muted-foreground text-sm">
                  Redirecting you to the home page...
                </p>
              </div>
            )}

            {status === "error" && (
              <div className="space-y-4">
                <XCircle className="mx-auto h-16 w-16 text-red-600" />
                <Alert variant="destructive">
                  <AlertDescription>{message}</AlertDescription>
                </Alert>
                <div className="space-y-2">
                  <Button
                    onClick={() => router.push("/auth/login")}
                    className="w-full"
                  >
                    Try Again
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => router.push("/")}
                    className="w-full"
                  >
                    Go to Home
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
