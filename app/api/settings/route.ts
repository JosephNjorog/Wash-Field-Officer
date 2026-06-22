import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { appSettings } from "@/lib/db/schema";

export const dynamic = "force-dynamic";

const DEFAULT_SUPERVISOR_PROFILE = {
  name: "James Kariuki",
  email: "james.kariuki@fieldwatch.go.ke",
};

const DEFAULT_SYSTEM_PREFERENCES = {
  emailNotifications: true,
  smsAlerts: true,
  autoSync: true,
  defaultDailyTarget: 6,
};

export async function GET() {
  const rows = await db.select().from(appSettings);
  const map = new Map(rows.map((r) => [r.key, r.value]));
  return NextResponse.json({
    supervisorProfile: map.get("supervisor_profile") ?? DEFAULT_SUPERVISOR_PROFILE,
    systemPreferences: map.get("system_preferences") ?? DEFAULT_SYSTEM_PREFERENCES,
  });
}

const patchSchema = z.object({
  key: z.enum(["supervisor_profile", "system_preferences"]),
  value: z.record(z.string(), z.unknown()),
});

export async function PATCH(request: NextRequest) {
  const body = await request.json();
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  await db
    .insert(appSettings)
    .values({ key: parsed.data.key, value: parsed.data.value })
    .onConflictDoUpdate({
      target: appSettings.key,
      set: { value: parsed.data.value, updatedAt: new Date() },
    });

  return NextResponse.json({ key: parsed.data.key, value: parsed.data.value });
}
