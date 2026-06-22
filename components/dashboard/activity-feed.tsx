import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClipboardCheck, AlertTriangle, MessageSquareWarning, MapPin } from "lucide-react";
import type { ActivityEvent } from "@/lib/types";
import { cn, timeSince } from "@/lib/utils";

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

export function ActivityFeed({ events }: { events: ActivityEvent[] }) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-base">Recent Activity Feed</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {events.length === 0 && (
          <p className="text-sm text-muted-foreground">No activity recorded yet.</p>
        )}
        {events.slice(0, 10).map((event) => {
          const Icon = ICONS[event.type];
          return (
            <div key={event.id} className="flex gap-3">
              <div
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-full",
                  ICON_COLORS[event.type]
                )}
              >
                <Icon className="size-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm leading-snug text-foreground">{event.text}</p>
                <p className="text-xs text-muted-foreground">
                  {event.officerName} · {timeSince(event.time)}
                </p>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
