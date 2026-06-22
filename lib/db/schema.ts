import {
  pgTable,
  text,
  integer,
  doublePrecision,
  numeric,
  timestamp,
  date,
  serial,
  pgEnum,
  uniqueIndex,
  jsonb,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const officerStatusEnum = pgEnum("officer_status", [
  "Active",
  "Offline",
  "Overdue",
  "Inactive",
]);
export const assetTypeEnum = pgEnum("asset_type", [
  "water_kiosk",
  "borehole",
  "pipeline",
  "sanitation_block",
]);
export const assetStatusEnum = pgEnum("asset_status", [
  "functional",
  "needs-repair",
  "non-functional",
  "decommissioned",
]);
export const waterFlowEnum = pgEnum("water_flow_status", ["Normal", "Reduced", "No Flow"]);
export const infrastructureConditionEnum = pgEnum("infrastructure_condition", [
  "Good",
  "Fair",
  "Poor",
  "Critical",
]);
export const complaintCategoryEnum = pgEnum("complaint_category", [
  "No Water",
  "Low Pressure",
  "Dirty Water",
  "Broken Kiosk",
  "Sanitation Issue",
]);
export const complaintStatusEnum = pgEnum("complaint_status", [
  "open",
  "assigned",
  "in-progress",
  "resolved",
]);

export const officers = pgTable("officers", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  region: text("region").notNull(),
  phone: text("phone").notNull(),
  initials: text("initials").notNull(),
  email: text("email").notNull(),
  status: officerStatusEnum("status").notNull(),
  dailyTarget: integer("daily_target").notNull(),
  lastCheckIn: timestamp("last_check_in", { withTimezone: true }).notNull(),
});

export const assets = pgTable("assets", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  type: assetTypeEnum("type").notNull(),
  region: text("region").notNull(),
  lat: doublePrecision("lat").notNull(),
  lng: doublePrecision("lng").notNull(),
  status: assetStatusEnum("status").notNull(),
  lastInspected: timestamp("last_inspected", { withTimezone: true }).notNull(),
  conditionScore: integer("condition_score").notNull(),
  assignedOfficerId: text("assigned_officer_id").references(() => officers.id),
});

export const inspections = pgTable("inspections", {
  id: text("id").primaryKey(),
  officerId: text("officer_id")
    .notNull()
    .references(() => officers.id),
  assetId: text("asset_id")
    .notNull()
    .references(() => assets.id),
  waterFlowStatus: waterFlowEnum("water_flow_status").notNull(),
  infrastructureCondition: infrastructureConditionEnum("infrastructure_condition").notNull(),
  chlorineLevel: numeric("chlorine_level", { precision: 5, scale: 2 }).notNull(),
  notes: text("notes").notNull(),
  photoCount: integer("photo_count").notNull().default(0),
  gpsLat: doublePrecision("gps_lat").notNull(),
  gpsLng: doublePrecision("gps_lng").notNull(),
  submittedAt: timestamp("submitted_at", { withTimezone: true }).notNull(),
  syncedAt: timestamp("synced_at", { withTimezone: true }),
});

export const complaints = pgTable("complaints", {
  id: text("id").primaryKey(),
  category: complaintCategoryEnum("category").notNull(),
  description: text("description").notNull(),
  address: text("address").notNull(),
  region: text("region").notNull(),
  lat: doublePrecision("lat").notNull(),
  lng: doublePrecision("lng").notNull(),
  status: complaintStatusEnum("status").notNull(),
  assignedOfficerId: text("assigned_officer_id").references(() => officers.id),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
  resolvedAt: timestamp("resolved_at", { withTimezone: true }),
  resolutionNote: text("resolution_note"),
});

export const dailySummaries = pgTable(
  "daily_summaries",
  {
    id: serial("id").primaryKey(),
    officerId: text("officer_id")
      .notNull()
      .references(() => officers.id),
    date: date("date").notNull(),
    sitesVisited: integer("sites_visited").notNull(),
    reportsSubmitted: integer("reports_submitted").notNull(),
    complaintsHandled: integer("complaints_handled").notNull(),
    distanceCoveredKm: numeric("distance_covered_km", { precision: 6, scale: 2 }).notNull(),
  },
  (table) => ({
    officerDateIdx: uniqueIndex("daily_summaries_officer_date_idx").on(
      table.officerId,
      table.date
    ),
  })
);

export const checkIns = pgTable("check_ins", {
  id: serial("id").primaryKey(),
  officerId: text("officer_id")
    .notNull()
    .references(() => officers.id),
  assetId: text("asset_id")
    .notNull()
    .references(() => assets.id),
  checkedInAt: timestamp("checked_in_at", { withTimezone: true }).notNull().defaultNow(),
});

export const reports = pgTable("reports", {
  id: text("id").primaryKey(),
  reportType: text("report_type").notNull(),
  format: text("format").notNull(),
  filters: jsonb("filters").notNull(),
  generatedBy: text("generated_by").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const appSettings = pgTable("app_settings", {
  key: text("key").primaryKey(),
  value: jsonb("value").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const officersRelations = relations(officers, ({ many }) => ({
  assets: many(assets),
  inspections: many(inspections),
  complaints: many(complaints),
  dailySummaries: many(dailySummaries),
  checkIns: many(checkIns),
}));

export const assetsRelations = relations(assets, ({ one, many }) => ({
  assignedOfficer: one(officers, {
    fields: [assets.assignedOfficerId],
    references: [officers.id],
  }),
  inspections: many(inspections),
  checkIns: many(checkIns),
}));

export const inspectionsRelations = relations(inspections, ({ one }) => ({
  officer: one(officers, { fields: [inspections.officerId], references: [officers.id] }),
  asset: one(assets, { fields: [inspections.assetId], references: [assets.id] }),
}));

export const complaintsRelations = relations(complaints, ({ one }) => ({
  assignedOfficer: one(officers, {
    fields: [complaints.assignedOfficerId],
    references: [officers.id],
  }),
}));

export const dailySummariesRelations = relations(dailySummaries, ({ one }) => ({
  officer: one(officers, { fields: [dailySummaries.officerId], references: [officers.id] }),
}));

export const checkInsRelations = relations(checkIns, ({ one }) => ({
  officer: one(officers, { fields: [checkIns.officerId], references: [officers.id] }),
  asset: one(assets, { fields: [checkIns.assetId], references: [assets.id] }),
}));
