import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  ShoppingBasket, Users, Clock, Search, RefreshCw,
  Calendar, ChevronDown, ChevronRight, AlertCircle,
  Package, Phone, CheckCircle2, Bell,
} from "lucide-react";
import basketTransactionService from "../../services/basketTransactionService";

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const TODAY              = new Date().toISOString().split("T")[0];
const AUTO_REFRESH_MS    = 60_000;

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const elapsedHours = (iso) =>
  iso ? (Date.now() - new Date(iso).getTime()) / 3_600_000 : null;

const formatElapsed = (iso) => {
  const ms = iso ? Date.now() - new Date(iso).getTime() : null;
  if (ms === null) return "—";
  const h = Math.floor(ms / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  if (h === 0) return `${m} daqiqa oldin`;
  if (h < 24)  return `${h} soat ${m} daqiqa oldin`;
  return `${Math.floor(h / 24)} kun oldin`;
};

const formatTime = (iso) =>
  iso
    ? new Date(iso).toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" })
    : "—";

// Urgency: rang + label soat bo'yicha
const urgency = (iso) => {
  const h = elapsedHours(iso);
  if (h === null) return { label: "Noma'lum", dot: "bg-slate-300",  badge: "bg-slate-100 text-slate-500",   ring: "ring-slate-100",  pulse: false };
  if (h < 3)      return { label: "Yangi",     dot: "bg-emerald-400", badge: "bg-emerald-50 text-emerald-700", ring: "ring-emerald-200", pulse: false };
  if (h < 6)      return { label: "Kutilmoqda",dot: "bg-amber-400",   badge: "bg-amber-50 text-amber-700",    ring: "ring-amber-200",   pulse: false };
  if (h < 10)     return { label: "Kechikkan", dot: "bg-orange-500",  badge: "bg-orange-50 text-orange-700",  ring: "ring-orange-200",  pulse: false };
  return           { label: "Juda kech!",       dot: "bg-red-500",    badge: "bg-red-50 text-red-700",         ring: "ring-red-300",    pulse: true  };
};

// ─── SUB-COMPONENTS ───────────────────────────────────────────────────────────
function Skeleton({ className }) {
  return <div className={`animate-pulse bg-slate-100 rounded-2xl ${className}`} />;
}

function StatCard({ icon: Icon, label, value, sub, color, bg }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-2xl ${bg} ${color} flex items-center justify-center shrink-0`}>
        <Icon size={20} strokeWidth={2} />
      </div>
      <div>
        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-black text-slate-900 leading-tight mt-0.5">{value}</p>
        {sub && <p className="text-[11px] text-slate-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

function EmptyPending() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mb-4">
        <CheckCircle2 className="w-8 h-8 text-emerald-500" strokeWidth={1.5} />
      </div>
      <p className="text-slate-800 font-bold text-base">Barcha savatlar qaytarilgan!</p>
      <p className="text-slate-400 text-sm mt-1.5">
        Bu kunda hech bir fermer qarzdor emas
      </p>
    </div>
  );
}

// ─── FARMER CARD ─────────────────────────────────────────────────────────────
function FarmerCard({ farmer, expanded, onToggle }) {
  const urg = urgency(farmer.lastGivenAt);

  return (
    <div className={`bg-white rounded-2xl border shadow-sm overflow-hidden ring-1 transition-all ${urg.ring}`}>
      {/* Row header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-4 px-4 py-3.5 hover:bg-slate-50/70 transition-colors text-left"
      >
        {/* Urgency dot */}
        <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${urg.dot} ${urg.pulse ? "animate-pulse" : ""}`} />

        {/* Name + phone */}
        <div className="flex-1 min-w-0">
          <p className="font-bold text-slate-900 text-sm truncate">{farmer.farmerFullName}</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <Phone size={10} className="text-slate-400 shrink-0" />
            <p className="text-[11px] text-slate-500 font-medium">{farmer.farmerPhone ?? "—"}</p>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Pending count */}
          <div className="text-right">
            <p className="text-lg font-black text-rose-600 leading-none">{farmer.totalPendingBaskets}</p>
            <p className="text-[10px] text-slate-400 font-medium">ta savat</p>
          </div>

          {/* Urgency badge */}
          <span className={`hidden sm:inline-flex text-[10px] font-bold px-2.5 py-1 rounded-full ${urg.badge}`}>
            {urg.label}
          </span>

          {/* Time */}
          <div className="hidden md:block text-right">
            <p className="text-[11px] font-bold text-slate-700">{formatTime(farmer.lastGivenAt)}</p>
            <p className="text-[10px] text-slate-400">{formatElapsed(farmer.lastGivenAt)}</p>
          </div>

          {expanded
            ? <ChevronDown  size={15} className="text-slate-400" />
            : <ChevronRight size={15} className="text-slate-400" />}
        </div>
      </button>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t border-slate-100 bg-slate-50/40 px-4 pt-3 pb-4 space-y-2">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">
            Savat tafsilotlari
          </p>

          {farmer.baskets.map((b) => (
            <div
              key={b.basketId}
              className="flex items-center gap-3 bg-white rounded-xl px-3 py-2.5 border border-slate-100"
            >
              <div className="w-7 h-7 bg-amber-50 rounded-lg flex items-center justify-center shrink-0">
                <Package size={13} className="text-amber-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-800 truncate">{b.basketName}</p>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="text-[10px] text-slate-500">
                    Berildi: <b className="text-slate-700">{b.givenQty}</b>
                  </span>
                  <span className="text-[10px] text-slate-500">
                    Qaytarildi: <b className="text-emerald-600">{b.returnedQty}</b>
                  </span>
                </div>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-base font-black text-rose-600">{b.pendingQty}</p>
                <p className="text-[10px] text-slate-400">kutilmoqda</p>
              </div>
            </div>
          ))}

          {/* Time on mobile */}
          <div className="flex items-center gap-2 pt-1 md:hidden">
            <Clock size={10} className="text-slate-400" />
            <p className="text-[11px] text-slate-500">
              Oxirgi berilgan: <b>{formatTime(farmer.lastGivenAt)}</b> —{" "}
              {formatElapsed(farmer.lastGivenAt)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function PendingReturnsPage() {
  const [data,          setData]          = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState(null);
  const [search,        setSearch]        = useState("");
  const [selectedDate,  setSelectedDate]  = useState(TODAY);
  const [expandedId,    setExpandedId]    = useState(null);
  const [autoRefresh,   setAutoRefresh]   = useState(false);
  const [lastUpdated,   setLastUpdated]   = useState(null);
  const timerRef = useRef(null);

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const fetchData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setError(null);
    try {
      const result = await basketTransactionService.getPendingReturns(selectedDate);
      // eng kechikkan (eski) birinchi
      const sorted = [...result].sort((a, b) => {
        if (!a.lastGivenAt && !b.lastGivenAt) return 0;
        if (!a.lastGivenAt) return 1;
        if (!b.lastGivenAt) return -1;
        return new Date(a.lastGivenAt) - new Date(b.lastGivenAt);
      });
      setData(sorted);
      setLastUpdated(new Date());
    } catch (e) {
      setError(e.message);
    } finally {
      if (!silent) setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── Auto-refresh ──────────────────────────────────────────────────────────
  useEffect(() => {
    clearInterval(timerRef.current);
    if (autoRefresh) {
      timerRef.current = setInterval(() => fetchData(true), AUTO_REFRESH_MS);
    }
    return () => clearInterval(timerRef.current);
  }, [autoRefresh, fetchData]);

  // ── Derived ───────────────────────────────────────────────────────────────
  const filtered = data.filter((f) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      f.farmerFullName.toLowerCase().includes(q) ||
      (f.farmerPhone && f.farmerPhone.includes(q))
    );
  });

  const totalPending = data.reduce((s, f) => s + f.totalPendingBaskets, 0);
  const isToday      = selectedDate === TODAY;

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="p-6 lg:p-10 max-w-4xl mx-auto space-y-6 bg-[#F8FAFC] min-h-screen">

      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Kutilayotgan savatlar
            </h1>
            {data.length > 0 && !loading && (
              <span className="bg-rose-500 text-white text-xs font-black px-2 py-0.5 rounded-full leading-none">
                {data.length}
              </span>
            )}
          </div>
          <p className="text-slate-400 text-sm">
            {isToday ? "Bugun" : selectedDate} — hali savatlarini qaytarmagan fermerlar
          </p>
          {lastUpdated && (
            <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
              <Clock size={10} />
              Yangilandi:{" "}
              {lastUpdated.toLocaleTimeString("uz-UZ", {
                hour: "2-digit", minute: "2-digit", second: "2-digit",
              })}
            </p>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Auto-refresh */}
          <button
            onClick={() => setAutoRefresh((v) => !v)}
            title="Har 1 daqiqada avtomatik yangilash"
            className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl border text-xs font-bold transition-all ${
              autoRefresh
                ? "bg-blue-500 border-blue-500 text-white shadow-sm"
                : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            <Bell size={13} className={autoRefresh ? "animate-pulse" : ""} />
            <span className="hidden sm:inline">Auto</span>
          </button>

          {/* Manual refresh */}
          <button
            onClick={() => fetchData()}
            disabled={loading}
            title="Yangilash"
            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 transition-all shadow-sm disabled:opacity-40"
          >
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          </button>

          {/* Date picker */}
          <div className="relative flex items-center bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <Calendar size={13} className="absolute left-3 text-slate-400 pointer-events-none" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="pl-8 pr-3 py-2.5 text-xs font-bold text-slate-700 bg-transparent outline-none cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* ── ERROR ── */}
      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
          <AlertCircle size={16} className="shrink-0" />
          <span className="flex-1">{error}</span>
          <button
            onClick={() => fetchData()}
            className="font-bold underline underline-offset-2 hover:text-red-900"
          >
            Qayta urinish
          </button>
        </div>
      )}

      {/* ── STAT CARDS ── */}
      {loading ? (
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          <StatCard
            icon={Users}
            label="Kutilayotgan fermerlar"
            value={data.length}
            sub={search ? `${filtered.length} ta ko'rsatilmoqda` : undefined}
            color="text-rose-500"
            bg="bg-rose-50"
          />
          <StatCard
            icon={ShoppingBasket}
            label="Kutilayotgan savatlar"
            value={totalPending}
            sub="jami qaytmagan"
            color="text-amber-500"
            bg="bg-amber-50"
          />
        </div>
      )}

      {/* ── SEARCH ── */}
      {!loading && data.length > 0 && (
        <div className="relative">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Fermer ismi yoki telefon raqami..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-10 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-800 placeholder-slate-400 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all shadow-sm"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-sm font-bold"
            >
              ✕
            </button>
          )}
        </div>
      )}

      {/* ── CONTENT ── */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-[60px]" />)}
        </div>
      ) : filtered.length === 0 ? (
        search ? (
          <div className="flex flex-col items-center justify-center py-14 text-center">
            <Search className="w-10 h-10 text-slate-200 mb-3" />
            <p className="font-bold text-slate-600">Natija topilmadi</p>
            <p className="text-sm text-slate-400 mt-1">"{search}" bo'yicha fermer yo'q</p>
          </div>
        ) : (
          <EmptyPending />
        )
      ) : (
        <div className="space-y-3">
          {/* Legend */}
          <div className="flex items-center gap-4 flex-wrap px-1 pb-1">
            {[
              { dot: "bg-emerald-400", text: "< 3 soat" },
              { dot: "bg-amber-400",   text: "3–6 soat" },
              { dot: "bg-orange-500",  text: "6–10 soat" },
              { dot: "bg-red-500",     text: "> 10 soat" },
            ].map(({ dot, text }) => (
              <div key={text} className="flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-full ${dot}`} />
                <span className="text-[10px] text-slate-400 font-medium">{text}</span>
              </div>
            ))}
          </div>

          {filtered.map((farmer) => (
            <FarmerCard
              key={farmer.farmerId}
              farmer={farmer}
              expanded={expandedId === farmer.farmerId}
              onToggle={() =>
                setExpandedId((prev) =>
                  prev === farmer.farmerId ? null : farmer.farmerId
                )
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}