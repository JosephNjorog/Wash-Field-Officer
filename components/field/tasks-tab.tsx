"use client";

import { useState } from "react";
import { Droplet, Waves, GitBranch, ShowerHead, MapPin, Check, List, Map as MapIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AssetMapClient } from "@/components/maps/asset-map-client";
import { useAppStore } from "@/lib/store";
import type { Asset, AssetType, FieldSiteTask } from "@/lib/types";
import { cn, formatDate, pseudoDistanceKm } from "@/lib/utils";

const TYPE_ICON: Record<AssetType, typeof Droplet> = {
  water_kiosk: Droplet,
  borehole: Waves,
  pipeline: GitBranch,
  sanitation_block: ShowerHead,
};

const STATUS_STYLES: Record<FieldSiteTask["status"], string> = {
  Pending: "bg-muted text-muted-foreground border-border",
  "Checked In": "bg-secondary/10 text-secondary border-secondary/30",
  Inspected: "bg-warning/10 text-warning border-warning/30",
  Done: "bg-success/10 text-success border-success/30",
};

export function TasksTab() {
  const assets = useAppStore((s) => s.assets);
  const fieldTasks = useAppStore((s) => s.fieldTasks);
  const checkInSite = useAppStore((s) => s.checkInSite);
  const [view, setView] = useState<"list" | "map">("list");

  const taskAssets: { asset: Asset; task: FieldSiteTask }[] = Object.values(fieldTasks)
    .map((task) => {
      const asset = assets.find((a) => a.id === task.assetId);
      return asset ? { asset, task } : null;
    })
    .filter((v): v is { asset: Asset; task: FieldSiteTask } => v !== null);

  const mapCenter: [number, number] | undefined = taskAssets.length
    ? [taskAssets[0].asset.lat, taskAssets[0].asset.lng]
    : undefined;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-foreground">My Assigned Sites</p>
        <div className="flex items-center gap-1 rounded-md bg-muted p-1">
          <button
            onClick={() => setView("list")}
            className={cn(
              "flex size-7 items-center justify-center rounded-sm",
              view === "list" ? "bg-white shadow-sm text-secondary" : "text-muted-foreground"
            )}
          >
            <List className="size-3.5" />
          </button>
          <button
            onClick={() => setView("map")}
            className={cn(
              "flex size-7 items-center justify-center rounded-sm",
              view === "map" ? "bg-white shadow-sm text-secondary" : "text-muted-foreground"
            )}
          >
            <MapIcon className="size-3.5" />
          </button>
        </div>
      </div>

      {view === "map" ? (
        <AssetMapClient
          assets={taskAssets.map((t) => t.asset)}
          height={320}
          zoom={12}
          center={mapCenter}
        />
      ) : (
        <>
          {taskAssets.map(({ asset, task }) => {
            const Icon = TYPE_ICON[asset.type];
            return (
              <Card key={asset.id}>
                <CardContent className="space-y-3 p-3.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2.5">
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-tint text-secondary">
                        <Icon className="size-4.5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold leading-tight text-foreground">
                          {asset.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {pseudoDistanceKm(asset.id)} km away · Last visit {formatDate(asset.lastInspected)}
                        </p>
                      </div>
                    </div>
                    <span
                      className={cn(
                        "shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-medium",
                        STATUS_STYLES[task.status]
                      )}
                    >
                      {task.status}
                    </span>
                  </div>
                  {task.status === "Pending" ? (
                    <Button size="sm" className="w-full gap-1.5" onClick={() => checkInSite(asset.id)}>
                      <MapPin className="size-3.5" /> Check In
                    </Button>
                  ) : task.checkInAt ? (
                    <p className="flex items-center gap-1 text-xs text-success">
                      <Check className="size-3.5" /> Checked in
                    </p>
                  ) : null}
                </CardContent>
              </Card>
            );
          })}
          {taskAssets.length === 0 && (
            <p className="text-sm text-muted-foreground">No sites assigned currently.</p>
          )}
        </>
      )}
    </div>
  );
}
