"use client";

import { OfflineDownloads } from "@/components/offline-downloads";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download } from "lucide-react";

export default function DownloadsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
            <Download className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Offline Downloads</h1>
            <p className="text-muted-foreground">
              Manage your downloaded chapters for offline reading
            </p>
          </div>
        </div>
      </div>

      <OfflineDownloads />
    </div>
  );
}
