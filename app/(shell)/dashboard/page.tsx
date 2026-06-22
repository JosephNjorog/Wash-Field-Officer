"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Users, ClipboardList, ClipboardCheck, AlertTriangle } from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { MapSection } from "@/components/dashboard/map-section";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { ActivityDetailDialog } from "@/components/dashboard/activity-detail-dialog";
import { OfficerPerformanceTable } from "@/components/dashboard/officer-performance-table";
import { RecentReports } from "@/components/reports/recent-reports";
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
  const reports = useAppStore((s) => s.reports);
  const loadAll = useAppStore((s) => s.loadAll);
  const [selectedEvent, setSelectedEvent] = useState<ActivityEvent | null>(null);

  useEffect(() => {
    const id = setInterval(() => loadAll(), 25000);
    return () => clearInterval(id);
  }, [loadAll]);

  const complaintSnapshot = useRef<Map<string, { status: string; assignedOfficerId: string | null }> | null>(
    null
  );

  useEffect(() => {
    if (complaints.length === 0) return;

    if (complaintSnapshot.current) {
      const prev = complaintSnapshot.current;
      complaints.forEach((c) => {
        const before = prev.get(c.id);
        if (!before) {
          toast.info("New complaint logged", { description: `${c.category} at ${c.address}` });
          return;
        }
        if (before.assignedOfficerId !== c.assignedOfficerId && c.assignedOfficerId) {
          const officer = officers.find((o) => o.id === c.assignedOfficerId);
          toast.info("Complaint assigned", {
            description: `${c.id} assigned to ${officer?.name ?? "an officer"}`,
          });
        } else if (before.status !== c.status) {
          toast.info("Complaint status updated", { description: `${c.id} is now ${c.status}` });
        }
      });
    }

    complaintSnapshot.current = new Map(
      complaints.map((c) => [c.id, { status: c.status, assignedOfficerId: c.assignedOfficerId }])
    );
  }, [complaints, officers]);

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

      <RecentReports reports={reports} />

      <ActivityDetailDialog event={selectedEvent} onClose={() => setSelectedEvent(null)} />
    </div>
  );
}
