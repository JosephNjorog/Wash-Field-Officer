import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function ComplaintStats({
  totalOpen,
  assigned,
  overdue,
  resolvedThisWeek,
}: {
  totalOpen: number;
  assigned: number;
  overdue: number;
  resolvedThisWeek: number;
}) {
  const stats = [
    { label: "Total Open", value: totalOpen },
    { label: "Assigned", value: assigned },
    { label: "Overdue (48h SLA)", value: overdue, alert: overdue > 0 },
    { label: "Resolved This Week", value: resolvedThisWeek },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {stats.map((s) => (
        <Card key={s.label}>
          <CardContent className="p-4">
            <p className="text-xs font-medium text-muted-foreground">{s.label}</p>
            <p className={cn("text-2xl font-bold", s.alert && "text-destructive")}>{s.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
