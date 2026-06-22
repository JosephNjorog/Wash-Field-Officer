"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Users, ClipboardList, ClipboardCheck, AlertTriangle } from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { MapSection } from "@/components/dashboard/map-section";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { ActivityDetailDialog } from "@/components/dashboard/activity-detail-dialog";
import { OfficerPerformanceTable } from "@/components/dashboard/officer-performance-table";
import { useAppStore } from "@/lib/store";
import { buildSeedActivity, TODAY_STR } from "@/lib/selectors";
import { hoursSince } from "@/lib/utils";
import type { ActivityEvent } from "@/lib/types";

export default function DashboardPage() {
  const router = useRouter();
  const officers = useAppStore((s) => s.officers);
  const assets = useAppStore((s) => s.assets);
  const inspections = useAppStore((s) => s.inspections);
  const complaints = useAppStore((s) => s.complaints);
  const dailySummaries = useAppStore((s) => s.dailySummaries);
  const liveActivity = useAppStore((s) => s.activity);
  const loadAll = useAppStore((s) => s.loadAll);
  const [selectedEvent, setSelectedEvent] = useState<ActivityEvent | null>(null);

  useEffect(() => {
    const id = setInterval(() => loadAll(), 25000);
    return () => clearInterval(id);
  }, [loadAll]);

  const activeOfficers = officers.filter((o) => o.status === "Active").length;
  const yesterdayActive = dailySummaries.filter(
    (d) => d.sites_visited > 0 && d.date !== TODAY_STR
  ).length;
  const activeTrend = activeOfficers - Math.round(yesterdayActive / 6);

  const openComplaints = complaints.filter((c) => c.status !== "resolved");
  const overdueComplaints = openComplaints.filter((c) => hoursSince(c.createdAt) > 48);

  const inspectionsThisWeek = inspections.filter(
    (i) => hoursSince(i.formData.submitted_at) <= 24 * 7
  ).length;
  const inspectionTarget = officers.length * 5;

  const alerts = assets.filter((a) => a.status !== "functional").length;

  const seedActivity = useMemo(
    () => buildSeedActivity(officers, assets, inspections, complaints),
    [officers, assets, inspections, complaints]
  );
  const combinedActivity = useMemo(
    () => [...liveActivity, ...seedActivity],
    [liveActivity, seedActivity]
  );

  function handleActivitySelect(event: ActivityEvent) {
    if (event.href) {
      router.push(event.href);
    } else {
      setSelectedEvent(event);
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Active Officers Today"
          value={activeOfficers}
          icon={Users}
          trend={activeTrend}
        />
        <StatCard
          label="Open Complaints"
          value={openComplaints.length}
          icon={ClipboardList}
          subtext={`${overdueComplaints.length} overdue`}
        />
        <StatCard
          label="Inspections This Week"
          value={inspectionsThisWeek}
          icon={ClipboardCheck}
          subtext={`vs target of ${inspectionTarget}`}
        />
        <StatCard
          label="Infrastructure Alerts"
          value={alerts}
          icon={AlertTriangle}
          alert={alerts > 0}
          subtext={alerts > 0 ? "Requires attention" : "All clear"}
        />
      </div>

      <MapSection assets={assets} officers={officers} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <ActivityFeed events={combinedActivity} onSelect={handleActivitySelect} />
        </div>
        <div className="lg:col-span-3">
          <OfficerPerformanceTable officers={officers} dailySummaries={dailySummaries} />
        </div>
      </div>

      <ActivityDetailDialog event={selectedEvent} onClose={() => setSelectedEvent(null)} />
    </div>
  );
}
