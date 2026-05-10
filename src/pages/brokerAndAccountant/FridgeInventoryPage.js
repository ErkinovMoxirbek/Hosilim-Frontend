import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Clock, Layers,
  ThermometerSnowflake, ThermometerSun,
  ChevronDown, MapPin, Building2,
  X, AlertCircle, Loader2
} from "lucide-react";
import { fridgeService } from '../../services/fridgeService';
import { stockService } from '../../services/stockService';

// MyStocksPage dan olingan aksent rang tizimi
const ACCENTS = ['#EF4444', '#F97316', '#F59E0B', '#84CC16', '#10B981', '#06B6D4', '#3B82F6', '#8B5CF6', '#D946EF', '#F43F5E'];

const getAccentColor = (name) => {
  if (!name) return ACCENTS[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return ACCENTS[Math.abs(hash) % ACCENTS.length];
};

export default function FridgeInventoryPage() {
  const navigate = useNavigate();
  const [fridges, setFridges] = useState([]);
  const [selectedFridge, setSelectedFridge] = useState(null);
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingStocks, setLoadingStocks] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [ddOpen, setDdOpen] = useState(false);
  const ddRef = useRef(null);

  // Transfer modal
  const [transferModal, setTransferModal] = useState({ isOpen: false, stock: null });
  const [isTransferring, setIsTransferring] = useState(false);
  const [transferForm, setTransferForm] = useState({ targetFridgeId: '', basketCount: '' });

  useEffect(() => { fetchFridges(); }, []);

  useEffect(() => {
    if (selectedFridge) fetchStocks(selectedFridge.id);
  }, [selectedFridge]);

  useEffect(() => {
    const handler = (e) => {
      if (ddRef.current && !ddRef.current.contains(e.target)) {
        setDdOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

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

  const fetchStocks = async (id) => {
    try {
      setLoadingStocks(true);
      if (typeof stockService.getStocksByFridgeId !== 'function') {
        throw new Error('getStocksByFridgeId funksiyasi topilmadi');
      }
      const data = await stockService.getStocksByFridgeId(id);
      setStocks(data || []);
    } catch (err) {
      console.error(err);
      setStocks([]);
    } finally {
      setLoadingStocks(false);
    }
  };

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

  const handleTransferSubmit = async (e) => {
    e.preventDefault();
    const stock = transferModal.stock;
    const { targetFridgeId, basketCount } = transferForm;
    if (Number(basketCount) > stock.basketCount) {
      alert(`Xatolik! Sizda jami ${stock.basketCount} ta savat bor xolos.`);
      return;
    }
    try {
      setIsTransferring(true);
      await stockService.transferStock(stock.id, {
        targetFridgeId: Number(targetFridgeId),
        basketCount: Number(basketCount),
      });
      alert("Yuk muvaffaqiyatli ko'chirildi!");
      setTransferModal({ isOpen: false, stock: null });
      setTransferForm({ targetFridgeId: '', basketCount: '' });
      fetchStocks(selectedFridge.id);
    } catch (err) {
      alert(err.message || "Yukni ko'chirishda xatolik yuz berdi");
    } finally {
      setIsTransferring(false);
    }
  };

  const filteredStocks = stocks.filter(s =>
    s.fruitName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-6 h-6 border-2 border-gray-200 border-t-black rounded-full animate-spin" />
    </div>
  );

  return (
    <div
      className="p-4 md:p-6 lg:p-8 w-full max-w-[1600px] mx-auto min-h-screen flex flex-col"
      style={{ fontFamily: '"Syne", "DM Mono", sans-serif' }}
    >
      {/* ── HEADER ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-1 block">
            Sovutgich tizimi
          </span>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
            Omborxona
          </h1>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Fridge Dropdown */}
          <div className="relative" ref={ddRef}>
            <button
              onClick={() => setDdOpen(prev => !prev)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full text-sm font-semibold text-gray-800 hover:border-gray-400 transition-all min-w-[200px]"
            >
              {selectedFridge
                ? isCold(selectedFridge)
                  ? <ThermometerSnowflake size={14} className="text-blue-400 shrink-0" />
                  : <ThermometerSun size={14} className="text-amber-400 shrink-0" />
                : null}
              <span className="flex-1 text-left truncate">
                {selectedFridge?.name ?? '-- Xolodilnikni tanlang --'}
              </span>
              <ChevronDown
                size={14}
                className={`text-gray-400 transition-transform shrink-0 ${ddOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {ddOpen && (
              <div className="absolute top-[calc(100%+6px)] left-0 min-w-full bg-white border border-gray-200 rounded-2xl overflow-hidden z-50 shadow-lg">
                {fridges.map(fridge => (
                  <button
                    key={fridge.id}
                    onClick={() => {
                      setSelectedFridge(fridge);
                      setDdOpen(false);
                      setSearchTerm('');
                    }}
                    className={`w-full flex items-center gap-2.5 px-4 py-3 text-sm text-left transition-colors ${
                      selectedFridge?.id === fridge.id
                        ? 'bg-blue-50 text-blue-700 font-bold'
                        : 'text-gray-700 hover:bg-gray-50 font-medium'
                    }`}
                  >
                    {isCold(fridge)
                      ? <ThermometerSnowflake size={14} className="text-blue-400 shrink-0" />
                      : <ThermometerSun size={14} className="text-amber-400 shrink-0" />
                    }
                    <span className="flex-1 truncate">{fridge.name}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isCold(fridge) ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {fridge.temperatureCelsius}°C
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Meva qidirish..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-full text-sm focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 transition-all w-full md:w-[220px]"
            />
          </div>

          {/* Count badge */}
          <span className="bg-gray-100 border border-gray-200 text-gray-800 text-sm font-semibold px-4 py-2 rounded-full whitespace-nowrap">
            Jami: <span style={{ fontFamily: '"DM Mono", monospace' }}>{filteredStocks.length}</span>
          </span>
        </div>
      </div>

      {/* ── META BAR ── */}
      {selectedFridge && (
        <div className="flex items-center gap-4 mb-6 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs text-gray-500 bg-white border border-gray-100 px-3 py-1.5 rounded-full">
            <MapPin size={12} className="text-gray-400" />
            {selectedFridge.address}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500 bg-white border border-gray-100 px-3 py-1.5 rounded-full">
            <Building2 size={12} className="text-gray-400" />
            Sig'im: {selectedFridge.maxCapacity} tn
          </div>
          <div className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full ${
            isCold(selectedFridge) ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-700'
          }`}>
            {isCold(selectedFridge)
              ? <ThermometerSnowflake size={12} />
              : <ThermometerSun size={12} />
            }
            {selectedFridge.temperatureCelsius}°C
          </div>
        </div>
      )}

      {/* ── CONTENT ── */}
      {loadingStocks ? (
        <div className="flex-1 flex items-center justify-center h-64">
          <div className="w-6 h-6 border-2 border-gray-200 border-t-gray-700 rounded-full animate-spin" />
        </div>
      ) : filteredStocks.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center bg-transparent rounded-xl border border-dashed border-gray-300 p-12 text-center min-h-64">
          <svg width="40" height="40" fill="none" stroke="#D1D5DB" strokeWidth="1.2" viewBox="0 0 24 24" className="mb-3">
            <rect x="2" y="7" width="20" height="15" rx="2"/>
            <path d="M16 7V5a2 2 0 0 0-4 0v2M8 7V5a2 2 0 0 0-4 0v2"/>
          </svg>
          <p className="text-gray-900 font-bold font-['Syne']">Mahsulot topilmadi</p>
          <p className="text-gray-400 text-sm mt-1">Ushbu kamerada hozircha mahsulot yo'q.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {filteredStocks.map(stock => {
            const accentColor = getAccentColor(stock.fruitName);

            return (
              <div
                key={stock.id}
                className="relative bg-white rounded-xl border border-gray-200 shadow-sm hover:border-gray-400 hover:-translate-y-[2px] transition-all duration-200 flex flex-col overflow-hidden"
              >
                {/* Aksent chiziq — MyStocksPage uslubi */}
                <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: accentColor }} />

                {/* Sarlavha qismi */}
                <div className="p-4 pt-5 pb-3 flex justify-between items-start">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 leading-none mb-2" style={{ fontFamily: '"Syne", sans-serif' }}>
                      {stock.fruitName || 'Noma\'lum meva'}
                    </h2>
                    {stock.fruitQuality && (
                      <span className="inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded bg-gray-100 text-gray-600">
                        {stock.fruitQuality}
                      </span>
                    )}
                  </div>
                  {/* Vaqt badge */}
                  <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full ${getTimeBadgeClass(stock.enteredAt)}`}>
                    <Clock size={10} />
                    {calculateStorageTime(stock.enteredAt)}
                  </span>
                </div>

                {/* Savat soni */}
                <div className="px-4 pb-3 flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1.5 text-gray-500">
                    <Layers size={12} /> Savat
                  </span>
                  <span className="font-bold text-gray-900 bg-gray-50 px-2 py-0.5 rounded border border-gray-100" style={{ fontFamily: '"DM Mono", monospace' }}>
                    {stock.basketCount} ta
                  </span>
                </div>

                {/* Og'irlik */}
                <div className="grid grid-cols-2 border-y border-gray-100 divide-x divide-gray-100 bg-gray-50/50">
                  <div className="p-3 flex flex-col">
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Netto</span>
                    <span className="font-bold text-gray-900 text-base" style={{ fontFamily: '"DM Mono", monospace' }}>
                      {stock.netWeight} <span className="text-xs font-normal text-gray-400">kg</span>
                    </span>
                  </div>
                  <div className="p-3 flex flex-col">
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Brutto</span>
                    <span className="font-bold text-gray-900 text-base" style={{ fontFamily: '"DM Mono", monospace' }}>
                      {stock.grossWeight} <span className="text-xs font-normal text-gray-400">kg</span>
                    </span>
                  </div>
                </div>

                {/* Ko'chirish tugmasi */}
                <div className="p-3 mt-auto bg-white">
                  <button
                    onClick={() => {
                      setTransferForm({ targetFridgeId: '', basketCount: '' });
                      setTransferModal({ isOpen: true, stock });
                    }}
                    className="w-full py-2 bg-transparent border border-gray-200 text-gray-600 text-sm font-medium rounded-lg hover:border-gray-900 hover:text-gray-900 transition-colors"
                  >
                    Yukni ko'chirish
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ══════════════════════════════════════
          YUKNI KO'CHIRISH MODALI
      ══════════════════════════════════════ */}
      {transferModal.isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => !isTransferring && setTransferModal({ isOpen: false, stock: null })}
          />
          <div className="relative w-full max-w-md bg-white rounded-[24px] shadow-2xl flex flex-col overflow-hidden">

            {/* Modal header */}
            <div className="p-5 md:p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div>
                <h2 className="text-xl font-bold text-gray-900" style={{ fontFamily: '"Syne", sans-serif' }}>
                  Yukni ko'chirish
                </h2>
                <p className="text-xs text-gray-500 mt-1 font-medium">Boshqa kameraga o'tkazish yoki bo'lish</p>
              </div>
              <button
                onClick={() => !isTransferring && setTransferModal({ isOpen: false, stock: null })}
                className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal body */}
            <div className="p-5 md:p-6 flex-1">

              {/* Meva info */}
              <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-4">
                <div className="w-12 h-12 rounded-[14px] bg-white border border-emerald-100 flex items-center justify-center text-2xl shadow-sm shrink-0">
                  🍎
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-[15px]">{transferModal.stock?.fruitName}</h3>
                  <p className="text-xs text-emerald-700 mt-1 font-bold tracking-wide">
                    Jami: {transferModal.stock?.basketCount} ta savat
                  </p>
                </div>
              </div>

              <form id="transferForm" className="space-y-5" onSubmit={handleTransferSubmit}>

                {/* Xolodilnik tanlash */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider pl-1">
                    Qaysi kameraga o'tkazamiz? *
                  </label>
                  {fridges.length === 0 ? (
                    <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100">
                      Tizimda xolodilniklar topilmadi.
                    </div>
                  ) : (
                    <select
                      required
                      value={transferForm.targetFridgeId}
                      onChange={(e) => setTransferForm(prev => ({ ...prev, targetFridgeId: e.target.value }))}
                      className="w-full appearance-none p-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-gray-900 font-semibold text-[15px] cursor-pointer transition-all"
                    >
                      <option value="" disabled>-- Xolodilnikni tanlang --</option>
                      {fridges
                        .filter(f => f.id !== selectedFridge?.id)
                        .map(f => (
                          <option key={f.id} value={f.id}>{f.name} ({f.temperatureCelsius}°C)</option>
                        ))
                      }
                    </select>
                  )}
                </div>

                {/* Savat soni */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider pl-1 flex justify-between">
                    <span>Nechta savat ko'chiriladi? *</span>
                    <button
                      type="button"
                      onClick={() => setTransferForm(prev => ({ ...prev, basketCount: transferModal.stock?.basketCount }))}
                      className="text-blue-600 hover:underline"
                    >
                      Hammasini tanlash
                    </button>
                  </label>
                  <div className="relative">
                    <input
                      required
                      type="number"
                      min="1"
                      max={transferModal.stock?.basketCount}
                      value={transferForm.basketCount}
                      onChange={(e) => setTransferForm(prev => ({ ...prev, basketCount: e.target.value }))}
                      placeholder={`Maksimal: ${transferModal.stock?.basketCount}`}
                      className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-bold text-lg text-gray-900"
                      style={{ fontFamily: '"DM Mono", monospace' }}
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium pointer-events-none">savat</span>
                  </div>
                </div>

                {/* Eslatma */}
                <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100 flex items-start gap-2.5">
                  <AlertCircle size={16} className="mt-0.5 text-blue-500 shrink-0" />
                  <p className="text-[11px] text-gray-600 leading-relaxed font-medium">
                    Tizim <span className="font-bold text-gray-900">o'rtacha vazn</span> asosida ko'chirilayotgan savatlarning nettosini avtomatik hisoblaydi.
                  </p>
                </div>
              </form>
            </div>

            {/* Modal footer */}
            <div className="p-5 border-t border-gray-100 bg-white flex gap-3">
              <button
                type="button"
                disabled={isTransferring}
                onClick={() => setTransferModal({ isOpen: false, stock: null })}
                className="flex-1 py-3 bg-gray-50 border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-100 transition-colors disabled:opacity-50"
              >
                Bekor qilish
              </button>
              <button
                type="submit"
                form="transferForm"
                disabled={isTransferring || !transferForm.targetFridgeId || !transferForm.basketCount}
                className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-70 shadow-sm"
              >
                {isTransferring ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Tasdiqlash'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}