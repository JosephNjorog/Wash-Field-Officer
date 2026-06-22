import { FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { GeneratedReport } from "@/lib/types";
import { formatDateTime } from "@/lib/utils";

export function RecentReports({ reports }: { reports: GeneratedReport[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Recent Reports</CardTitle>
        <p className="text-xs text-muted-foreground">
          Audit trail of generated and exported reports.
        </p>
      </CardHeader>
      <CardContent className="space-y-2">
        {reports.length === 0 && (
          <p className="text-sm text-muted-foreground">No reports generated yet.</p>
        )}
        {reports.slice(0, 8).map((report) => (
          <div
            key={report.id}
            className="flex items-start gap-2.5 rounded-md border border-border px-3 py-2"
          >
            <FileText className="mt-0.5 size-4 shrink-0 text-secondary" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className="truncate text-sm font-medium text-foreground">
                  {report.reportType}
                </p>
                <Badge variant="secondary" className="uppercase">
                  {report.format}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                {report.generatedBy} · {formatDateTime(report.createdAt)}
              </p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
