import React, { useState } from 'react';
import './LandingPage.css'; // Quyida CSS ni beraman

const LandingPage = () => {
  const [formData, setFormData] = useState({ name: '', phone: '', message: '' });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Bu yerda formani yuborish logikasi (masalan, email.js yoki backend API)
    alert('Xabaringiz yuborildi! Tez orada aloqaga chiqamiz.');
  };

  return (
    <div className="landing-page">
      {/* Header */}
      <header className="header">
        <div className="logo">Oltin Bog'</div>
        <nav>
          <ul>
            <li><a href="#features">Afzalliklar</a></li>
            <li><a href="#about">Haqida</a></li>
            <li><a href="#contact">Aloqa</a></li>
          </ul>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <h1>Oltin Bog' – Farg‘ona mevalarini raqamli tizim bilan yig‘ing va soting!</h1>
        <p>Dehqonlar uchun qulay tizim: mevalarni saralang, narxni bilib oling va to‘lovlarni shaffof oling.</p>
        <button onClick={() => window.location.href = '#contact'}>Ilovani yuklab oling</button>
      </section>

      {/* Features Section */}
      <section id="features" className="features">
        <h2>Afzalliklar</h2>
        <div className="feature-cards">
          <div className="card">
            <h3>Tez qabul qilish</h3>
            <p>Mevalarni punktga topshiring va sifat bo‘yicha tez saralang.</p>
          </div>
          <div className="card">
            <h3>Shaffof narxlar</h3>
            <p>1-sifat, 2-sifat bo‘yicha narxlar real vaqtida yangilanadi.</p>
          </div>
          <div className="card">
            <h3>Hisobotlar</h3>
            <p>Kunlik, haftalik hisobotlar va to‘lovlar ilovada ko‘rinadi.</p>
          </div>
          <div className="card">
            <h3>Kengayish</h3>
            <p>100-120 dehqondan boshlab, boshqa hududlarga o‘tish.</p>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="about">
        <h2>Loyiha haqida</h2>
        <p>Oltin Bog' – Farg‘ona viloyati dehqonlari uchun yaratilgan startap. Mevalarni (olma, o‘rik, shaftoli va boshqalar) yig‘ish, saralash va sotish jarayonini raqamlashtiradi. Flutter ilovasi orqali dehqonlar, punktchilar va buxgalterlar bir tizimda ishlaydi.</p>
        <ul>
          <li>Dehqonlar: 100-120 ta, kelajakda ko‘proq.</li>
          <li>Hudud: Farg‘ona (Qo‘qon, Marg‘ilon).</li>
          <li>Texnologiya: Flutter frontend, Firebase backend.</li>
          <li>Byudjet: ~5-10 mln so‘m (jihozlar va server).</li>
        </ul>
      </section>

      {/* Contact Section */}
      <section id="contact" className="contact">
        <h2>Aloqa</h2>
        <form onSubmit={handleSubmit}>
          <input name="name" placeholder="Ismingiz" onChange={handleChange} required />
          <input name="phone" placeholder="Telefon raqamingiz" onChange={handleChange} required />
          <textarea name="message" placeholder="Xabar" onChange={handleChange} required></textarea>
          <button type="submit">Yuborish</button>
        </form>
      </section>

      {/* Footer */}
      <footer className="footer">
        <p>&copy; 2025 Oltin Bog'. Barcha huquqlar himoyalangan.</p>
        <p>Aloqa: +998 90 123 45 67 | info@oltinbog.uz</p>
      </footer>
    </div>
  );
};

export default LandingPage;