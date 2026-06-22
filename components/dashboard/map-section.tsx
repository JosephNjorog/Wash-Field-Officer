"use client";

import { useMemo, useState } from "react";
import { X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AssetMapClient } from "@/components/maps/asset-map-client";
import type { FlyToTarget } from "@/components/maps/asset-map";
import { AssetStatusBadge, OfficerStatusBadge } from "@/components/shared/status-badge";
import type { Asset, Officer } from "@/lib/types";
import { ASSET_TYPE_LABELS, cn, formatDate, formatDateTime } from "@/lib/utils";

export function MapSection({ assets, officers }: { assets: Asset[]; officers: Officer[] }) {
  const [view, setView] = useState<"asset" | "officer">("asset");
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const [selectedOfficerId, setSelectedOfficerId] = useState<string | null>(null);

  const officerLocations = useMemo(() => {
    return officers
      .map((officer) => {
        const asset = assets.find((a) => a.assignedOfficerId === officer.id);
        if (!asset) return null;
        return { officer, lat: asset.lat + 0.01, lng: asset.lng + 0.01 };
      })
      .filter((v): v is { officer: Officer; lat: number; lng: number } => v !== null);
  }, [assets, officers]);

  const selectedAsset = assets.find((a) => a.id === selectedAssetId) ?? null;
  const selectedOfficerLoc = officerLocations.find((o) => o.officer.id === selectedOfficerId) ?? null;

  const flyTo: FlyToTarget | null = useMemo(() => {
    if (view === "asset" && selectedAsset) {
      return { lat: selectedAsset.lat, lng: selectedAsset.lng, zoom: 15 };
    }
    if (view === "officer" && selectedOfficerLoc) {
      return { lat: selectedOfficerLoc.lat, lng: selectedOfficerLoc.lng, zoom: 14 };
    }
    return null;
  }, [view, selectedAsset, selectedOfficerLoc]);

  function handleViewChange(next: "asset" | "officer") {
    setView(next);
    setSelectedAssetId(null);
    setSelectedOfficerId(null);
  }

  function handleAssetSelect(asset: Asset) {
    setSelectedAssetId(asset.id);
  }

  function handleOfficerSelect(officer: Officer) {
    setSelectedOfficerId(officer.id);
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base">Infrastructure & Activity Map</CardTitle>
        <div className="flex items-center gap-1 rounded-md bg-muted p-1">
          <Button
            size="sm"
            variant="ghost"
            className={cn("h-7 px-3", view === "asset" && "bg-white shadow-sm")}
            onClick={() => handleViewChange("asset")}
          >
            Asset View
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className={cn("h-7 px-3", view === "officer" && "bg-white shadow-sm")}
            onClick={() => handleViewChange("officer")}
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
          selectedAssetId={view === "asset" ? selectedAssetId : null}
          selectedOfficerId={view === "officer" ? selectedOfficerId : null}
          onAssetSelect={handleAssetSelect}
          onOfficerSelect={handleOfficerSelect}
          flyTo={flyTo}
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

        {view === "asset" && selectedAsset && (
          <div className="mt-3 flex items-start justify-between gap-4 rounded-lg border border-border bg-brand-tint/40 p-4">
            <div>
              <p className="text-sm font-semibold text-foreground">{selectedAsset.name}</p>
              <p className="text-xs text-muted-foreground">
                {ASSET_TYPE_LABELS[selectedAsset.type]} · {selectedAsset.region}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Condition {selectedAsset.conditionScore}/100 · Last inspected{" "}
                {formatDate(selectedAsset.lastInspected)}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <AssetStatusBadge status={selectedAsset.status} />
              <button
                onClick={() => setSelectedAssetId(null)}
                aria-label="Close asset details"
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </div>
          </div>
        )}

        {view === "officer" && selectedOfficerLoc && (
          <div className="mt-3 flex items-start justify-between gap-4 rounded-lg border border-border bg-brand-tint/40 p-4">
            <div>
              <p className="text-sm font-semibold text-foreground">
                {selectedOfficerLoc.officer.name}
              </p>
              <p className="text-xs text-muted-foreground">{selectedOfficerLoc.officer.region}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Last check-in {formatDateTime(selectedOfficerLoc.officer.lastCheckIn)}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <OfficerStatusBadge status={selectedOfficerLoc.officer.status} />
              <button
                onClick={() => setSelectedOfficerId(null)}
                aria-label="Close officer details"
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
