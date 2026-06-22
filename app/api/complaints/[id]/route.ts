import { NextResponse, type NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { complaints } from "@/lib/db/schema";
import { serializeComplaint } from "@/lib/db/serializers";

export const dynamic = "force-dynamic";

const patchSchema = z.object({
  status: z.enum(["open", "assigned", "in-progress", "resolved"]).optional(),
  assignedOfficerId: z.string().nullable().optional(),
  resolutionNote: z.string().nullable().optional(),
});

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const body = await request.json();
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const patch: Partial<typeof complaints.$inferInsert> = {};
  if (parsed.data.status) {
    patch.status = parsed.data.status;
    if (parsed.data.status === "resolved") patch.resolvedAt = new Date();
  }
  if (parsed.data.assignedOfficerId !== undefined) {
    patch.assignedOfficerId = parsed.data.assignedOfficerId;
  }
  if (parsed.data.resolutionNote !== undefined) {
    patch.resolutionNote = parsed.data.resolutionNote;
  }

  const [row] = await db
    .update(complaints)
    .set(patch)
    .where(eq(complaints.id, params.id))
    .returning();

  if (!row) {
    return NextResponse.json({ error: "Complaint not found" }, { status: 404 });
  }

  return NextResponse.json({ complaint: serializeComplaint(row) });
}
