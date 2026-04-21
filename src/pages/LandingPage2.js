import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calculator, Warehouse, TrendingUp, CheckCircle2, Menu, X, ArrowRight,
  ShieldCheck, Smartphone, Truck, Box, XOctagon, Clock, Printer, History, Users, MonitorSmartphone,
  Play, Pause, Sun, Moon
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

// --- 2. APPLE USLUBIDAGI KARUSEL MA'LUMOTLARI ---
const benefitsData = [
  { 
    title: "Buxgalter shart emas", 
    desc: "Tizim shunchalik oddiyki, undan foydalanish uchun hisob-kitob ilmi kerak emas. Ixtiyoriy xodim bemalol ma'lumotlarni boshqara oladi.", 
    icon: <Users size={32} />, 
    bgImage: '/assets/buxgalter.jpg'
  },
  { 
    title: "Bir zumda hisobot", 
    desc: "Qabul tugashi bilanoq jami tonna va summani ko'rasiz. Bir tugma bilan hisobotni printerdan chiqarib, ma'lumotlarni arxivlash mumkin.", 
    icon: <Printer size={32} />, 
    bgImage: '/assets/hisob.jpg' 
  },
  { 
    title: "Birgina planshet yetarli", 
    desc: "Endi ishingiz uchun bir nechta daftar kerak emas, birgina planshet yoki notebook jamiki mahsulotingizni boshqaradi. Planshet orqali inson xatolari to'liq nolga tushiriladi.", 
    icon: <MonitorSmartphone size={32} />, 
    bgImage: '/assets/planshet.webp'
  },
  { 
    title: "Tarix va Statistika", 
    desc: "Tarifingiz tugasa ham ma'lumotlar saqlanib qoladi. Qaysi bog'bon qancha yuk topshirganini yillab orqaga qaytib ko'rishingiz mumkin.", 
    icon: <History size={32} />, 
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
      { text: "Hosil ilovasi (Bonus)", included: false },
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
      { text: "Hosil ilovasi (Bonus)", included: false },
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
      { text: "Hosil ilovasi (Bonus)", included: true },
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
  
  // 🔥 KUN VA TUN REJIMI STATI
  const [isDark, setIsDark] = useState(true);

  // Fizika statelari...
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

  // --- APPLE KARUSELI FIZIKASI ---
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
        const screenWidth = document.documentElement.clientWidth || window.innerWidth;
        const centerOffset = screenWidth / 2 - bItemWidth.current / 2;
        bTrackRef.current.style.transform = `translate3d(${bCurrentX.current + centerOffset}px, 0, 0)`;
        Array.from(bTrackRef.current.children).forEach((child, i) => {
          const distance = Math.abs(currentFloatIndex - i);
          const scale = Math.max(1 - distance * 0.15, 0.85); 
          const opacity = Math.max(1 - distance * 0.6, 0.4); 
          child.style.transform = `scale(${scale})`;
          child.style.opacity = opacity;
          if (distance < 0.5) {
            child.style.boxShadow = isDark ? '0 25px 50px -12px rgba(0, 0, 0, 0.5)' : '0 25px 50px -12px rgba(0, 0, 0, 0.1)';
            if (!child.dataset.hasbg) child.style.backgroundColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.7)'; 
            child.style.borderColor = isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.8)';
          } else {
            child.style.borderColor = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.3)'; 
            child.style.boxShadow = 'none';
            if (!child.dataset.hasbg) child.style.backgroundColor = isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(255, 255, 255, 0.3)';
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
  }, [isPricingPageOpen, isDark]); // isDark ga qarab fizika ham yangilanadi

  useEffect(() => {
    if (isPricingPageOpen) return;
    const interval = setInterval(() => {
      if (!bIsPaused && !bIsDragging.current) bTargetX.current -= bItemWidth.current;
    }, 2500); 
    return () => clearInterval(interval);
  }, [bIsPaused, isPricingPageOpen]);

  // --- TARIFLAR (PRICING) KARUSELI FIZIKASI ---
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
        const screenWidth = document.documentElement.clientWidth || window.innerWidth;
        const centerOffset = screenWidth / 2 - pItemWidth.current / 2;
        pTrackRef.current.style.transform = `translate3d(${pCurrentX.current + centerOffset}px, 0, 0)`;
        Array.from(pTrackRef.current.children).forEach((child, i) => {
          const distance = Math.abs(currentFloatIndex - i);
          const scale = Math.max(1 - distance * 0.15, 0.85); 
          const opacity = Math.max(1 - distance * 0.6, 0.4); 
          child.style.transform = `scale(${scale})`;
          child.style.opacity = opacity;
          if (distance < 0.5) {
            child.style.boxShadow = isDark ? '0 25px 50px -12px rgba(0, 0, 0, 0.5)' : '0 25px 50px -12px rgba(0, 0, 0, 0.1)';
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
  }, [isPricingPageOpen, isDark]);

  useEffect(() => {
    if (!isPricingPageOpen) return;
    const interval = setInterval(() => {
      if (!pIsPaused && !pIsDragging.current) pTargetX.current -= pItemWidth.current;
    }, 2500);
    return () => clearInterval(interval);
  }, [pIsPaused, isPricingPageOpen]);

  // Sichqoncha Eventlari...
  const onMouseDown = (e) => { isDragging.current = true; startX.current = e.pageX - currentX.current; lastMouseX.current = e.pageX; };
  const onMouseMove = (e) => { if (!isDragging.current) return; currentX.current = e.pageX - startX.current; velocity.current = e.pageX - lastMouseX.current; lastMouseX.current = e.pageX; };
  const onMouseUp = () => { isDragging.current = false; };
  const onBMouseDown = (e) => { bIsDragging.current = true; const pageX = e.type.includes('touch') ? e.touches[0].pageX : e.pageX; bStartX.current = pageX - bCurrentX.current; };
  const onBMouseMove = (e) => { if (!bIsDragging.current) return; const pageX = e.type.includes('touch') ? e.touches[0].pageX : e.pageX; bCurrentX.current = pageX - bStartX.current; bTargetX.current = bCurrentX.current; };
  const onBMouseUp = () => { if (!bIsDragging.current) return; bIsDragging.current = false; const index = Math.round(-bCurrentX.current / bItemWidth.current); bTargetX.current = -index * bItemWidth.current; };
  const jumpToDot = (index) => { bTargetX.current = -(benefitsData.length + index) * bItemWidth.current; setBIsPaused(true); };
  const onPMouseDown = (e) => { pIsDragging.current = true; const pageX = e.type.includes('touch') ? e.touches[0].pageX : e.pageX; pStartX.current = pageX - pCurrentX.current; };
  const onPMouseMove = (e) => { if (!pIsDragging.current) return; const pageX = e.type.includes('touch') ? e.touches[0].pageX : e.pageX; pCurrentX.current = pageX - pStartX.current; pTargetX.current = pCurrentX.current; };
  const onPMouseUp = () => { if (!pIsDragging.current) return; pIsDragging.current = false; const index = Math.round(-pCurrentX.current / pItemWidth.current); pTargetX.current = -index * pItemWidth.current; };
  const jumpToPDot = (index) => { pTargetX.current = -(pricingData.length + index) * pItemWidth.current; setPIsPaused(true); };

  const scrollToSection = (sectionId) => {
    const el = document.getElementById(sectionId);
    if (el) window.scrollTo({ top: el.offsetTop - 150, behavior: 'smooth' });
    setMobileOpen(false);
  };
  
  const handleAuth = () => {
    const token = localStorage.getItem('authToken');
    navigate(token ? '/dashboard' : '/auth');
  };

  return (
    <div 
      className={`min-h-screen font-sans overflow-x-hidden relative bg-cover bg-center bg-fixed transition-colors duration-500 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}
      style={{ backgroundImage: "url('/assets/peach.jpg')" }}
    >
      {/* 🌙 ORQA FON PARDA: Kun bo'lsa oqish-xira, Tun bo'lsa qoramtir-xira */}
      <div className={`fixed inset-0 transition-colors duration-500 z-0 pointer-events-none ${isDark ? 'bg-gray-900/40 backdrop-blur-[4px]' : 'bg-white/40 backdrop-blur-[8px]'}`}></div>

      {isPricingPageOpen ? (
        // TARIFLAR SAHIFASI
        <div className="relative z-10 flex flex-col min-h-screen">
          <header className={`backdrop-blur-md border-b py-4 shadow-sm sticky top-0 z-50 transition-colors duration-500 ${isDark ? 'bg-white/10 border-white/20' : 'bg-white/50 border-white/60'}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
              <div className="flex items-center gap-2 cursor-pointer" onClick={() => setIsPricingPageOpen(false)}>
                <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-green-500/30">
                  <img src="/logo-white.png" alt="Logo" className="w-6 h-6" />
                </div>
                <div className="flex flex-col">
                  <span className={`text-xl font-black tracking-tight leading-none ${isDark ? 'text-white' : 'text-gray-900'}`}>Hosilim</span>
                  <span className="text-[9px] uppercase font-bold text-green-500 tracking-wider mt-1">Agro platforma</span>
                </div>
              </div>
              
              <button 
                onClick={() => setIsPricingPageOpen(false)}
                className={`flex items-center gap-2 text-sm font-bold backdrop-blur-md border px-4 py-2 rounded-lg transition-colors ${isDark ? 'text-white hover:text-green-300 bg-white/10 border-white/20' : 'text-gray-800 hover:text-green-600 bg-white/50 border-white/60'}`}
              >
                 Orqaga qaytish
              </button>
            </div>
          </header>

          <main className="flex-1 w-auto flex flex-col justify-center py-10 relative overflow-hidden">
            <div className="text-center mb-8 px-4">
              <h2 className={`text-3xl md:text-5xl font-black mb-4 tracking-tight drop-shadow-md ${isDark ? 'text-white' : 'text-gray-900'}`}>Tarifni tanlang</h2>
              <p className={`text-base sm:text-lg font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>Biznesingiz hajmiga mosini tanlang</p>
            </div>

            <div 
              className="w-full relative py-8 cursor-grab active:cursor-grabbing touch-pan-y"
              onMouseDown={onPMouseDown} onMouseMove={onPMouseMove} onMouseUp={onPMouseUp} onMouseLeave={onPMouseUp}
              onTouchStart={(e) => onPMouseDown({ pageX: e.touches[0].pageX })}
              onTouchMove={(e) => onPMouseMove({ pageX: e.touches[0].pageX })} onTouchEnd={onPMouseUp}
            >
              <div ref={pTrackRef} className="flex gap-4 sm:gap-6 w-max will-change-transform py-4 items-center px-4 sm:px-0">
                {infinitePricing.map((item, idx) => {
                  let boxClasses = isDark ? "bg-white/10 border-white/20 text-white" : "bg-white/60 border-white/60 text-gray-900";
                  let btnClasses = isDark ? "bg-white text-gray-900 hover:bg-gray-100" : "bg-gray-900 text-white hover:bg-gray-800";
                  let checkClasses = "text-green-500";
                  let uncheckClasses = isDark ? "text-white/30" : "text-gray-400/30";
                  
                  if (item.theme === 'primary') {
                    boxClasses = isDark ? "bg-green-500/30 border-green-400/50 text-white shadow-[0_0_40px_rgba(34,197,94,0.3)]" : "bg-green-500/20 border-green-500/40 text-gray-900 shadow-[0_0_40px_rgba(34,197,94,0.15)]";
                    btnClasses = "bg-green-500 text-white hover:bg-green-400 shadow-lg";
                  } else if (item.theme === 'dark') {
                    boxClasses = isDark ? "bg-black/50 border-white/10 text-white" : "bg-white/80 border-gray-200 text-gray-900";
                    btnClasses = isDark ? "bg-white/10 border border-white/20 text-white hover:bg-white/20" : "bg-gray-100 border border-gray-200 text-gray-900 hover:bg-gray-200";
                  }

                  return (
                    <div key={idx} className={`w-[85vw] sm:w-[350px] md:w-[450px] min-h-[450px] md:min-h-[500px] flex-shrink-0 rounded-[32px] p-6 md:p-10 pointer-events-none select-none text-left flex flex-col transition-all duration-300 backdrop-blur-xl shadow-xl border ${boxClasses}`}>
                      <div className="flex flex-col mb-8">
                        <h3 className="text-2xl sm:text-3xl font-black mb-2">{item.title}</h3>
                        <p className={`text-sm sm:text-base font-medium mb-6 ${item.theme === 'primary' ? (isDark ? 'text-green-100' : 'text-green-800') : (isDark ? 'text-gray-200' : 'text-gray-600')}`}>
                          {item.desc}
                        </p>
                        <div className="text-3xl sm:text-4xl font-black mt-auto">
                          {item.price}<span className={`text-lg sm:text-xl font-medium ml-1 ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>{item.period}</span>
                        </div>
                      </div>
                      
                      <ul className="space-y-3 sm:space-y-4 mb-8 flex-1">
                        {item.features.map((feat, i) => (
                          <li key={i} className={`flex gap-3 items-center ${feat.included ? '' : 'opacity-50'}`}>
                            {feat.included ? <CheckCircle2 size={20} className={`sm:w-6 sm:h-6 shrink-0 ${checkClasses}`}/> : <X size={20} className={`sm:w-6 sm:h-6 shrink-0 ${uncheckClasses}`}/>}
                            <span className="text-base sm:text-lg font-medium">{feat.text}</span>
                          </li>
                        ))}
                      </ul>
                      
                      <div className="pointer-events-auto w-full mt-auto">
                        <button onClick={handleAuth} className={`w-full py-3 sm:py-4 font-bold rounded-2xl transition-all text-base sm:text-lg ${btnClasses}`}>
                          Obuna bo'lish
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-center mt-6 z-20 relative">
              <div className={`flex items-center gap-3 backdrop-blur-md border px-4 py-2.5 rounded-full ${isDark ? 'bg-black/40 border-white/10' : 'bg-white/50 border-white/60'}`}>
                {pricingData.map((_, i) => (
                  <button key={i} onClick={() => jumpToPDot(i)} className={`h-2 rounded-full transition-all duration-300 ${pActiveDot === i ? 'w-8 bg-green-500' : (isDark ? 'w-2 bg-white/30 hover:bg-white/50' : 'w-2 bg-gray-400/50 hover:bg-gray-400')}`} />
                ))}
                <div className={`w-[1px] h-4 mx-1 ${isDark ? 'bg-white/20' : 'bg-gray-300'}`}></div>
                <button onClick={() => setPIsPaused(!pIsPaused)} className={`w-6 h-6 flex items-center justify-center rounded-full transition-colors ${isDark ? 'text-white/70 hover:text-white' : 'text-gray-500 hover:text-gray-900'}`}>
                  {pIsPaused ? <Play size={14} fill="currentColor" /> : <Pause size={14} fill="currentColor" />}
                </button>
              </div>
            </div>
          </main>
        </div>
      ) : (

      /* =========================================================================
          ASOSIY SAHIFA (LANDING)
      ========================================================================= */
      <div className="relative z-10 flex flex-col pt-[90px] sm:pt-[100px]">

        <header className="fixed top-0 w-full z-50 flex flex-col transition-all duration-300">
          
          <div className={`py-3 transition-all duration-500 border-b 
            ${scrolled 
              ? (isDark ? 'bg-black/60 backdrop-blur-xl shadow-lg border-white/10' : 'bg-white/70 backdrop-blur-xl shadow-lg border-white/60') 
              : (isDark ? 'bg-white/10 backdrop-blur-md border-white/20' : 'bg-white/40 backdrop-blur-md border-white/60')}`}>
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
              
              {/* Logo */}
              <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
                <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-green-500/30">
                  <img src="/logo-white.png" alt="Logo" className="w-6 h-6" />
                </div>
                <div className="flex flex-col">
                  <span className={`text-xl font-black tracking-tight leading-none drop-shadow-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>Hosilim</span>
                  <span className="text-[9px] uppercase font-bold text-green-500 tracking-wider mt-1 drop-shadow-sm">Agro platforma</span>
                </div>
              </div>

              {/* O'ng tomon: Menyular, Kun/Tun, Login */}
              <div className="flex items-center gap-4 sm:gap-8">
                
                <nav className="hidden md:flex items-center gap-6">
                  {navItems.map(item => (
                    <button key={item.id} onClick={() => scrollToSection(item.id)} className={`text-[13px] font-bold uppercase tracking-tight drop-shadow-sm transition-colors ${isDark ? 'text-white/90 hover:text-green-400' : 'text-gray-800 hover:text-green-600'}`}>
                      {item.label}
                    </button>
                  ))}
                </nav>

                <div className="flex items-center gap-2 sm:gap-4">
                  {/* ☀️🌙 KUN VA TUN TUGMASI */}
                  <button 
                    onClick={() => setIsDark(!isDark)} 
                    className={`p-2 rounded-full transition-all hover:scale-110 active:scale-95 ${isDark ? 'bg-white/10 text-yellow-400 hover:bg-white/20' : 'bg-gray-900/10 text-gray-700 hover:bg-gray-900/20'}`}
                    title={isDark ? "Kun rejimiga o'tish" : "Tun rejimiga o'tish"}
                  >
                    {isDark ? <Sun size={20} /> : <Moon size={20} />}
                  </button>

                  <button 
                    onClick={handleAuth} 
                    className="px-5 py-2.5 bg-green-600 text-white font-bold rounded-lg shadow-lg shadow-green-600/20 hover:bg-green-500 transition-all text-xs sm:text-sm hover:-translate-y-0.5 border border-green-500/50"
                  >
                    Tizimga kirish
                  </button>
                  <button className={`md:hidden p-2 ${isDark ? 'text-white/80 hover:text-white' : 'text-gray-800 hover:text-gray-900'}`} onClick={() => setMobileOpen(!mobileOpen)}>
                    {mobileOpen ? <X size={24} /> : <Menu size={24} />}
                  </button>
                </div>
              </div>

            </div>
          </div>

          <div className={`w-full h-7 flex items-center shadow-md transition-all duration-500 relative z-40 border-b md:hidden ${scrolled ? (isDark ? 'bg-black/80 backdrop-blur-xl border-white/5' : 'bg-white/90 backdrop-blur-xl border-white/40') : (isDark ? 'bg-black/30 backdrop-blur-md border-white/5' : 'bg-white/50 backdrop-blur-md border-white/40')}`}>
            <div className="w-full flex justify-center items-center px-4">
               <span className={`text-[10px] font-medium block text-center w-full drop-shadow-sm ${isDark ? 'text-white/90' : 'text-gray-800'}`}>
                 O'zbekistondagi yagona platforma
               </span>
            </div>
          </div>

          {/* Mobil menyu */}
          {mobileOpen && (
            <div className={`md:hidden w-full backdrop-blur-xl border-b shadow-2xl p-4 absolute top-full left-0 mt-0.5 ${isDark ? 'bg-gray-900/95 border-white/10' : 'bg-white/95 border-gray-200'}`}>
               <nav className="flex flex-col gap-4">
                {navItems.map(item => (
                  <button key={item.id} onClick={() => scrollToSection(item.id)} className={`text-left text-[14px] font-bold uppercase tracking-tight py-2 border-b last:border-0 transition-colors ${isDark ? 'text-white hover:text-green-400 border-white/10' : 'text-gray-800 hover:text-green-600 border-gray-100'}`}>
                    {item.label}
                  </button>
                ))}
              </nav>
            </div>
          )}

        </header>

        {/* ASOSIY EKRAN (HERO) */}
        <section className="pb-16 sm:pb-20 px-4 text-center relative min-h-[90vh] flex flex-col justify-start">
          <div className="relative z-10">
            <div className={`inline-flex items-center gap-2 px-3 sm:px-4 py-2 backdrop-blur-md border rounded-full text-xs sm:text-sm font-bold mb-6 sm:mb-8 shadow-lg cursor-default transition-all ${isDark ? 'bg-white/10 border-white/20 text-green-300 hover:bg-white/20' : 'bg-white/60 border-white/60 text-green-700 hover:bg-white/80'}`}>
                <CheckCircle2 size={16} /> O'zbekistondagi yagona bog'dorchilikni raqamlashtirish platformasi.
            </div>
            
            <h1 className={`text-3xl sm:text-5xl md:text-6xl font-black mb-6 leading-tight max-w-5xl mx-auto drop-shadow-xl ${isDark ? 'text-white' : 'text-gray-900'}`}>
              <span className={`text-transparent bg-clip-text drop-shadow-md ${isDark ? 'bg-gradient-to-r from-green-400 to-green-200' : 'bg-gradient-to-r from-green-600 to-green-800'}`}>
                Hosilni to'liq raqamlashtirish vaqti keldi.
              </span>
            </h1>
            <p className={`text-base sm:text-lg max-w-3xl mx-auto mb-10 font-medium leading-relaxed drop-shadow-lg ${isDark ? 'text-white/90' : 'text-gray-800'}`}>
              Yo'qolgan ma'lumotlar, daftardagi xatolar va soatlab vaqt sarflanadigan hisob-kitoblarga barham bering. Barchasi uchun ushbu platforma yetarli.
            </p>
            
            <button onClick={() => setIsPricingPageOpen(true)} className="px-6 sm:px-8 py-3 sm:py-4 bg-green-600 text-white font-bold rounded-xl shadow-xl shadow-green-600/30 flex items-center gap-2 mx-auto hover:bg-green-500 transition-all hover:-translate-y-1 text-sm sm:text-base border border-green-500/50">
              Hoziroq boshlash <ArrowRight size={20} />
            </button>

            {/* DASHBOARD MOCKUP */}
            <div className="mt-12 sm:mt-16 relative max-w-5xl mx-auto group">
                <div className={`backdrop-blur-xl rounded-[2.5rem] sm:rounded-[3rem] p-3 sm:p-5 border-[2px] sm:border-[4px] relative transition-transform duration-500 group-hover:-translate-y-2 ${isDark ? 'bg-black/40 shadow-[0_30px_60px_rgba(0,0,0,0.6)] border-white/10' : 'bg-white/40 shadow-[0_20px_50px_rgba(0,0,0,0.15)] border-white/60'}`}>
                   
                   <div className={`absolute top-1.5 sm:top-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full hidden sm:block z-20 ${isDark ? 'bg-[#111] border border-white/10' : 'bg-gray-300 border border-gray-400'}`}></div>

                   <div className="bg-gray-50 rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden flex flex-col relative border border-gray-200 w-full h-full text-gray-900 shadow-inner">
                      <div className="h-10 sm:h-12 border-b border-gray-200 flex items-center px-4 gap-4 bg-white shrink-0">
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
                               <div className="text-lg sm:text-2xl font-black text-gray-800">2,450 <span className="text-xs sm:text-sm font-medium text-red-500">-120 qarzda</span></div>
                            </div>
                            <div className="bg-white rounded-xl border border-gray-200 p-3 sm:p-4 shadow-sm text-left">
                               <div className="text-[10px] sm:text-xs text-gray-500 font-bold uppercase mb-1 flex items-center gap-2"><TrendingUp size={14} className="text-blue-500"/> Qabul qilingan hosil</div>
                               <div className="text-lg sm:text-2xl font-black text-gray-800">48.5 <span className="text-xs sm:text-sm font-medium text-gray-500">tonna</span></div>
                            </div>
                            <div className="bg-white rounded-xl border border-gray-200 p-3 sm:p-4 shadow-sm hidden md:block text-left">
                               <div className="text-xs text-gray-500 font-bold uppercase mb-1 flex items-center gap-2"><Calculator size={14} className="text-purple-500"/> Bog'bonlarga to'lov</div>
                               <div className="text-2xl font-black text-gray-800">142M <span className="text-sm font-medium text-gray-500">so'm</span></div>
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
                
                <div className={`absolute -bottom-4 -right-2 sm:-bottom-8 sm:-right-8 backdrop-blur-xl p-3 sm:p-4 rounded-xl sm:rounded-2xl border animate-bounce z-20 ${isDark ? 'bg-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.5)] border-white/20' : 'bg-white/80 shadow-[0_10px_30px_rgba(0,0,0,0.1)] border-white/60'}`} style={{animationDuration: '3s'}}>
                  <div className="flex items-center gap-2 sm:gap-3 text-left">
                    <div className={`w-8 h-8 sm:w-12 sm:h-12 rounded-full flex items-center justify-center border ${isDark ? 'bg-green-500/20 text-green-400 border-green-400/30' : 'bg-green-100 text-green-600 border-green-200'}`}><ShieldCheck className="w-4 h-4 sm:w-6 sm:h-6" /></div>
                    <div><p className={`text-[9px] sm:text-xs font-bold uppercase ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>Ma'lumotlar</p><p className={`text-xs sm:text-sm font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>100% Xavfsiz</p></div>
                  </div>
                </div>
            </div>
          </div>
        </section>

        {/* 1-CHIZIQ */}
        <div className={`w-full h-px bg-gradient-to-r relative z-20 ${isDark ? 'from-transparent via-white/20 to-transparent' : 'from-transparent via-gray-300 to-transparent'}`}></div>

        {/* ZAMON BILAN HAMNAFAS BO'LING */}
        <section id="problems" className="py-16 sm:py-20 text-left overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
            <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-16">
              <h2 className={`text-3xl sm:text-4xl md:text-5xl font-black mb-3 sm:mb-4 tracking-tight px-2 drop-shadow-md ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Zamon bilan hamnafas bo'ling
              </h2>
              <p className={`text-base sm:text-lg md:text-xl font-medium max-w-2xl mx-auto leading-relaxed px-4 drop-shadow-md ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                Bu tizim sizni hozirgacha ketqazgan asab va daromadingizga davo bo'lishi mumkin.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 relative z-10">
              
              {/* Qizil karobka */}
              <div className={`backdrop-blur-xl rounded-3xl p-6 md:p-10 border relative overflow-hidden transition-all duration-300 ease-in-out hover:-translate-y-2 cursor-pointer group ${isDark ? 'bg-red-500/10 border-red-500/30 shadow-[0_8px_30px_rgb(239,68,68,0.15)] hover:shadow-[0_15px_40px_rgb(239,68,68,0.25)]' : 'bg-red-50/70 border-red-200 shadow-lg hover:shadow-xl hover:shadow-red-100'}`}>
                <div className={`absolute top-0 right-0 p-4 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-12 ${isDark ? 'opacity-10 text-red-400' : 'opacity-[0.03] text-red-700'}`}><XOctagon size={100} className="sm:w-[120px] sm:h-[120px]"/></div>
                <h3 className={`text-xl sm:text-2xl font-black mb-5 sm:mb-6 flex items-center gap-2 sm:gap-3 drop-shadow-sm ${isDark ? 'text-white' : 'text-red-700'}`}><XOctagon className={`w-6 h-6 sm:w-8 sm:h-8 ${isDark ? 'text-red-400' : 'text-red-500'}`} /> Hozirgi usul (Xavfi)</h3>
                <ul className={`space-y-4 sm:space-y-5 relative z-10 font-medium text-sm sm:text-base ${isDark ? 'text-gray-100' : 'text-gray-700'}`}>
                  <li className="flex gap-3 sm:gap-4"><span className={`font-bold drop-shadow-md ${isDark ? 'text-red-400' : 'text-red-500'}`}>✗</span><p><strong>Yo'qolgan daftarlar:</strong> Ma'lumotlarning aralashib ketishi yoki butunlay yo'qolish xavfi.</p></li>
                  <li className="flex gap-3 sm:gap-4"><span className={`font-bold drop-shadow-md ${isDark ? 'text-red-400' : 'text-red-500'}`}>✗</span><p><strong>Telefon va kalkulyatori:</strong> Soatlab kalkulyatorda mahsulotlarni hisoblash va bitta xato raqam tufayli qaytadan boshlash.</p></li>
                  <li className="flex gap-3 sm:gap-4"><span className={`font-bold drop-shadow-md ${isDark ? 'text-red-400' : 'text-red-500'}`}>✗</span><p><strong>Buxgalterga qaramlik:</strong> Faqatgina tushunadigan odamgina ma'lumotlarni kirita olishi. Jarayonlar inson omiliga qattiq bog'lanib qolishi.</p></li>
                </ul>
              </div>

              {/* Yashil karobka */}
              <div className={`backdrop-blur-xl rounded-3xl p-6 md:p-10 border relative overflow-hidden transition-all duration-300 ease-in-out hover:-translate-y-2 cursor-pointer group ${isDark ? 'bg-green-500/20 border-green-500/40 text-white shadow-[0_8px_30px_rgb(34,197,94,0.2)] hover:shadow-[0_15px_40px_rgb(34,197,94,0.3)]' : 'bg-green-50/70 border-green-300 text-gray-900 shadow-lg hover:shadow-xl hover:shadow-green-100'}`}>
                <div className={`absolute top-0 right-0 p-4 transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-12 ${isDark ? 'opacity-20 text-green-300' : 'opacity-[0.04] text-green-700'}`}><CheckCircle2 size={100} className="sm:w-[120px] sm:h-[120px]"/></div>
                <h3 className={`text-xl sm:text-2xl font-black mb-5 sm:mb-6 flex items-center gap-2 sm:gap-3 drop-shadow-md ${isDark ? 'text-white' : 'text-green-800'}`}><CheckCircle2 className={`w-6 h-6 sm:w-8 sm:h-8 ${isDark ? 'text-green-300' : 'text-green-600'}`} /> Hosil tizimi (Foydasi)</h3>
                <ul className={`space-y-4 sm:space-y-5 relative z-10 font-medium text-sm sm:text-base ${isDark ? 'text-gray-50' : 'text-gray-800'}`}>
                  <li className="flex gap-3 sm:gap-4"><span className={`font-bold text-lg drop-shadow-md ${isDark ? 'text-green-400' : 'text-green-600'}`}>✓</span><p><strong>Ma'lumotlar xavfsizligi:</strong> Hamma ma'lumotlar bulutli (cloud) serverda saqlanadi. Planshet sinsa ham ma'lumotlar joyida turadi.</p></li>
                  <li className="flex gap-3 sm:gap-4"><span className={`font-bold text-lg drop-shadow-md ${isDark ? 'text-green-400' : 'text-green-600'}`}>✓</span><p><strong>Avtomatlashtirilgan hisob:</strong> Tonna, narx, qarzdorlik tizimning o'zida avtomat hisoblanadi. Yakuniy xulosa tayyor holda chiqadi.</p></li>
                  <li className="flex gap-3 sm:gap-4"><span className={`font-bold text-lg drop-shadow-md ${isDark ? 'text-green-400' : 'text-green-600'}`}>✓</span><p><strong>Cheksiz arxiv:</strong> Yillar o'tsa ham qaysi bog'bon eng ko'p yuk berganini va o'tgan yilgi statistikani osongina topib olasiz.</p></li>
                  <li className="flex gap-3 sm:gap-4"><span className={`font-bold text-lg drop-shadow-md ${isDark ? 'text-green-400' : 'text-green-600'}`}>✓</span><p><strong>Tezlik va Aniqlikka intiluvchan tizim va sizning biznesingiz</strong> </p></li>
                </ul>
              </div>
              
            </div>
          </div>
        </section>

        {/* 2-CHIZIQ */}
        <div className={`w-full h-px bg-gradient-to-r relative z-20 ${isDark ? 'from-transparent via-white/20 to-transparent' : 'from-transparent via-gray-300 to-transparent'}`}></div>

        {/* JARAYONLAR LENTASI */}
        <section id="features" className="py-16 sm:py-20 overflow-hidden relative text-left">
          <div className="max-w-7xl mx-auto px-4 mb-10 sm:mb-12 text-center relative z-10">
            <h2 className={`text-3xl md:text-4xl font-black mb-3 sm:mb-4 tracking-tight drop-shadow-md ${isDark ? 'text-white' : 'text-gray-900'}`}>Butun jarayon bitta joyda</h2>
            <p className={`text-base sm:text-lg font-medium drop-shadow-sm ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>Dala chetidagi jarayondan tortib, xorijdagi xaridorga yetib borguncha to'liq nazorat.</p>
          </div>
          <div className={`w-full border-y backdrop-blur-sm py-10 sm:py-12 relative shadow-2xl overflow-hidden z-10 ${isDark ? 'bg-white/5 border-white/10' : 'bg-white/30 border-white/60'}`}>
            <div className="cursor-grab active:cursor-grabbing touch-pan-y"
              onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseUp}
              onTouchStart={(e) => onMouseDown({ pageX: e.touches[0].pageX })}
              onTouchMove={(e) => onMouseMove({ pageX: e.touches[0].pageX })} onTouchEnd={onMouseUp}>
              <div ref={trackRef} className="flex gap-4 sm:gap-6 w-max will-change-transform px-4">
                {carouselItems.map((item, index) => (
                  <div key={index} className={`w-[280px] sm:w-[350px] flex-shrink-0 backdrop-blur-xl rounded-2xl p-6 sm:p-8 border shadow-lg pointer-events-none select-none text-left transition-all ${isDark ? 'bg-white/10 border-white/20 hover:bg-white/20' : 'bg-white/60 border-white/60 hover:bg-white/80'}`}>
                    <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center mb-5 sm:mb-6 border ${isDark ? 'bg-green-500/20 text-green-400 border-green-400/30' : 'bg-green-100 text-green-600 border-green-200'}`}>{item.icon}</div>
                    <h3 className={`text-lg sm:text-xl font-bold mb-2 sm:mb-3 tracking-tight drop-shadow-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>{item.title}</h3>
                    <p className={`text-sm sm:text-base leading-relaxed font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 3-CHIZIQ */}
        <div className={`w-full h-px bg-gradient-to-r relative z-20 ${isDark ? 'from-transparent via-white/20 to-transparent' : 'from-transparent via-gray-300 to-transparent'}`}></div>

        {/* NEGA AYNAN HOSILIM? */}
        <section id="benefits" className="py-16 sm:py-20 overflow-hidden">
          <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12 px-4 relative z-10">
            <h2 className={`text-3xl md:text-4xl font-black mb-3 sm:mb-4 tracking-tight drop-shadow-md ${isDark ? 'text-white' : 'text-gray-900'}`}>
               Nega aynan <span className="text-green-500">Hosilim</span> tizimi?
            </h2>
            <p className={`text-base sm:text-lg font-medium drop-shadow-sm ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>Bu shunchaki dastur emas, bu sizning biznesingizdagi eng ishonchli xodimingiz.</p>
          </div>

          <div 
            className="w-full relative py-6 sm:py-8 cursor-grab active:cursor-grabbing touch-pan-y z-10"
            onMouseDown={onBMouseDown} onMouseMove={onBMouseMove} onMouseUp={onBMouseUp}
            onTouchStart={(e) => onBMouseDown({ pageX: e.touches[0].pageX })}
            onTouchMove={(e) => onBMouseMove({ pageX: e.touches[0].pageX })} onTouchEnd={onBMouseUp}
          >
            <div ref={bTrackRef} className="flex gap-4 sm:gap-6 w-max will-change-transform py-6 sm:py-10 px-4 sm:px-0 items-center">
              {infiniteBenefits.map((item, idx) => (
                <div 
                  key={idx}
                  data-hasbg={item.bgImage ? "true" : ""}
                  className={`w-[85vw] sm:w-[400px] md:w-[450px] flex-shrink-0 rounded-[24px] sm:rounded-3xl p-6 sm:p-10 border pointer-events-none select-none text-left relative overflow-hidden transition-all ${isDark ? 'border-white/20 shadow-[0_15px_40px_rgba(0,0,0,0.5)]' : 'border-white/60 shadow-[0_15px_40px_rgba(0,0,0,0.1)]'}`}
                  style={{
                    backgroundImage: item.bgImage ? `url(${item.bgImage})` : 'none',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                >
                  {/* XIRA OYNA EFFEKTI */}
                  {item.bgImage && <div className={`absolute inset-0 z-0 ${isDark ? 'bg-gray-900/30 backdrop-blur-[2px]' : 'bg-white/30 backdrop-blur-[2px]'}`}></div>}

                  <div className="relative z-10 flex flex-col items-start">
                    <div className="scale-75 sm:scale-100 origin-top-left">{item.icon}</div>
                    <h3 className={`text-xl sm:text-2xl font-black mb-3 sm:mb-4 tracking-tight drop-shadow-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>{item.title}</h3>
                    <p className={`text-sm sm:text-base leading-relaxed font-medium drop-shadow-md ${isDark ? 'text-gray-100' : 'text-gray-800'}`}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-center mt-6 relative z-10">
            <div className={`flex items-center gap-3 backdrop-blur-md border px-4 py-2.5 rounded-full ${isDark ? 'bg-black/40 border-white/10' : 'bg-white/50 border-white/60'}`}>
              {benefitsData.map((_, i) => (
                <button key={i} onClick={() => jumpToDot(i)}
                  className={`h-2 rounded-full transition-all duration-300 ${bActiveDot === i ? 'w-8 bg-green-500' : (isDark ? 'w-2 bg-white/30 hover:bg-white/50' : 'w-2 bg-gray-400/50 hover:bg-gray-400')}`}
                />
              ))}
              <div className={`w-[1px] h-4 mx-1 ${isDark ? 'bg-white/20' : 'bg-gray-300'}`}></div>
              <button onClick={() => setBIsPaused(!bIsPaused)} className={`w-6 h-6 flex items-center justify-center rounded-full transition-colors ${isDark ? 'text-white/70 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>
                {bIsPaused ? <Play size={14} fill="currentColor" /> : <Pause size={14} fill="currentColor" />}
              </button>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer id="contact" className={`backdrop-blur-2xl pt-16 pb-10 border-t relative z-20 transition-colors duration-500 ${isDark ? 'bg-black/60 border-white/20 text-white' : 'bg-white/60 border-white/40 text-gray-900'}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            
            <div className="flex flex-col min-h-[160px] md:min-h-[200px] mb-12 relative z-10">
              
              <h2 className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black tracking-tight leading-tight text-center w-full mb-8 md:mb-0 drop-shadow-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Biznesingizni yangi bosqichga <br className="hidden md:block"/> olib chiqing
              </h2>
              
              <div className="flex flex-col sm:flex-row gap-4 mt-auto md:justify-between items-center md:items-end pt-4 md:pt-0 w-full">
                <button 
                  onClick={() => setIsPricingPageOpen(true)} 
                  className="px-6 py-3.5 bg-green-600 text-white font-bold rounded-xl shadow-lg shadow-green-600/30 hover:bg-green-500 transition-all text-sm sm:text-base w-full max-w-[280px] sm:max-w-none sm:w-auto mx-auto sm:mx-0 border border-green-500/50 hover:-translate-y-1"
                >
                  Demo versiyani buyurtma qilish
                </button>
                <button 
                  className={`px-6 py-3.5 backdrop-blur-md border font-bold rounded-xl transition-all text-sm sm:text-base whitespace-nowrap w-full max-w-[280px] sm:max-w-none sm:w-auto mx-auto sm:mx-0 flex justify-center hover:-translate-y-1 ${isDark ? 'bg-white/10 text-white border-white/20 hover:bg-white/20' : 'bg-white/50 text-gray-900 border-white/60 hover:bg-white/80'}`}
                >
                  +998 91 777 01 37
                </button>
              </div>
              
            </div>

            <div className={`border-t pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm font-medium relative z-20 text-center md:text-left ${isDark ? 'border-white/10 text-gray-400' : 'border-gray-300 text-gray-600'}`}>
              <div className="flex items-center justify-center md:justify-start gap-3 w-full md:w-auto cursor-pointer" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
                <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center text-white shadow-lg shadow-green-500/30">
                  <img src="/logo-white.png" alt="Logo" className="w-5 h-5" />
                </div>
                <span className={`font-bold tracking-wide ${isDark ? 'text-white' : 'text-gray-900'}`}>Hosil.uz</span>
              </div>
              <div className="w-full md:w-auto">&copy; {new Date().getFullYear()} Barcha huquqlar himoyalangan.</div>
            </div>
            
          </div>
        </footer>
      </div>
      )}
    </div>
  );
};

export default HosilimLanding;