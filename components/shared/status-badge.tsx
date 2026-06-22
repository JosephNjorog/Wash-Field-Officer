import { cn } from "@/lib/utils";
import type { AssetStatus, ComplaintStatus, OfficerStatus } from "@/lib/types";
import {
  ASSET_STATUS_LABELS,
  COMPLAINT_STATUS_LABELS,
  OFFICER_STATUS_COLORS,
  COMPLAINT_STATUS_COLORS,
} from "@/lib/utils";

const ASSET_STATUS_BADGE: Record<AssetStatus, string> = {
  functional: "bg-success/10 text-success border-success/30",
  "needs-repair": "bg-warning/10 text-warning border-warning/30",
  "non-functional": "bg-destructive/10 text-destructive border-destructive/30",
  decommissioned: "bg-muted text-muted-foreground border-border",
};

export function AssetStatusBadge({ status }: { status: AssetStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
        ASSET_STATUS_BADGE[status]
      )}
    >
      {ASSET_STATUS_LABELS[status]}
    </span>
  );
}

export function OfficerStatusBadge({ status }: { status: OfficerStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
        OFFICER_STATUS_COLORS[status]
      )}
    >
      {status}
    </span>
  );
}

export function ComplaintStatusBadge({ status }: { status: ComplaintStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
        COMPLAINT_STATUS_COLORS[status]
      )}
    >
      {COMPLAINT_STATUS_LABELS[status]}
    </span>
  );
}
