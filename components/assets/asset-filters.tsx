"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ASSET_TYPE_LABELS, ASSET_STATUS_LABELS } from "@/lib/utils";
import type { AssetType, AssetStatus } from "@/lib/types";

export interface AssetFilterState {
  type: AssetType | "all";
  status: AssetStatus | "all";
  region: string;
  from: string;
  to: string;
}

export function AssetFilters({
  filters,
  onChange,
  regions,
}: {
  filters: AssetFilterState;
  onChange: (filters: AssetFilterState) => void;
  regions: string[];
}) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
      <div className="space-y-1">
        <Label className="text-xs">Type</Label>
        <Select
          value={filters.type}
          onValueChange={(v) => onChange({ ...filters, type: v as AssetFilterState["type"] })}
        >
          <SelectTrigger className="h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {Object.entries(ASSET_TYPE_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1">
        <Label className="text-xs">Status</Label>
        <Select
          value={filters.status}
          onValueChange={(v) => onChange({ ...filters, status: v as AssetFilterState["status"] })}
        >
          <SelectTrigger className="h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {Object.entries(ASSET_STATUS_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1">
        <Label className="text-xs">Region</Label>
        <Select value={filters.region} onValueChange={(v) => onChange({ ...filters, region: v })}>
          <SelectTrigger className="h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Regions</SelectItem>
            {regions.map((region) => (
              <SelectItem key={region} value={region}>
                {region}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1">
        <Label className="text-xs">Inspected From</Label>
        <Input
          type="date"
          className="h-9"
          value={filters.from}
          onChange={(e) => onChange({ ...filters, from: e.target.value })}
        />
      </div>
      <div className="space-y-1">
        <Label className="text-xs">Inspected To</Label>
        <Input
          type="date"
          className="h-9"
          value={filters.to}
          onChange={(e) => onChange({ ...filters, to: e.target.value })}
        />
      </div>
    </div>
  );
}
