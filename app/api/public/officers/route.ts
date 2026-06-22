import { NextResponse } from "next/server";
import { ne } from "drizzle-orm";
import { db } from "@/lib/db";
import { officers } from "@/lib/db/schema";

export const dynamic = "force-dynamic";

export async function GET() {
  const rows = await db
    .select({
      id: officers.id,
      name: officers.name,
      region: officers.region,
    })
    .from(officers)
    .where(ne(officers.status, "Inactive"));

  return NextResponse.json({ officers: rows });
}
