"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { Complaint, Officer } from "@/lib/types";
import { cn, hoursSince, timeSince } from "@/lib/utils";

const CATEGORY_COLORS: Record<string, string> = {
  "No Water": "bg-destructive/10 text-destructive",
  "Low Pressure": "bg-warning/10 text-warning",
  "Dirty Water": "bg-secondary/10 text-secondary",
  "Broken Kiosk": "bg-brand-tint text-primary",
  "Sanitation Issue": "bg-success/10 text-success",
};

export function KanbanCard({
  complaint,
  officer,
  onClick,
}: {
  complaint: Complaint;
  officer: Officer | undefined;
  onClick: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: complaint.id,
  });

  const overdue = complaint.status !== "resolved" && hoursSince(complaint.createdAt) > 48;
  const slaHours = Math.floor(hoursSince(complaint.createdAt));

  return (
    <Card
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      onClick={onClick}
      style={{ transform: CSS.Translate.toString(transform) }}
      className={cn(
        "cursor-pointer touch-none transition-shadow hover:shadow-md",
        isDragging && "opacity-50"
      )}
    >
      <CardContent className="space-y-2 p-3">
        <span
          className={cn(
            "inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium",
            CATEGORY_COLORS[complaint.category]
          )}
        >
          {complaint.category}
        </span>
        <p className="text-sm leading-snug text-foreground">{complaint.description}</p>
        <p className="text-xs text-muted-foreground">{complaint.address}</p>
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-1.5">
            <div className="flex size-6 items-center justify-center rounded-full bg-brand-tint text-[10px] font-semibold text-secondary">
              {officer ? officer.initials : "—"}
            </div>
            <span className="text-xs text-muted-foreground">
              {officer ? officer.name.split(" ")[0] : "Unassigned"}
            </span>
          </div>
          <span
            className={cn(
              "flex items-center gap-1 text-[11px] font-medium",
              overdue ? "text-destructive" : "text-muted-foreground"
            )}
          >
            <Clock className="size-3" />
            {complaint.status === "resolved" ? timeSince(complaint.createdAt) : `${slaHours}h`}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
