import { useLanguage } from "../context/LanguageContext";
export default function LanguageSwitcher() {
  const { lang, setLang } = useLanguage();
  return (
    <div className="flex items-center text-xs" role="group" aria-label="Language switcher">
      <button onClick={() => setLang("ta")} className={`px-2 py-0.5 rounded-l border border-white/40 ${lang === "ta" ? "bg-white text-agri-forest font-semibold" : "text-white"}`} aria-pressed={lang === "ta"}>தமிழ்</button>
      <button onClick={() => setLang("en")} className={`px-2 py-0.5 rounded-r border border-l-0 border-white/40 ${lang === "en" ? "bg-white text-agri-forest font-semibold" : "text-white"}`} aria-pressed={lang === "en"}>English</button>
    </div>
  );
}
