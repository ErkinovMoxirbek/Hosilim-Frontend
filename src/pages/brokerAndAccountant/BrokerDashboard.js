import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import {
  ShoppingCart, Users, Package, DollarSign,
  Scale, Filter, ChevronDown, Calendar, TrendingUp,
  TrendingDown, Minus, RefreshCw, AlertCircle,ShoppingBasket
} from 'lucide-react';
import { brokerDashboardService } from '../../services/brokerDashboardService';

// ─── CONSTANTS ──────────────────────────────────────────────────────────────
const FRUIT_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#F97316'];

const FILTER_OPTIONS = [
  { value: 'today',  label: 'Bugun' },
  { value: 'week',   label: 'Bu hafta' },
  { value: 'month',  label: 'Bu oy' },
  { value: 'all',    label: 'Barcha vaqtlar' },
  { value: 'custom', label: 'Sana tanlash' },
];

const CHART_DAYS_OPTIONS = [7, 14, 30];

// ─── HELPERS ────────────────────────────────────────────────────────────────
const fmt    = (n) => Number(n || 0).toLocaleString('uz-UZ');
const fmtKg  = (n) => `${fmt(n)} kg`;
const fmtSom = (n) => `${fmt(n)} so'm`;
const fmtDate = (d) => new Date(d).toLocaleDateString('uz-UZ', { month: 'short', day: 'numeric' });

// ─── UI COMPONENTS ──────────────────────────────────────────────────────────
function GrowthBadge({ value }) {
  if (value === null || value === undefined) return null;
  const isPos  = value > 0;
  const isZero = value === 0;
  return (
    <span className={`inline-flex items-center gap-0.5 text-[11px] font-bold px-1.5 py-0.5 rounded-full ${
      isZero ? 'bg-slate-100 text-slate-500' :
      isPos  ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'
    }`}>
      {isZero ? <Minus size={10}/> : isPos ? <TrendingUp size={10}/> : <TrendingDown size={10}/>}
      {Math.abs(value).toFixed(1)}%
    </span>
  );
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900 text-white text-xs rounded-xl px-3 py-2.5 shadow-2xl border border-slate-700 min-w-[140px]">
      <p className="font-bold text-slate-300 mb-1.5">{label}</p>
      {payload.map((p, i) => (
        <div key={i} className="flex justify-between gap-4 items-center">
          <span style={{ color: p.color }} className="font-medium">{p.name}</span>
          <span className="font-bold">{fmt(p.value)}</span>
        </div>
      ))}
    </div>
  );
}

function Skeleton({ className }) {
  return <div className={`animate-pulse bg-slate-200 rounded-lg ${className}`} />;
}

function StatCard({ label, value, unit, icon: Icon, color, bg, growth, loading }) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/60 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between min-h-[110px]">
      <div className="flex justify-between items-start">
        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest leading-snug max-w-[75%]">{label}</p>
        <div className={`w-8 h-8 rounded-full ${bg} ${color} flex items-center justify-center shrink-0`}>
          <Icon size={15} strokeWidth={2.5} />
        </div>
      </div>
      {loading ? (
        <Skeleton className="h-8 w-28 mt-3" />
      ) : (
        <div className="flex items-end gap-2 mt-2">
          <div className="flex items-baseline gap-1.5">
            <span className="text-[26px] font-bold text-slate-900 leading-none tracking-tight">{value}</span>
            <span className="text-[11px] font-medium text-slate-400 uppercase">{unit}</span>
          </div>
          <GrowthBadge value={growth} />
        </div>
      )}
    </div>
  );
}

function EmptyState({ icon: Icon, title, subtitle }) {
  return (
    <div className="flex flex-col items-center justify-center py-14 opacity-50">
      <Icon className="w-10 h-10 text-slate-300 mb-3" strokeWidth={1.5} />
      <p className="text-slate-700 font-bold text-sm">{title}</p>
      {subtitle && <p className="text-slate-400 text-xs mt-1">{subtitle}</p>}
    </div>
  );
}

function ErrorBanner({ message, onRetry }) {
  return (
    <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
      <AlertCircle size={16} className="shrink-0" />
      <span className="flex-1">{message}</span>
      {onRetry && (
        <button onClick={onRetry} className="font-bold underline underline-offset-2 hover:text-red-900">
          Qayta urinish
        </button>
      )}
    </div>
  );
}

// ─── MAIN COMPONENT ─────────────────────────────────────────────────────────
export default function BrokerDashboard() {
  const [stats,        setStats]        = useState(null);
  const [dailyChart,   setDailyChart]   = useState([]);
  const [fruitChart,   setFruitChart]   = useState([]);
  const [topFarmers,   setTopFarmers]   = useState([]);

  const [loadingStats,   setLoadingStats]   = useState(true);
  const [loadingChart,   setLoadingChart]   = useState(true);
  const [loadingFruits,  setLoadingFruits]  = useState(true);
  const [loadingFarmers, setLoadingFarmers] = useState(true);

  const [error,        setError]        = useState(null);
  const [filterType,   setFilterType]   = useState('today');
  const [customDate,   setCustomDate]   = useState(new Date().toISOString().split('T')[0]);
  const [chartDays,    setChartDays]    = useState(7);
  const [fruitFilter,  setFruitFilter]  = useState('week');
  const [topFilter,    setTopFilter]    = useState('week');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const filterRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target))
        setIsFilterOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const fetchStats = useCallback(async () => {
    setLoadingStats(true);
    try {
      const data = await brokerDashboardService.getStats(filterType, customDate);
      setStats(data);
      setError(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoadingStats(false);
    }
  }, [filterType, customDate]);

  const fetchDailyChart = useCallback(async () => {
    setLoadingChart(true);
    try {
      const data = await brokerDashboardService.getDailyChart(chartDays);
      setDailyChart(data.map(d => ({ ...d, dateLabel: fmtDate(d.date) })));
    } catch { /* silent */ }
    finally { setLoadingChart(false); }
  }, [chartDays]);

  const fetchFruitChart = useCallback(async () => {
    setLoadingFruits(true);
    try {
      const data = await brokerDashboardService.getFruitDistribution(fruitFilter);
      setFruitChart(data);
    } catch { /* silent */ }
    finally { setLoadingFruits(false); }
  }, [fruitFilter]);

  const fetchTopFarmers = useCallback(async () => {
    setLoadingFarmers(true);
    try {
      const data = await brokerDashboardService.getTopFarmers(topFilter);
      setTopFarmers(data);
    } catch { /* silent */ }
    finally { setLoadingFarmers(false); }
  }, [topFilter]);

  useEffect(() => { fetchStats();      }, [fetchStats]);
  useEffect(() => { fetchDailyChart(); }, [fetchDailyChart]);
  useEffect(() => { fetchFruitChart(); }, [fetchFruitChart]);
  useEffect(() => { fetchTopFarmers(); }, [fetchTopFarmers]);

  const activeFilterLabel = filterType === 'custom'
    ? customDate.split('-').reverse().join('.')
    : FILTER_OPTIONS.find(o => o.value === filterType)?.label ?? 'Bugun';

  const statCards = [
    { label: "Qabul qilingan og'irlik", value: stats ? fmt(stats.totalAcceptedWeight) : '—', unit: 'kg',    icon: Scale,       color: 'text-blue-500',    bg: 'bg-blue-50',    growth: stats?.weightGrowthPercent },
    { label: 'Mahsulot qiymati',        value: stats ? fmt(stats.totalIncome)          : '—', unit: "so'm", icon: DollarSign,  color: 'text-emerald-500', bg: 'bg-emerald-50', growth: stats?.incomeGrowthPercent },
    { label: 'Qabul qilingan savatlar', value: stats ? fmt(stats.receivedBaskets)      : '—', unit: 'ta',   icon: ShoppingBasket, color: 'text-purple-500',  bg: 'bg-purple-50',  growth: null },
    { label: 'Tarqatilgan savatlar',    value: stats ? fmt(stats.distributedBaskets)    : '—', unit: 'ta',   icon: ShoppingCart,color: 'text-amber-500',   bg: 'bg-amber-50',   growth: null },
    { label: 'Ombordagi zaxira',        value: stats ? fmt(stats.totalInventory)        : '—', unit: 'kg',   icon: Package,    color: 'text-rose-500',    bg: 'bg-rose-50',    growth: null },
  ];

  const maxWeight = topFarmers.length > 0
    ? Math.max(...topFarmers.map(f => Number(f.totalWeight))) : 1;

  const handleRefreshAll = () => {
    fetchStats();
    fetchDailyChart();
    fetchFruitChart();
    fetchTopFarmers();
  };

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-8 bg-[#F8FAFC] min-h-screen">

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Bosh sahifa</h1>
          <p className="text-slate-400 text-sm mt-0.5">Tizimning umumiy xulosasi va tezkor tahlil</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefreshAll}
            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 transition-all shadow-sm"
            title="Yangilash"
          >
            <RefreshCw size={15} />
          </button>

          <div className="relative" ref={filterRef}>
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm"
            >
              <Filter size={14} className="text-blue-500" />
              <span>{activeFilterLabel}</span>
              <ChevronDown size={14} className={`text-slate-400 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
            </button>

            {isFilterOpen && (
              <div className="absolute right-0 mt-2 w-60 bg-white border border-slate-100 shadow-xl rounded-2xl p-1.5 z-50">
                {FILTER_OPTIONS.filter(o => o.value !== 'custom').map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => { setFilterType(opt.value); setIsFilterOpen(false); }}
                    className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                      filterType === opt.value ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
                <div className="h-px bg-slate-100 my-1.5 mx-2" />
                <div className="px-3 pb-1 pt-1 text-[10px] font-black text-slate-400 uppercase tracking-widest">Aniq sana</div>
                <div className="px-2 pb-2">
                  <div className="relative">
                    <Calendar size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="date"
                      value={customDate}
                      onChange={(e) => { setCustomDate(e.target.value); setFilterType('custom'); setIsFilterOpen(false); }}
                      className="w-full text-sm font-semibold bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {error && <ErrorBanner message={error} onRetry={fetchStats} />}

      {/* STAT CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {statCards.map((card, i) => <StatCard key={i} {...card} loading={loadingStats} />)}
      </div>

      {/* CHARTS ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Area Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Kunlik qabul dinamikasi</h3>
              <p className="text-slate-400 text-xs mt-0.5">Og'irlik (kg) bo'yicha</p>
            </div>
            <div className="flex gap-1 bg-slate-100 rounded-xl p-1">
              {CHART_DAYS_OPTIONS.map(d => (
                <button
                  key={d}
                  onClick={() => setChartDays(d)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    chartDays === d ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {d}k
                </button>
              ))}
            </div>
          </div>
          {loadingChart ? <Skeleton className="h-52 w-full" /> :
           dailyChart.length === 0 ? <EmptyState icon={TrendingUp} title="Ma'lumot yo'q" subtitle="Bu davrda qabul amalga oshirilmagan" /> : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={dailyChart} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#3B82F6" stopOpacity={0.18} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="dateLabel" tick={{ fontSize: 10, fill: '#94A3B8', fontWeight: 600 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#94A3B8', fontWeight: 600 }} axisLine={false} tickLine={false}
                  tickFormatter={(v) => v >= 1000 ? `${(v/1000).toFixed(1)}t` : v} width={40} />
                <Tooltip content={<ChartTooltip />} />
                <Area type="monotone" dataKey="totalWeight" name="kg" stroke="#3B82F6" strokeWidth={2.5}
                  fill="url(#weightGrad)" dot={false} activeDot={{ r: 5, fill: '#3B82F6', strokeWidth: 0 }} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Pie Chart */}
        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Mevalar taqsimoti</h3>
              <p className="text-slate-400 text-xs mt-0.5">Og'irlik bo'yicha</p>
            </div>
            <select value={fruitFilter} onChange={(e) => setFruitFilter(e.target.value)}
              className="text-xs font-bold text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 outline-none cursor-pointer">
              <option value="today">Bugun</option>
              <option value="week">Bu hafta</option>
              <option value="month">Bu oy</option>
            </select>
          </div>
          {loadingFruits ? <Skeleton className="h-52 w-full" /> :
           fruitChart.length === 0 ? <EmptyState icon={Package} title="Ma'lumot yo'q" /> : (
            <>
              <ResponsiveContainer width="100%" height={170}>
                <PieChart>
                  <Pie data={fruitChart} dataKey="totalWeight" nameKey="fruitName"
                    cx="50%" cy="50%" innerRadius={50} outerRadius={78} paddingAngle={3} strokeWidth={0}>
                    {fruitChart.map((_, i) => <Cell key={i} fill={FRUIT_COLORS[i % FRUIT_COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v, n) => [fmtKg(v), n]}
                    contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.12)' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-2">
                {fruitChart.slice(0, 4).map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: FRUIT_COLORS[i % FRUIT_COLORS.length] }} />
                    <span className="text-slate-600 flex-1 truncate font-medium">{item.fruitName}</span>
                    <span className="font-bold text-slate-800">{item.percentage}%</span>
                  </div>
                ))}
                {fruitChart.length > 4 && <p className="text-[10px] text-slate-400 font-medium">+{fruitChart.length - 4} ta boshqa</p>}
              </div>
            </>
          )}
        </div>
      </div>

      {/* BOTTOM ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Bar Chart */}
        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6">
          <div className="mb-6">
            <h3 className="font-bold text-slate-900 text-base">Kunlik daromad</h3>
            <p className="text-slate-400 text-xs mt-0.5">So'm bo'yicha (so'nggi {chartDays} kun)</p>
          </div>
          {loadingChart ? <Skeleton className="h-48 w-full" /> :
           dailyChart.length === 0 ? <EmptyState icon={DollarSign} title="Ma'lumot yo'q" /> : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={dailyChart} margin={{ top: 5, right: 5, bottom: 0, left: 0 }} barSize={18}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="dateLabel" tick={{ fontSize: 10, fill: '#94A3B8', fontWeight: 600 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#94A3B8', fontWeight: 600 }} axisLine={false} tickLine={false}
                  tickFormatter={(v) => v >= 1000000 ? `${(v/1000000).toFixed(1)}M` : v >= 1000 ? `${(v/1000).toFixed(0)}K` : v} width={44} />
                <Tooltip formatter={(v) => [fmtSom(v), 'Daromad']}
                  cursor={{ fill: '#F8FAFC', radius: 6 }}
                  contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.12)' }} />
                <Bar dataKey="totalAmount" fill="#10B981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Top Farmers */}
        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-bold text-slate-900 text-base">TOP 5 Fermerlar</h3>
              <p className="text-slate-400 text-xs mt-0.5">Qabul qilingan og'irlik bo'yicha</p>
            </div>
            <select value={topFilter} onChange={(e) => setTopFilter(e.target.value)}
              className="text-xs font-bold text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 outline-none cursor-pointer">
              <option value="today">Bugun</option>
              <option value="week">Bu hafta</option>
              <option value="month">Bu oy</option>
              <option value="all">Hammasi</option>
            </select>
          </div>
          {loadingFarmers ? (
            <div className="space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : topFarmers.length === 0 ? (
            <EmptyState icon={Users} title="Fermerlar yo'q" subtitle="Bu davr uchun ma'lumot topilmadi" />
          ) : (
            <div className="space-y-3">
              {topFarmers.map((farmer, i) => {
                const pct    = (Number(farmer.totalWeight) / maxWeight) * 100;
                const medals = ['🥇', '🥈', '🥉'];
                return (
                  <div key={farmer.farmerId} className="flex items-center gap-3">
                    <div className="w-7 text-center text-base leading-none">
                      {i < 3 ? medals[i] : <span className="text-[11px] font-black text-slate-400">{i + 1}</span>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-1">
                        <p className="text-sm font-bold text-slate-800 truncate">{farmer.farmerName}</p>
                        <p className="text-xs font-bold text-slate-900 shrink-0 ml-2">{fmtKg(farmer.totalWeight)}</p>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5">
                        <div className="h-1.5 rounded-full transition-all duration-700"
                          style={{ width: `${pct}%`, backgroundColor: FRUIT_COLORS[i % FRUIT_COLORS.length] }} />
                      </div>
                      <div className="flex justify-between mt-1">
                        <p className="text-[10px] text-slate-400 font-medium">{farmer.farmerPhone}</p>
                        <p className="text-[10px] text-slate-400 font-medium">{farmer.transactionCount} ta qabul</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}