import React, { useEffect, useRef } from 'react';
import './Stats.css';

const Stats = () => {
  const statsRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          const counters = statsRef.current.querySelectorAll('[data-count]');
          counters.forEach((counter) => {
            const target = parseInt(counter.dataset.count);
            let current = 0;
            const increment = target / 50;
            const timer = setInterval(() => {
              current += increment;
              if (current >= target) {
                counter.textContent = target;
                clearInterval(timer);
              } else {
                counter.textContent = Math.ceil(current);
              }
            }, 40);
          });
          observer.unobserve(statsRef.current);
        }
      },
      { threshold: 0.5 }
    );

    if (statsRef.current) {
      observer.observe(statsRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section className="stats">
      <div className="container" ref={statsRef}>
        <div className="stats-grid">
          <div className="stat-item">
            <h3 data-count="120">0</h3>
            <p>Faol dehqonlar</p>
          </div>
          <div className="stat-item">
            <h3 data-count="50">0</h3>
            <p>Tonnadan ortiq meva</p>
          </div>
          <div className="stat-item">
            <h3 data-count="95">0</h3>
            <p>% Mijoz qoniqish</p>
          </div>
          <div className="stat-item">
            <h3 data-count="24">0</h3>
            <p>Soat davomida yordam</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Stats;