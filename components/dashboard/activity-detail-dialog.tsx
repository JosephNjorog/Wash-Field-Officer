"use client";

import { useRouter } from "next/navigation";
import { ClipboardCheck, AlertTriangle, MessageSquareWarning, MapPin } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { ActivityEvent } from "@/lib/types";
import { cn, formatDateTime } from "@/lib/utils";

const ICONS: Record<ActivityEvent["type"], typeof ClipboardCheck> = {
  inspection: ClipboardCheck,
  complaint: MessageSquareWarning,
  issue: AlertTriangle,
  "check-in": MapPin,
};

const ICON_COLORS: Record<ActivityEvent["type"], string> = {
  inspection: "text-secondary bg-brand-tint",
  complaint: "text-warning bg-warning/10",
  issue: "text-destructive bg-destructive/10",
  "check-in": "text-success bg-success/10",
};

const TYPE_LABELS: Record<ActivityEvent["type"], string> = {
  inspection: "Inspection Submitted",
  complaint: "Complaint Update",
  issue: "Infrastructure Issue Flagged",
  "check-in": "Site Check-In",
};

export function ActivityDetailDialog({
  event,
  onClose,
}: {
  event: ActivityEvent | null;
  onClose: () => void;
}) {
  const router = useRouter();

  if (!event) return null;
  const Icon = ICONS[event.type];

  return (
    <Dialog open={!!event} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2.5">
            <span
              className={cn(
                "flex size-9 shrink-0 items-center justify-center rounded-full",
                ICON_COLORS[event.type]
              )}
            >
              <Icon className="size-4" />
            </span>
            {TYPE_LABELS[event.type]}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-2 text-sm">
          <p className="text-foreground">{event.text}</p>
          <p className="text-muted-foreground">Officer: {event.officerName}</p>
          <p className="text-muted-foreground">{formatDateTime(event.time)}</p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          {event.href && (
            <Button
              onClick={() => {
                onClose();
                router.push(event.href!);
              }}
            >
              View Details
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
