import { useLanguage } from "../context/LanguageContext";
const STYLES: Record<string, string> = {
  LIVE: "bg-green-100 text-green-800 border-green-300",
  CACHED: "bg-amber-100 text-amber-800 border-amber-300",
  DEMO: "bg-gray-100 text-gray-700 border-gray-300",
};
/** Badge reflects the real source field. It only ever says LIVE when the data source says LIVE. */
export default function DataQualityBadge({ source = "DEMO" }: { source?: string }) {
  const { t } = useLanguage();
  const label = source === "DEMO" ? t("common.demoData") : source;
  return <span className={`inline-block text-[11px] font-semibold px-2 py-0.5 rounded border ${STYLES[source] || STYLES.DEMO}`}>{label}</span>;
}
