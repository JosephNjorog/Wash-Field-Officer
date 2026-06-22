"use client";

import { useMemo, useState } from "react";
import { ReportFilters, type ReportFilterState } from "@/components/reports/report-filters";
import { ReportPreview } from "@/components/reports/report-preview";
import { useAppStore } from "@/lib/store";
import { ASSET_STATUS_COLORS, ASSET_STATUS_LABELS, ASSET_TYPE_LABELS, formatDate } from "@/lib/utils";
import type { AssetType } from "@/lib/types";

export default function ReportsPage() {
  const officers = useAppStore((s) => s.officers);
  const assets = useAppStore((s) => s.assets);
  const inspections = useAppStore((s) => s.inspections);
  const complaints = useAppStore((s) => s.complaints);

  const regionOptions = useMemo(
    () => Array.from(new Set(assets.map((a) => a.region))).sort(),
    [assets]
  );
  const officerOptions = useMemo(() => officers.map((o) => o.name), [officers]);

  const [filters, setFilters] = useState<ReportFilterState>({
    reportType: "Officer Performance",
    from: "",
    to: "",
    regions: [],
    officers: [],
    assetTypes: [],
  });

  const selectedAssetTypeKeys = filters.assetTypes
    .map((label) => Object.entries(ASSET_TYPE_LABELS).find(([, v]) => v === label)?.[0])
    .filter((v): v is AssetType => !!v);

  const filteredAssets = assets.filter((a) => {
    if (filters.regions.length && !filters.regions.includes(a.region)) return false;
    if (selectedAssetTypeKeys.length && !selectedAssetTypeKeys.includes(a.type)) return false;
    return true;
  });

  const filteredOfficers = officers.filter((o) => {
    if (filters.officers.length && !filters.officers.includes(o.name)) return false;
    if (filters.regions.length && !filters.regions.includes(o.region)) return false;
    return true;
  });

  const filteredInspections = inspections.filter((i) => {
    if (filters.from && i.formData.submitted_at < filters.from) return false;
    if (filters.to && i.formData.submitted_at > filters.to + "T23:59:59") return false;
    const officer = officers.find((o) => o.id === i.officerId);
    if (filters.officers.length && officer && !filters.officers.includes(officer.name)) return false;
    return true;
  });

  const filteredComplaints = complaints.filter((c) => {
    if (filters.from && c.createdAt < filters.from) return false;
    if (filters.to && c.createdAt > filters.to + "T23:59:59") return false;
    if (filters.regions.length && !filters.regions.includes(c.region)) return false;
    return true;
  });

  const officerInspectionCounts = filteredOfficers.map((officer) => ({
    name: officer.name.split(" ")[0],
    count: filteredInspections.filter((i) => i.officerId === officer.id).length,
  }));

  const complaintsByDate = new Map<string, number>();
  filteredComplaints.forEach((c) => {
    const day = formatDate(c.createdAt, { year: undefined });
    complaintsByDate.set(day, (complaintsByDate.get(day) ?? 0) + 1);
  });
  const complaintVolume = Array.from(complaintsByDate.entries())
    .map(([date, count]) => ({ date, count }))
    .slice(-14);

  const assetConditionBreakdown = (["functional", "needs-repair", "non-functional"] as const).map(
    (status) => ({
      name: ASSET_STATUS_LABELS[status],
      value: filteredAssets.filter((a) => a.status === status).length,
      color: ASSET_STATUS_COLORS[status],
    })
  );

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="lg:col-span-1">
        <ReportFilters
          filters={filters}
          onChange={setFilters}
          regionOptions={regionOptions}
          officerOptions={officerOptions}
        />
      </div>
      <div className="lg:col-span-2">
        <ReportPreview
          reportType={filters.reportType}
          officerInspectionCounts={officerInspectionCounts}
          complaintVolume={complaintVolume}
          assetConditionBreakdown={assetConditionBreakdown}
        />
      </div>
    </div>
  );
}
