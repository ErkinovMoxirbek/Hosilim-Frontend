import React, { useEffect, useState, useRef } from 'react';
import {
  Search, Clock, Layers,
  ThermometerSnowflake, ThermometerSun,
  ChevronDown, MapPin, Building2,
  X, Loader2, ArrowRight
} from "lucide-react";
import { fridgeService } from '../../../services/fridgeService';
import { stockService } from '../../../services/stockService';
import { exporterService } from '../../../services/exporterService';

const ACCENTS = ['#EF4444', '#F97316', '#F59E0B', '#84CC16', '#10B981', '#06B6D4', '#3B82F6', '#8B5CF6', '#D946EF', '#F43F5E'];

const getAccentColor = (name) => {
  if (!name) return ACCENTS[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return ACCENTS[Math.abs(hash) % ACCENTS.length];
};

// ─── Debounce hook ────────────────────────────────────────────────────────────
function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

// ─── Kichik yordamchi komponent ───────────────────────────────────────────────
function Field({ label, aside, children }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between px-0.5">
        <label className="text-[10px] font-black uppercase tracking-[0.14em] text-gray-400">
          {label}
        </label>
        {aside}
      </div>
      {children}
    </div>
  );
}

export default function FridgeInventoryPage() {
  const [fridges, setFridges] = useState([]);
  const [selectedFridge, setSelectedFridge] = useState(null);
  const [stocks, setStocks] = useState([]);
  const [exporters, setExporters] = useState([]); // 🟢 YANGLIK: Eksportyorlar ro'yxati
  const [loading, setLoading] = useState(true);
  const [loadingStocks, setLoadingStocks] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [ddOpen, setDdOpen] = useState(false);
  const ddRef = useRef(null);

  // Modal holati
  const [exportModal, setExportModal] = useState({ isOpen: false, stock: null });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({ targetExporterId: '', basketCount: '', price: '' });
  
  // Kalkulyatsiya state'lari
  const [calc, setCalc] = useState(null);
  const [isCalcLoading, setCalcLoad] = useState(false);
  
  const dBaskets = useDebounce(form.basketCount, 500);
  const dPrice   = useDebounce(form.price, 500);

  // 1. Initial Load
  useEffect(() => {
    fetchFridges();
    fetchExporters();
  }, []);

  // 2. Xolodilnik tanlanganda
  useEffect(() => {
    if (selectedFridge) fetchStocks(selectedFridge.id);
  }, [selectedFridge]);

  // 3. Dropdown yopilishi uchun
  useEffect(() => {
    const handler = (e) => {
      if (ddRef.current && !ddRef.current.contains(e.target)) setDdOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // 4. Live Kalkulyatsiya API ga (Backend) jo'natish
  useEffect(() => {
    if (!exportModal.stock?.stockId || !dBaskets || !dPrice) {
      setCalc(null);
      return;
    }
    let alive = true;
    setCalcLoad(true);
    stockService.calculateExport(exportModal.stock.stockId, {
      basketCount: Number(dBaskets),
      price: Number(dPrice),
    })
    .then(res => { if (alive) setCalc(res); })
    .catch(() => { if (alive) setCalc(null); })
    .finally(()=> { if (alive) setCalcLoad(false); });
    return () => { alive = false; };
  }, [exportModal.stock?.stockId, dBaskets, dPrice]);

  // APIs
  const fetchFridges = async () => {
    try {
      setLoading(true);
      const data = await fridgeService.getMyFridges();
      setFridges(data || []);
      if (data?.length > 0) setSelectedFridge(data[0]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchExporters = async () => {
    try {
      const data = await exporterService.getMyExporters();
      setExporters(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchStocks = async (id) => {
    try {
      setLoadingStocks(true);
      const data = await stockService.getStocksByFridgeId(id);
      setStocks(data || []);
    } catch (err) {
      console.error(err);
      setStocks([]);
    } finally {
      setLoadingStocks(false);
    }
  };

  // Yordamchi
  const calculateStorageTime = (entryDate) => {
    if (!entryDate) return '---';
    const diffMs = new Date() - new Date(entryDate);
    if (diffMs < 0) return '---';
    const days    = Math.floor(diffMs / 86400000);
    const hours   = Math.floor((diffMs % 86400000) / 3600000);
    const minutes = Math.floor((diffMs % 3600000) / 60000);
    if (days > 0)  return `${days} kun ${hours} soat`;
    if (hours > 0) return `${hours} soat ${minutes} min`;
    return `${minutes} min`;
  };

  const getTimeBadgeClass = (entryDate) => {
    if (!entryDate) return 'bg-gray-100 text-gray-500';
    const hours = (new Date() - new Date(entryDate)) / 3600000;
    if (hours > 72) return 'bg-amber-50 text-amber-700';
    if (hours > 24) return 'bg-green-50 text-green-700';
    return 'bg-blue-50 text-blue-700';
  };

  const isCold = (fridge) => (fridge?.temperatureCelsius ?? 0) < 0;

  // 🟢 Eksport qildik
  const handleExportSubmit = async (e) => {
    e.preventDefault();
    const stock = exportModal.stock;
    const bCount = Number(form.basketCount);
    
    if (bCount > stock.basketCount) {
      alert(`Xatolik! Sizda jami ${stock.basketCount} ta savat bor xolos.`);
      return;
    }

    if (!form.targetExporterId || !form.price || !calc) return;

    try {
      setIsSubmitting(true);
      await stockService.exportStock(stock.stockId, {
        exporterId: Number(form.targetExporterId),
        basketCount: bCount,
        customPricePerKg: Number(form.price),
      });
      alert("Yuk muvaffaqiyatli eksportga chiqarildi!");
      closeModal();
      fetchStocks(selectedFridge.id);
    } catch (err) {
      alert(err.message || "Eksportga chiqarishda xatolik yuz berdi");
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeModal = () => {
    if (isSubmitting) return;
    setExportModal({ isOpen: false, stock: null });
    setForm({ targetExporterId: '', basketCount: '', price: '' });
    setCalc(null);
  };

  const filteredStocks = stocks.filter(s =>
    s.fruitName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const bCount = Number(form.basketCount) || 0;
  const isOverLimit = bCount > (exportModal.stock?.basketCount || 0);
  const canSubmit = !isSubmitting && !isOverLimit && bCount > 0 && form.targetExporterId && form.price && calc;

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-6 h-6 border-2 border-gray-200 border-t-black rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="p-4 md:p-6 lg:p-8 w-full max-w-[1600px] mx-auto min-h-screen flex flex-col" style={{ fontFamily: '"Syne", "DM Mono", sans-serif' }}>
      {/* ── HEADER ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Kamera (Xolodilnik) Zaxirasi</h1>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative" ref={ddRef}>
            <button onClick={() => setDdOpen(prev => !prev)} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full text-sm font-semibold text-gray-800 hover:border-gray-400 transition-all min-w-[200px]">
              {selectedFridge ? isCold(selectedFridge) ? <ThermometerSnowflake size={14} className="text-blue-400 shrink-0" /> : <ThermometerSun size={14} className="text-amber-400 shrink-0" /> : null}
              <span className="flex-1 text-left truncate">{selectedFridge?.name ?? '-- Xolodilnikni tanlang --'}</span>
              <ChevronDown size={14} className={`text-gray-400 transition-transform shrink-0 ${ddOpen ? 'rotate-180' : ''}`} />
            </button>
            {ddOpen && (
              <div className="absolute top-[calc(100%+6px)] left-0 min-w-full bg-white border border-gray-200 rounded-2xl overflow-hidden z-50 shadow-lg">
                {fridges.map(fridge => (
                  <button key={fridge.id} onClick={() => { setSelectedFridge(fridge); setDdOpen(false); setSearchTerm(''); }} className={`w-full flex items-center gap-2.5 px-4 py-3 text-sm text-left transition-colors ${selectedFridge?.id === fridge.id ? 'bg-blue-50 text-blue-700 font-bold' : 'text-gray-700 hover:bg-gray-50 font-medium'}`}>
                    {isCold(fridge) ? <ThermometerSnowflake size={14} className="text-blue-400 shrink-0" /> : <ThermometerSun size={14} className="text-amber-400 shrink-0" />}
                    <span className="flex-1 truncate">{fridge.name}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isCold(fridge) ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>{fridge.temperatureCelsius}°C</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input type="text" placeholder="Meva qidirish..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-full text-sm focus:outline-none focus:border-gray-400 transition-all w-full md:w-[220px]" />
          </div>

          <span className="bg-gray-100 border border-gray-200 text-gray-800 text-sm font-semibold px-4 py-2 rounded-full whitespace-nowrap">
            Jami: <span style={{ fontFamily: '"DM Mono", monospace' }}>{filteredStocks.length}</span>
          </span>
        </div>
      </div>

      {/* ── META BAR ── */}
      {selectedFridge && (
        <div className="flex items-center gap-4 mb-6 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs text-gray-500 bg-white border border-gray-100 px-3 py-1.5 rounded-full">
            <MapPin size={12} className="text-gray-400" />{selectedFridge.address}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500 bg-white border border-gray-100 px-3 py-1.5 rounded-full">
            <Building2 size={12} className="text-gray-400" />Sig'im: {selectedFridge.maxCapacity} tn
          </div>
          <div className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full ${isCold(selectedFridge) ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-700'}`}>
            {isCold(selectedFridge) ? <ThermometerSnowflake size={12} /> : <ThermometerSun size={12} />} {selectedFridge.temperatureCelsius}°C
          </div>
        </div>
      )}

      {/* ── CONTENT ── */}
      {loadingStocks ? (
        <div className="flex-1 flex items-center justify-center h-64"><div className="w-6 h-6 border-2 border-gray-200 border-t-gray-700 rounded-full animate-spin" /></div>
      ) : filteredStocks.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center bg-transparent rounded-xl border border-dashed border-gray-300 p-12 text-center min-h-64">
          <svg width="40" height="40" fill="none" stroke="#D1D5DB" strokeWidth="1.2" viewBox="0 0 24 24" className="mb-3"><rect x="2" y="7" width="20" height="15" rx="2"/><path d="M16 7V5a2 2 0 0 0-4 0v2M8 7V5a2 2 0 0 0-4 0v2"/></svg>
          <p className="text-gray-900 font-bold font-['Syne']">Mahsulot topilmadi</p>
          <p className="text-gray-400 text-sm mt-1">Ushbu kamerada hozircha mahsulot yo'q.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {filteredStocks.map(stock => {
            const accentColor = getAccentColor(stock.fruitName);
            return (
              <div key={stock.stockId} className="relative bg-white rounded-xl border border-gray-200 shadow-sm hover:border-gray-400 hover:-translate-y-[2px] transition-all duration-200 flex flex-col overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: accentColor }} />
                <div className="p-4 pt-5 pb-3 flex justify-between items-start">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 leading-none mb-2">{stock.fruitName || 'Noma\'lum meva'}</h2>
                    {stock.fruitQuality && <span className="inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded bg-gray-100 text-gray-600">{stock.fruitQuality}</span>}
                  </div>
                  <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full ${getTimeBadgeClass(stock.enteredAt)}`}>
                    <Clock size={10} />{calculateStorageTime(stock.enteredAt)}
                  </span>
                </div>
                <div className="px-4 pb-3 flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1.5 text-gray-500"><Layers size={12} /> Savat</span>
                  <span className="font-bold text-gray-900 bg-gray-50 px-2 py-0.5 rounded border border-gray-100" style={{ fontFamily: '"DM Mono", monospace' }}>{stock.basketCount} ta</span>
                </div>
                <div className="grid grid-cols-2 border-y border-gray-100 divide-x divide-gray-100 bg-gray-50/50">
                  <div className="p-3 flex flex-col">
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Sof vazn</span>
                    <span className="font-bold text-gray-900 text-base" style={{ fontFamily: '"DM Mono", monospace' }}>{stock.netWeight} <span className="text-xs font-normal text-gray-400">kg</span></span>
                  </div>
                  <div className="p-3 flex flex-col">
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">To'liq vazn</span>
                    <span className="font-bold text-gray-900 text-base" style={{ fontFamily: '"DM Mono", monospace' }}>{stock.grossWeight} <span className="text-xs font-normal text-gray-400">kg</span></span>
                  </div>
                </div>
                <div className="p-3 mt-auto bg-white">
                  <button onClick={() => setExportModal({ isOpen: true, stock })} className="w-full py-2.5 bg-amber-500 text-white shadow-sm text-sm font-bold rounded-lg hover:bg-amber-600 transition-colors">
                    ✈️ Eksportga sotish
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ══════════════════════════════════════
          EKSPORT MODALI (Faqat Eksport uchun)
      ══════════════════════════════════════ */}
      {exportModal.isOpen && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/25 backdrop-blur-[2px]" onClick={closeModal} />
          <div className="relative w-full sm:max-w-[400px] bg-white rounded-t-[32px] sm:rounded-[32px] shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">

            <div className="px-6 pt-7 pb-5 flex items-start justify-between border-b border-gray-100">
              <div>
                <p className="text-[10px] font-black tracking-[0.14em] uppercase text-gray-400 mb-1">Eksport</p>
                <h2 className="text-2xl font-black text-gray-950 font-['Syne',sans-serif] leading-none">{exportModal.stock?.fruitName}</h2>
              </div>
              <button onClick={closeModal} className="mt-0.5 w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all">
                <X size={15} strokeWidth={2.5} />
              </button>
            </div>

            <div className="mx-6 mb-5 flex items-center justify-between py-2.5 border-b border-gray-100">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Mavjud zaxira</span>
              <span className="font-['DM_Mono',monospace] text-sm font-bold text-gray-700 tabular-nums">
                {(exportModal.stock?.basketCount || 0).toLocaleString()} savat
              </span>
            </div>

            <form id="export-form" onSubmit={handleExportSubmit} className="px-6 space-y-4 pb-6">
              
              <Field label="Hamkor (Eksportyor)">
                <select required value={form.targetExporterId} onChange={e => setForm(p => ({ ...p, targetExporterId: e.target.value }))} className="w-full bg-gray-50 border-0 rounded-2xl px-4 py-3.5 text-[13px] font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:bg-white transition-all cursor-pointer appearance-none">
                  <option value="" disabled>Hamkorni tanlang…</option>
                  {exporters.map(ex => <option key={ex.id} value={ex.id}>{ex.name} {ex.surname} · {ex.phoneNumber}</option>)}
                </select>
              </Field>

              <Field label="Savatlar soni" aside={<button type="button" onClick={() => setForm(p => ({ ...p, basketCount: String(exportModal.stock?.basketCount) }))} className="text-[10px] font-black uppercase tracking-wider text-amber-500 hover:text-amber-700 transition-colors">Barchasi</button>}>
                <div className="relative">
                  <input required type="number" min="1" max={exportModal.stock?.basketCount} value={form.basketCount} onChange={e => setForm(p => ({ ...p, basketCount: e.target.value }))} placeholder="0" className={`w-full bg-gray-50 border-0 rounded-2xl pl-4 pr-20 py-3.5 font-['DM_Mono',monospace] text-[32px] font-black tabular-nums leading-none text-gray-950 placeholder-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:bg-white transition-all ${isOverLimit ? 'ring-2 ring-red-300/80 bg-red-50' : ''}`} />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-gray-300 uppercase tracking-wider pointer-events-none">savat</span>
                </div>
                {isOverLimit && <p className="text-[11px] text-red-500 font-bold mt-1.5 pl-1">Maksimal: {exportModal.stock?.basketCount} ta savat</p>}
              </Field>

              <Field label="Narx (so'm/kg)">
                <div className="relative">
                  <input required type="number" min="0" step="any" value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} placeholder="0" className="w-full bg-gray-50 border-0 rounded-2xl pl-4 pr-16 py-3.5 font-['DM_Mono',monospace] text-[32px] font-black tabular-nums leading-none text-gray-950 placeholder-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:bg-white transition-all" />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-gray-300 uppercase tracking-wider pointer-events-none">so'm</span>
                </div>
              </Field>

              {/* ── Kalkulyator (Serverdan kelgan) ── */}
              {bCount > 0 && (
                <div className={`rounded-2xl overflow-hidden transition-all duration-500 ${isCalcLoading || !calc ? 'opacity-50 scale-[0.98]' : 'opacity-100 scale-100'}`}>
                  <div className="bg-gray-950 px-5 py-4">
                    {isCalcLoading ? (
                      <div className="flex items-center gap-2.5 py-1">
                        <Loader2 size={13} className="animate-spin text-gray-500" />
                        <span className="text-xs font-bold text-gray-500 tracking-wider">Hisoblanmoqda…</span>
                      </div>
                    ) : calc ? (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-[9px] font-black uppercase tracking-[0.15em] text-gray-500 mb-1.5">Sof vazn</p>
                          <p className="font-['DM_Mono',monospace] font-black text-[26px] leading-none text-white tabular-nums">
                            {Number(calc.projectedNetWeight).toFixed(2)} <span className="text-sm font-normal text-gray-500 ml-1">kg</span>
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-[9px] font-black uppercase tracking-[0.15em] text-amber-500 mb-1.5">Jami summa</p>
                          <p className="font-['DM_Mono',monospace] font-black text-[22px] leading-none text-amber-400 tabular-nums">
                            {Number(calc.projectedTotalAmount).toLocaleString('uz-UZ')} <span className="text-sm font-normal text-amber-700 ml-1">so'm</span>
                          </p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs font-bold text-gray-600 py-1 tracking-wide">Narx va savatlar sonini kiriting</p>
                    )}
                  </div>
                </div>
              )}
            </form>

            <div className="px-6 pb-7 pt-1 flex gap-2.5">
              <button type="button" disabled={isSubmitting} onClick={closeModal} className="py-3.5 px-5 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold rounded-2xl transition-colors disabled:opacity-50 text-[13px]">
                Bekor
              </button>
              <button type="submit" form="export-form" disabled={!canSubmit} className="flex-1 py-3.5 font-bold rounded-2xl transition-all flex items-center justify-center gap-2 text-[13px] text-white shadow-sm disabled:opacity-40 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-500">
                {isSubmitting ? <Loader2 size={15} className="animate-spin" /> : <>Eksportga chiqarish <ArrowRight size={14} strokeWidth={2.5} /></>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}