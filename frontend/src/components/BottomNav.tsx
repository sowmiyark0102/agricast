import { useState } from "react";
import { NavLink, Link, useLocation } from "react-router-dom";
import { Home, Cloud, Leaf, Map as MapIcon, MoreHorizontal, X } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";

/** Mobile bottom navigation (Home, Weather, Advisory, Map, More) like a phone app. */
export default function BottomNav() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const loc = useLocation();
  const [more, setMore] = useState(false);
  if (loc.pathname.includes("/login")) return null;
  const home = user ? (user.role === "FARMER" ? "/farmer/dashboard" : "/officer/dashboard") : "/";
  const cls = ({ isActive }: { isActive: boolean }) => `flex flex-col items-center gap-0.5 py-2 text-[11px] flex-1 ${isActive ? "text-agri-green font-bold border-t-2 border-agri-green" : "text-gray-600 border-t-2 border-transparent"}`;
  const moreLinks = [
    ["/farm-activity", t("nav.farmActivity")], ["/alerts", t("nav.alerts")], ["/voiceline", t("nav.voiceline")], ["/ai-downscaling", t("ui.cardDownscaling")],
    ["/farmer/photo-risk", t("ui.cardPhoto")], ["/farmer/risk-saved", t("ui.cardRisk")], ["/farmer/profile", t("nav.records")], ["/verification", t("nav.verification")],
    ["/data-sources", t("nav.dataSources")], ["/about", t("nav.about")],
  ];
  return (
    <>
      {more && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/40" onClick={() => setMore(false)}>
          <div className="absolute bottom-0 inset-x-0 bg-white rounded-t-2xl p-4 max-h-[75vh] overflow-y-auto" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="More">
            <div className="flex justify-between items-center mb-2">
              <h2 className="font-serif font-bold text-agri-forest">More</h2>
              <button onClick={() => setMore(false)} aria-label="Close" className="p-2"><X size={20} /></button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {moreLinks.map(([to, label]) => (
                <Link key={to} to={to} onClick={() => setMore(false)} className="border border-agri-light rounded-lg px-3 py-3 text-sm font-medium text-agri-forest hover:bg-agri-light/50">{label}</Link>
              ))}
            </div>
          </div>
        </div>
      )}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-agri-light flex" aria-label="Bottom">
        <NavLink to={home} end className={cls}><Home size={22} aria-hidden="true" />{t("nav.home")}</NavLink>
        <NavLink to="/weather" className={cls}><Cloud size={22} aria-hidden="true" />{t("nav.weather")}</NavLink>
        <NavLink to="/advisory" className={cls}><Leaf size={22} aria-hidden="true" />{t("nav.advisory").replace("Crop ", "")}</NavLink>
        <NavLink to="/map" className={cls}><MapIcon size={22} aria-hidden="true" />{t("nav.map").replace("Panchayat ", "")}</NavLink>
        <button onClick={() => setMore(true)} className="flex flex-col items-center gap-0.5 py-2 text-[11px] flex-1 text-gray-600 border-t-2 border-transparent"><MoreHorizontal size={22} aria-hidden="true" />More</button>
      </nav>
    </>
  );
}
