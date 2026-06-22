"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AssetMapClient } from "@/components/maps/asset-map-client";
import type { Asset, Officer } from "@/lib/types";
import { cn } from "@/lib/utils";

export function MapSection({ assets, officers }: { assets: Asset[]; officers: Officer[] }) {
  const [view, setView] = useState<"asset" | "officer">("asset");

  const officerLocations = useMemo(() => {
    return officers
      .map((officer) => {
        const asset = assets.find((a) => a.assignedOfficerId === officer.id);
        if (!asset) return null;
        return { officer, lat: asset.lat + 0.01, lng: asset.lng + 0.01 };
      })
      .filter((v): v is { officer: Officer; lat: number; lng: number } => v !== null);
  }, [assets, officers]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base">Infrastructure & Activity Map</CardTitle>
        <div className="flex items-center gap-1 rounded-md bg-muted p-1">
          <Button
            size="sm"
            variant="ghost"
            className={cn("h-7 px-3", view === "asset" && "bg-white shadow-sm")}
            onClick={() => setView("asset")}
          >
            Asset View
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className={cn("h-7 px-3", view === "officer" && "bg-white shadow-sm")}
            onClick={() => setView("officer")}
          >
            Officer Activity
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <AssetMapClient
          assets={assets}
          showOfficers={view === "officer"}
          officerLocations={officerLocations}
        />
        <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-success" /> Functional
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-warning" /> Needs Repair
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-destructive" /> Non-Functional
          </span>
          {view === "officer" && (
            <span className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-full bg-secondary" /> Officer Check-In
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
