import { useEffect, useState } from "react";
import { ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend, LineChart } from "recharts";
import { Droplets, Thermometer, Wind, Cloud, CloudRain } from "lucide-react";
import { PanchayatPicker } from "../components/FarmSelectors";
import RainMemoryCard from "../components/RainMemoryCard";
import DataQualityBadge from "../components/DataQualityBadge";
import LoadingSkeleton from "../components/LoadingSkeleton";
import ErrorState from "../components/ErrorState";
import EmptyState from "../components/EmptyState";
import { useFarmSelection } from "../context/FarmSelectionContext";
import { useLanguage } from "../context/LanguageContext";
import { api, friendlyErrorMessage } from "../services/api";
import { conditionLabel } from "../utils/weather";

const PARAMS: Record<string, { key: string; en: string; ta: string; unit: string; color: string }> = {
  rainfall: { key: "rainfallMm", en: "Rainfall", ta: "மழையளவு", unit: "mm", color: "#3E6B8A" },
  temperature: { key: "temperatureC", en: "Temperature", ta: "வெப்பநிலை", unit: "°C", color: "#C2570C" },
  humidity: { key: "humidityPct", en: "Humidity", ta: "ஈரப்பதம்", unit: "%", color: "#1F5F3F" },
  wind: { key: "windKmh", en: "Wind", ta: "காற்று", unit: "km/h", color: "#6B5B95" },
};
const day = (iso: string) => new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short" });

export default function WeatherPage() {
  const { t, lang } = useLanguage();
  const { panchayat } = useFarmSelection();
  const [wx, setWx] = useState<any>(null);
  const [forecasts, setForecasts] = useState<any[]>([]);
  const [hist, setHist] = useState<any[]>([]);
  const [param, setParam] = useState("rainfall");
  const [days, setDays] = useState(7);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    if (!panchayat) return;
    setLoading(true);
    setError(null);
    const from = new Date(Date.now() - (days + 0.5) * 86400000).toISOString().slice(0, 10);
    Promise.all([
      api.get(`/panchayats/${panchayat._id}/weather`),
      api.get("/weather/forecast", { params: { panchayatId: panchayat._id } }),
      api.get("/weather/history", { params: { panchayatId: panchayat._id, from } }),
    ])
      .then(([w, f, h]) => { setWx(w.data); setForecasts(f.data.forecasts); setHist(h.data.observations); })
      .catch((e) => setError(friendlyErrorMessage(e)))
      .finally(() => setLoading(false));
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(load, [panchayat, days]);

  const obs = wx?.observation, fc = wx?.forecast;
  const P = PARAMS[param];
  const fcData = forecasts.map((f) => ({ date: day(f.forDate), rain: f.rainfallMm, min: f.expectedRainfallMinMm, max: f.expectedRainfallMaxMm, tmax: f.temperatureMaxC, tmin: f.temperatureMinC, prob: f.rainProbabilityPct }));
  const histData = hist.map((o) => ({ date: day(o.observedAt), value: o[P.key] }));

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-4 py-6 space-y-5">
      <div>
        <h1 className="text-2xl font-serif font-bold text-agri-forest">{t("ui.weatherTitle")}</h1>
        <p className="text-sm text-gray-600">{t("ui.weatherSub")}</p>
      </div>
      <div className="bg-agri-light/70 border border-agri-green/20 rounded-xl p-3"><PanchayatPicker /></div>

      {loading && !wx && <LoadingSkeleton lines={5} />}
      {error && <ErrorState message={error} onRetry={load} />}

      {wx && (
        <>
          <section className="bg-white border border-agri-light rounded-xl p-4">
            <div className="flex items-center justify-between mb-3 gap-2">
              <h2 className="font-serif font-bold text-agri-forest">{wx.panchayat.name} · {conditionLabel(obs, fc, lang)}</h2>
              <DataQualityBadge source={obs?.source} />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <Cell icon={<Thermometer size={18} />} label={t("common.temperature")} value={obs ? `${obs.temperatureC}°C` : "—"} />
              <Cell icon={<Droplets size={18} />} label={t("common.rainProbability")} value={fc ? `${fc.rainProbabilityPct}%` : "—"} />
              <Cell icon={<CloudRain size={18} />} label={t("common.expectedRainfall")} value={fc ? `${fc.expectedRainfallMinMm}–${fc.expectedRainfallMaxMm} mm` : "—"} />
              <Cell icon={<Wind size={18} />} label={t("common.wind")} value={obs ? `${obs.windKmh} km/h` : "—"} />
              <Cell icon={<Cloud size={18} />} label={t("common.humidity")} value={obs ? `${obs.humidityPct}%` : "—"} />
            </div>
          </section>

          <RainMemoryCard rm={wx.rainMemory} />

          <section className="bg-white border border-agri-light rounded-xl p-4">
            <h2 className="font-serif font-bold text-agri-forest mb-2">{t("ui.fiveDay")}</h2>
            {fcData.length === 0 ? <EmptyState message={t("common.noData")} /> : (
              <>
                <div className="h-64" role="img" aria-label={t("ui.fiveDay")}>
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={fcData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E7F0E4" />
                      <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                      <YAxis yAxisId="l" tick={{ fontSize: 12 }} unit=" mm" />
                      <YAxis yAxisId="r" orientation="right" tick={{ fontSize: 12 }} unit="°" />
                      <Tooltip /><Legend />
                      <Bar yAxisId="l" dataKey="rain" name={lang === "ta" ? "மழை (மிமீ)" : "Rain (mm)"} fill="#3E6B8A" />
                      <Line yAxisId="r" type="monotone" dataKey="tmax" name={lang === "ta" ? "அதிகபட்ச °C" : "Max °C"} stroke="#C2570C" strokeWidth={2} />
                      <Line yAxisId="r" type="monotone" dataKey="tmin" name={lang === "ta" ? "குறைந்தபட்ச °C" : "Min °C"} stroke="#1F5F3F" strokeWidth={2} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
                <div className="overflow-x-auto mt-3">
                  <table className="w-full text-sm text-left">
                    <thead className="text-gray-500 text-xs"><tr><th className="py-1 pr-3">{lang === "ta" ? "நாள்" : "Day"}</th><th className="pr-3">{t("common.rainProbability")}</th><th className="pr-3">{t("common.expectedRainfall")}</th><th>{t("common.temperature")}</th></tr></thead>
                    <tbody>{fcData.map((r) => (<tr key={r.date} className="border-t border-agri-light"><td className="py-1.5 pr-3">{r.date}</td><td className="pr-3">{r.prob}%</td><td className="pr-3">{r.min}–{r.max} mm</td><td>{r.tmin}–{r.tmax}°C</td></tr>))}</tbody>
                  </table>
                </div>
                <p className="text-xs text-gray-500 mt-2">{lang === "ta" ? "வரம்புகள் பெயரளவிலான விதி அடிப்படையிலானவை; அளவீடு செய்யப்பட்ட நம்பக இடைவெளிகள் அல்ல." : "Ranges are nominal rule-based widths, not calibrated confidence intervals."} <DataQualityBadge source={forecasts[0]?.source} /></p>
              </>
            )}
          </section>

          <section className="bg-white border border-agri-light rounded-xl p-4">
            <div className="flex flex-wrap items-end justify-between gap-3 mb-3">
              <h2 className="font-serif font-bold text-agri-forest">{t("ui.historyTitle")}</h2>
              <div className="flex gap-3">
                <label className="text-xs text-gray-600">{t("ui.parameter")}
                  <select className="block border border-agri-green/40 rounded px-2 py-2 text-sm min-h-[40px]" value={param} onChange={(e) => setParam(e.target.value)}>
                    {Object.entries(PARAMS).map(([k, v]) => <option key={k} value={k}>{lang === "ta" ? v.ta : v.en}</option>)}
                  </select>
                </label>
                <label className="text-xs text-gray-600">{t("ui.range")}
                  <select className="block border border-agri-green/40 rounded px-2 py-2 text-sm min-h-[40px]" value={days} onChange={(e) => setDays(Number(e.target.value))}>
                    <option value={3}>{t("ui.d3")}</option><option value={7}>{t("ui.d7")}</option><option value={14}>{t("ui.d14")}</option>
                  </select>
                </label>
              </div>
            </div>
            {histData.length === 0 ? <EmptyState message={t("common.noData")} /> : (
              <div className="h-60" role="img" aria-label={t("ui.historyTitle")}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={histData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E7F0E4" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} unit={` ${P.unit}`} />
                    <Tooltip formatter={(v: any) => `${v} ${P.unit}`} />
                    <Line type="monotone" dataKey="value" name={lang === "ta" ? P.ta : P.en} stroke={P.color} strokeWidth={2} dot />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}

function Cell({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2"><span className="text-agri-blue mt-0.5">{icon}</span><div><div className="text-xs text-gray-500">{label}</div><div className="font-bold text-agri-forest">{value}</div></div></div>
  );
}
