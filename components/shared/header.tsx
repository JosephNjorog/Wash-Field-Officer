"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ChevronDown, WifiOff } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAppStore } from "@/lib/store";
import { useAuthStore } from "@/lib/auth-store";
import { initials } from "@/lib/utils";
import { GlobalSearch } from "@/components/shared/global-search";
import { NotificationBell } from "@/components/shared/notification-bell";

const TITLES: Record<string, string> = {
  "/dashboard": "Management Dashboard",
  "/assets": "Infrastructure Asset Registry",
  "/complaints": "Complaint Management Queue",
  "/reports": "Report Builder",
  "/settings": "Settings",
};

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const offlineMode = useAppStore((s) => s.offlineMode);
  const toggleOfflineMode = useAppStore((s) => s.toggleOfflineMode);
  const session = useAuthStore((s) => s.session);
  const logout = useAuthStore((s) => s.logout);
  const [now, setNow] = useState<Date | null>(null);
  const name = session?.name || "Supervisor";
  const userInitials = name ? initials(name) : "U";

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(id);
  }, []);

  const title =
    Object.entries(TITLES).find(([prefix]) => pathname.startsWith(prefix))?.[1] ??
    "FieldWatch";

  return (
    <header className="flex h-16 items-center justify-between gap-4 border-b border-border bg-white px-6">
      <div className="min-w-0">
        <h1 className="truncate text-lg font-semibold text-foreground">{title}</h1>
        {now && (
          <p className="text-xs text-muted-foreground">
            {now.toLocaleDateString("en-KE", { weekday: "long", day: "2-digit", month: "long", year: "numeric" })}
            {" · "}
            {now.toLocaleTimeString("en-KE", { hour: "2-digit", minute: "2-digit" })}
          </p>
        )}
      </div>

      <div className="hidden max-w-md flex-1 items-center md:flex">
        <GlobalSearch />
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden items-center gap-2 lg:flex">
          {offlineMode && <WifiOff className="size-4 text-destructive" />}
          <span className="text-xs font-medium text-muted-foreground">Simulate Offline</span>
          <Switch checked={offlineMode} onCheckedChange={toggleOfflineMode} />
        </div>

        <NotificationBell />

        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-muted">
            <div className="flex size-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
              {userInitials}
            </div>
            <div className="hidden text-left sm:block">
              <p className="text-sm font-medium leading-tight">{name}</p>
              <p className="text-xs text-muted-foreground">Supervisor</p>
            </div>
            <ChevronDown className="size-4 text-muted-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Account Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                logout();
                router.push("/login");
              }}
            >
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
