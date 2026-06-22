"use client";

import { useMemo, useState } from "react";
import { ArrowUpDown } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { OfficerStatusBadge } from "@/components/shared/status-badge";
import type { DailySummary, Officer } from "@/lib/types";
import { formatTime, timeSince } from "@/lib/utils";
import { todaySummaryFor } from "@/lib/selectors";

type SortKey = "name" | "sites" | "reports" | "complaints" | "checkin";

export function OfficerPerformanceTable({
  officers,
  dailySummaries,
}: {
  officers: Officer[];
  dailySummaries: DailySummary[];
}) {
  const [sortKey, setSortKey] = useState<SortKey>("sites");
  const [sortAsc, setSortAsc] = useState(false);

  const rows = useMemo(() => {
    const data = officers.map((officer) => {
      const summary = todaySummaryFor(officer.id, dailySummaries);
      return {
        officer,
        sites: summary?.sites_visited ?? 0,
        reports: summary?.reports_submitted ?? 0,
        complaints: summary?.complaints_handled ?? 0,
      };
    });
    const sorted = [...data].sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "name":
          cmp = a.officer.name.localeCompare(b.officer.name);
          break;
        case "sites":
          cmp = a.sites - b.sites;
          break;
        case "reports":
          cmp = a.reports - b.reports;
          break;
        case "complaints":
          cmp = a.complaints - b.complaints;
          break;
        case "checkin":
          cmp = a.officer.lastCheckIn.localeCompare(b.officer.lastCheckIn);
          break;
      }
      return sortAsc ? cmp : -cmp;
    });
    return sorted;
  }, [officers, dailySummaries, sortKey, sortAsc]);

  function header(label: string, key: SortKey) {
    return (
      <TableHead
        className="cursor-pointer select-none whitespace-nowrap"
        onClick={() => {
          if (sortKey === key) setSortAsc((v) => !v);
          else {
            setSortKey(key);
            setSortAsc(false);
          }
        }}
      >
        <span className="inline-flex items-center gap-1">
          {label}
          <ArrowUpDown className="size-3 text-muted-foreground" />
        </span>
      </TableHead>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-base">Officer Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              {header("Officer", "name")}
              {header("Sites Today", "sites")}
              {header("Reports", "reports")}
              {header("Complaints", "complaints")}
              {header("Last Check-In", "checkin")}
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map(({ officer, sites, reports, complaints }) => (
              <TableRow key={officer.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <div className="flex size-7 items-center justify-center rounded-full bg-brand-tint text-[11px] font-semibold text-secondary">
                      {officer.initials}
                    </div>
                    {officer.name}
                  </div>
                </TableCell>
                <TableCell>{sites}</TableCell>
                <TableCell>{reports}</TableCell>
                <TableCell>{complaints}</TableCell>
                <TableCell className="whitespace-nowrap text-muted-foreground">
                  {formatTime(officer.lastCheckIn)} · {timeSince(officer.lastCheckIn)}
                </TableCell>
                <TableCell>
                  <OfficerStatusBadge status={officer.status} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
