import { useEffect, useState } from "react";
import { api, friendlyErrorMessage } from "../services/api";
import { Panchayat } from "../types";
import LoadingSkeleton from "./LoadingSkeleton";
import ErrorState from "./ErrorState";
import { useLanguage } from "../context/LanguageContext";

export default function PanchayatSelector({
  value,
  onChange,
}: {
  value: string;
  onChange: (panchayat: Panchayat) => void;
}) {
  const { t } = useLanguage();
  const [panchayats, setPanchayats] = useState<Panchayat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    setError(null);
    api
      .get("/panchayats")
      .then((res) => {
        setPanchayats(res.data.panchayats);
        if (!value && res.data.panchayats.length > 0) {
          onChange(res.data.panchayats[0]);
        }
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
      <span className="block text-sm font-medium text-gray-700 mb-1">{t("common.panchayat")}</span>
      <select
        className="w-full sm:w-72 border border-agri-green/40 rounded px-3 py-2 bg-white focus:border-agri-green"
        value={value}
        onChange={(e) => {
          const p = panchayats.find((pp) => pp._id === e.target.value);
          if (p) onChange(p);
        }}
      >
        {panchayats.map((p) => (
          <option key={p._id} value={p._id}>
            {p.name} — {p.block}, {p.district}
          </option>
        ))}
      </select>
    </label>
  );
}
