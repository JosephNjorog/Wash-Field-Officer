import { NextResponse, type NextRequest } from "next/server";
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { assets, inspections, officers } from "@/lib/db/schema";
import { serializeInspection } from "@/lib/db/serializers";

export const dynamic = "force-dynamic";

const createInspectionSchema = z.object({
  officerId: z.string().min(1),
  assetId: z.string().min(1),
  water_flow_status: z.enum(["Normal", "Reduced", "No Flow"]),
  infrastructure_condition: z.enum(["Good", "Fair", "Poor", "Critical"]),
  chlorine_level: z.number().min(0).max(5),
  notes: z.string().min(1),
  photo_count: z.number().int().min(0).max(10).default(0),
  gps_lat: z.number(),
  gps_lng: z.number(),
});

export async function GET(request: NextRequest) {
  const officerId = request.nextUrl.searchParams.get("officerId");
  const assetId = request.nextUrl.searchParams.get("assetId");

  const conditions = [
    officerId ? eq(inspections.officerId, officerId) : undefined,
    assetId ? eq(inspections.assetId, assetId) : undefined,
  ].filter((c): c is NonNullable<typeof c> => !!c);

  const rows = await db
    .select()
    .from(inspections)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(inspections.submittedAt));

  return NextResponse.json({ inspections: rows.map(serializeInspection) });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = createInspectionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const [officer] = await db
    .select()
    .from(officers)
    .where(eq(officers.id, parsed.data.officerId));
  const [asset] = await db.select().from(assets).where(eq(assets.id, parsed.data.assetId));
  if (!officer || !asset) {
    return NextResponse.json({ error: "Unknown officerId or assetId" }, { status: 404 });
  }

  const now = new Date();
  const [row] = await db
    .insert(inspections)
    .values({
      id: `INS-${Date.now()}`,
      officerId: parsed.data.officerId,
      assetId: parsed.data.assetId,
      waterFlowStatus: parsed.data.water_flow_status,
      infrastructureCondition: parsed.data.infrastructure_condition,
      chlorineLevel: parsed.data.chlorine_level.toString(),
      notes: parsed.data.notes,
      photoCount: parsed.data.photo_count,
      gpsLat: parsed.data.gps_lat,
      gpsLng: parsed.data.gps_lng,
      submittedAt: now,
      syncedAt: now,
    })
    .returning();

  await db.update(assets).set({ lastInspected: now }).where(eq(assets.id, parsed.data.assetId));

  return NextResponse.json({ inspection: serializeInspection(row) }, { status: 201 });
}
