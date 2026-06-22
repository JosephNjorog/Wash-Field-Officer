"use client";

import { useEffect, useState } from "react";
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
import { formatDateTime, timeSince } from "@/lib/utils";

const UNASSIGNED = "__unassigned__";

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
  const [saving, setSaving] = useState<"assign" | "in-progress" | "resolved" | null>(null);

  useEffect(() => {
    setNote(complaint?.resolutionNote ?? "");
  }, [complaint?.id, complaint?.resolutionNote]);

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

  async function handleAssign(value: string) {
    const officerId = value === UNASSIGNED ? null : value;
    setSaving("assign");
    try {
      await assignComplaint(complaint!.id, officerId);
      toast.success(officerId ? "Complaint reassigned" : "Complaint unassigned");
    } catch (err) {
      toast.error("Failed to reassign complaint", {
        description: err instanceof Error ? err.message : undefined,
      });
    } finally {
      setSaving(null);
    }
  }

  async function handleStatusChange(status: "in-progress" | "resolved") {
    setSaving(status);
    try {
      await updateComplaintStatus(complaint!.id, status, note);
      toast.success(status === "resolved" ? "Complaint resolved" : "Status updated to In Progress");
      if (status === "resolved") onClose();
    } catch (err) {
      toast.error("Failed to update complaint", {
        description: err instanceof Error ? err.message : undefined,
      });
    } finally {
      setSaving(null);
    }
  }

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
            <p className="mt-1 text-sm text-muted-foreground">
              {complaint.address} · {complaint.region}
            </p>
            <div className="mt-2 grid grid-cols-2 gap-3 text-xs text-muted-foreground">
              <div>
                <p className="font-semibold uppercase">Logged</p>
                <p>
                  {formatDateTime(complaint.createdAt)} ({timeSince(complaint.createdAt)})
                </p>
              </div>
              <div>
                <p className="font-semibold uppercase">Resolved</p>
                <p>{complaint.resolvedAt ? formatDateTime(complaint.resolvedAt) : "—"}</p>
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Assigned Officer</Label>
            <Select
              value={complaint.assignedOfficerId ?? UNASSIGNED}
              onValueChange={handleAssign}
              disabled={saving === "assign"}
            >
              <SelectTrigger>
                <SelectValue placeholder="Unassigned" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={UNASSIGNED}>Unassigned</SelectItem>
                {officers
                  .filter((o) => o.status !== "Inactive")
                  .map((o) => (
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
              disabled={saving === "in-progress"}
              onClick={() => handleStatusChange("in-progress")}
            >
              {saving === "in-progress" ? "Saving..." : "Mark In Progress"}
            </Button>
            <Button
              className="flex-1"
              disabled={saving === "resolved"}
              onClick={() => handleStatusChange("resolved")}
            >
              {saving === "resolved" ? "Saving..." : "Mark Resolved"}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
