"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppStore } from "@/lib/store";
import { formatDateTime } from "@/lib/utils";

export function ActivityTab() {
  const dailySummaries = useAppStore((s) => s.dailySummaries);
  const pendingSync = useAppStore((s) => s.pendingSync);
  const currentFieldOfficerId = useAppStore((s) => s.currentFieldOfficerId);

  const mine = dailySummaries
    .filter((d) => d.officerId === currentFieldOfficerId)
    .sort((a, b) => (a.date < b.date ? -1 : 1));

  const totals = mine.reduce(
    (acc, d) => ({
      reports: acc.reports + d.reports_submitted,
      sites: acc.sites + d.sites_visited,
      complaints: acc.complaints + d.complaints_handled,
    }),
    { reports: 0, sites: 0, complaints: 0 }
  );

  const chartData = mine.map((d) => ({
    day: new Date(d.date).toLocaleDateString("en-KE", { weekday: "short" }),
    reports: d.reports_submitted,
  }));

  const syncHistory = pendingSync.slice(0, 5);

  return (
    <div className="space-y-4">
      <p className="text-sm font-semibold text-foreground">My Activity</p>

      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "Submissions", value: totals.reports },
          { label: "Sites Covered", value: totals.sites },
          { label: "Resolved", value: totals.complaints },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-3 text-center">
              <p className="text-xl font-bold text-foreground">{stat.value}</p>
              <p className="text-[11px] text-muted-foreground">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-1">
          <CardTitle className="text-sm">Last 7 Days — Reports Submitted</CardTitle>
        </CardHeader>
        <CardContent className="h-[180px] p-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} width={20} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="reports" fill="#2E6DB4" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-1">
          <CardTitle className="text-sm">Sync History</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 p-3">
          {syncHistory.length === 0 && (
            <p className="text-xs text-muted-foreground">No sync activity yet today.</p>
          )}
          {syncHistory.map((item) => (
            <div key={item.id} className="flex items-center justify-between text-xs">
              <span className="text-foreground">{item.label}</span>
              <span
                className={
                  item.status === "synced" ? "text-success" : "text-warning"
                }
              >
                {formatDateTime(item.createdAt)} · {item.status}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
