import { useEffect, useState, FormEvent } from "react";
import { UserRound, Camera, IndianRupee, Save } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { api, friendlyErrorMessage } from "../services/api";
import LoadingSkeleton from "../components/LoadingSkeleton";
import ErrorState from "../components/ErrorState";
import EmptyState from "../components/EmptyState";
import RiskBadge from "../components/RiskBadge";
import { cropLabel, stageLabel } from "../utils/cropAssets";

export default function FarmerProfilePage() {
  const { user, refreshUser } = useAuth() as any;
  const { t, lang } = useLanguage();
  const [name, setName] = useState(user?.name || "");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [photos, setPhotos] = useState<any[]>([]);
  const [estimates, setEstimates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([api.get("/farmer/photo-risk/history"), api.get("/risk-saved/history")])
      .then(([p, r]) => { setPhotos(p.data.records); setEstimates(r.data.records); })
      .catch((e) => setError(friendlyErrorMessage(e)))
      .finally(() => setLoading(false));
  }, []);

  const save = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true); setSaved(false);
    try { await api.put("/auth/me", { name }); refreshUser?.(); setSaved(true); } catch { /* keep silent, non-critical */ } finally { setSaving(false); }
  };

  return (
    <div className="max-w-3xl mx-auto px-3 sm:px-4 py-6 space-y-5">
      <div className="flex items-center gap-2"><UserRound className="text-agri-green" aria-hidden="true" /><h1 className="text-2xl font-serif font-bold text-agri-forest">{t("ui.profileTitle")}</h1></div>

      <form onSubmit={save} className="border border-agri-light rounded-xl bg-white p-5 space-y-3">
        <div className="grid sm:grid-cols-2 gap-3 text-sm">
          <div><span className="text-gray-500 text-xs">{lang === "ta" ? "கைபேசி எண்" : "Mobile number"}</span><p className="font-semibold">{user?.phone}</p></div>
          <div><span className="text-gray-500 text-xs">{t("common.district")} / {t("common.block")}</span><p className="font-semibold">{user?.district}{user?.block ? `, ${user.block}` : ""}</p></div>
        </div>
        <label className="block"><span className="block text-sm font-medium text-gray-700 mb-1">{t("ui.fullName")}</span>
          <input className="w-full border border-agri-green/40 rounded-lg px-3 py-2.5 min-h-[44px]" value={name} onChange={(e) => setName(e.target.value)} maxLength={80} /></label>
        <button type="submit" disabled={saving} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-agri-green text-white font-semibold disabled:opacity-60 min-h-[44px]"><Save size={16} aria-hidden="true" />{t("common.save")}</button>
        {saved && <span className="text-sm text-green-700 ml-2">{t("ui.savedOk")}</span>}
      </form>

      {loading && <LoadingSkeleton lines={4} />}
      {error && <ErrorState message={error} />}

      {!loading && (
        <>
          <section className="border border-agri-light rounded-xl bg-white p-5">
            <h2 className="font-serif font-bold text-agri-forest flex items-center gap-2 mb-3"><Camera size={18} aria-hidden="true" />{t("ui.myPhotos")}</h2>
            {photos.length === 0 ? <EmptyState message={t("ui.noneYet")} /> : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {photos.map((p) => (
                  <div key={p._id} className="border border-agri-light rounded-lg overflow-hidden">
                    <img src={p.photoUrl} alt="" className="w-full h-24 object-cover" />
                    <div className="p-2">
                      <div className="flex items-center justify-between"><span className="text-xs font-semibold">{cropLabel(p.crop, lang)}</span><RiskBadge level={p.analysisResult.riskCategory} /></div>
                      <span className="text-[11px] text-gray-500">{stageLabel(p.cropStage, lang)} · {p.officerReviewed ? (p.reviewStatus === "VERIFIED" ? t("ui.verified") : t("ui.needsInspection")) : t("ui.pending")}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="border border-agri-light rounded-xl bg-white p-5">
            <h2 className="font-serif font-bold text-agri-forest flex items-center gap-2 mb-3"><IndianRupee size={18} aria-hidden="true" />{t("ui.myEstimates")}</h2>
            {estimates.length === 0 ? <EmptyState message={t("ui.noneYet")} /> : (
              <div className="space-y-2">
                {estimates.map((r) => (
                  <div key={r._id} className="flex items-center justify-between text-sm border-b border-agri-light/60 pb-2">
                    <span>{r.activity} · {r.crop ? cropLabel(r.crop, lang) : "—"} · {r.quantity} kg</span>
                    <span className="font-bold text-agri-forest">₹{r.estimatedPotentialLoss.toLocaleString("en-IN")}</span>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
