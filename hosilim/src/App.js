import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import './App.css';

const App = () => {
  return (
    <Router>
      <Header userType="Punktchi" userName="Anvar Qodirov" />
      <div className="container">
        <Sidebar />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;