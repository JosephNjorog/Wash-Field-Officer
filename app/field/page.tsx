"use client";

import { useState } from "react";
import Link from "next/link";
import { LayoutDashboard, WifiOff, Wifi, CloudUpload } from "lucide-react";
import { MobileFrame, type FieldTab } from "@/components/field/mobile-frame";
import { TasksTab } from "@/components/field/tasks-tab";
import { ReportTab } from "@/components/field/report-tab";
import { ComplaintsTab } from "@/components/field/complaints-tab";
import { ActivityTab } from "@/components/field/activity-tab";
import { Switch } from "@/components/ui/switch";
import {
  useAppStore,
  CURRENT_FIELD_OFFICER_ID,
} from "@/lib/store";
import { todaySummaryFor } from "@/lib/selectors";

export default function FieldPage() {
  const [activeTab, setActiveTab] = useState<FieldTab>("tasks");

  const officers = useAppStore((s) => s.officers);
  const dailySummaries = useAppStore((s) => s.dailySummaries);
  const fieldTasks = useAppStore((s) => s.fieldTasks);
  const complaints = useAppStore((s) => s.complaints);
  const offlineMode = useAppStore((s) => s.offlineMode);
  const toggleOfflineMode = useAppStore((s) => s.toggleOfflineMode);
  const pendingSync = useAppStore((s) => s.pendingSync);

  const officer = officers.find((o) => o.id === CURRENT_FIELD_OFFICER_ID)!;
  const summary = todaySummaryFor(officer.id, dailySummaries);

  const sitesVisited = Object.values(fieldTasks).filter((t) => t.status !== "Pending").length;
  const reportsSubmitted = (summary?.reports_submitted ?? 0);
  const openTasks = complaints.filter(
    (c) => c.assignedOfficerId === officer.id && c.status !== "resolved"
  ).length;

  const pendingCount = pendingSync.filter((p) => p.status !== "synced").length;
  const syncIndicator = offlineMode ? "red" : pendingCount > 0 ? "orange" : "green";

  const today = new Date().toLocaleDateString("en-KE", {
    weekday: "long",
    day: "2-digit",
    month: "short",
  });

  return (
    <div className="relative">
      <Link
        href="/dashboard"
        className="fixed left-4 top-4 z-10 flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-medium text-secondary shadow-md hover:bg-brand-tint"
      >
        <LayoutDashboard className="size-3.5" /> Dashboard View
      </Link>

      <div className="fixed right-4 top-4 z-10 flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-medium shadow-md">
        {offlineMode ? (
          <WifiOff className="size-3.5 text-destructive" />
        ) : (
          <Wifi className="size-3.5 text-success" />
        )}
        <span>Simulate Offline</span>
        <Switch checked={offlineMode} onCheckedChange={toggleOfflineMode} />
      </div>

      <MobileFrame
        activeTab={activeTab}
        onTabChange={setActiveTab}
        topBar={
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold">{officer.name}</p>
              <p className="text-xs text-white/70">{today}</p>
            </div>
            <div className="flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[11px]">
              <span
                className={
                  "size-2 rounded-full " +
                  (syncIndicator === "green"
                    ? "bg-success"
                    : syncIndicator === "orange"
                    ? "bg-warning"
                    : "bg-destructive")
                }
              />
              {syncIndicator === "green" ? "Synced" : syncIndicator === "orange" ? "Pending sync" : "Offline"}
            </div>
          </div>
        }
        quickStats={
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-base font-bold text-foreground">
                {sitesVisited}/{officer.dailyTarget}
              </p>
              <p className="text-[10px] text-muted-foreground">Sites Visited</p>
            </div>
            <div className="border-x border-border">
              <p className="text-base font-bold text-foreground">{reportsSubmitted}</p>
              <p className="text-[10px] text-muted-foreground">Reports</p>
            </div>
            <div>
              <p className="flex items-center justify-center gap-1 text-base font-bold text-foreground">
                {openTasks}
                {pendingCount > 0 && <CloudUpload className="size-3.5 text-warning" />}
              </p>
              <p className="text-[10px] text-muted-foreground">Open Tasks</p>
            </div>
          </div>
        }
      >
        {activeTab === "tasks" && <TasksTab />}
        {activeTab === "report" && <ReportTab />}
        {activeTab === "complaints" && <ComplaintsTab />}
        {activeTab === "activity" && <ActivityTab />}
      </MobileFrame>
    </div>
  );
}
