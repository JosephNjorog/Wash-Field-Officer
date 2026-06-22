import { NextResponse } from "next/server";
import { getAssets } from "@/lib/server-data";

export async function GET() {
  return NextResponse.json({ assets: getAssets() });
}
