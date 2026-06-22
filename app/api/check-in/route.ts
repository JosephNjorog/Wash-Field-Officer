import { NextResponse, type NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { assets, checkIns, officers } from "@/lib/db/schema";

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

  const [officer] = await db
    .select()
    .from(officers)
    .where(eq(officers.id, parsed.data.officerId));
  const [asset] = await db.select().from(assets).where(eq(assets.id, parsed.data.assetId));
  if (!officer || !asset) {
    return NextResponse.json({ error: "Unknown officerId or assetId" }, { status: 404 });
  }

  const [row] = await db
    .insert(checkIns)
    .values({ officerId: parsed.data.officerId, assetId: parsed.data.assetId })
    .returning();

  return NextResponse.json({
    checkedInAt: row.checkedInAt.toISOString(),
    officer: officer.name,
    asset: asset.name,
  });
}
