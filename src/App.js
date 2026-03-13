import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import { ToastProvider } from "./components/shared/toast/ToastProvider";
import PrivateRoute from "./components/PrivateRoute";
import LandingPage from "./pages/LandingPage";
import LandingPage2 from "./pages/LandingPage2";
import PublicLayout from "./pages/PublicLayout";
import AuthPage from "./pages/AuthPage";
import DashboardRoutes from "./pages/dashboard/DashboardRoutes";

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Routes>
          {/* Public with shared Header/Footer */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<LandingPage2 />} />
          </Route>
            <Route path="/auth" element={<AuthPage />} />

          
          <Route element={<PrivateRoute />}>
            <Route path="/dashboard/*" element={<DashboardRoutes />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ToastProvider>
    </AuthProvider>
  );
}
