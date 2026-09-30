import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Landmark, AlertTriangle, MapPinned, Droplets, ClipboardList, BarChart3, ListChecks } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { api, friendlyErrorMessage } from "../services/api";
import LoadingSkeleton from "../components/LoadingSkeleton";
import ErrorState from "../components/ErrorState";
import MiniMap from "../components/MiniMap";
import RiskBadge from "../components/RiskBadge";

export default function OfficerDashboard() {
  const { user } = useAuth();
  const { t, lang } = useLanguage();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = () => { setLoading(true); setError(null); api.get("/officer/dashboard").then((r) => setData(r.data)).catch((e) => setError(friendlyErrorMessage(e))).finally(() => setLoading(false)); };
  useEffect(load, []);

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-4 py-6 space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-2xl font-serif font-bold text-agri-forest">{t("ui.officerTitle")}</h1>
        <span className="text-[11px] font-bold tracking-wide px-2.5 py-1 rounded bg-agri-forest text-white">{t("officerMode")}</span>
      </div>
      <p className="text-sm text-gray-600 -mt-3">{user?.name}</p>

      {loading && <LoadingSkeleton lines={4} />}
      {error && <ErrorState message={error} onRetry={load} />}

      {data && (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <Metric icon={<Landmark />} label={lang === "ta" ? "மொத்த ஊராட்சிகள்" : "Total Panchayats"} value={data.metrics.totalPanchayats} />
            <Metric icon={<AlertTriangle />} label={lang === "ta" ? "செயலில் எச்சரிக்கைகள்" : "Active Alerts"} value={data.metrics.activeAlerts} />
            <Metric icon={<MapPinned />} label={t("ui.legendHigh")} value={data.metrics.highRiskPanchayats} />
            <Metric icon={<Droplets />} label={lang === "ta" ? "மழை நிகழ்வுகள் (≥20மிமீ)" : "Rainfall Events (≥20mm)"} value={data.metrics.rainfallEvents} />
            <Metric icon={<ClipboardList />} label={t("ui.pendingReports")} value={data.metrics.pendingReports} highlight={data.metrics.pendingReports > 0} />
            <Metric icon={<BarChart3 />} label={lang === "ta" ? "சரிபார்ப்பு மாதிரிகள்" : "Verification Samples"} value={data.metrics.forecastVerificationSamples} />
          </div>

          <section className="bg-white border border-agri-light rounded-xl p-4">
            <h2 className="font-serif font-bold text-agri-forest mb-2">{t("ui.affected")}</h2>
            {data.affectedPanchayats.length === 0 ? <p className="text-sm text-gray-600">{t("ui.noAlerts")}</p> : (
              <div className="grid lg:grid-cols-2 gap-4">
                <MiniMap items={data.affectedPanchayats} height={260} interactive />
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {data.affectedPanchayats.map((p: any) => (
                    <div key={p._id} className="flex items-center justify-between text-sm border-b border-agri-light/60 pb-2">
                      <span>{p.name} <span className="text-xs text-gray-500">({p.block})</span></span>
                      <span className="flex items-center gap-2"><span className="text-xs text-gray-500">{p.rainProbabilityPct}% · {p.last3dMm}mm</span><RiskBadge level={p.riskLevel} /></span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <ActionCard to="/officer/farmer-reports" title={t("ui.reportsTitle")} desc={t("ui.pendingReports")} badge={data.metrics.pendingReports} />
            <ActionCard to="/officer/manage" title={t("ui.manageTitle")} desc={lang === "ta" ? "எச்சரிக்கைகளை உருவாக்கி ஊராட்சி நிலையை புதுப்பிக்கவும்" : "Create alerts and update Panchayat status"} icon={<ListChecks size={18} />} />
            <ActionCard to="/verification" title={t("ui.verifTitle")} desc={t("nav.verification")} />
            <ActionCard to="/map" title={t("nav.map")} desc={t("ui.mapSub")} />
            <ActionCard to="/data-sources" title={t("ui.dsTitle")} desc="" />
          </div>
        </>
      )}
    </div>
  );
}
function Metric({ icon, label, value, highlight }: { icon: React.ReactNode; label: string; value: number; highlight?: boolean }) {
  return <div className={`border rounded-xl bg-white p-4 flex items-center gap-3 ${highlight ? "border-amber-300 bg-amber-50" : "border-agri-light"}`}><span className="text-agri-green">{icon}</span><div><div className="text-2xl font-bold text-agri-forest">{value}</div><div className="text-xs text-gray-600">{label}</div></div></div>;
}
function ActionCard({ to, title, desc, badge, icon }: { to: string; title: string; desc: string; badge?: number; icon?: React.ReactNode }) {
  return <Link to={to} className="border border-agri-light rounded-xl bg-white p-4 hover:border-agri-green flex items-start justify-between gap-2"><div>{icon}<h3 className="font-serif font-semibold text-agri-forest">{title}</h3><p className="text-xs text-gray-600 mt-1">{desc}</p></div>{!!badge && <span className="bg-red-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shrink-0">{badge}</span>}</Link>;
}
