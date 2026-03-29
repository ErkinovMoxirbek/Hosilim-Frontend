import React, { useState, useEffect, useRef } from 'react';
import './oriental-styles.css'; 

const translations = {
  uz: {
    invitation: "TAKLIFNOMA",
    openBtn: "OCHISH",
    heroPre: "TANTANALI MAROSIMGA LUTFAN TAKLIF ETAMIZ",
    formalNames: "Aziz va qadrdon yaqinim!",
    mainLead: "Hayotimdagi eng unutilmas kunlardan biri - to'y tantanamizni siz bilan birga nishonlashni niyat qildik.<br/><br/>Sizni ushbu kechamizga samimiy taklif etamiz.",
    quote: "«Qalblarimiz birlashgan bu kunda,<br/>sizning baxtimizga guvoh bo'lishingizni istaymiz»",
    timerTitle: "BAXTLI ONLARGACHA",
    lblDays: "KUN", lblHours: "SOAT", lblMinutes: "DAQIQA", lblSeconds: "SONIYA",
    galleryTitle: "BIZNING LAHZALAR",
    programTitle: "TO'Y DASTURI",
    prog1: "Kuyovnavkar", prog2: "Kuyov va kelin tashrifi",
    prog3: "To'y oshi va tabriklar", prog4: "To'y yakuni",
    dressCodeTitle: "DRESS CODE",
    dressCodeText: "Oqshomimiz yanada ko'rkam o'tishi uchun quyidagi ranglardagi liboslarda tashrif buyurishingizni tavsiya qilamiz:",
    locationTitle: "MANZIL VA VAQT",
    calendarTime: "Boshlanish vaqti: 18:00",
    mapBtn: "XARITADAN KO'RISH",
    saveCalendarBtn: "TAQVIMGA SAQLASH",
    giftsTitle: "QUTLOVLAR UCHUN",
    giftsText: "Sizning e'tiboringiz va samimiy tilaklaringiz biz uchun eng katta sovg'adir. Agar istasangiz, quyidagi hisob orqali qutlov yuborishingiz mumkin:",
    copyBtn: "NUSXA OLISH",
    copiedBtn: "NUSXA OLINDI ✔",
    rsvpTitle: "TASHRIFINGIZNI TASDIQLANG",
    rsvpText: "Marosimda ishtirok etishingizni oldindan ma'lum qilishingizni so'raymiz.",
    btnAccept: "ALBATTA BORAMAN",
    btnDecline: "KELA OLMAYMAN"
  },
  ru: {
    invitation: "ПРИГЛАШЕНИЕ",
    openBtn: "ОТКРЫТЬ",
    heroPre: "ПРИГЛАШАЕМ ВАС НА ТОРЖЕСТВО",
    formalNames: "Дорогой и близкий человек!",
    mainLead: "Мы решили отпраздновать один из самых незабываемых дней в нашей жизни - нашу свадьбу, вместе с вами.<br/><br/>Искренне приглашаем вас на этот вечер.",
    quote: "«В этот день, когда наши сердца сливаются воедино,<br/>мы хотим, чтобы вы были свидетелями нашего счастья»",
    timerTitle: "ДО СЧАСТЛИВЫХ МГНОВЕНИЙ",
    lblDays: "ДНЕЙ", lblHours: "ЧАСОВ", lblMinutes: "МИНУТ", lblSeconds: "СЕКУНД",
    galleryTitle: "НАШИ МОМЕНТЫ",
    programTitle: "ПРОГРАММА ВЕЧЕРА",
    prog1: "Друзья жениха", prog2: "Организация жениха и невесты",
    prog3: "Свадебный плов и поздравления", prog4: "Завершение вечера",
    dressCodeTitle: "ДРЕСС-КОД",
    dressCodeText: "Для поддержания атмосферы праздника, будем рады видеть вас в нарядах следующих оттенков:",
    locationTitle: "МЕСТО И ВРЕМЯ",
    calendarTime: "Время начала: 18:00",
    mapBtn: "ПОСМОТРЕТЬ НА КАРТЕ",
    saveCalendarBtn: "СОХРАНИТЬ В КАЛЕНДАРЬ",
    giftsTitle: "ДЛЯ ПОЗДРАВЛЕНИЙ",
    giftsText: "Ваше присутствие и теплые слова — лучший подарок для нас. При желании вы можете отправить поздравление по реквизитам ниже:",
    copyBtn: "СКОПИРОВАТЬ",
    copiedBtn: "СКОПИРОВАНО ✔",
    rsvpTitle: "ПОДТВЕРДИТЕ ПРИСУТСТВИЕ",
    rsvpText: "Просим заранее сообщить о вашем присутствии на нашем торжестве.",
    btnAccept: "ОБЯЗАТЕЛЬНО БУДУ",
    btnDecline: "НЕ СМОГУ ПРИЙТИ"
  }
};

export default function OrientalInvitation() {
  const [lang, setLang] = useState('uz');
  const [isGateOpened, setIsGateOpened] = useState(false);
  const [isGateHidden, setIsGateHidden] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // ==========================================
  // TO'G'RILANGAN QISM: LOCAL STORAGE
  // ==========================================
  const [rsvpStatus, setRsvpStatus] = useState(() => {
    const savedStatus = localStorage.getItem('rsvpStatus');
    return savedStatus ? savedStatus : null;
  });

  const [counts, setCounts] = useState(() => {
    const savedCounts = localStorage.getItem('rsvpCounts');
    return savedCounts ? JSON.parse(savedCounts) : { accept: 42, decline: 3 };
  });

  useEffect(() => {
    if (rsvpStatus) {
      localStorage.setItem('rsvpStatus', rsvpStatus);
    }
  }, [rsvpStatus]);

  useEffect(() => {
    localStorage.setItem('rsvpCounts', JSON.stringify(counts));
  }, [counts]);
  // ==========================================
  
  const [timeLeft, setTimeLeft] = useState({ days: '00', hours: '00', minutes: '00', seconds: '00' });
  const [copied, setCopied] = useState(false);

  const revealRefs = useRef([]);
  revealRefs.current = [];
  const audioRef = useRef(null);

  const t = translations[lang];

  useEffect(() => {
    const targetDate = new Date("May 26, 2026 18:00:00").getTime();
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate - now;

      if (distance <= 0) {
        clearInterval(timer); return;
      }
      setTimeLeft({
        days: String(Math.floor(distance / (1000 * 60 * 60 * 24))).padStart(2, '0'),
        hours: String(Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))).padStart(2, '0'),
        minutes: String(Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))).padStart(2, '0'),
        seconds: String(Math.floor((distance % (1000 * 60)) / 1000)).padStart(2, '0')
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!isGateOpened) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    revealRefs.current.forEach(el => el && observer.observe(el));
    return () => observer.disconnect();
  }, [isGateOpened]);

  const addToRefs = (el) => {
    if (el && !revealRefs.current.includes(el)) revealRefs.current.push(el);
  };

  const handleOpenGate = () => {
    setIsGateOpened(true);
    if (audioRef.current) {
      audioRef.current.play().catch(e => console.log(e));
      setIsPlaying(true);
    }
    setTimeout(() => setIsGateHidden(true), 1500);
  };

  const toggleMusic = () => {
    if (isPlaying) audioRef.current.pause();
    else audioRef.current.play();
    setIsPlaying(!isPlaying);
  };

  const handleRsvp = (status) => {
    if (rsvpStatus === status) return;
    setCounts(prev => {
      let a = prev.accept; let d = prev.decline;
      if (status === 'accept') { a++; if (rsvpStatus === 'decline') d--; }
      else { d++; if (rsvpStatus === 'accept') a--; }
      return { accept: a, decline: d };
    });
    setRsvpStatus(status);
  };

  const handleCopyCard = () => {
    const cardNumber = "8600 1234 5678 9012";
    navigator.clipboard.writeText(cardNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const googleCalendarLink = "https://calendar.google.com/calendar/render?action=TEMPLATE&text=Mohirbek+va+Nilufarxon+To'y+Tantanasi&dates=20260526T130000Z/20260526T180000Z&details=Bizning+quvonchli+kunimizda+mehmonimiz+bo'ling!&location=Imperial+Tantanalar+Saroyi,+Farg'ona";

  return (
    <div className="luxury-wrapper">
      <audio ref={audioRef} src="/assets/uzbek music.m4a" loop />
      
      <div className="dot-pattern"></div>
      <div className="gold-dust"></div>
      <div className="gold-dust layer-2"></div>

      <div className="lang-controls">
        <button className={`lang-circle ${lang === 'uz' ? 'active' : ''}`} onClick={() => setLang('uz')}>UZ</button>
        <button className={`lang-circle ${lang === 'ru' ? 'active' : ''}`} onClick={() => setLang('ru')}>RU</button>
      </div>

      {!isGateHidden && (
        <div className={`gate-container ${isGateOpened ? 'open' : ''}`}>
          <div className="gate left">
            <div className="gate-line left-line"></div>
            <div className="star-icon left-star">✦</div>
          </div>
          <div className="gate right">
            <div className="gate-line right-line"></div>
            <div className="star-icon right-star">✦</div>
          </div>
          
          <div className={`intro-center ${isGateOpened ? 'fade-out' : ''}`}>
            <p className="intro-subtitle">{t.invitation}</p>
            <h1 className="main-names gold-text">MOHIRBEK <span className="ampersand">&</span> NILUFARXON</h1>
            <p className="intro-date">26 . 05 . 2026</p>
            <button className="capsule-btn primary" onClick={handleOpenGate}>
              {t.openBtn}
            </button>
          </div>
        </div>
      )}

      <div className={`main-scroll-content ${isGateOpened ? 'show' : ''}`}>
        
        <button className={`music-fab ${isPlaying ? 'spin' : ''}`} onClick={toggleMusic}>
          {isPlaying ? '🎵' : '🔇'}
        </button>

        <section className="reveal" ref={addToRefs}>
          <p className="section-subtitle">{t.heroPre}</p>
          <h1 className="main-names gold-text" style={{fontSize: '4.5rem', marginTop: '20px'}}>
            MOHIRBEK <span className="ampersand pulsing-amp" style={{fontSize: '3rem'}}>&</span> NILUFARXON
          </h1>
          <p className="intro-date" style={{marginTop: '20px'}}>26 . 05 . 2026</p>
        </section>

        <section className="reveal" ref={addToRefs} style={{marginTop: '50px'}}>
          <p className="formal-names">{t.formalNames}</p>
          <p className="main-lead" dangerouslySetInnerHTML={{ __html: t.mainLead }}></p>
        </section>

        <section className="reveal" ref={addToRefs}>
          <div className="quote-box">
            <span className="quote-icon">❝</span>
            <p className="romantic-quote" dangerouslySetInnerHTML={{ __html: t.quote }}></p>
            <span className="quote-icon">❞</span>
          </div>
        </section>

        <section className="reveal" ref={addToRefs}>
          <h2 className="section-title">{t.galleryTitle}</h2>
          <div className="photo-gallery">
            <div className="photo-frame"><div className="photo-img" style={{backgroundImage: "url('/assets/image-1.png')"}}></div></div>
            <div className="photo-frame"><div className="photo-img" style={{backgroundImage: "url('/assets/image-2.png')"}}></div></div>
            <div className="photo-frame"><div className="photo-img" style={{backgroundImage: "url('/assets/image-3.png')"}}></div></div>
          </div>
        </section>

        <section className="reveal" ref={addToRefs}>
          <h2 className="section-title">{t.timerTitle}</h2>
          <div className="timer-flex">
            <div className="time-block"><span className="time-val">{timeLeft.days}</span><span className="time-lbl">{t.lblDays}</span></div>
            <div className="time-separator">:</div>
            <div className="time-block"><span className="time-val">{timeLeft.hours}</span><span className="time-lbl">{t.lblHours}</span></div>
            <div className="time-separator">:</div>
            <div className="time-block"><span className="time-val">{timeLeft.minutes}</span><span className="time-lbl">{t.lblMinutes}</span></div>
            <div className="time-separator">:</div>
            <div className="time-block"><span className="time-val">{timeLeft.seconds}</span><span className="time-lbl">{t.lblSeconds}</span></div>
          </div>
        </section>

        <section className="reveal" ref={addToRefs}>
          <h2 className="section-title">{t.programTitle}</h2>
          <div className="timeline-box">
            <div className="timeline-row"><span className="tl-time">15:00</span><span className="tl-text">{t.prog1}</span></div>
            <div className="timeline-row"><span className="tl-time">17:00</span><span className="tl-text">{t.prog2}</span></div>
            <div className="timeline-row"><span className="tl-time">18:00</span><span className="tl-text">{t.prog3}</span></div>
            <div className="timeline-row"><span className="tl-time">20:00</span><span className="tl-text">{t.prog4}</span></div>
          </div>
        </section>

        <section className="reveal" ref={addToRefs}>
          <h2 className="section-title">{t.dressCodeTitle}</h2>
          <p className="main-lead" style={{marginBottom: '30px'}}>{t.dressCodeText}</p>
          <div className="dress-colors">
            <div className="d-color" style={{background: '#0a1912'}}></div>
            <div className="d-color" style={{background: '#c0b283'}}></div>
            <div className="d-color" style={{background: '#000000'}}></div>
            <div className="d-color" style={{background: '#ffffff'}}></div>
          </div>
        </section>

        <section className="reveal" ref={addToRefs}>
          <h2 className="section-title">{t.locationTitle}</h2>
          <div className="address-box">
            <h3 className="gold-text" style={{fontFamily: 'Cinzel, serif', fontSize: '2rem'}}>Imperial Tantanalar Saroyi</h3>
            <p className="main-lead" style={{margin: '15px 0'}}>Farg'ona, Buvayda tumani</p>
            <p className="intro-date" style={{fontSize: '1.2rem', margin: '20px 0'}}>{t.calendarTime}</p>
            
            <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', flexWrap: 'wrap', marginTop: '20px' }}>
              <a href="https://yandex.uz/maps/-/CPVdUQMb" target="_blank" rel="noreferrer" className="capsule-btn outline">
                {t.mapBtn}
              </a>
              <a href={googleCalendarLink} target="_blank" rel="noreferrer" className="capsule-btn outline-dark" style={{color: '#ceab5d', borderColor: '#ceab5d'}}>
                🗓 {t.saveCalendarBtn}
              </a>
            </div>
          </div>
        </section>

        <section className="reveal" ref={addToRefs}>
          <h2 className="section-title">{t.giftsTitle}</h2>
          <p className="main-lead" style={{marginBottom: '30px'}}>{t.giftsText}</p>
          
          <div className="bank-card">
            <div className="card-chip"></div>
            <div className="card-logo">Uzcard / Humo</div>
            <p className="card-number">4067 0700 0947 4359</p>
            <p className="card-name">ERIKOV MOHIRBEK</p>
            
            <button className={`copy-btn ${copied ? 'copied' : ''}`} onClick={handleCopyCard}>
              {copied ? t.copiedBtn : t.copyBtn}
            </button>
          </div>
        </section>

        <section className="reveal rsvp-section" ref={addToRefs}>
          <h2 className="section-title">{t.rsvpTitle}</h2>
          <p className="main-lead" style={{marginBottom: '40px', fontStyle: 'italic'}}>{t.rsvpText}</p>
          
          <div className="capsule-group">
            <button className={`capsule-btn ${rsvpStatus === 'accept' ? 'primary' : 'outline-dark'}`} onClick={() => handleRsvp('accept')}>
              {t.btnAccept} <span className="count-badge">{counts.accept}</span>
            </button>
            <button className={`capsule-btn ${rsvpStatus === 'decline' ? 'outline' : 'outline-dark'}`} onClick={() => handleRsvp('decline')}>
              {t.btnDecline} <span className="count-badge">{counts.decline}</span>
            </button>
          </div>
        </section>

        <footer style={{ textAlign: 'center', padding: '50px', color: '#666', fontSize: '0.8rem', letterSpacing: '2px' }}>
          <a href='https://t.me/moxirbek_erkinov' target='_blank' rel='noreferrer' style={{color: '#a0a0a0', textDecoration: 'none'}}>MADE WITH ❤️ BY TELEGRAM</a> <br/><br/> Mohirbek & Nilufarxon | 2026
        </footer>

      </div>
    </div>
  );
}