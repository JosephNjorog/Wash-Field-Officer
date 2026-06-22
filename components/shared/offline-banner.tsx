"use client";

import { WifiOff } from "lucide-react";
import { useAppStore } from "@/lib/store";

export function OfflineBanner() {
  const offlineMode = useAppStore((s) => s.offlineMode);
  const pendingCount = useAppStore(
    (s) => s.pendingSync.filter((p) => p.status !== "synced").length
  );

  if (!offlineMode) return null;

  return (
    <div className="flex items-center gap-2 bg-destructive px-6 py-2 text-sm font-medium text-destructive-foreground">
      <WifiOff className="size-4" />
      You are offline. {pendingCount} report{pendingCount === 1 ? "" : "s"} queued for sync.
    </div>
  );
}
