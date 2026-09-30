import { CloudRain } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import RiskBadge from "./RiskBadge";

export default function RainMemoryCard({ rm }: { rm: any }) {
  const { t, lang } = useLanguage();
  if (!rm) return null;
  const cell = (label: string, value: string) => (
    <div className="bg-agri-light/50 rounded-lg p-3 text-center">
      <div className="text-xs text-gray-600">{label}</div>
      <div className="text-lg font-bold text-agri-forest">{value}</div>
    </div>
  );
  return (
    <section className="border border-agri-light rounded-xl bg-white p-4" aria-label={t("ui.rainMemory")}>
      <div className="flex items-center justify-between gap-2 mb-3">
        <h3 className="font-serif font-bold text-agri-forest flex items-center gap-2"><CloudRain size={18} className="text-agri-blue" aria-hidden="true" />{t("ui.rainMemory")}</h3>
        <RiskBadge level={rm.risk} />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {cell(t("ui.last24h"), `${rm.last24hMm} mm`)}
        {cell(t("ui.last3d"), `${rm.last3dMm} mm`)}
        {cell(t("ui.last7d"), `${rm.last7dMm} mm`)}
        {cell(t("ui.next24h"), `${rm.next24hRange[0]}–${rm.next24hRange[1]} mm`)}
      </div>
      <p className="text-sm text-gray-700 mt-3">{rm.explanation[lang]}</p>
    </section>
  );
}
