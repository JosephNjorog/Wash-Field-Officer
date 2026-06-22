"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CloudUpload } from "lucide-react";
import { MobileFrame, type FieldTab } from "@/components/field/mobile-frame";
import { TasksTab } from "@/components/field/tasks-tab";
import { ReportTab } from "@/components/field/report-tab";
import { ComplaintsTab } from "@/components/field/complaints-tab";
import { ActivityTab } from "@/components/field/activity-tab";
import { ProfileTab } from "@/components/field/profile-tab";
import { useAppStore } from "@/lib/store";
import { useAuthStore } from "@/lib/auth-store";
import { todaySummaryFor } from "@/lib/selectors";

export default function FieldPage() {
  const [activeTab, setActiveTab] = useState<FieldTab>("tasks");
  const router = useRouter();

  const officers = useAppStore((s) => s.officers);
  const dailySummaries = useAppStore((s) => s.dailySummaries);
  const fieldTasks = useAppStore((s) => s.fieldTasks);
  const complaints = useAppStore((s) => s.complaints);
  const assets = useAppStore((s) => s.assets);
  const offlineMode = useAppStore((s) => s.offlineMode);
  const pendingSync = useAppStore((s) => s.pendingSync);
  const currentFieldOfficerId = useAppStore((s) => s.currentFieldOfficerId);
  const setCurrentFieldOfficer = useAppStore((s) => s.setCurrentFieldOfficer);
  const loadAll = useAppStore((s) => s.loadAll);

  const session = useAuthStore((s) => s.session);
  const hydrated = useAuthStore((s) => s.hydrated);

  const knownComplaintIds = useRef<Set<string> | null>(null);
  const knownAssetIds = useRef<Set<string> | null>(null);
  const [reportPresetAssetId, setReportPresetAssetId] = useState<string | null>(null);

  function handleCheckedIn(assetId: string) {
    setReportPresetAssetId(assetId);
    setActiveTab("report");
  }

  useEffect(() => {
    if (!hydrated) return;
    if (!session) {
      router.replace("/login");
      return;
    }
    if (session.role !== "officer") {
      router.replace("/dashboard");
      return;
    }
    if (session.officerId) setCurrentFieldOfficer(session.officerId);
  }, [hydrated, session, setCurrentFieldOfficer, router]);

  useEffect(() => {
    if (!currentFieldOfficerId) return;
    const id = setInterval(() => loadAll(), 20000);
    return () => clearInterval(id);
  }, [currentFieldOfficerId, loadAll]);

  useEffect(() => {
    if (!currentFieldOfficerId) return;

    const myComplaints = complaints.filter((c) => c.assignedOfficerId === currentFieldOfficerId);
    const myAssets = assets.filter((a) => a.assignedOfficerId === currentFieldOfficerId);

    if (knownComplaintIds.current) {
      const newOnes = myComplaints.filter((c) => !knownComplaintIds.current!.has(c.id));
      newOnes.forEach((c) =>
        toast.info("New complaint assigned", { description: `${c.category} at ${c.address}` })
      );
    }
    knownComplaintIds.current = new Set(myComplaints.map((c) => c.id));

    if (knownAssetIds.current) {
      const newOnes = myAssets.filter((a) => !knownAssetIds.current!.has(a.id));
      newOnes.forEach((a) => toast.info("New site assigned", { description: a.name }));
    }
    knownAssetIds.current = new Set(myAssets.map((a) => a.id));
  }, [complaints, assets, currentFieldOfficerId]);

  const officer = officers.find((o) => o.id === currentFieldOfficerId);

  if (!hydrated || !session || !officer) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
        Loading field view...
      </div>
    );
  }

  const summary = todaySummaryFor(officer.id, dailySummaries);

  const sitesVisited = Object.values(fieldTasks).filter((t) => t.status !== "Pending").length;
  const reportsSubmitted = summary?.reports_submitted ?? 0;
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
        {activeTab === "tasks" && <TasksTab onCheckedIn={handleCheckedIn} />}
        {activeTab === "report" && (
          <ReportTab
            presetAssetId={reportPresetAssetId}
            onPresetConsumed={() => setReportPresetAssetId(null)}
          />
        )}
        {activeTab === "complaints" && <ComplaintsTab />}
        {activeTab === "activity" && <ActivityTab />}
        {activeTab === "profile" && <ProfileTab />}
      </MobileFrame>
    </div>
  );
}
