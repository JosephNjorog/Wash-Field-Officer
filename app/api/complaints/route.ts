import { NextResponse, type NextRequest } from "next/server";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { complaints } from "@/lib/db/schema";
import { serializeComplaint } from "@/lib/db/serializers";
import type { ComplaintStatus } from "@/lib/types";

export async function GET(request: NextRequest) {
  const status = request.nextUrl.searchParams.get("status") as ComplaintStatus | null;
  const officerId = request.nextUrl.searchParams.get("officerId");

  const conditions = [
    status ? eq(complaints.status, status) : undefined,
    officerId ? eq(complaints.assignedOfficerId, officerId) : undefined,
  ].filter((c): c is NonNullable<typeof c> => !!c);

  const rows = await db
    .select()
    .from(complaints)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(complaints.createdAt));

  return NextResponse.json({ complaints: rows.map(serializeComplaint) });
}
