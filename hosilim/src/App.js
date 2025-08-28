import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Hero from './components/Hero';
import Features from './components/Features';
import Stats from './components/Stats';
import HowItWorks from './components/HowItWorks';
import Contact from './components/Contact';
import Footer from './components/Footer';
import './App.css';

const App = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000); // 1 soniya kutish
  }, []);

  return (
    <Router>
      <div className="app">
        {loading && (
          <div className="loading" id="loading">
            <div className="spinner"></div>
          </div>
        )}
        <Header />
        <Hero />
        <Features />
        <Stats />
        <HowItWorks />
        <Contact />
        <Footer />
      </div>
    </Router>
  );
};

export default App;