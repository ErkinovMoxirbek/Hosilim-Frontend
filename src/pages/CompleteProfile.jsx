import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { completeUserProfile } from "../services/profileService";
import { useAuth } from "../hooks/useAuth";
import { clearAuth } from "../utils/tokenManager";
import { Loader2, User, MapPin, CheckCircle2, Home, ChevronDown, Map, ChevronLeft } from "lucide-react";

// O'zbekiston hududlari bazasi
const regionsData = {
  "Andijon": ["Andijon", "Asaka", "Baliqchi", "Bo'ston", "Buloqboshi", "Izboskan", "Jalaquduq", "Marxamat", "Oltinko'l", "Paxtaobod", "Qo'rg'ontepa", "Shahrixon", "Ulug'nor", "Xo'jaobod"],
  "Buxoro": ["Buxoro", "G'ijduvon", "Jondor", "Kogon", "Olot", "Peshku", "Qorako'l", "Qorovulbozor", "Romitan", "Shofirkon", "Vobkent"],
  "Farg'ona": ["Beshariq", "Bog'dod", "Buvayda", "Dang'ara", "Farg'ona", "Furqat", "Oltiariq", "O'zbekiston", "Qo'qon", "Qo'shtepa", "Quva", "Rishton", "So'x", "Toshloq", "Uchko'prik", "Yozyovon"],
  "Jizzax": ["Arnasoy", "Baxmal", "Do'stlik", "Forish", "G'allaorol", "Mirzacho'l", "Paxtakor", "Sharof Rashidov", "Yangiobod", "Zafarobod", "Zarbdor", "Zomin"],
  "Namangan": ["Chortoq", "Chust", "Kosonsoy", "Mingbuloq", "Namangan", "Norin", "Pop", "To'raqo'rg'on", "Uchqo'rg'on", "Uychi", "Yangiqo'rg'on"],
  "Navoiy": ["Karmana", "Konimex", "Navbahor", "Nurota", "Qiziltepa", "Tomdi", "Uchquduq", "Xatirchi"],
  "Qashqadaryo": ["Chiroqchi", "Dehqonobod", "G'uzor", "Kasbi", "Kitob", "Ko'kdala", "Koson", "Mirishkor", "Muborak", "Nishon", "Qamashi", "Qarshi", "Yakkabog'"],
  "Qoraqalpog'iston": ["Amudaryo", "Beruniy", "Bo'zatov", "Chimboy", "Ellikqal'a", "Kegeyli", "Mo'ynoq", "Nukus", "Qanliko'l", "Qo'ng'irot", "Qorao'zak", "Shumanay", "Taxiatosh", "Taxtako'pir", "To'rtko'l", "Xo'jayli"],
  "Samarqand": ["Bulung'ur", "Ishtixon", "Jomboy", "Kattaqo'rg'on", "Narpay", "Nurobod", "Oqdaryo", "Pastdarg'om", "Paxtachi", "Payariq", "Qo'shrabot", "Samarqand", "Toyloq", "Urgut"],
  "Sirdaryo": ["Boyovut", "Guliston", "Mirzaobod", "Oqoltin", "Sardoba", "Sayxunobod", "Sirdaryo", "Xovos"],
  "Surxondaryo": ["Angor", "Bandixon", "Boysun", "Denov", "Jarqo'rg'on", "Muzrabot", "Oltinsoy", "Qiziriq", "Qumqo'rg'on", "Sariosiyo", "Sherobod", "Sho'rchi", "Termiz", "Uzun"],
  "Toshkent viloyati": ["Bekobod", "Bo'ka", "Bo'stonliq", "Chinoz", "Ohangaron", "Oqqo'rg'on", "O'rtachirchiq", "Parkent", "Piskent", "Qibray", "Quyichirchiq", "Toshkent", "Yangiyo'l", "Yuqorichirchiq", "Zangiota"],
  "Xorazm": ["Bog'ot", "Gurlan", "Xonqa", "Hazorasp", "Khiva", "Qo'shko'pir", "Shovot", "Urganch", "Yangiariq", "Yangibozor", "Tuproqqal'a"],
  "Toshkent shahri": ["Bektemir", "Chilanzar", "Yashnobod", "Mirobod", "Mirzo Ulugbek", "Sergeli", "Shayxontoxur", "Olmazor", "Uchtepa", "Yakkasaray", "Yunusabad", "Yangihayot"]
};

export default function CompleteProfile() {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  
  const [formData, setFormData] = useState({
    name: "",
    surname: "",
    region: "",
    district: "",
    village: "",
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeDropdown, setActiveDropdown] = useState(null); 

  // 🚀 MUHIM: Tashqarini bosganda menyuni yopish mexanizmi (PARDASIZ USUL)
  const regionRef = useRef(null);
  const districtRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (activeDropdown === 'region' && regionRef.current && !regionRef.current.contains(event.target)) {
        setActiveDropdown(null);
      }
      if (activeDropdown === 'district' && districtRef.current && !districtRef.current.contains(event.target)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [activeDropdown]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRegionSelect = (regionName) => {
    setFormData(prev => ({ ...prev, region: regionName, district: "" }));
    setActiveDropdown('district'); // Viloyatdan so'ng darhol tumanni ochish
  };

  const handleDistrictSelect = (districtName) => {
    setFormData(prev => ({ ...prev, district: districtName }));
    setActiveDropdown(null); 
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.name || !formData.surname || !formData.region || !formData.district || !formData.village) {
      setError("Iltimos, barcha maydonlarni to'ldiring.");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        name: formData.name,
        surname: formData.surname,
        location: `${formData.region}, ${formData.district}`,
        village: formData.village
      };

      await completeUserProfile(payload);
      
      if (refreshUser) {
        await refreshUser(); 
      } else {
        window.location.reload();
      }
      
    } catch (err) {
      setError(err.message || "Xatolik yuz berdi. Qayta urinib ko'ring.");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    try { clearAuth(); } catch (e) { console.error(e); }
    navigate("/");
  };

  return (
    <div 
      className="min-h-screen flex flex-col font-sans relative bg-cover bg-center bg-no-repeat bg-fixed text-gray-100"
      style={{ backgroundImage: "url('/assets/peach.jpg')" }}
    >
      <style>{`
        input:-webkit-autofill, input:-webkit-autofill:hover, input:-webkit-autofill:focus, input:-webkit-autofill:active {
            -webkit-box-shadow: 0 0 0 30px #111111 inset !important;
            -webkit-text-fill-color: #ffffff !important;
            transition: background-color 5000s ease-in-out 0s;
        }
        .custom-scroll::-webkit-scrollbar { width: 6px; }
        .custom-scroll::-webkit-scrollbar-track { background: rgba(255,255,255,0.02); border-radius: 10px; }
        .custom-scroll::-webkit-scrollbar-thumb { background: rgba(34,197,94,0.4); border-radius: 10px; }
        .custom-scroll::-webkit-scrollbar-thumb:hover { background: rgba(34,197,94,0.8); }
      `}</style>

      {/* Orqa fon qora parda */}
      <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm z-0 pointer-events-none"></div>

      {/* HEADER */}
      <header className="relative z-10 bg-black/20 backdrop-blur-md border-b border-white/10 py-4">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={handleBack}>
            <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center text-white shadow-lg shadow-green-500/30">
              <img src="/logo-white.png" alt="Logo" className="w-6 h-6" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-xl font-bold text-white drop-shadow-md">Hosilim</span>
              <span className="text-[10px] uppercase font-bold text-green-400 tracking-wider mt-1">
                Broker tizimi
              </span>
            </div>
          </div>
          
          <button 
            onClick={handleBack} 
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors border border-white/10"
            title="Orqaga qaytish"
          >
            <ChevronLeft size={24} />
          </button>
        </div>
      </header>

      {/* ASOSIY QISM */}
      <main className="flex-1 flex flex-col items-center justify-start p-4 relative z-10 py-10 w-full max-w-5xl mx-auto">
        
        <div className="text-center mb-10 w-full">
          <div className="w-16 h-16 bg-green-500/20 border border-green-500/30 text-green-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <User size={32} />
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-white">Xush kelibsiz!</h2>
          <p className="text-gray-300 mt-2 text-sm font-medium">
            Tizimdan to'liq foydalanish uchun shaxsiy ma'lumotlarigizni kiriting.
          </p>
        </div>

        {error && (
          <div className="mb-8 w-full max-w-lg bg-red-500/20 text-red-200 p-4 rounded-xl text-sm font-medium border border-red-500/30 text-center">
            {error}
          </div>
        )}

        {/* 🚀 FORM: IKKITA ALOHIDA KARTA (MD da yonma-yon, Mobile da ketma-ket) */}
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-8">
          
          <div className="flex flex-col md:flex-row gap-6 lg:gap-10 w-full">
            
            {/* CHAP KARTA: Shaxsiy ma'lumotlar */}
            <div className="flex-1 bg-black/40 backdrop-blur-2xl border border-white/20 shadow-[0_30px_60px_rgba(0,0,0,0.6)] rounded-[2.5rem] p-8">
              <h3 className="text-lg font-bold text-white mb-6 border-b border-white/10 pb-3">Shaxsiy ma'lumotlar</h3>
              
              <div className="space-y-6">
                <div className="relative group">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 mb-2 block focus-within:text-green-400">
                    Ism
                  </label>
                  <div className="flex items-center w-full bg-black/60 border border-white/10 rounded-xl overflow-hidden focus-within:border-green-500 focus-within:bg-black/80 transition-all duration-300">
                    <div className="px-4 text-gray-500"><User size={18} /></div>
                    <input
                      type="text"
                      name="name"
                      autoComplete="off"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full bg-transparent border-none outline-none text-white text-base font-bold py-4 pr-4 placeholder:text-gray-600"
                      placeholder="Ismingizni kiriting"
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="relative group">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 mb-2 block focus-within:text-green-400">
                    Familiya
                  </label>
                  <div className="flex items-center w-full bg-black/60 border border-white/10 rounded-xl overflow-hidden focus-within:border-green-500 focus-within:bg-black/80 transition-all duration-300">
                    <div className="px-4 text-gray-500"><User size={18} /></div>
                    <input
                      type="text"
                      name="surname"
                      autoComplete="off"
                      value={formData.surname}
                      onChange={handleChange}
                      className="w-full bg-transparent border-none outline-none text-white text-base font-bold py-4 pr-4 placeholder:text-gray-600"
                      placeholder="Familiyangizni kiriting"
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* O'NG KARTA: Manzil ma'lumotlari */}
            <div className="flex-1 bg-black/40 backdrop-blur-2xl border border-white/20 shadow-[0_30px_60px_rgba(0,0,0,0.6)] rounded-[2.5rem] p-8">
              <h3 className="text-lg font-bold text-white mb-6 border-b border-white/10 pb-3">Manzil ma'lumotlari</h3>
              
              <div className="space-y-6">
                {/* VILOYAT */}
                <div className="relative z-50" ref={regionRef}>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 mb-2 block">
                    Viloyat
                  </label>
                  <div 
                    onClick={() => { if (!loading) setActiveDropdown(activeDropdown === 'region' ? null : 'region'); }}
                    className={`flex items-center justify-between w-full bg-black/60 border rounded-xl overflow-hidden cursor-pointer transition-all duration-300 ${activeDropdown === 'region' ? 'border-green-500 bg-black/80' : 'border-white/10 hover:border-white/30'}`}
                  >
                    <div className="flex items-center w-full pointer-events-none">
                      <div className="px-4 text-gray-500"><Map size={18} /></div>
                      <div className="w-full py-4 pr-4">
                        {formData.region ? (
                          <span className="text-white text-base font-bold">{formData.region}</span>
                        ) : (
                          <span className="text-gray-600 text-base font-medium">Viloyatni tanlang</span>
                        )}
                      </div>
                    </div>
                    <ChevronDown size={20} className={`text-gray-500 mr-4 transition-transform duration-300 ${activeDropdown === 'region' ? 'rotate-180' : ''}`} />
                  </div>

                  {activeDropdown === 'region' && (
                    <div className="absolute top-[105%] left-0 w-full bg-gray-900/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden flex flex-col z-50">
                      <div className="max-h-[220px] overflow-y-auto custom-scroll">
                        {Object.keys(regionsData).map((region, idx) => (
                          <div 
                            key={idx} 
                            onClick={() => handleRegionSelect(region)}
                            className="px-5 py-4 hover:bg-green-500/20 text-white font-medium cursor-pointer border-b border-white/5 last:border-0 transition-colors"
                          >
                            {region}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* TUMAN */}
                {formData.region && (
                  <div className="relative z-40 animate-in fade-in slide-in-from-top-2 duration-300" ref={districtRef}>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 mb-2 block">
                      Tuman (Shahar)
                    </label>
                    <div 
                      onClick={() => { if (!loading) setActiveDropdown(activeDropdown === 'district' ? null : 'district'); }}
                      className={`flex items-center justify-between w-full bg-black/60 border rounded-xl overflow-hidden cursor-pointer transition-all duration-300 ${activeDropdown === 'district' ? 'border-green-500 bg-black/80' : 'border-white/10 hover:border-white/30'}`}
                    >
                      <div className="flex items-center w-full pointer-events-none">
                        <div className="px-4 text-gray-500"><MapPin size={18} /></div>
                        <div className="w-full py-4 pr-4">
                          {formData.district ? (
                            <span className="text-white text-base font-bold">{formData.district}</span>
                          ) : (
                            <span className="text-gray-600 text-base font-medium">Tumanni tanlang</span>
                          )}
                        </div>
                      </div>
                      <ChevronDown size={20} className={`text-gray-500 mr-4 transition-transform duration-300 ${activeDropdown === 'district' ? 'rotate-180' : ''}`} />
                    </div>

                    {activeDropdown === 'district' && (
                      <div className="absolute top-[105%] left-0 w-full bg-gray-900/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden flex flex-col z-50">
                        <div className="max-h-[220px] overflow-y-auto custom-scroll">
                          {regionsData[formData.region].map((district, idx) => (
                            <div 
                              key={idx} 
                              onClick={() => handleDistrictSelect(district)}
                              className="px-5 py-4 hover:bg-green-500/20 text-white font-medium cursor-pointer border-b border-white/5 last:border-0 transition-colors"
                            >
                              {district}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* QISHLOQ */}
                <div className="relative group z-10">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 mb-2 block focus-within:text-green-400">
                    Qishloq (MFY) yoki Ko'cha nomi
                  </label>
                  <div className="flex items-center w-full bg-black/60 border border-white/10 rounded-xl overflow-hidden focus-within:border-green-500 focus-within:bg-black/80 transition-all duration-300">
                    <div className="px-4 text-gray-500"><Home size={18} /></div>
                    <input
                      type="text"
                      name="village"
                      autoComplete="off"
                      value={formData.village}
                      onChange={handleChange}
                      className="w-full bg-transparent border-none outline-none text-white text-base font-bold py-4 pr-4 placeholder:text-gray-600"
                      placeholder="Qo'lda kiritiladi..."
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* TUGMA: O'rtada, ikkala kartaning pastida */}
          <div className="pt-2 flex justify-center w-full">
            <button
              type="submit"
              disabled={loading}
              className={`w-full md:w-[400px] py-4.5 rounded-2xl flex items-center justify-center gap-2 text-lg font-bold transition-all duration-300 border ${
                loading 
                  ? 'bg-white/5 text-gray-500 border-white/10 cursor-not-allowed'
                  : 'bg-green-600 text-white border-green-500 hover:bg-green-500 hover:-translate-y-1 shadow-xl shadow-green-600/30'
              }`}
              style={{ paddingTop: '1.1rem', paddingBottom: '1.1rem' }}
            >
              {loading ? (
                <Loader2 className="animate-spin" size={24} />
              ) : (
                <>Saqlash va Davom etish <CheckCircle2 size={24} /></>
              )}
            </button>
          </div>
          
        </form>
      </main>

      <footer className="relative z-10 py-6 text-center text-gray-400 text-xs font-medium border-t border-white/5 bg-black/20 backdrop-blur-md mt-auto">
        © {new Date().getFullYear()} Hosilim. Barcha huquqlar himoyalangan.
      </footer>
    </div>
  );
}