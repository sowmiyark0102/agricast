import type { Lang } from "./cropAssets";

export function conditionLabel(obs: any, fc: any, lang: Lang): string {
  const cloud = obs?.cloudCoverPct ?? fc?.cloudCoverPct ?? 0;
  const prob = fc?.rainProbabilityPct ?? 0;
  const en = prob >= 60 ? "Rain Likely" : cloud >= 70 ? "Mostly Cloudy" : cloud >= 40 ? "Partly Cloudy" : "Mostly Clear";
  const ta = prob >= 60 ? "மழை வர வாய்ப்பு" : cloud >= 70 ? "பெரும்பாலும் மேகமூட்டம்" : cloud >= 40 ? "பகுதி மேகமூட்டம்" : "தெளிவான வானம்";
  return lang === "ta" ? ta : en;
}

export function greeting(lang: Lang): string {
  const h = new Date().getHours();
  if (lang === "ta") return h < 12 ? "காலை வணக்கம்" : h < 17 ? "மதிய வணக்கம்" : "மாலை வணக்கம்";
  return h < 12 ? "Good Morning" : h < 17 ? "Good Afternoon" : "Good Evening";
}

export function formatTime(iso?: string): string {
  if (!iso) return "";
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function validTill(startTime: string, hours: number): string {
  const d = new Date(new Date(startTime).getTime() + (hours || 6) * 3600 * 1000);
  return d.toLocaleString([], { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

export const RISK_COLORS: Record<string, string> = { NORMAL: "#2E7D32", CAUTION: "#E0A100", HIGH_RISK: "#C62828" };

export function rainColor(mm: number | null): string {
  if (mm == null) return "#9e9e9e";
  return mm >= 60 ? "#1e3a8a" : mm >= 35 ? "#2563eb" : mm >= 15 ? "#60a5fa" : "#bfdbfe";
}
export function tempColor(t: number | null): string {
  if (t == null) return "#9e9e9e";
  return t >= 33 ? "#b91c1c" : t >= 30 ? "#ea580c" : t >= 27 ? "#f59e0b" : "#fde68a";
}
