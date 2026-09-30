import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend, ResponsiveContainer } from "recharts";
import { api, friendlyErrorMessage } from "../services/api";
import LoadingSkeleton from "../components/LoadingSkeleton";
import ErrorState from "../components/ErrorState";
import EmptyState from "../components/EmptyState";
import DataQualityBadge from "../components/DataQualityBadge";
import { useLanguage } from "../context/LanguageContext";
import { useFarmSelection } from "../context/FarmSelectionContext";
import { PanchayatPicker } from "../components/FarmSelectors";

const day = (iso: string) => new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });

export default function ForecastVerificationPage() {
  const { t, lang } = useLanguage();
  const { panchayat } = useFarmSelection();
  const [records, setRecords] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [source, setSource] = useState("DEMO");
  const [scope, setScope] = useState<"panchayat" | "block">("block");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    if (!panchayat) return;
    setLoading(true); setError(null);
    const params = scope === "panchayat" ? { panchayatId: panchayat._id } : { block: panchayat.block, district: panchayat.district };
    api.get("/verification", { params }).then((r) => { setRecords(r.data.records); setMetrics(r.data.metrics); setMessage(r.data.message || null); setSource(r.data.source); }).catch((e) => setError(friendlyErrorMessage(e))).finally(() => setLoading(false));
  };
  useEffect(load, [panchayat, scope]); // eslint-disable-line react-hooks/exhaustive-deps

  const chart = records.map((r) => ({ date: day(r.date), Predicted: r.predictedRainfallMm, Actual: r.actualRainfallMm, Regional: r.regionalRainfallMm }));

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-4 py-6 space-y-5">
      <div><h1 className="text-2xl font-serif font-bold text-agri-forest">{t("ui.verifTitle")}</h1><p className="text-sm text-gray-600">{lang === "ta" ? "கணிக்கப்பட்ட மழை உண்மையான மழையுடன் ஒப்பிடப்படுகிறது." : "Predicted rainfall compared against actual observed rainfall."}</p></div>
      <div className="bg-agri-light/70 border border-agri-green/20 rounded-xl p-3 space-y-2">
        <PanchayatPicker />
        <div className="flex gap-1 border border-agri-light rounded-full p-1 w-fit bg-white">
          {(["block", "panchayat"] as const).map((s) => <button key={s} onClick={() => setScope(s)} className={`text-xs font-semibold px-3 py-1.5 rounded-full ${scope === s ? "bg-agri-green text-white" : "text-agri-forest"}`}>{s === "block" ? (lang === "ta" ? "முழு வட்டம்" : "Whole block") : t("common.panchayat")}</button>)}
        </div>
      </div>

      {loading && <LoadingSkeleton lines={6} />}
      {error && <ErrorState message={error} onRetry={load} />}
      {!loading && !error && records.length === 0 && <EmptyState message={t("common.notEnoughData")} />}

      {!loading && !error && records.length > 0 && (
        <>
          <section className="bg-white border border-agri-light rounded-xl p-4">
            <div className="flex items-center justify-between mb-2"><h2 className="font-serif font-bold text-agri-forest">{t("ui.predicted")} vs {t("ui.actual")}</h2><DataQualityBadge source={source} /></div>
            <div className="h-64" role="img" aria-label="Forecast verification chart">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chart}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E7F0E4" /><XAxis dataKey="date" tick={{ fontSize: 12 }} /><YAxis tick={{ fontSize: 12 }} unit=" mm" /><Tooltip /><Legend />
                  <Line type="monotone" dataKey="Regional" name={lang === "ta" ? "பிராந்திய அடிப்படை" : "Regional baseline"} stroke="#8B5E34" strokeWidth={1.5} strokeDasharray="4 3" dot={false} />
                  <Line type="monotone" dataKey="Predicted" name={lang === "ta" ? "நுண்ணறிவு கணிப்பு" : "Downscaled"} stroke="#3E6B8A" strokeWidth={2} />
                  <Line type="monotone" dataKey="Actual" name={t("ui.actual")} stroke="#1F5F3F" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>

          {metrics ? (
            <section className="bg-white border border-agri-light rounded-xl p-4">
              <h2 className="font-serif font-bold text-agri-forest mb-3">{lang === "ta" ? "துல்லியம்: நுண்ணறிவு vs பிராந்திய அடிப்படை" : "Accuracy: downscaled vs regional baseline"}</h2>
              <div className="overflow-x-auto"><table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-500"><tr><th className="py-1 pr-3"></th><th className="pr-3">MAE</th><th className="pr-3">RMSE</th><th>Bias</th></tr></thead>
                <tbody>
                  <tr className="border-t border-agri-light"><td className="py-1.5 pr-3">{lang === "ta" ? "மழை — நுண்ணறிவு" : "Rainfall — downscaled"}</td><td className="pr-3">{metrics.rainfall.downscaled.mae} mm</td><td className="pr-3">{metrics.rainfall.downscaled.rmse} mm</td><td>{metrics.rainfall.downscaled.bias} mm</td></tr>
                  <tr className="border-t border-agri-light text-gray-500"><td className="py-1.5 pr-3">{lang === "ta" ? "மழை — பிராந்திய அடிப்படை" : "Rainfall — regional baseline"}</td><td className="pr-3">{metrics.rainfall.regionalBaseline.mae} mm</td><td className="pr-3">{metrics.rainfall.regionalBaseline.rmse} mm</td><td>{metrics.rainfall.regionalBaseline.bias} mm</td></tr>
                  <tr className="border-t border-agri-light"><td className="py-1.5 pr-3">{lang === "ta" ? "வெப்பநிலை — நுண்ணறிவு" : "Temperature — downscaled"}</td><td className="pr-3">{metrics.temperature.downscaled.mae} °C</td><td className="pr-3">{metrics.temperature.downscaled.rmse} °C</td><td>{metrics.temperature.downscaled.bias} °C</td></tr>
                  <tr className="border-t border-agri-light text-gray-500"><td className="py-1.5 pr-3">{lang === "ta" ? "வெப்பநிலை — பிராந்திய அடிப்படை" : "Temperature — regional baseline"}</td><td className="pr-3">{metrics.temperature.regionalBaseline.mae} °C</td><td className="pr-3">{metrics.temperature.regionalBaseline.rmse} °C</td><td>{metrics.temperature.regionalBaseline.bias} °C</td></tr>
                </tbody>
              </table></div>
              <p className="text-xs text-gray-500 mt-3">{lang === "ta" ? "மாதிரி அளவு" : "Sample size"}: {metrics.sampleSize}</p>
              <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded p-2 mt-3">{message || "Computed from demonstration verification records, not real-world evaluation data."}</p>
            </section>
          ) : <EmptyState message={message || t("common.notEnoughData")} />}
        </>
      )}
    </div>
  );
}
