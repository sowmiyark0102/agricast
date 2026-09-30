import { Link } from "react-router-dom";
import AgriCastLogo from "./AgriCastLogo";
import { useLanguage } from "../context/LanguageContext";

export default function GovernmentFooter() {
  const { t } = useLanguage();
  return (
    <footer className="bg-agri-forest text-agri-light mt-16">
      <div className="max-w-7xl mx-auto px-4 py-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <AgriCastLogo size={40} variant="full" className="text-white" />
          <p className="mt-3 text-sm text-agri-light/80">{t("appTagline")}</p>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white mb-3">Useful Links</h3>
          <ul className="space-y-2 text-sm text-agri-light/80">
            <li><Link to="/about">Accessibility</Link></li>
            <li><Link to="/data-sources">Data Sources</Link></li>
            <li><Link to="/about">Privacy</Link></li>
            <li><Link to="/about">Terms</Link></li>
            <li><Link to="/about">Help</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white mb-3">Platform</h3>
          <ul className="space-y-2 text-sm text-agri-light/80">
            <li><Link to="/verification">Forecast Verification</Link></li>
            <li><Link to="/farmer/login">Farmer Login</Link></li>
            <li><Link to="/officer/login">Officer Login</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white mb-3">{t("prototypeNotice")}</h3>
          <p className="text-sm text-agri-light/80">
            AgriCast AI is a Smart India Hackathon prototype and is not an official Government of India or
            Government of Tamil Nadu website.
          </p>
        </div>
      </div>
    </footer>
  );
}
