import React, { useEffect, useState } from 'react';
import { Package, Search, Inbox, X, AlertCircle, Loader2, Wind, Droplets } from "lucide-react";
import { stockService } from '../../services/stockService';
import { fridgeService } from '../../services/fridgeService';

const ACCENTS = ['#EF4444', '#F97316', '#F59E0B', '#84CC16', '#10B981', '#06B6D4', '#3B82F6', '#8B5CF6', '#D946EF', '#F43F5E'];

const getAccentColor = (name) => {
  if (!name) return ACCENTS[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return ACCENTS[Math.abs(hash) % ACCENTS.length];
};

// WMO weather code → emoji + uz nomi
const getWeatherInfo = (code) => {
  if (code === 0)                    return { icon: '☀️', label: 'Ochiq' };
  if (code <= 2)                     return { icon: '⛅', label: 'Qisman bulutli' };
  if (code === 3)                    return { icon: '☁️', label: 'Bulutli' };
  if (code <= 49)                    return { icon: '🌫️', label: 'Tuman' };
  if (code <= 59)                    return { icon: '🌦️', label: "Mayda yomg'ir" };
  if (code <= 69)                    return { icon: '🌧️', label: "Yomg'ir" };
  if (code <= 79)                    return { icon: '❄️', label: 'Qor' };
  if (code <= 84)                    return { icon: '🌦️', label: "Yomg'irli" };
  if (code <= 99)                    return { icon: '⛈️', label: 'Momaqaldiroq' };
  return { icon: '🌡️', label: 'Noaniq' };
};

const LAT = 40.479573;
const LON = 71.069387;

export default function MyStocksPage() {
  const [stocks, setStocks] = useState([]);
  const [fridges, setFridges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Ob-havo
  const [weather, setWeather] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(true);

  // Modal
  const [transferModal, setTransferModal] = useState({ isOpen: false, stock: null });
  const [isTransferring, setIsTransferring] = useState(false);
  const [transferForm, setTransferForm] = useState({ targetFridgeId: '', basketCount: '' });

  useEffect(() => {
    fetchStocks();
    fetchFridges();
    fetchWeather();
  }, []);

  const fetchWeather = async () => {
    try {
      setWeatherLoading(true);
      const res = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&wind_speed_unit=ms&timezone=auto`
      );
      const data = await res.json();
      const c = data.current;
      setWeather({
        temp: Math.round(c.temperature_2m),
        humidity: c.relative_humidity_2m,
        wind: Math.round(c.wind_speed_10m),
        code: c.weather_code,
      });
    } catch (err) {
      console.error('Ob-havo xatolik:', err);
    } finally {
      setWeatherLoading(false);
    }
  };

  const fetchStocks = async () => {
    try {
      setError(null);
      setLoading(true);
      const data = await stockService.getMyBalances();
      setStocks(data || []);
    } catch (err) {
      setError(err?.toString() || "Ombor ma'lumotlarini yuklashda xatolik");
    } finally {
      setLoading(false);
    }
  };

  const fetchFridges = async () => {
    try {
      const data = await fridgeService.getMyFridges();
      setFridges(data || []);
    } catch (err) {
      console.error(err);
    }
  };

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
      await stockService.transferStock(stock.stockId, {
        targetFridgeId: Number(targetFridgeId),
        basketCount: Number(basketCount),
      });
      alert("Yuk muvaffaqiyatli ko'chirildi!");
      setTransferModal({ isOpen: false, stock: null });
      setTransferForm({ targetFridgeId: '', basketCount: '' });
      fetchStocks();
    } catch (err) {
      alert(err.message || "Yukni ko'chirishda xatolik");
    } finally {
      setIsTransferring(false);
    }
  };

  const filteredStocks = stocks.filter(stock =>
    (stock.fruitName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (stock.basketName?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-6 h-6 border-2 border-gray-200 border-t-black rounded-full animate-spin" />
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
      <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-3">
        <Package size={24} />
      </div>
      <p className="text-gray-900 font-medium mb-1">Xatolik yuz berdi</p>
      <p className="text-gray-500 text-sm mb-4">{error}</p>
      <button onClick={fetchStocks} className="px-5 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium transition-colors">
        Qaytadan urinish
      </button>
    </div>
  );

  const weatherInfo = weather ? getWeatherInfo(weather.code) : null;

  return (
    <div className="p-4 md:p-6 lg:p-8 w-full max-w-[1600px] mx-auto min-h-screen flex flex-col relative">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-1 block">
            Qabul punkti
          </span>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 font-['Syne',sans-serif] tracking-tight">
            Ombor Zaxirasi
          </h1>
        </div>

        <div className="flex items-center gap-3 flex-wrap">

          {/* 🌤 OB-HAVO BADGE */}
          {weatherLoading ? (
            <div className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full text-sm text-gray-400">
              <div className="w-3.5 h-3.5 border-2 border-gray-200 border-t-gray-400 rounded-full animate-spin" />
              <span>Ob-havo...</span>
            </div>
          ) : weather ? (
            <div className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full text-sm font-semibold text-gray-700 select-none">
              <span className="text-base leading-none">{weatherInfo.icon}</span>
              <span className="font-['DM_Mono',monospace] text-gray-900">{weather.temp}°C</span>
              <span className="text-gray-300">|</span>
              <span className="text-gray-500 text-xs font-medium">{weatherInfo.label}</span>
              <span className="text-gray-300">|</span>
              <span className="flex items-center gap-1 text-xs text-gray-500">
                <Droplets size={11} className="text-blue-400" />{weather.humidity}%
              </span>
              <span className="flex items-center gap-1 text-xs text-gray-500">
                <Wind size={11} className="text-gray-400" />{weather.wind} m/s
              </span>
            </div>
          ) : null}

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Qidiruv..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-full text-sm focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 transition-all w-full md:w-[240px]"
            />
          </div>

          {/* Count */}
          <span className="bg-gray-100 border border-gray-200 text-gray-800 text-sm font-semibold px-4 py-2 rounded-full whitespace-nowrap">
            Jami: <span className="font-['DM_Mono',monospace]">{filteredStocks.length}</span>
          </span>
        </div>
      </div>

      {/* KONTENT */}
      {filteredStocks.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center bg-transparent rounded-xl border border-dashed border-gray-300 p-12 text-center">
          <Inbox size={40} className="text-gray-300 mb-3" />
          <p className="text-gray-900 font-medium mb-1 font-['Syne',sans-serif]">Zaxira topilmadi</p>
          <p className="text-gray-500 text-sm">Hozircha omborda yuk yo'q yoki natija topilmadi.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {filteredStocks.map((stock) => {
            const mainName = stock.fruitName || "Noma'lum meva";
            const qualityTag = stock.fruitQuality || "Noma'lum sifat";
            const accentColor = getAccentColor(mainName);
            let qualityColorClass = "bg-gray-100 text-gray-600";
            const upperTag = qualityTag.toUpperCase();
            if (upperTag.includes("OLIY"))                          qualityColorClass = "bg-blue-50 text-blue-700";
            else if (upperTag.includes("BIRINCHI") || upperTag.includes("1")) qualityColorClass = "bg-green-50 text-green-700";
            else if (upperTag.includes("IKKINCHI") || upperTag.includes("2")) qualityColorClass = "bg-orange-50 text-orange-700";

            return (
              <div
                key={stock.stockId}
                className="relative bg-white rounded-xl border border-gray-200 shadow-sm hover:border-gray-400 hover:-translate-y-[2px] transition-all duration-200 flex flex-col overflow-hidden"
              >
                <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: accentColor }} />

                <div className="p-4 pt-5 pb-3 flex justify-between items-start">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 font-['Syne',sans-serif] leading-none mb-2">{mainName}</h2>
                    <span className={`inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded ${qualityColorClass}`}>
                      {qualityTag}
                    </span>
                  </div>
                </div>

                <div className="px-4 pb-3 flex items-center justify-between text-sm">
                  <span className="text-gray-500 truncate pr-2" title={stock.basketName}>
                    {stock.basketName || 'Savatsiz'}
                  </span>
                  <span className="font-['DM_Mono',monospace] font-medium text-gray-900 bg-gray-50 px-2 py-0.5 rounded border border-gray-100">
                    {stock.basketCount ?? 0} ta
                  </span>
                </div>

                <div className="grid grid-cols-2 border-y border-gray-100 divide-x divide-gray-100 bg-gray-50/50">
                  <div className="p-3 flex flex-col">
                    <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider mb-1">Netto</span>
                    <span className="font-['DM_Mono',monospace] font-bold text-gray-900 text-base">
                      {stock.netWeight ?? 0} <span className="text-xs font-normal text-gray-500">kg</span>
                    </span>
                  </div>
                  <div className="p-3 flex flex-col">
                    <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider mb-1">Brutto</span>
                    <span className="font-['DM_Mono',monospace] font-bold text-gray-900 text-base">
                      {stock.grossWeight ?? 0} <span className="text-xs font-normal text-gray-500">kg</span>
                    </span>
                  </div>
                </div>

                {(stock.fruitPrice > 0 || stock.totalAmount > 0) && (
                  <div className="px-4 py-3 flex justify-between items-center text-sm border-b border-gray-100">
                    <span className="text-gray-500">
                      <span className="font-['DM_Mono',monospace]">{stock.fruitPrice?.toLocaleString() ?? 0}</span> so'm/kg
                    </span>
                    <span className="font-['DM_Mono',monospace] font-bold text-green-700">
                      {stock.totalAmount?.toLocaleString() ?? 0} so'm
                    </span>
                  </div>
                )}

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

      {/* TRANSFER MODAL */}
      {transferModal.isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => !isTransferring && setTransferModal({ isOpen: false, stock: null })}
          />
          <div className="relative w-full max-w-md bg-white rounded-[24px] shadow-2xl flex flex-col overflow-hidden">

            <div className="p-5 md:p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div>
                <h2 className="text-xl font-bold text-gray-900 font-['Syne']">Yukni ko'chirish</h2>
                <p className="text-xs text-gray-500 mt-1 font-medium">Boshqa kameraga o'tkazish yoki bo'lish</p>
              </div>
              <button
                onClick={() => !isTransferring && setTransferModal({ isOpen: false, stock: null })}
                className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5 md:p-6 flex-1">
              <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-4">
                <div className="w-12 h-12 rounded-[14px] bg-white border border-emerald-100 flex items-center justify-center text-2xl shadow-sm shrink-0">🍎</div>
                <div>
                  <h3 className="font-bold text-gray-900 text-[15px]">{transferModal.stock?.fruitName}</h3>
                  <p className="text-xs text-emerald-700 mt-1 font-bold tracking-wide">
                    {transferModal.stock?.fruitQuality} • Jami: {transferModal.stock?.basketCount} ta savat
                  </p>
                </div>
              </div>

              <form id="transferForm" className="space-y-5" onSubmit={handleTransferSubmit}>
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
                      className="w-full appearance-none p-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-gray-900 font-semibold text-[15px] cursor-pointer"
                    >
                      <option value="" disabled>Mahsulotni ko'chirish</option>
                      {fridges.map(f => (
                        <option key={f.id} value={f.id}>{f.name} ({f.temperatureCelsius}°C)</option>
                      ))}
                    </select>
                  )}
                </div>

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
                      className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-['DM_Mono',monospace] font-bold text-lg text-gray-900"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium pointer-events-none">savat</span>
                  </div>
                </div>

               
              </form>
            </div>

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