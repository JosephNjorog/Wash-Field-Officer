import { NextResponse, type NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { assets } from "@/lib/db/schema";
import { serializeAsset } from "@/lib/db/serializers";

const patchSchema = z.object({
  assignedOfficerId: z.string().min(1).optional(),
  status: z.enum(["functional", "needs-repair", "non-functional"]).optional(),
  conditionScore: z.number().int().min(0).max(100).optional(),
});

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const body = await request.json();
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const [row] = await db
    .update(assets)
    .set(parsed.data)
    .where(eq(assets.id, params.id))
    .returning();

  if (!row) {
    return NextResponse.json({ error: "Asset not found" }, { status: 404 });
  }

  return NextResponse.json({ asset: serializeAsset(row) });
}
