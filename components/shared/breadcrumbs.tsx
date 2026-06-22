"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";

const LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  assets: "Assets",
  complaints: "Complaints",
  reports: "Reports",
  settings: "Settings",
};

export function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0) return null;

  return (
    <nav className="flex items-center gap-1.5 px-6 pt-4 text-sm text-muted-foreground">
      <Home className="size-3.5" />
      {segments.map((seg, i) => {
        const href = "/" + segments.slice(0, i + 1).join("/");
        const isLast = i === segments.length - 1;
        return (
          <span key={href} className="flex items-center gap-1.5">
            <ChevronRight className="size-3.5" />
            {isLast ? (
              <span className="font-medium text-foreground">{LABELS[seg] ?? seg}</span>
            ) : (
              <Link href={href} className="hover:text-foreground">
                {LABELS[seg] ?? seg}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
