import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api, friendlyErrorMessage } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { useFarmSelection } from "../context/FarmSelectionContext";
import { cropLabel, stageLabel, STAGES } from "../utils/cropAssets";
import ErrorState from "./ErrorState";
import LoadingSkeleton from "./LoadingSkeleton";
import type { Panchayat } from "../types";

const selectCls = "w-full border border-agri-green/40 rounded-lg px-3 py-2.5 bg-white text-sm focus:border-agri-green min-h-[44px]";

/** District > Block > Panchayat cascading selector. Keeps the shared selection in FarmSelectionContext. */
export function PanchayatPicker({ compact = false }: { compact?: boolean }) {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { panchayat, setPanchayat } = useFarmSelection();
  const [list, setList] = useState<Panchayat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    setError(null);
    api.get("/panchayats")
      .then((res) => {
        const items: Panchayat[] = res.data.panchayats;
        setList(items);
        if (!panchayat) {
          const mine = user && typeof user.panchayat === "string" ? items.find((p) => p._id === user.panchayat) : null;
          setPanchayat(mine || items.find((p) => p.name === "Example Panchayat") || items[0]);
        }
      })
      .catch((e) => setError(friendlyErrorMessage(e)))
      .finally(() => setLoading(false));
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(load, []);

  const districts = useMemo(() => Array.from(new Set(list.map((p) => p.district))), [list]);
  const blocks = useMemo(() => Array.from(new Set(list.filter((p) => p.district === panchayat?.district).map((p) => p.block))), [list, panchayat]);
  const panchayats = useMemo(() => list.filter((p) => p.district === panchayat?.district && p.block === panchayat?.block), [list, panchayat]);

  if (loading) return <LoadingSkeleton lines={1} />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!panchayat) return <p className="text-sm text-gray-600">{t("common.selectPanchayat")}</p>;

  const pickDistrict = (d: string) => { const f = list.find((p) => p.district === d); if (f) setPanchayat(f); };
  const pickBlock = (b: string) => { const f = list.find((p) => p.district === panchayat.district && p.block === b); if (f) setPanchayat(f); };
  const pickPanchayat = (id: string) => { const f = list.find((p) => p._id === id); if (f) setPanchayat(f); };

  return (
    <div className={`grid gap-3 ${compact ? "grid-cols-1 sm:grid-cols-3" : "grid-cols-1 sm:grid-cols-3"}`}>
      <label className="block">
        <span className="block text-xs font-medium text-gray-600 mb-1">{t("common.district")}</span>
        <select className={selectCls} value={panchayat.district} onChange={(e) => pickDistrict(e.target.value)}>
          {districts.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
      </label>
      <label className="block">
        <span className="block text-xs font-medium text-gray-600 mb-1">{t("common.block")}</span>
        <select className={selectCls} value={panchayat.block} onChange={(e) => pickBlock(e.target.value)}>
          {blocks.map((b) => <option key={b} value={b}>{b}</option>)}
        </select>
      </label>
      <label className="block">
        <span className="block text-xs font-medium text-gray-600 mb-1">{t("common.panchayat")}</span>
        <select className={selectCls} value={panchayat._id} onChange={(e) => pickPanchayat(e.target.value)}>
          {panchayats.map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}
        </select>
      </label>
    </div>
  );
}

/** Crop + crop stage selectors. */
export function CropPicker({ showStage = true }: { showStage?: boolean }) {
  const { t, lang } = useLanguage();
  const { user } = useAuth();
  const [params] = useSearchParams();
  const { crop, setCrop, cropStage, setCropStage } = useFarmSelection();
  const [crops, setCrops] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    setError(null);
    api.get("/crops")
      .then((res) => {
        const items = res.data.crops;
        setCrops(items);
        if (!crop) {
          const want = params.get("crop") || user?.crop;
          setCrop(items.find((c: any) => c.name === want) || items[0]);
        }
      })
      .catch((e) => setError(friendlyErrorMessage(e)));
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(load, []);

  useEffect(() => {
    const want = params.get("crop");
    if (want && crops.length) { const c = crops.find((x: any) => x.name === want); if (c && c._id !== crop?._id) setCrop(c); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params, crops]);

  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!crops.length) return <LoadingSkeleton lines={1} />;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <label className="block">
        <span className="block text-xs font-medium text-gray-600 mb-1">{t("common.crop")}</span>
        <select className={selectCls} value={crop?._id || ""} onChange={(e) => { const c = crops.find((x) => x._id === e.target.value); if (c) setCrop(c); }}>
          {crops.map((c) => <option key={c._id} value={c._id}>{cropLabel(c.name, lang)}</option>)}
        </select>
      </label>
      {showStage && (
        <label className="block">
          <span className="block text-xs font-medium text-gray-600 mb-1">{t("common.cropStage")}</span>
          <select className={selectCls} value={cropStage} onChange={(e) => setCropStage(e.target.value)}>
            {STAGES.map((s) => <option key={s} value={s}>{stageLabel(s, lang)}</option>)}
          </select>
        </label>
      )}
    </div>
  );
}
