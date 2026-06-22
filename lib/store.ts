"use client";

import { create } from "zustand";
import { api } from "@/lib/api";
import { clearQueue, enqueue, getQueue } from "@/lib/offline-queue";
import type {
  ActivityEvent,
  Asset,
  Complaint,
  ComplaintStatus,
  DailySummary,
  FieldSiteTask,
  GeneratedReport,
  Inspection,
  InspectionFormData,
  Officer,
  PendingSyncItem,
} from "@/lib/types";

function mergeFieldTasks(
  officerId: string,
  assets: Asset[],
  existing: Record<string, FieldSiteTask>
): Record<string, FieldSiteTask> {
  const assigned = assets.filter((a) => a.assignedOfficerId === officerId);
  const next: Record<string, FieldSiteTask> = {};
  assigned.forEach((asset) => {
    next[asset.id] = existing[asset.id] ?? { assetId: asset.id, status: "Pending", checkInAt: null };
  });
  return next;
}

interface AppState {
  officers: Officer[];
  assets: Asset[];
  inspections: Inspection[];
  complaints: Complaint[];
  dailySummaries: DailySummary[];
  reports: GeneratedReport[];
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
  flushOfflineQueue: () => Promise<void>;
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
  assignComplaint: (complaintId: string, officerId: string | null) => Promise<void>;
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
  logReport: (input: {
    reportType: string;
    format: "pdf" | "csv";
    filters: Record<string, unknown>;
    generatedBy: string;
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
  reports: [],
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
      const [officers, assets, inspections, complaints, dailySummaries, reports] =
        await Promise.all([
          api.getOfficers(),
          api.getAssets(),
          api.getInspections(),
          api.getComplaints(),
          api.getDailySummaries(),
          api.getReports(),
        ]);
      set((state) => ({
        officers,
        assets,
        inspections,
        complaints,
        dailySummaries,
        reports,
        loading: false,
        loaded: true,
        fieldTasks: state.currentFieldOfficerId
          ? mergeFieldTasks(state.currentFieldOfficerId, assets, state.fieldTasks)
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
          : mergeFieldTasks(officerId, state.assets, {}),
    })),

  toggleOfflineMode: () => {
    const nowOffline = !get().offlineMode;
    if (!nowOffline) {
      const synced = get().pendingSync.map((item) => ({ ...item, status: "synced" as const }));
      set({ offlineMode: false, pendingSync: synced });
      get().flushOfflineQueue();
    } else {
      set({ offlineMode: true });
    }
  },

  flushOfflineQueue: async () => {
    const queue = getQueue();
    if (queue.length === 0) return;
    for (const action of queue) {
      try {
        if (action.type === "check-in") {
          await api.checkIn(action.payload.officerId as string, action.payload.assetId as string);
        } else if (action.type === "inspection") {
          await api.submitInspection(
            action.payload as Parameters<typeof api.submitInspection>[0]
          );
        } else if (action.type === "complaint-status") {
          await api.updateComplaint(action.payload.complaintId as string, {
            status: action.payload.status as ComplaintStatus,
            resolutionNote: action.payload.resolutionNote as string | undefined,
          });
        }
      } catch {
        // Best-effort replay for this prototype; failed actions are dropped rather than retried.
      }
    }
    clearQueue();
    await get().loadAll();
    set((state) => ({
      pendingSync: state.pendingSync.map((item) => ({ ...item, status: "synced" })),
    }));
  },

  checkInSite: async (assetId) => {
    const officer = get().officers.find((o) => o.id === get().currentFieldOfficerId);
    const asset = get().assets.find((a) => a.id === assetId);
    if (!officer || !asset) return;

    if (get().offlineMode) {
      const now = new Date().toISOString();
      enqueue({ type: "check-in", payload: { officerId: officer.id, assetId } });
      set((state) => ({
        fieldTasks: {
          ...state.fieldTasks,
          [assetId]: { assetId, status: "Checked In", checkInAt: now },
        },
        activity: [
          pushActivity({
            type: "check-in",
            text: `Checked in at ${asset.name} (offline)`,
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
            createdAt: now,
            status: "offline",
          },
          ...state.pendingSync,
        ],
      }));
      return;
    }

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
          status: "synced",
        },
        ...state.pendingSync,
      ],
    }));
  },

  submitInspection: async (input) => {
    const officer = get().officers.find((o) => o.id === get().currentFieldOfficerId);
    const asset = get().assets.find((a) => a.id === input.assetId);
    if (!officer || !asset) return;

    if (get().offlineMode) {
      const now = new Date().toISOString();
      const localInspection: Inspection = {
        id: `LOCAL-${Date.now()}`,
        officerId: officer.id,
        assetId: input.assetId,
        formData: { ...input, submitted_at: now, synced_at: null },
      };
      enqueue({ type: "inspection", payload: { officerId: officer.id, ...input } });
      set((state) => ({
        inspections: [localInspection, ...state.inspections],
        assets: state.assets.map((a) => (a.id === input.assetId ? { ...a, lastInspected: now } : a)),
        fieldTasks: state.fieldTasks[input.assetId]
          ? {
              ...state.fieldTasks,
              [input.assetId]: { ...state.fieldTasks[input.assetId], status: "Done" },
            }
          : state.fieldTasks,
        activity: [
          pushActivity({
            type: "inspection",
            text: `Submitted inspection report for ${asset.name} (offline)`,
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
            createdAt: now,
            status: "offline",
          },
          ...state.pendingSync,
        ],
      }));
      return;
    }

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
          status: "synced",
        },
        ...state.pendingSync,
      ],
    }));
  },

  updateComplaintStatus: async (complaintId, status, resolutionNote) => {
    const officer = get().officers.find((o) => o.id === get().currentFieldOfficerId);
    const existing = get().complaints.find((c) => c.id === complaintId);
    if (!existing) return;

    if (get().offlineMode) {
      enqueue({ type: "complaint-status", payload: { complaintId, status, resolutionNote } });
      set((state) => ({
        complaints: state.complaints.map((c) =>
          c.id === complaintId
            ? {
                ...c,
                status,
                resolvedAt: status === "resolved" ? new Date().toISOString() : c.resolvedAt,
                resolutionNote: resolutionNote ?? c.resolutionNote,
              }
            : c
        ),
        activity: [
          pushActivity({
            type: "complaint",
            text: `Updated complaint ${complaintId} to "${status}" (offline)`,
            officerName: officer?.name ?? "System",
            href: `/complaints?complaint=${complaintId}`,
          }),
          ...state.activity,
        ],
      }));
      return;
    }

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

    const status =
      officerId === null
        ? existing.status === "resolved"
          ? undefined
          : "open"
        : existing.status === "open"
          ? "assigned"
          : undefined;

    const updated = await api.updateComplaint(complaintId, {
      assignedOfficerId: officerId,
      status,
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

  logReport: async (input) => {
    const created = await api.createReport(input);
    set((state) => ({ reports: [created, ...state.reports] }));
  },

  flushPendingSync: () =>
    set((state) => ({
      pendingSync: state.pendingSync.map((item) => ({ ...item, status: "synced" })),
    })),
}));
