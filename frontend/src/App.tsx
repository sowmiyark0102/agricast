import { Routes, Route } from "react-router-dom";
import GovernmentHeader from "./components/GovernmentHeader";
import GovernmentFooter from "./components/GovernmentFooter";
import BottomNav from "./components/BottomNav";
import ProtectedRoute from "./components/ProtectedRoute";
import { FarmSelectionProvider } from "./context/FarmSelectionContext";

import Home from "./pages/Home";
import FarmerLogin from "./pages/FarmerLogin";
import OfficerLogin from "./pages/OfficerLogin";
import FarmerRegister from "./pages/FarmerRegister";
import FarmerDashboard from "./pages/FarmerDashboard";
import FarmerProfilePage from "./pages/FarmerProfilePage";
import OfficerDashboard from "./pages/OfficerDashboard";
import OfficerFarmerReportsPage from "./pages/OfficerFarmerReportsPage";
import OfficerManagePage from "./pages/OfficerManagePage";
import WeatherPage from "./pages/WeatherPage";
import PanchayatMapPage from "./pages/PanchayatMapPage";
import AIDownscalingPage from "./pages/AIDownscalingPage";
import CropAdvisoryPage from "./pages/CropAdvisoryPage";
import FarmActivityPage from "./pages/FarmActivityPage";
import AlertsPage from "./pages/AlertsPage";
import VoiceLinePage from "./pages/VoiceLinePage";
import PhotoRiskCheckPage from "./pages/PhotoRiskCheckPage";
import RiskSavedPage from "./pages/RiskSavedPage";
import ForecastVerificationPage from "./pages/ForecastVerificationPage";
import AboutPage from "./pages/AboutPage";
import DataSourcesPage from "./pages/DataSourcesPage";
import NotFoundPage from "./pages/NotFoundPage";

export default function App() {
  return (
    <FarmSelectionProvider>
      <div className="min-h-screen flex flex-col">
        <GovernmentHeader />
        <main className="flex-1 pb-16 lg:pb-0">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/weather" element={<WeatherPage />} />
            <Route path="/map" element={<PanchayatMapPage />} />
            <Route path="/ai-downscaling" element={<AIDownscalingPage />} />
            <Route path="/advisory" element={<CropAdvisoryPage />} />
            <Route path="/farm-activity" element={<FarmActivityPage />} />
            <Route path="/alerts" element={<AlertsPage />} />
            <Route path="/voiceline" element={<VoiceLinePage />} />
            <Route path="/verification" element={<ForecastVerificationPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/data-sources" element={<DataSourcesPage />} />

            <Route path="/farmer/login" element={<FarmerLogin />} />
            <Route path="/farmer/register" element={<FarmerRegister />} />
            <Route path="/officer/login" element={<OfficerLogin />} />

            <Route path="/farmer/dashboard" element={<ProtectedRoute role="FARMER"><FarmerDashboard /></ProtectedRoute>} />
            <Route path="/farmer/photo-risk" element={<ProtectedRoute role="FARMER"><PhotoRiskCheckPage /></ProtectedRoute>} />
            <Route path="/farmer/risk-saved" element={<ProtectedRoute role="FARMER"><RiskSavedPage /></ProtectedRoute>} />
            <Route path="/farmer/profile" element={<ProtectedRoute role="FARMER"><FarmerProfilePage /></ProtectedRoute>} />

            <Route path="/officer/dashboard" element={<ProtectedRoute role="OFFICER"><OfficerDashboard /></ProtectedRoute>} />
            <Route path="/officer/farmer-reports" element={<ProtectedRoute role="OFFICER"><OfficerFarmerReportsPage /></ProtectedRoute>} />
            <Route path="/officer/manage" element={<ProtectedRoute role="OFFICER"><OfficerManagePage /></ProtectedRoute>} />

            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
        <GovernmentFooter />
        <BottomNav />
      </div>
    </FarmSelectionProvider>
  );
}
