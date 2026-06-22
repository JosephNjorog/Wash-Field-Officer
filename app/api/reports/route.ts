import { NextResponse, type NextRequest } from "next/server";
import { desc } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { reports } from "@/lib/db/schema";
import { serializeReport } from "@/lib/db/serializers";

export const dynamic = "force-dynamic";

const createReportSchema = z.object({
  reportType: z.string().min(1),
  format: z.enum(["pdf", "csv"]),
  filters: z.record(z.string(), z.unknown()),
  generatedBy: z.string().min(1),
});

export async function GET() {
  const rows = await db.select().from(reports).orderBy(desc(reports.createdAt)).limit(50);
  return NextResponse.json({ reports: rows.map(serializeReport) });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = createReportSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const [row] = await db
    .insert(reports)
    .values({
      id: `RPT-${Date.now()}`,
      reportType: parsed.data.reportType,
      format: parsed.data.format,
      filters: parsed.data.filters,
      generatedBy: parsed.data.generatedBy,
    })
    .returning();

  return NextResponse.json({ report: serializeReport(row) }, { status: 201 });
}
