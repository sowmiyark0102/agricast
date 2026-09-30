import { Info } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

/** Plain-language reasons. No fabricated percentages: only factors the rules actually used. */
export default function ExplainableAIPanel({ factors, title, footnote }: { factors: string[]; title?: string; footnote?: string }) {
  const { t } = useLanguage();
  return (
    <div className="border border-agri-blue/30 bg-agri-blue/5 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-2">
        <Info size={18} className="text-agri-blue" aria-hidden="true" />
        <h4 className="font-semibold text-agri-forest">{title || t("ui.why")}</h4>
      </div>
      <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">{factors.map((f, i) => <li key={i}>{f}</li>)}</ul>
      <p className="mt-3 text-xs text-gray-500 italic">{footnote || t("ui.ruleBased")}</p>
    </div>
  );
}
