import { NextResponse, type NextRequest } from "next/server";
import { getComplaints } from "@/lib/server-data";

export async function GET(request: NextRequest) {
  const status = request.nextUrl.searchParams.get("status");
  const officerId = request.nextUrl.searchParams.get("officerId");

  let complaints = getComplaints();
  if (status) complaints = complaints.filter((c) => c.status === status);
  if (officerId) complaints = complaints.filter((c) => c.assignedOfficerId === officerId);

  return NextResponse.json({ complaints });
}
