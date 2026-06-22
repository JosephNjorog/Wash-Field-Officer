import { NextResponse, type NextRequest } from "next/server";
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { assets, complaints } from "@/lib/db/schema";
import { serializeComplaint } from "@/lib/db/serializers";
import type { ComplaintStatus } from "@/lib/types";

const createComplaintSchema = z.object({
  category: z.enum(["No Water", "Low Pressure", "Dirty Water", "Broken Kiosk", "Sanitation Issue"]),
  description: z.string().min(1),
  address: z.string().min(1),
  region: z.string().min(1),
  lat: z.number(),
  lng: z.number(),
  assignedOfficerId: z.string().nullable().optional(),
  assetId: z.string().optional(),
});

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

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = createComplaintSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  if (parsed.data.assetId) {
    const [asset] = await db.select().from(assets).where(eq(assets.id, parsed.data.assetId));
    if (!asset) {
      return NextResponse.json({ error: "Unknown assetId" }, { status: 404 });
    }
  }

  const now = new Date();
  const [row] = await db
    .insert(complaints)
    .values({
      id: `CMP-${Date.now()}`,
      category: parsed.data.category,
      description: parsed.data.description,
      address: parsed.data.address,
      region: parsed.data.region,
      lat: parsed.data.lat,
      lng: parsed.data.lng,
      status: parsed.data.assignedOfficerId ? "assigned" : "open",
      assignedOfficerId: parsed.data.assignedOfficerId ?? null,
      createdAt: now,
    })
    .returning();

  return NextResponse.json({ complaint: serializeComplaint(row) }, { status: 201 });
}
