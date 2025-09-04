import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import PrivateRoute from "./components/PrivateRoute";
import UserExtraInfoForm from "./components/UserExtraInfoForm";
import { ThemeProvider } from './context/ThemeContext';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
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