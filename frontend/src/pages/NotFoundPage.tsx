import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
export default function NotFoundPage() {
  const { lang } = useLanguage();
  return (
    <div className="max-w-md mx-auto px-4 py-24 text-center">
      <h1 className="text-3xl font-serif font-bold text-agri-forest mb-2">{lang === "ta" ? "பக்கம் கிடைக்கவில்லை" : "Page not found"}</h1>
      <p className="text-sm text-gray-600 mb-6">{lang === "ta" ? "நீங்கள் தேடும் பக்கம் இல்லை." : "The page you're looking for doesn't exist."}</p>
      <Link to="/" className="px-4 py-2.5 rounded-full bg-agri-green text-white font-semibold">{lang === "ta" ? "முகப்புக்கு செல்" : "Back to Home"}</Link>
    </div>
  );
}
