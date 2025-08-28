import React from 'react';
import './HowItWorks.css';

const HowItWorks = () => {
  return (
    <section className="how-it-works" id="how-it-works">
      <div className="container">
        <div className="section-title">
          <h2>Qanday ishlaydi?</h2>
          <p>3 ta oddiy qadamda mevalaringizni soting</p>
        </div>
        <div className="steps">
          <div className="step">
            <div className="step-number">1</div>
            <h3>Ro'yxatdan o'ting</h3>
            <p>Telefon raqamingiz orqali tizimga kiring va profilingizni yarating</p>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <h3>Meva topshiring</h3>
            <p>Mevalaringizni yig'ish punktiga olib keling va sifat bo'yicha saralaymiz</p>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <h3>Pul oling</h3>
            <p>Hisob-kitob avtomatik amalga oshadi va to'lovni darhol olasiz</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;