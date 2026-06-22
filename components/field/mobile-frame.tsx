"use client";

import { ListChecks, FileText, MessageSquare, BarChart3, UserCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export type FieldTab = "tasks" | "report" | "complaints" | "activity" | "profile";

const TABS: { id: FieldTab; label: string; icon: typeof ListChecks }[] = [
  { id: "tasks", label: "Tasks", icon: ListChecks },
  { id: "report", label: "Report", icon: FileText },
  { id: "complaints", label: "Complaints", icon: MessageSquare },
  { id: "activity", label: "Activity", icon: BarChart3 },
  { id: "profile", label: "Profile", icon: UserCircle },
];

export function MobileFrame({
  topBar,
  quickStats,
  activeTab,
  onTabChange,
  children,
}: {
  topBar: React.ReactNode;
  quickStats: React.ReactNode;
  activeTab: FieldTab;
  onTabChange: (tab: FieldTab) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-dark/5 py-8">
      <div className="flex h-[800px] w-[390px] flex-col overflow-hidden rounded-[2rem] border-[6px] border-brand-dark bg-brand-surface shadow-2xl">
        <div className="shrink-0 bg-brand-primary px-4 pb-3 pt-4 text-white">{topBar}</div>
        <div className="shrink-0 border-b border-border bg-white px-4 py-3">{quickStats}</div>
        <div className="flex-1 overflow-y-auto px-4 py-4">{children}</div>
        <nav className="grid shrink-0 grid-cols-5 border-t border-border bg-white">
          {TABS.map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={cn(
                  "flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors",
                  active ? "text-secondary" : "text-muted-foreground"
                )}
              >
                <tab.icon className={cn("size-5", active && "fill-current/10")} />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
