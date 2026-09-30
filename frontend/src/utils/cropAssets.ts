export type Lang = "en" | "ta";

export const CROP_IMAGES: Record<string, string> = {
  Paddy: "/images/rice-field-wide.jpg",
  Groundnut: "/images/groundnut-pods.jpg",
  Maize: "/images/maize-cobs.jpg",
  Tomato: "/images/tomato-plants.jpg",
  Banana: "/images/banana-bunches.jpg",
  Sugarcane: "/images/sugarcane.svg",
};

export const CROP_TA: Record<string, string> = { Paddy: "நெல்", Groundnut: "நிலக்கடலை", Maize: "மக்காச்சோளம்", Tomato: "தக்காளி", Banana: "வாழை", Sugarcane: "கரும்பு" };
export const STAGE_TA: Record<string, string> = { Seedling: "நாற்று நிலை", Vegetative: "வளர்ச்சி நிலை", Flowering: "பூக்கும் நிலை", Fruiting: "காய்/கதிர் நிலை", Harvest: "அறுவடை" };
export const ACTIVITY_LABELS: Record<string, { en: string; ta: string }> = {
  SOWING: { en: "Sowing", ta: "விதைப்பு" },
  IRRIGATION: { en: "Irrigation", ta: "நீர்ப்பாசனம்" },
  SPRAYING: { en: "Spraying", ta: "மருந்து தெளித்தல்" },
  FERTILIZER_APPLICATION: { en: "Fertilizer Application", ta: "உரமிடுதல்" },
  HARVESTING: { en: "Harvesting", ta: "அறுவடை" },
  DRYING: { en: "Drying", ta: "உலர்த்துதல்" },
};
export const RISK_TYPE_LABELS: Record<string, { en: string; ta: string }> = {
  HEAVY_RAIN: { en: "Heavy rain", ta: "அதிக மழை" },
  WATERLOGGING: { en: "Waterlogging", ta: "நீர் தேக்கம்" },
  DROUGHT: { en: "Dry conditions", ta: "வறட்சி" },
  HEAT_STRESS: { en: "Heat stress", ta: "வெப்ப அழுத்தம்" },
  STRONG_WIND: { en: "Strong wind", ta: "பலத்த காற்று" },
  DISEASE_FAVOURABLE_WEATHER: { en: "Weather favourable for fungal disease", ta: "பூஞ்சை நோய்க்கு சாதகமான வானிலை" },
  NONE: { en: "No elevated risk", ta: "அதிக ஆபத்து இல்லை" },
  UNKNOWN: { en: "Unknown", ta: "தெரியவில்லை" },
};
export const STATUS_LABELS: Record<string, { en: string; ta: string }> = {
  SUITABLE: { en: "Suitable", ta: "ஏற்றது" },
  USE_CAUTION: { en: "Use Caution", ta: "எச்சரிக்கையுடன்" },
  NOT_RECOMMENDED: { en: "Not Recommended", ta: "பரிந்துரைக்கப்படவில்லை" },
  INSUFFICIENT_DATA: { en: "Insufficient Data", ta: "போதிய தகவல் இல்லை" },
  HIGHER_RAIN_RISK: { en: "Higher Rain Risk", ta: "மழை அபாயம் அதிகம்" },
};
export const RISK_LEVEL_LABELS: Record<string, { en: string; ta: string }> = {
  LOW: { en: "Low", ta: "குறைவு" }, NORMAL: { en: "Normal", ta: "சாதாரணம்" }, MODERATE: { en: "Moderate", ta: "மிதம்" },
  CAUTION: { en: "Caution", ta: "எச்சரிக்கை" }, HIGH: { en: "High", ta: "அதிகம்" }, HIGH_RISK: { en: "High Risk", ta: "அதிக ஆபத்து" },
  INSUFFICIENT_DATA: { en: "Insufficient Data", ta: "போதிய தகவல் இல்லை" },
};
export const ALERT_LABELS: Record<string, { en: string; ta: string }> = {
  HEAVY_RAIN: { en: "Heavy Rain", ta: "அதிக மழை" }, EXTREME_HEAT: { en: "Extreme Heat", ta: "கடும் வெப்பம்" },
  STRONG_WIND: { en: "Strong Wind", ta: "பலத்த காற்று" }, FLOOD_RISK: { en: "Flood Risk", ta: "வெள்ள அபாயம்" }, DROUGHT_RISK: { en: "Drought Risk", ta: "வறட்சி அபாயம்" },
};

export const cropLabel = (name: string, lang: Lang) => (lang === "ta" ? CROP_TA[name] || name : name);
export const stageLabel = (name: string, lang: Lang) => (lang === "ta" ? STAGE_TA[name] || name : name);
export const label = (map: Record<string, { en: string; ta: string }>, key: string, lang: Lang) => (map[key] ? map[key][lang] : key.replace(/_/g, " "));

/** Picture for a crop at a stage, using the supplied field photographs where they clearly match. */
export function stageImage(crop: string, stage: string): { src: string; contain?: boolean } {
  if (crop === "Paddy") return { src: "/images/crop-stages-paddy.jpg" };
  if (crop === "Maize") {
    if (stage === "Seedling") return { src: "/images/maize-seedlings-rows.jpg" };
    if (stage === "Vegetative" || stage === "Flowering") return { src: "/images/maize-field-path.jpg" };
    return { src: "/images/maize-cobs.jpg" };
  }
  if (stage === "Seedling") return { src: "/images/seedling-growth-stages.jpg" };
  if (stage === "Vegetative") return { src: "/images/leafy-crop-stage.jpg" };
  if (stage === "Flowering") return { src: "/images/flowering-stage.jpg" };
  return { src: CROP_IMAGES[crop] || "/images/seedling-growth-stages.jpg" };
}

export const STAGES = ["Seedling", "Vegetative", "Flowering", "Fruiting", "Harvest"];
