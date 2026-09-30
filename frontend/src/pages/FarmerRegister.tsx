import { useState, FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { UserPlus } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { friendlyErrorMessage } from "../services/api";
import ErrorState from "../components/ErrorState";
import AgriCastLogo from "../components/AgriCastLogo";

export default function FarmerRegister() {
  const { register } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [district, setDistrict] = useState("Tiruvallur");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault(); setSubmitting(true); setError(null);
    try { await register({ name, phone, password, district }); navigate("/farmer/dashboard"); }
    catch (err) { setError(friendlyErrorMessage(err)); } finally { setSubmitting(false); }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-10">
      <div className="text-center mb-6"><AgriCastLogo size={64} className="flex-col !gap-2 mx-auto" /><h1 className="text-xl font-serif font-bold text-agri-forest mt-2">{t("ui.createAccount")}</h1></div>
      <form onSubmit={submit} className="bg-white border border-agri-light rounded-xl shadow-sm p-6 space-y-4">
        <label className="block"><span className="block text-sm font-medium text-gray-700 mb-1">{t("ui.fullName")}</span><input className="w-full border border-agri-green/40 rounded-lg px-3 py-2.5 min-h-[44px]" value={name} onChange={(e) => setName(e.target.value)} required maxLength={80} /></label>
        <label className="block"><span className="block text-sm font-medium text-gray-700 mb-1">{t("ui.mobile")}</span><input className="w-full border border-agri-green/40 rounded-lg px-3 py-2.5 min-h-[44px]" value={phone} onChange={(e) => setPhone(e.target.value)} required inputMode="tel" /></label>
        <label className="block"><span className="block text-sm font-medium text-gray-700 mb-1">{t("common.password")} (min 8)</span><input type="password" className="w-full border border-agri-green/40 rounded-lg px-3 py-2.5 min-h-[44px]" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} /></label>
        <label className="block"><span className="block text-sm font-medium text-gray-700 mb-1">{t("common.district")}</span><input className="w-full border border-agri-green/40 rounded-lg px-3 py-2.5 min-h-[44px]" value={district} onChange={(e) => setDistrict(e.target.value)} /></label>
        {error && <ErrorState message={error} />}
        <button type="submit" disabled={submitting} className="w-full py-2.5 rounded-full bg-agri-green text-white font-semibold flex items-center justify-center gap-2 min-h-[44px] disabled:opacity-60"><UserPlus size={18} aria-hidden="true" />{submitting ? t("common.loading") : t("ui.createAccount")}</button>
      </form>
      <p className="text-sm text-center text-gray-600 mt-4"><Link to="/farmer/login" className="text-agri-green font-semibold">{t("nav.farmerLogin")}</Link></p>
    </div>
  );
}
