import { Routes, Route, Navigate } from "react-router-dom";
import { ToastProvider } from "./components/shared/toast/ToastProvider";
import PrivateRoute from "./components/PrivateRoute";

import AuthPage from "./pages/AuthPage";
import DashboardRoutes from "./pages/dashboard/DashboardRoutes";
import QuizApp from "./QuizApp";
import QuizApp2 from "./QuizApp2";
import MapPage from "./ayla/pages/MapPage";
import AylaLayout from "./ayla/layout/AylaLayout";
import ProductListPage from "./ayla/pages/ProductListPage";
import PricingPage from "./ayla/pages/PricingPage";
import LoadoutPage from "./ayla/pages/LoadoutPage";
import HistoryPage from "./ayla/pages/HistoryPage";
import SessionDetailPage from "./ayla/pages/SessionDetailPage";
import StatsPage from "./ayla/pages/StatsPage";

export default function App() {
  return (
    <ToastProvider>
      <Routes>

        <Route path="/" element={<AuthPage />} />
        <Route path="/quiz" element={<QuizApp />} />

        <Route path="/ayla" element={<AylaLayout />}>
          <Route index element={<Navigate to="products" replace />} />
          <Route path="map" element={<MapPage />} />
          <Route path="products" element={<ProductListPage />} />
          <Route path="pricing" element={<PricingPage />} />
          <Route path="loadout" element={<LoadoutPage />} />
          <Route path="history" element={<HistoryPage />} />
          <Route path="history/:id" element={<SessionDetailPage />} />
          <Route path="stats" element={<StatsPage />} />
        </Route>

      
        {/* <Route path="loadout" element={<LoadoutPage />} /> */}
        {/* <Route path="history" element={<HistoryPage />} /> */}
        <Route path="/quiz-2" element={<QuizApp2 />} />

        <Route element={<PrivateRoute />}>
          <Route path="/dashboard/*" element={<DashboardRoutes />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ToastProvider>
  );
}