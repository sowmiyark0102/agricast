import { useRef, useState, FormEvent } from "react";
import { Camera, Upload, X } from "lucide-react";
import { PanchayatPicker, CropPicker } from "../components/FarmSelectors";
import { useFarmSelection } from "../context/FarmSelectionContext";
import { useLanguage } from "../context/LanguageContext";
import { api, friendlyErrorMessage } from "../services/api";
import ErrorState from "../components/ErrorState";
import RiskBadge from "../components/RiskBadge";

const MAX_BYTES = 2 * 1024 * 1024;

function compressImage(file: File): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const maxDim = 1280;
      const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("Canvas not supported"));
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      canvas.toBlob((blob) => {
        if (!blob) return reject(new Error("Compression failed"));
        resolve(new File([blob], file.name.replace(/\.\w+$/, "") + ".jpg", { type: "image/jpeg" }));
      }, "image/jpeg", 0.82);
    };
    img.onerror = () => reject(new Error("Could not read the image"));
    img.src = url;
  });
}

export default function PhotoRiskCheckPage() {
  const { t, lang } = useLanguage();
  const { panchayat, crop, cropStage } = useFarmSelection();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (f: File | null) => {
    setError(null);
    if (!f) { setFile(null); setPreview(null); return; }
    if (!["image/jpeg", "image/png", "image/webp"].includes(f.type)) { setError(t("ui.choosePhoto")); return; }
    try {
      const compressed = f.size > MAX_BYTES || f.type !== "image/jpeg" ? await compressImage(f) : f;
      setFile(compressed);
      setPreview(URL.createObjectURL(compressed));
    } catch { setError("Could not process that photo. Please try another one."); }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!panchayat || !crop || !cropStage || !file) { setError(`${t("common.selectPanchayat")} ${t("ui.choosePhoto")}`); return; }
    setSubmitting(true); setError(null);
    try {
      const fd = new FormData();
      fd.append("panchayatId", panchayat._id); fd.append("crop", crop.name); fd.append("cropStage", cropStage); fd.append("photo", file);
      const res = await api.post("/farmer/photo-risk", fd, { headers: { "Content-Type": "multipart/form-data" } });
      setResult(res.data.record.analysisResult);
      setPhotoUrl(res.data.record.photoUrl);
    } catch (err) { setError(friendlyErrorMessage(err)); } finally { setSubmitting(false); }
  };

  return (
    <div className="max-w-2xl mx-auto px-3 sm:px-4 py-6 space-y-5">
      <div className="flex items-center gap-2"><Camera className="text-agri-green" aria-hidden="true" /><h1 className="text-2xl font-serif font-bold text-agri-forest">{t("ui.photoTitle")}</h1></div>
      <p className="text-sm text-gray-600">{t("ui.photoSub")}</p>

      <form onSubmit={handleSubmit} className="border border-agri-light rounded-xl bg-white p-5 space-y-4">
        <div className="bg-agri-light/70 border border-agri-green/20 rounded-xl p-3 space-y-3"><PanchayatPicker /><CropPicker /></div>

        <div>
          <span className="block text-sm font-medium text-gray-700 mb-1">{lang === "ta" ? "பயிர் புகைப்படம்" : "Crop photograph"}</span>
          <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" capture="environment" onChange={(e) => handleFile(e.target.files?.[0] || null)} className="hidden" />
          {!preview ? (
            <button type="button" onClick={() => inputRef.current?.click()} className="w-full border-2 border-dashed border-agri-green/40 rounded-xl p-8 flex flex-col items-center gap-2 text-agri-forest hover:bg-agri-light/40 min-h-[44px]">
              <Upload size={26} aria-hidden="true" /><span className="text-sm text-center">{t("ui.choosePhoto")}</span>
            </button>
          ) : (
            <div className="relative">
              <img src={preview} alt="Selected crop preview" className="rounded-xl max-h-72 w-full object-cover" />
              <button type="button" onClick={() => handleFile(null)} className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1.5" aria-label="Remove photo"><X size={16} /></button>
            </div>
          )}
        </div>

        {error && <ErrorState message={error} />}

        <button type="submit" disabled={submitting || !file} className="w-full py-2.5 rounded-full bg-agri-green text-white font-semibold hover:bg-agri-forest disabled:opacity-60 min-h-[44px]">
          {submitting ? t("common.loading") : t("ui.takePhoto")}
        </button>
      </form>

      {result && (
        <div className="border border-agri-light rounded-xl bg-white p-5">
          <div className="flex items-center justify-between mb-2"><h3 className="font-serif font-semibold text-agri-forest">{lang === "ta" ? "முடிவு" : "Result"}</h3><RiskBadge level={result.riskCategory} /></div>
          {photoUrl && <img src={photoUrl} alt="Submitted crop" className="rounded-xl max-h-64 w-full object-cover mb-3" />}
          <p className="text-sm text-gray-700">{result.explanation}</p>
          <p className="text-sm text-gray-700 mt-2"><strong>{lang === "ta" ? "பரிந்துரை" : "Recommendation"}:</strong> {result.recommendation}</p>
          <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded inline-block px-2 py-1 mt-3">{t("ui.demoImage")}</p>
          <p className="text-xs text-gray-500 mt-2 italic">{result.disclaimer}</p>
        </div>
      )}
    </div>
  );
}
