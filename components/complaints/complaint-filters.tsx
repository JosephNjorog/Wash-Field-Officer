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
import type { ComplaintCategory, Officer } from "@/lib/types";

export interface ComplaintFilterState {
  category: ComplaintCategory | "all";
  officerId: string;
  region: string;
  from: string;
}

const CATEGORIES: ComplaintCategory[] = [
  "No Water",
  "Low Pressure",
  "Dirty Water",
  "Broken Kiosk",
  "Sanitation Issue",
];

export function ComplaintFilters({
  filters,
  onChange,
  officers,
  regions,
}: {
  filters: ComplaintFilterState;
  onChange: (filters: ComplaintFilterState) => void;
  officers: Officer[];
  regions: string[];
}) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <div className="space-y-1">
        <Label className="text-xs">Category</Label>
        <Select
          value={filters.category}
          onValueChange={(v) => onChange({ ...filters, category: v as ComplaintFilterState["category"] })}
        >
          <SelectTrigger className="h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1">
        <Label className="text-xs">Officer</Label>
        <Select value={filters.officerId} onValueChange={(v) => onChange({ ...filters, officerId: v })}>
          <SelectTrigger className="h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Officers</SelectItem>
            {officers.map((o) => (
              <SelectItem key={o.id} value={o.id}>
                {o.name}
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
            {regions.map((r) => (
              <SelectItem key={r} value={r}>
                {r}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1">
        <Label className="text-xs">Reported From</Label>
        <Input
          type="date"
          className="h-9"
          value={filters.from}
          onChange={(e) => onChange({ ...filters, from: e.target.value })}
        />
      </div>
    </div>
  );
}
