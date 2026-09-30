import { AlertTriangle } from "lucide-react";
import { Alert } from "../types";
import RiskBadge from "./RiskBadge";

const ALERT_LABELS: Record<string, string> = {
  HEAVY_RAIN: "Heavy Rain",
  EXTREME_HEAT: "Extreme Heat",
  STRONG_WIND: "Strong Wind",
  FLOOD_RISK: "Flood Risk",
  DROUGHT_RISK: "Drought Risk",
};

export default function AlertCard({ alert }: { alert: Alert }) {
  return (
    <div className="border border-amber-200 bg-amber-50 rounded-lg p-4 flex items-start gap-3">
      <AlertTriangle className="text-amber-600 shrink-0 mt-0.5" size={20} aria-hidden="true" />
      <div className="flex-1">
        <div className="flex items-center justify-between gap-2">
          <h4 className="font-semibold text-agri-forest">
            {ALERT_LABELS[alert.alertType] || alert.alertType} — {alert.panchayat?.name}
          </h4>
          <RiskBadge level={alert.severity} />
        </div>
        <p className="text-sm text-gray-700 mt-1">{alert.recommendedAttention}</p>
        <p className="text-xs text-gray-500 mt-1">
          Starts {new Date(alert.startTime).toLocaleString()} · expected {alert.expectedDurationHours}h
        </p>
      </div>
    </div>
  );
}
