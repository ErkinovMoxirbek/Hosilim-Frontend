import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import MarketDashboard from './components/dashboards/MarketDashboard';
import LandingPageOld from './components/LandingPageOld';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import PrivateRoute from "./components/PrivateRoute";
import UserExtraInfoForm from "./components/UserExtraInfoForm";
import { ThemeProvider } from './context/ThemeContext';
import FarmerDashboard from './components/dashboards/FarmerDashboard';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/old" element={<LandingPageOld />} />
        <Route path="/login" element={<Login />} />
        <Route path="/market" element={<MarketDashboard />} />
        <Route
          path="/dashboard/*"
          element={
            <PrivateRoute>
              <ThemeProvider>
                <Dashboard /> 
              </ThemeProvider>
            </PrivateRoute>
          } 
        />
        <Route path="/extra-info" element={<UserExtraInfoForm />} />
      </Routes>
    </Router>
  );
};

export default App;