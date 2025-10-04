"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Global application error:", error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <Card className="w-full max-w-md text-center">
            <CardHeader>
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-destructive/10 rounded-full">
                  <AlertTriangle className="h-12 w-12 text-destructive" />
                </div>
              </div>
              <CardTitle className="text-2xl">Critical Error</CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                A critical error has occurred. The application needs to be restarted.
              </p>
              
              <div className="space-y-3">
                <Button 
                  onClick={reset}
                  className="w-full"
                  size="lg"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Restart Application
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => window.location.href = "/"}
                >
                  <Home className="mr-2 h-4 w-4" />
                  Go to Home
                </Button>
              </div>
              
              <div className="pt-4 border-t text-xs text-muted-foreground">
                <p>Error ID: {error.digest}</p>
                <p className="mt-1">
                  If this persists, please contact support.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </body>
    </html>
  );
}