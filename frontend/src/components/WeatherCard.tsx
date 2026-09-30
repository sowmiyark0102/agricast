import type { ReactNode } from "react";
import { Droplets, Thermometer, Wind, Cloud } from "lucide-react";
import { WeatherObservation, WeatherForecast } from "../types";
import DataQualityBadge from "./DataQualityBadge";
import { useLanguage } from "../context/LanguageContext";

export default function WeatherCard({
  observation,
  forecast,
}: {
  observation?: WeatherObservation | null;
  forecast?: WeatherForecast | null;
}) {
  const { t } = useLanguage();

  if (!observation && !forecast) return null;

  return (
    <div className="border border-agri-light rounded-lg bg-white p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-serif font-bold text-lg text-agri-forest">{t("nav.weather")}</h3>
        <DataQualityBadge source={observation?.source || forecast?.source} />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Stat icon={<Thermometer size={18} />} label={t("common.temperature")} value={observation ? `${observation.temperatureC}°C` : "—"} />
        <Stat icon={<Droplets size={18} />} label={t("common.rainProbability")} value={forecast ? `${forecast.rainProbabilityPct}%` : "—"} />
        <Stat icon={<Cloud size={18} />} label={t("common.humidity")} value={observation ? `${observation.humidityPct}%` : "—"} />
        <Stat icon={<Wind size={18} />} label={t("common.wind")} value={observation ? `${observation.windKmh} km/h` : "—"} />
      </div>

      {forecast && (
        <p className="mt-4 text-sm text-gray-700">
          {t("common.expectedRainfall")}: {forecast.expectedRainfallMinMm}-{forecast.expectedRainfallMaxMm} mm.{" "}
          {forecast.rainProbabilityPct >= 55
            ? "Rain is likely this evening."
            : "Rain is unlikely in the next few hours."}
        </p>
      )}
    </div>
  );
}

function Stat({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-agri-blue mt-0.5">{icon}</span>
      <div>
        <div className="text-xs text-gray-500">{label}</div>
        <div className="font-semibold text-gray-900">{value}</div>
      </div>
    </div>
  );
}
