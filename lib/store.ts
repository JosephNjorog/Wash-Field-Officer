"use client";

import { create } from "zustand";
import { api } from "@/lib/api";
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
} from "@/lib/types";

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
  loading: boolean;
  loaded: boolean;
  loadError: string | null;

  loadAll: () => Promise<void>;
  setCurrentFieldOfficer: (officerId: string) => void;
  toggleOfflineMode: () => void;
  checkInSite: (assetId: string) => Promise<void>;
  submitInspection: (input: {
    assetId: string;
    water_flow_status: InspectionFormData["water_flow_status"];
    infrastructure_condition: InspectionFormData["infrastructure_condition"];
    chlorine_level: number;
    notes: string;
    photo_count: number;
    gps_lat: number;
    gps_lng: number;
  }) => Promise<void>;
  updateComplaintStatus: (
    complaintId: string,
    status: ComplaintStatus,
    resolutionNote?: string
  ) => Promise<void>;
  assignComplaint: (complaintId: string, officerId: string) => Promise<void>;
  updateOfficer: (
    officerId: string,
    patch: {
      name?: string;
      region?: string;
      phone?: string;
      email?: string;
      status?: Officer["status"];
      dailyTarget?: number;
    }
  ) => Promise<void>;
  createOfficer: (input: {
    name: string;
    region: string;
    phone: string;
    email: string;
    dailyTarget: number;
  }) => Promise<void>;
  updateAsset: (
    assetId: string,
    patch: { assignedOfficerId?: string; status?: Asset["status"]; conditionScore?: number }
  ) => Promise<void>;
  createComplaint: (input: {
    category: Complaint["category"];
    description: string;
    address: string;
    region: string;
    lat: number;
    lng: number;
    assignedOfficerId?: string | null;
    assetId?: string;
  }) => Promise<void>;
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
  officers: [],
  assets: [],
  inspections: [],
  complaints: [],
  dailySummaries: [],
  activity: [],
  pendingSync: [],
  offlineMode: false,
  fieldTasks: {},
  currentFieldOfficerId: null,
  loading: false,
  loaded: false,
  loadError: null,

  loadAll: async () => {
    if (get().loading) return;
    set({ loading: true, loadError: null });
    try {
      const [officers, assets, inspections, complaints, dailySummaries] = await Promise.all([
        api.getOfficers(),
        api.getAssets(),
        api.getInspections(),
        api.getComplaints(),
        api.getDailySummaries(),
      ]);
      set((state) => ({
        officers,
        assets,
        inspections,
        complaints,
        dailySummaries,
        loading: false,
        loaded: true,
        fieldTasks:
          state.currentFieldOfficerId && Object.keys(state.fieldTasks).length === 0
            ? buildInitialFieldTasks(state.currentFieldOfficerId, assets)
            : state.fieldTasks,
      }));
    } catch (err) {
      set({ loading: false, loadError: err instanceof Error ? err.message : "Failed to load data" });
    }
  },

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

  checkInSite: async (assetId) => {
    const officer = get().officers.find((o) => o.id === get().currentFieldOfficerId);
    const asset = get().assets.find((a) => a.id === assetId);
    if (!officer || !asset) return;

    const result = await api.checkIn(officer.id, assetId);

    set((state) => ({
      fieldTasks: {
        ...state.fieldTasks,
        [assetId]: { assetId, status: "Checked In", checkInAt: result.checkedInAt },
      },
      activity: [
        pushActivity({
          type: "check-in",
          text: `Checked in at ${asset.name}`,
          officerName: officer.name,
          href: `/assets?asset=${asset.id}`,
        }),
        ...state.activity,
      ],
      pendingSync: [
        {
          id: `SYNC-${Date.now()}`,
          type: "check-in",
          label: `Check-in: ${asset.name}`,
          createdAt: result.checkedInAt,
          status: state.offlineMode ? "pending" : "synced",
        },
        ...state.pendingSync,
      ],
    }));
  },

  submitInspection: async (input) => {
    const officer = get().officers.find((o) => o.id === get().currentFieldOfficerId);
    const asset = get().assets.find((a) => a.id === input.assetId);
    if (!officer || !asset) return;

    const inspection = await api.submitInspection({ officerId: officer.id, ...input });

    set((state) => ({
      inspections: [inspection, ...state.inspections],
      assets: state.assets.map((a) =>
        a.id === input.assetId ? { ...a, lastInspected: inspection.formData.submitted_at } : a
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
          href: `/assets?asset=${asset.id}`,
        }),
        ...state.activity,
      ],
      pendingSync: [
        {
          id: `SYNC-${Date.now()}`,
          type: "inspection",
          label: `Inspection: ${asset.name}`,
          createdAt: inspection.formData.submitted_at,
          status: state.offlineMode ? "offline" : "synced",
        },
        ...state.pendingSync,
      ],
    }));
  },

  updateComplaintStatus: async (complaintId, status, resolutionNote) => {
    const officer = get().officers.find((o) => o.id === get().currentFieldOfficerId);
    const existing = get().complaints.find((c) => c.id === complaintId);
    if (!existing) return;

    const updated = await api.updateComplaint(complaintId, { status, resolutionNote });

    set((state) => ({
      complaints: state.complaints.map((c) => (c.id === complaintId ? updated : c)),
      activity: [
        pushActivity({
          type: "complaint",
          text: `Updated complaint ${complaintId} to "${status}"`,
          officerName: officer?.name ?? "System",
          href: `/complaints?complaint=${complaintId}`,
        }),
        ...state.activity,
      ],
    }));
  },

  assignComplaint: async (complaintId, officerId) => {
    const existing = get().complaints.find((c) => c.id === complaintId);
    if (!existing) return;

    const updated = await api.updateComplaint(complaintId, {
      assignedOfficerId: officerId,
      status: existing.status === "open" ? "assigned" : undefined,
    });

    set((state) => ({
      complaints: state.complaints.map((c) => (c.id === complaintId ? updated : c)),
    }));
  },

  updateOfficer: async (officerId, patch) => {
    const updated = await api.updateOfficer(officerId, patch);
    set((state) => ({
      officers: state.officers.map((o) => (o.id === officerId ? updated : o)),
    }));
  },

  createOfficer: async (input) => {
    const created = await api.createOfficer(input);
    set((state) => ({ officers: [...state.officers, created] }));
  },

  updateAsset: async (assetId, patch) => {
    const updated = await api.updateAsset(assetId, patch);
    set((state) => ({
      assets: state.assets.map((a) => (a.id === assetId ? updated : a)),
    }));
  },

  createComplaint: async (input) => {
    const created = await api.createComplaint(input);
    set((state) => ({ complaints: [created, ...state.complaints] }));
  },

  flushPendingSync: () =>
    set((state) => ({
      pendingSync: state.pendingSync.map((item) => ({ ...item, status: "synced" })),
    })),
}));
