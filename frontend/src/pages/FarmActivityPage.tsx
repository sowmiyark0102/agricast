import { useEffect, useState } from "react";
import { PanchayatPicker, CropPicker } from "../components/FarmSelectors";
import ExplainableAIPanel from "../components/ExplainableAIPanel";
import RainMemoryCard from "../components/RainMemoryCard";
import DataQualityBadge from "../components/DataQualityBadge";
import LoadingSkeleton from "../components/LoadingSkeleton";
import ErrorState from "../components/ErrorState";
import { useFarmSelection } from "../context/FarmSelectionContext";
import { useLanguage } from "../context/LanguageContext";
import { api, friendlyErrorMessage } from "../services/api";
import { ACTIVITY_LABELS, STATUS_LABELS, label } from "../utils/cropAssets";
import type { Activity } from "../types";

const KEYS: Activity[] = ["SOWING", "IRRIGATION", "SPRAYING", "FERTILIZER_APPLICATION", "HARVESTING", "DRYING"];
const STATUS_STYLES: Record<string, string> = { SUITABLE: "bg-green-100 text-green-800 border-green-300", USE_CAUTION: "bg-amber-100 text-amber-800 border-amber-300", NOT_RECOMMENDED: "bg-red-100 text-red-800 border-red-300", INSUFFICIENT_DATA: "bg-gray-100 text-gray-700 border-gray-300" };
const ICON: Record<string, string> = { SUITABLE: "✔", USE_CAUTION: "▲", NOT_RECOMMENDED: "✖", INSUFFICIENT_DATA: "?" };
const WINDOW_STYLES: Record<string, string> = { SUITABLE: "bg-green-100 text-green-800", USE_CAUTION: "bg-amber-100 text-amber-800", HIGHER_RAIN_RISK: "bg-red-100 text-red-800" };

export default function FarmActivityPage() {
  const { t, lang } = useLanguage();
  const { panchayat, crop, cropStage, activity, setActivity } = useFarmSelection();
  const [decision, setDecision] = useState<any>(null);
  const [win, setWin] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    if (!panchayat || !crop) return;
    setLoading(true);
    setError(null);
    Promise.all([
      api.get("/decision/should-i-farm-today", { params: { panchayatId: panchayat._id, activity, crop: crop.name, cropStage } }),
      api.get("/decision/activity-window", { params: { panchayatId: panchayat._id, activity } }),
    ])
      .then(([d, w]) => { setDecision(d.data); setWin(w.data); })
      .catch((e) => setError(friendlyErrorMessage(e)))
      .finally(() => setLoading(false));
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(load, [panchayat, crop, cropStage, activity]);

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-6 space-y-5">
      <div>
        <h1 className="text-2xl font-serif font-bold text-agri-forest">{t("ui.shouldIFarm")}</h1>
        <p className="text-sm text-gray-600">{t("ui.shouldSub")}</p>
      </div>
      <div className="bg-agri-light/70 border border-agri-green/20 rounded-xl p-3 space-y-3"><PanchayatPicker /><CropPicker /></div>

      <div className="flex flex-wrap gap-2" role="tablist" aria-label={t("common.activity")}>
        {KEYS.map((k) => (
          <button key={k} role="tab" aria-selected={activity === k} onClick={() => setActivity(k)}
            className={`px-3 py-2 rounded-full text-sm font-medium border min-h-[44px] ${activity === k ? "bg-agri-green text-white border-agri-green" : "border-agri-green/40 text-agri-forest bg-white"}`}>
            {label(ACTIVITY_LABELS, k, lang)}
          </button>
        ))}
      </div>

      {loading && !decision && <LoadingSkeleton lines={4} />}
      {error && <ErrorState message={error} onRetry={load} />}

      {decision && (
        <section className="bg-white border border-agri-light rounded-xl p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border text-lg font-bold ${STATUS_STYLES[decision.status]}`}>
              <span aria-hidden="true">{ICON[decision.status]}</span>{label(STATUS_LABELS, decision.status, lang)}
            </div>
            <DataQualityBadge source={decision.dataQuality} />
          </div>
          {decision.status === "INSUFFICIENT_DATA" ? <p className="text-sm text-gray-700">{t("common.notEnoughData")}</p> : <ExplainableAIPanel factors={decision.factors} title={t("ui.why")} footnote={t("ui.ruleBased")} />}
        </section>
      )}

      {decision?.rainMemory && <RainMemoryCard rm={decision.rainMemory} />}

      {win && (
        <section className="bg-white border border-agri-light rounded-xl p-5">
          <h2 className="font-serif font-bold text-agri-forest mb-3">{t("ui.windowTitle")} — {label(ACTIVITY_LABELS, activity, lang)}</h2>
          <div className="space-y-2">
            {win.windows.map((w: any) => (
              <div key={w.window} className="flex items-center justify-between border-b border-agri-light/60 pb-2">
                <span className="text-sm font-medium text-gray-700">{w.window}</span>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded ${WINDOW_STYLES[w.status]}`}>{label(STATUS_LABELS, w.status, lang)}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-3">{win.ruleNote}</p>
          <p className="text-xs text-gray-500 mt-1 italic">{t("ui.windowDisclaimer")}</p>
        </section>
      )}
    </div>
  );
}
