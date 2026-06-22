"use client";

import { create } from "zustand";
import seed from "@/data/seed.json";
import type {
  ActivityEvent,
  Asset,
  Complaint,
  ComplaintStatus,
  DailySummary,
  FieldSiteTask,
  Inspection,
  InspectionFormData,
  Officer,
  PendingSyncItem,
  SeedData,
} from "@/lib/types";

const data = seed as SeedData;

function buildInitialFieldTasks(officerId: string, assets: Asset[]): Record<string, FieldSiteTask> {
  const todays = assets.filter((a) => a.assignedOfficerId === officerId).slice(0, 5);
  const tasks: Record<string, FieldSiteTask> = {};
  todays.forEach((asset) => {
    tasks[asset.id] = { assetId: asset.id, status: "Pending", checkInAt: null };
  });
  return tasks;
}

interface AppState {
  officers: Officer[];
  assets: Asset[];
  inspections: Inspection[];
  complaints: Complaint[];
  dailySummaries: DailySummary[];
  activity: ActivityEvent[];
  pendingSync: PendingSyncItem[];
  offlineMode: boolean;
  fieldTasks: Record<string, FieldSiteTask>;
  currentFieldOfficerId: string | null;

  setCurrentFieldOfficer: (officerId: string) => void;
  toggleOfflineMode: () => void;
  checkInSite: (assetId: string) => void;
  submitInspection: (input: {
    assetId: string;
    water_flow_status: InspectionFormData["water_flow_status"];
    infrastructure_condition: InspectionFormData["infrastructure_condition"];
    chlorine_level: number;
    notes: string;
    photo_count: number;
    gps_lat: number;
    gps_lng: number;
  }) => void;
  updateComplaintStatus: (
    complaintId: string,
    status: ComplaintStatus,
    resolutionNote?: string
  ) => void;
  assignComplaint: (complaintId: string, officerId: string) => void;
  flushPendingSync: () => void;
}

function pushActivity(event: Omit<ActivityEvent, "id" | "time">): ActivityEvent {
  return {
    ...event,
    id: `EVT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    time: new Date().toISOString(),
  };
}

export const useAppStore = create<AppState>((set, get) => ({
  officers: data.officers,
  assets: data.assets,
  inspections: data.inspections,
  complaints: data.complaints,
  dailySummaries: data.daily_summaries,
  activity: [],
  pendingSync: [],
  offlineMode: false,
  fieldTasks: {},
  currentFieldOfficerId: null,

  setCurrentFieldOfficer: (officerId) =>
    set((state) => ({
      currentFieldOfficerId: officerId,
      fieldTasks:
        state.currentFieldOfficerId === officerId
          ? state.fieldTasks
          : buildInitialFieldTasks(officerId, state.assets),
    })),

  toggleOfflineMode: () =>
    set((state) => {
      const nowOffline = !state.offlineMode;
      if (!nowOffline) {
        const synced = state.pendingSync.map((item) => ({ ...item, status: "synced" as const }));
        return { offlineMode: false, pendingSync: synced };
      }
      return { offlineMode: true };
    }),

  checkInSite: (assetId) => {
    const officer = get().officers.find((o) => o.id === get().currentFieldOfficerId);
    const asset = get().assets.find((a) => a.id === assetId);
    if (!officer || !asset) return;
    const now = new Date().toISOString();
    set((state) => ({
      fieldTasks: {
        ...state.fieldTasks,
        [assetId]: { assetId, status: "Checked In", checkInAt: now },
      },
      activity: [
        pushActivity({
          type: "check-in",
          text: `Checked in at ${asset.name}`,
          officerName: officer.name,
        }),
        ...state.activity,
      ],
      pendingSync: state.offlineMode
        ? [
            {
              id: `SYNC-${Date.now()}`,
              type: "check-in",
              label: `Check-in: ${asset.name}`,
              createdAt: now,
              status: "pending",
            },
            ...state.pendingSync,
          ]
        : state.pendingSync,
    }));
  },

  submitInspection: (input) => {
    const officer = get().officers.find((o) => o.id === get().currentFieldOfficerId);
    const asset = get().assets.find((a) => a.id === input.assetId);
    if (!officer || !asset) return;
    const now = new Date().toISOString();
    const newInspection: Inspection = {
      id: `INS-${Math.floor(Math.random() * 100000)}`,
      officerId: officer.id,
      assetId: input.assetId,
      formData: {
        water_flow_status: input.water_flow_status,
        infrastructure_condition: input.infrastructure_condition,
        chlorine_level: input.chlorine_level,
        notes: input.notes,
        photo_count: input.photo_count,
        gps_lat: input.gps_lat,
        gps_lng: input.gps_lng,
        submitted_at: now,
        synced_at: get().offlineMode ? null : now,
      },
    };

    set((state) => ({
      inspections: [newInspection, ...state.inspections],
      assets: state.assets.map((a) =>
        a.id === input.assetId ? { ...a, lastInspected: now } : a
      ),
      fieldTasks: state.fieldTasks[input.assetId]
        ? {
            ...state.fieldTasks,
            [input.assetId]: { ...state.fieldTasks[input.assetId], status: "Done" },
          }
        : state.fieldTasks,
      activity: [
        pushActivity({
          type: "inspection",
          text: `Submitted inspection report for ${asset.name}`,
          officerName: officer.name,
        }),
        ...state.activity,
      ],
      pendingSync: [
        {
          id: `SYNC-${Date.now()}`,
          type: "inspection",
          label: `Inspection: ${asset.name}`,
          createdAt: now,
          status: state.offlineMode ? "offline" : "synced",
        },
        ...state.pendingSync,
      ],
    }));
  },

  updateComplaintStatus: (complaintId, status, resolutionNote) => {
    const officer = get().officers.find((o) => o.id === get().currentFieldOfficerId);
    const complaint = get().complaints.find((c) => c.id === complaintId);
    if (!complaint) return;
    const now = new Date().toISOString();
    set((state) => ({
      complaints: state.complaints.map((c) =>
        c.id === complaintId
          ? {
              ...c,
              status,
              resolvedAt: status === "resolved" ? now : c.resolvedAt,
              resolutionNote: resolutionNote ?? c.resolutionNote,
            }
          : c
      ),
      activity: [
        pushActivity({
          type: "complaint",
          text: `Updated complaint ${complaint.id} to "${status}"`,
          officerName: officer?.name ?? "System",
        }),
        ...state.activity,
      ],
    }));
  },

  assignComplaint: (complaintId, officerId) =>
    set((state) => ({
      complaints: state.complaints.map((c) =>
        c.id === complaintId
          ? { ...c, assignedOfficerId: officerId, status: c.status === "open" ? "assigned" : c.status }
          : c
      ),
    })),

  flushPendingSync: () =>
    set((state) => ({
      pendingSync: state.pendingSync.map((item) => ({ ...item, status: "synced" })),
    })),
}));
