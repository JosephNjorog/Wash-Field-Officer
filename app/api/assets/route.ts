import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { assets } from "@/lib/db/schema";
import { serializeAsset } from "@/lib/db/serializers";

export async function GET() {
  const rows = await db.select().from(assets);
  return NextResponse.json({ assets: rows.map(serializeAsset) });
}
