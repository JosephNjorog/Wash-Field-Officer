import { config } from "dotenv";
config({ path: ".env.local" });

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "@/lib/db/schema";
import seed from "@/data/seed.json";
import type { SeedData } from "@/lib/types";

const data = seed as SeedData;

async function main() {
  const sql = neon(process.env.DATABASE_URL!);
  const db = drizzle(sql, { schema });

  console.log("Clearing existing data...");
  await db.delete(schema.checkIns);
  await db.delete(schema.dailySummaries);
  await db.delete(schema.inspections);
  await db.delete(schema.complaints);
  await db.delete(schema.assets);
  await db.delete(schema.officers);

  console.log(`Seeding ${data.officers.length} officers...`);
  await db.insert(schema.officers).values(
    data.officers.map((o) => ({
      id: o.id,
      name: o.name,
      region: o.region,
      phone: o.phone,
      initials: o.initials,
      email: o.email,
      status: o.status,
      dailyTarget: o.dailyTarget,
      lastCheckIn: new Date(o.lastCheckIn),
    }))
  );

  console.log(`Seeding ${data.assets.length} assets...`);
  await db.insert(schema.assets).values(
    data.assets.map((a) => ({
      id: a.id,
      name: a.name,
      type: a.type,
      region: a.region,
      lat: a.lat,
      lng: a.lng,
      status: a.status,
      lastInspected: new Date(a.lastInspected),
      conditionScore: a.conditionScore,
      assignedOfficerId: a.assignedOfficerId,
    }))
  );

  console.log(`Seeding ${data.inspections.length} inspections...`);
  const inspectionRows = data.inspections.map((i) => ({
    id: i.id,
    officerId: i.officerId,
    assetId: i.assetId,
    waterFlowStatus: i.formData.water_flow_status,
    infrastructureCondition: i.formData.infrastructure_condition,
    chlorineLevel: i.formData.chlorine_level.toString(),
    notes: i.formData.notes,
    photoCount: i.formData.photo_count,
    gpsLat: i.formData.gps_lat,
    gpsLng: i.formData.gps_lng,
    submittedAt: new Date(i.formData.submitted_at),
    syncedAt: i.formData.synced_at ? new Date(i.formData.synced_at) : null,
  }));
  for (let i = 0; i < inspectionRows.length; i += 50) {
    await db.insert(schema.inspections).values(inspectionRows.slice(i, i + 50));
  }

  console.log(`Seeding ${data.complaints.length} complaints...`);
  await db.insert(schema.complaints).values(
    data.complaints.map((c) => ({
      id: c.id,
      category: c.category,
      description: c.description,
      address: c.address,
      region: c.region,
      lat: c.lat,
      lng: c.lng,
      status: c.status,
      assignedOfficerId: c.assignedOfficerId,
      createdAt: new Date(c.createdAt),
      resolvedAt: c.resolvedAt ? new Date(c.resolvedAt) : null,
      resolutionNote: c.resolutionNote,
    }))
  );

  console.log(`Seeding ${data.daily_summaries.length} daily summaries...`);
  const summaryRows = data.daily_summaries.map((s) => ({
    officerId: s.officerId,
    date: s.date,
    sitesVisited: s.sites_visited,
    reportsSubmitted: s.reports_submitted,
    complaintsHandled: s.complaints_handled,
    distanceCoveredKm: s.distance_covered_km.toString(),
  }));
  for (let i = 0; i < summaryRows.length; i += 50) {
    await db.insert(schema.dailySummaries).values(summaryRows.slice(i, i + 50));
  }

  console.log("Seed complete.");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
