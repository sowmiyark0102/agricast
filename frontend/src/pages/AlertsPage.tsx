import { useEffect, useState } from "react";
import { api, friendlyErrorMessage } from "../services/api";
import LoadingSkeleton from "../components/LoadingSkeleton";
import ErrorState from "../components/ErrorState";
import EmptyState from "../components/EmptyState";
import RiskBadge from "../components/RiskBadge";
import DataQualityBadge from "../components/DataQualityBadge";
import { useLanguage } from "../context/LanguageContext";
import { useFarmSelection } from "../context/FarmSelectionContext";
import { ALERT_LABELS, label } from "../utils/cropAssets";
import { validTill } from "../utils/weather";
import { TriangleAlert, CloudRain, Wind, Flame, Droplet } from "lucide-react";

const ICONS: Record<string, any> = { HEAVY_RAIN: CloudRain, STRONG_WIND: Wind, EXTREME_HEAT: Flame, FLOOD_RISK: Droplet, DROUGHT_RISK: TriangleAlert };

export default function AlertsPage() {
  const { t, lang } = useLanguage();
  const { panchayat } = useFarmSelection();
  const [alerts, setAlerts] = useState<any[]>([]);
  const [onlyMine, setOnlyMine] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    setLoading(true); setError(null);
    api.get("/alerts", { params: onlyMine && panchayat ? { panchayatId: panchayat._id } : {} }).then((r) => setAlerts(r.data.alerts)).catch((e) => setError(friendlyErrorMessage(e))).finally(() => setLoading(false));
  };
  useEffect(load, [onlyMine]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="max-w-3xl mx-auto px-3 sm:px-4 py-6 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div><h1 className="text-2xl font-serif font-bold text-agri-forest">{t("ui.alertsTitle")}</h1><p className="text-sm text-gray-600">{t("ui.alertsSub")}</p></div>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={onlyMine} onChange={(e) => setOnlyMine(e.target.checked)} className="w-4 h-4" />{t("ui.filterMine")}</label>
      </div>
      {loading && <LoadingSkeleton lines={5} />}
      {error && <ErrorState message={error} onRetry={load} />}
      {!loading && !error && alerts.length === 0 && <EmptyState message={t("ui.noAlerts")} />}
      <div className="space-y-3">
        {alerts.map((a) => {
          const Icon = ICONS[a.alertType] || TriangleAlert;
          return (
            <div key={a._id} className="border border-amber-200 bg-amber-50 rounded-xl p-4 flex items-start gap-3">
              <Icon className="text-amber-600 shrink-0 mt-0.5" size={22} aria-hidden="true" />
              <div className="flex-1">
                <div className="flex items-center justify-between gap-2"><h4 className="font-semibold text-agri-forest">{label(ALERT_LABELS, a.alertType, lang)} — {a.panchayat?.name}</h4><RiskBadge level={a.severity} /></div>
                <p className="text-sm text-gray-700 mt-1">{a.recommendedAttention}</p>
                <p className="text-xs text-gray-500 mt-1">{lang === "ta" ? "செல்லுபடி" : "Valid till"} {validTill(a.startTime, a.expectedDurationHours)} <span className="ml-2"><DataQualityBadge source="DEMO" /></span></p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
