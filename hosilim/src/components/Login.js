import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from "../config";




const Login = () => {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const validatePhone = (phone) => {
    const uzbekRegex = /^\+998\d{9}$/;
    return uzbekRegex.test(phone);
  };

  const handleSendOtp = async () => {
    const fullPhone = `+998${phone}`;
    if (!validatePhone(fullPhone)) {
      return setError("Faqat O'zbekiston telefon raqamlari qabul qilinadi");
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: fullPhone }),
      });
      if (response.ok) {
        setStep(2);
        setError('');
      } else {
        setError('OTP yuborishda xato');
      }
    } catch (err) {
      setError('Xatolik yuz berdi');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 4) {
      setError("Kod 4 xonali bo'lishi kerak");
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: `+998${phone}`, otp }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Server xatolik:", errorText);
        setError("Kod noto'g'ri yoki server xatoligi");
        return;
      }

      const data = await response.json();
      console.log("Login muvaffaqiyatli:", data);

      localStorage.setItem("authToken", data.data.accessToken);

      localStorage.setItem("refreshToken", data.data.refreshToken);

      const token = localStorage.getItem("authToken");
      if (!token) {
        navigate('/login');
      }
      try {
        const res = await fetch(`${API_BASE_URL}/user/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          const user = await res.json();

          if (user.data.status === "ACTIVE") {
            navigate("/dashboard");
          } else {
            console.log("Foydalanuvchi aktiv emas!");
            navigate("/extra-info");
          }
        } else {
          console.log("Token noto‘g‘ri yoki muddati tugagan");
          navigate("/login");
        }
      } catch (error) {
        console.error("Xatolik:", error);
        navigate("/login");
      }

    } catch (err) {
      console.error("Fetch xatolik:", err);
      setError("Xatolik yuz berdi");
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
            <path fill="currentColor" d="M30 10c-8 0-15 7-15 15 0 12 15 25 15 25s15-13 15-25c0-8-7-15-15-15z" />
            <path fill="currentColor" d="M28 8c2-3 6-2 6 1 0 2-2 3-3 3-2 0-3-2-3-4z" opacity="0.7" />
          </svg>
        </div>

        {/* Orange illustration - top right */}
        <div className="absolute top-20 right-16 opacity-15">
          <svg width="50" height="50" viewBox="0 0 50 50" className="text-orange-500">
            <circle cx="25" cy="25" r="20" fill="currentColor" />
            <circle cx="25" cy="25" r="15" fill="currentColor" opacity="0.8" />
            <path d="M25 5l3 8-8-3z" fill="currentColor" opacity="0.6" />
          </svg>
        </div>

        {/* Grape cluster - bottom left */}
        <div className="absolute bottom-20 left-8 opacity-20">
          <svg width="40" height="60" viewBox="0 0 40 60" className="text-purple-400">
            <circle cx="20" cy="15" r="6" fill="currentColor" />
            <circle cx="12" cy="22" r="6" fill="currentColor" />
            <circle cx="28" cy="22" r="6" fill="currentColor" />
            <circle cx="16" cy="30" r="6" fill="currentColor" />
            <circle cx="24" cy="30" r="6" fill="currentColor" />
            <circle cx="20" cy="38" r="6" fill="currentColor" />
            <path d="M20 8c0-4 4-6 6-3l-3 5z" fill="currentColor" opacity="0.7" />
          </svg>
        </div>

        {/* Pear - bottom right */}
        <div className="absolute bottom-32 right-12 opacity-15">
          <svg width="45" height="55" viewBox="0 0 45 55" className="text-green-400">
            <path fill="currentColor" d="M22.5 10c-6 0-12 4-12 12 0 8 4 12 4 18 0 8 4 12 8 12s8-4 8-12c0-6 4-10 4-18 0-8-6-12-12-12z" />
            <path d="M20 8c1-3 5-2 5 1 0 2-2 3-2.5 3-1.5 0-2.5-2-2.5-4z" fill="currentColor" opacity="0.7" />
          </svg>
        </div>

        {/* Mountain/Hills silhouette */}
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-green-100/30 to-transparent">
          <svg className="absolute bottom-0 w-full h-24" viewBox="0 0 400 100" preserveAspectRatio="none">
            <path d="M0,100 C50,70 100,40 150,50 C200,60 250,30 300,45 C350,60 380,80 400,70 L400,100 Z"
              fill="currentColor" className="text-green-200/40" />
          </svg>
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full shadow-lg mb-6 border-2 border-green-100">
            {/* Harvest/Agriculture icon */}
            <svg className="w-10 h-10 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Hosilim</h1>
          <p className="text-gray-600">Tabiatdan to'g'ridan-to'g'ri</p>
        </div>

        {/* Main form card */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-400 rounded-r-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {step === 1 ? (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-3">
                  Telefon raqamingiz
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="text-gray-600 font-medium">+998</span>
                  </div>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
                    className="w-full pl-16 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition-colors bg-gray-50 focus:bg-white"
                    placeholder="90 123 45 67"
                    maxLength={9}
                  />
                </div>
              </div>

              <button
                onClick={handleSendOtp}
                disabled={isLoading || phone.length !== 9}
                className="w-full bg-green-700 text-white py-4 px-6 rounded-xl font-semibold hover:bg-green-800 focus:outline-none focus:ring-4 focus:ring-green-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                    Yuborilmoqda...
                  </div>
                ) : (
                  'SMS kod olish'
                )}
              </button>

              <div className="text-center pt-4">
                <p className="text-xs text-gray-500">
                  Telegram orqali tasdiqlash kodi yuboriladi
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <button
                onClick={() => setStep(1)}
                className="flex items-center text-gray-600 hover:text-green-700 text-sm font-medium transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Orqaga
              </button>

              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                  <svg className="w-8 h-8 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M8 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Tasdiqlash kodi</h3>
                <p className="text-sm text-gray-600 mb-6">
                  <span className="font-mono bg-gray-100 px-3 py-1 rounded-lg">+998{phone}</span><br />
                  <a href='tg://resolve?domain=hosilimbot' className="font-semibold underline ml-1">
                    @HosilimBot<t />
                  </a>{"  "}
                  telegram botiga kiring va 3 daqiqalik kodingizni oling.
                </p>
              </div>

              <div>
                <input
                  type="text"
                  maxLength={4}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                  className="w-full px-4 py-5 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none text-center text-3xl font-mono tracking-widest bg-gray-50 focus:bg-white transition-colors"
                  placeholder="- - - -"
                  autoFocus
                />
              </div>

              <button
                onClick={handleVerifyOtp}
                disabled={isLoading || otp.length !== 4}
                className="w-full bg-green-700 text-white py-4 px-6 rounded-xl font-semibold hover:bg-green-800 focus:outline-none focus:ring-4 focus:ring-green-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                    Tekshirilmoqda...
                  </div>
                ) : (
                  'Tasdiqlash'
                )}
              </button>

              <button
                onClick={() => { setStep(1); setOtp(''); setError(''); }}
                className="w-full text-gray-600 hover:text-green-700 py-3 text-sm font-medium transition-colors"
              >
                Boshqa raqam bilan kirish
              </button>
            </div>
          )}
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

export default Login;