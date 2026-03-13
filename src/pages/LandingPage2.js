import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, 
  Calculator, 
  Warehouse, 
  Users, 
  TrendingUp, 
  CheckCircle2, 
  Menu, 
  X, 
  ArrowRight,
  ShieldCheck,
  Smartphone,
  FileText
} from 'lucide-react';

// Yangilangan navigatsiya bo'limlari
const navItems = [
  { id: 'problems', label: 'Muammolar' },
  { id: 'solution', label: 'Yechim' },
  { id: 'features', label: 'Imkoniyatlar' },
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'why', label: 'Nima uchun' },
  { id: 'pilot', label: 'Pilot' },
  { id: 'tech', label: 'Texnika' },
  { id: 'revenue', label: 'Daromad' },
  { id: 'contact', label: 'Bog\'lanish' }
];

const HosilimLanding = () => {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Scroll effekti uchun
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId) => {
    const el = document.getElementById(sectionId);
    if (el) {
      const headerOffset = 80;
      const elementPosition = el.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    }
    setMobileOpen(false);
  };

  const handleAuth = () => {
    // Agar token bo'lsa dashboardga, bo'lmasa loginga
    const token = localStorage.getItem('authToken');
    navigate(token ? '/dashboard' : '/auth');
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 overflow-x-hidden">
      
      {/* --- HEADER --- */}
      <header 
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          scrolled ? 'bg-white shadow-md py-3' : 'bg-transparent py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
            <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center text-white shadow-lg">
              <img src="/logo-white.png" alt="Hosilim Logo" className="w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-gray-900 leading-none">Hosilim</span>
              <span className="text-[10px] uppercase font-semibold text-green-700 tracking-wider">Agro Platforma</span>
            </div>
          </div>

          {/* Desktop Menu */}
          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className="text-sm font-medium text-gray-600 hover:text-green-600 transition-colors"
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Action Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <button 
              onClick={handleAuth}
              className="px-5 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
            >
              Tizimga kirish
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2 text-gray-600"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Dropdown */}
        {mobileOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-white border-t border-gray-100 shadow-xl py-4 px-4 flex flex-col gap-4">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className="text-left py-2 font-medium text-gray-700 border-b border-gray-100 last:border-0"
              >
                {item.label}
              </button>
            ))}
            <button 
              onClick={handleAuth}
              className="w-full py-3 bg-green-600 text-white font-bold rounded-lg mt-2"
            >
              Tizimga kirish
            </button>
          </div>
        )}
      </header>

      {/* --- HERO SECTION --- */}
      <section className="pt-32 pb-20 lg:pt-48 lg:pb-32 px-4 relative overflow-hidden">
        {/* Orqa fon bezaklari */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-green-100 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-blue-100 rounded-full blur-3xl opacity-50"></div>

        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-100 rounded-full text-green-700 text-sm font-semibold mb-8 animate-fade-in-up">
            <CheckCircle2 size={16} />
            Qishloq xo‘jaligi uchun raqamli yechim
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-gray-900 mb-6 leading-tight max-w-5xl mx-auto">
            Hosilim.uz — Qishloq xo‘jaligi aylanmasini to‘liq raqamlashtirish platformasi
          </h1>
          
          <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            Bog‘bon, broker va hokimiyatni yagona agro-statistika tizimiga birlashtiramiz.
          </p>

          <ul className="list-disc list-inside text-left max-w-2xl mx-auto mb-10 text-gray-600 text-lg">
            <li>Real vaqt hosil nazorati</li>
            <li>Shaffof hisob-kitob</li>
            <li>Hududiy agro statistika dashboard</li>
          </ul>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={() => scrollToSection('pilot')}
              className="w-full sm:w-auto px-8 py-4 bg-green-600 text-white text-lg font-bold rounded-xl shadow-lg shadow-green-200 hover:bg-green-700 transition-all hover:-translate-y-1 flex items-center justify-center gap-2"
            >
              Pilot boshlash <ArrowRight size={20} />
            </button>
            <button 
              onClick={() => scrollToSection('solution')}
              className="w-full sm:w-auto px-8 py-4 bg-white text-gray-700 border border-gray-200 text-lg font-bold rounded-xl hover:bg-gray-50 transition-all"
            >
              Tizim haqida
            </button>
          </div>

          {/* Mockup / Dashboard Preview - Yangi ma'lumotlar asosida to'g'rilangan */}
          <div className="mt-16 md:mt-24 relative max-w-5xl mx-auto">
            <div className="bg-gray-900 rounded-2xl p-2 shadow-2xl border border-gray-800">
               {/* Fake UI yangilangan */}
               <div className="bg-white rounded-xl overflow-hidden aspect-[16/9] flex flex-col relative">
                  {/* Fake UI Header */}
                  <div className="h-12 border-b flex items-center px-4 gap-4 bg-gray-50">
                    <div className="flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-400"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                      <div className="w-3 h-3 rounded-full bg-green-400"></div>
                    </div>
                    <div className="h-2 w-32 bg-gray-200 rounded-full"></div>
                  </div>
                  {/* Fake UI Body - Agro dashboardga moslashtirilgan */}
                  <div className="flex-1 flex p-6 gap-6">
                    <div className="w-64 hidden md:block space-y-3">
                      <div className="h-8 bg-green-100 rounded w-full"></div>
                      <div className="h-8 bg-gray-100 rounded w-3/4"></div>
                      <div className="h-8 bg-gray-100 rounded w-5/6"></div>
                    </div>
                    <div className="flex-1 space-y-4">
                      <div className="grid grid-cols-3 gap-4">
                        <div className="h-24 bg-blue-50 rounded-xl border border-blue-100 p-4">
                           <div className="text-xs text-blue-500 font-bold uppercase">Hududiy hosil</div>
                           <div className="text-2xl font-bold text-gray-800 mt-2">250 tonna</div>
                        </div>
                        <div className="h-24 bg-purple-50 rounded-xl border border-purple-100 p-4">
                           <div className="text-xs text-purple-500 font-bold uppercase">Eksport hajmi</div>
                           <div className="text-2xl font-bold text-gray-800 mt-2">45%</div>
                        </div>
                        <div className="h-24 bg-green-50 rounded-xl border border-green-100 p-4">
                           <div className="text-xs text-green-500 font-bold uppercase">Statistika</div>
                           <div className="text-2xl font-bold text-gray-800 mt-2">Real vaqt</div>
                        </div>
                      </div>
                      <div className="h-64 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-center text-gray-400">
                        Agro grafiklar va statistika
                      </div>
                    </div>
                  </div>
               </div>
            </div>
            {/* Floating Badge */}
            <div className="absolute -bottom-6 -right-6 md:bottom-10 md:-right-10 bg-white p-4 rounded-xl shadow-xl border border-gray-100 animate-bounce delay-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                  <FileText size={20} />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Statistika hisoboti</p>
                  <p className="text-sm font-bold text-gray-900">Tayyor!</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- MUAMMO BLOKI --- */}
      <section id="problems" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Bugungi tizimda nima muammo bor?
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-gray-50 rounded-2xl p-8 hover:bg-red-50 transition-colors group border border-transparent hover:border-red-100">
              <div className="w-14 h-14 bg-white rounded-xl shadow-sm flex items-center justify-center text-red-600 mb-6 group-hover:scale-110 transition-transform">
                <Calculator size={28} />
              </div>
              <p className="text-gray-600 leading-relaxed">Hisob-kitoblar qo‘lda yuritiladi</p>
            </div>
            <div className="bg-gray-50 rounded-2xl p-8 hover:bg-red-50 transition-colors group border border-transparent hover:border-red-100">
              <div className="w-14 h-14 bg-white rounded-xl shadow-sm flex items-center justify-center text-red-600 mb-6 group-hover:scale-110 transition-transform">
                <Users size={28} />
              </div>
              <p className="text-gray-600 leading-relaxed">Fermer pulini 7–10 kun kutadi</p>
            </div>
            <div className="bg-gray-50 rounded-2xl p-8 hover:bg-red-50 transition-colors group border border-transparent hover:border-red-100">
              <div className="w-14 h-14 bg-white rounded-xl shadow-sm flex items-center justify-center text-red-600 mb-6 group-hover:scale-110 transition-transform">
                <TrendingUp size={28} />
              </div>
              <p className="text-gray-600 leading-relaxed">Broker statistikani aniq ko‘ra olmaydi</p>
            </div>
            <div className="bg-gray-50 rounded-2xl p-8 hover:bg-red-50 transition-colors group border border-transparent hover:border-red-100">
              <div className="w-14 h-14 bg-white rounded-xl shadow-sm flex items-center justify-center text-red-600 mb-6 group-hover:scale-110 transition-transform">
                <LayoutDashboard size={28} />
              </div>
              <p className="text-gray-600 leading-relaxed">Davlatda real vaqt ma’lumot yo‘q</p>
            </div>
            <div className="bg-gray-50 rounded-2xl p-8 hover:bg-red-50 transition-colors group border border-transparent hover:border-red-100">
              <div className="w-14 h-14 bg-white rounded-xl shadow-sm flex items-center justify-center text-red-600 mb-6 group-hover:scale-110 transition-transform">
                <Warehouse size={28} />
              </div>
              <p className="text-gray-600 leading-relaxed">Eksport hajmi taxminiy hisoblanadi</p>
            </div>
          </div>
          <div className="text-center mt-8">
            <p className="text-xl font-bold text-gray-900">Ma’lumot yo‘q joyda nazorat yo‘q.</p>
          </div>
        </div>
      </section>

      {/* --- YECHIM BLOKI --- */}
      <section id="solution" className="py-20 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Hosilim.uz qanday ishlaydi?
            </h2>
          </div>
          <div className="space-y-8">
            {[
              { title: 'Bog‘lar ro‘yxatdan o‘tkaziladi', desc: '(geolokatsiya, maydon, hosil turi)', icon: <Smartphone size={28} /> },
              { title: 'Brokerlar tizimga ulanadi', desc: '', icon: <Users size={28} /> },
              { title: 'Har bir topshirilgan mahsulot raqamlashtiriladi', desc: '', icon: <FileText size={28} /> },
              { title: 'Hokimiyat real vaqt statistikani ko‘radi', desc: '', icon: <LayoutDashboard size={28} /> }
            ].map((step, idx) => (
              <div key={idx} className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center font-bold text-green-400">
                  {idx + 1}
                </div>
                <div className="w-14 h-14 flex items-center justify-center text-green-400">
                  {step.icon}
                </div>
                <div>
                  <h4 className="text-xl font-bold mb-2">{step.title}</h4>
                  <p className="text-gray-400">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- PLATFORMA IMKONIYATLARI --- */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Platforma imkoniyatlari
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-50 rounded-2xl p-8 hover:bg-green-50 transition-colors group border border-transparent hover:border-green-100">
              <div className="w-14 h-14 bg-white rounded-xl shadow-sm flex items-center justify-center text-green-600 mb-6 group-hover:scale-110 transition-transform">
                <Users size={28} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Fermer uchun:</h3>
              <ul className="list-disc list-inside text-gray-600">
                <li>Real vaqt topshirilgan mahsulot nazorati</li>
                <li>To‘lov kuzatuvi</li>
                <li>Hosil tarixi</li>
                <li>Bozor narx statistikasi</li>
              </ul>
            </div>
            <div className="bg-gray-50 rounded-2xl p-8 hover:bg-blue-50 transition-colors group border border-transparent hover:border-blue-100">
              <div className="w-14 h-14 bg-white rounded-xl shadow-sm flex items-center justify-center text-blue-600 mb-6 group-hover:scale-110 transition-transform">
                <Calculator size={28} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Broker uchun:</h3>
              <ul className="list-disc list-inside text-gray-600">
                <li>Kunlik qabul hisoboti</li>
                <li>Muzlatgich bandligi nazorati</li>
                <li>Daromad tahlili</li>
                <li>Avtomatik hisob-kitob</li>
              </ul>
            </div>
            <div className="bg-gray-50 rounded-2xl p-8 hover:bg-purple-50 transition-colors group border border-transparent hover:border-purple-100">
              <div className="w-14 h-14 bg-white rounded-xl shadow-sm flex items-center justify-center text-purple-600 mb-6 group-hover:scale-110 transition-transform">
                <ShieldCheck size={28} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Hokimiyat uchun:</h3>
              <ul className="list-disc list-inside text-gray-600">
                <li>Hududiy hosil prognozi</li>
                <li>Eksport statistikasi</li>
                <li>Broker aylanmasi</li>
                <li>Soliq bazasi tahlili</li>
                <li>Subsidiya monitoringi</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* --- AGRO DASHBOARD BLOKI --- */}
      <section id="dashboard" className="py-20 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Hududiy Agro Monitoring Paneli
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 text-gray-400">
            <div className="bg-gray-800 rounded-2xl p-8">
              <p>Qaysi hududda qancha hosil mavjud</p>
            </div>
            <div className="bg-gray-800 rounded-2xl p-8">
              <p>Qaysi nav ko‘p yetishtirilmoqda</p>
            </div>
            <div className="bg-gray-800 rounded-2xl p-8">
              <p>Qancha mahsulot eksportga chiqdi</p>
            </div>
            <div className="bg-gray-800 rounded-2xl p-8">
              <p>O‘rtacha narx dinamikasi</p>
            </div>
            <div className="bg-gray-800 rounded-2xl p-8">
              <p>Muzlatgich quvvati yetarlimi yoki yo‘q</p>
            </div>
          </div>
          <div className="text-center mt-8">
            <p className="font-bold text-white">Bu hokimiyat uchun boshqaruv vositasi.</p>
          </div>
        </div>
      </section>

      {/* --- NIMA UCHUN HOSILIM --- */}
      <section id="why" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Nima uchun Hosilim?
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-gray-50 rounded-2xl p-8 hover:bg-green-50 transition-colors group border border-transparent hover:border-green-100">
              <div className="w-14 h-14 bg-white rounded-xl shadow-sm flex items-center justify-center text-green-600 mb-6 group-hover:scale-110 transition-transform">
                <ShieldCheck size={28} />
              </div>
              <p className="text-gray-600 leading-relaxed">Shaffoflik</p>
            </div>
            <div className="bg-gray-50 rounded-2xl p-8 hover:bg-green-50 transition-colors group border border-transparent hover:border-green-100">
              <div className="w-14 h-14 bg-white rounded-xl shadow-sm flex items-center justify-center text-green-600 mb-6 group-hover:scale-110 transition-transform">
                <LayoutDashboard size={28} />
              </div>
              <p className="text-gray-600 leading-relaxed">Raqamli nazorat</p>
            </div>
            <div className="bg-gray-50 rounded-2xl p-8 hover:bg-green-50 transition-colors group border border-transparent hover:border-green-100">
              <div className="w-14 h-14 bg-white rounded-xl shadow-sm flex items-center justify-center text-green-600 mb-6 group-hover:scale-110 transition-transform">
                <TrendingUp size={28} />
              </div>
              <p className="text-gray-600 leading-relaxed">Eksportni oshirish</p>
            </div>
            <div className="bg-gray-50 rounded-2xl p-8 hover:bg-green-50 transition-colors group border border-transparent hover:border-green-100">
              <div className="w-14 h-14 bg-white rounded-xl shadow-sm flex items-center justify-center text-green-600 mb-6 group-hover:scale-110 transition-transform">
                <Warehouse size={28} />
              </div>
              <p className="text-gray-600 leading-relaxed">Qishloq iqtisodini kuchaytirish</p>
            </div>
            <div className="bg-gray-50 rounded-2xl p-8 hover:bg-green-50 transition-colors group border border-transparent hover:border-green-100">
              <div className="w-14 h-14 bg-white rounded-xl shadow-sm flex items-center justify-center text-green-600 mb-6 group-hover:scale-110 transition-transform">
                <Calculator size={28} />
              </div>
              <p className="text-gray-600 leading-relaxed">Ma’lumotga asoslangan qarorlar</p>
            </div>
          </div>
        </div>
      </section>

      {/* --- PILOT TAKLIFI --- */}
      <section id="pilot" className="py-20 bg-green-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Pilot taklifi
            </h2>
          </div>
          <div className="text-center">
            <p>1 tuman uchun pilot:</p>
            <ul className="list-disc list-inside mx-auto max-w-md text-left">
              <li>100 fermer</li>
              <li>10 broker</li>
              <li>3 muzlatgich</li>
              <li>6 oy test</li>
            </ul>
            <p className="mt-4">Natija: To‘liq agro-statistika shakllanadi.</p>
          </div>
        </div>
      </section>

      {/* --- TEXNIK QISM --- */}
      <section id="tech" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Texnik qism
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-gray-50 rounded-2xl p-8 hover:bg-blue-50 transition-colors group border border-transparent hover:border-blue-100">
              <div className="w-14 h-14 bg-white rounded-xl shadow-sm flex items-center justify-center text-blue-600 mb-6 group-hover:scale-110 transition-transform">
                <Smartphone size={28} />
              </div>
              <p className="text-gray-600 leading-relaxed">Cloud infratuzilma</p>
            </div>
            <div className="bg-gray-50 rounded-2xl p-8 hover:bg-blue-50 transition-colors group border border-transparent hover:border-blue-100">
              <div className="w-14 h-14 bg-white rounded-xl shadow-sm flex items-center justify-center text-blue-600 mb-6 group-hover:scale-110 transition-transform">
                <Smartphone size={28} />
              </div>
              <p className="text-gray-600 leading-relaxed">Mobil ilova (Android)</p>
            </div>
            <div className="bg-gray-50 rounded-2xl p-8 hover:bg-blue-50 transition-colors group border border-transparent hover:border-blue-100">
              <div className="w-14 h-14 bg-white rounded-xl shadow-sm flex items-center justify-center text-blue-600 mb-6 group-hover:scale-110 transition-transform">
                <LayoutDashboard size={28} />
              </div>
              <p className="text-gray-600 leading-relaxed">Web dashboard</p>
            </div>
            <div className="bg-gray-50 rounded-2xl p-8 hover:bg-blue-50 transition-colors group border border-transparent hover:border-blue-100">
              <div className="w-14 h-14 bg-white rounded-xl shadow-sm flex items-center justify-center text-blue-600 mb-6 group-hover:scale-110 transition-transform">
                <FileText size={28} />
              </div>
              <p className="text-gray-600 leading-relaxed">Real vaqt ma’lumot bazasi</p>
            </div>
            <div className="bg-gray-50 rounded-2xl p-8 hover:bg-blue-50 transition-colors group border border-transparent hover:border-blue-100">
              <div className="w-14 h-14 bg-white rounded-xl shadow-sm flex items-center justify-center text-blue-600 mb-6 group-hover:scale-110 transition-transform">
                <ShieldCheck size={28} />
              </div>
              <p className="text-gray-600 leading-relaxed">API integratsiya imkoniyati</p>
            </div>
          </div>
        </div>
      </section>

      {/* --- DAROMAD MODELI --- */}
      <section id="revenue" className="py-20 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Daromad modeli
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gray-800 rounded-2xl p-8 hover:bg-green-900 transition-colors">
              <p className="text-gray-400 leading-relaxed">Broker tranzaksiya foizi (0.5–1%)</p>
            </div>
            <div className="bg-gray-800 rounded-2xl p-8 hover:bg-green-900 transition-colors">
              <p className="text-gray-400 leading-relaxed">Premium analitika</p>
            </div>
            <div className="bg-gray-800 rounded-2xl p-8 hover:bg-green-900 transition-colors">
              <p className="text-gray-400 leading-relaxed">Eksportchilar uchun data</p>
            </div>
            <div className="bg-gray-800 rounded-2xl p-8 hover:bg-green-900 transition-colors">
              <p className="text-gray-400 leading-relaxed">Bank integratsiyasi</p>
            </div>
          </div>
        </div>
      </section>

      {/* --- CTA / FOOTER --- */}
      
    </div>
  );
};

export default HosilimLanding;