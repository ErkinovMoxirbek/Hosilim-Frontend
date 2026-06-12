import { Routes, Route, Navigate } from "react-router-dom";
import { ToastProvider } from "./components/shared/toast/ToastProvider";
import PrivateRoute from "./components/PrivateRoute";

import AuthPage from "./pages/AuthPage";
import DashboardRoutes from "./pages/dashboard/DashboardRoutes";
import QuizApp from "./QuizApp";
import QuizApp2 from "./QuizApp2";

export default function App() {
  return (
    <ToastProvider>
      <Routes>
        
          <Route path="/" element={<AuthPage />} />
          <Route path="/quiz" element={<QuizApp />} />
          <Route path="/quiz-2" element={<QuizApp2 />} />
      
        <Route element={<PrivateRoute />}>
          <Route path="/dashboard/*" element={<DashboardRoutes />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ToastProvider>
  );
}