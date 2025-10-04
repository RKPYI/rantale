"use client";

import { useState, useEffect } from 'react';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { Spinner, LoadingThrobber } from '@/components/ui/spinner';
import { BookOpen, Loader2, Search, Star, Clock } from 'lucide-react';

interface LoadingSpinnerProps {
  message?: string;
  subMessage?: string;
  showProgress?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'search' | 'novel' | 'minimal';
}

export function LoadingSpinner({ 
  message = "Loading...", 
  subMessage = "Please wait", 
  showProgress = true,
  size = 'md',
  variant = 'default'
}: LoadingSpinnerProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!showProgress) return;
    
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) return prev;
        const increment = Math.random() * 10 + 5;
        return Math.min(prev + increment, 95);
      });
    }, 200);

    return () => clearInterval(timer);
  }, [showProgress]);

  const getIcon = () => {
    switch (variant) {
      case 'search':
        return <Search className="text-primary" />;
      case 'novel':
        return <BookOpen className="text-primary" />;
      default:
        return <BookOpen className="text-primary" />;
    }
  };

  const getSizes = () => {
    switch (size) {
      case 'sm':
        return {
          icon: 'h-4 w-4',
          spinner: 'h-2 w-2',
          text: 'text-sm',
          subText: 'text-xs',
          progress: 'h-1',
          maxWidth: 'max-w-xs'
        };
      case 'lg':
        return {
          icon: 'h-10 w-10',
          spinner: 'h-5 w-5',
          text: 'text-xl',
          subText: 'text-base',
          progress: 'h-3',
          maxWidth: 'max-w-lg'
        };
      default:
        return {
          icon: 'h-6 w-6',
          spinner: 'h-3 w-3',
          text: 'text-base',
          subText: 'text-sm',
          progress: 'h-2',
          maxWidth: 'max-w-md'
        };
    }
  };

  const sizes = getSizes();

  if (variant === 'minimal') {
    return (
      <div className="flex items-center justify-center gap-2">
        <Spinner variant="minimal" size={size === 'sm' ? 'sm' : 'md'} />
        <span className={`${sizes.text} text-muted-foreground`}>{message}</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative">
          {getIcon()}
          <Loader2 className={`${sizes.spinner} animate-spin absolute -top-1 -right-1 text-primary`} />
        </div>
        <div className="space-y-1">
          <div className={`${sizes.text} font-medium`}>{message}</div>
          <div className={`${sizes.subText} text-muted-foreground`}>{subMessage}</div>
        </div>
      </div>
      
      {showProgress && (
        <div className={`w-full ${sizes.maxWidth} space-y-2`}>
          <Progress value={progress} className={sizes.progress} />
          <div className="text-center text-xs text-muted-foreground">
            {Math.round(progress)}% complete
          </div>
        </div>
      )}
    </div>
  );
}

// Specialized loading components for different contexts
export function NovelSearchLoading() {
  return (
    <Card>
      <CardContent className="p-8">
        <LoadingThrobber 
          message="Searching novels..."
          variant="soft"
          size="md"
        />
        <p className="text-xs text-muted-foreground/60 mt-2 text-center">
          Finding the perfect stories for you
        </p>
      </CardContent>
    </Card>
  );
}

export function NovelContentLoading() {
  return (
    <Card>
      <CardContent className="p-6">
        <LoadingSpinner 
          message="Loading novel..."
          subMessage="Preparing your reading experience"
          variant="novel"
          size="md"
        />
      </CardContent>
    </Card>
  );
}

export function InlineLoading({ message = "Loading..." }: { message?: string }) {
  return (
    <LoadingSpinner 
      message={message}
      showProgress={false}
      variant="minimal"
      size="sm"
    />
  );
}

// Full page loading overlay
export function PageLoadingOverlay({ message = "Loading page..." }: { message?: string }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) return prev;
        const increment = Math.random() * 15 + 5;
        return Math.min(prev + increment, 95);
      });
    }, 150);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="w-full">
        {/* Top progress bar */}
        <div className="fixed top-0 left-0 right-0">
          <Progress value={progress} className="h-1 rounded-none" />
        </div>
        
        {/* Center content */}
        <div className="flex flex-col items-center justify-center space-y-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <BookOpen className="h-12 w-12 text-primary" />
              <Loader2 className="h-6 w-6 animate-spin absolute -top-2 -right-2 text-primary" />
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-semibold">{message}</div>
              <div className="text-muted-foreground">Please wait while we load your content</div>
            </div>
          </div>
          
          <div className="w-full max-w-md space-y-2">
            <Progress value={progress} className="h-2" />
            <div className="text-center text-sm text-muted-foreground">
              {Math.round(progress)}% complete
            </div>
          </div>
          
          {/* Loading steps */}
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              {progress > 20 ? (
                <div className="w-2 h-2 bg-primary rounded-full" />
              ) : (
                <Loader2 className="w-3 h-3 animate-spin" />
              )}
              <span>Connecting...</span>
            </div>
            <div className="flex items-center gap-2">
              {progress > 60 ? (
                <div className="w-2 h-2 bg-primary rounded-full" />
              ) : progress > 20 ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <div className="w-2 h-2 bg-muted rounded-full" />
              )}
              <span>Loading data...</span>
            </div>
            <div className="flex items-center gap-2">
              {progress > 90 ? (
                <div className="w-2 h-2 bg-primary rounded-full" />
              ) : progress > 60 ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <div className="w-2 h-2 bg-muted rounded-full" />
              )}
              <span>Finishing up...</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}