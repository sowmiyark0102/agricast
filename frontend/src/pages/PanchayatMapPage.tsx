import { useEffect, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from "react-leaflet";
import { Layers } from "lucide-react";
import { api, friendlyErrorMessage } from "../services/api";
import LoadingSkeleton from "../components/LoadingSkeleton";
import ErrorState from "../components/ErrorState";
import RiskBadge from "../components/RiskBadge";
import DataQualityBadge from "../components/DataQualityBadge";
import { useLanguage } from "../context/LanguageContext";
import { useFarmSelection } from "../context/FarmSelectionContext";
import { RISK_COLORS, rainColor, tempColor } from "../utils/weather";
import { cropLabel } from "../utils/cropAssets";

type LayerKind = "risk" | "rain" | "temp";
function Fit({ points }: { points: [number, number][] }) {
  const map = useMap();
  useEffect(() => { if (points.length) map.fitBounds(points as any, { padding: [30, 30], maxZoom: 11 }); }, [points.length]); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
}

export default function PanchayatMapPage() {
  const { t, lang } = useLanguage();
  const { setPanchayat } = useFarmSelection();
  const [items, setItems] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [layer, setLayer] = useState<LayerKind>("risk");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    setLoading(true); setError(null);
    api.get("/panchayats/summary").then((r) => { setItems(r.data.panchayats); setSelected((s: any) => s || r.data.panchayats[0]); }).catch((e) => setError(friendlyErrorMessage(e))).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const colorFor = (p: any) => layer === "risk" ? RISK_COLORS[p.riskLevel] || "#999" : layer === "rain" ? rainColor(p.last3dMm) : tempColor(p.temperatureC);
  const points = items.map((p) => [p.lat, p.lng] as [number, number]);

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-4 py-6">
      <h1 className="text-2xl font-serif font-bold text-agri-forest mb-1">{t("ui.mapTitle")}</h1>
      <p className="text-sm text-gray-600 mb-4">{t("ui.mapSub")}</p>

      <div className="flex flex-wrap items-center gap-2 mb-3">
        <Layers size={16} className="text-gray-500" aria-hidden="true" />
        {(["risk", "rain", "temp"] as LayerKind[]).map((k) => (
          <button key={k} onClick={() => setLayer(k)} className={`text-xs font-semibold px-3 py-1.5 rounded-full border min-h-[36px] ${layer === k ? "bg-agri-green text-white border-agri-green" : "border-agri-green/40 text-agri-forest bg-white"}`}>
            {k === "risk" ? (lang === "ta" ? "ஆபத்து" : "Risk") : k === "rain" ? t("common.rainfall") : t("common.temperature")}
          </button>
        ))}
      </div>

      {loading && <LoadingSkeleton lines={6} />}
      {error && <ErrorState message={error} onRetry={load} />}

      {!loading && !error && (
        <div className="grid lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 h-[440px] sm:h-[500px] border border-agri-light rounded-xl overflow-hidden">
            <MapContainer center={[13.2, 79.8]} zoom={9} style={{ height: "100%", width: "100%" }}>
              <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <Fit points={points} />
              {items.map((p) => (
                <CircleMarker key={p._id} center={[p.lat, p.lng]} radius={selected?._id === p._id ? 13 : 10}
                  pathOptions={{ color: selected?._id === p._id ? "#000" : "#fff", weight: 2, fillColor: colorFor(p), fillOpacity: 0.85 }}
                  eventHandlers={{ click: () => { setSelected(p); setPanchayat(p); } }}>
                  <Popup><strong>{p.name}</strong><br />{p.block}, {p.district}<br />{p.temperatureC}°C · {p.rainProbabilityPct}%</Popup>
                </CircleMarker>
              ))}
            </MapContainer>
          </div>

          <div className="border border-agri-light rounded-xl bg-white p-5">
            {!selected ? <p className="text-sm text-gray-600">{t("ui.pickPanchayat")}</p> : (
              <div>
                <div className="flex items-center justify-between gap-2 mb-1"><h3 className="font-serif font-semibold text-lg text-agri-forest">{selected.name}</h3><RiskBadge level={selected.riskLevel} /></div>
                <p className="text-sm text-gray-600 mb-1">{selected.block}, {selected.district}</p>
                <p className="text-xs text-gray-500 mb-3">{lang === "ta" ? "முதன்மை பயிர்" : "Dominant crop"}: {cropLabel(selected.dominantCrop, lang)}</p>
                <div className="text-sm space-y-1 mb-3">
                  <p>{t("common.temperature")}: {selected.temperatureC}°C</p><p>{t("common.humidity")}: {selected.humidityPct}%</p><p>{t("common.wind")}: {selected.windKmh} km/h</p>
                  <p>{lang === "ta" ? "3 நாள் மழை" : "3-day rain"}: {selected.last3dMm} mm</p><p>{t("common.rainProbability")}: {selected.rainProbabilityPct}%</p>
                  <DataQualityBadge source={selected.source} />
                </div>
                <p className="text-xs text-gray-500 mb-3">{lang === "ta" ? "செயலில் உள்ள எச்சரிக்கைகள்" : "Active alerts"}: {selected.activeAlerts}</p>
                <button onClick={() => { window.location.href = `/weather`; }} className="w-full py-2 rounded-full bg-agri-green text-white text-sm font-semibold">{t("nav.weather")}</button>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-4 mt-4 text-xs text-gray-600">
        {layer === "risk" && <><Legend color={RISK_COLORS.NORMAL} label={t("ui.legendNormal")} /><Legend color={RISK_COLORS.CAUTION} label={t("ui.legendCaution")} /><Legend color={RISK_COLORS.HIGH_RISK} label={t("ui.legendHigh")} /></>}
        {layer === "rain" && <><Legend color="#bfdbfe" label="<15mm" /><Legend color="#60a5fa" label="15-35mm" /><Legend color="#2563eb" label="35-60mm" /><Legend color="#1e3a8a" label="60mm+" /></>}
        {layer === "temp" && <><Legend color="#fde68a" label="<27°C" /><Legend color="#f59e0b" label="27-30°C" /><Legend color="#ea580c" label="30-33°C" /><Legend color="#b91c1c" label="33°C+" /></>}
      </div>
    </div>
  );
}
function Legend({ color, label }: { color: string; label: string }) { return <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: color }} />{label}</span>; }
