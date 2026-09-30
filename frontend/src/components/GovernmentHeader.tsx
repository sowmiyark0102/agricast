import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Menu, X, Bell } from "lucide-react";
import AgriCastLogo from "./AgriCastLogo";
import LanguageSwitcher from "./LanguageSwitcher";
import FontSizeControl from "./FontSizeControl";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import { useFarmSelection } from "../context/FarmSelectionContext";
import { api } from "../services/api";

export default function GovernmentHeader() {
  const { t } = useLanguage();
  const { user, logout } = useAuth();
  const { panchayat } = useFarmSelection();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [alertCount, setAlertCount] = useState(0);

  useEffect(() => {
    api.get("/alerts", { params: panchayat ? { panchayatId: panchayat._id } : {} })
      .then((r) => setAlertCount(r.data.alerts.length))
      .catch(() => setAlertCount(0));
  }, [panchayat]);

  const home = user ? (user.role === "FARMER" ? "/farmer/dashboard" : "/officer/dashboard") : "/";
  const items = [
    { to: home, label: user ? t("nav.dashboard") : t("nav.home") },
    { to: "/weather", label: t("nav.weather") },
    { to: "/map", label: t("nav.map") },
    { to: "/ai-downscaling", label: t("ui.cardDownscaling") },
    { to: "/advisory", label: t("nav.advisory") },
    { to: "/farm-activity", label: t("nav.farmActivity") },
    { to: "/alerts", label: t("nav.alerts") },
    { to: "/voiceline", label: t("nav.voiceline") },
    { to: "/about", label: t("nav.about") },
  ];
  const linkCls = ({ isActive }: { isActive: boolean }) => `hover:text-agri-green ${isActive ? "text-agri-green font-semibold" : ""}`;

  const doLogout = () => { logout(); setOpen(false); navigate("/"); };

  return (
    <header className="sticky top-0 z-40 shadow-sm">
      <div className="bg-agri-forest text-white text-xs">
        <div className="max-w-7xl mx-auto px-3 py-1.5 flex items-center justify-between gap-3">
          <span className="hidden md:inline truncate">{t("govBar")}</span>
          <div className="flex items-center gap-3 ml-auto">
            <FontSizeControl />
            <LanguageSwitcher />
          </div>
        </div>
      </div>

      <div className="bg-white border-b border-agri-light">
        <div className="max-w-7xl mx-auto px-3 py-2 flex items-center justify-between gap-3">
          <Link to={home} className="flex items-center gap-2 min-w-0" aria-label="AgriCast AI home">
            <AgriCastLogo size={44} />
            <span className="leading-tight min-w-0">
              <span className="block font-serif font-bold text-agri-forest text-lg">AGRICAST <span className="text-agri-green">AI</span></span>
              <span className="block text-[10px] sm:text-xs tracking-wide text-gray-600 uppercase truncate">Panchayat-Level Weather Intelligence</span>
            </span>
          </Link>

          <nav className="hidden xl:flex items-center gap-4 text-sm font-medium text-gray-700" aria-label="Main">
            {items.map((i) => <NavLink key={i.to + i.label} to={i.to} end className={linkCls}>{i.label}</NavLink>)}
          </nav>

          <div className="flex items-center gap-2">
            <Link to="/alerts" className="relative p-2 text-agri-forest" aria-label={`${t("nav.alerts")}: ${alertCount}`}>
              <Bell size={22} aria-hidden="true" />
              {alertCount > 0 && <span className="absolute top-0 right-0 min-w-[18px] h-[18px] text-[11px] leading-[18px] text-center rounded-full bg-red-600 text-white font-bold">{alertCount}</span>}
            </Link>
            <div className="hidden xl:flex items-center gap-2">
              {user ? (
                <button onClick={doLogout} className="px-3 py-1.5 text-sm rounded border border-agri-green text-agri-green hover:bg-agri-light">{t("nav.logout")}</button>
              ) : (
                <>
                  <Link to="/farmer/login" className="px-3 py-1.5 text-sm rounded bg-agri-green text-white hover:bg-agri-forest">{t("nav.farmerLogin")}</Link>
                  <Link to="/officer/login" className="px-3 py-1.5 text-sm rounded border border-agri-green text-agri-green hover:bg-agri-light">{t("nav.officerLogin")}</Link>
                </>
              )}
            </div>
            <button className="xl:hidden p-2 text-agri-forest" aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} onClick={() => setOpen(!open)}>
              {open ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        {open && (
          <nav className="xl:hidden border-t border-agri-light px-4 py-3 flex flex-col gap-1 text-sm font-medium text-gray-700 bg-white" aria-label="Mobile">
            {items.map((i) => <NavLink key={i.to + i.label} to={i.to} end onClick={() => setOpen(false)} className={({ isActive }) => `py-2.5 ${isActive ? "text-agri-green font-semibold" : ""}`}>{i.label}</NavLink>)}
            <div className="pt-2 mt-1 border-t border-agri-light flex flex-col gap-1">
              {user ? (
                <button onClick={doLogout} className="text-left py-2.5 text-agri-green font-semibold">{t("nav.logout")}</button>
              ) : (
                <>
                  <Link to="/farmer/login" onClick={() => setOpen(false)} className="py-2.5 text-agri-green font-semibold">{t("nav.farmerLogin")}</Link>
                  <Link to="/officer/login" onClick={() => setOpen(false)} className="py-2.5 text-agri-green font-semibold">{t("nav.officerLogin")}</Link>
                </>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
