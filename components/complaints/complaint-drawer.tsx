"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ComplaintStatusBadge } from "@/components/shared/status-badge";
import { useAppStore } from "@/lib/store";
import type { Complaint } from "@/lib/types";
import { formatDateTime } from "@/lib/utils";

export function ComplaintDrawer({
  complaint,
  onClose,
}: {
  complaint: Complaint | null;
  onClose: () => void;
}) {
  const officers = useAppStore((s) => s.officers);
  const assignComplaint = useAppStore((s) => s.assignComplaint);
  const updateComplaintStatus = useAppStore((s) => s.updateComplaintStatus);
  const [note, setNote] = useState(complaint?.resolutionNote ?? "");

  if (!complaint) return null;

  const timeline = [
    { label: "Complaint logged", time: complaint.createdAt },
    ...(complaint.assignedOfficerId
      ? [{ label: "Assigned to officer", time: complaint.createdAt }]
      : []),
    ...(complaint.status === "in-progress" || complaint.status === "resolved"
      ? [{ label: "Marked in progress", time: complaint.createdAt }]
      : []),
    ...(complaint.resolvedAt ? [{ label: "Resolved", time: complaint.resolvedAt }] : []),
  ];

  return (
    <Sheet open={!!complaint} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            {complaint.id}
            <ComplaintStatusBadge status={complaint.status} />
          </SheetTitle>
        </SheetHeader>

        <div className="mt-4 space-y-5">
          <div>
            <p className="text-sm font-medium text-foreground">{complaint.category}</p>
            <p className="mt-1 text-sm text-muted-foreground">{complaint.description}</p>
            <p className="mt-1 text-sm text-muted-foreground">{complaint.address}</p>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Assigned Officer</Label>
            <Select
              value={complaint.assignedOfficerId ?? ""}
              onValueChange={(v) => {
                assignComplaint(complaint.id, v);
                toast.success("Complaint reassigned");
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Unassigned" />
              </SelectTrigger>
              <SelectContent>
                {officers.map((o) => (
                  <SelectItem key={o.id} value={o.id}>
                    {o.name} — {o.region}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Status History</Label>
            <div className="space-y-3 border-l border-border pl-4">
              {timeline.map((event, i) => (
                <div key={i} className="relative">
                  <span className="absolute -left-[21px] top-1 size-2.5 rounded-full bg-secondary" />
                  <p className="text-sm font-medium text-foreground">{event.label}</p>
                  <p className="text-xs text-muted-foreground">{formatDateTime(event.time)}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Resolution Notes</Label>
            <Textarea
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add resolution notes..."
            />
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                updateComplaintStatus(complaint.id, "in-progress", note);
                toast.success("Status updated to In Progress");
              }}
            >
              Mark In Progress
            </Button>
            <Button
              className="flex-1"
              onClick={() => {
                updateComplaintStatus(complaint.id, "resolved", note);
                toast.success("Complaint resolved");
                onClose();
              }}
            >
              Mark Resolved
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
