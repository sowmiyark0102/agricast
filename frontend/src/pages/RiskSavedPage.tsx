import { useState, FormEvent } from "react";
import { IndianRupee, CloudRain, ArrowRight, PiggyBank } from "lucide-react";
import { useFarmSelection } from "../context/FarmSelectionContext";
import { useLanguage } from "../context/LanguageContext";
import { api, friendlyErrorMessage } from "../services/api";
import ErrorState from "../components/ErrorState";
import { CropPicker } from "../components/FarmSelectors";

const ACTIVITIES = ["Fertilizer Application", "Spraying", "Sowing", "Irrigation"];

export default function RiskSavedPage() {
  const { t, lang } = useLanguage();
  const { crop } = useFarmSelection();
  const [activity, setActivity] = useState(ACTIVITIES[0]);
  const [quantity, setQuantity] = useState(50);
  const [unitCost, setUnitCost] = useState(60);
  const [assumedLoss, setAssumedLoss] = useState(40);
  const [weatherReason, setWeatherReason] = useState(lang === "ta" ? "உரமிடும் முன் அதிக மழை கண்டறியப்பட்டது." : "Heavy rain detected before fertilizer application.");
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true); setError(null);
    try {
      const res = await api.post("/risk-saved/calculate", { crop: crop?.name, activity, quantity, unitCost, assumedLossPercentage: assumedLoss, recommendedAction: lang === "ta" ? "தாமதப்படுத்து" : "Delay application", weatherReason });
      setResult(res.data.result);
    } catch (err) { setError(friendlyErrorMessage(err)); } finally { setSubmitting(false); }
  };

  return (
    <div className="max-w-2xl mx-auto px-3 sm:px-4 py-6 space-y-5">
      <div className="flex items-center gap-2"><IndianRupee className="text-agri-green" aria-hidden="true" /><h1 className="text-2xl font-serif font-bold text-agri-forest">{t("ui.riskTitle")}</h1></div>
      <p className="text-sm text-gray-600">{t("ui.riskSub")}</p>

      <div className="flex items-center justify-center gap-2 text-xs font-semibold text-gray-600 bg-agri-light/60 rounded-full py-2 px-3">
        <CloudRain size={16} className="text-agri-blue" aria-hidden="true" />{t("ui.chainWeather")}<ArrowRight size={14} aria-hidden="true" /><span>{t("ui.chainDecision")}</span><ArrowRight size={14} aria-hidden="true" /><PiggyBank size={16} className="text-agri-green" aria-hidden="true" />{t("ui.chainImpact")}
      </div>

      <form onSubmit={handleSubmit} className="border border-agri-light rounded-xl bg-white p-5 space-y-4">
        <div className="mb-1"><CropPicker showStage={false} /></div>
        <label className="block"><span className="block text-sm font-medium text-gray-700 mb-1">{lang === "ta" ? "வானிலை காரணம்" : "Weather reason"}</span>
          <input className="w-full border border-agri-green/40 rounded-lg px-3 py-2.5 min-h-[44px]" value={weatherReason} onChange={(e) => setWeatherReason(e.target.value)} maxLength={200} /></label>
        <label className="block"><span className="block text-sm font-medium text-gray-700 mb-1">{t("common.activity")}</span>
          <select className="w-full border border-agri-green/40 rounded-lg px-3 py-2.5 min-h-[44px]" value={activity} onChange={(e) => setActivity(e.target.value)}>{ACTIVITIES.map((a) => <option key={a} value={a}>{a}</option>)}</select></label>
        <div className="grid sm:grid-cols-3 gap-4">
          <label className="block"><span className="block text-sm font-medium text-gray-700 mb-1">{t("ui.qty")}</span><input type="number" min={0.1} step="any" className="w-full border border-agri-green/40 rounded-lg px-3 py-2.5 min-h-[44px]" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} required /></label>
          <label className="block"><span className="block text-sm font-medium text-gray-700 mb-1">{t("ui.unitCost")}</span><input type="number" min={0} step="any" className="w-full border border-agri-green/40 rounded-lg px-3 py-2.5 min-h-[44px]" value={unitCost} onChange={(e) => setUnitCost(Number(e.target.value))} required /></label>
          <label className="block"><span className="block text-sm font-medium text-gray-700 mb-1">{t("ui.assumedLoss")}</span><input type="number" min={0} max={100} className="w-full border border-agri-green/40 rounded-lg px-3 py-2.5 min-h-[44px]" value={assumedLoss} onChange={(e) => setAssumedLoss(Number(e.target.value))} /></label>
        </div>
        {error && <ErrorState message={error} />}
        <button type="submit" disabled={submitting || quantity <= 0} className="w-full py-2.5 rounded-full bg-agri-green text-white font-semibold hover:bg-agri-forest disabled:opacity-60 min-h-[44px]">{submitting ? t("common.loading") : t("ui.calc")}</button>
      </form>

      {result && (
        <div className="border border-agri-light rounded-xl bg-white p-5">
          <p className="text-sm text-gray-600">{lang === "ta" ? "மதிப்பிடப்பட்ட தவிர்க்கக்கூடிய இழப்பு" : "Estimated potential avoidable loss"}</p>
          <p className="text-4xl font-bold text-agri-forest">₹{result.estimatedPotentialLoss.toLocaleString("en-IN")}</p>
          <div className="mt-4 text-sm text-gray-700 space-y-1 border-t border-agri-light pt-3">
            <p>{t("ui.qty")}: {result.enteredQuantity} kg</p><p>{t("ui.unitCost")}: ₹{result.unitCost}</p><p>{t("ui.assumedLoss")}: {result.assumedLossPercentage}%</p>
            <p className="text-xs text-gray-500 mt-2 font-mono">{result.formula}</p>
          </div>
          <p className="text-xs text-gray-500 mt-3 italic">{t("ui.estimateNote")}</p>
        </div>
      )}
    </div>
  );
}
