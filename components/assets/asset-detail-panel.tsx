"use client";

import { toast } from "sonner";
import { ClipboardPlus, Flag, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AssetStatusBadge } from "@/components/shared/status-badge";
import type { Asset, Inspection, Officer } from "@/lib/types";
import { ASSET_TYPE_LABELS, formatDateTime } from "@/lib/utils";

export function AssetDetailPanel({
  asset,
  inspections,
  officer,
  onClose,
}: {
  asset: Asset;
  inspections: Inspection[];
  officer: Officer | undefined;
  onClose: () => void;
}) {
  const history = inspections
    .filter((i) => i.assetId === asset.id)
    .sort((a, b) => (a.formData.submitted_at < b.formData.submitted_at ? 1 : -1))
    .slice(0, 5);

  return (
    <Card className="border-secondary/30">
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <div>
          <CardTitle className="text-base">{asset.name}</CardTitle>
          <p className="text-xs text-muted-foreground">
            {ASSET_TYPE_LABELS[asset.type]} · {asset.region}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <AssetStatusBadge status={asset.status} />
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="size-4" />
          </button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-3 text-sm">
          <div>
            <p className="text-xs text-muted-foreground">Condition Score</p>
            <p className="font-semibold">{asset.conditionScore}/100</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Assigned Officer</p>
            <p className="font-semibold">{officer?.name ?? "Unassigned"}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Last Inspected</p>
            <p className="font-semibold">{formatDateTime(asset.lastInspected)}</p>
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
            Last 5 Inspections
          </p>
          <div className="space-y-2">
            {history.map((insp) => (
              <div
                key={insp.id}
                className="flex items-center justify-between rounded-md bg-muted px-3 py-2 text-sm"
              >
                <span>{insp.formData.infrastructure_condition} condition</span>
                <span className="text-xs text-muted-foreground">
                  {formatDateTime(insp.formData.submitted_at)}
                </span>
              </div>
            ))}
            {history.length === 0 && (
              <p className="text-sm text-muted-foreground">No inspection history.</p>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5"
            onClick={() => toast.success(`Inspection assigned for ${asset.name}`)}
          >
            <ClipboardPlus className="size-3.5" /> Assign Inspection
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5"
            onClick={() => toast.success(`Issue logged for ${asset.name}`)}
          >
            <Flag className="size-3.5" /> Log Issue
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
