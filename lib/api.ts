import type {
  Asset,
  Complaint,
  ComplaintStatus,
  DailySummary,
  GeneratedReport,
  Inspection,
  InspectionFormData,
  Officer,
  OfficerStatus,
} from "@/lib/types";

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ? JSON.stringify(body.error) : `Request failed: ${res.status}`);
  }
  return res.json();
}

export const api = {
  getOfficers: () => request<{ officers: Officer[] }>("/api/officers").then((r) => r.officers),
  getAssets: () => request<{ assets: Asset[] }>("/api/assets").then((r) => r.assets),
  getInspections: () =>
    request<{ inspections: Inspection[] }>("/api/inspections").then((r) => r.inspections),
  getComplaints: () =>
    request<{ complaints: Complaint[] }>("/api/complaints").then((r) => r.complaints),
  getDailySummaries: () =>
    request<{ daily_summaries: DailySummary[] }>("/api/daily-summaries").then(
      (r) => r.daily_summaries
    ),
  getReports: () => request<{ reports: GeneratedReport[] }>("/api/reports").then((r) => r.reports),

  createReport: (input: {
    reportType: string;
    format: "pdf" | "csv";
    filters: Record<string, unknown>;
    generatedBy: string;
  }) =>
    request<{ report: GeneratedReport }>("/api/reports", {
      method: "POST",
      body: JSON.stringify(input),
    }).then((r) => r.report),

  checkIn: (officerId: string, assetId: string) =>
    request<{ checkedInAt: string; officer: string; asset: string }>("/api/check-in", {
      method: "POST",
      body: JSON.stringify({ officerId, assetId }),
    }),

  submitInspection: (input: {
    officerId: string;
    assetId: string;
    water_flow_status: InspectionFormData["water_flow_status"];
    infrastructure_condition: InspectionFormData["infrastructure_condition"];
    chlorine_level: number;
    notes: string;
    photo_count: number;
    gps_lat: number;
    gps_lng: number;
  }) =>
    request<{ inspection: Inspection }>("/api/inspections", {
      method: "POST",
      body: JSON.stringify(input),
    }).then((r) => r.inspection),

  updateComplaint: (
    complaintId: string,
    patch: { status?: ComplaintStatus; assignedOfficerId?: string | null; resolutionNote?: string | null }
  ) =>
    request<{ complaint: Complaint }>(`/api/complaints/${complaintId}`, {
      method: "PATCH",
      body: JSON.stringify(patch),
    }).then((r) => r.complaint),

  updateOfficer: (
    officerId: string,
    patch: {
      name?: string;
      region?: string;
      phone?: string;
      email?: string;
      status?: OfficerStatus;
      dailyTarget?: number;
    }
  ) =>
    request<{ officer: Officer }>(`/api/officers/${officerId}`, {
      method: "PATCH",
      body: JSON.stringify(patch),
    }).then((r) => r.officer),

  createOfficer: (input: {
    name: string;
    region: string;
    phone: string;
    email: string;
    dailyTarget: number;
  }) =>
    request<{ officer: Officer }>("/api/officers", {
      method: "POST",
      body: JSON.stringify(input),
    }).then((r) => r.officer),

  updateAsset: (
    assetId: string,
    patch: { assignedOfficerId?: string; status?: Asset["status"]; conditionScore?: number }
  ) =>
    request<{ asset: Asset }>(`/api/assets/${assetId}`, {
      method: "PATCH",
      body: JSON.stringify(patch),
    }).then((r) => r.asset),

  createComplaint: (input: {
    category: Complaint["category"];
    description: string;
    address: string;
    region: string;
    lat: number;
    lng: number;
    assignedOfficerId?: string | null;
    assetId?: string;
  }) =>
    request<{ complaint: Complaint }>("/api/complaints", {
      method: "POST",
      body: JSON.stringify(input),
    }).then((r) => r.complaint),
};
