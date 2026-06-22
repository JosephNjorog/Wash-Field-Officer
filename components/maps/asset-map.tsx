"use client";

import { MapContainer, TileLayer, Marker, Popup, CircleMarker, Tooltip as LeafletTooltip } from "react-leaflet";
import L from "leaflet";
import type { Asset, Officer } from "@/lib/types";
import { ASSET_STATUS_COLORS, ASSET_TYPE_LABELS, ASSET_STATUS_LABELS, formatDate } from "@/lib/utils";

const KENYA_CENTER: [number, number] = [-0.6, 37.2];

function statusIcon(color: string) {
  return L.divIcon({
    className: "",
    html: `<div style="width:16px;height:16px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 0 0 1px rgba(0,0,0,0.15)"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
}

interface AssetMapProps {
  assets: Asset[];
  officers?: Officer[];
  showOfficers?: boolean;
  officerLocations?: { officer: Officer; lat: number; lng: number }[];
  selectedAssetId?: string | null;
  onAssetSelect?: (asset: Asset) => void;
  height?: number;
  zoom?: number;
  center?: [number, number];
}

export function AssetMap({
  assets,
  showOfficers,
  officerLocations = [],
  onAssetSelect,
  height = 440,
  zoom = 6.4,
  center = KENYA_CENTER,
}: AssetMapProps) {
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

      {assets.map((asset) => (
        <Marker
          key={asset.id}
          position={[asset.lat, asset.lng]}
          icon={statusIcon(ASSET_STATUS_COLORS[asset.status])}
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
            radius={12}
            pathOptions={{ color: "#2E6DB4", fillColor: "#2E6DB4", fillOpacity: 0.9, weight: 2 }}
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
