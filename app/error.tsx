"use client";

import { useEffect } from "react";
import { AlertTriangle, Droplets, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-brand-surface px-6 text-center">
      <div className="flex size-14 items-center justify-center rounded-xl bg-brand-primary text-white">
        <Droplets className="size-7" />
      </div>
      <div className="mt-6 flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <AlertTriangle className="size-6" />
      </div>
      <h1 className="mt-4 text-xl font-semibold text-foreground">Something went wrong</h1>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        FieldWatch hit an unexpected error. You can try again, or head back to the dashboard.
      </p>
      <div className="mt-6 flex gap-3">
        <Button variant="outline" onClick={() => (window.location.href = "/")}>
          Go Home
        </Button>
        <Button className="gap-1.5" onClick={() => reset()}>
          <RotateCcw className="size-4" /> Try Again
        </Button>
      </div>
      {error.digest && (
        <p className="mt-6 text-xs text-muted-foreground">Error reference: {error.digest}</p>
      )}
    </div>
  );
}
