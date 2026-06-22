import seed from "@/data/seed.json";
import type { Asset, Complaint, ComplaintStatus, DailySummary, Inspection, Officer, SeedData } from "@/lib/types";

const data = seed as SeedData;

const officers: Officer[] = structuredClone(data.officers);
const assets: Asset[] = structuredClone(data.assets);
const inspections: Inspection[] = structuredClone(data.inspections);
const complaints: Complaint[] = structuredClone(data.complaints);
const dailySummaries: DailySummary[] = structuredClone(data.daily_summaries);

export function getOfficers() {
  return officers;
}

export function getAssets() {
  return assets;
}

export function getInspections() {
  return inspections;
}

export function getComplaints() {
  return complaints;
}

export function getDailySummaries() {
  return dailySummaries;
}

export function addInspection(inspection: Inspection) {
  inspections.unshift(inspection);
  const asset = assets.find((a) => a.id === inspection.assetId);
  if (asset) asset.lastInspected = inspection.formData.submitted_at;
  return inspection;
}

export function updateComplaint(
  id: string,
  patch: Partial<Pick<Complaint, "status" | "assignedOfficerId" | "resolutionNote">>
) {
  const complaint = complaints.find((c) => c.id === id);
  if (!complaint) return null;
  if (patch.status) {
    complaint.status = patch.status as ComplaintStatus;
    if (patch.status === "resolved") complaint.resolvedAt = new Date().toISOString();
  }
  if (patch.assignedOfficerId !== undefined) complaint.assignedOfficerId = patch.assignedOfficerId;
  if (patch.resolutionNote !== undefined) complaint.resolutionNote = patch.resolutionNote;
  return complaint;
}
