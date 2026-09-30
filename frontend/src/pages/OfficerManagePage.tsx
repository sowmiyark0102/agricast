import { useEffect, useState, FormEvent } from "react";
import { PlusCircle, XCircle, History } from "lucide-react";
import { api, friendlyErrorMessage } from "../services/api";
import { useLanguage } from "../context/LanguageContext";
import LoadingSkeleton from "../components/LoadingSkeleton";
import ErrorState from "../components/ErrorState";
import EmptyState from "../components/EmptyState";
import RiskBadge from "../components/RiskBadge";
import { ALERT_LABELS, label } from "../utils/cropAssets";

const TYPES = ["HEAVY_RAIN", "EXTREME_HEAT", "STRONG_WIND", "FLOOD_RISK", "DROUGHT_RISK"];
const SEVERITIES = ["LOW", "MODERATE", "HIGH"];
const RISK_LEVELS = ["NORMAL", "CAUTION", "HIGH_RISK"];

export default function OfficerManagePage() {
  const { t, lang } = useLanguage();
  const [panchayats, setPanchayats] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ panchayatId: "", alertType: TYPES[0], severity: "MODERATE", expectedDurationHours: 6, recommendedAttention: "" });
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    setLoading(true); setError(null);
    Promise.all([api.get("/panchayats"), api.get("/alerts", { params: { all: "true" } }), api.get("/officer/audit-logs")])
      .then(([p, a, l]) => { setPanchayats(p.data.panchayats); setAlerts(a.data.alerts); setLogs(l.data.logs); if (!form.panchayatId) setForm((f) => ({ ...f, panchayatId: p.data.panchayats[0]?._id })); })
      .catch((e) => setError(friendlyErrorMessage(e))).finally(() => setLoading(false));
  };
  useEffect(load, []); // eslint-disable-line react-hooks/exhaustive-deps

  const createAlert = async (e: FormEvent) => {
    e.preventDefault(); setSubmitting(true); setError(null);
    try { await api.post("/officer/alerts", { ...form, startTime: new Date().toISOString() }); setForm((f) => ({ ...f, recommendedAttention: "" })); load(); }
    catch (err) { setError(friendlyErrorMessage(err)); } finally { setSubmitting(false); }
  };
  const closeAlert = async (id: string) => { try { await api.post(`/officer/alerts/${id}/close`); load(); } catch (e) { setError(friendlyErrorMessage(e)); } };
  const setRisk = async (id: string, riskLevel: string) => { try { await api.put(`/officer/panchayats/${id}`, { riskLevel }); load(); } catch (e) { setError(friendlyErrorMessage(e)); } };

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-4 py-6 space-y-5">
      <h1 className="text-2xl font-serif font-bold text-agri-forest">{t("ui.manageTitle")}</h1>
      {loading && <LoadingSkeleton lines={6} />}
      {error && <ErrorState message={error} onRetry={load} />}

      {!loading && (
        <>
          <section className="bg-white border border-agri-light rounded-xl p-5">
            <h2 className="font-serif font-bold text-agri-forest flex items-center gap-2 mb-3"><PlusCircle size={18} aria-hidden="true" />{lang === "ta" ? "புதிய எச்சரிக்கை உருவாக்கு" : "Create a new alert"}</h2>
            <form onSubmit={createAlert} className="grid sm:grid-cols-2 gap-3">
              <label className="block"><span className="block text-xs text-gray-600 mb-1">{t("common.panchayat")}</span><select className="w-full border border-agri-green/40 rounded-lg px-3 py-2.5 min-h-[44px]" value={form.panchayatId} onChange={(e) => setForm({ ...form, panchayatId: e.target.value })}>{panchayats.map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}</select></label>
              <label className="block"><span className="block text-xs text-gray-600 mb-1">{lang === "ta" ? "வகை" : "Type"}</span><select className="w-full border border-agri-green/40 rounded-lg px-3 py-2.5 min-h-[44px]" value={form.alertType} onChange={(e) => setForm({ ...form, alertType: e.target.value })}>{TYPES.map((tp) => <option key={tp} value={tp}>{label(ALERT_LABELS, tp, lang)}</option>)}</select></label>
              <label className="block"><span className="block text-xs text-gray-600 mb-1">{lang === "ta" ? "தீவிரம்" : "Severity"}</span><select className="w-full border border-agri-green/40 rounded-lg px-3 py-2.5 min-h-[44px]" value={form.severity} onChange={(e) => setForm({ ...form, severity: e.target.value })}>{SEVERITIES.map((s) => <option key={s} value={s}>{s}</option>)}</select></label>
              <label className="block"><span className="block text-xs text-gray-600 mb-1">{lang === "ta" ? "காலம் (மணி)" : "Duration (hours)"}</span><input type="number" min={1} max={72} className="w-full border border-agri-green/40 rounded-lg px-3 py-2.5 min-h-[44px]" value={form.expectedDurationHours} onChange={(e) => setForm({ ...form, expectedDurationHours: Number(e.target.value) })} /></label>
              <label className="block sm:col-span-2"><span className="block text-xs text-gray-600 mb-1">{lang === "ta" ? "பரிந்துரை" : "Recommended attention"}</span><input className="w-full border border-agri-green/40 rounded-lg px-3 py-2.5 min-h-[44px]" value={form.recommendedAttention} onChange={(e) => setForm({ ...form, recommendedAttention: e.target.value })} maxLength={300} placeholder={lang === "ta" ? "எ.கா. வடிகாலை சரிபார்க்கவும்" : "e.g. Check field drainage"} /></label>
              <button type="submit" disabled={submitting} className="sm:col-span-2 py-2.5 rounded-full bg-agri-green text-white font-semibold min-h-[44px] disabled:opacity-60">{lang === "ta" ? "எச்சரிக்கையை உருவாக்கு" : "Create Alert"}</button>
            </form>
          </section>

          <section className="bg-white border border-agri-light rounded-xl p-5">
            <h2 className="font-serif font-bold text-agri-forest mb-3">{t("ui.alertsTitle")}</h2>
            {alerts.length === 0 ? <EmptyState message={t("ui.noAlerts")} /> : (
              <div className="space-y-2">{alerts.map((a) => (
                <div key={a._id} className={`flex items-center justify-between text-sm border-b border-agri-light/60 pb-2 ${!a.active ? "opacity-50" : ""}`}>
                  <span>{label(ALERT_LABELS, a.alertType, lang)} — {a.panchayat?.name} <RiskBadge level={a.severity} /></span>
                  {a.active && <button onClick={() => closeAlert(a._id)} className="text-xs text-red-700 font-semibold flex items-center gap-1"><XCircle size={14} aria-hidden="true" />{lang === "ta" ? "மூடு" : "Close"}</button>}
                </div>
              ))}</div>
            )}
          </section>

          <section className="bg-white border border-agri-light rounded-xl p-5">
            <h2 className="font-serif font-bold text-agri-forest mb-3">{lang === "ta" ? "ஊராட்சி ஆபத்து நிலை" : "Panchayat risk level"}</h2>
            <div className="grid sm:grid-cols-2 gap-2">
              {panchayats.map((p) => (
                <div key={p._id} className="flex items-center justify-between text-sm border border-agri-light rounded-lg px-3 py-2">
                  <span>{p.name}</span>
                  <select value={p.riskLevel} onChange={(e) => setRisk(p._id, e.target.value)} className="text-xs border border-agri-green/40 rounded px-2 py-1">{RISK_LEVELS.map((r) => <option key={r} value={r}>{r}</option>)}</select>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-white border border-agri-light rounded-xl p-5">
            <h2 className="font-serif font-bold text-agri-forest flex items-center gap-2 mb-3"><History size={18} aria-hidden="true" />{t("ui.auditLog")}</h2>
            {logs.length === 0 ? <EmptyState message={t("ui.noneYet")} /> : (
              <div className="space-y-1.5 max-h-64 overflow-y-auto text-xs text-gray-600">
                {logs.map((l) => <div key={l._id} className="border-b border-agri-light/60 pb-1.5">{new Date(l.createdAt).toLocaleString()} — <strong>{l.userName}</strong> {l.action.replace(/_/g, " ").toLowerCase()} <span className="font-mono">{l.target}</span></div>)}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
