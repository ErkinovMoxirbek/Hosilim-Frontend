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

// Navigatsiya bo'limlari - aniq va lo'nda
const navItems = [
  { id: 'features', label: 'Imkoniyatlar' },
  { id: 'how-it-works', label: 'Qanday ishlaydi' },
  { id: 'benefits', label: 'Afzalliklar' },
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

  const handleLogin = () => {
    // Agar token bo'lsa dashboardga, bo'lmasa loginga
    const token = localStorage.getItem('authToken');
    navigate(token ? '/dashboard' : '/login');
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
              <span className="text-[10px] uppercase font-semibold text-green-700 tracking-wider">Broker tizimi</span>
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
              onClick={handleLogin}
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
              onClick={handleLogin}
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
            Brokerlar va Eksportchilar uchun maxsus
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-gray-900 mb-6 leading-tight max-w-5xl mx-auto">
            Buxgalterni unuting. <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-800">
              Biznesingizni avtomatlashtiring.
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            Hosilim — qabul punktidagi tarozi hisob-kitobidan tortib, ombor qoldig'i va eksport hujjatlarigacha boshqaradigan yagona tizim.
            Kuniga 3 soat vaqtingizni tejang.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={handleLogin}
              className="w-full sm:w-auto px-8 py-4 bg-green-600 text-white text-lg font-bold rounded-xl shadow-lg shadow-green-200 hover:bg-green-700 transition-all hover:-translate-y-1 flex items-center justify-center gap-2"
            >
              Hoziroq boshlash <ArrowRight size={20} />
            </button>
            <button 
              onClick={() => scrollToSection('how-it-works')}
              className="w-full sm:w-auto px-8 py-4 bg-white text-gray-700 border border-gray-200 text-lg font-bold rounded-xl hover:bg-gray-50 transition-all"
            >
              Qanday ishlaydi?
            </button>
          </div>

          {/* Mockup / Dashboard Preview */}
          <div className="mt-16 md:mt-24 relative max-w-5xl mx-auto">
            <div className="bg-gray-900 rounded-2xl p-2 shadow-2xl border border-gray-800">
               {/* Bu yerda Dashboardingizning haqiqiy skrinshoti bo'lishi kerak. Hozircha CSS bilan chizilgan sxema */}
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
                  {/* Fake UI Body */}
                  <div className="flex-1 flex p-6 gap-6">
                    <div className="w-64 hidden md:block space-y-3">
                      <div className="h-8 bg-green-100 rounded w-full"></div>
                      <div className="h-8 bg-gray-100 rounded w-3/4"></div>
                      <div className="h-8 bg-gray-100 rounded w-5/6"></div>
                    </div>
                    <div className="flex-1 space-y-4">
                      <div className="grid grid-cols-3 gap-4">
                        <div className="h-24 bg-blue-50 rounded-xl border border-blue-100 p-4">
                           <div className="text-xs text-blue-500 font-bold uppercase">Bugungi qabul</div>
                           <div className="text-2xl font-bold text-gray-800 mt-2">14.5 tonna</div>
                        </div>
                        <div className="h-24 bg-purple-50 rounded-xl border border-purple-100 p-4">
                           <div className="text-xs text-purple-500 font-bold uppercase">Ombor qoldig'i</div>
                           <div className="text-2xl font-bold text-gray-800 mt-2">128 tonna</div>
                        </div>
                        <div className="h-24 bg-green-50 rounded-xl border border-green-100 p-4">
                           <div className="text-xs text-green-500 font-bold uppercase">Fermerlardan qarz</div>
                           <div className="text-2xl font-bold text-gray-800 mt-2">Active</div>
                        </div>
                      </div>
                      <div className="h-64 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-center text-gray-400">
                        Grafik va jadvallar hududi
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
                  <p className="text-xs text-gray-500 font-medium">Avtomatik hisobot</p>
                  <p className="text-sm font-bold text-gray-900">Tayyor!</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- FEATURES (Broker Pain Points) --- */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Nega aynan Hosilim?
            </h2>
            <p className="text-lg text-gray-600">
              Chunki biz sizning muammolaringizni tushunamiz. Tizim qishloq xo'jaligi brokerlari talablari asosida ishlab chiqilgan.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-gray-50 rounded-2xl p-8 hover:bg-green-50 transition-colors group border border-transparent hover:border-green-100">
              <div className="w-14 h-14 bg-white rounded-xl shadow-sm flex items-center justify-center text-green-600 mb-6 group-hover:scale-110 transition-transform">
                <LayoutDashboard size={28} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Elektron "Daftar"</h3>
              <p className="text-gray-600 leading-relaxed">
                Qog'oz daftarlarda yozilgan hisoblar yo'qoladi yoki adashiladi. Tizimda har bir fermerning tarixi va yuklari xavfsiz saqlanadi.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-gray-50 rounded-2xl p-8 hover:bg-blue-50 transition-colors group border border-transparent hover:border-blue-100">
              <div className="w-14 h-14 bg-white rounded-xl shadow-sm flex items-center justify-center text-blue-600 mb-6 group-hover:scale-110 transition-transform">
                <Calculator size={28} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Avtomatik Hisob-kitob</h3>
              <p className="text-gray-600 leading-relaxed">
                Tarozi ma'lumotini kiriting, tizim o'zi pulini hisoblaydi. Kimdan qancha qarzingiz borligini bir tugma bilan ko'ring.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-gray-50 rounded-2xl p-8 hover:bg-purple-50 transition-colors group border border-transparent hover:border-purple-100">
              <div className="w-14 h-14 bg-white rounded-xl shadow-sm flex items-center justify-center text-purple-600 mb-6 group-hover:scale-110 transition-transform">
                <Warehouse size={28} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Ombor Nazorati</h3>
              <p className="text-gray-600 leading-relaxed">
                Qaysi fura qachon yuklandi? Omboringizda necha tonna mahsulot qoldi? Barchasi real vaqt rejimida.
              </p>
            </div>
             
             {/* Feature 4 */}
             <div className="bg-gray-50 rounded-2xl p-8 hover:bg-orange-50 transition-colors group border border-transparent hover:border-orange-100">
              <div className="w-14 h-14 bg-white rounded-xl shadow-sm flex items-center justify-center text-orange-600 mb-6 group-hover:scale-110 transition-transform">
                <Smartphone size={28} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Fermerlar uchun SMS/Bot</h3>
              <p className="text-gray-600 leading-relaxed">
                Fermerlarga har safar telefon qilib tushuntirish shart emas. Ular o'z yuklarini Telegram bot orqali kuzatib turishadi.
              </p>
            </div>

             {/* Feature 5 */}
             <div className="bg-gray-50 rounded-2xl p-8 hover:bg-teal-50 transition-colors group border border-transparent hover:border-teal-100">
              <div className="w-14 h-14 bg-white rounded-xl shadow-sm flex items-center justify-center text-teal-600 mb-6 group-hover:scale-110 transition-transform">
                <ShieldCheck size={28} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Xavfsizlik & Arxiv</h3>
              <p className="text-gray-600 leading-relaxed">
                Barcha ma'lumotlar bulutli texnologiyada saqlanadi. Telefoningiz yo'qolsa ham, hisob-kitobingiz yo'qolmaydi.
              </p>
            </div>

             {/* Feature 6 */}
             <div className="bg-gray-50 rounded-2xl p-8 hover:bg-red-50 transition-colors group border border-transparent hover:border-red-100">
              <div className="w-14 h-14 bg-white rounded-xl shadow-sm flex items-center justify-center text-red-600 mb-6 group-hover:scale-110 transition-transform">
                <FileText size={28} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Eksport Hujjatlari</h3>
              <p className="text-gray-600 leading-relaxed">
                Yuk xatlarini (nakladnoy) avtomatik generatsiya qilish. Eksport jarayonidagi qog'ozbozlikni kamaytiring.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --- HOW IT WORKS (Simplified) --- */}
      <section id="how-it-works" className="py-20 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Murakkab jarayonlarni <br/>
                <span className="text-green-400">soddalashtiramiz</span>
              </h2>
              <div className="space-y-8">
                {[
                  { title: 'Ro\'yxatdan o\'tish', desc: "Broker sifatida tizimga kiring va omboringizni yarating." },
                  { title: 'Yuk qabul qilish', desc: "Tarozi ma'lumotlarini telefonda kiriting. Fermerga SMS boradi." },
                  { title: 'Saralash va Saqlash', desc: "Mahsulotni navlarga ajrating va omborga joylang." },
                  { title: 'Sotish / Eksport', desc: "Xaridorni tanlang, narxni kelishing va foydani ko'ring." }
                ].map((step, idx) => (
                  <div key={idx} className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center font-bold text-green-400">
                      {idx + 1}
                    </div>
                    <div>
                      <h4 className="text-xl font-bold mb-2">{step.title}</h4>
                      <p className="text-gray-400">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
                {/* Visual representation of process */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-800 p-6 rounded-2xl opacity-50 translate-y-8">
                        <Users className="w-8 h-8 text-gray-400 mb-4" />
                        <div className="h-2 w-20 bg-gray-600 rounded mb-2"></div>
                        <div className="h-2 w-12 bg-gray-700 rounded"></div>
                    </div>
                    <div className="bg-gray-800 p-6 rounded-2xl bg-gradient-to-br from-green-900 to-gray-800 border border-green-800">
                        <TrendingUp className="w-8 h-8 text-green-400 mb-4" />
                        <div className="text-white font-bold text-lg">Foyda nazorati</div>
                        <div className="text-green-400 text-sm">Real vaqt rejimida</div>
                    </div>
                    <div className="bg-gray-800 p-6 rounded-2xl col-span-2">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-gray-400">Ombor holati</span>
                            <span className="text-green-400">95% to'la</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                            <div className="bg-green-500 h-2 rounded-full w-[95%]"></div>
                        </div>
                    </div>
                </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- STATS / BENEFITS --- */}
      <section id="benefits" className="py-20 bg-green-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-green-500/30">
                <div>
                    <div className="text-4xl font-bold text-white mb-2">3+ soat</div>
                    <div className="text-green-100 text-sm">Kuniga tejalgan vaqt</div>
                </div>
                <div>
                    <div className="text-4xl font-bold text-white mb-2">0 so'm</div>
                    <div className="text-green-100 text-sm">Ortiqcha buxgalteriya xarajati</div>
                </div>
                <div>
                    <div className="text-4xl font-bold text-white mb-2">100%</div>
                    <div className="text-green-100 text-sm">Hisob-kitob aniqligi</div>
                </div>
                <div>
                    <div className="text-4xl font-bold text-white mb-2">24/7</div>
                    <div className="text-green-100 text-sm">Tizimga kirish imkoniyati</div>
                </div>
            </div>
        </div>
      </section>

      {/* --- CTA / FOOTER --- */}
      <footer id="contact" className="bg-white border-t border-gray-200 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Ishni osonlashtirishga tayyormisiz?</h2>
            <p className="text-gray-600 mb-8 text-lg">
                Hozircha tizim yopiq rejimda ishlamoqda. Demo versiyani olish uchun administrator bilan bog'laning.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <button className="px-8 py-3 bg-gray-900 text-white font-bold rounded-lg hover:bg-gray-800 transition-colors w-full sm:w-auto">
                    +998 90 123 45 67
                </button>
                <button className="px-8 py-3 bg-white text-green-600 border border-green-600 font-bold rounded-lg hover:bg-green-50 transition-colors w-full sm:w-auto">
                    Telegramdan yozish
                </button>
            </div>
            <div className="mt-16 text-sm text-gray-400">
                &copy; {new Date().getFullYear()} Hosilim Platformasi. Barcha huquqlar himoyalangan.
            </div>
        </div>
      </footer>
    </div>
  );
};

export default HosilimLanding;