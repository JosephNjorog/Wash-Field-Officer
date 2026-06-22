import { NextResponse, type NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { officers } from "@/lib/db/schema";
import { serializeOfficer } from "@/lib/db/serializers";

const patchSchema = z.object({
  name: z.string().min(1).optional(),
  region: z.string().min(1).optional(),
  phone: z.string().min(1).optional(),
  email: z.string().email().optional(),
  status: z.enum(["Active", "Offline", "Overdue"]).optional(),
  dailyTarget: z.number().int().min(1).max(20).optional(),
});

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const body = await request.json();
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const patch = { ...parsed.data };
  if (patch.name) {
    patch.name = patch.name.trim();
  }

  const [row] = await db
    .update(officers)
    .set({
      ...patch,
      ...(parsed.data.name
        ? {
            initials: parsed.data.name
              .trim()
              .split(/\s+/)
              .map((p) => p[0])
              .join("")
              .toUpperCase(),
          }
        : {}),
    })
    .where(eq(officers.id, params.id))
    .returning();

  if (!row) {
    return NextResponse.json({ error: "Officer not found" }, { status: 404 });
  }

  return NextResponse.json({ officer: serializeOfficer(row) });
}
