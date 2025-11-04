/**
 * Offline Indicator Component
 * Shows the user's online/offline status
 */

'use client';

import { useEffect, useState } from 'react';
import { WifiOff, Wifi } from 'lucide-react';
import { useOfflineStatus } from '@/hooks/use-offline-chapter';
import { cn } from '@/lib/utils';

export function OfflineIndicator() {
  const { isOnline } = useOfflineStatus();
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Only show indicator when offline
    setShow(!isOnline);
  }, [isOnline]);

  if (!show) return null;

  return (
    <div
      className={cn(
        'fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium shadow-lg transition-all',
        'bg-destructive text-destructive-foreground'
      )}
    >
      <WifiOff className="h-4 w-4" />
      <span>You are offline</span>
    </div>
  );
}

/**
 * Inline status badge
 */
export function OfflineStatusBadge({ className }: { className?: string }) {
  const { isOnline } = useOfflineStatus();

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {isOnline ? (
        <>
          <Wifi className="h-4 w-4 text-green-600" />
          <span className="text-sm text-muted-foreground">Online</span>
        </>
      ) : (
        <>
          <WifiOff className="h-4 w-4 text-destructive" />
          <span className="text-sm text-destructive">Offline</span>
        </>
      )}
    </div>
  );
}
