'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RefreshCw, Home, AlertCircle, Search } from 'lucide-react';
import Link from 'next/link';

interface PublicErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function PublicError({ error, reset }: PublicErrorProps) {
  useEffect(() => {
    console.error('Public page error:', error);
  }, [error]);

  return (
    <div className="container mx-auto px-4 py-16">
      <Card className="max-w-md mx-auto text-center">
        <CardContent className="p-8">
          <div className="flex justify-center mb-6">
            <div className="p-3 bg-destructive/10 rounded-full">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
          </div>
          
          <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
          
          <Alert variant="destructive" className="mb-6 text-left">
            <AlertDescription>
              We're having trouble loading this page. Please try refreshing or check back later.
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