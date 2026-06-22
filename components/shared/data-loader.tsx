"use client";

import { useEffect } from "react";
import { useAppStore } from "@/lib/store";

export function DataLoader() {
  const loaded = useAppStore((s) => s.loaded);
  const loading = useAppStore((s) => s.loading);
  const loadAll = useAppStore((s) => s.loadAll);

  useEffect(() => {
    if (!loaded && !loading) loadAll();
  }, [loaded, loading, loadAll]);

  return null;
}
