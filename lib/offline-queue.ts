const KEY = "fw_offline_queue";

export type QueuedActionType = "check-in" | "inspection" | "complaint-status";

export interface QueuedAction {
  id: string;
  type: QueuedActionType;
  payload: Record<string, unknown>;
  createdAt: string;
}

export function getQueue(): QueuedAction[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function enqueue(action: Omit<QueuedAction, "id" | "createdAt">) {
  if (typeof window === "undefined") return;
  const queue = getQueue();
  queue.push({
    ...action,
    id: `Q-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    createdAt: new Date().toISOString(),
  });
  localStorage.setItem(KEY, JSON.stringify(queue));
}

export function clearQueue() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(KEY);
}
