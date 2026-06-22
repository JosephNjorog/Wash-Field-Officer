"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useAppStore } from "@/lib/store";
import { initials } from "@/lib/utils";

export default function SettingsPage() {
  const supervisorProfile = useAppStore((s) => s.supervisorProfile);
  const systemPreferences = useAppStore((s) => s.systemPreferences);
  const loadSettings = useAppStore((s) => s.loadSettings);
  const updateSupervisorProfile = useAppStore((s) => s.updateSupervisorProfile);
  const updateSystemPreferences = useAppStore((s) => s.updateSystemPreferences);

  const [name, setName] = useState(supervisorProfile.name);
  const [email, setEmail] = useState(supervisorProfile.email);
  const [emailNotifs, setEmailNotifs] = useState(systemPreferences.emailNotifications);
  const [smsAlerts, setSmsAlerts] = useState(systemPreferences.smsAlerts);
  const [autoSync, setAutoSync] = useState(systemPreferences.autoSync);
  const [dailyTarget, setDailyTarget] = useState(systemPreferences.defaultDailyTarget);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPrefs, setSavingPrefs] = useState(false);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  useEffect(() => {
    setName(supervisorProfile.name);
    setEmail(supervisorProfile.email);
  }, [supervisorProfile]);

  useEffect(() => {
    setEmailNotifs(systemPreferences.emailNotifications);
    setSmsAlerts(systemPreferences.smsAlerts);
    setAutoSync(systemPreferences.autoSync);
    setDailyTarget(systemPreferences.defaultDailyTarget);
  }, [systemPreferences]);

  async function handleSaveProfile() {
    setSavingProfile(true);
    try {
      await updateSupervisorProfile({ name, email });
      toast.success("Profile updated");
    } catch (err) {
      toast.error("Failed to update profile", {
        description: err instanceof Error ? err.message : undefined,
      });
    } finally {
      setSavingProfile(false);
    }
  }

  async function handleSavePreferences() {
    setSavingPrefs(true);
    try {
      await updateSystemPreferences({
        emailNotifications: emailNotifs,
        smsAlerts,
        autoSync,
        defaultDailyTarget: dailyTarget,
      });
      toast.success("Preferences saved");
    } catch (err) {
      toast.error("Failed to save preferences", {
        description: err instanceof Error ? err.message : undefined,
      });
    } finally {
      setSavingPrefs(false);
    }
  }

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
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Role</Label>
              <Input defaultValue="Supervisor" disabled />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Email</Label>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
          </div>
          <Button onClick={handleSaveProfile} disabled={savingProfile}>
            {savingProfile ? "Saving..." : "Save Profile"}
          </Button>
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
          <Button onClick={handleSavePreferences} disabled={savingPrefs}>
            {savingPrefs ? "Saving..." : "Save Preferences"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
