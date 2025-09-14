import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Award, ShieldCheck, Users, Truck,
  ArrowLeft, Loader2, Phone, CheckCircle2
} from "lucide-react";
import API_BASE_URL from "../config";

const RESEND_SECONDS = 60;

/* ---------- Phone helpers ---------- */
const onlyDigits9 = (v) => v.replace(/\D/g, "").slice(0, 9);
const maskUz = (digits9) => {
  // 90 123 45 67 format
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

/* ---------- Stats loader (real yoki hushyor fallback) ---------- */
async function fetchStatsWithFailover(signal) {
  const urls = [
    `${API_BASE_URL}/public/stats`,
    `${API_BASE_URL}/stats`,
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
      /* keyingisiga o‘tamiz */
    }
  }
  return { totalUsers: null, totalTransactions: null, activeBrokers: null };
}

const Login = () => {
  const navigate = useNavigate();

  // UI
  const [phone, setPhone] = useState(localStorage.getItem("lastPhone") || "");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [resendLeft, setResendLeft] = useState(0);

  // Stats
  const [stats, setStats] = useState({
    totalUsers: null,
    totalTransactions: null,
    activeBrokers: null,
  });
  const [statsLoading, setStatsLoading] = useState(true);

  const otpRef = useRef(null);
  const reqRef = useRef(null);

  useEffect(() => {
    const ctrl = new AbortController();
    setStatsLoading(true);
    fetchStatsWithFailover(ctrl.signal)
      .then((s) => setStats(s))
      .finally(() => setStatsLoading(false));
    return () => ctrl.abort();
  }, []);

  useEffect(() => {
    if (step === 2) setTimeout(() => otpRef.current?.focus(), 60);
  }, [step]);

  useEffect(() => {
    if (!resendLeft) return;
    const t = setInterval(() => setResendLeft((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [resendLeft]);

  useEffect(() => () => reqRef.current?.abort(), []);

  const handleSendOtp = async () => {
    if (!isValidUz(phone)) return setError("Raqam formati: +998 90 123 45 67");

    setIsLoading(true);
    setError("");
    reqRef.current?.abort();
    reqRef.current = new AbortController();

    try {
      const r = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: fullE164(phone) }),
        signal: reqRef.current.signal,
      });
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        console.error("OTP yuborish xatosi:", t);
        return setError("OTP yuborishda xato");
      }
      localStorage.setItem("lastPhone", onlyDigits9(phone));
      setStep(2);
      setResendLeft(RESEND_SECONDS);
    } catch (e) {
      if (e?.name !== "AbortError") setError("Tarmoq xatosi. Qaytadan urinib ko‘ring.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 4) return setError("Kod 4 xonali bo‘lishi kerak");
    setIsLoading(true);
    setError("");
    reqRef.current?.abort();
    reqRef.current = new AbortController();

    try {
      const r = await fetch(`${API_BASE_URL}/auth/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: fullE164(phone), otp }),
        signal: reqRef.current.signal,
      });
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        console.error("verify error:", t);
        return setError("Kod noto‘g‘ri yoki muddati tugagan");
      }
      const data = await r.json();
      localStorage.setItem("authToken", data?.data?.accessToken || "");
      localStorage.setItem("refreshToken", data?.data?.refreshToken || "");

      const token = localStorage.getItem("authToken");
      if (!token) return navigate("/login");

      const me = await fetch(`${API_BASE_URL}/user/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (me.ok) {
        const u = await me.json();
        if (u?.data?.status === "ACTIVE") navigate("/dashboard");
        else navigate("/extra-info");
      } else navigate("/login");
    } catch (e) {
      if (e?.name !== "AbortError") setError("Tekshiruvda xatolik");
    } finally {
      setIsLoading(false);
    }
  };

  const onEnter = (e) => {
    if (e.key !== "Enter" || isLoading) return;
    if (step === 1 && isValidUz(phone)) handleSendOtp();
    if (step === 2 && otp.length === 4) handleVerifyOtp();
  };

  const Stat = ({ label, value }) => (
    <div className="bg-white rounded-xl border border-gray-200 p-3 text-center">
      <div className="text-lg font-bold text-gray-900">
        {value === null ? "—" : value.toLocaleString("uz-UZ")}
      </div>
      <div className="text-xs text-gray-500">{label}</div>
    </div>
  );

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 relative"
      onKeyDown={onEnter}
    >
      {/* Header — landing'ga uyg‘un */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-40 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between">
            <button onClick={() => navigate("/")} className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br rounded-xl flex items-center justify-center overflow-hidden">
                <img src="/logo.png" alt="Logo" className="w-7 h-7 object-contain" />
              </div>
              <div className="text-left">
                <span className="text-xl font-bold bg-gradient-to-r from-green-700 to-blue-600 bg-clip-text text-transparent">
                  Hosilim
                </span>
                <p className="text-[11px] text-gray-500 -mt-0.5">Qishloq xo'jaligi platformasi</p>
              </div>
            </button>

            <nav className="hidden sm:flex items-center gap-2">
              <button onClick={() => navigate("/")} className="px-3 py-2 text-sm text-gray-700 hover:text-blue-700 rounded-lg">
                Bosh sahifa
              </button>
              <button onClick={() => navigate("/#features")} className="px-3 py-2 text-sm text-gray-700 hover:text-blue-700 rounded-lg">
                Imkoniyatlar
              </button>
              <button onClick={() => navigate("/#pricing")} className="px-3 py-2 text-sm text-gray-700 hover:text-blue-700 rounded-lg">
                Narxlar
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Pattern – landing bilan bir xil */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" aria-hidden>
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000' fill-opacity='0.1'%3E%3Cpath d='m36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* Body */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid lg:grid-cols-2 gap-8 items-stretch lg:items-center">
          {/* Left: brand + REAL stats */}
          <div className="hidden lg:block">
            <div className="rounded-3xl p-[1px] bg-gradient-to-br from-green-600 to-blue-600 shadow-xl">
              <div className="rounded-3xl bg-white/85 backdrop-blur-sm p-8 h-full">
                <div className="inline-flex items-center px-4 py-2 bg-green-100 rounded-full text-green-800 text-sm font-medium mb-6">
                  <Award className="w-4 h-4 mr-2" />
                  O'zbekistondagi №1 qishloq xo'jaligi platformasi
                </div>

                <h2 className="text-4xl font-bold text-gray-900 leading-tight mb-4">
                  Fermerdan{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-blue-600">
                    to'g'ridan-to'g'ri
                  </span>{" "}
                  brokerga
                </h2>

                <p className="text-gray-600 mb-6">
                  Sotish/xaridni tezlashtiring, xavfsiz to‘lovlar va ishonchli hamkorlar bilan ishlang.
                </p>

                <ul className="space-y-3 mb-8">
                  <li className="flex items-center text-gray-800">
                    <ShieldCheck className="w-5 h-5 text-green-600 mr-3" /> Xavfsiz verifikatsiya va to‘lov
                  </li>
                  <li className="flex items-center text-gray-800">
                    <Users className="w-5 h-5 text-blue-600 mr-3" /> Keng hamjamiyat va tez aloqa
                  </li>
                  <li className="flex items-center text-gray-800">
                    <Truck className="w-5 h-5 text-indigo-600 mr-3" /> Logistika va yetkazib berish tayyor
                  </li>
                </ul>

                {/* Real stats / skeleton */}
                <div className="grid grid-cols-3 gap-3">
                  {statsLoading ? (
                    [1, 2, 3].map((i) => (
                      <div key={i} className="bg-white rounded-xl border border-gray-200 p-3 text-center animate-pulse">
                        <div className="h-5 bg-gray-200 rounded w-16 mx-auto mb-2" />
                        <div className="h-3 bg-gray-200 rounded w-20 mx-auto" />
                      </div>
                    ))
                  ) : (
                    <>
                      <Stat label="Foydalanuvchi" value={stats.totalUsers} />
                      <Stat label="Tranzaksiya" value={stats.totalTransactions} />
                      <Stat label="Brokerlar" value={stats.activeBrokers} />
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right: form — KARTADA VERTIKAL MARKAZ! */}
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 sm:p-8 sm:min-h-[520px] sm:flex sm:flex-col sm:justify-center">
            <div className="w-full max-w-md mx-auto">
              {error && (
                <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-400 rounded-r-lg" role="alert" aria-live="polite">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              {step === 1 ? (
                <div className="space-y-6">
                  <label className="block text-sm font-semibold text-gray-800">Telefon raqamingiz</label>

                  {/* PROFESSIONAL PHONE FIELD */}
                  <div
                    className={[
                      "flex items-center rounded-xl border-2 bg-gray-50 focus-within:bg-white transition-colors",
                      isValidUz(phone) ? "border-green-500" : "border-gray-200 focus-within:border-blue-600",
                    ].join(" ")}
                  >
                    <div className="pl-4 pr-3 py-3 flex items-center gap-2 select-none">
                      {/* UZ flag (mini) */}
                      <span className="w-5 h-3 rounded-sm overflow-hidden ring-1 ring-gray-300">
                        <span className="block w-full h-full bg-[#1eb53a]" />
                      </span>
                      <span className="text-gray-700 font-medium">+998</span>
                    </div>

                    <input
                      type="tel"
                      inputMode="numeric"
                      autoComplete="tel"
                      className="flex-1 pr-4 py-3 bg-transparent outline-none placeholder:text-gray-400"
                      placeholder="90 123 45 67"
                      value={maskUz(phone)}
                      onChange={(e) => setPhone(onlyDigits9(e.target.value))}
                    />

                    {isValidUz(phone) && (
                      <CheckCircle2 className="text-green-600 w-5 h-5 mr-3" aria-hidden />
                    )}
                  </div>

                  <button
                    onClick={handleSendOtp}
                    disabled={isLoading || !isValidUz(phone)}
                    className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white py-4 px-6 rounded-xl font-semibold hover:from-green-700 hover:to-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 inline-flex items-center justify-center"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin mr-2" /> Yuborilmoqda…
                      </>
                    ) : (
                      <>
                        <Phone className="w-5 h-5 mr-2" /> SMS kod olish
                      </>
                    )}
                  </button>

                  <p className="text-center text-xs text-gray-500">
                    Telegram orqali tasdiqlash kodi yuboriladi
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  <button
                    onClick={() => {
                      setStep(1);
                      setOtp("");
                      setError("");
                    }}
                    className="inline-flex items-center text-gray-600 hover:text-blue-700 text-sm font-medium"
                  >
                    <ArrowLeft className="w-4 h-4 mr-1" /> Orqaga
                  </button>

                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-3">
                      <CheckCircle2 className="w-8 h-8 text-green-700" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">Tasdiqlash kodi</h3>
                    <p className="text-sm text-gray-600">
                      <span className="font-mono bg-gray-100 px-2 py-0.5 rounded mr-1">
                        {fullE164(phone)}
                      </span>
                      Telegram bot:{" "}
                      <a href="tg://resolve?domain=hosilimbot" className="font-semibold underline">
                        @HosilimBot
                      </a>
                    </p>
                  </div>

                  <input
                    ref={otpRef}
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={4}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 4))}
                    className="w-full px-4 py-5 border-2 border-gray-200 rounded-xl focus:border-blue-600 focus:outline-none text-center text-3xl font-mono tracking-widest bg-gray-50 focus:bg-white transition-colors"
                    placeholder="- - - -"
                  />

                  <div className="flex items-center justify-between text-xs text-gray-600">
                    <span>Kodni olmadizmi?</span>
                    <button
                      type="button"
                      onClick={() => resendLeft === 0 && handleSendOtp()}
                      disabled={!!resendLeft || isLoading}
                      className={`font-semibold ${resendLeft ? "text-gray-400 cursor-not-allowed" : "text-blue-700 hover:underline"}`}
                    >
                      {resendLeft ? `${resendLeft}s dan so'ng qayta yuborish` : "Qayta yuborish"}
                    </button>
                  </div>

                  <button
                    onClick={handleVerifyOtp}
                    disabled={isLoading || otp.length !== 4}
                    className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white py-4 px-6 rounded-xl font-semibold hover:from-green-700 hover:to-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 inline-flex items-center justify-center"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin mr-2" /> Tekshirilmoqda…
                      </>
                    ) : (
                      "Tasdiqlash"
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footnote */}
        <div className="text-center mt-8">
          <p className="text-xs text-gray-500 leading-relaxed max-w-xs mx-auto">
            Davom etish orqali siz
            <a href="#" className="text-blue-700 hover:underline mx-1">
              Foydalanish shartlari
            </a>
            va
            <a href="#" className="text-blue-700 hover:underline mx-1">
              Maxfiylik siyosati
            </a>
            ga rozilik bildirasiz
          </p>
        </div>
      </main>
    </div>
  );
};

export default Login;
