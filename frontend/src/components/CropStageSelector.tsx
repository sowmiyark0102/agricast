import { useLanguage } from "../context/LanguageContext";

export default function CropStageSelector({
  stages,
  value,
  onChange,
}: {
  stages: string[];
  value: string;
  onChange: (stage: string) => void;
}) {
  const { t } = useLanguage();
  return (
    <label className="block">
      <span className="block text-sm font-medium text-gray-700 mb-1">{t("common.cropStage")}</span>
      <select
        className="w-full sm:w-56 border border-agri-green/40 rounded px-3 py-2 bg-white focus:border-agri-green"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {stages.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
    </label>
  );
}
