"use client";

import { Sidebar } from "@/components/shared/sidebar";
import { Header } from "@/components/shared/header";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { OfflineBanner } from "@/components/shared/offline-banner";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppStore } from "@/lib/store";

export default function ShellLayout({ children }: { children: React.ReactNode }) {
  const loaded = useAppStore((s) => s.loaded);
  const loadError = useAppStore((s) => s.loadError);

  return (
    <div className="flex h-screen overflow-hidden bg-brand-surface">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <OfflineBanner />
        <Breadcrumbs />
        <main className="flex-1 overflow-y-auto p-6">
          {loadError ? (
            <p className="text-sm text-destructive">Failed to load data: {loadError}</p>
          ) : !loaded ? (
            <div className="space-y-4">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-48 w-full" />
            </div>
          ) : (
            children
          )}
        </main>
      </div>
    </div>
  );
}
