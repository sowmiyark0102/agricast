import { useEffect, useState } from "react";
import { api, friendlyErrorMessage } from "../services/api";
import LoadingSkeleton from "../components/LoadingSkeleton";
import ErrorState from "../components/ErrorState";
import EmptyState from "../components/EmptyState";
import RiskBadge from "../components/RiskBadge";
import { useLanguage } from "../context/LanguageContext";
import { cropLabel, stageLabel } from "../utils/cropAssets";

export default function OfficerFarmerReportsPage() {
  const { t, lang } = useLanguage();
  const [records, setRecords] = useState<any[]>([]);
  const [filter, setFilter] = useState<"ALL" | "PENDING">("PENDING");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});

  const load = () => { setLoading(true); setError(null); api.get("/officer/farmer-reports").then((r) => setRecords(r.data.records)).catch((e) => setError(friendlyErrorMessage(e))).finally(() => setLoading(false)); };
  useEffect(load, []);

  const review = async (id: string, status: "VERIFIED" | "NEEDS_INSPECTION") => {
    try { await api.post(`/officer/farmer-reports/${id}/review`, { note: notes[id] || "", status }); load(); } catch (e) { setError(friendlyErrorMessage(e)); }
  };

  const shown = records.filter((r) => (filter === "PENDING" ? !r.officerReviewed : true));

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-6 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div><h1 className="text-2xl font-serif font-bold text-agri-forest">{t("ui.reportsTitle")}</h1><p className="text-sm text-gray-600">{lang === "ta" ? "விவசாயி புகைப்பட ஆபத்து சமர்ப்பிப்புகளை மதிப்பாய்வு செய்யவும்." : "Review farmer photo + weather risk submissions."}</p></div>
        <div className="flex gap-1 border border-agri-light rounded-full p-1">
          {(["PENDING", "ALL"] as const).map((f) => <button key={f} onClick={() => setFilter(f)} className={`text-xs font-semibold px-3 py-1.5 rounded-full ${filter === f ? "bg-agri-green text-white" : "text-agri-forest"}`}>{f === "PENDING" ? t("ui.pending") : lang === "ta" ? "அனைத்தும்" : "All"}</button>)}
        </div>
      </div>
      {loading && <LoadingSkeleton lines={5} />}
      {error && <ErrorState message={error} onRetry={load} />}
      {!loading && !error && shown.length === 0 && <EmptyState message={t("ui.noneYet")} />}
      <div className="space-y-4">
        {shown.map((r) => (
          <div key={r._id} className="border border-agri-light rounded-xl bg-white p-4 grid sm:grid-cols-3 gap-4">
            <img src={r.photoUrl} alt="Farmer submission" className="rounded-lg object-cover h-32 w-full" />
            <div className="sm:col-span-2">
              <div className="flex items-center justify-between gap-2"><p className="font-semibold text-agri-forest">{r.farmer?.name} · {cropLabel(r.crop, lang)} ({stageLabel(r.cropStage, lang)})</p><RiskBadge level={r.analysisResult.riskCategory} /></div>
              <p className="text-sm text-gray-600">{r.panchayat?.name}, {r.panchayat?.block} · {new Date(r.createdAt).toLocaleString()}</p>
              <p className="text-sm text-gray-700 mt-2">{r.analysisResult.explanation}</p>
              {r.officerReviewed ? (
                <p className="text-xs text-green-700 mt-2">{r.reviewStatus === "VERIFIED" ? t("ui.verified") : t("ui.needsInspection")}{r.officerNote ? `: ${r.officerNote}` : ""}</p>
              ) : (
                <div className="mt-3 space-y-2">
                  <input className="w-full border border-agri-green/30 rounded-lg px-2 py-2 text-sm min-h-[40px]" placeholder={lang === "ta" ? "அதிகாரி குறிப்பு (விருப்பம்)" : "Officer note (optional)"} value={notes[r._id] || ""} onChange={(e) => setNotes({ ...notes, [r._id]: e.target.value })} maxLength={300} />
                  <div className="flex gap-2">
                    <button onClick={() => review(r._id, "VERIFIED")} className="flex-1 px-3 py-2 rounded-full bg-agri-green text-white text-sm font-semibold min-h-[40px]">{t("ui.markVerified")}</button>
                    <button onClick={() => review(r._id, "NEEDS_INSPECTION")} className="flex-1 px-3 py-2 rounded-full border border-amber-400 text-amber-800 text-sm font-semibold min-h-[40px]">{t("ui.needsField")}</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
