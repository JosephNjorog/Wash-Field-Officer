"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { UserPlus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { OfficerStatusBadge } from "@/components/shared/status-badge";
import { OfficerEditDialog } from "@/components/settings/officer-edit-dialog";
import { OfficerAddDialog } from "@/components/settings/officer-add-dialog";
import { OfficerDetailSheet } from "@/components/settings/officer-detail-sheet";
import { Pagination } from "@/components/shared/pagination";
import { useAppStore } from "@/lib/store";
import type { Officer } from "@/lib/types";

const PAGE_SIZE = 10;

export default function OfficersPage() {
  const officers = useAppStore((s) => s.officers);
  const searchParams = useSearchParams();

  const [detailOfficer, setDetailOfficer] = useState<Officer | null>(null);
  const [editOfficer, setEditOfficer] = useState<Officer | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [page, setPage] = useState(1);

  const pageCount = Math.max(1, Math.ceil(officers.length / PAGE_SIZE));
  const pagedOfficers = officers.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    const officerParam = searchParams.get("officer");
    if (officerParam) {
      const match = officers.find((o) => o.id === officerParam);
      if (match) setDetailOfficer(match);
    }
  }, [searchParams, officers]);

  const activeCount = officers.filter((o) => o.status === "Active").length;
  const overdueCount = officers.filter((o) => o.status === "Overdue").length;
  const offlineCount = officers.filter((o) => o.status === "Offline").length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs font-medium text-muted-foreground">Total Officers</p>
            <p className="text-2xl font-bold">{officers.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs font-medium text-muted-foreground">Active</p>
            <p className="text-2xl font-bold text-success">{activeCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs font-medium text-muted-foreground">Offline</p>
            <p className="text-2xl font-bold text-muted-foreground">{offlineCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs font-medium text-muted-foreground">Overdue</p>
            <p className="text-2xl font-bold text-destructive">{overdueCount}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base">Field Officer Roster</CardTitle>
          <Button size="sm" className="gap-1.5" onClick={() => setAddOpen(true)}>
            <UserPlus className="size-4" /> Add Officer
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Officer</TableHead>
                <TableHead>Region</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pagedOfficers.map((officer) => (
                <TableRow
                  key={officer.id}
                  className="cursor-pointer"
                  onClick={() => setDetailOfficer(officer)}
                >
                  <TableCell className="font-medium">{officer.name}</TableCell>
                  <TableCell className="text-sm">{officer.region}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{officer.phone}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{officer.email}</TableCell>
                  <TableCell>
                    <OfficerStatusBadge status={officer.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditOfficer(officer);
                      }}
                    >
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Pagination
            page={page}
            pageCount={pageCount}
            total={officers.length}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
          />
        </CardContent>
      </Card>

      <OfficerDetailSheet
        officer={detailOfficer}
        onClose={() => setDetailOfficer(null)}
        onEdit={() => {
          if (detailOfficer) setEditOfficer(detailOfficer);
        }}
      />
      <OfficerEditDialog
        officer={editOfficer}
        open={!!editOfficer}
        onOpenChange={(open) => !open && setEditOfficer(null)}
      />
      <OfficerAddDialog open={addOpen} onOpenChange={setAddOpen} />
    </div>
  );
}
