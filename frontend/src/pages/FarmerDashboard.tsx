import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Sprout, Tractor, TriangleAlert, PhoneCall, Map as MapIcon, RefreshCw, Cloud, CloudRain, Sun, Droplets, Wind, Thermometer, ChevronRight, Sparkles, Camera, IndianRupee, UserRound, Layers } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { useFarmSelection } from "../context/FarmSelectionContext";
import { PanchayatPicker, CropPicker } from "../components/FarmSelectors";
import RainMemoryCard from "../components/RainMemoryCard";
import MiniMap from "../components/MiniMap";
import DataQualityBadge from "../components/DataQualityBadge";
import LoadingSkeleton from "../components/LoadingSkeleton";
import ErrorState from "../components/ErrorState";
import { api, friendlyErrorMessage } from "../services/api";
import { conditionLabel, greeting, formatTime, validTill } from "../utils/weather";
import { CROP_IMAGES, cropLabel, stageLabel, label, ALERT_LABELS, STATUS_LABELS } from "../utils/cropAssets";

const STATUS_STYLE: Record<string, string> = { SUITABLE: "bg-green-100 text-green-800", USE_CAUTION: "bg-amber-100 text-amber-800", NOT_RECOMMENDED: "bg-red-100 text-red-800", INSUFFICIENT_DATA: "bg-gray-100 text-gray-700" };

export default function FarmerDashboard() {
  const { user } = useAuth();
  const { t, lang } = useLanguage();
  const { panchayat, crop, cropStage } = useFarmSelection();
  const [wx, setWx] = useState<any>(null);
  const [summary, setSummary] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [decisions, setDecisions] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updated, setUpdated] = useState<string>("");

  const load = useCallback(() => {
    if (!panchayat) return;
    setLoading(true);
    setError(null);
    const acts = ["IRRIGATION", "SPRAYING", "FERTILIZER_APPLICATION"];
    Promise.all([
      api.get(`/panchayats/${panchayat._id}/weather`),
      api.get("/panchayats/summary"),
      api.get("/alerts", { params: { panchayatId: panchayat._id } }),
      ...acts.map((a) => api.get("/decision/should-i-farm-today", { params: { panchayatId: panchayat._id, activity: a, crop: crop?.name, cropStage } })),
    ])
      .then(([w, s, a, ...d]) => {
        setWx(w.data);
        setSummary(s.data.panchayats);
        setAlerts(a.data.alerts);
        const map: Record<string, any> = {};
        acts.forEach((k, i) => (map[k] = d[i].data));
        setDecisions(map);
        setUpdated(new Date().toISOString());
      })
      .catch((e) => setError(friendlyErrorMessage(e)))
      .finally(() => setLoading(false));
  }, [panchayat, crop, cropStage]);

  useEffect(load, [load]);

  const obs = wx?.observation;
  const fc = wx?.forecast;
  const guide = crop?.stageGuide?.[cropStage];
  const alert0 = alerts[0];

  const tiles = [
    { to: "/advisory", icon: <Sprout size={26} />, label: t("nav.advisory"), cls: "bg-green-50 text-green-800" },
    { to: "/farm-activity", icon: <Tractor size={26} />, label: t("nav.farmActivity"), cls: "bg-amber-50 text-amber-800" },
    { to: "/alerts", icon: <TriangleAlert size={26} />, label: t("ui.alertsTitle"), cls: "bg-red-50 text-red-700" },
    { to: "/voiceline", icon: <PhoneCall size={26} />, label: "VoiceLine", cls: "bg-sky-50 text-sky-800" },
    { to: "/map", icon: <MapIcon size={26} />, label: t("nav.map"), cls: "bg-indigo-50 text-indigo-800" },
  ];
  const more = [
    { to: "/weather", icon: <Layers size={20} />, label: t("ui.cardWeather"), d: t("ui.cardWeatherD") },
    { to: "/ai-downscaling", icon: <Sparkles size={20} />, label: t("ui.cardDownscaling"), d: t("ui.cardDownscalingD") },
    { to: "/farmer/photo-risk", icon: <Camera size={20} />, label: t("ui.cardPhoto"), d: t("ui.cardPhotoD") },
    { to: "/farmer/risk-saved", icon: <IndianRupee size={20} />, label: t("ui.cardRisk"), d: t("ui.cardRiskD") },
    { to: "/farmer/profile", icon: <UserRound size={20} />, label: t("ui.cardRecords"), d: t("ui.cardRecordsD") },
  ];

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-4 py-4 space-y-4">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-bold tracking-wide px-2.5 py-1 rounded bg-agri-green text-white">{t("farmerMode")}</span>
        <span className="text-xs text-gray-500 truncate">{user?.name}</span>
      </div>

      <div className="bg-agri-light/70 border border-agri-green/20 rounded-xl p-3"><PanchayatPicker /></div>

      {/* Hero */}
      <section className="relative rounded-xl overflow-hidden text-white min-h-[150px]">
        <img src="/images/rice-field-cloudy.jpg" alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/65 to-black/35" />
        <div className="relative p-4 sm:p-6 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold leading-tight">{greeting(lang)},<br />{lang === "ta" ? "விவசாயி!" : "Farmer!"}</h1>
            <p className="text-sm text-white/90 mt-2 max-w-[16rem]">{lang === "ta" ? "இன்றைய உள்ளூர் வானிலை மற்றும் பயிர் ஆலோசனை இதோ." : "Here is your local weather and crop advisory for today."}</p>
          </div>
          <div className="text-right shrink-0 border-l border-white/40 pl-4">
            <div className="text-xs text-white/80">{lang === "ta" ? "இன்று" : "Today"}</div>
            <div className="flex items-center gap-2 justify-end text-lg font-semibold">
              {(fc?.rainProbabilityPct ?? 0) >= 60 ? <CloudRain size={26} /> : <Cloud size={26} />}
              <span>{conditionLabel(obs, fc, lang)}</span>
            </div>
            <Link to="/weather" className="inline-flex items-center gap-1 mt-2 text-sm bg-agri-forest/90 hover:bg-agri-forest rounded-full px-3 py-1.5">
              {lang === "ta" ? "விவரங்கள்" : "View Details"} <ChevronRight size={14} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      {loading && !wx && <LoadingSkeleton lines={4} />}
      {error && <ErrorState message={error} onRetry={load} />}

      {/* Today's weather */}
      {wx && (
        <section className="bg-white border border-agri-light rounded-xl p-4" aria-label={t("ui.weatherTitle")}>
          <div className="flex items-center justify-between gap-2 mb-3">
            <h2 className="font-serif font-bold text-agri-forest flex items-center gap-2"><Sun size={20} className="text-amber-500" aria-hidden="true" />{lang === "ta" ? "இன்றைய வானிலை" : "Today's Weather"}</h2>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <DataQualityBadge source={obs?.source} />
              <span>{lang === "ta" ? "புதுப்பிப்பு" : "Updated"} {formatTime(updated)}</span>
              <button onClick={load} aria-label={t("common.retry")} className="p-1.5 rounded hover:bg-agri-light"><RefreshCw size={16} className={loading ? "animate-spin" : ""} /></button>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 items-center">
            <div className="col-span-2 sm:col-span-1 flex items-center gap-3">
              <Cloud size={40} className="text-sky-500" aria-hidden="true" />
              <div><div className="text-3xl font-bold text-agri-forest">{obs ? `${Math.round(obs.temperatureC)}°C` : "—"}</div><div className="text-xs text-gray-600">{conditionLabel(obs, fc, lang)}</div></div>
            </div>
            <Stat icon={<Droplets size={18} />} label={t("common.rainProbability")} value={fc ? `${fc.rainProbabilityPct}%` : "—"} />
            <Stat icon={<CloudRain size={18} />} label={t("common.expectedRainfall")} value={fc ? `${fc.expectedRainfallMinMm}–${fc.expectedRainfallMaxMm} mm` : "—"} />
            <Stat icon={<Thermometer size={18} />} label={t("common.humidity")} value={obs ? `${obs.humidityPct}%` : "—"} />
            <Stat icon={<Wind size={18} />} label={t("common.wind")} value={obs ? `${obs.windKmh} km/h` : "—"} />
            <Stat icon={<Cloud size={18} />} label={t("common.cloudCover")} value={obs ? `${obs.cloudCoverPct}%` : "—"} />
          </div>
          {fc && <p className="mt-3 text-sm text-gray-700">{fc.rainProbabilityPct >= 55 ? t("common.rainLikely") : t("common.rainUnlikely")}</p>}
        </section>
      )}

      {/* Quick tiles */}
      <section className="grid grid-cols-3 sm:grid-cols-5 gap-2" aria-label="Quick links">
        {tiles.map((x) => (
          <Link key={x.to} to={x.to} className={`${x.cls} rounded-xl border border-black/5 p-3 flex flex-col items-center justify-center gap-1.5 text-center min-h-[92px] hover:shadow-sm`}>
            {x.icon}<span className="text-xs font-semibold leading-tight">{x.label}</span>
          </Link>
        ))}
      </section>

      {/* Mini map */}
      {summary.length > 0 && (
        <section className="bg-white border border-agri-light rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-serif font-bold text-agri-forest flex items-center gap-2"><MapIcon size={18} aria-hidden="true" />{t("ui.mapTitle")}</h2>
            <Link to="/map" className="text-sm text-agri-green font-semibold inline-flex items-center gap-1">{lang === "ta" ? "முழு வரைபடம்" : "View Full Map"} <ChevronRight size={14} aria-hidden="true" /></Link>
          </div>
          <MiniMap items={summary.filter((p) => !panchayat || p.district === panchayat.district)} selectedId={panchayat?._id} height={210} />
          <div className="flex gap-4 mt-2 text-xs text-gray-600">
            <span>● {t("ui.legendNormal")}</span><span>▲ {t("ui.legendCaution")}</span><span>■ {t("ui.legendHigh")}</span>
            <span className="ml-auto"><DataQualityBadge source="DEMO" /></span>
          </div>
        </section>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        {/* Crop advisory */}
        <section className="bg-green-50/60 border border-green-200 rounded-xl p-4">
          <h2 className="font-serif font-bold text-agri-forest flex items-center gap-2 mb-3"><Sprout size={18} aria-hidden="true" />{lang === "ta" ? "இன்றைய பயிர் ஆலோசனை" : "Today's Crop Advisory"}</h2>
          <div className="mb-3"><CropPicker /></div>
          {crop && (
            <Link to={`/advisory?crop=${crop.name}`} className="flex items-center gap-3 bg-white rounded-lg p-2 border border-agri-light hover:border-agri-green">
              <img src={CROP_IMAGES[crop.name]} alt={crop.name} className="w-14 h-14 rounded object-cover" />
              <div className="flex-1"><div className="font-semibold text-agri-forest">{cropLabel(crop.name, lang)}</div><div className="text-xs text-gray-600">{stageLabel(cropStage, lang)}</div></div>
              <ChevronRight size={18} className="text-gray-400" aria-hidden="true" />
            </Link>
          )}
          {guide && <p className="text-sm text-gray-700 mt-3">{lang === "ta" ? guide.advisoryTa : guide.advisory}</p>}
          <div className="flex flex-wrap gap-2 mt-3">
            {Object.entries(decisions).map(([k, d]: any) => (
              <span key={k} className={`text-xs font-semibold px-2 py-1 rounded ${STATUS_STYLE[d.status]}`}>
                {label({ IRRIGATION: { en: "Irrigation", ta: "நீர்ப்பாசனம்" }, SPRAYING: { en: "Spraying", ta: "மருந்து" }, FERTILIZER_APPLICATION: { en: "Fertilizer", ta: "உரம்" } }, k, lang)}: {label(STATUS_LABELS, d.status, lang)}
              </span>
            ))}
          </div>
        </section>

        {/* Alerts */}
        <section className="bg-red-50/60 border border-red-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-serif font-bold text-red-800 flex items-center gap-2"><TriangleAlert size={18} aria-hidden="true" />{t("ui.activeAlerts")}</h2>
            <Link to="/alerts" className="text-sm text-red-700 font-semibold">{lang === "ta" ? "அனைத்தும்" : "View All"}</Link>
          </div>
          {alert0 ? (
            <div className="bg-white rounded-lg p-3 border border-red-100">
              <div className="flex items-start gap-3">
                <CloudRain className="text-sky-600 shrink-0" size={32} aria-hidden="true" />
                <div>
                  <div className="font-semibold text-agri-forest">{label(ALERT_LABELS, alert0.alertType, lang)}</div>
                  <div className="text-xs text-gray-600">{alert0.panchayat?.name}, {alert0.panchayat?.district}</div>
                  <div className="text-xs text-gray-600">{lang === "ta" ? "செல்லுபடி" : "Valid till"}: {validTill(alert0.startTime, alert0.expectedDurationHours)}</div>
                </div>
              </div>
              <p className="text-sm text-red-800 bg-red-50 rounded p-2 mt-2">{alert0.recommendedAttention}</p>
              {alerts.length > 1 && <p className="text-xs text-gray-500 mt-2">+{alerts.length - 1}</p>}
            </div>
          ) : <p className="text-sm text-gray-600">{t("ui.noAlerts")}</p>}
        </section>
      </div>

      {wx?.rainMemory && <RainMemoryCard rm={wx.rainMemory} />}

      {/* VoiceLine bar */}
      <section className="bg-sky-50 border border-sky-200 rounded-xl p-3 sm:p-4 flex items-center gap-3">
        <span className="bg-sky-800 text-white rounded-full p-3 shrink-0"><PhoneCall size={22} aria-hidden="true" /></span>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sky-900">AgriCast VoiceLine</div>
          <div className="text-xs text-gray-600">{lang === "ta" ? "எளிய தொலைபேசி அழைப்பு மூலம் வானிலை மற்றும் பயிர் ஆலோசனை பெறுங்கள்" : "Get weather & crop advisory through a simple phone call"}</div>
        </div>
        <Link to="/voiceline" className="bg-sky-900 text-white text-sm font-semibold rounded-full px-4 py-2 shrink-0">{lang === "ta" ? "அழை" : "Call Now"}</Link>
      </section>

      {/* More tools */}
      <section>
        <h2 className="font-serif font-bold text-agri-forest mb-2">{t("home.featuresTitle")}</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {more.map((m) => (
            <Link key={m.to} to={m.to} className="bg-white border border-agri-light rounded-xl p-3 flex gap-3 hover:border-agri-green">
              <span className="text-agri-green mt-0.5">{m.icon}</span>
              <span><span className="block font-semibold text-agri-forest text-sm">{m.label}</span><span className="block text-xs text-gray-600">{m.d}</span></span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex sm:flex-col sm:items-center items-center gap-2 sm:gap-0.5 text-sm sm:text-center sm:border-l sm:border-agri-light sm:px-2">
      <span className="text-agri-blue">{icon}</span>
      <div><div className="text-[11px] text-gray-500 leading-tight">{label}</div><div className="font-bold text-agri-forest">{value}</div></div>
    </div>
  );
}
