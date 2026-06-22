export type OfficerStatus = "Active" | "Offline" | "Overdue";

export interface Officer {
  id: string;
  name: string;
  region: string;
  phone: string;
  initials: string;
  email: string;
  status: OfficerStatus;
  dailyTarget: number;
  lastCheckIn: string;
}

export type AssetType = "water_kiosk" | "borehole" | "pipeline" | "sanitation_block";
export type AssetStatus = "functional" | "needs-repair" | "non-functional";

export interface Asset {
  id: string;
  name: string;
  type: AssetType;
  region: string;
  lat: number;
  lng: number;
  status: AssetStatus;
  lastInspected: string;
  conditionScore: number;
  assignedOfficerId: string;
}

export type WaterFlowStatus = "Normal" | "Reduced" | "No Flow";
export type InfrastructureCondition = "Good" | "Fair" | "Poor" | "Critical";

export interface InspectionFormData {
  water_flow_status: WaterFlowStatus;
  infrastructure_condition: InfrastructureCondition;
  chlorine_level: number;
  notes: string;
  photo_count: number;
  gps_lat: number;
  gps_lng: number;
  submitted_at: string;
  synced_at: string | null;
}

export interface Inspection {
  id: string;
  officerId: string;
  assetId: string;
  formData: InspectionFormData;
}

export type ComplaintCategory =
  | "No Water"
  | "Low Pressure"
  | "Dirty Water"
  | "Broken Kiosk"
  | "Sanitation Issue";

export type ComplaintStatus = "open" | "assigned" | "in-progress" | "resolved";

export interface Complaint {
  id: string;
  category: ComplaintCategory;
  description: string;
  address: string;
  region: string;
  lat: number;
  lng: number;
  status: ComplaintStatus;
  assignedOfficerId: string | null;
  createdAt: string;
  resolvedAt: string | null;
  resolutionNote: string | null;
}

export interface DailySummary {
  officerId: string;
  date: string;
  sites_visited: number;
  reports_submitted: number;
  complaints_handled: number;
  distance_covered_km: number;
}

export interface SeedData {
  officers: Officer[];
  assets: Asset[];
  inspections: Inspection[];
  complaints: Complaint[];
  daily_summaries: DailySummary[];
}

export type SiteTaskStatus = "Pending" | "Checked In" | "Inspected" | "Done";

export interface FieldSiteTask {
  assetId: string;
  status: SiteTaskStatus;
  checkInAt: string | null;
}

export type SyncStatus = "synced" | "pending" | "offline";

export interface PendingSyncItem {
  id: string;
  type: "inspection" | "complaint-update" | "check-in";
  label: string;
  createdAt: string;
  status: SyncStatus;
}

export interface GeneratedReport {
  id: string;
  reportType: string;
  format: "pdf" | "csv";
  filters: Record<string, unknown>;
  generatedBy: string;
  createdAt: string;
}

export interface ActivityEvent {
  id: string;
  type: "inspection" | "complaint" | "issue" | "check-in";
  text: string;
  officerName: string;
  time: string;
  href?: string;
}
