"use client";

import { useEffect, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  CircleMarker,
  Tooltip as LeafletTooltip,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import type { Asset, Officer } from "@/lib/types";
import { ASSET_STATUS_COLORS, ASSET_TYPE_LABELS, ASSET_STATUS_LABELS, formatDate } from "@/lib/utils";

const KENYA_CENTER: [number, number] = [-0.6, 37.2];

function statusIcon(color: string, active: boolean) {
  const size = active ? 22 : 16;
  return L.divIcon({
    className: "",
    html: `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 0 0 1px rgba(0,0,0,0.15)${
      active ? ", 0 0 0 6px rgba(46,109,180,0.25)" : ""
    }"></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

export interface FlyToTarget {
  lat: number;
  lng: number;
  zoom?: number;
}

function FlyToController({ target }: { target: FlyToTarget | null }) {
  const map = useMap();
  useEffect(() => {
    if (target) {
      map.flyTo([target.lat, target.lng], target.zoom ?? 15, { duration: 1.1 });
    }
  }, [target, map]);
  return null;
}

interface AssetMapProps {
  assets: Asset[];
  officers?: Officer[];
  showOfficers?: boolean;
  officerLocations?: { officer: Officer; lat: number; lng: number }[];
  selectedAssetId?: string | null;
  selectedOfficerId?: string | null;
  onAssetSelect?: (asset: Asset) => void;
  onOfficerSelect?: (officer: Officer) => void;
  flyTo?: FlyToTarget | null;
  height?: number;
  zoom?: number;
  center?: [number, number];
}

export function AssetMap({
  assets,
  showOfficers,
  officerLocations = [],
  selectedAssetId,
  selectedOfficerId,
  onAssetSelect,
  onOfficerSelect,
  flyTo = null,
  height = 440,
  zoom = 6.4,
  center = KENYA_CENTER,
}: AssetMapProps) {
  const markerRefs = useRef<Record<string, L.Marker | null>>({});

  useEffect(() => {
    if (selectedAssetId && markerRefs.current[selectedAssetId]) {
      markerRefs.current[selectedAssetId]?.openPopup();
    }
  }, [selectedAssetId]);

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      style={{ height, width: "100%" }}
      className="z-0 rounded-lg"
      scrollWheelZoom={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <FlyToController target={flyTo} />

      {assets.map((asset) => (
        <Marker
          key={asset.id}
          position={[asset.lat, asset.lng]}
          icon={statusIcon(ASSET_STATUS_COLORS[asset.status], asset.id === selectedAssetId)}
          ref={(el) => {
            markerRefs.current[asset.id] = el;
          }}
          eventHandlers={{
            click: () => onAssetSelect?.(asset),
          }}
        >
          <Popup>
            <div className="min-w-[180px] space-y-1 text-sm">
              <p className="font-semibold text-foreground">{asset.name}</p>
              <p className="text-muted-foreground">{ASSET_TYPE_LABELS[asset.type]}</p>
              <p>
                Status:{" "}
                <span className="font-medium">{ASSET_STATUS_LABELS[asset.status]}</span>
              </p>
              <p className="text-muted-foreground">
                Last inspected: {formatDate(asset.lastInspected)}
              </p>
            </div>
          </Popup>
        </Marker>
      ))}

      {showOfficers &&
        officerLocations.map(({ officer, lat, lng }) => (
          <CircleMarker
            key={officer.id}
            center={[lat, lng]}
            radius={officer.id === selectedOfficerId ? 16 : 12}
            pathOptions={{
              color: "#2E6DB4",
              fillColor: "#2E6DB4",
              fillOpacity: 0.9,
              weight: officer.id === selectedOfficerId ? 4 : 2,
            }}
            eventHandlers={{
              click: () => onOfficerSelect?.(officer),
            }}
          >
            <LeafletTooltip direction="top" permanent>
              <span className="text-[10px] font-bold">{officer.initials}</span>
            </LeafletTooltip>
            <Popup>
              <div className="text-sm">
                <p className="font-semibold">{officer.name}</p>
                <p className="text-muted-foreground">{officer.region}</p>
              </div>
            </Popup>
          </CircleMarker>
        ))}
    </MapContainer>
  );
}
