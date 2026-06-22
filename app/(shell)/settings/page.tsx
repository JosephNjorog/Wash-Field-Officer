"use client";

import { useState } from "react";
import { toast } from "sonner";
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
import { useAppStore, CURRENT_SUPERVISOR } from "@/lib/store";

export default function SettingsPage() {
  const officers = useAppStore((s) => s.officers);
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [autoSync, setAutoSync] = useState(true);
  const [dailyTarget, setDailyTarget] = useState(6);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Profile</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap items-end gap-4">
          <div className="flex size-16 items-center justify-center rounded-full bg-primary text-xl font-semibold text-primary-foreground">
            {CURRENT_SUPERVISOR.initials}
          </div>
          <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Full Name</Label>
              <Input defaultValue={CURRENT_SUPERVISOR.name} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Role</Label>
              <Input defaultValue={CURRENT_SUPERVISOR.role} disabled />
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
        <CardHeader>
          <CardTitle className="text-base">Officer Roster</CardTitle>
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
                <TableRow key={officer.id}>
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
                      onClick={() => toast.success(`Editing ${officer.name}`)}
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
    </div>
  );
}
