"use client";

import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AssetStatusBadge } from "@/components/shared/status-badge";
import { AssetMapClient } from "@/components/maps/asset-map-client";
import { AssetFilters, type AssetFilterState } from "@/components/assets/asset-filters";
import { AssetDetailPanel } from "@/components/assets/asset-detail-panel";
import { useAppStore } from "@/lib/store";
import { ASSET_TYPE_LABELS, cn, formatDate } from "@/lib/utils";
import { Droplet, Waves, GitBranch, ShowerHead } from "lucide-react";
import type { Asset, AssetType } from "@/lib/types";

const TYPE_ICON: Record<AssetType, typeof Droplet> = {
  water_kiosk: Droplet,
  borehole: Waves,
  pipeline: GitBranch,
  sanitation_block: ShowerHead,
};

export default function AssetsPage() {
  const assets = useAppStore((s) => s.assets);
  const officers = useAppStore((s) => s.officers);
  const inspections = useAppStore((s) => s.inspections);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filters, setFilters] = useState<AssetFilterState>({
    type: "all",
    status: "all",
    region: "all",
    from: "",
    to: "",
  });

  const regions = useMemo(
    () => Array.from(new Set(assets.map((a) => a.region))).sort(),
    [assets]
  );

  const filteredAssets = useMemo(() => {
    return assets.filter((a) => {
      if (filters.type !== "all" && a.type !== filters.type) return false;
      if (filters.status !== "all" && a.status !== filters.status) return false;
      if (filters.region !== "all" && a.region !== filters.region) return false;
      if (filters.from && a.lastInspected < filters.from) return false;
      if (filters.to && a.lastInspected > filters.to + "T23:59:59") return false;
      return true;
    });
  }, [assets, filters]);

  const selectedAsset = assets.find((a) => a.id === selectedId) ?? null;
  const selectedOfficer = officers.find((o) => o.id === selectedAsset?.assignedOfficerId);

  function handleSelect(asset: Asset) {
    setSelectedId(asset.id);
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4">
          <AssetFilters filters={filters} onChange={setFilters} regions={regions} />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-2">
          <CardContent className="max-h-[600px] overflow-y-auto p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Asset</TableHead>
                  <TableHead>Region</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Last Inspected</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAssets.map((asset) => {
                  const Icon = TYPE_ICON[asset.type];
                  return (
                    <TableRow
                      key={asset.id}
                      onClick={() => handleSelect(asset)}
                      className={cn(
                        "cursor-pointer",
                        selectedId === asset.id && "bg-brand-tint"
                      )}
                    >
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Icon className="size-4 shrink-0 text-secondary" />
                          <div>
                            <p className="font-medium leading-tight">{asset.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {asset.id} · {ASSET_TYPE_LABELS[asset.type]}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{asset.region}</TableCell>
                      <TableCell>
                        <AssetStatusBadge status={asset.status} />
                      </TableCell>
                      <TableCell className="text-sm font-medium">
                        {asset.conditionScore}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                        {formatDate(asset.lastInspected)}
                      </TableCell>
                    </TableRow>
                  );
                })}
                {filteredAssets.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="py-8 text-center text-sm text-muted-foreground">
                      No assets match the selected filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="space-y-4 lg:col-span-3">
          <Card>
            <CardContent className="p-3">
              <AssetMapClient
                assets={filteredAssets}
                selectedAssetId={selectedId}
                onAssetSelect={handleSelect}
                height={420}
                zoom={6.2}
              />
            </CardContent>
          </Card>
          {selectedAsset && (
            <AssetDetailPanel
              asset={selectedAsset}
              inspections={inspections}
              officer={selectedOfficer}
              onClose={() => setSelectedId(null)}
            />
          )}
        </div>
      </div>
    </div>
  );
}
