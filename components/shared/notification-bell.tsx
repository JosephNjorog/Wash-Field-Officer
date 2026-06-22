"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { Bell, AlertTriangle, ClipboardList } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAppStore } from "@/lib/store";
import { hoursSince, timeSince } from "@/lib/utils";

interface Notification {
  id: string;
  icon: typeof AlertTriangle;
  text: string;
  time: string;
  href: string;
  urgent: boolean;
}

export function NotificationBell() {
  const router = useRouter();
  const complaints = useAppStore((s) => s.complaints);
  const assets = useAppStore((s) => s.assets);

  const notifications = useMemo<Notification[]>(() => {
    const overdue: Notification[] = complaints
      .filter((c) => c.status !== "resolved" && hoursSince(c.createdAt) > 48)
      .sort((a, b) => (a.createdAt < b.createdAt ? -1 : 1))
      .slice(0, 5)
      .map((c) => ({
        id: `complaint-${c.id}`,
        icon: ClipboardList,
        text: `${c.category} complaint at ${c.address} is overdue`,
        time: timeSince(c.createdAt),
        href: `/complaints?complaint=${c.id}`,
        urgent: true,
      }));

    const brokenAssets: Notification[] = assets
      .filter((a) => a.status === "non-functional")
      .slice(0, 5)
      .map((a) => ({
        id: `asset-${a.id}`,
        icon: AlertTriangle,
        text: `${a.name} is reported non-functional`,
        time: timeSince(a.lastInspected),
        href: `/assets?asset=${a.id}`,
        urgent: true,
      }));

    return [...overdue, ...brokenAssets];
  }, [complaints, assets]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="relative flex size-9 items-center justify-center rounded-full text-muted-foreground hover:bg-muted">
          <Bell className="size-5" />
          {notifications.length > 0 && (
            <span className="absolute right-1.5 top-1.5 flex size-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
              {notifications.length > 9 ? "9+" : notifications.length}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>Notifications</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {notifications.length === 0 ? (
          <p className="px-2 py-4 text-center text-sm text-muted-foreground">
            You&apos;re all caught up.
          </p>
        ) : (
          notifications.map((n) => (
            <DropdownMenuItem
              key={n.id}
              className="flex items-start gap-2.5 py-2"
              onClick={() => router.push(n.href)}
            >
              <n.icon className="mt-0.5 size-4 shrink-0 text-destructive" />
              <span className="min-w-0 flex-1">
                <span className="block text-sm leading-snug text-foreground">{n.text}</span>
                <span className="block text-xs text-muted-foreground">{n.time}</span>
              </span>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
