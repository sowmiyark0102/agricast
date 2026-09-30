import { useState, FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ShieldCheck, Lock, User2, PhoneCall } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { friendlyErrorMessage } from "../services/api";
import ErrorState from "../components/ErrorState";
import AgriCastLogo from "../components/AgriCastLogo";

export default function OfficerLogin() {
  const { login } = useAuth();
  const { t, lang } = useLanguage();
  const navigate = useNavigate();
  const [phone, setPhone] = useState("9999900002");
  const [password, setPassword] = useState("Demo@12345");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault(); setSubmitting(true); setError(null);
    try {
      const user = await login(phone, password);
      if (user.role !== "OFFICER") { setError(lang === "ta" ? "இது அதிகாரி கணக்கு அல்ல. விவசாயி உள்நுழைவைப் பயன்படுத்தவும்." : "This account is not registered as an officer. Use Farmer Login instead."); return; }
      navigate("/officer/dashboard");
    } catch (err) { setError(friendlyErrorMessage(err)); } finally { setSubmitting(false); }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-10">
      <div className="text-center mb-6">
        <AgriCastLogo size={84} className="flex-col !gap-2 mx-auto" />
        <h1 className="text-2xl font-serif font-bold text-agri-forest mt-2">AGRICAST <span className="text-agri-green">AI</span></h1>
        <p className="text-xs text-gray-600 mt-1">{t("appTagline")}</p>
        <p className="text-sm font-medium text-agri-forest mt-3">{t("mainMessage")}</p>
      </div>
      <div className="bg-white border border-agri-light rounded-xl shadow-sm overflow-hidden">
        <div className="grid grid-cols-2">
          <Link to="/farmer/login" className="flex items-center justify-center gap-2 py-3 text-agri-forest font-semibold text-sm border-r border-agri-light hover:bg-agri-light/40"><User2 size={16} aria-hidden="true" /> {t("nav.farmerLogin")}</Link>
          <div className="flex items-center justify-center gap-2 py-3 bg-agri-forest text-white font-semibold text-sm"><ShieldCheck size={16} aria-hidden="true" /> {t("ui.loginTitleO")}</div>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <label className="block"><span className="block text-sm font-medium text-gray-700 mb-1">{t("ui.mobile")}</span>
            <div className="flex items-center border border-agri-green/40 rounded-lg px-3 py-2 gap-2"><ShieldCheck size={16} className="text-agri-green" aria-hidden="true" /><input className="w-full outline-none min-h-[28px]" value={phone} onChange={(e) => setPhone(e.target.value)} required /></div></label>
          <label className="block"><span className="block text-sm font-medium text-gray-700 mb-1">{t("common.password")}</span>
            <div className="flex items-center border border-agri-green/40 rounded-lg px-3 py-2 gap-2"><Lock size={16} className="text-agri-green" aria-hidden="true" /><input type="password" className="w-full outline-none min-h-[28px]" value={password} onChange={(e) => setPassword(e.target.value)} required /></div></label>
          {error && <ErrorState message={error} />}
          <button type="submit" disabled={submitting} className="w-full py-2.5 rounded-full bg-agri-forest text-white font-semibold hover:bg-agri-green disabled:opacity-60 min-h-[44px]">{submitting ? t("common.loading") : t("common.login")}</button>
          <p className="text-xs text-gray-500 bg-agri-light/60 rounded p-2">{t("ui.demoAccount")} — {t("ui.mobile")} <strong>9999900002</strong>, {t("common.password")} <strong>Demo@12345</strong></p>
        </form>
        <div className="relative h-28">
          <img src="/images/officer-team-field.jpg" alt="" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-agri-forest/70 flex items-center justify-center gap-2 text-white text-xs sm:text-sm font-medium px-4 text-center"><PhoneCall size={16} aria-hidden="true" />{t("ui.needHelp")}</div>
        </div>
      </div>
      <p className="text-xs text-center text-gray-500 mt-4">{t("prototypeNotice")}</p>
    </div>
  );
}
