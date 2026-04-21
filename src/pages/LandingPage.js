import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calculator, Warehouse, TrendingUp, CheckCircle2, Menu, X, ArrowRight,
  ShieldCheck, Smartphone, Truck, Box, XOctagon, Clock, Printer, History, Users, MonitorSmartphone,
  Play, Pause
} from 'lucide-react';

const navItems = [
  { id: 'problems', label: 'Yangi tizim' },
  { id: 'features', label: 'Imkoniyatlar' },
  { id: 'benefits', label: 'Tizim afzalliklari' },
  { id: 'contact', label: 'Bog\'lanish' }
];

// --- 1. QORA LENTA (JARAYONLAR) MA'LUMOTLARI ---
const featuresData = [
  { title: "Karzinkalar qat'iy nazorati", 
    desc: "Ertalabki karzinka tarqatish elektronlashadi. Hech bir karzinka hisobsiz ketmaydi, bog'bonlar balansi avtomat yuritiladi.", icon: <Box size={28} /> },
  { title: "Kechki tezkor qabul", 
    desc: "Og'irlik, narx va qaytgan karzinkalar bir marta planshetga kiritiladi. Hisoblagich ishga tushib o'zi yakuniy summani chiqaradi.", icon: <Clock size={28} /> },
  { title: "Avtomat Buxgalteriya", 
    desc: "Bog'bon mahsulotlari uchun pul tarqatish endi ko'p vaqt olmaydi. Kimning qanchaga mahsulot topshirgani va jarimalari tizimda aniq ko'rsatiladi.", icon: <Calculator size={28} /> },
  { title: "Xolodelnik", 
    desc: "Xolodelnikdagi har bir partiyaning qachon kirgani, saqlanish muddati va harorati tizim orqali to'liq nazorat qilinadi.", icon: <Warehouse size={28} /> },
  { title: "Chet'elga Eksport Logistikasi", 
    desc: "Yuk mashinalariga ortilgan mahsulotning kuzatuvi, nakladnoy va bojxona hujjatlarini avtomat shakllantirish imkoniyati.", icon: <Truck size={28} /> },
  { title: "Shaffof hisob-kitob", 
    desc: "Bog'bonlar bilan hisob-kitoblar aniq yuritiladi. Kim, qachon, qancha mahsulot topshirgani haqida to'liq va aniq bazaga yig'iladi.", icon: <ShieldCheck size={28} /> }
];
const carouselItems = [...featuresData, ...featuresData, ...featuresData];

// --- 2. APPLE USLUBIDAGI KARUSEL (AFZALLIKLAR) MA'LUMOTLARI ---
const benefitsData = [
  { 
    title: "Buxgalter shart emas", 
    desc: "Tizim shunchalik oddiyki, undan foydalanish uchun hisob-kitob ilmi kerak emas. Ixtiyoriy xodim bemalol ma'lumotlarni boshqara oladi.", 
    icon: (
      <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center text-green-600 mb-6 self-start">
        <Users size={32} />
      </div>
    ), 
    bgImage: '/assets/buxgalter.jpg'
  },
  { 
    title: "Bir zumda hisobot", 
    desc: "Qabul tugashi bilanoq jami tonna va summani ko'rasiz. Bir tugma bilan hisobotni printerdan chiqarib, ma'lumotlarni arxivlash mumkin.", 
    icon: (
      <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center text-green-600 mb-6 self-start">
        <Printer size={32} />
      </div>
    ), 
    bgImage: '/assets/hisob.jpg' 
  },
  { 
    title: "Birgina planshet yetarli", 
    desc: "Endi ishingiz uchun bir nechta daftar kerak emas, birgina planshet yoki notebook jamiki mahsulotingizni boshqaradi. Planshet orqali inson xatolari to'liq nolga tushiriladi.", 
    icon: (
      <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center text-green-600 mb-6 self-start">
        <MonitorSmartphone size={32} />
      </div>
    ), 
    bgImage: '/assets/planshet.webp'
  },
  { 
    title: "Tarix va Statistika", 
    desc: "Tarifingiz tugasa ham ma'lumotlar saqlanib qoladi. Qaysi bog'bon qancha yuk topshirganini yillab orqaga qaytib ko'rishingiz mumkin.", 
    icon: (
      <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center text-green-600 mb-6 self-start">
        <History size={32} />
      </div>
    ), 
    bgImage: '/assets/data.jpg' 
  }
];
const infiniteBenefits = [...benefitsData, ...benefitsData, ...benefitsData];

// --- 3. TARIFLAR (PRICING) MA'LUMOTLARI ---
const pricingData = [
  {
    title: "Go",
    desc: "Kichik hajmda ishlaydiganlar uchun",
    price: "689 $",
    period: "/oy",
    features: [
      { text: "Karzinka nazorati", included: true },
      { text: "Buxgalter xizmati", included: true },
      { text: "Cheklangan arxiv", included: true },
      { text: "Xolodelnik nazorati", included: false },
      { text: "Hosilim ilovasi (Bonus)", included: false },
    ],
    theme: "light",
  },
  {
    title: "Pro",
    desc: "O'rta va yirik brokerlik tizimlari uchun",
    price: "899 $",
    period: "/oy",
    features: [
      { text: "Karzinka nazorati", included: true },
      { text: "Buxgalter xizmati", included: true },
      { text: "Cheklangan arxiv", included: true },
      { text: "Xolodelnik nazorati", included: true },
      { text: "Hosilim ilovasi (Bonus)", included: false },
    ],
    theme: "primary",
  },
  {
    title: "Ultra",
    desc: "Katta logistika va kompaniyalar uchun",
    price: "1399 $",
    period: "/oy",
    features: [
      { text: "Karzinka nazorati", included: true },
      { text: "Buxgalter xizmati", included: true },
      { text: "Cheklanmagan arxiv", included: true },
      { text: "Xolodelnik nazorati", included: true },
      { text: "Hosilim ilovasi (Bonus)", included: true },
    ],
    theme: "dark",
  }
];
const infinitePricing = [...pricingData, ...pricingData, ...pricingData];


const HosilimLanding = () => {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isPricingPageOpen, setIsPricingPageOpen] = useState(false);

  const trackRef = useRef(null);
  const animationRef = useRef(null);
  const isDragging = useRef(false);
  const currentX = useRef(0);
  const velocity = useRef(-1.5); 
  const lastMouseX = useRef(0);
  const startX = useRef(0);

  const bTrackRef = useRef(null);
  const bAnimRef = useRef(null);
  const bIsDragging = useRef(false);
  const bCurrentX = useRef(0);
  const bTargetX = useRef(0);
  const bStartX = useRef(0);
  const bItemWidth = useRef(0);
  const [bActiveDot, setBActiveDot] = useState(0);
  const [bIsPaused, setBIsPaused] = useState(false);

  const pTrackRef = useRef(null);
  const pAnimRef = useRef(null);
  const pIsDragging = useRef(false);
  const pCurrentX = useRef(0);
  const pTargetX = useRef(0);
  const pStartX = useRef(0);
  const pItemWidth = useRef(0);
  const [pActiveDot, setPActiveDot] = useState(0);
  const [pIsPaused, setPIsPaused] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // --- QORA LENTA FIZIKASI ---
  useEffect(() => {
    if (isPricingPageOpen) return;
    const el = trackRef.current;
    if (!el) return;

    const loop = () => {
      const totalWidth = el.scrollWidth;
      const oneSetWidth = totalWidth / 3;

      if (!isDragging.current) {
        if (Math.abs(velocity.current) > 1.5) velocity.current *= 0.98; 
        else velocity.current = -1.5; 
        currentX.current += velocity.current;
      }

      if (currentX.current <= -oneSetWidth * 2) currentX.current += oneSetWidth;
      else if (currentX.current >= -oneSetWidth) currentX.current -= oneSetWidth;

      el.style.transform = `translate3d(${currentX.current}px, 0, 0)`;
      animationRef.current = requestAnimationFrame(loop);
    };

    const initialWidth = el.scrollWidth / 3;
    currentX.current = -initialWidth;
    animationRef.current = requestAnimationFrame(loop);

    return () => cancelAnimationFrame(animationRef.current);
  }, [isPricingPageOpen]);

  // --- AFZALLIKLAR KARUSELI FIZIKASI ---
  useEffect(() => {
    if (isPricingPageOpen) return;
    const el = bTrackRef.current;
    if (!el) return;
    
    const updateWidth = () => {
      const child = el.children[0];
      if (child) {
        bItemWidth.current = child.offsetWidth + 24; 
        bCurrentX.current = -benefitsData.length * bItemWidth.current;
        bTargetX.current = bCurrentX.current;
      }
    };
    
    updateWidth();
    window.addEventListener('resize', updateWidth);

    const loop = () => {
      if (!bItemWidth.current) {
        bAnimRef.current = requestAnimationFrame(loop);
        return;
      }
      const SET_WIDTH = benefitsData.length * bItemWidth.current;

      if (!bIsDragging.current) {
        bCurrentX.current += (bTargetX.current - bCurrentX.current) * 0.15;
      }

      if (bTargetX.current > -SET_WIDTH + bItemWidth.current) {
        bTargetX.current -= SET_WIDTH;
        bCurrentX.current -= SET_WIDTH;
      } else if (bTargetX.current < -(SET_WIDTH * 2)) {
        bTargetX.current += SET_WIDTH;
        bCurrentX.current += SET_WIDTH;
      }

      const currentFloatIndex = -bCurrentX.current / bItemWidth.current;
      const activeIdx = Math.round(currentFloatIndex);
      const realIndex = ((activeIdx % benefitsData.length) + benefitsData.length) % benefitsData.length;
      setBActiveDot(realIndex);

      if (bTrackRef.current) {
        const containerWidth = window.innerWidth;
        const centerOffset = containerWidth / 2 - bItemWidth.current / 2;
        
        bTrackRef.current.style.transform = `translate3d(${bCurrentX.current + centerOffset}px, 0, 0)`;

        Array.from(bTrackRef.current.children).forEach((child, i) => {
          const distance = Math.abs(currentFloatIndex - i);
          const scale = Math.max(1 - distance * 0.15, 0.85); 
          const opacity = Math.max(1 - distance * 0.6, 0.4); 
          child.style.transform = `scale(${scale})`;
          child.style.opacity = opacity;
          
          if (distance < 0.5) {
            child.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.25)';
            if (!child.dataset.hasbg) child.style.backgroundColor = '#ffffff'; 
          } else {
            child.style.borderColor = '#f3f4f6'; 
            child.style.boxShadow = 'none';
            if (!child.dataset.hasbg) child.style.backgroundColor = '#f9fafb';
          }
        });
      }
      bAnimRef.current = requestAnimationFrame(loop);
    };

    bAnimRef.current = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener('resize', updateWidth);
      cancelAnimationFrame(bAnimRef.current);
    };
  }, [isPricingPageOpen]);

  useEffect(() => {
    if (isPricingPageOpen) return;
    const interval = setInterval(() => {
      if (!bIsPaused && !bIsDragging.current) {
        bTargetX.current -= bItemWidth.current;
      }
    }, 2500); 
    return () => clearInterval(interval);
  }, [bIsPaused, isPricingPageOpen]);

  // --- TARIFLAR KARUSELI FIZIKASI ---
  useEffect(() => {
    if (!isPricingPageOpen) return;
    const el = pTrackRef.current;
    if (!el) return;
    
    const updateWidth = () => {
      const child = el.children[0];
      if (child) {
        pItemWidth.current = child.offsetWidth + 24; 
        pCurrentX.current = -(pricingData.length + 1) * pItemWidth.current;
        pTargetX.current = pCurrentX.current;
      }
    };
    
    updateWidth();
    window.addEventListener('resize', updateWidth);

    const loop = () => {
      if (!pItemWidth.current) {
        pAnimRef.current = requestAnimationFrame(loop);
        return;
      }
      const SET_WIDTH = pricingData.length * pItemWidth.current;

      if (!pIsDragging.current) {
        pCurrentX.current += (pTargetX.current - pCurrentX.current) * 0.15;
      }

      if (pTargetX.current > -SET_WIDTH + pItemWidth.current) {
        pTargetX.current -= SET_WIDTH;
        pCurrentX.current -= SET_WIDTH;
      } else if (pTargetX.current < -(SET_WIDTH * 2)) {
        pTargetX.current += SET_WIDTH;
        pCurrentX.current += SET_WIDTH;
      }

      const currentFloatIndex = -pCurrentX.current / pItemWidth.current;
      const activeIdx = Math.round(currentFloatIndex);
      const realIndex = ((activeIdx % pricingData.length) + pricingData.length) % pricingData.length;
      setPActiveDot(realIndex);

      if (pTrackRef.current) {
        const containerWidth = window.innerWidth;
        const centerOffset = containerWidth / 2 - pItemWidth.current / 2;
        
        pTrackRef.current.style.transform = `translate3d(${pCurrentX.current + centerOffset}px, 0, 0)`;

        Array.from(pTrackRef.current.children).forEach((child, i) => {
          const distance = Math.abs(currentFloatIndex - i);
          const scale = Math.max(1 - distance * 0.15, 0.85); 
          const opacity = Math.max(1 - distance * 0.6, 0.4); 
          
          child.style.transform = `scale(${scale})`;
          child.style.opacity = opacity;
          
          if (distance < 0.5) {
            child.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.25)';
            child.style.zIndex = '10';
          } else {
            child.style.boxShadow = 'none';
            child.style.zIndex = '1';
          }
        });
      }
      pAnimRef.current = requestAnimationFrame(loop);
    };

    pAnimRef.current = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener('resize', updateWidth);
      cancelAnimationFrame(pAnimRef.current);
    };
  }, [isPricingPageOpen]);

  useEffect(() => {
    if (!isPricingPageOpen) return;
    const interval = setInterval(() => {
      if (!pIsPaused && !pIsDragging.current) {
        pTargetX.current -= pItemWidth.current;
      }
    }, 2500); 
    return () => clearInterval(interval);
  }, [pIsPaused, isPricingPageOpen]);

  // --- EVENT HANDLERS ---
  const onMouseDown = (e) => {
    isDragging.current = true;
    startX.current = e.pageX - currentX.current;
    lastMouseX.current = e.pageX;
    if (trackRef.current) trackRef.current.style.cursor = 'grabbing';
  };
  const onMouseMove = (e) => {
    if (!isDragging.current) return;
    currentX.current = e.pageX - startX.current;
    velocity.current = e.pageX - lastMouseX.current;
    lastMouseX.current = e.pageX;
  };
  const onMouseUp = () => {
    isDragging.current = false;
    if (trackRef.current) trackRef.current.style.cursor = 'grab';
  };

  const onBMouseDown = (e) => {
    bIsDragging.current = true;
    const pageX = e.type.includes('touch') ? e.touches[0].pageX : e.pageX;
    bStartX.current = pageX - bCurrentX.current;
    if (bTrackRef.current) bTrackRef.current.style.cursor = 'grabbing';
  };
  const onBMouseMove = (e) => {
    if (!bIsDragging.current) return;
    const pageX = e.type.includes('touch') ? e.touches[0].pageX : e.pageX;
    bCurrentX.current = pageX - bStartX.current;
    bTargetX.current = bCurrentX.current;
  };
  const onBMouseUp = () => {
    if (!bIsDragging.current) return;
    bIsDragging.current = false;
    if (bTrackRef.current) bTrackRef.current.style.cursor = 'grab';
    const index = Math.round(-bCurrentX.current / bItemWidth.current);
    bTargetX.current = -index * bItemWidth.current;
  };

  const jumpToDot = (index) => {
    const targetIndex = benefitsData.length + index; 
    bTargetX.current = -targetIndex * bItemWidth.current;
    setBIsPaused(true); 
  };

  const onPMouseDown = (e) => {
    pIsDragging.current = true;
    const pageX = e.type.includes('touch') ? e.touches[0].pageX : e.pageX;
    pStartX.current = pageX - pCurrentX.current;
    if (pTrackRef.current) pTrackRef.current.style.cursor = 'grabbing';
  };
  const onPMouseMove = (e) => {
    if (!pIsDragging.current) return;
    const pageX = e.type.includes('touch') ? e.touches[0].pageX : e.pageX;
    pCurrentX.current = pageX - pStartX.current;
    pTargetX.current = pCurrentX.current;
  };
  const onPMouseUp = () => {
    if (!pIsDragging.current) return;
    pIsDragging.current = false;
    if (pTrackRef.current) pTrackRef.current.style.cursor = 'grab';
    const index = Math.round(-pCurrentX.current / pItemWidth.current);
    pTargetX.current = -index * pItemWidth.current;
  };

  const jumpToPDot = (index) => {
    const targetIndex = pricingData.length + index; 
    pTargetX.current = -targetIndex * pItemWidth.current;
    setPIsPaused(true); 
  };

  const scrollToSection = (sectionId) => {
    const el = document.getElementById(sectionId);
    if (el) window.scrollTo({ top: el.offsetTop - 150, behavior: 'smooth' });
    setMobileOpen(false);
  };
  
  const handleAuth = () => {
    const token = localStorage.getItem('authToken');
    navigate(token ? '/dashboard' : '/auth');
  };

  // =========================================================================
  // TARIFLAR SAHIFASI
  // =========================================================================
  if (isPricingPageOpen) {
    return (
      <div 
        /* DIQQAT: CSS BREAKOUT - Qafasdan qochish usuli qo'llanildi */
        style={{ width: '100vw', marginLeft: 'calc(-50vw + 50%)', overflowX: 'hidden' }}
        className="min-h-screen bg-gray-50 font-sans text-gray-900 flex flex-col antialiased text-left"
      >
        <header className="bg-white border-b border-gray-200 py-3 shadow-sm sticky top-0 left-0 z-50 w-full">
          <div className="max-w-[1280px] w-full mx-auto px-4 sm:px-6 flex items-center justify-between">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setIsPricingPageOpen(false)}>
              <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center text-white">
                <TrendingUp size={20} />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-extrabold tracking-tight text-green-600 leading-none">Hosilim</span>
                <span className="text-[9px] uppercase font-bold text-green-600 tracking-wider mt-1">Broker platformasi</span>
              </div>
            </div>
            
            <button 
              onClick={() => setIsPricingPageOpen(false)}
              className="flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-gray-900 bg-gray-100 px-4 py-2 rounded-lg transition-colors"
            >
               Orqaga qaytish
            </button>
          </div>
        </header>

        <main className="flex-1 w-full flex flex-col justify-center py-10 relative z-10 overflow-hidden">
          <div className="text-center mb-8 px-4 w-full">
            <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">Tarifni tanlang</h2>
            <p className="text-base sm:text-lg text-gray-600 font-medium">Biznesingiz hajmiga mosini tanlang</p>
          </div>

          <div 
            className="w-full relative py-8 cursor-grab active:cursor-grabbing touch-pan-y"
            onMouseDown={onPMouseDown} onMouseMove={onPMouseMove} onMouseUp={onPMouseUp} onMouseLeave={onPMouseUp}
            onTouchStart={(e) => onPMouseDown({ pageX: e.touches[0].pageX })}
            onTouchMove={(e) => onPMouseMove({ pageX: e.touches[0].pageX })} onTouchEnd={onPMouseUp}
          >
            <div ref={pTrackRef} className="flex gap-4 sm:gap-6 w-max will-change-transform py-4 items-center px-4 sm:px-0">
              {infinitePricing.map((item, idx) => {
                
                let boxClasses = "bg-white border-gray-200 text-gray-900";
                let btnClasses = "bg-gray-100 text-gray-900 hover:bg-gray-200";
                let checkClasses = "text-green-500";
                let uncheckClasses = "text-gray-300";
                
                if (item.theme === 'primary') {
                  boxClasses = "bg-green-600 border-green-500 text-white";
                  btnClasses = "bg-white text-green-700 hover:bg-green-50 shadow-lg";
                  checkClasses = "text-green-200";
                  uncheckClasses = "text-green-800 opacity-50";
                } else if (item.theme === 'dark') {
                  boxClasses = "bg-gray-900 border-gray-800 text-white";
                  btnClasses = "bg-gray-800 border border-gray-700 text-white hover:bg-gray-700";
                  checkClasses = "text-gray-400";
                  uncheckClasses = "text-gray-700";
                }

                return (
                  <div 
                    key={idx}
                    className={`w-[85vw] sm:w-[350px] md:w-[450px] min-h-[450px] md:min-h-[500px] flex-shrink-0 rounded-[32px] p-6 md:p-10 border-2 pointer-events-none select-none text-left flex flex-col ${boxClasses}`}
                  >
                    <div className="flex flex-col mb-8">
                      <h3 className="text-2xl sm:text-3xl font-extrabold mb-2">{item.title}</h3>
                      <p className={`text-sm sm:text-base font-medium mb-6 ${item.theme === 'light' ? 'text-gray-500' : item.theme === 'primary' ? 'text-green-100' : 'text-gray-400'}`}>
                        {item.desc}
                      </p>
                      <div className="text-3xl sm:text-4xl font-extrabold mt-auto">
                        {item.price}<span className={`text-lg sm:text-xl font-medium ${item.theme === 'light' ? 'text-gray-500' : item.theme === 'primary' ? 'text-green-200' : 'text-gray-500'}`}>{item.period}</span>
                      </div>
                    </div>
                    
                    <ul className="space-y-3 sm:space-y-4 mb-8 flex-1">
                      {item.features.map((feat, i) => (
                        <li key={i} className={`flex gap-3 items-center ${feat.included ? '' : 'opacity-60'}`}>
                          {feat.included ? (
                            <CheckCircle2 size={20} className={`sm:w-6 sm:h-6 shrink-0 ${checkClasses}`}/>
                          ) : (
                            <X size={20} className={`sm:w-6 sm:h-6 shrink-0 ${uncheckClasses}`}/>
                          )}
                          <span className={`text-base sm:text-lg font-medium ${item.theme === 'light' ? 'text-gray-600' : 'text-gray-100'}`}>
                            {feat.text}
                          </span>
                        </li>
                      ))}
                    </ul>
                    
                    <div className="pointer-events-auto w-full mt-auto">
                      <button onClick={handleAuth} className={`w-full py-3 sm:py-4 font-bold rounded-2xl transition text-base sm:text-lg ${btnClasses}`}>
                        Obuna bo'lish
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-center mt-6 z-20 relative w-full">
            <div className="flex items-center gap-3 bg-gray-100/80 px-4 py-2.5 rounded-full">
              {pricingData.map((_, i) => (
                <button key={i} onClick={() => jumpToPDot(i)}
                  className={`h-2 rounded-full transition-all duration-300 ${pActiveDot === i ? 'w-8 bg-green-600' : 'w-2 bg-gray-300 hover:bg-gray-400'}`}
                />
              ))}
              <div className="w-[1px] h-4 bg-gray-300 mx-1"></div>
              <button onClick={() => setPIsPaused(!pIsPaused)} className="w-6 h-6 flex items-center justify-center rounded-full text-gray-600 hover:text-gray-900 transition-colors">
                {pIsPaused ? <Play size={14} fill="currentColor" /> : <Pause size={14} fill="currentColor" />}
              </button>
            </div>
          </div>

        </main>
      </div>
    );
  }

  // =========================================================================
  // ASOSIY SAHIFA
  // =========================================================================
  return (
    <div 
      /* DIQQAT: CSS BREAKOUT - Qafasdan qochish usuli qo'llanildi */
      style={{ width: '100vw', marginLeft: 'calc(-50vw + 50%)', overflowX: 'hidden' }}
      className="min-h-screen bg-gray-100 font-sans text-gray-900 pt-[160px] relative antialiased text-left"
    >

      <header className="fixed top-0 left-0 w-full z-50 flex flex-col transition-all duration-300">
        
        <div className={`py-2 transition-all duration-500 border-b border-gray-200/50 w-full
          ${scrolled ? 'bg-white/80 backdrop-blur-md shadow-sm' : 'bg-white/90 backdrop-blur-sm'}`}>
          <div className="max-w-[1280px] w-full mx-auto px-4 sm:px-6 flex items-center justify-between">
            
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
              <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center text-white ">
                <TrendingUp size={20} />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-extrabold tracking-tight text-green-600 leading-none">Hosilim</span>
                <span className="text-[9px] uppercase font-bold text-green-600 tracking-wider mt-1">Broker platformasi</span>
              </div>
            </div>

            <nav className="hidden md:flex items-center gap-10">
              {navItems.map(item => (
                <button key={item.id} onClick={() => scrollToSection(item.id)} className="text-[13px] font-bold text-gray-500 hover:text-green-600 transition-colors uppercase tracking-tight">
                  {item.label}
                </button>
              ))}
            </nav>

            <button className="md:hidden p-2 text-gray-600" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

          </div>
        </div>

        <div className={`bg-gray-900 w-full py-1.5 flex justify-center items-center shadow-md transition-all duration-500 ${scrolled ? 'opacity-90' : 'opacity-100'}`}>
          <div className="max-w-[1280px] w-full mx-auto px-4 sm:px-6 flex justify-between md:justify-end items-center gap-4 md:pr-5">
             <span className="text-white/80 text-xs sm:text-sm font-medium hidden sm:block">Platformaga ulanish va tizimdan foydalanish uchun:</span>
             <button onClick={handleAuth} className="px-6 py-1.5 bg-green-600 text-white font-bold rounded-lg hover:bg-green-500 transition-all text-sm w-full md:w-auto text-center">
                Tizimga kirish
             </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="md:hidden w-full bg-white border-b border-gray-100 shadow-sm p-4 absolute top-full left-0 mt-0.5">
             <nav className="flex flex-col gap-4">
              {navItems.map(item => (
                <button key={item.id} onClick={() => scrollToSection(item.id)} className="text-left text-[14px] font-bold text-gray-700 hover:text-green-600 transition-colors uppercase tracking-tight py-2 border-b border-gray-50 last:border-0">
                  {item.label}
                </button>
              ))}
            </nav>
          </div>
        )}

      </header>

      <section className="pt-10 sm:pt-16 pb-20 px-4 text-center w-full">
        <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-green-50 border border-green-100 rounded-full text-green-700 text-xs sm:text-sm font-bold mb-8">
            <CheckCircle2 size={16} /> O'zbekistondagi yagona bog'dorchilikni raqamlashtirish platformasi.
        </div>
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold mb-6 leading-tight max-w-5xl mx-auto tracking-tight">
          <br className="hidden sm:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-green-800">
            Hosilimni to'liq raqamlashtirish vaqti keldi.
          </span>
        </h1>
        <p className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto mb-10 font-medium leading-relaxed">
          Yo'qolgan ma'lumotlar, daftardagi xatolar va soatlab vaqt sarflanadigan hisob-kitoblarga barham bering. Barchasi uchun ushbu platforma yetarli.
        </p>
        
        <button onClick={() => setIsPricingPageOpen(true)} className="px-6 sm:px-8 py-3 sm:py-4 bg-green-600 text-white font-bold rounded-xl shadow-xl flex items-center gap-2 mx-auto hover:bg-green-700 transition-all hover:-translate-y-1 text-sm sm:text-base">
          Hoziroq boshlash <ArrowRight size={20} />
        </button>

        <div className="mt-16 sm:mt-20 relative max-w-5xl mx-auto w-full">
            <div className="bg-gray-900 rounded-2xl p-2 shadow-2xl border border-gray-800">
               <div className="bg-gray-50 rounded-xl overflow-hidden flex flex-col relative border border-gray-200">
                  <div className="h-10 sm:h-12 border-b border-gray-200 flex items-center px-4 gap-4 bg-white">
                    <div className="flex gap-2">
                      <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-red-400"></div>
                      <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-yellow-400"></div>
                      <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-green-400"></div>
                    </div>
                    <div className="text-[10px] sm:text-xs font-bold text-gray-400 text-left">Hosilim.uz / Broker Dashboard</div>
                  </div>
                  <div className="flex-1 flex p-4 md:p-6 gap-6 bg-gray-50">
                    <div className="w-64 hidden md:block space-y-3 text-left">
                      <div className="h-10 bg-green-100 rounded-lg w-full"></div>
                      <div className="h-10 bg-white border border-gray-200 rounded-lg w-full"></div>
                      <div className="h-10 bg-white border border-gray-200 rounded-lg w-full"></div>
                      <div className="h-10 bg-white border border-gray-200 rounded-lg w-full mt-8"></div>
                    </div>
                    <div className="flex-1 space-y-4 overflow-x-auto pb-2">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 min-w-[350px] sm:min-w-[500px]">
                        <div className="bg-white rounded-xl border border-gray-200 p-3 sm:p-4 shadow-sm text-left">
                           <div className="text-[10px] sm:text-xs text-gray-500 font-bold uppercase mb-1 flex items-center gap-2"><Box size={14} className="text-green-500"/> Karzinkalar balansi</div>
                           <div className="text-lg sm:text-2xl font-extrabold text-gray-800">2,450 <span className="text-xs sm:text-sm font-medium text-red-500">-120 qarzda</span></div>
                        </div>
                        <div className="bg-white rounded-xl border border-gray-200 p-3 sm:p-4 shadow-sm text-left">
                           <div className="text-[10px] sm:text-xs text-gray-500 font-bold uppercase mb-1 flex items-center gap-2"><TrendingUp size={14} className="text-blue-500"/> Qabul qilingan hosil</div>
                           <div className="text-lg sm:text-2xl font-extrabold text-gray-800">48.5 <span className="text-xs sm:text-sm font-medium text-gray-500">tonna</span></div>
                        </div>
                        <div className="bg-white rounded-xl border border-gray-200 p-3 sm:p-4 shadow-sm hidden md:block text-left">
                           <div className="text-xs text-gray-500 font-bold uppercase mb-1 flex items-center gap-2"><Calculator size={14} className="text-purple-500"/> Bog'bonlarga to'lov</div>
                           <div className="text-2xl font-extrabold text-gray-800">142M <span className="text-sm font-medium text-gray-500">so'm</span></div>
                        </div>
                      </div>
                      <div className="bg-white rounded-xl border border-gray-200 p-4 h-40 sm:h-48 shadow-sm flex flex-col min-w-[350px] sm:min-w-[500px]">
                        <div className="h-8 border-b border-gray-100 flex items-center gap-4 mb-2">
                           <div className="h-2 sm:h-3 w-16 sm:w-24 bg-gray-200 rounded"></div>
                           <div className="h-2 sm:h-3 w-10 sm:w-16 bg-gray-200 rounded"></div>
                        </div>
                        <div className="space-y-3 mt-2">
                           {[1,2,3].map(i => (
                             <div key={i} className="flex items-center gap-3 sm:gap-4 text-left">
                               <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gray-100"></div>
                               <div className="h-2 sm:h-3 w-24 sm:w-32 bg-gray-100 rounded"></div>
                               <div className="h-2 sm:h-3 w-12 sm:w-16 bg-green-50 text-green-500 rounded ml-auto"></div>
                             </div>
                           ))}
                        </div>
                      </div>
                    </div>
                  </div>
               </div>
            </div>
            <div className="absolute -bottom-4 -right-2 sm:-bottom-8 sm:-right-8 bg-white p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-2xl border border-gray-100 animate-bounce" style={{animationDuration: '3s'}}>
              <div className="flex items-center gap-2 sm:gap-3 text-left">
                <div className="w-8 h-8 sm:w-12 sm:h-12 bg-green-50 rounded-full flex items-center justify-center text-green-600"><ShieldCheck className="w-4 h-4 sm:w-6 sm:h-6" /></div>
                <div><p className="text-[9px] sm:text-xs text-gray-500 font-bold uppercase">Ma'lumotlar</p><p className="text-xs sm:text-sm font-extrabold text-gray-900">100% Xavfsiz</p></div>
              </div>
            </div>
        </div>
      </section>

      <section 
        id="problems" 
        className="py-16 sm:py-20 text-left relative bg-cover bg-center overflow-hidden w-full"
        style={{ backgroundImage: "url('/assets/bog.webp')" }}
      >
        <div className="absolute inset-0 bg-white/20 backdrop-blur-[4px] z-0"></div>

        <div className="max-w-[1280px] w-full mx-auto px-4 sm:px-6 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-16 w-full">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-green-950 mb-3 sm:mb-4 tracking-tight drop-shadow-sm px-2">
              Zamon bilan hamnafas bo'ling
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-800 font-bold max-w-2xl mx-auto leading-relaxed drop-shadow-sm px-4">
              Bu tizim sizni hozirgacha ketqazgan asab va daromadingizga davo bo'lishi mumkin.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 relative z-10 w-full">
            <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-6 md:p-10 border border-red-100 relative overflow-hidden shadow-2xl transition-all duration-300 ease-in-out hover:scale-[1.02] hover:shadow-[0_35px_60px_-15px_rgba(220,38,38,0.15)] cursor-pointer">
              <div className="absolute top-0 right-0 p-4 opacity-5 text-red-600"><XOctagon size={100} className="sm:w-[120px] sm:h-[120px]"/></div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-red-700 mb-5 sm:mb-6 flex items-center gap-2 sm:gap-3"><XOctagon className="text-red-500 w-6 h-6 sm:w-8 sm:h-8" /> Hozirgi usul (Xavfi)</h3>
              <ul className="space-y-4 sm:space-y-5 relative z-10 font-medium text-sm sm:text-base text-gray-700">
                <li className="flex gap-3 sm:gap-4"><span className="text-red-500 font-bold">✗</span><p><strong>Yo'qolgan daftarlar:</strong> Ma'lumotlarning aralashib ketishi yoki butunlay yo'qolish xavfi.</p></li>
                <li className="flex gap-3 sm:gap-4"><span className="text-red-500 font-bold">✗</span><p><strong>Telefon va kalkulyatori:</strong> Soatlab kalkulyatorda mahsulotlarni hisoblash va bitta xato raqam tufayli qaytadan boshlash.</p></li>
                <li className="flex gap-3 sm:gap-4"><span className="text-red-500 font-bold">✗</span><p><strong>Buxgalterga qaramlik:</strong> Faqatgina tushunadigan odamgina ma'lumotlarni kirita olishi. Jarayonlar inson omiliga qattiq bog'lanib qolishi.</p></li>
              </ul>
            </div>

            <div className="bg-green-600/90 backdrop-blur-xl rounded-3xl p-6 md:p-10 border border-green-400 text-white shadow-2xl relative overflow-hidden transition-all duration-300 ease-in-out hover:scale-[1.02] hover:shadow-[0_35px_60px_-15px_rgba(22,163,74,0.3)] cursor-pointer">
              <div className="absolute top-0 right-0 p-4 opacity-10"><CheckCircle2 size={100} className="sm:w-[120px] sm:h-[120px]"/></div>
              <h3 className="text-xl sm:text-2xl font-extrabold mb-5 sm:mb-6 flex items-center gap-2 sm:gap-3"><CheckCircle2 className="text-green-200 w-6 h-6 sm:w-8 sm:h-8" /> Hosilim tizimi (Foydasi)</h3>
              <ul className="space-y-4 sm:space-y-5 relative z-10 font-medium text-sm sm:text-base text-green-50">
                <li className="flex gap-3 sm:gap-4"><span className="text-green-300 font-bold">✓</span><p><strong>Ma'lumotlar xavfsizligi:</strong> Hamma ma'lumotlar bulutli (cloud) serverda saqlanadi. Planshet sinsa ham ma'lumotlar joyida turadi.</p></li>
                <li className="flex gap-3 sm:gap-4"><span className="text-green-300 font-bold">✓</span><p><strong>Avtomatlashtirilgan hisob:</strong> Tonna, narx, qarzdorlik tizimning o'zida avtomat hisoblanadi. Yakuniy xulosa tayyor holda chiqadi.</p></li>
                <li className="flex gap-3 sm:gap-4"><span className="text-green-300 font-bold">✓</span><p><strong>Cheksiz arxiv:</strong> Yillar o'tsa ham qaysi bog'bon eng ko'p yuk berganini va o'tgan yilgi statistikani osongina topib olasiz.</p></li>
                <li className="flex gap-3 sm:gap-4"><span className="text-green-300 font-bold">✓</span><p><strong>Tezlik va Aniqlikka intiluvchan tizim va sizning biznesingiz</strong> </p></li>
              </ul>
            </div>
            
          </div>
        </div>
      </section>

      <section id="features" className="py-16 sm:py-20 bg-gray-50 border-t border-gray-200 overflow-hidden relative text-left w-full">
        <div className="max-w-[1280px] w-full mx-auto px-4 mb-10 sm:mb-12 text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3 sm:mb-4 tracking-tight">Butun jarayon bitta joyda</h2>
          <p className="text-base sm:text-lg text-gray-600 font-medium">Dala chetidagi jarayondan tortib, xorijdagi xaridorga yetib borguncha to'liq nazorat.</p>
        </div>
        <div className="w-full bg-gray-900 py-10 sm:py-12 relative shadow-2xl overflow-hidden">
          <div className="cursor-grab active:cursor-grabbing touch-pan-y"
            onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseUp}
            onTouchStart={(e) => onMouseDown({ pageX: e.touches[0].pageX })}
            onTouchMove={(e) => onMouseMove({ pageX: e.touches[0].pageX })} onTouchEnd={onMouseUp}>
            <div ref={trackRef} className="flex gap-4 sm:gap-6 w-max will-change-transform px-4">
              {carouselItems.map((item, index) => (
                <div key={index} className="w-[280px] sm:w-[350px] flex-shrink-0 bg-white rounded-2xl p-6 sm:p-8 border border-gray-200 shadow-lg pointer-events-none select-none text-left">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-green-50 rounded-xl flex items-center justify-center text-green-600 mb-5 sm:mb-6">{item.icon}</div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3 tracking-tight">{item.title}</h3>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed font-medium">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="benefits" className="py-16 sm:py-20 bg-white overflow-hidden border-t border-gray-200 w-full">
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12 px-4 w-full">
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3 sm:mb-4 tracking-tight">
             Nega aynan <span className="text-green-600">Hosilim</span> tizimi?
          </h2>
          <p className="text-base sm:text-lg text-gray-600 font-medium">Bu shunchaki dastur emas, bu sizning biznesingizdagi eng ishonchli xodimingiz.</p>
        </div>

        <div 
          className="w-full relative py-6 sm:py-8 cursor-grab active:cursor-grabbing touch-pan-y"
          onMouseDown={onBMouseDown} onMouseMove={onBMouseMove} onMouseUp={onBMouseUp}
          onTouchStart={(e) => onBMouseDown({ pageX: e.touches[0].pageX })}
          onTouchMove={(e) => onBMouseMove({ pageX: e.touches[0].pageX })} onTouchEnd={onBMouseUp}
        >
          <div ref={bTrackRef} className="flex gap-4 sm:gap-6 w-max will-change-transform py-6 sm:py-10 px-4 sm:px-0 items-center">
            {infiniteBenefits.map((item, idx) => (
              <div 
                key={idx}
                data-hasbg={item.bgImage ? "true" : ""}
                className="w-[85vw] sm:w-[400px] md:w-[450px] flex-shrink-0 rounded-[24px] sm:rounded-3xl p-6 sm:p-10 border-2 shadow-lg pointer-events-none select-none text-left relative overflow-hidden"
                style={{
                  backgroundImage: item.bgImage ? `url(${item.bgImage})` : 'none',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              >
                {item.bgImage && <div className="absolute inset-0 bg-white/70 z-0"></div>}

                <div className="relative z-10 flex flex-col items-start">
                  <div className="scale-75 sm:scale-100 origin-top-left">{item.icon}</div>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4 tracking-tight">{item.title}</h3>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed font-medium">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-center mt-6 w-full">
          <div className="flex items-center gap-3 bg-gray-100/80 px-4 py-2.5 rounded-full">
            {benefitsData.map((_, i) => (
              <button key={i} onClick={() => jumpToDot(i)}
                className={`h-2 rounded-full transition-all duration-300 ${bActiveDot === i ? 'w-8 bg-gray-800' : 'w-2 bg-gray-300 hover:bg-gray-400'}`}
              />
            ))}
            <div className="w-[1px] h-4 bg-gray-300 mx-1"></div>
            <button onClick={() => setBIsPaused(!bIsPaused)} className="w-6 h-6 flex items-center justify-center rounded-full text-gray-600 hover:text-gray-900 transition-colors">
              {bIsPaused ? <Play size={14} fill="currentColor" /> : <Pause size={14} fill="currentColor" />}
            </button>
          </div>
        </div>
      </section>

      <footer id="contact" className="bg-gray-900 text-white pt-16 pb-10 border-t border-gray-800 w-full">
        <div className="max-w-[1280px] w-full mx-auto px-4 sm:px-6">
          
          <div className="flex flex-col min-h-[160px] md:min-h-[200px] mb-12 relative z-10 w-full">
            
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight text-center w-full mb-8 md:mb-0">
              Biznesingizni yangi bosqichga <br className="hidden md:block"/> olib chiqing
            </h2>
            
            <div className="flex flex-col sm:flex-row gap-3 mt-auto md:justify-between items-center md:items-end pt-4 md:pt-0 w-full">
              <button 
                onClick={() => setIsPricingPageOpen(true)} 
                className="px-6 py-3 bg-green-600 text-white font-bold rounded-lg shadow hover:bg-green-500 transition-all text-sm sm:text-base w-full max-w-[280px] sm:max-w-none sm:w-auto mx-auto sm:mx-0"
              >
                Demo versiyani buyurtma qilish
              </button>
              <button 
                className="px-6 py-3 bg-gray-800 text-white border border-gray-700 font-bold rounded-lg hover:bg-gray-700 transition-all text-sm sm:text-base whitespace-nowrap w-full max-w-[280px] sm:max-w-none sm:w-auto mx-auto sm:mx-0 flex justify-center"
              >
                +998 90 123 45 67
              </button>
            </div>
            
          </div>

          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm font-medium text-gray-500 relative z-20 text-center md:text-left w-full">
            <div className="flex items-center justify-center md:justify-start gap-2 w-full md:w-auto">
              <TrendingUp size={20} className="text-green-500" />
              <span className="text-gray-300 font-bold">Hosilim.uz</span>
            </div>
            <div className="w-full md:w-auto">&copy; {new Date().getFullYear()} Barcha huquqlar himoyalangan.</div>
          </div>
          
        </div>
      </footer>
    </div>
  );
};

export default HosilimLanding;