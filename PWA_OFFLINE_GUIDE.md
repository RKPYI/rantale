# PWA & Offline Reading Implementation Guide

## Overview

RDKNovel now supports **Progressive Web App (PWA)** features with offline chapter reading capabilities. Users can download chapters and read them without an internet connection.

## Features

### ✨ Core Capabilities

1. **Offline Chapter Reading**
   - Download chapters for offline access
   - Read downloaded chapters without internet
   - Manage downloaded content

2. **PWA Support**
   - Installable app on mobile and desktop
   - Offline page caching
   - Background sync ready
   - App-like experience

3. **Storage Management**
   - View storage usage
   - Bulk delete downloads
   - Storage quota monitoring

4. **Online/Offline Detection**
   - Real-time connection status
   - Visual indicators
   - Graceful degradation

## Architecture

### Technology Stack

- **@ducanh2912/next-pwa**: Service worker generation
- **Cache API**: Chapter content storage
- **LocalStorage**: Download metadata
- **Workbox**: Advanced caching strategies

### File Structure

```
src/
├── services/
│   └── offline.ts              # Core offline logic
├── hooks/
│   └── use-offline-chapter.ts  # React hooks for offline features
├── components/
│   ├── chapters/
│   │   └── chapter-download-button.tsx  # Download UI
│   ├── offline-indicator.tsx            # Connection status
│   ├── offline-downloads.tsx            # Downloads management
│   └── pwa-install-prompt.tsx           # PWA install prompt
└── app/
    └── manifest.ts             # PWA manifest configuration
```

## Usage Examples

### 1. Add Download Button to Chapter Page

```tsx
import { ChapterDownloadButton } from '@/components/chapters';

export function ChapterPage({ chapter, novelTitle }) {
  return (
    <div>
      <h1>{chapter.title}</h1>
      <ChapterDownloadButton 
        chapter={chapter} 
        novelTitle={novelTitle}
        onSuccess={() => console.log('Downloaded!')}
        onError={(error) => console.error(error)}
      />
      {/* Chapter content */}
    </div>
  );
}
```

### 2. Check Offline Status

```tsx
import { useOfflineStatus } from '@/hooks/use-offline-chapter';

export function MyComponent() {
  const { isOnline, isOffline } = useOfflineStatus();
  
  return (
    <div>
      {isOffline && <p>You are offline</p>}
    </div>
  );
}
```

### 3. Display Downloaded Chapters

```tsx
import { OfflineDownloads } from '@/components/offline-downloads';

export function DownloadsPage() {
  return (
    <div>
      <h1>My Downloads</h1>
      <OfflineDownloads />
    </div>
  );
}
```

### 4. Retrieve Offline Chapter

```tsx
import { offlineService } from '@/services/offline';

// In a server component or API route
export async function getChapterContent(chapterId: number) {
  // Try offline first
  const offlineChapter = await offlineService.getOfflineChapter(chapterId.toString());
  
  if (offlineChapter) {
    return offlineChapter;
  }
  
  // Fallback to API
  return await fetchFromAPI(chapterId);
}
```

### 5. Add Install Prompt

```tsx
// In your root layout
import { PWAInstallPrompt } from '@/components/pwa-install-prompt';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <PWAInstallPrompt />
      </body>
    </html>
  );
}
```

## Service Worker Configuration

### Caching Strategies

The PWA uses multiple caching strategies defined in `next.config.ts`:

1. **CacheFirst** - For fonts and images
   - Google Fonts cached for 1 year
   - Images cached for 30 days

2. **NetworkFirst** - For API requests
   - 10-second network timeout
   - 5-minute cache fallback

3. **StaleWhileRevalidate** - For static assets
   - Immediate cache response
   - Background update

### Custom Chapter Cache

Chapters use a separate cache (`rdknovel-chapters-v1`) with manual control:

```typescript
// Download a chapter
await offlineService.downloadChapter(chapter, novelTitle);

// Get offline chapter
const chapter = await offlineService.getOfflineChapter(chapterId);

// Remove chapter
await offlineService.removeChapter(chapterId);

// Clear all
await offlineService.clearAllDownloads();
```

## Storage Management

### Storage Limits

- **Typical Browser Limit**: ~50MB (Chrome/Edge)
- **Firefox**: Up to 2GB
- **Safari**: Varies by device

### Monitoring Usage

```typescript
const { used, quota, percentage } = await offlineService.getStorageUsage();
console.log(`Using ${percentage.toFixed(1)}% of storage`);
```

### Best Practices

1. **Limit Downloads**: Encourage users to manage downloads
2. **Show Storage Usage**: Display percentage in UI
3. **Cleanup Old Content**: Implement auto-cleanup for old chapters
4. **User Control**: Always allow manual deletion

## Security Considerations

### Authentication

Downloaded chapters bypass server authentication. For premium content:

1. **Encrypt Content**: Consider encrypting chapter content
2. **Validate Downloads**: Check user permissions before download
3. **Expiry Tokens**: Implement time-limited offline access
4. **Audit Logging**: Track download activity

### Implementation Example

```typescript
// Enhanced download with validation
async function secureDownload(chapterId: number) {
  // 1. Check user permissions
  const hasAccess = await checkChapterAccess(chapterId);
  if (!hasAccess) throw new Error('Access denied');
  
  // 2. Download chapter
  const chapter = await fetchChapter(chapterId);
  
  // 3. Add expiry timestamp
  const secureChapter = {
    ...chapter,
    expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000), // 7 days
  };
  
  // 4. Store with expiry
  await offlineService.downloadChapter(secureChapter);
}
```

## Testing

### Test Offline Functionality

1. **Chrome DevTools**:
   - Open DevTools → Application → Service Workers
   - Check "Offline" to simulate offline mode
   - Verify chapters load from cache

2. **Network Throttling**:
   - DevTools → Network → Throttling
   - Test "Slow 3G" to verify caching

3. **Storage Inspection**:
   - Application → Cache Storage
   - View `rdknovel-chapters-v1` entries

### Manual Testing Checklist

- [ ] Download chapter while online
- [ ] Go offline (airplane mode)
- [ ] Open downloaded chapter
- [ ] Verify chapter displays correctly
- [ ] Check storage usage updates
- [ ] Delete chapter
- [ ] Clear all downloads
- [ ] Install PWA on mobile
- [ ] Test offline indicator

## Deployment

### Environment Variables

No additional environment variables needed. PWA is configured in `next.config.ts`.

### Build Process

```bash
# Development (PWA disabled)
npm run dev

# Production build (PWA enabled)
npm run build
npm start
```

### Verification

After deployment, verify:

1. `/manifest.json` is accessible
2. Service worker registers at `/sw.js`
3. Install prompt appears on supported browsers
4. Offline functionality works

## Browser Support

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| Service Workers | ✅ | ✅ | ✅ | ✅ |
| Cache API | ✅ | ✅ | ✅ | ✅ |
| PWA Install | ✅ | ❌ | ✅* | ✅ |
| Background Sync | ✅ | ❌ | ❌ | ✅ |

*Safari iOS requires "Add to Home Screen"

## Troubleshooting

### Service Worker Not Registering

```bash
# Clear browser cache
# Check console for errors
# Verify HTTPS (required for SW)
```

### Chapters Not Caching

```typescript
// Check if supported
if (!offlineService.isSupported()) {
  console.log('Offline features not supported');
}

// Verify cache
const cache = await caches.open('rdknovel-chapters-v1');
const keys = await cache.keys();
console.log('Cached chapters:', keys);
```

### Storage Quota Exceeded

```typescript
// Check quota
const { used, quota } = await offlineService.getStorageUsage();
if (used / quota > 0.9) {
  // Warn user or auto-cleanup
  await offlineService.clearAllDownloads();
}
```

## Future Enhancements

### Planned Features

1. **Auto-Download Next Chapters**: Preload upcoming chapters
2. **Background Sync**: Sync reading progress offline
3. **Offline Comments**: Queue comments when offline
4. **Smart Cleanup**: Auto-delete old chapters
5. **Chapter Updates**: Notify when downloaded chapters are updated
6. **Bulk Downloads**: Download entire novels

### Implementation Ideas

```typescript
// Auto-download next chapter
async function preloadNextChapter(currentChapterId: number) {
  const nextChapter = await fetchNextChapter(currentChapterId);
  if (nextChapter && !offlineService.isChapterDownloaded(nextChapter.id.toString())) {
    await offlineService.downloadChapter(nextChapter);
  }
}

// Smart cleanup - remove chapters older than 30 days
async function cleanupOldChapters() {
  const chapters = await offlineService.getAllDownloadedChapters();
  const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
  
  for (const chapter of chapters) {
    if (new Date(chapter.downloadedAt).getTime() < thirtyDaysAgo) {
      await offlineService.removeChapter(chapter.id.toString());
    }
  }
}
```

## API Reference

See the inline documentation in:
- `src/services/offline.ts` - Core service methods
- `src/hooks/use-offline-chapter.ts` - React hooks
- `src/components/chapters/chapter-download-button.tsx` - UI component

## Support

For issues or questions:
1. Check browser console for errors
2. Verify service worker status in DevTools
3. Test in incognito mode (clean cache)
4. Report bugs with browser/version details
