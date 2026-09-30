import { useEffect, useState } from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine, Cell, Legend } from "recharts";
import { PanchayatPicker } from "../components/FarmSelectors";
import DataQualityBadge from "../components/DataQualityBadge";
import LoadingSkeleton from "../components/LoadingSkeleton";
import ErrorState from "../components/ErrorState";
import { useFarmSelection } from "../context/FarmSelectionContext";
import { useLanguage } from "../context/LanguageContext";
import { api, friendlyErrorMessage } from "../services/api";

const VARS = [
  { key: "temperature", en: "Temperature (mean)", ta: "வெப்பநிலை (சராசரி)", unit: "°C", reg: "tempC", loc: "temperatureC", unc: (u: any) => `± ${u.temperatureC} °C` },
  { key: "rainProbability", en: "Rain probability", ta: "மழை வாய்ப்பு", unit: "%", reg: "rainProbabilityPct", loc: "rainProbabilityPct", unc: (u: any) => `± ${u.rainProbabilityPts} pts` },
  { key: "rainfall", en: "Expected rainfall", ta: "எதிர்பார்க்கப்படும் மழை", unit: "mm", reg: "rainfallMm", loc: "rainfallMm", unc: (_u: any, l: any) => `${l.expectedRainfallMinMm}–${l.expectedRainfallMaxMm} mm` },
  { key: "humidity", en: "Humidity", ta: "ஈரப்பதம்", unit: "%", reg: "humidityPct", loc: "humidityPct", unc: () => "" },
  { key: "wind", en: "Wind speed", ta: "காற்றின் வேகம்", unit: "km/h", reg: "windKmh", loc: "windKmh", unc: () => "" },
];
const sign = (n: number) => (n > 0 ? `+${n}` : `${n}`);

export default function AIDownscalingPage() {
  const { t, lang } = useLanguage();
  const { panchayat } = useFarmSelection();
  const [d, setD] = useState<any>(null);
  const [ver, setVer] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const tr = (en: string, ta: string) => (lang === "ta" ? ta : en);

  const load = () => {
    if (!panchayat) return;
    setLoading(true);
    setError(null);
    api.get("/downscaling", { params: { panchayatId: panchayat._id } })
      .then(async (r) => {
        setD(r.data);
        const v = await api.get("/verification", { params: { block: r.data.panchayat.block, district: r.data.panchayat.district } });
        setVer(v.data);
      })
      .catch((e) => setError(friendlyErrorMessage(e)))
      .finally(() => setLoading(false));
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(load, [panchayat]);

  const inf = d?.inference;
  const cmp = (d?.blockComparison || []).map((b: any) => ({ name: b.name.replace(" Panchayat", ""), id: b.panchayatId, rain: b.local.rainfallMm }));

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-4 py-6 space-y-5">
      <div>
        <h1 className="text-2xl font-serif font-bold text-agri-forest">{t("ui.downTitle")}</h1>
        <p className="text-sm text-gray-600">{t("ui.downSub")}</p>
      </div>
      <div className="bg-agri-light/70 border border-agri-green/20 rounded-xl p-3"><PanchayatPicker /></div>
      {loading && !d && <LoadingSkeleton lines={6} />}
      {error && <ErrorState message={error} onRetry={load} />}

      {d && (
        <>
          {/* 1. Resolution and source transparency */}
          <section className="bg-white border border-agri-light rounded-xl p-4">
            <div className="flex items-center justify-between gap-2 mb-2">
              <h2 className="font-serif font-bold text-agri-forest">{tr("Data resolution & source", "தரவு துல்லிய அளவு & ஆதாரம்")}</h2>
              <DataQualityBadge source="DEMO" />
            </div>
            <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
              <div><dt className="text-gray-500 text-xs">{tr("Regional input", "பிராந்திய உள்ளீடு")}</dt><dd>{d.resolution.regional}</dd></div>
              <div><dt className="text-gray-500 text-xs">{tr("Downscaled output", "வெளியீடு")}</dt><dd>{d.resolution.local}</dd></div>
              <div><dt className="text-gray-500 text-xs">{tr("Method", "முறை")}</dt><dd>{d.method.name}</dd></div>
              <div><dt className="text-gray-500 text-xs">{tr("Live data", "நேரடி தரவு")}</dt><dd>{d.resolution.liveSource}</dd></div>
            </dl>
            <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded p-2 mt-3">{d.method.description} {tr("This is a rule-based demonstration, not a trained model.", "இது விதி அடிப்படையிலான விளக்கம்; பயிற்சி பெற்ற மாதிரி அல்ல.")}</p>
          </section>

          {/* 2. Explicit inference */}
          <section className="bg-white border border-agri-light rounded-xl p-4">
            <h2 className="font-serif font-bold text-agri-forest mb-1">{tr("Downscaling inference for", "நுண்ணறிவு கணக்கீடு:")} {d.panchayat.name}</h2>
            <p className="text-xs text-gray-500 mb-3">{tr("Regional value → each geographic adjustment → Panchayat estimate. Every number below is computed, not typed in.", "பிராந்திய மதிப்பு → ஒவ்வொரு புவியியல் சரிசெய்தல் → ஊராட்சி மதிப்பீடு. கீழுள்ள ஒவ்வொரு எண்ணும் கணக்கிடப்பட்டது.")}</p>
            <div className="space-y-3">
              {VARS.map((v) => {
                const adj = inf.adjustments.filter((a: any) => a.variable === v.key);
                return (
                  <div key={v.key} className="border border-agri-light rounded-lg p-3">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <span className="font-semibold text-agri-forest text-sm">{lang === "ta" ? v.ta : v.en}</span>
                      <span className="text-sm"><span className="text-gray-500">{tr("Regional", "பிராந்திய")}:</span> <strong>{inf.regional[v.reg]} {v.unit}</strong> <span className="mx-1">→</span> <span className="text-gray-500">{tr("Panchayat", "ஊராட்சி")}:</span> <strong className="text-agri-green">{inf.local[v.loc]} {v.unit}</strong> <span className="text-xs text-gray-500">{v.unc(inf.uncertainty, inf.local)}</span></span>
                    </div>
                    {adj.length === 0 ? <p className="text-xs text-gray-500 mt-1">{tr("No geographic adjustment applies for this Panchayat.", "இந்த ஊராட்சிக்கு புவியியல் சரிசெய்தல் இல்லை.")}</p> : (
                      <ul className="mt-2 space-y-1">
                        {adj.map((a: any, i: number) => (
                          <li key={i} className="text-xs text-gray-700 flex flex-wrap gap-x-2"><span className="font-mono font-semibold w-20 shrink-0">{sign(a.delta)} {a.unit}</span><span><strong>{a.label}</strong> — {a.explanation}</span></li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-gray-500 mt-3">{inf.uncertainty.note}</p>
          </section>

          {/* 3. Geographic feature engineering */}
          <section className="bg-white border border-agri-light rounded-xl p-4">
            <h2 className="font-serif font-bold text-agri-forest mb-2">{tr("Geographic features used", "பயன்படுத்திய புவியியல் அம்சங்கள்")}</h2>
            <div className="overflow-x-auto"><table className="w-full text-sm text-left"><tbody>
              {[
                [tr("Latitude, longitude", "அட்சரேகை, தீர்க்கரேகை"), `${d.features.latitude}, ${d.features.longitude}`],
                [tr("Elevation (approximate demo value)", "உயரம் (தோராய டெமோ மதிப்பு)"), `${d.features.elevationM} m`],
                [tr("Regional cell mean elevation", "பிராந்திய சராசரி உயரம்"), `${d.features.blockReferenceElevationM} m`],
                [tr("Elevation difference", "உய்ர வேறுபாடு"), `${sign(d.features.elevationDeltaM)} m`],
                [tr("Distance to coast (computed)", "கடற்கரை தூரம் (கணக்கிடப்பட்டது)"), `${d.features.coastDistanceKm} km`],
                [tr("Coastal influence (0–1)", "கடல் தாக்கம் (0–1)"), `${d.features.coastalInfluence}`],
                [tr("Nearby water body", "அருகிலுள்ள நீர்நிலை"), d.features.nearWaterBody ? tr("Yes", "ஆம்") : tr("No", "இல்லை")],
              ].map(([k, v]) => (<tr key={k} className="border-t border-agri-light first:border-0"><td className="py-1.5 pr-4 text-gray-600">{k}</td><td className="font-semibold">{v}</td></tr>))}
            </tbody></table></div>
            <p className="text-xs text-gray-500 mt-2">{d.features.source}</p>
          </section>

          {/* 4. Block vs Panchayat comparison */}
          <section className="bg-white border border-agri-light rounded-xl p-4">
            <h2 className="font-serif font-bold text-agri-forest mb-1">{tr("Block vs Panchayat comparison", "வட்டம் vs ஊராட்சி ஒப்பீடு")} — {d.panchayat.block}</h2>
            <p className="text-xs text-gray-500 mb-3">{tr("The block-level regional forecast gives one number for the whole block. Downscaling shows how Panchayats inside it differ.", "வட்ட அளவிலான முன்னறிவிப்பு முழு வட்டத்திற்கும் ஒரே எண்ணைத் தரும். ஊராட்சிகள் எவ்வாறு வேறுபடுகின்றன என்பதை நுண்ணறிவு காட்டும்.")}</p>
            <div className="h-56" role="img" aria-label="Block versus Panchayat rainfall comparison">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={cmp}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E7F0E4" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} /><YAxis tick={{ fontSize: 12 }} unit=" mm" /><Tooltip />
                  <Legend />
                  <ReferenceLine y={inf.regional.rainfallMm} stroke="#8B5E34" strokeDasharray="5 4" label={{ value: tr("Regional", "பிராந்திய"), fontSize: 11, fill: "#8B5E34" }} />
                  <Bar dataKey="rain" name={tr("Panchayat expected rain (mm)", "ஊராட்சி எதிர்பார்ப்பு மழை (மிமீ)")}>
                    {cmp.map((c: any) => <Cell key={c.id} fill={c.id === d.panchayat._id ? "#1F5F3F" : "#7FB08F"} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="overflow-x-auto mt-3">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-500"><tr><th className="py-1 pr-3">{t("common.panchayat")}</th><th className="pr-3">{tr("Elev.", "உயரம்")}</th><th className="pr-3">{tr("Coast", "கடற்கரை")}</th><th className="pr-3">°C</th><th className="pr-3">{tr("Rain %", "மழை %")}</th><th className="pr-3">mm</th><th>{tr("vs regional (mm)", "பிராந்திய வேறுபாடு (மிமீ)")}</th></tr></thead>
                <tbody>{d.blockComparison.map((b: any) => (
                  <tr key={b.panchayatId} className={`border-t border-agri-light ${b.panchayatId === d.panchayat._id ? "bg-agri-light/60 font-semibold" : ""}`}>
                    <td className="py-1.5 pr-3">{b.name}</td><td className="pr-3">{b.elevationM} m</td><td className="pr-3">{b.coastDistanceKm} km</td><td className="pr-3">{b.local.temperatureC}</td><td className="pr-3">{b.local.rainProbabilityPct}</td><td className="pr-3">{b.local.expectedRainfallMinMm}–{b.local.expectedRainfallMaxMm}</td><td>{sign(b.difference.rainfallMm)}</td>
                  </tr>))}
                </tbody>
              </table>
              <p className="text-xs text-gray-500 mt-2">{tr("Regional block forecast", "பிராந்திய வட்ட முன்னறிவிப்பு")}: {inf.regional.tempC} °C, {inf.regional.rainProbabilityPct}% , {inf.regional.rainfallMm} mm.</p>
            </div>
          </section>

          {/* 5. Validation */}
          <section className="bg-white border border-agri-light rounded-xl p-4">
            <div className="flex items-center justify-between gap-2 mb-2">
              <h2 className="font-serif font-bold text-agri-forest">{tr("Downscaling validation", "நுண்ணறிவு சரிபார்ப்பு")}</h2>
              <DataQualityBadge source={ver?.source === "DEMO" ? "DEMO" : "CACHED"} />
            </div>
            {!ver?.metrics ? <p className="text-sm text-gray-600">{ver?.message || t("ui.noneYet")}</p> : (
              <>
                <p className="text-xs text-gray-500 mb-2">{tr("Comparison over", "ஒப்பீடு")} {ver.metrics.sampleSize} {tr("paired values in this block: regional baseline (no downscaling) vs downscaled Panchayat estimate, each against the observed Panchayat value.", "இணை மதிப்புகள்: பிராந்திய அடிப்படை (நுண்ணறிவு இல்லாமல்) vs நுண்ணறிவு மதிப்பீடு.")}</p>
                <div className="overflow-x-auto"><table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-500"><tr><th className="py-1 pr-3"></th><th className="pr-3">MAE</th><th className="pr-3">RMSE</th><th>Bias</th></tr></thead>
                  <tbody>
                    {([["rainfall", "mm"], ["temperature", "°C"]] as const).flatMap(([k, u]) => ([
                      ["baseline", ver.metrics[k].regionalBaseline], ["down", ver.metrics[k].downscaled],
                    ] as const).map(([w, m]: any) => (
                      <tr key={k + w} className="border-t border-agri-light"><td className="py-1.5 pr-3">{k === "rainfall" ? tr("Rainfall", "மழை") : tr("Temperature", "வெப்பநிலை")} — {w === "baseline" ? tr("regional baseline", "பிராந்திய அடிப்படை") : tr("downscaled", "நுண்ணறிவு")}</td><td className="pr-3">{m.mae} {u}</td><td className="pr-3">{m.rmse} {u}</td><td>{m.bias} {u}</td></tr>
                    )))}
                  </tbody>
                </table></div>
                <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded p-2 mt-3">{ver.note}</p>
              </>
            )}
          </section>
        </>
      )}
    </div>
  );
}
