import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

const Header = () => {
  useEffect(() => {
    const handleScroll = () => {
      const header = document.querySelector('.header');
      if (window.scrollY > 100) {
        header.style.background = 'rgba(46, 139, 87, 0.98)';
      } else {
        header.style.background = 'rgba(46, 139, 87, 0.95)';
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className="header">
      <nav className="nav">
        <div className="logo">Fergana Fruit Hub 🍎</div>
        <ul className="nav-menu">
          <li><Link to="#home">Bosh sahifa</Link></li>
          <li><Link to="#features">Xususiyatlar</Link></li>
          <li><Link to="#how-it-works">Qanday ishlaydi</Link></li>
          <li><Link to="#contact">Aloqa</Link></li>
        </ul>
        <a href="#contact" className="cta-button">Boshlash</a>
      </nav>
    </header>
  );
};

export default Header;