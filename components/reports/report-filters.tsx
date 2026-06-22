"use client";

import { FileDown, FileSpreadsheet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MultiSelect } from "@/components/reports/multi-select";
import { ASSET_TYPE_LABELS } from "@/lib/utils";

export type ReportType =
  | "Officer Performance"
  | "Infrastructure Status"
  | "Complaint Summary"
  | "Water Quality";

export interface ReportFilterState {
  reportType: ReportType;
  from: string;
  to: string;
  regions: string[];
  officers: string[];
  assetTypes: string[];
}

const REPORT_TYPES: ReportType[] = [
  "Officer Performance",
  "Infrastructure Status",
  "Complaint Summary",
  "Water Quality",
];

export function ReportFilters({
  filters,
  onChange,
  regionOptions,
  officerOptions,
}: {
  filters: ReportFilterState;
  onChange: (filters: ReportFilterState) => void;
  regionOptions: string[];
  officerOptions: string[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Report Filters</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1.5">
          <Label className="text-xs">Report Type</Label>
          <Select
            value={filters.reportType}
            onValueChange={(v) => onChange({ ...filters, reportType: v as ReportType })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {REPORT_TYPES.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1.5">
            <Label className="text-xs">From</Label>
            <Input
              type="date"
              value={filters.from}
              onChange={(e) => onChange({ ...filters, from: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">To</Label>
            <Input
              type="date"
              value={filters.to}
              onChange={(e) => onChange({ ...filters, to: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">Region</Label>
          <MultiSelect
            label="Regions"
            options={regionOptions}
            selected={filters.regions}
            onChange={(v) => onChange({ ...filters, regions: v })}
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">Officers</Label>
          <MultiSelect
            label="Officers"
            options={officerOptions}
            selected={filters.officers}
            onChange={(v) => onChange({ ...filters, officers: v })}
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">Asset Types</Label>
          <MultiSelect
            label="Asset Types"
            options={Object.values(ASSET_TYPE_LABELS)}
            selected={filters.assetTypes}
            onChange={(v) => onChange({ ...filters, assetTypes: v })}
          />
        </div>

        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            className="flex-1 gap-1.5"
            onClick={() => toast.success("Export queued", { description: "PDF report will be ready shortly." })}
          >
            <FileDown className="size-4" /> Export PDF
          </Button>
          <Button
            variant="outline"
            className="flex-1 gap-1.5"
            onClick={() => toast.success("Export queued", { description: "CSV export will be ready shortly." })}
          >
            <FileSpreadsheet className="size-4" /> Export CSV
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
