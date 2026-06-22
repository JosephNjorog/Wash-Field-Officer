import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { officers } from "@/lib/db/schema";
import { serializeOfficer } from "@/lib/db/serializers";

export const dynamic = "force-dynamic";

const createOfficerSchema = z.object({
  name: z.string().min(2),
  region: z.string().min(2),
  phone: z.string().min(6),
  email: z.string().email(),
  dailyTarget: z.coerce.number().int().min(1).max(20).default(6),
});

export async function GET() {
  const rows = await db.select().from(officers);
  return NextResponse.json({ officers: rows.map(serializeOfficer) });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = createOfficerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const name = parsed.data.name.trim();
  const initials = name
    .split(/\s+/)
    .map((p) => p[0])
    .join("")
    .toUpperCase();

  const id = `OFF-${Date.now()}`;
  const [row] = await db
    .insert(officers)
    .values({
      id,
      name,
      region: parsed.data.region,
      phone: parsed.data.phone,
      email: parsed.data.email,
      initials,
      status: "Offline",
      dailyTarget: parsed.data.dailyTarget,
      lastCheckIn: new Date(),
    })
    .returning();

  return NextResponse.json({ officer: serializeOfficer(row) }, { status: 201 });
}
