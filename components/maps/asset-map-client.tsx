"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

export const AssetMapClient = dynamic(
  () => import("@/components/maps/asset-map").then((m) => m.AssetMap),
  {
    ssr: false,
    loading: () => <Skeleton className="h-[440px] w-full rounded-lg" />,
  }
);
