import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Award, ShieldCheck, Users, Truck,
  ArrowLeft, Loader2, CheckCircle2,
  ChevronRight, MessageSquare
} from "lucide-react";

import API_BASE_URL from "../config";
import { authService } from "../services/authService";

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

export default function Login() {
  const navigate = useNavigate();

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
      await authService.verifyOtp(fullE164(phone), otp, ctrl.signal);

      const me = await authService.me(ctrl.signal);
      const status = me?.data?.status;

      if (status === "ACTIVE") navigate("/dashboard", { replace: true });
      else navigate("/extra-info", { replace: true });
    } catch (e) {
      setError(e?.message || "Kod noto'g'ri kiritildi");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* HEADER */}
      <header className="bg-white border-b border-gray-100 py-4">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
            <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center text-white shadow-lg">
              <img src="/logo-white.png" alt="Logo" className="w-6 h-6" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-xl font-bold text-gray-900">Hosilim</span>
              <span className="text-[10px] uppercase font-semibold text-green-700 tracking-wider">
                Broker tizimi
              </span>
            </div>
          </div>
          <button onClick={() => navigate("/")} className="text-sm font-medium text-gray-500 hover:text-green-600">
            Bosh sahifaga qaytish
          </button>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-green-100 rounded-full blur-[120px] opacity-30 pointer-events-none" />

        <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-12 items-center relative z-10">
          {/* LEFT */}
          <div className="hidden lg:block space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-green-100 rounded-full text-green-700 text-xs font-bold shadow-sm">
              <Award size={14} /> O'zbekistondagi №1 tizim
            </div>

            <h1 className="text-5xl font-extrabold text-gray-900 leading-[1.1]">
              Biznesingizni <br />
              <span className="text-green-600 font-black">raqamlashtiring</span>
            </h1>

            <p className="text-lg text-gray-600 max-w-md leading-relaxed">
              Daftar-ruchkadan voz keching. Hosilim orqali barcha hisob-kitoblar aniq va xavfsiz amalga oshiriladi.
            </p>

            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: ShieldCheck, title: "Xavfsiz", color: "text-blue-600" },
                { icon: Truck, title: "Tezkor", color: "text-orange-600" },
                { icon: Users, title: "Ishonchli", color: "text-purple-600" },
                { icon: MessageSquare, title: "24/7 Yordam", color: "text-green-600" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                  <item.icon size={20} className={item.color} />
                  <span className="font-semibold text-gray-700">{item.title}</span>
                </div>
              ))}
            </div>

            <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
              {statsLoading ? (
                <div className="text-sm text-gray-400">Statistika yuklanmoqda...</div>
              ) : (
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div>
                    <div className="text-xl font-black text-gray-900">{stats.totalUsers}</div>
                    <div className="text-xs text-gray-500">Foydalanuvchi</div>
                  </div>
                  <div>
                    <div className="text-xl font-black text-gray-900">{stats.totalTransactions}</div>
                    <div className="text-xs text-gray-500">Tranzaksiya</div>
                  </div>
                  <div>
                    <div className="text-xl font-black text-gray-900">{stats.activeBrokers}</div>
                    <div className="text-xs text-gray-500">Broker</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT */}
          <div className="bg-white rounded-[2rem] shadow-2xl shadow-green-100/50 border border-gray-100 p-8 md:p-10 relative">
            {step === 1 ? (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Xush kelibsiz!</h2>
                  <p className="text-gray-500 mt-1 text-sm">
                    Tizimga kirish uchun telefon raqamingizni kiriting
                  </p>
                </div>

                {error && (
                  <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100">
                    {error}
                  </div>
                )}

                <div className="space-y-4">
                  <div className="relative group">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1 mb-2 block">
                      Telefon raqam
                    </label>

                    <div
                      className={`flex items-center bg-gray-50 border-2 rounded-2xl px-4 py-4 transition-all ${
                        isValidUz(phone)
                          ? "border-green-500 bg-white"
                          : "border-gray-100 focus-within:border-green-600 focus-within:bg-white"
                      }`}
                    >
                      <span className="text-gray-900 font-bold mr-2">+998</span>
                      <input
                        type="tel"
                        className="bg-transparent border-none outline-none w-full text-lg font-bold tracking-wider placeholder:text-gray-300"
                        placeholder="90 123 45 67"
                        value={maskUz(phone)}
                        onChange={(e) => setPhone(onlyDigits9(e.target.value))}
                        onKeyDown={(e) => e.key === "Enter" && handleSendOtp()}
                      />
                      {isValidUz(phone) && <CheckCircle2 className="text-green-500 ml-2" size={20} />}
                    </div>
                  </div>

                  <button
                    onClick={handleSendOtp}
                    disabled={isLoading || !isValidUz(phone)}
                    className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-200 text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-green-200 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
                  >
                    {isLoading ? <Loader2 className="animate-spin" /> : <>Kodni olish <ChevronRight size={20} /></>}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <button
                  onClick={() => setStep(1)}
                  className="flex items-center gap-2 text-gray-400 hover:text-green-600 transition-colors text-sm font-semibold"
                >
                  <ArrowLeft size={18} /> Orqaga qaytish
                </button>

                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Tasdiqlash</h2>
                  <p className="text-gray-500 mt-1 text-sm">
                    Kodni <span className="text-gray-900 font-bold">@HosilimBot</span> orqali yubordik
                  </p>
                </div>

                {error && (
                  <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100">
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
                    className="w-full bg-gray-50 border-2 border-gray-100 focus:border-green-600 focus:bg-white rounded-2xl py-5 text-center text-4xl font-black tracking-[1rem] outline-none transition-all"
                    placeholder="0000"
                  />

                  <div className="flex flex-col gap-4">
                    <button
                      onClick={handleVerifyOtp}
                      disabled={isLoading || otp.length !== 4}
                      className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-200 text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-green-200 transition-all active:scale-[0.98]"
                    >
                      {isLoading ? <Loader2 className="animate-spin mx-auto" /> : "Tizimga kirish"}
                    </button>

                    <button
                      disabled={resendLeft > 0 || isLoading}
                      onClick={handleSendOtp}
                      className="text-sm font-semibold text-green-600 disabled:text-gray-400"
                    >
                      {resendLeft > 0 ? `Qayta yuborish (${resendLeft}s)` : "Kodni qayta yuborish"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            <p className="mt-8 text-center text-xs text-gray-400 leading-relaxed">
              Kirish orqali siz Hosilim{" "}
              <span className="underline cursor-pointer">Xizmat ko'rsatish shartlari</span> va{" "}
              <span className="underline cursor-pointer">Maxfiylik siyosatiga</span> rozilik bildirasiz.
            </p>
          </div>
        </div>
      </main>

      <footer className="py-6 text-center text-gray-400 text-xs">
        © {new Date().getFullYear()} Hosilim. Barcha huquqlar himoyalangan.
      </footer>
    </div>
  );
}
