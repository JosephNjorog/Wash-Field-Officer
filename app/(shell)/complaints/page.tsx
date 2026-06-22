"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { DndContext, type DragEndEvent } from "@dnd-kit/core";
import { toast } from "sonner";
import { ComplaintStats } from "@/components/complaints/complaint-stats";
import { ComplaintFilters, type ComplaintFilterState } from "@/components/complaints/complaint-filters";
import { KanbanColumn } from "@/components/complaints/kanban-column";
import { ComplaintDrawer } from "@/components/complaints/complaint-drawer";
import { useAppStore } from "@/lib/store";
import { COMPLAINT_STATUS_LABELS, hoursSince } from "@/lib/utils";
import type { Complaint, ComplaintStatus } from "@/lib/types";

const COLUMNS: ComplaintStatus[] = ["open", "assigned", "in-progress", "resolved"];

export default function ComplaintsPage() {
  const complaints = useAppStore((s) => s.complaints);
  const officers = useAppStore((s) => s.officers);
  const updateComplaintStatus = useAppStore((s) => s.updateComplaintStatus);
  const searchParams = useSearchParams();

  const [activeComplaint, setActiveComplaint] = useState<Complaint | null>(null);
  const [filters, setFilters] = useState<ComplaintFilterState>({
    category: "all",
    officerId: "all",
    region: "all",
    from: "",
  });

  useEffect(() => {
    const complaintParam = searchParams.get("complaint");
    if (complaintParam) {
      const match = complaints.find((c) => c.id === complaintParam);
      if (match) setActiveComplaint(match);
    }
  }, [searchParams, complaints]);

  const regions = useMemo(
    () => Array.from(new Set(complaints.map((c) => c.region))).sort(),
    [complaints]
  );

  const filtered = useMemo(() => {
    return complaints.filter((c) => {
      if (filters.category !== "all" && c.category !== filters.category) return false;
      if (filters.officerId !== "all" && c.assignedOfficerId !== filters.officerId) return false;
      if (filters.region !== "all" && c.region !== filters.region) return false;
      if (filters.from && c.createdAt < filters.from) return false;
      return true;
    });
  }, [complaints, filters]);

  const byStatus = (status: ComplaintStatus) => filtered.filter((c) => c.status === status);

  const totalOpen = filtered.filter((c) => c.status !== "resolved").length;
  const assignedCount = filtered.filter((c) => c.status === "assigned").length;
  const overdue = filtered.filter((c) => c.status !== "resolved" && hoursSince(c.createdAt) > 48).length;
  const resolvedThisWeek = filtered.filter(
    (c) => c.status === "resolved" && c.resolvedAt && hoursSince(c.resolvedAt) <= 24 * 7
  ).length;

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;
    const newStatus = over.id as ComplaintStatus;
    const complaint = complaints.find((c) => c.id === active.id);
    if (!complaint || complaint.status === newStatus) return;
    try {
      await updateComplaintStatus(complaint.id, newStatus);
      toast.success(`${complaint.id} moved to ${COMPLAINT_STATUS_LABELS[newStatus]}`);
    } catch (err) {
      toast.error("Failed to update complaint status", {
        description: err instanceof Error ? err.message : undefined,
      });
    }
  }

  return (
    <div className="space-y-4">
      <ComplaintStats
        totalOpen={totalOpen}
        assigned={assignedCount}
        overdue={overdue}
        resolvedThisWeek={resolvedThisWeek}
      />

      <ComplaintFilters filters={filters} onChange={setFilters} officers={officers} regions={regions} />

      <DndContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {COLUMNS.map((status) => (
            <KanbanColumn
              key={status}
              status={status}
              label={COMPLAINT_STATUS_LABELS[status]}
              complaints={byStatus(status)}
              officers={officers}
              onCardClick={setActiveComplaint}
            />
          ))}
        </div>
      </DndContext>

      <ComplaintDrawer complaint={activeComplaint} onClose={() => setActiveComplaint(null)} />
    </div>
  );
}
