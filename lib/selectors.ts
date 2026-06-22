import type {
  ActivityEvent,
  Asset,
  Complaint,
  DailySummary,
  Inspection,
  Officer,
} from "@/lib/types";

export const TODAY_STR = "2026-06-22";

export function todaySummaryFor(officerId: string, summaries: DailySummary[]) {
  return summaries.find((s) => s.officerId === officerId && s.date === TODAY_STR);
}

export function officerLastCheckIn(officer: Officer) {
  return officer.lastCheckIn;
}

export function buildSeedActivity(
  officers: Officer[],
  assets: Asset[],
  inspections: Inspection[],
  complaints: Complaint[]
): ActivityEvent[] {
  const officerById = new Map(officers.map((o) => [o.id, o]));
  const assetById = new Map(assets.map((a) => [a.id, a]));

  const inspectionEvents: ActivityEvent[] = inspections.slice(0, 12).map((insp) => {
    const officer = officerById.get(insp.officerId);
    const asset = assetById.get(insp.assetId);
    const flagged = insp.formData.infrastructure_condition === "Critical" || insp.formData.infrastructure_condition === "Poor";
    return {
      id: `ACT-${insp.id}`,
      type: flagged ? "issue" : "inspection",
      text: flagged
        ? `Flagged ${asset?.name ?? "asset"} as ${insp.formData.infrastructure_condition}`
        : `Submitted inspection report for ${asset?.name ?? "asset"}`,
      officerName: officer?.name ?? "Unknown Officer",
      time: insp.formData.submitted_at,
      href: asset ? `/assets?asset=${asset.id}` : undefined,
    };
  });

  const complaintEvents: ActivityEvent[] = complaints.slice(0, 8).map((c) => {
    const officer = officerById.get(c.assignedOfficerId ?? "");
    return {
      id: `ACT-${c.id}`,
      type: "complaint",
      text: `Logged complaint: ${c.category} at ${c.address}`,
      officerName: officer?.name ?? "Unassigned",
      time: c.createdAt,
      href: `/complaints?complaint=${c.id}`,
    };
  });

  return [...inspectionEvents, ...complaintEvents].sort((a, b) =>
    a.time < b.time ? 1 : -1
  );
}
