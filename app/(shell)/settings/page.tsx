"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { UserPlus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { OfficerStatusBadge } from "@/components/shared/status-badge";
import { OfficerEditDialog } from "@/components/settings/officer-edit-dialog";
import { OfficerAddDialog } from "@/components/settings/officer-add-dialog";
import { OfficerDetailSheet } from "@/components/settings/officer-detail-sheet";
import { useAppStore } from "@/lib/store";
import { useAuthStore } from "@/lib/auth-store";
import { initials } from "@/lib/utils";
import type { Officer } from "@/lib/types";

export default function SettingsPage() {
  const officers = useAppStore((s) => s.officers);
  const session = useAuthStore((s) => s.session);
  const searchParams = useSearchParams();
  const name = session?.name || "Supervisor";
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [autoSync, setAutoSync] = useState(true);
  const [dailyTarget, setDailyTarget] = useState(6);

  const [detailOfficer, setDetailOfficer] = useState<Officer | null>(null);
  const [editOfficer, setEditOfficer] = useState<Officer | null>(null);
  const [addOpen, setAddOpen] = useState(false);

  useEffect(() => {
    const officerParam = searchParams.get("officer");
    if (officerParam) {
      const match = officers.find((o) => o.id === officerParam);
      if (match) setDetailOfficer(match);
    }
  }, [searchParams, officers]);

  const activeCount = officers.filter((o) => o.status === "Active").length;
  const overdueCount = officers.filter((o) => o.status === "Overdue").length;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Profile</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap items-end gap-4">
          <div className="flex size-16 items-center justify-center rounded-full bg-primary text-xl font-semibold text-primary-foreground">
            {initials(name)}
          </div>
          <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Full Name</Label>
              <Input defaultValue={name} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Role</Label>
              <Input defaultValue="Supervisor" disabled />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Email</Label>
              <Input defaultValue="james.kariuki@fieldwatch.go.ke" />
            </div>
          </div>
          <Button onClick={() => toast.success("Profile updated")}>Save Profile</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-base">Field Officer Management</CardTitle>
            <p className="mt-1 text-xs text-muted-foreground">
              {officers.length} officers · {activeCount} active · {overdueCount} overdue
            </p>
          </div>
          <Button size="sm" className="gap-1.5" onClick={() => setAddOpen(true)}>
            <UserPlus className="size-4" /> Add Officer
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Officer</TableHead>
                <TableHead>Region</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {officers.map((officer) => (
                <TableRow
                  key={officer.id}
                  className="cursor-pointer"
                  onClick={() => setDetailOfficer(officer)}
                >
                  <TableCell className="font-medium">{officer.name}</TableCell>
                  <TableCell className="text-sm">{officer.region}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{officer.phone}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{officer.email}</TableCell>
                  <TableCell>
                    <OfficerStatusBadge status={officer.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditOfficer(officer);
                      }}
                    >
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">System Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-md border border-border px-4 py-3">
            <div>
              <p className="text-sm font-medium">Email Notifications</p>
              <p className="text-xs text-muted-foreground">
                Receive daily summary emails of field activity.
              </p>
            </div>
            <Switch checked={emailNotifs} onCheckedChange={setEmailNotifs} />
          </div>
          <div className="flex items-center justify-between rounded-md border border-border px-4 py-3">
            <div>
              <p className="text-sm font-medium">SMS Alerts to Officers</p>
              <p className="text-xs text-muted-foreground">
                Notify field officers via SMS for new complaint assignments.
              </p>
            </div>
            <Switch checked={smsAlerts} onCheckedChange={setSmsAlerts} />
          </div>
          <div className="flex items-center justify-between rounded-md border border-border px-4 py-3">
            <div>
              <p className="text-sm font-medium">Auto-Sync When Online</p>
              <p className="text-xs text-muted-foreground">
                Automatically sync queued reports once connectivity is restored.
              </p>
            </div>
            <Switch checked={autoSync} onCheckedChange={setAutoSync} />
          </div>
          <div className="flex items-center justify-between rounded-md border border-border px-4 py-3">
            <div>
              <p className="text-sm font-medium">Default Daily Site Target</p>
              <p className="text-xs text-muted-foreground">
                Number of sites each officer is expected to visit per day.
              </p>
            </div>
            <Input
              type="number"
              className="w-20"
              value={dailyTarget}
              onChange={(e) => setDailyTarget(Number(e.target.value))}
            />
          </div>
          <Button onClick={() => toast.success("Preferences saved")}>Save Preferences</Button>
        </CardContent>
      </Card>

      <OfficerDetailSheet
        officer={detailOfficer}
        onClose={() => setDetailOfficer(null)}
        onEdit={() => {
          if (detailOfficer) setEditOfficer(detailOfficer);
        }}
      />
      <OfficerEditDialog
        officer={editOfficer}
        open={!!editOfficer}
        onOpenChange={(open) => !open && setEditOfficer(null)}
      />
      <OfficerAddDialog open={addOpen} onOpenChange={setAddOpen} />
    </div>
  );
}
