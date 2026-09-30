import { useLanguage } from "../context/LanguageContext";
import { RISK_LEVEL_LABELS, label } from "../utils/cropAssets";
const STYLES: Record<string, string> = {
  LOW: "bg-green-100 text-green-800 border-green-300", NORMAL: "bg-green-100 text-green-800 border-green-300",
  MODERATE: "bg-amber-100 text-amber-800 border-amber-300", CAUTION: "bg-amber-100 text-amber-800 border-amber-300",
  HIGH: "bg-red-100 text-red-800 border-red-300", HIGH_RISK: "bg-red-100 text-red-800 border-red-300",
  INSUFFICIENT_DATA: "bg-gray-100 text-gray-700 border-gray-300", PENDING: "bg-gray-100 text-gray-700 border-gray-300",
};
const ICON: Record<string, string> = { LOW: "●", NORMAL: "●", MODERATE: "▲", CAUTION: "▲", HIGH: "■", HIGH_RISK: "■" };
// Icon + text so meaning never depends on colour alone.
export default function RiskBadge({ level }: { level: string }) {
  const { lang } = useLanguage();
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded border ${STYLES[level] || STYLES.MODERATE}`}>
      <span aria-hidden="true">{ICON[level] || ""}</span>{label(RISK_LEVEL_LABELS, level, lang)}
    </span>
  );
}
