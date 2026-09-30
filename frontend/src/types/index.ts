export type Role = "FARMER" | "OFFICER";

export interface User {
  id: string;
  name: string;
  phone: string;
  role: Role;
  district?: string;
  block?: string;
  panchayat?: string | Panchayat | null;
  crop?: string;
  cropStage?: string;
  isDemoAccount?: boolean;
}

export interface Panchayat {
  _id: string;
  name: string;
  block: string;
  district: string;
  lat: number;
  lng: number;
  dominantCrop: string;
  riskLevel: "NORMAL" | "CAUTION" | "HIGH_RISK";
}

export interface WeatherObservation {
  _id: string;
  panchayat: string;
  observedAt: string;
  temperatureC: number;
  humidityPct: number;
  windKmh: number;
  rainfallMm: number;
  cloudCoverPct: number;
  source: "LIVE" | "CACHED" | "DEMO";
}

export interface WeatherForecast {
  _id: string;
  panchayat: string;
  forDate: string;
  rainProbabilityPct: number;
  expectedRainfallMinMm: number;
  expectedRainfallMaxMm: number;
  temperatureMinC: number;
  temperatureMaxC: number;
  humidityPct: number;
  windKmh: number;
  cloudCoverPct: number;
  source: "LIVE" | "CACHED" | "DEMO";
  downscalingFeatureImportance: Record<string, number>;
}

export interface CropProfile {
  _id: string;
  name: string;
  stages: string[];
  growingConditions: string;
  weatherSensitivity: string;
  riskFactors: string[];
  advisoryByStage: Record<string, string>;
}

export type Activity =
  | "SOWING"
  | "IRRIGATION"
  | "SPRAYING"
  | "FERTILIZER_APPLICATION"
  | "HARVESTING"
  | "DRYING";

export interface DecisionResult {
  status: "SUITABLE" | "USE_CAUTION" | "NOT_RECOMMENDED" | "INSUFFICIENT_DATA";
  reason: string;
  factors: string[];
  dataQuality: string;
  recommendationType: string;
}

export interface CropRiskResult {
  riskType: string;
  riskLevel: "LOW" | "MODERATE" | "HIGH" | "INSUFFICIENT_DATA";
  reason: string;
  monitoringAdvice: string;
  dataQuality: string;
  affectedCropStage?: string;
  allRisks?: any[];
}

export interface Alert {
  _id: string;
  panchayat: Panchayat;
  alertType: string;
  severity: "LOW" | "MODERATE" | "HIGH";
  startTime: string;
  expectedDurationHours: number;
  recommendedAttention: string;
}
