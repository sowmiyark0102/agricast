import { useEffect, useState } from "react";
import { PanchayatPicker } from "../components/FarmSelectors";
import RiskBadge from "../components/RiskBadge";
import DataQualityBadge from "../components/DataQualityBadge";
import LoadingSkeleton from "../components/LoadingSkeleton";
import ErrorState from "../components/ErrorState";
import { useFarmSelection } from "../context/FarmSelectionContext";
import { useLanguage } from "../context/LanguageContext";
import { useSearchParams } from "react-router-dom";
import { api, friendlyErrorMessage } from "../services/api";
import { CROP_IMAGES, STAGES, cropLabel, stageLabel, stageImage, label, RISK_TYPE_LABELS } from "../utils/cropAssets";

export default function CropAdvisoryPage() {
  const { t, lang } = useLanguage();
  const [params, setParams] = useSearchParams();
  const { panchayat, crop, setCrop, cropStage, setCropStage } = useFarmSelection();
  const [crops, setCrops] = useState<any[]>([]);
  const [risk, setRisk] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.get("/crops").then((r) => {
      setCrops(r.data.crops);
      const want = params.get("crop");
      if (want) { const c = r.data.crops.find((x: any) => x.name === want); if (c) setCrop(c); }
      else if (!crop) setCrop(r.data.crops[0]);
    }).catch((e) => setError(friendlyErrorMessage(e)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadRisk = () => {
    if (!panchayat || !crop) return;
    setLoading(true);
    setError(null);
    api.get(`/crops/${crop._id}/risk`, { params: { panchayatId: panchayat._id, cropStage } })
      .then((r) => setRisk(r.data.risk))
      .catch((e) => setError(friendlyErrorMessage(e)))
      .finally(() => setLoading(false));
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(loadRisk, [panchayat, crop, cropStage]);

  const guide = crop?.stageGuide?.[cropStage];
  const img = crop ? stageImage(crop.name, cropStage) : null;

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-4 py-6 space-y-5">
      <div>
        <h1 className="text-2xl font-serif font-bold text-agri-forest">{t("ui.cropAdvisory")}</h1>
        <p className="text-sm text-gray-600">{lang === "ta" ? "உங்கள் பயிர் மற்றும் அதன் நிலைக்கான ஆலோசனை மற்றும் வானிலை ஆபத்து." : "Advice and weather risk for your crop and its growth stage."}</p>
      </div>
      <div className="bg-agri-light/70 border border-agri-green/20 rounded-xl p-3"><PanchayatPicker /></div>

      <section>
        <h2 className="font-semibold text-agri-forest mb-2 text-sm">{t("ui.chooseCrop")}</h2>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {crops.map((c) => (
            <button key={c._id} onClick={() => { setCrop(c); setParams({ crop: c.name }); }} aria-pressed={crop?._id === c._id}
              className={`rounded-xl overflow-hidden border-2 text-left ${crop?._id === c._id ? "border-agri-green shadow" : "border-agri-light"}`}>
              <img src={CROP_IMAGES[c.name]} alt={c.name} className="w-full h-16 sm:h-20 object-cover" loading="lazy" />
              <span className={`block text-center text-xs font-semibold py-1.5 ${crop?._id === c._id ? "bg-agri-green text-white" : "bg-white text-agri-forest"}`}>{cropLabel(c.name, lang)}</span>
            </button>
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-semibold text-agri-forest mb-2 text-sm">{t("ui.chooseStage")}</h2>
        <div className="flex gap-2 overflow-x-auto pb-1" role="tablist">
          {STAGES.map((s, i) => (
            <button key={s} role="tab" aria-selected={cropStage === s} onClick={() => setCropStage(s)}
              className={`shrink-0 px-3 py-2 rounded-lg text-sm font-medium border min-h-[44px] ${cropStage === s ? "bg-agri-green text-white border-agri-green" : "bg-white text-agri-forest border-agri-green/40"}`}>
              {i + 1}. {stageLabel(s, lang)}
            </button>
          ))}
        </div>
      </section>

      {crop && img && (
        <section className="bg-white border border-agri-light rounded-xl overflow-hidden grid md:grid-cols-5">
          <div className="md:col-span-2 bg-agri-light/40 flex items-center justify-center">
            <img src={img.src} alt={`${crop.name} — ${cropStage}`} className="w-full h-full max-h-72 object-cover md:object-contain" />
          </div>
          <div className="md:col-span-3 p-4 space-y-3">
            <div>
              <h2 className="font-serif font-bold text-lg text-agri-forest">{cropLabel(crop.name, lang)} — {stageLabel(cropStage, lang)}</h2>
              <p className="text-xs text-gray-500">{crop.growingConditions}</p>
            </div>
            {guide && (
              <>
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="text-xs font-semibold text-green-800 mb-0.5">{t("ui.stageAdvice")}</div>
                  <p className="text-sm text-gray-800">{lang === "ta" ? guide.advisoryTa : guide.advisory}</p>
                </div>
                <p className="text-sm"><strong>{t("ui.waterNeed")}:</strong> {guide.waterNeed}</p>
                <div>
                  <div className="text-xs font-semibold text-gray-600 mb-1">{t("ui.stageSensitive")}</div>
                  <div className="flex flex-wrap gap-1.5">{guide.sensitiveTo.map((s: string) => <span key={s} className="text-xs px-2 py-1 rounded bg-amber-50 border border-amber-200 text-amber-900">{label(RISK_TYPE_LABELS, s, lang)}</span>)}</div>
                </div>
              </>
            )}
            <p className="text-xs text-gray-500"><strong>{t("ui.weatherSensitivity")}:</strong> {crop.weatherSensitivity}</p>
          </div>
        </section>
      )}

      {loading && !risk && <LoadingSkeleton lines={4} />}
      {error && <ErrorState message={error} onRetry={loadRisk} />}

      {risk && (
        <section className="bg-white border border-agri-light rounded-xl p-4">
          <div className="flex items-center justify-between gap-2 mb-2">
            <h2 className="font-serif font-bold text-agri-forest">{t("ui.currentRisk")}</h2>
            <div className="flex items-center gap-2"><DataQualityBadge source={risk.dataQuality} /><RiskBadge level={risk.riskLevel} /></div>
          </div>
          <p className="font-semibold text-sm text-agri-forest">{label(RISK_TYPE_LABELS, risk.riskType, lang)}{risk.allRisks?.[0]?.stageSensitive && <span className="ml-2 text-[11px] px-1.5 py-0.5 rounded bg-red-50 text-red-700 border border-red-200">{t("ui.stageSensitiveTag")}</span>}</p>
          <p className="text-sm text-gray-700 mt-1">{risk.reason}</p>
          <p className="text-sm mt-2"><strong>{t("ui.monitor")}:</strong> {risk.monitoringAdvice}</p>
          {risk.allRisks?.length > 1 && (
            <div className="mt-3 border-t border-agri-light pt-3 space-y-2">
              <div className="text-xs font-semibold text-gray-500">{t("ui.otherRisks")}</div>
              {risk.allRisks.slice(1).map((r: any, i: number) => (
                <div key={i} className="flex items-start gap-2 text-sm"><RiskBadge level={r.riskLevel} /><span><strong>{label(RISK_TYPE_LABELS, r.riskType, lang)}</strong> — {r.reason}</span></div>
              ))}
            </div>
          )}
          {risk.watchList?.length > 0 && (
            <p className="text-xs text-gray-600 mt-3"><strong>{t("ui.watchFor")}:</strong> {risk.watchList.map((w: string) => label(RISK_TYPE_LABELS, w, lang)).join(", ")}</p>
          )}
          <p className="text-xs text-gray-500 mt-3 italic">{t("ui.riskDisclaimer")}</p>
        </section>
      )}
    </div>
  );
}
