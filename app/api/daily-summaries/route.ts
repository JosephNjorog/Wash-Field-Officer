import { NextResponse } from "next/server";
import { getDailySummaries } from "@/lib/server-data";

export async function GET() {
  return NextResponse.json({ daily_summaries: getDailySummaries() });
}
