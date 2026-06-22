import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "@/lib/db/schema";

// `fetchOptions.cache: "no-store"` stops Next.js's fetch Data Cache from
// caching the Neon HTTP driver's underlying requests — without this, route
// handlers can silently serve stale data even when marked force-dynamic.
const sql = neon(process.env.DATABASE_URL!, {
  fetchOptions: { cache: "no-store" },
});

export const db = drizzle(sql, { schema });
