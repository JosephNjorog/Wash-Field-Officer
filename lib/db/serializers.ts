import type * as schema from "@/lib/db/schema";
import type { Asset, Complaint, DailySummary, GeneratedReport, Inspection, Officer } from "@/lib/types";

type OfficerRow = typeof schema.officers.$inferSelect;
type AssetRow = typeof schema.assets.$inferSelect;
type InspectionRow = typeof schema.inspections.$inferSelect;
type ComplaintRow = typeof schema.complaints.$inferSelect;
type DailySummaryRow = typeof schema.dailySummaries.$inferSelect;
type ReportRow = typeof schema.reports.$inferSelect;

export function serializeOfficer(row: OfficerRow): Officer {
  return {
    id: row.id,
    name: row.name,
    region: row.region,
    phone: row.phone,
    initials: row.initials,
    email: row.email,
    status: row.status,
    dailyTarget: row.dailyTarget,
    lastCheckIn: row.lastCheckIn.toISOString(),
  };
}

export function serializeAsset(row: AssetRow): Asset {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    region: row.region,
    lat: row.lat,
    lng: row.lng,
    status: row.status,
    lastInspected: row.lastInspected.toISOString(),
    conditionScore: row.conditionScore,
    assignedOfficerId: row.assignedOfficerId ?? "",
  };
}

export function serializeInspection(row: InspectionRow): Inspection {
  return {
    id: row.id,
    officerId: row.officerId,
    assetId: row.assetId,
    formData: {
      water_flow_status: row.waterFlowStatus,
      infrastructure_condition: row.infrastructureCondition,
      chlorine_level: Number(row.chlorineLevel),
      notes: row.notes,
      photo_count: row.photoCount,
      gps_lat: row.gpsLat,
      gps_lng: row.gpsLng,
      submitted_at: row.submittedAt.toISOString(),
      synced_at: row.syncedAt ? row.syncedAt.toISOString() : null,
    },
  };
}

export function serializeComplaint(row: ComplaintRow): Complaint {
  return {
    id: row.id,
    category: row.category,
    description: row.description,
    address: row.address,
    region: row.region,
    lat: row.lat,
    lng: row.lng,
    status: row.status,
    assignedOfficerId: row.assignedOfficerId,
    createdAt: row.createdAt.toISOString(),
    resolvedAt: row.resolvedAt ? row.resolvedAt.toISOString() : null,
    resolutionNote: row.resolutionNote,
  };
}

export function serializeDailySummary(row: DailySummaryRow): DailySummary {
  return {
    officerId: row.officerId,
    date: row.date,
    sites_visited: row.sitesVisited,
    reports_submitted: row.reportsSubmitted,
    complaints_handled: row.complaintsHandled,
    distance_covered_km: Number(row.distanceCoveredKm),
  };
}

export function serializeReport(row: ReportRow): GeneratedReport {
  return {
    id: row.id,
    reportType: row.reportType,
    format: row.format as "pdf" | "csv",
    filters: row.filters as Record<string, unknown>,
    generatedBy: row.generatedBy,
    createdAt: row.createdAt.toISOString(),
  };
}
