import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
// Boshqa sahifalar, agar mavjud bo‘lsa

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        {/* Boshqa routelar */}
      </Routes>
    </Router>
  );
};

export default App;