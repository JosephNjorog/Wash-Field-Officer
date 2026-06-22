import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { updateComplaint } from "@/lib/server-data";

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

  const complaint = updateComplaint(params.id, parsed.data);
  if (!complaint) {
    return NextResponse.json({ error: "Complaint not found" }, { status: 404 });
  }

  return NextResponse.json({ complaint });
}
