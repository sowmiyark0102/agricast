import { useEffect, useState } from "react";
import { api, friendlyErrorMessage } from "../services/api";
import { CropProfile } from "../types";
import LoadingSkeleton from "./LoadingSkeleton";
import ErrorState from "./ErrorState";
import { useLanguage } from "../context/LanguageContext";

export default function CropSelector({
  value,
  onChange,
}: {
  value: string;
  onChange: (crop: CropProfile) => void;
}) {
  const { t } = useLanguage();
  const [crops, setCrops] = useState<CropProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    setError(null);
    api
      .get("/crops")
      .then((res) => {
        setCrops(res.data.crops);
        if (!value && res.data.crops.length > 0) onChange(res.data.crops[0]);
      })
      .catch((err) => setError(friendlyErrorMessage(err)))
      .finally(() => setLoading(false));
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(load, []);

  if (loading) return <LoadingSkeleton lines={1} className="max-w-xs" />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <label className="block">
      <span className="block text-sm font-medium text-gray-700 mb-1">{t("common.crop")}</span>
      <select
        className="w-full sm:w-56 border border-agri-green/40 rounded px-3 py-2 bg-white focus:border-agri-green"
        value={value}
        onChange={(e) => {
          const c = crops.find((cc) => cc._id === e.target.value);
          if (c) onChange(c);
        }}
      >
        {crops.map((c) => (
          <option key={c._id} value={c._id}>
            {c.name}
          </option>
        ))}
      </select>
    </label>
  );
}
