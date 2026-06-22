"use client";

import { useRouter } from "next/navigation";
import { LogOut, Mail, Phone, MapPin, Target, WifiOff } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { OfficerStatusBadge } from "@/components/shared/status-badge";
import { useAppStore } from "@/lib/store";
import { useAuthStore } from "@/lib/auth-store";
import { formatDateTime, timeSince } from "@/lib/utils";

export function ProfileTab() {
  const router = useRouter();
  const officers = useAppStore((s) => s.officers);
  const currentFieldOfficerId = useAppStore((s) => s.currentFieldOfficerId);
  const offlineMode = useAppStore((s) => s.offlineMode);
  const toggleOfflineMode = useAppStore((s) => s.toggleOfflineMode);
  const logout = useAuthStore((s) => s.logout);

  const officer = officers.find((o) => o.id === currentFieldOfficerId);
  if (!officer) return null;

  return (
    <div className="space-y-4">
      <p className="text-sm font-semibold text-foreground">My Profile</p>

      <Card>
        <CardContent className="flex items-center gap-3 p-4">
          <div className="flex size-14 items-center justify-center rounded-full bg-brand-tint text-lg font-semibold text-secondary">
            {officer.initials}
          </div>
          <div>
            <p className="text-base font-semibold text-foreground">{officer.name}</p>
            <OfficerStatusBadge status={officer.status} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-3 p-4 text-sm">
          <div className="flex items-center gap-2.5">
            <MapPin className="size-4 text-muted-foreground" />
            <span className="text-foreground">{officer.region}</span>
          </div>
          <div className="flex items-center gap-2.5">
            <Phone className="size-4 text-muted-foreground" />
            <span className="text-foreground">{officer.phone}</span>
          </div>
          <div className="flex items-center gap-2.5">
            <Mail className="size-4 text-muted-foreground" />
            <span className="text-foreground">{officer.email}</span>
          </div>
          <div className="flex items-center gap-2.5">
            <Target className="size-4 text-muted-foreground" />
            <span className="text-foreground">{officer.dailyTarget} sites / day target</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 text-xs text-muted-foreground">
          Last check-in: {formatDateTime(officer.lastCheckIn)} ({timeSince(officer.lastCheckIn)})
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex items-center justify-between p-4">
          <div className="flex items-center gap-2">
            <WifiOff className="size-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium text-foreground">Simulate Offline</p>
              <p className="text-xs text-muted-foreground">Queue actions locally until back online</p>
            </div>
          </div>
          <Switch checked={offlineMode} onCheckedChange={toggleOfflineMode} />
        </CardContent>
      </Card>

      <button
        onClick={() => {
          logout();
          router.push("/login");
        }}
        className="flex w-full items-center justify-center gap-1.5 rounded-md border border-destructive/30 bg-destructive/5 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/10"
      >
        <LogOut className="size-4" /> Sign Out
      </button>
    </div>
  );
}
