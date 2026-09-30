import type { ReactNode } from "react";
import { useLanguage } from "../context/LanguageContext";

export default function AboutPage() {
  const { lang, t } = useLanguage();
  const S = (en: string, ta: string) => (lang === "ta" ? ta : en);
  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-10">
      <h1 className="text-2xl font-serif font-bold text-agri-forest mb-1">{S("About AgriCast AI", "அக்ரிகாஸ்ட் AI பற்றி")}</h1>
      <p className="text-sm text-gray-600 mb-8">{t("prototypeNotice")} · {S("Problem Statement SIH26074", "பிரச்சனை அறிக்கை SIH26074")}</p>

      <Section title={S("Problem", "பிரச்சனை")}>{S("Weather advisories are usually issued at a district or block level. That resolution is often too coarse for farmers, whose decisions — when to sow, spray, irrigate or harvest — depend on very local conditions.", "வானிலை ஆலோசனைகள் பொதுவாக மாவட்ட அல்லது வட்ட அளவில் வழங்கப்படுகின்றன. இது விவசாயிகளுக்கு பெரும்பாலும் மிகவும் பொதுவானது.")}</Section>
      <Section title={S("Solution", "தீர்வு")}>{S("AgriCast AI takes regional weather and downscales it to a Panchayat-level estimate using documented geographic rules (elevation, distance to coast, nearby water), then converts that estimate into plain-language farm decisions, crop-stage risk, and an economic-impact estimate — accessible even to farmers without a smartphone.", "அக்ரிகாஸ்ட் AI பிராந்திய வானிலையை ஊராட்சி அளவிலான மதிப்பீடாக மாற்றி, அதை பண்ணை முடிவுகள், பயிர் ஆபத்து, பொருளாதார தாக்க மதிப்பீடாக மாற்றுகிறது.")}</Section>
      <Section title={S("Weather Downscaling", "வானிலை நுண்ணறிவு")}>{S("A transparent rule-based method (see the AI Downscaling page) adjusts a regional forecast using elevation, coastal distance and nearby water bodies. Every adjustment is shown with its exact numeric contribution. This is a documented rule set, not a trained machine-learning model, and no real-world accuracy is claimed.", "AI நுண்ணறிவு பக்கத்தில் விவரிக்கப்பட்ட வெளிப்படையான விதி அடிப்படையிலான முறை. இது பயிற்சி பெற்ற மாதிரி அல்ல.")}</Section>
      <Section title={S("Panchayat Intelligence", "ஊராட்சி நுண்ணறிவு")}>{S("Weather observations and forecasts are stored per Panchayat and shown on an interactive map with rainfall, temperature and risk layers.", "வானிலை கண்காணிப்புகள் மற்றும் முன்னறிவிப்புகள் ஒவ்வொரு ஊராட்சிக்கும் சேமிக்கப்பட்டு ஊடாடும் வரைபடத்தில் காட்டப்படுகின்றன.")}</Section>
      <Section title={S("Crop Decision Support", "பயிர் முடிவு ஆதரவு")}>{S("Should I Farm Today?, the Farm Activity Window, and the Crop Risk Engine all use the same centralized, transparent decision logic — never a fabricated confidence score.", "இன்று விவசாயம் செய்யலாமா?, பண்ணை செயல்பாடு நேரம், மற்றும் பயிர் ஆபத்து பொறி ஆகியவை ஒரே வெளிப்படையான தர்க்கத்தைப் பயன்படுத்துகின்றன.")}</Section>
      <Section title={S("Farmer Accessibility", "விவசாயி அணுகல்")}>{S("AgriCast VoiceLine simulates a keypad-phone IVR menu in Tamil and English, with browser speech playback where supported. An SMS prototype responds to WEATHER, RAIN, ADVISORY, ALERT and FARM keywords.", "அக்ரிகாஸ்ட் வாய்ஸ்லைன் தமிழ் மற்றும் ஆங்கிலத்தில் ஒரு கீபேட் தொலைபேசி IVR மெனுவை உருவகப்படுத்துகிறது.")}</Section>
      <Section title={S("AI Explainability", "AI விளக்கம்")}>{S("Every major prediction includes a \"Why this prediction?\" panel listing the exact factors used, with rule-based logic clearly labelled as such.", "ஒவ்வொரு முக்கிய கணிப்பிலும் \"இந்த கணிப்பு ஏன்?\" பலகை உள்ளது.")}</Section>
      <Section title={S("Economic Risk Estimation", "பொருளாதார ஆபத்து மதிப்பீடு")}>{S("The ₹ Risk Saved calculator connects a weather-informed decision to a transparent, assumption-based estimate of avoidable loss. It is never presented as a guarantee.", "₹ ஆபத்து தவிர்ப்பு கணிப்பான் வானிலை அறிந்த முடிவை வெளிப்படையான மதிப்பீட்டுடன் இணைக்கிறது.")}</Section>
      <Section title={S("Officer Monitoring", "அதிகாரி கண்காணிப்பு")}>{S("Agriculture officers review farmer photo-risk submissions, monitor affected Panchayats, manage alerts, and adjust Panchayat risk status — with every officer action creating an audit record.", "வேளாண் அதிகாரிகள் விவசாயி சமர்ப்பிப்புகளை மதிப்பாய்வு செய்து, எச்சரிக்கைகளை நிர்வகிக்கின்றனர்.")}</Section>

      <p className="text-xs text-gray-500 mt-10 border-t border-agri-light pt-4">{S("AgriCast AI is a Smart India Hackathon prototype and is not an official Government of India or Government of Tamil Nadu website.", "அக்ரிகாஸ்ட் AI ஒரு Smart India Hackathon முன்மாதிரி; இது அதிகாரப்பூர்வ அரசு தளம் அல்ல.")}</p>
    </div>
  );
}
function Section({ title, children }: { title: string; children: ReactNode }) { return <div className="mb-6"><h2 className="font-serif font-semibold text-lg text-agri-forest mb-1.5">{title}</h2><p className="text-sm text-gray-700 leading-relaxed">{children}</p></div>; }
