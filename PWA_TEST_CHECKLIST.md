# PWA & Offline Testing Checklist

Use this checklist to verify that chapter downloads and the PWA work 100%.

Quick route for automated checks: /pwa-diagnostics

1) Prepare
- Use Chrome or Edge on desktop; Safari iOS also supported.
- Prefer HTTPS origin (or http://localhost) and production build for SW tests.
- Commands:
  - Dev: npm run dev
  - Prod: npm run build && npm start

2) Automated Diagnostics (recommended)
- Navigate to http://localhost:3000/pwa-diagnostics
- Click Run All Tests
- Ensure all checks pass:
  - Environment support
  - Service worker registration (prod build)
  - CacheStorage & localStorage roundtrip
  - Chapter download -> read -> remove cycle
  - Storage usage retrieval
  - PWA install prompt eligibility

3) Manual Chapter Download Test
- On any chapter page with a Download button (or use diagnostics):
  - Click Download and wait until it shows Downloaded.
  - Toggle DevTools → Application → Service Workers → Offline.
  - Reload the chapter page or open /offline/read/<id> if available.
  - Confirm content renders offline.
  - Remove the download and verify it disappears from /offline/downloads.

4) Offline Downloads Manager
- Visit /offline/downloads
- Confirm downloaded chapter(s) listed with title, number, and date.
- Click a chapter to open it; verify reading view works offline.
- Use Clear All to verify removal works.

5) PWA Installability
- Ensure you are running the production build.
- Look for install prompt or Chrome’s install option (omnibox or menu → Install app).
- After install:
  - Launch the app from OS shortcut.
  - Confirm standalone window without browser UI.
  - Verify offline pages load (toggle DevTools → Offline and open /offline/downloads).

6) Storage & Quota
- On /pwa-diagnostics, run Storage usage.
- Confirm values are present and update after downloads.

7) Troubleshooting
- No Service Worker in dev: expected. Build for production.
- Mixed content / HTTP on non-localhost: service workers require HTTPS.
- Private/Incognito windows may clear storage on close.
- Clear state if stuck: Application → Clear storage, then reload.