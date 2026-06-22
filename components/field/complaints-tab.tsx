"use client";

import { useState } from "react";
import { toast } from "sonner";
import { ChevronDown, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ComplaintStatusBadge } from "@/components/shared/status-badge";
import { NewComplaintDialog } from "@/components/field/new-complaint-dialog";
import { useAppStore } from "@/lib/store";
import { cn, timeSince } from "@/lib/utils";

export function ComplaintsTab() {
  const complaints = useAppStore((s) => s.complaints);
  const updateComplaintStatus = useAppStore((s) => s.updateComplaintStatus);
  const currentFieldOfficerId = useAppStore((s) => s.currentFieldOfficerId);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [newOpen, setNewOpen] = useState(false);

  const myComplaints = complaints
    .filter((c) => c.assignedOfficerId === currentFieldOfficerId)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-foreground">My Assigned Complaints</p>
        <Button size="sm" variant="outline" className="gap-1" onClick={() => setNewOpen(true)}>
          <Plus className="size-3.5" /> New
        </Button>
      </div>
      {myComplaints.map((complaint) => {
        const expanded = expandedId === complaint.id;
        return (
          <Card key={complaint.id}>
            <CardContent
              className="space-y-2 p-3.5"
              onClick={() => {
                setExpandedId(expanded ? null : complaint.id);
                setNote(complaint.resolutionNote ?? "");
              }}
            >
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-brand-tint px-2 py-0.5 text-[11px] font-medium text-secondary">
                  {complaint.category}
                </span>
                <ComplaintStatusBadge status={complaint.status} />
              </div>
              <p className="text-sm text-foreground">{complaint.description}</p>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{complaint.address}</span>
                <span className="flex items-center gap-1">
                  {timeSince(complaint.createdAt)}
                  <ChevronDown
                    className={cn("size-3.5 transition-transform", expanded && "rotate-180")}
                  />
                </span>
              </div>

              {expanded && (
                <div
                  className="space-y-2 border-t border-border pt-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Textarea
                    rows={2}
                    placeholder="Add resolution note..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        updateComplaintStatus(complaint.id, "in-progress", note);
                        toast.success("Marked as In Progress");
                      }}
                    >
                      In Progress
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={() => {
                        updateComplaintStatus(complaint.id, "resolved", note);
                        toast.success("Marked as Resolved");
                      }}
                    >
                      Resolved
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
      {myComplaints.length === 0 && (
        <p className="text-sm text-muted-foreground">No complaints assigned to you.</p>
      )}
      <NewComplaintDialog open={newOpen} onOpenChange={setNewOpen} />
    </div>
  );
}
