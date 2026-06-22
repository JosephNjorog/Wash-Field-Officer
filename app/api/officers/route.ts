import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { officers } from "@/lib/db/schema";
import { serializeOfficer } from "@/lib/db/serializers";

export async function GET() {
  const rows = await db.select().from(officers);
  return NextResponse.json({ officers: rows.map(serializeOfficer) });
}
