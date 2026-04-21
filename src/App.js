import { Routes, Route, Navigate } from "react-router-dom";
import { ToastProvider } from "./components/shared/toast/ToastProvider";
import PrivateRoute from "./components/PrivateRoute";

import AuthPage from "./pages/AuthPage2";
import DashboardRoutes from "./pages/dashboard/DashboardRoutes";

export default function App() {
  return (
    <ToastProvider>
      <Routes>
        
          <Route path="/" element={<AuthPage />} />
        

    

        <Route element={<PrivateRoute />}>
          <Route path="/dashboard/*" element={<DashboardRoutes />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ToastProvider>
  );
}