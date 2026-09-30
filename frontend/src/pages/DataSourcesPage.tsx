import { useEffect, useState } from "react";
import { api, friendlyErrorMessage } from "../services/api";
import { useLanguage } from "../context/LanguageContext";
import LoadingSkeleton from "../components/LoadingSkeleton";
import ErrorState from "../components/ErrorState";
import DataQualityBadge from "../components/DataQualityBadge";

const SOURCES = [
  { source: "Open-Meteo", purposeEn: "Regional weather — demonstration / potential live integration point", purposeTa: "பிராந்திய வானிலை — விளக்க / எதிர்கால நேரடி இணைப்பு", status: "NOT CONNECTED" },
  { source: "OpenStreetMap", purposeEn: "Map tiles and geographic visualization", purposeTa: "வரைபட டைல்ஸ் மற்றும் புவியியல் காட்சி", status: "LIVE (tile service)" },
  { source: "NASA POWER", purposeEn: "Historical/environmental data where applicable", purposeTa: "வரலாற்று/சுற்றுச்சூழல் தரவு", status: "NOT CONNECTED" },
  { source: "IMD", purposeEn: "Regional weather and warnings", purposeTa: "பிராந்திய வானிலை மற்றும் எச்சரிக்கைகள்", status: "NOT CONNECTED" },
];

export default function DataSourcesPage() {
  const { t, lang } = useLanguage();
  const [dq, setDq] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { api.get("/data-quality").then((r) => setDq(r.data)).catch((e) => setError(friendlyErrorMessage(e))).finally(() => setLoading(false)); }, []);

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-10 space-y-6">
      <div><h1 className="text-2xl font-serif font-bold text-agri-forest">{t("ui.dsTitle")}</h1><p className="text-sm text-gray-600">{lang === "ta" ? "அக்ரிகாஸ்ட் AI இந்த முன்மாதிரியில் நேரடி அரசு தரவு இணைப்பை உரிமை கோரவில்லை." : "AgriCast AI does not claim direct government data integration in this prototype. Every screen showing demonstration data is clearly labelled."}</p></div>

      <div className="overflow-x-auto border border-agri-light rounded-xl bg-white">
        <table className="w-full text-sm text-left">
          <thead className="bg-agri-light/60 text-agri-forest"><tr><th className="px-4 py-2">{lang === "ta" ? "ஆதாரம்" : "Source"}</th><th className="px-4 py-2">{lang === "ta" ? "நோக்கம்" : "Purpose"}</th><th className="px-4 py-2">{lang === "ta" ? "நிலை" : "Status"}</th></tr></thead>
          <tbody>{SOURCES.map((s) => (<tr key={s.source} className="border-t border-agri-light"><td className="px-4 py-2 font-medium">{s.source}</td><td className="px-4 py-2 text-gray-600">{lang === "ta" ? s.purposeTa : s.purposeEn}</td><td className="px-4 py-2"><span className="text-xs px-2 py-0.5 rounded border bg-gray-100 text-gray-700 border-gray-300">{s.status}</span></td></tr>))}</tbody>
        </table>
      </div>

      {loading && <LoadingSkeleton lines={4} />}
      {error && <ErrorState message={error} />}
      {dq && (
        <div className="bg-white border border-agri-light rounded-xl p-5">
          <h2 className="font-serif font-bold text-agri-forest mb-3">{lang === "ta" ? "தரவு தரம்" : "Data Quality"}</h2>
          <div className="overflow-x-auto"><table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500"><tr><th className="py-1 pr-3">{lang === "ta" ? "தரவுத்தொகுப்பு" : "Dataset"}</th><th className="pr-3">{lang === "ta" ? "நிலை" : "Status"}</th><th className="pr-3">{lang === "ta" ? "எண்ணிக்கை" : "Count"}</th><th className="pr-3">{lang === "ta" ? "பரப்பளவு" : "Coverage"}</th><th>{lang === "ta" ? "புதுப்பிப்பு" : "Last Updated"}</th></tr></thead>
            <tbody>{dq.sources.map((s: any) => (<tr key={s.name} className="border-t border-agri-light"><td className="py-1.5 pr-3">{s.name}</td><td className="pr-3"><DataQualityBadge source={s.source} /></td><td className="pr-3">{s.observationCount}</td><td className="pr-3">{s.coveragePct}%</td><td>{s.lastUpdated ? new Date(s.lastUpdated).toLocaleString() : "—"}</td></tr>))}</tbody>
          </table></div>
          <div className="mt-3 space-y-1">{dq.notes.map((n: string, i: number) => <p key={i} className="text-xs text-gray-500">• {n}</p>)}</div>
          <p className="text-xs text-gray-500 mt-3">{lang === "ta" ? "துல்லிய அளவு" : "Resolution"}: {dq.resolution.regional} · {dq.resolution.local}</p>
        </div>
      )}
      <p className="text-xs text-gray-500">{lang === "ta" ? "இந்த முன்மாதிரி முழுவதும் காட்டப்படும் வானிலை படங்கள் விளக்கத்திற்காக பயன்படுத்தப்படுகின்றன; நேரடி வரைபட டைல்ஸ் OpenStreetMap பங்களிப்பாளர்களால் வழங்கப்படுகின்றன." : "Weather images shown throughout AgriCast AI are used for illustration; live map tiles are served by OpenStreetMap contributors."}</p>
    </div>
  );
}
