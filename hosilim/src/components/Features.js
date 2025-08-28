import React from 'react';
import './Features.css';

const Features = () => {
  return (
    <section className="features" id="features">
      <div className="container">
        <div className="section-title">
          <h2>Nima uchun bizni tanlash kerak?</h2>
          <p>Zamonaviy texnologiya yordamida mevalarni sotish jarayonini soddalashtiring</p>
        </div>
        <div className="features-grid">
          <div className="feature-card">
            <span className="feature-icon">📱</span>
            <h3>Oson foydalanish</h3>
            <p>Oddiy va tushunarli interfeys. Har bir dehqon osongina ishlatishi mumkin.</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">🔍</span>
            <h3>Sifat nazorati</h3>
            <p>Mevalarni 3 darajali sifat tizimi orqali saralash va to'g'ri baholash.</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">💰</span>
            <h3>Shaffof to'lovlar</h3>
            <p>Barcha to'lovlar va hisoblar aniq va shaffof tarzda ko'rsatiladi.</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">📊</span>
            <h3>Real-time hisobot</h3>
            <p>Kunlik, haftalik va oylik hisobotlarni real vaqt rejimida olish.</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">🚀</span>
            <h3>Tez jarayon</h3>
            <p>Meva topshirish va qabul qilish jarayoni bir necha daqiqada.</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">🏆</span>
            <h3>Yuqori sifat</h3>
            <p>Eksport sifatidagi mevalarni aniqlash va to'g'ri narxlash.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;