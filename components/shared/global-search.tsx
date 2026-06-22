"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, User, MapPinned, ClipboardList } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useAppStore } from "@/lib/store";
import { ASSET_TYPE_LABELS } from "@/lib/utils";

interface ResultItem {
  id: string;
  type: "officer" | "asset" | "complaint";
  title: string;
  subtitle: string;
  href: string;
}

export function GlobalSearch() {
  const router = useRouter();
  const officers = useAppStore((s) => s.officers);
  const assets = useAppStore((s) => s.assets);
  const complaints = useAppStore((s) => s.complaints);

  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const results = useMemo<ResultItem[]>(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    const officerMatches: ResultItem[] = officers
      .filter((o) => o.name.toLowerCase().includes(q) || o.region.toLowerCase().includes(q))
      .slice(0, 4)
      .map((o) => ({
        id: o.id,
        type: "officer",
        title: o.name,
        subtitle: `Officer · ${o.region}`,
        href: `/officers?officer=${o.id}`,
      }));

    const assetMatches: ResultItem[] = assets
      .filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.id.toLowerCase().includes(q) ||
          a.region.toLowerCase().includes(q)
      )
      .slice(0, 4)
      .map((a) => ({
        id: a.id,
        type: "asset",
        title: a.name,
        subtitle: `${ASSET_TYPE_LABELS[a.type]} · ${a.region}`,
        href: `/assets?asset=${a.id}`,
      }));

    const complaintMatches: ResultItem[] = complaints
      .filter(
        (c) =>
          c.category.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.address.toLowerCase().includes(q) ||
          c.id.toLowerCase().includes(q)
      )
      .slice(0, 4)
      .map((c) => ({
        id: c.id,
        type: "complaint",
        title: c.category,
        subtitle: c.address,
        href: `/complaints?complaint=${c.id}`,
      }));

    return [...officerMatches, ...assetMatches, ...complaintMatches];
  }, [query, officers, assets, complaints]);

  function handleSelect(item: ResultItem) {
    setQuery("");
    setOpen(false);
    router.push(item.href);
  }

  const ICONS = { officer: User, asset: MapPinned, complaint: ClipboardList };

  return (
    <div ref={containerRef} className="relative w-full">
      <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        placeholder="Search officers, assets, complaints..."
        className="pl-9"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => query && setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 120)}
      />
      {open && query && (
        <div className="absolute left-0 top-full z-20 mt-1 w-full overflow-hidden rounded-md border border-border bg-white shadow-lg">
          {results.length === 0 ? (
            <p className="px-3 py-3 text-sm text-muted-foreground">No matches found.</p>
          ) : (
            <ul className="max-h-80 overflow-y-auto py-1">
              {results.map((item) => {
                const Icon = ICONS[item.type];
                return (
                  <li key={`${item.type}-${item.id}`}>
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => handleSelect(item)}
                      className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm hover:bg-muted"
                    >
                      <Icon className="size-4 shrink-0 text-secondary" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-medium text-foreground">
                          {item.title}
                        </span>
                        <span className="block truncate text-xs text-muted-foreground">
                          {item.subtitle}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
