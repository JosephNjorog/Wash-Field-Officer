"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Droplets,
  LayoutDashboard,
  MapPinned,
  ClipboardList,
  FileBarChart2,
  Settings,
  ChevronsLeft,
  ChevronsRight,
  Wifi,
} from "lucide-react";
import { cn, initials } from "@/lib/utils";
import { useAuthStore } from "@/lib/auth-store";
import { useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/assets", label: "Assets", icon: MapPinned },
  { href: "/complaints", label: "Complaints", icon: ClipboardList },
  { href: "/reports", label: "Reports", icon: FileBarChart2 },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const session = useAuthStore((s) => s.session);
  const name = session?.name || "Supervisor";
  const userInitials = name ? initials(name) : "U";

  return (
    <aside
      className={cn(
        "flex h-screen flex-col border-r border-border bg-brand-primary text-white transition-all duration-200",
        collapsed ? "w-[72px]" : "w-64"
      )}
    >
      <div className="flex h-16 items-center gap-2 border-b border-white/10 px-4">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white/10">
          <Droplets className="size-5 text-white" />
        </div>
        {!collapsed && (
          <span className="text-lg font-bold tracking-tight">FieldWatch</span>
        )}
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-2 py-4">
        {NAV_ITEMS.map((item) => {
          const active = pathname.startsWith(item.href);
          const link = (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-white/15 text-white"
                  : "text-white/70 hover:bg-white/10 hover:text-white",
                collapsed && "justify-center px-0"
              )}
            >
              <item.icon className="size-[18px] shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
          if (!collapsed) return link;
          return (
            <Tooltip key={item.href}>
              <TooltipTrigger asChild>{link}</TooltipTrigger>
              <TooltipContent side="right">{item.label}</TooltipContent>
            </Tooltip>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-3">
        <div
          className={cn(
            "flex items-center gap-3 rounded-md px-2 py-2",
            collapsed && "justify-center px-0"
          )}
        >
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-semibold">
            {userInitials}
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold leading-tight">{name}</p>
              <p className="truncate text-xs text-white/60">Supervisor</p>
            </div>
          )}
        </div>
        {!collapsed && (
          <div className="mt-2 flex items-center gap-1.5 rounded-md bg-white/5 px-2 py-1.5 text-xs text-white/70">
            <Wifi className="size-3.5 text-success" />
            <span>All data synced</span>
          </div>
        )}
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="mt-2 flex w-full items-center justify-center rounded-md py-1.5 text-white/60 hover:bg-white/10 hover:text-white"
        >
          {collapsed ? (
            <ChevronsRight className="size-4" />
          ) : (
            <ChevronsLeft className="size-4" />
          )}
        </button>
      </div>
    </aside>
  );
}
