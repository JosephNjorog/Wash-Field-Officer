import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { addInspection, getInspections, getAssets, getOfficers } from "@/lib/server-data";

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

  let inspections = getInspections();
  if (officerId) inspections = inspections.filter((i) => i.officerId === officerId);
  if (assetId) inspections = inspections.filter((i) => i.assetId === assetId);

  return NextResponse.json({ inspections });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = createInspectionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const officer = getOfficers().find((o) => o.id === parsed.data.officerId);
  const asset = getAssets().find((a) => a.id === parsed.data.assetId);
  if (!officer || !asset) {
    return NextResponse.json({ error: "Unknown officerId or assetId" }, { status: 404 });
  }

  const now = new Date().toISOString();
  const inspection = addInspection({
    id: `INS-${Date.now()}`,
    officerId: parsed.data.officerId,
    assetId: parsed.data.assetId,
    formData: {
      water_flow_status: parsed.data.water_flow_status,
      infrastructure_condition: parsed.data.infrastructure_condition,
      chlorine_level: parsed.data.chlorine_level,
      notes: parsed.data.notes,
      photo_count: parsed.data.photo_count,
      gps_lat: parsed.data.gps_lat,
      gps_lng: parsed.data.gps_lng,
      submitted_at: now,
      synced_at: now,
    },
  });

  return NextResponse.json({ inspection }, { status: 201 });
}
