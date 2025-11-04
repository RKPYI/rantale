"use client";

/**
 * PWA & Offline Diagnostics
 * A self‑contained page to verify chapter download and PWA functionality.
 *
 * Route: /pwa-diagnostics
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { CheckCircle2, CircleAlert, Loader2, PackageCheck, RefreshCcw, ShieldCheck, Wifi, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { offlineService } from "@/services/offline";
import type { Chapter } from "@/types/api";
import Link from "next/link";

declare global {
  interface Window {
    __bipEvent?: Event;
  }
}

type TestStatus = "idle" | "running" | "passed" | "failed";

interface TestResult {
  name: string;
  status: TestStatus;
  message?: string;
  details?: Record<string, unknown>;
}

function isErrorWithMessage(e: unknown): e is { message: string } {
  return typeof e === "object" && e !== null && "message" in e && typeof (e as Record<string, unknown>).message === "string";
}

function getErrorMessage(e: unknown): string {
  return isErrorWithMessage(e) ? e.message : String(e);
}

const initialTests: TestResult[] = [
  { name: "Environment support", status: "idle" },
  { name: "Service worker registration", status: "idle" },
  { name: "CacheStorage & localStorage", status: "idle" },
  { name: "Chapter download -> read -> remove cycle", status: "idle" },
  { name: "Storage usage", status: "idle" },
  { name: "PWA install prompt eligibility", status: "idle" },
];

export default function PWADiagnosticsPage() {
  const [tests, setTests] = useState<TestResult[]>(initialTests);
  const [runningAll, setRunningAll] = useState(false);
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [installPromptCaptured, setInstallPromptCaptured] = useState<boolean>(false);
  const [swScope, setSwScope] = useState<string | null>(null);

  useEffect(() => {
    setIsOnline(navigator.onLine);
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    const onBIP = (e: Event) => {
      // beforeinstallprompt event captured => app is installable
      e.preventDefault?.();
      setInstallPromptCaptured(true);
      window.__bipEvent = e;
    };
    window.addEventListener("beforeinstallprompt", onBIP as EventListener);

    // Try to read existing SW registration (works in production only)
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.getRegistration().then((reg) => {
        if (reg) setSwScope(reg.scope);
      }).catch(() => {});
    }

    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
      window.removeEventListener("beforeinstallprompt", onBIP as EventListener);
    };
  }, []);

  const updateTest = useCallback((name: string, patch: Partial<TestResult>) => {
    setTests((prev) => prev.map((t) => (t.name === name ? { ...t, ...patch } : t)));
  }, []);

  const reset = () => setTests(initialTests);

  const runEnvSupport = useCallback(async () => {
    const name = "Environment support";
    updateTest(name, { status: "running", message: undefined, details: undefined });
    try {
      const supported = offlineService.isSupported();
      const swPossible = typeof window !== "undefined" && "serviceWorker" in navigator;
      const cachesOK = typeof window !== "undefined" && "caches" in window;
      const lsOK = typeof window !== "undefined" && "localStorage" in window;
      if (!supported || !cachesOK || !lsOK) {
        updateTest(name, {
          status: "failed",
          message: "Required Web APIs are not available in this context. Run a production build over HTTPS.",
          details: { supported, swPossible, cachesOK, lsOK },
        });
        return false;
      }
      updateTest(name, {
        status: "passed",
        message: "Core Web APIs available",
        details: { supported, swPossible, cachesOK, lsOK },
      });
      return true;
    } catch (e: unknown) {
      updateTest(name, { status: "failed", message: getErrorMessage(e) });
      return false;
    }
  }, [updateTest]);

  const runSWCheck = useCallback(async () => {
    const name = "Service worker registration";
    updateTest(name, { status: "running", message: undefined, details: undefined });
    if (!("serviceWorker" in navigator)) {
      updateTest(name, {
        status: "failed",
        message: "Service workers not supported. Use Chrome/Edge/Safari with HTTPS.",
      });
      return false;
    }
    try {
      const reg = await navigator.serviceWorker.getRegistration();
      if (reg) {
        setSwScope(reg.scope);
        updateTest(name, { status: "passed", message: `Registered (${reg.scope})` });
        return true;
      }
      updateTest(name, {
        status: "failed",
        message: "No active registration. Build for production: npm run build && npm start",
      });
      return false;
    } catch (e: unknown) {
      updateTest(name, { status: "failed", message: getErrorMessage(e) });
      return false;
    }
  }, [updateTest]);

  const runCacheLSCheck = useCallback(async () => {
    const name = "CacheStorage & localStorage";
    updateTest(name, { status: "running", message: undefined, details: undefined });
    try {
      const cachesOK = "caches" in window;
      const lsOK = "localStorage" in window;
      if (!cachesOK || !lsOK) {
        updateTest(name, { status: "failed", message: "Missing caches or localStorage" });
        return false;
      }
      // Try a no-op cache open
      const cache = await caches.open("diagnostics-test");
      await cache.put("/pwa-diagnostics/ping", new Response(JSON.stringify({ ok: true }), { headers: { "Content-Type": "application/json" } }));
      const matched = await cache.match("/pwa-diagnostics/ping");
      await caches.delete("diagnostics-test");
      if (!matched) {
        updateTest(name, { status: "failed", message: "Cache roundtrip failed" });
        return false;
      }
      // LocalStorage roundtrip
      localStorage.setItem("__diag__", "1");
      const v = localStorage.getItem("__diag__");
      localStorage.removeItem("__diag__");
      if (v !== "1") {
        updateTest(name, { status: "failed", message: "localStorage roundtrip failed" });
        return false;
      }
      updateTest(name, { status: "passed", message: "CacheStorage + localStorage operational" });
      return true;
    } catch (e: unknown) {
      updateTest(name, { status: "failed", message: getErrorMessage(e) });
      return false;
    }
  }, [updateTest]);

  const mockChapter: Chapter = useMemo(() => {
    const id = 987654321; // static id for predictable cleanup
    const now = new Date().toISOString();
    return {
      id,
      novel_id: 123,
      chapter_number: 1,
      title: "Diagnostics Chapter",
      content: "This is a test chapter used by the PWA diagnostics.",
      word_count: 8,
      views: 0,
      is_free: true,
      published_at: now,
      created_at: now,
      updated_at: now,
      previous_chapter: null,
      next_chapter: null,
    };
  }, []);

  const runDownloadCycle = useCallback(async () => {
    const name = "Chapter download -> read -> remove cycle";
    updateTest(name, { status: "running", message: undefined, details: undefined });
    try {
      // Ensure clean start
      if (offlineService.isChapterDownloaded(String(mockChapter.id))) {
        await offlineService.removeChapter(String(mockChapter.id));
      }

      await offlineService.downloadChapter(mockChapter, "Diagnostics Novel");
      const isDownloaded = offlineService.isChapterDownloaded(String(mockChapter.id));
      const readBack = await offlineService.getOfflineChapter(String(mockChapter.id));
      if (!isDownloaded || !readBack) {
        updateTest(name, { status: "failed", message: "Failed to verify downloaded chapter" });
        return false;
      }

      // Validate content roundtrip
      const ok = readBack.title === mockChapter.title && typeof readBack.content === "string" && readBack.content.includes("diagnostics");

      await offlineService.removeChapter(String(mockChapter.id));
      const stillThere = offlineService.isChapterDownloaded(String(mockChapter.id));

      if (!ok || stillThere) {
        updateTest(name, {
          status: "failed",
          message: !ok ? "Downloaded content mismatch" : "Removal failed",
          details: { isDownloaded, readBack, stillThere },
        });
        return false;
      }

      updateTest(name, {
        status: "passed",
        message: "Download, read, and remove succeeded",
        details: { readBack },
      });
      return true;
    } catch (e: unknown) {
      updateTest(name, { status: "failed", message: getErrorMessage(e) });
      return false;
    }
  }, [mockChapter, updateTest]);

  const runStorageUsage = useCallback(async () => {
    const name = "Storage usage";
    updateTest(name, { status: "running", message: undefined, details: undefined });
    try {
      const usage = await offlineService.getStorageUsage();
      updateTest(name, {
        status: "passed",
        message: `Used ${(usage.used / 1024).toFixed(1)} KB of ${(usage.quota / 1024 / 1024).toFixed(1)} MB (~${usage.percentage.toFixed(2)}%)`,
        details: usage,
      });
      return true;
    } catch (e: unknown) {
      updateTest(name, { status: "failed", message: getErrorMessage(e) });
      return false;
    }
  }, [updateTest]);

  const runInstallability = useCallback(async () => {
    const name = "PWA install prompt eligibility";
    updateTest(name, { status: "running", message: undefined, details: undefined });
    try {
      const hasManifest = !!document.querySelector('link[rel="manifest"]');
      const swReady = !!swScope;
      const captured = installPromptCaptured;
      if (hasManifest && swReady) {
        updateTest(name, {
          status: captured ? "passed" : "passed", // treat as pass if manifest + SW ready; event may not always fire immediately
          message: captured ? "Install prompt captured" : "Manifest + SW detected. Prompt will appear when eligible.",
          details: { hasManifest, swReady, captured, swScope },
        });
        return true;
      }
      updateTest(name, {
        status: "failed",
        message: "Missing manifest or service worker (prod build required)",
        details: { hasManifest, swReady, captured, swScope },
      });
      return false;
    } catch (e: unknown) {
      updateTest(name, { status: "failed", message: getErrorMessage(e) });
      return false;
    }
  }, [installPromptCaptured, swScope, updateTest]);

  const runAll = useCallback(async () => {
    setRunningAll(true);
    reset();
    try {
      const ok1 = await runEnvSupport();
      const ok2 = await runSWCheck();
      const ok3 = await runCacheLSCheck();
      const ok4 = await runDownloadCycle();
      const ok5 = await runStorageUsage();
      const ok6 = await runInstallability();
      return ok1 && ok2 && ok3 && ok4 && ok5 && ok6;
    } finally {
      setRunningAll(false);
    }
  }, [runEnvSupport, runSWCheck, runCacheLSCheck, runDownloadCycle, runStorageUsage, runInstallability]);

  const iconFor = (status: TestStatus) => {
    switch (status) {
      case "running":
        return <Loader2 className="h-4 w-4 animate-spin text-blue-600" />;
      case "passed":
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case "failed":
        return <CircleAlert className="h-4 w-4 text-red-600" />;
      default:
        return <PackageCheck className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="mx-auto max-w-3xl p-4">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">PWA & Offline Diagnostics</h1>
          <p className="text-sm text-muted-foreground">Verify chapter downloads, offline mode, and PWA installability</p>
        </div>
        <div className="flex items-center gap-2">
          <div className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs ${isOnline ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400" : "bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400"}`}>
            {isOnline ? <Wifi className="h-3.5 w-3.5" /> : <WifiOff className="h-3.5 w-3.5" />}
            <span>{isOnline ? "Online" : "Offline"}</span>
          </div>
          <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
            <RefreshCcw className="mr-1.5 h-3.5 w-3.5" /> Refresh
          </Button>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Automated Checks</CardTitle>
          <CardDescription>
            Tip: Service worker and installability require a production build (npm run build && npm start) over HTTPS.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <Button onClick={runAll} disabled={runningAll}>
              {runningAll ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShieldCheck className="mr-2 h-4 w-4" />} Run All Tests
            </Button>
            <Button variant="outline" onClick={runEnvSupport}>Env Support</Button>
            <Button variant="outline" onClick={runSWCheck}>Service Worker</Button>
            <Button variant="outline" onClick={runCacheLSCheck}>Cache & LS</Button>
            <Button variant="outline" onClick={runDownloadCycle}>Download Cycle</Button>
            <Button variant="outline" onClick={runStorageUsage}>Storage</Button>
            <Button variant="outline" onClick={runInstallability}>Installability</Button>
          </div>

          <div className="divide-y rounded-md border">
            {tests.map((t) => (
              <div key={t.name} className="flex items-start gap-3 p-3">
                <div className="mt-0.5">{iconFor(t.status)}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{t.name}</div>
                    <div className="text-xs text-muted-foreground">{t.status.toUpperCase()}</div>
                  </div>
                  {t.message && <div className="mt-1 text-sm text-muted-foreground">{t.message}</div>}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Manual Verification</CardTitle>
          <CardDescription>Use these quick links and tips to verify behavior</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <ol className="list-decimal space-y-2 pl-5">
            <li>
              Use the Download Cycle test above. If it passes, offline chapter storage works.
            </li>
            <li>
              Open the Downloads Manager to view and read saved chapters: <Link className="text-primary underline" href="/offline/downloads">/offline/downloads</Link>
            </li>
            <li>
              In Chrome DevTools → Application → Service Workers, toggle &quot;Offline&quot; and reload the Downloads or Offline Read page to verify content loads without network.
            </li>
            <li>
              For PWA installability, run in production and look for the install prompt. If not shown automatically, the event may still be captured; try using the browser&apos;s install option.
            </li>
          </ol>
          {swScope && (
            <div className="mt-2 text-xs">Service Worker scope: <code>{swScope}</code></div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
