import { useEffect } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from "react-leaflet";
import { RISK_COLORS } from "../utils/weather";

function Fit({ points }: { points: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (points.length > 1) map.fitBounds(points as any, { padding: [24, 24], maxZoom: 11 });
    else if (points.length === 1) map.setView(points[0], 10);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [points.length]);
  return null;
}

/** Small, real Leaflet map of Panchayats coloured by risk. Used on dashboards. */
export default function MiniMap({ items, selectedId, onSelect, height = 220, interactive = false }: { items: any[]; selectedId?: string; onSelect?: (p: any) => void; height?: number; interactive?: boolean }) {
  const points = items.map((p) => [p.lat, p.lng] as [number, number]);
  return (
    <div style={{ height }} className="rounded-lg overflow-hidden border border-agri-light">
      <MapContainer center={[13.2, 79.9]} zoom={9} scrollWheelZoom={interactive} dragging={interactive} touchZoom={interactive} doubleClickZoom={interactive} style={{ height: "100%", width: "100%" }}>
        <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Fit points={points} />
        {items.map((p) => (
          <CircleMarker key={p._id} center={[p.lat, p.lng]} radius={p._id === selectedId ? 13 : 9}
            pathOptions={{ color: p._id === selectedId ? "#14402B" : "#fff", weight: p._id === selectedId ? 3 : 2, fillColor: RISK_COLORS[p.riskLevel] || "#888", fillOpacity: 0.9 }}
            eventHandlers={{ click: () => onSelect && onSelect(p) }}>
            <Popup><strong>{p.name}</strong><br />{p.temperatureC != null ? `${p.temperatureC}°C · ${p.rainProbabilityPct}% rain` : p.block}</Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}
