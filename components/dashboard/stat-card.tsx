import { ArrowDown, ArrowUp, type LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  subtext?: string;
  trend?: number;
  alert?: boolean;
}

export function StatCard({ label, value, icon: Icon, subtext, trend, alert }: StatCardProps) {
  return (
    <Card className={cn(alert && "border-destructive/40")}>
      <CardContent className="flex items-start justify-between p-5">
        <div className="space-y-1.5">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className={cn("text-3xl font-bold tracking-tight", alert && "text-destructive")}>
            {value}
          </p>
          {subtext && <p className="text-xs text-muted-foreground">{subtext}</p>}
          {typeof trend === "number" && (
            <div
              className={cn(
                "flex items-center gap-0.5 text-xs font-medium",
                trend >= 0 ? "text-success" : "text-destructive"
              )}
            >
              {trend >= 0 ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />}
              {Math.abs(trend)} vs yesterday
            </div>
          )}
        </div>
        <div
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-lg",
            alert ? "bg-destructive/10 text-destructive" : "bg-brand-tint text-secondary"
          )}
        >
          <Icon className="size-5" />
        </div>
      </CardContent>
    </Card>
  );
}
