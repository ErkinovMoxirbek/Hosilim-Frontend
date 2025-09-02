import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../config";

// O'zbekiston viloyatlari va tumanlari (hardcoded)
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

const UserExtraInfoForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    region: "",
    district: "",
    address: ""
  });
  const [districts, setDistricts] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { firstName, lastName, region, district, address } = formData;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Viloyat tanlanganida tumanlarni filterlash
  useEffect(() => {
    if (region) {
      setDistricts(regionsData[region] || []);
      setFormData(prev => ({ ...prev, district: "" }));
    } else {
      setDistricts([]);
      setFormData(prev => ({ ...prev, district: "" }));
    }
  }, [region]);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!firstName || !lastName || !region || !district || !address) {
      setError("Iltimos, barcha maydonlarni to'ldiring.");
      return;
    }

    setError("");
    setIsLoading(true);

    // Formatlangan manzil
    const fullAddress = `${region}, ${district}, ${address}`;

    try {
      const response = await fetch(`${API_BASE_URL}/user/extra-info`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`
        },
        body: JSON.stringify({
          firstName,
          lastName,
          address: fullAddress
        })
      });

      if (!response.ok) {
        throw new Error("Ma'lumotlarni saqlashda xatolik yuz berdi.");
      }

      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-orange-50 to-red-50 flex items-center justify-center px-4 relative overflow-hidden">
      {/* Real nature background elements */}
      <div className="absolute inset-0">
        {/* Apple illustration - top left */}
        <div className="absolute top-10 left-10 opacity-20">
          <svg width="60" height="60" viewBox="0 0 60 60" className="text-red-400">
            <path fill="currentColor" d="M30 10c-8 0-15 7-15 15 0 12 15 25 15 25s15-13 15-25c0-8-7-15-15-15z"/>
            <path fill="currentColor" d="M28 8c2-3 6-2 6 1 0 2-2 3-3 3-2 0-3-2-3-4z" opacity="0.7"/>
          </svg>
        </div>

        {/* Orange illustration - top right */}
        <div className="absolute top-20 right-16 opacity-15">
          <svg width="50" height="50" viewBox="0 0 50 50" className="text-orange-500">
            <circle cx="25" cy="25" r="20" fill="currentColor"/>
            <circle cx="25" cy="25" r="15" fill="currentColor" opacity="0.8"/>
            <path d="M25 5l3 8-8-3z" fill="currentColor" opacity="0.6"/>
          </svg>
        </div>

        {/* Grape cluster - bottom left */}
        <div className="absolute bottom-20 left-8 opacity-20">
          <svg width="40" height="60" viewBox="0 0 40 60" className="text-purple-400">
            <circle cx="20" cy="15" r="6" fill="currentColor"/>
            <circle cx="12" cy="22" r="6" fill="currentColor"/>
            <circle cx="28" cy="22" r="6" fill="currentColor"/>
            <circle cx="16" cy="30" r="6" fill="currentColor"/>
            <circle cx="24" cy="30" r="6" fill="currentColor"/>
            <circle cx="20" cy="38" r="6" fill="currentColor"/>
            <path d="M20 8c0-4 4-6 6-3l-3 5z" fill="currentColor" opacity="0.7"/>
          </svg>
        </div>

        {/* Pear - bottom right */}
        <div className="absolute bottom-32 right-12 opacity-15">
          <svg width="45" height="55" viewBox="0 0 45 55" className="text-green-400">
            <path fill="currentColor" d="M22.5 10c-6 0-12 4-12 12 0 8 4 12 4 18 0 8 4 12 8 12s8-4 8-12c0-6 4-10 4-18 0-8-6-12-12-12z"/>
            <path d="M20 8c1-3 5-2 5 1 0 2-2 3-2.5 3-1.5 0-2.5-2-2.5-4z" fill="currentColor" opacity="0.7"/>
          </svg>
        </div>

        {/* Mountain/Hills silhouette */}
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-green-100/30 to-transparent">
          <svg className="absolute bottom-0 w-full h-24" viewBox="0 0 400 100" preserveAspectRatio="none">
            <path d="M0,100 C50,70 100,40 150,50 C200,60 250,30 300,45 C350,60 380,80 400,70 L400,100 Z" 
                  fill="currentColor" className="text-green-200/40"/>
          </svg>
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full shadow-lg mb-6 border-2 border-green-100">
            <svg className="w-10 h-10 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Hosilim</h1>
          <p className="text-gray-600">Qo'shimcha ma'lumot</p>
        </div>

        {/* Form */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-8 space-y-6">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-400 rounded-r-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-3">
                Ism
              </label>
              <input
                type="text"
                name="firstName"
                maxLength={30}
                value={firstName}
                onChange={handleChange}
                className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition-colors bg-gray-50 focus:bg-white"
                placeholder="Ismingizni kiriting"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-3">
                Familiya
              </label>
              <input
                type="text"
                name="lastName"
                maxLength={30}
                value={lastName}
                onChange={handleChange}
                className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition-colors bg-gray-50 focus:bg-white"
                placeholder="Familiyangizni kiriting"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-3">
                Viloyat
              </label>
              <select
                name="region"
                value={region}
                onChange={handleChange}
                className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition-colors bg-gray-50 focus:bg-white"
              >
                <option value="">Viloyatni tanlang</option>
                {Object.keys(regionsData).map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-3">
                Tuman
              </label>
              <select
                name="district"
                value={district}
                onChange={handleChange}
                disabled={!region}
                className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition-colors bg-gray-50 focus:bg-white disabled:opacity-50"
              >
                <option value="">{region ? "Tumanni tanlang" : "Avval viloyat tanlang"}</option>
                {districts.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-3">
                Aniq manzil
              </label>
              <input
                type="text"
                name="address"
                value={address}
                onChange={handleChange}
                className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition-colors bg-gray-50 focus:bg-white"
                placeholder="Ko‘cha, uy raqami"
              />
            </div>

            <button
              onClick={handleVerify}
              disabled={isLoading}
              className="w-full bg-green-700 text-white py-4 px-6 rounded-xl font-semibold hover:bg-green-800 focus:outline-none focus:ring-4 focus:ring-green-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                  Tekshirilmoqda...
                </div>
              ) : (
                "Tasdiqlash"
              )}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <div className="flex justify-center items-center space-x-2 mb-4 opacity-60">
            <div className="w-2 h-2 bg-red-400 rounded-full"></div>
            <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
          </div>
          <p className="text-xs text-gray-500 leading-relaxed max-w-xs mx-auto">
            Davom etish orqali siz
            <a href="#" className="text-green-700 hover:underline mx-1">Foydalanish shartlari</a>
            va
            <a href="#" className="text-green-700 hover:underline mx-1">Maxfiylik siyosati</a>
            ga rozilik bildirasiz
          </p>
        </div>
      </div>
    </div>
  );
};

export default UserExtraInfoForm;