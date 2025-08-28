import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import './Hero.css';

const Hero = () => {
  useEffect(() => {
    const handleScroll = () => {
      const hero = document.querySelector('.hero');
      hero.style.transform = `translateY(${window.pageYOffset * 0.5}px)`;
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section className="hero" id="home">
      <div className="hero-content">
        <div className="hero-text">
          <motion.h1
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            Smart <span className="highlight">Hosil</span> Tizimi
          </motion.h1>
          <p>Farg'ona dehqonlari uchun mevalarni yig'ish, saralash va sotish jarayonini raqamli tizim orqali soddalashtiring. Shaffof, qulay va samarali!</p>
          <div className="hero-buttons">
            <a href="#features" className="btn-primary">Batafsil</a>
            <a href="#contact" className="btn-secondary">Bog'lanish</a>
          </div>
        </div>
        <div className="hero-visual">
          <motion.div
            className="phone-mockup"
            animate={{ y: [0, -15, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          >
            <div className="phone-screen">
              <h3>Fergana Fruit Hub</h3>
              <p>Mobile App</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;