import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Award, ShieldCheck, Users, Truck,
  ArrowLeft, Loader2, CheckCircle2,
  ChevronRight, MessageSquare
} from "lucide-react";

import API_BASE_URL from "../config";
import { authService } from "../services/authService";
import { useAuth } from "../hooks/useAuth"; // ✅ MUHIM

const RESEND_SECONDS = 60;

/* ---------- Phone helpers ---------- */
const onlyDigits9 = (v) => String(v || "").replace(/\D/g, "").slice(0, 9);
const maskUz = (digits9) => {
  const d = onlyDigits9(digits9);
  const p = [];
  if (d.length > 0) p.push(d.slice(0, 2));
  if (d.length > 2) p.push(d.slice(2, 5));
  if (d.length > 5) p.push(d.slice(5, 7));
  if (d.length > 7) p.push(d.slice(7, 9));
  return p.join(" ");
};
const fullE164 = (digits9) => `+998${onlyDigits9(digits9)}`;
const isValidUz = (digits9) => /^\+998\d{9}$/.test(fullE164(digits9));

/* ---------- Stats loader ---------- */
async function fetchStatsWithFailover(signal) {
  const urls = [
    `${API_BASE_URL}/public/stats`,
    `${API_BASE_URL}/landing/stats`,
  ];
  for (const url of urls) {
    try {
      const r = await fetch(url, { signal });
      if (!r.ok) continue;
      const j = await r.json().catch(() => ({}));
      const src = j?.data ?? j;
      return {
        totalUsers: Number(src.totalUsers ?? src.users ?? 0),
        totalTransactions: Number(src.totalTransactions ?? src.transactions ?? 0),
        activeBrokers: Number(src.activeBrokers ?? src.brokers ?? 0),
      };
    } catch {
      // next url
    }
  }
  return { totalUsers: 1200, totalTransactions: 4500, activeBrokers: 85 };
}

export default function AuthPage() {
  const navigate = useNavigate();

  // ✅ AuthContext
  const { boot, user, loading } = useAuth();

  const [phone, setPhone] = useState(() => onlyDigits9(localStorage.getItem("lastPhone") || ""));
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1); // 1 phone, 2 otp
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [resendLeft, setResendLeft] = useState(0);

  const [stats, setStats] = useState({ totalUsers: null, totalTransactions: null, activeBrokers: null });
  const [statsLoading, setStatsLoading] = useState(true);

  const otpRef = useRef(null);
  const abortRef = useRef(null);

  // ✅ Agar user allaqachon login bo‘lsa, bu sahifada turmasin
  useEffect(() => {
    if (!loading && user) {
      navigate("/dashboard", { replace: true });
    }
  }, [loading, user, navigate]);

  // stats
  useEffect(() => {
    const ctrl = new AbortController();
    fetchStatsWithFailover(ctrl.signal)
      .then((s) => setStats(s))
      .finally(() => setStatsLoading(false));
    return () => ctrl.abort();
  }, []);

  // focus otp
  useEffect(() => {
    if (step === 2) setTimeout(() => otpRef.current?.focus(), 120);
  }, [step]);

  // resend timer
  useEffect(() => {
    if (!resendLeft) return;
    const t = setInterval(() => setResendLeft((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [resendLeft]);

  function cancelInFlight() {
    try { abortRef.current?.abort(); } catch {}
  }

  const handleSendOtp = async () => {
    if (isLoading) return;
    if (!isValidUz(phone)) {
      setError("Telefon raqamini to'g'ri kiriting");
      return;
    }

    cancelInFlight();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    setIsLoading(true);
    setError("");

    try {
      await authService.sendOtp(fullE164(phone), ctrl.signal);

      localStorage.setItem("lastPhone", onlyDigits9(phone));
      setOtp("");
      setStep(2);
      setResendLeft(RESEND_SECONDS);
    } catch (e) {
      setError(e?.message || "OTP yuborishda xatolik yuz berdi");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (isLoading) return;
    if (otp.length !== 4) {
      setError("Kodni to'liq kiriting");
      return;
    }

    cancelInFlight();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    setIsLoading(true);
    setError("");

    try {
      // 1) OTP verify
      await authService.verifyOtp(fullE164(phone), otp, ctrl.signal);

      // ✅ 2) ENG MUHIM: AuthContext’ni yangilash
      await boot();

      // ✅ 3) endi user contextda bor bo‘ladi
      navigate("/dashboard", { replace: true });
    } catch (e) {
      setError(e?.message || "Kod noto'g'ri kiritildi");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex flex-col font-sans relative bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/assets/peach.jpg')" }}
    >
      <div className="absolute inset-0 bg-gray-900/30 backdrop-blur-[3px] z-0 pointer-events-none"></div>

      <header className="relative z-10 bg-white/10 backdrop-blur-md border-b border-white/20 py-4">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
<div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
                <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center text-white shadow-lg shadow-green-500/30">
              <img src="/logo-white.png" alt="Logo" className="w-6 h-6" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-xl font-bold text-white drop-shadow-md">Hosilim</span>
              <span className="text-[10px] uppercase font-bold text-green-400 tracking-wider">
                Broker tizimi
              </span>
            </div>
          </div>
          <button onClick={() => navigate("/")} className="text-sm font-bold text-white/80 hover:text-white transition-colors">
            Bosh sahifaga qaytish
          </button>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 relative z-10 overflow-hidden">
        <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          
          {/* LEFT: MA'LUMOTLAR QISMI */}
          <div className="hidden lg:block space-y-8 pl-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-green-300 text-sm font-bold shadow-sm transition-transform duration-300 hover:scale-105 cursor-default">
              <Award size={16} /> Agroplatformaga xush kelibsiz
            </div>

            <h1 className="text-5xl font-black text-white leading-[1.2] drop-shadow-lg">
              Biznesingizni <br />
              <span className="text-green-400">raqamlashtiring</span>
            </h1>

            <p className="text-lg text-gray-200 max-w-md leading-relaxed font-medium drop-shadow-sm">
              Daftar-ruchkadan voz keching. Hosilim orqali barcha hisob-kitoblar aniq va xavfsiz amalga oshiriladi.
            </p>

            {/* AVZALLIKLAR QUTILARI - PREMIUM HOVER EFFEKTI QO'SHILDI */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: ShieldCheck, title: "Xavfsiz" },
                { icon: Truck, title: "Tezkor" },
                { icon: Users, title: "Ishonchli" },
                { icon: MessageSquare, title: "24/7 Yordam" },
              ].map((item, i) => (
                <div 
                  key={i} 
                  className="group flex items-center gap-3 bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20 shadow-lg transition-all duration-300 ease-out hover:-translate-y-1.5 hover:scale-105 hover:bg-white/20 hover:shadow-[0_15px_30px_-5px_rgba(0,0,0,0.4)] hover:backdrop-blur-xl cursor-pointer"
                >
                  <item.icon size={22} className="text-green-400 transition-transform duration-300 group-hover:scale-125" />
                  <span className="font-bold text-white tracking-wide">{item.title}</span>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT: TIZIMGA KIRISH ANKETASI - QALQIB CHIQISH EFFEKTI QO'SHILDI */}
          <div className="bg-white rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] p-8 md:p-10 relative transition-all duration-500 ease-out hover:-translate-y-2 hover:scale-[1.01] hover:shadow-[0_30px_60px_-10px_rgba(0,0,0,0.6)]">
            {step === 1 ? (
              <div className="space-y-6">
                <div>
                  <h2 className="text-3xl font-black text-gray-900">Xush kelibsiz!</h2>
                  <p className="text-gray-500 mt-2 text-sm font-medium">
                    Tizimga kirish uchun telefon raqamingizni kiriting
                  </p>
                </div>

                {error && (
                  <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm font-medium border border-red-100">
                    {error}
                  </div>
                )}

                <div className="space-y-5">
                  <div className="relative group">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1 mb-2 block transition-colors duration-300 group-focus-within:text-green-600">
                      Telefon raqam
                    </label>

                    <div
                      className={`flex items-center bg-gray-50 border-2 rounded-2xl px-4 py-4 transition-all duration-300 ${
                        isValidUz(phone)
                          ? "border-green-500 bg-white shadow-sm"
                          : "border-gray-200 focus-within:border-green-500 focus-within:bg-white focus-within:shadow-[0_8px_20px_-5px_rgba(34,197,94,0.15)]"
                      }`}
                    >
                      <span className="text-gray-900 font-bold mr-2 text-lg">+998</span>
                      <input
                        type="tel"
                        className="bg-transparent border-none outline-none w-full text-lg font-bold tracking-wider placeholder:text-gray-300"
                        placeholder="90 123 45 67"
                        value={maskUz(phone)}
                        onChange={(e) => setPhone(onlyDigits9(e.target.value))}
                        onKeyDown={(e) => e.key === "Enter" && handleSendOtp()}
                      />
                      {isValidUz(phone) && <CheckCircle2 className="text-green-500 ml-2 animate-in zoom-in duration-300" size={24} />}
                    </div>
                  </div>

                  <button
                    onClick={handleSendOtp}
                    disabled={isLoading || !isValidUz(phone)}
                    className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-200 disabled:text-gray-400 text-white py-4.5 rounded-2xl font-bold text-lg shadow-xl shadow-green-600/20 transition-all duration-300 flex items-center justify-center gap-3 hover:-translate-y-0.5 hover:shadow-green-600/40 active:scale-[0.98]"
                    style={{ paddingTop: '1.1rem', paddingBottom: '1.1rem' }}
                  >
                    {isLoading ? <Loader2 className="animate-spin" /> : <>Kodni olish <ChevronRight size={20} className="transition-transform duration-300 group-hover:translate-x-1" /></>}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <button
                  onClick={() => setStep(1)}
                  className="flex items-center gap-2 text-gray-400 hover:text-gray-900 transition-colors text-sm font-bold group"
                >
                  <ArrowLeft size={18} className="transition-transform duration-300 group-hover:-translate-x-1" /> Orqaga qaytish
                </button>

                <div>
                  <h2 className="text-3xl font-black text-gray-900">Tasdiqlash</h2>
                  <p className="text-gray-500 mt-2 text-sm font-medium">
                    Kodni <span className="text-gray-900 font-bold">@HosilimBot</span> orqali yubordik
                  </p>
                </div>

                {error && (
                  <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm font-medium border border-red-100">
                    {error}
                  </div>
                )}

                <div className="space-y-6">
                  <input
                    ref={otpRef}
                    type="text"
                    inputMode="numeric"
                    maxLength={4}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 4))}
                    onKeyDown={(e) => e.key === "Enter" && handleVerifyOtp()}
                    className="w-full bg-gray-50 border-2 border-gray-200 focus:border-green-500 focus:bg-white focus:shadow-[0_8px_20px_-5px_rgba(34,197,94,0.15)] rounded-2xl py-5 text-center text-4xl font-black tracking-[1rem] outline-none transition-all duration-300"
                    placeholder="0000"
                  />

                  <div className="flex flex-col gap-4">
                    <button
                      onClick={handleVerifyOtp}
                      disabled={isLoading || otp.length !== 4}
                      className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-200 disabled:text-gray-400 text-white py-4.5 rounded-2xl font-bold text-lg shadow-xl shadow-green-600/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-green-600/40 active:scale-[0.98]"
                      style={{ paddingTop: '1.1rem', paddingBottom: '1.1rem' }}
                    >
                      {isLoading ? <Loader2 className="animate-spin mx-auto" /> : "Tizimga kirish"}
                    </button>

                    <button
                      disabled={resendLeft > 0 || isLoading}
                      onClick={handleSendOtp}
                      className="text-sm font-bold text-green-600 disabled:text-gray-400 hover:text-green-700 transition-colors"
                    >
                      {resendLeft > 0 ? `Qayta yuborish (${resendLeft}s)` : "Kodni qayta yuborish"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            <p className="mt-8 text-center text-xs text-gray-400 leading-relaxed font-medium">
              Kirish orqali siz Hosilim{" "}
              <span className="underline hover:text-green-600 cursor-pointer transition-colors">Xizmat ko'rsatish shartlari</span> va{" "}
              <span className="underline hover:text-green-600 cursor-pointer transition-colors">Maxfiylik siyosatiga</span> rozilik bildirasiz.
            </p>
          </div>
        </div>
      </main>

      <footer className="relative z-10 py-6 text-center text-white/50 text-xs font-medium">
        © {new Date().getFullYear()} Hosilim. Barcha huquqlar himoyalangan.
      </footer>
    </div>
  );
}