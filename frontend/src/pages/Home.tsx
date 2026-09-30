import { Link } from "react-router-dom";
import { CloudRain, Brain, MapPin, User2, Phone, IndianRupee, ShieldCheck, Camera, Sprout, Landmark } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { CROP_IMAGES, cropLabel } from "../utils/cropAssets";

const CHAIN_ICONS = [CloudRain, Brain, ShieldCheck, MapPin, User2, IndianRupee, Phone];
const CROPS = ["Paddy", "Groundnut", "Maize", "Tomato", "Banana", "Sugarcane"];

export default function Home() {
  const { t, lang, dict } = useLanguage();
  const steps = dict.home.chainSteps;

  return (
    <div>
      <section className="bg-agri-forest text-white">
        <div className="max-w-7xl mx-auto px-4 py-14 grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <p className="text-agri-light/80 text-sm font-semibold mb-3">{t("prototypeNotice")}</p>
            <h1 className="text-3xl sm:text-4xl font-serif font-bold leading-tight">{t("home.heroTitle")}</h1>
            <p className="mt-4 text-agri-light/90 max-w-lg">{t("home.heroSubtitle")}</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link to="/weather" className="px-5 py-3 rounded-full bg-white text-agri-forest font-semibold hover:bg-agri-light min-h-[44px]">{t("home.ctaWeather")}</Link>
              <Link to="/advisory" className="px-5 py-3 rounded-full border border-white/60 text-white font-semibold hover:bg-white/10 min-h-[44px]">{t("home.ctaAdvisory")}</Link>
            </div>
            <Link to="/voiceline" className="inline-block mt-4 text-sm underline text-agri-light/90">{t("home.ctaVoiceline")}</Link>
          </div>
          <div className="rounded-xl overflow-hidden border border-white/20 shadow-xl">
            <img src="/images/hero-farmer-app.jpg" alt="A farmer in a rice field checking the AgriCast AI weather forecast on a smartphone" className="w-full h-full object-cover" />
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-10 text-center">
        <p className="text-xl font-serif text-agri-forest">{t("mainMessage")}</p>
        <p className="text-sm text-gray-600 mt-1">{t("secondaryMessage")}</p>
      </section>

      <section className="bg-agri-light/60 py-10">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-center font-serif text-2xl text-agri-forest mb-8">{t("home.chainTitle")}</h2>
          <div className="flex flex-wrap justify-center gap-3">
            {steps.map((step: string, i: number) => {
              const Icon = CHAIN_ICONS[i] || CloudRain;
              return (
                <div key={step} className="flex items-center gap-2">
                  <div className="flex flex-col items-center gap-1.5 bg-white border border-agri-green/20 rounded-lg px-4 py-3 min-w-[100px]"><Icon className="text-agri-green" size={20} aria-hidden="true" /><span className="text-xs font-medium text-gray-700 text-center">{step}</span></div>
                  {i < steps.length - 1 && <span className="text-agri-green/50">→</span>}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Crop gallery — every crop links straight to its stage-wise advisory & risk */}
      <section className="max-w-7xl mx-auto px-4 py-14">
        <h2 className="font-serif text-2xl text-agri-forest mb-1">{t("home.cropsTitle")}</h2>
        <p className="text-sm text-gray-600 mb-6">{lang === "ta" ? "ஒவ்வொரு பயிரையும் தட்டி நிலை வாரியான ஆலோசனை மற்றும் வானிலை ஆபத்தைப் பாருங்கள்." : "Tap any crop to see stage-wise advisory and weather risk for it."}</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {CROPS.map((c) => (
            <Link key={c} to={`/advisory?crop=${c}`} className="group rounded-xl overflow-hidden border border-agri-light bg-white hover:border-agri-green hover:shadow-md transition">
              <div className="aspect-square overflow-hidden"><img src={CROP_IMAGES[c]} alt={c} className="w-full h-full object-cover group-hover:scale-105 transition-transform" loading="lazy" /></div>
              <div className="p-2 text-center"><span className="text-sm font-semibold text-agri-forest">{cropLabel(c, lang)}</span></div>
            </Link>
          ))}
        </div>
      </section>

      {/* Feature grid grounded in real work */}
      <section className="bg-agri-light/40 py-14">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="font-serif text-2xl text-agri-forest mb-6">{t("home.featuresTitle")}</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <FeatureCard to="/ai-downscaling" icon={<Brain size={20} />} title={t("ui.cardDownscaling")} body={t("ui.cardDownscalingD")} />
            <FeatureCard to="/farm-activity" icon={<Sprout size={20} />} title={t("ui.cardFarm")} body={t("ui.cardFarmD")} />
            <FeatureCard to="/advisory" icon={<Sprout size={20} />} title={t("ui.cardCrop")} body={t("ui.cardCropD")} />
            <FeatureCard to="/farmer/photo-risk" icon={<Camera size={20} />} title={t("ui.cardPhoto")} body={t("ui.cardPhotoD")} />
            <FeatureCard to="/farmer/risk-saved" icon={<IndianRupee size={20} />} title={t("ui.cardRisk")} body={t("ui.cardRiskD")} />
            <FeatureCard to="/voiceline" icon={<Phone size={20} />} title={t("ui.cardVoice")} body={t("ui.cardVoiceD")} />
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-14 grid md:grid-cols-3 gap-6">
        <ImageCard img="/images/officer-inspection.jpg" title={lang === "ta" ? "அதிகாரி சரிபார்க்கும் புலனறிவு" : "Officer-verified field intelligence"} body={lang === "ta" ? "வேளாண் அதிகாரிகள் விவசாயி சமர்ப்பிப்புகளை மதிப்பாய்வு செய்து பாதிக்கப்பட்ட ஊராட்சிகளை கண்காணிக்கின்றனர்." : "Agriculture officers review farmer submissions and monitor affected Panchayats from one dashboard."} />
        <ImageCard img="/images/fertilizer-spray.jpg" title={lang === "ta" ? "நேரம் வரையறுக்கப்பட்ட பண்ணை செயல்பாடுகள்" : "Timed farm activities"} body={lang === "ta" ? "விதைப்பு, தெளித்தல் மற்றும் உரமிடுதல் நேரங்கள் உள்ளூர் மழை மற்றும் காற்று நிலைமைகளிலிருந்து பரிந்துரைக்கப்படுகின்றன." : "Sowing, spraying and fertilizer application windows are suggested from local rainfall and wind conditions."} />
        <ImageCard img="/images/seedling-growth-stages.jpg" title={lang === "ta" ? "பயிர்-நிலை அறிந்த ஆலோசனைகள்" : "Crop-stage aware advisories"} body={lang === "ta" ? "ஆலோசனைகள் விவசாயி தேர்ந்தெடுத்த பயிர் மற்றும் வளர்ச்சி நிலைக்கு ஏற்ப மாறுகின்றன." : "Advisories adapt to the crop and growth stage the farmer has selected, not a generic weather report."} />
      </section>

      <section className="max-w-7xl mx-auto px-4 pb-14 flex flex-wrap justify-center gap-4">
        <Link to="/farmer/login" className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-agri-green text-white font-semibold min-h-[44px]"><User2 size={18} aria-hidden="true" />{t("nav.farmerLogin")}</Link>
        <Link to="/officer/login" className="inline-flex items-center gap-2 px-5 py-3 rounded-full border border-agri-green text-agri-green font-semibold min-h-[44px]"><Landmark size={18} aria-hidden="true" />{t("nav.officerLogin")}</Link>
      </section>
    </div>
  );
}
function FeatureCard({ to, icon, title, body }: { to: string; icon: React.ReactNode; title: string; body: string }) {
  return <Link to={to} className="bg-white border border-agri-light rounded-xl p-4 flex gap-3 hover:border-agri-green hover:shadow-sm"><span className="text-agri-green mt-0.5">{icon}</span><span><span className="block font-serif font-semibold text-agri-forest">{title}</span><span className="block text-sm text-gray-600 mt-0.5">{body}</span></span></Link>;
}
function ImageCard({ img, title, body }: { img: string; title: string; body: string }) {
  return <div className="border border-agri-light rounded-xl overflow-hidden bg-white"><img src={img} alt="" className="w-full h-40 object-cover" loading="lazy" /><div className="p-4"><h3 className="font-serif font-semibold text-agri-forest">{title}</h3><p className="text-sm text-gray-600 mt-1">{body}</p></div></div>;
}
