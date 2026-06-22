import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { dailySummaries } from "@/lib/db/schema";
import { serializeDailySummary } from "@/lib/db/serializers";

export const dynamic = "force-dynamic";

export async function GET() {
  const rows = await db.select().from(dailySummaries);
  return NextResponse.json({ daily_summaries: rows.map(serializeDailySummary) });
}
