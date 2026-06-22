import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { getAssets, getOfficers } from "@/lib/server-data";

const checkInSchema = z.object({
  officerId: z.string().min(1),
  assetId: z.string().min(1),
});

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = checkInSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const officer = getOfficers().find((o) => o.id === parsed.data.officerId);
  const asset = getAssets().find((a) => a.id === parsed.data.assetId);
  if (!officer || !asset) {
    return NextResponse.json({ error: "Unknown officerId or assetId" }, { status: 404 });
  }

  return NextResponse.json({
    checkedInAt: new Date().toISOString(),
    officer: officer.name,
    asset: asset.name,
  });
}
