"use client";

import { useDroppable } from "@dnd-kit/core";
import { KanbanCard } from "@/components/complaints/kanban-card";
import type { Complaint, ComplaintStatus, Officer } from "@/lib/types";
import { cn } from "@/lib/utils";

const COLUMN_ACCENT: Record<ComplaintStatus, string> = {
  open: "border-t-destructive",
  assigned: "border-t-secondary",
  "in-progress": "border-t-warning",
  resolved: "border-t-success",
};

export function KanbanColumn({
  status,
  label,
  complaints,
  officers,
  onCardClick,
}: {
  status: ComplaintStatus;
  label: string;
  complaints: Complaint[];
  officers: Officer[];
  onCardClick: (complaint: Complaint) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex min-h-[500px] flex-col rounded-lg border-t-4 bg-white",
        COLUMN_ACCENT[status],
        isOver && "ring-2 ring-secondary/40"
      )}
    >
      <div className="flex items-center justify-between border-b border-border px-3 py-2.5">
        <p className="text-sm font-semibold text-foreground">{label}</p>
        <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
          {complaints.length}
        </span>
      </div>
      <div className="flex-1 space-y-2 overflow-y-auto p-2.5">
        {complaints.map((complaint) => (
          <KanbanCard
            key={complaint.id}
            complaint={complaint}
            officer={officers.find((o) => o.id === complaint.assignedOfficerId)}
            onClick={() => onCardClick(complaint)}
          />
        ))}
        {complaints.length === 0 && (
          <p className="px-2 py-6 text-center text-xs text-muted-foreground">No complaints</p>
        )}
      </div>
    </div>
  );
}
