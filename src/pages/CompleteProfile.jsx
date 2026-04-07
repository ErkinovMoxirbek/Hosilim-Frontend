import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { completeUserProfile } from "../services/profileService";
import { useAuth } from "../hooks/useAuth";
import { Loader2, User, MapPin, CheckCircle2, Home, ChevronDown, Map, ArrowLeft } from "lucide-react";

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRegionChange = (e) => {
    const selectedRegion = e.target.value;
    setFormData(prev => ({
      ...prev,
      region: selectedRegion,
      district: "" // Viloyat o'zgarganda tumanni tozalash
    }));
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

  return (
    <div 
      className="min-h-screen flex flex-col font-sans relative bg-cover bg-center bg-no-repeat bg-fixed text-gray-100"
      style={{ backgroundImage: "url('/assets/peach.jpg')" }}
    >
      <style>{`
        input:-webkit-autofill,
        input:-webkit-autofill:hover, 
        input:-webkit-autofill:focus, 
        input:-webkit-autofill:active {
            -webkit-box-shadow: 0 0 0 30px #111111 inset !important;
            -webkit-text-fill-color: #ffffff !important;
            transition: background-color 5000s ease-in-out 0s;
        }
      `}</style>

      {/* Orqa qora parda */}
      <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm z-0 pointer-events-none"></div>

      {/* HEADER */}
      <header className="relative z-10 bg-black/20 backdrop-blur-md border-b border-white/10 py-4">
        <div className="max-w-7xl mx-auto px-4 flex items-center">
          
          {/* Orqaga qaytish tugmasi */}
          <button 
            onClick={() => navigate(-1)} 
            className="mr-4 w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:text-green-400 transition-all duration-300"
            title="Orqaga qaytish"
          >
            <ArrowLeft size={20} />
          </button>

          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
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
        </div>
      </header>

      {/* ASOSIY QISM */}
      <main className="flex-1 flex items-center justify-center p-4 relative z-10 py-10">
        <div className="w-full max-w-[480px] bg-black/40 backdrop-blur-2xl border border-white/20 shadow-[0_30px_60px_rgba(0,0,0,0.6)] rounded-[2.5rem] p-8 sm:p-10 transition-all duration-500">
          
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-green-500/20 border border-green-500/30 text-green-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <User size={32} />
            </div>
            <h2 className="text-3xl font-black text-white">Xush kelibsiz!</h2>
            <p className="text-gray-300 mt-2 text-sm font-medium">
              Tizimdan to'liq foydalanish uchun shaxsiy ma'lumotlarigizni kiriting.
            </p>
          </div>

          {error && (
            <div className="mb-6 bg-red-500/20 text-red-200 p-3 rounded-xl text-sm font-medium border border-red-500/30 text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* 1. ISM */}
            <div className="relative group">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 mb-2 block transition-colors duration-300 group-focus-within:text-green-400">
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

            {/* 2. FAMILIYA */}
            <div className="relative group">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 mb-2 block transition-colors duration-300 group-focus-within:text-green-400">
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

            {/* 3. VILOYAT */}
            <div className="relative group">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 mb-2 block transition-colors duration-300 group-focus-within:text-green-400">
                Viloyat
              </label>
              <div className="flex items-center w-full bg-black/60 border border-white/10 rounded-xl overflow-hidden focus-within:border-green-500 focus-within:bg-black/80 transition-all duration-300 relative">
                <div className="px-4 text-gray-500"><Map size={18} /></div>
                <select
                  name="region"
                  value={formData.region}
                  onChange={handleRegionChange}
                  disabled={loading}
                  className="w-full bg-transparent border-none outline-none text-white text-base font-bold py-4 pr-10 appearance-none cursor-pointer disabled:opacity-50"
                >
                  <option value="" className="bg-gray-900 text-gray-400">Viloyatni tanlang</option>
                  {Object.keys(regionsData).map((region, idx) => (
                    <option key={idx} value={region} className="bg-gray-900 text-white">
                      {region}
                    </option>
                  ))}
                </select>
                <div className="absolute right-4 pointer-events-none text-gray-500">
                  <ChevronDown size={20} />
                </div>
              </div>
            </div>

            {/* 4. TUMAN */}
            <div className={`relative group transition-opacity duration-300 ${!formData.region ? 'opacity-50' : 'opacity-100'}`}>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 mb-2 block transition-colors duration-300 group-focus-within:text-green-400">
                Tuman (Shahar)
              </label>
              <div className="flex items-center w-full bg-black/60 border border-white/10 rounded-xl overflow-hidden focus-within:border-green-500 focus-within:bg-black/80 transition-all duration-300 relative">
                <div className="px-4 text-gray-500"><MapPin size={18} /></div>
                <select
                  name="district"
                  value={formData.district}
                  onChange={handleChange}
                  disabled={!formData.region || loading}
                  className="w-full bg-transparent border-none outline-none text-white text-base font-bold py-4 pr-10 appearance-none cursor-pointer disabled:cursor-not-allowed"
                >
                  <option value="" className="bg-gray-900 text-gray-400">Tumanni tanlang</option>
                  {formData.region && regionsData[formData.region].map((district, idx) => (
                    <option key={idx} value={district} className="bg-gray-900 text-white">
                      {district}
                    </option>
                  ))}
                </select>
                <div className="absolute right-4 pointer-events-none text-gray-500">
                  <ChevronDown size={20} />
                </div>
              </div>
            </div>

            {/* 5. QISHLOQ */}
            <div className="relative group">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 mb-2 block transition-colors duration-300 group-focus-within:text-green-400">
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

            {/* TUGMA */}
            <div className="pt-4 relative">
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-4 rounded-xl flex items-center justify-center gap-2 text-base font-bold transition-all duration-300 border ${
                  loading 
                    ? 'bg-white/5 text-gray-500 border-white/10 cursor-not-allowed'
                    : 'bg-green-600 text-white border-green-500 hover:bg-green-500 hover:-translate-y-0.5 shadow-lg shadow-green-600/20'
                }`}
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <>Saqlash va Davom etish <CheckCircle2 size={20} /></>
                )}
              </button>
            </div>
          </form>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="relative z-10 py-6 text-center text-gray-400 text-xs font-medium border-t border-white/5 bg-black/20 backdrop-blur-md mt-auto">
        © {new Date().getFullYear()} Hosilim. Barcha huquqlar himoyalangan.
      </footer>
    </div>
  );
}