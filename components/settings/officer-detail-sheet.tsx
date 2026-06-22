"use client";

import { useState } from "react";
import { toast } from "sonner";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Pencil, UserX, UserCheck } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { OfficerStatusBadge, AssetStatusBadge, ComplaintStatusBadge } from "@/components/shared/status-badge";
import { useAppStore } from "@/lib/store";
import type { Officer } from "@/lib/types";
import { ASSET_TYPE_LABELS, formatDate, formatDateTime, timeSince } from "@/lib/utils";

export function OfficerDetailSheet({
  officer,
  onClose,
  onEdit,
}: {
  officer: Officer | null;
  onClose: () => void;
  onEdit: () => void;
}) {
  const assets = useAppStore((s) => s.assets);
  const inspections = useAppStore((s) => s.inspections);
  const complaints = useAppStore((s) => s.complaints);
  const dailySummaries = useAppStore((s) => s.dailySummaries);
  const updateOfficer = useAppStore((s) => s.updateOfficer);
  const [togglingStatus, setTogglingStatus] = useState(false);

  if (!officer) return null;

  const isInactive = officer.status === "Inactive";

  async function handleToggleActive() {
    setTogglingStatus(true);
    try {
      await updateOfficer(officer!.id, { status: isInactive ? "Active" : "Inactive" });
      toast.success(isInactive ? `${officer!.name} reactivated` : `${officer!.name} deactivated`);
    } catch (err) {
      toast.error("Failed to update officer status", {
        description: err instanceof Error ? err.message : undefined,
      });
    } finally {
      setTogglingStatus(false);
    }
  }

  const assignedAssets = assets.filter((a) => a.assignedOfficerId === officer.id);
  const officerInspections = inspections
    .filter((i) => i.officerId === officer.id)
    .sort((a, b) => (a.formData.submitted_at < b.formData.submitted_at ? 1 : -1));
  const officerComplaints = complaints.filter((c) => c.assignedOfficerId === officer.id);
  const last7 = dailySummaries
    .filter((d) => d.officerId === officer.id)
    .sort((a, b) => (a.date < b.date ? -1 : 1))
    .slice(-7)
    .map((d) => ({
      day: new Date(d.date).toLocaleDateString("en-KE", { weekday: "short" }),
      reports: d.reports_submitted,
      sites: d.sites_visited,
    }));

  const totalReports = officerInspections.length;
  const resolvedComplaints = officerComplaints.filter((c) => c.status === "resolved").length;

  return (
    <Sheet open={!!officer} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between gap-2 pr-6">
            <span className="flex items-center gap-2">
              <span className="flex size-9 items-center justify-center rounded-full bg-brand-tint text-sm font-semibold text-secondary">
                {officer.initials}
              </span>
              {officer.name}
            </span>
            <span className="flex gap-2">
              <Button size="sm" variant="outline" className="gap-1.5" onClick={onEdit}>
                <Pencil className="size-3.5" /> Edit
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5"
                disabled={togglingStatus}
                onClick={handleToggleActive}
              >
                {isInactive ? (
                  <>
                    <UserCheck className="size-3.5" /> Reactivate
                  </>
                ) : (
                  <>
                    <UserX className="size-3.5" /> Deactivate
                  </>
                )}
              </Button>
            </span>
          </SheetTitle>
        </SheetHeader>

        <div className="mt-4 space-y-5">
          <div className="flex items-center gap-2">
            <OfficerStatusBadge status={officer.status} />
            <span className="text-sm text-muted-foreground">{officer.region}</span>
          </div>

          <div className="grid grid-cols-3 gap-3 text-sm">
            <div className="rounded-md bg-muted p-3 text-center">
              <p className="text-lg font-bold text-foreground">{assignedAssets.length}</p>
              <p className="text-xs text-muted-foreground">Assigned Sites</p>
            </div>
            <div className="rounded-md bg-muted p-3 text-center">
              <p className="text-lg font-bold text-foreground">{totalReports}</p>
              <p className="text-xs text-muted-foreground">Total Reports</p>
            </div>
            <div className="rounded-md bg-muted p-3 text-center">
              <p className="text-lg font-bold text-foreground">{resolvedComplaints}</p>
              <p className="text-xs text-muted-foreground">Resolved Complaints</p>
            </div>
          </div>

          <div className="space-y-1.5 text-sm">
            <p className="text-xs font-semibold uppercase text-muted-foreground">Contact</p>
            <p className="text-foreground">{officer.phone}</p>
            <p className="text-foreground">{officer.email}</p>
            <p className="text-muted-foreground">
              Daily target: {officer.dailyTarget} sites · Last check-in{" "}
              {formatDateTime(officer.lastCheckIn)} ({timeSince(officer.lastCheckIn)})
            </p>
          </div>

          <Card>
            <CardContent className="h-[160px] p-3">
              <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
                Last 7 Days Activity
              </p>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={last7}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} width={20} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="reports" fill="#2E6DB4" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
              Assigned Sites ({assignedAssets.length})
            </p>
            <div className="space-y-2">
              {assignedAssets.map((asset) => (
                <div
                  key={asset.id}
                  className="flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm"
                >
                  <div>
                    <p className="font-medium text-foreground">{asset.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {ASSET_TYPE_LABELS[asset.type]} · Last inspected {formatDate(asset.lastInspected)}
                    </p>
                  </div>
                  <AssetStatusBadge status={asset.status} />
                </div>
              ))}
              {assignedAssets.length === 0 && (
                <p className="text-sm text-muted-foreground">No sites assigned.</p>
              )}
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
              Recent Inspections
            </p>
            <div className="space-y-2">
              {officerInspections.slice(0, 5).map((insp) => {
                const asset = assets.find((a) => a.id === insp.assetId);
                return (
                  <div
                    key={insp.id}
                    className="flex items-center justify-between rounded-md bg-muted px-3 py-2 text-sm"
                  >
                    <span>{asset?.name ?? insp.assetId}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatDateTime(insp.formData.submitted_at)}
                    </span>
                  </div>
                );
              })}
              {officerInspections.length === 0 && (
                <p className="text-sm text-muted-foreground">No inspections submitted yet.</p>
              )}
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
              Assigned Complaints
            </p>
            <div className="space-y-2">
              {officerComplaints.slice(0, 5).map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm"
                >
                  <div>
                    <p className="font-medium text-foreground">{c.category}</p>
                    <p className="text-xs text-muted-foreground">{c.address}</p>
                  </div>
                  <ComplaintStatusBadge status={c.status} />
                </div>
              ))}
              {officerComplaints.length === 0 && (
                <p className="text-sm text-muted-foreground">No complaints assigned.</p>
              )}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
