import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { AssetStatus, AssetType, ComplaintStatus, OfficerStatus } from "@/lib/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(iso: string, opts: Intl.DateTimeFormatOptions = {}) {
  return new Date(iso).toLocaleDateString("en-KE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    ...opts,
  });
}

export function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-KE", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-KE", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function timeSince(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function hoursSince(iso: string): number {
  return (Date.now() - new Date(iso).getTime()) / 3600000;
}

export const ASSET_TYPE_LABELS: Record<AssetType, string> = {
  water_kiosk: "Water Kiosk",
  borehole: "Borehole",
  pipeline: "Pipeline",
  sanitation_block: "Sanitation Block",
};

export const ASSET_STATUS_LABELS: Record<AssetStatus, string> = {
  functional: "Functional",
  "needs-repair": "Needs Repair",
  "non-functional": "Non-Functional",
  decommissioned: "Decommissioned",
};

export const ASSET_STATUS_COLORS: Record<AssetStatus, string> = {
  functional: "#2D6A4F",
  "needs-repair": "#856404",
  "non-functional": "#C0392B",
  decommissioned: "#6B7280",
};

export const OFFICER_STATUS_COLORS: Record<OfficerStatus, string> = {
  Active: "bg-success/15 text-success border-success/30",
  Offline: "bg-muted text-muted-foreground border-border",
  Overdue: "bg-destructive/15 text-destructive border-destructive/30",
  Inactive: "bg-muted text-muted-foreground border-border opacity-60",
};

export const COMPLAINT_STATUS_LABELS: Record<ComplaintStatus, string> = {
  open: "Open",
  assigned: "Assigned",
  "in-progress": "In Progress",
  resolved: "Resolved",
};

export const COMPLAINT_STATUS_COLORS: Record<ComplaintStatus, string> = {
  open: "bg-destructive/10 text-destructive border-destructive/30",
  assigned: "bg-secondary/10 text-secondary border-secondary/30",
  "in-progress": "bg-warning/10 text-warning border-warning/30",
  resolved: "bg-success/10 text-success border-success/30",
};

export function pseudoDistanceKm(id: string): number {
  const sum = id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return parseFloat((0.4 + (sum % 47) / 10).toFixed(1));
}

export function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}
