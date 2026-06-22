import { NextResponse } from "next/server";
import { getOfficers } from "@/lib/server-data";

export async function GET() {
  return NextResponse.json({ officers: getOfficers() });
}
