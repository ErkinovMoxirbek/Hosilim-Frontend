import React, { useState, useEffect, useMemo, useRef } from 'react';
import Select from 'react-select';
import farmerService from '../../services/farmerService';
import basketService from '../../services/basketService';
import distributionService from '../../services/distributionService';
import priceService from '../../services/priceService';
import cropService from '../../services/cropService';
import {
  Scale, UserCircle, Apple, Box, Calculator, CheckCircle2,
  Loader2, AlertCircle, Printer, ArrowRightLeft, X, Layers, Search
} from 'lucide-react';

// ─── Konstantalar ────────────────────────────────────────────────────────────
const MODE = { CROP: 'CROP', EMPTY_BASKET: 'EMPTY_BASKET' };
const WEIGH = { FULL: 'FULL', AVERAGE: 'AVERAGE' };

const INITIAL_FORM = {
  farmerId: null,
  priceId: null,
  basketId: null,
  basketCount: '',
};

// ─── Yordamchi UI komponentlar ───────────────────────────────────────────────

function SectionLabel({ icon: Icon, text, iconClass = 'text-emerald-500' }) {
  return (
    <label className="flex items-center gap-2 text-[12px] font-extrabold text-gray-400 uppercase tracking-widest mb-3">
      <Icon size={16} className={iconClass} />
      {text}
    </label>
  );
}

function InfoBanner({ type = 'info', icon: Icon = AlertCircle, children }) {
  const styles = {
    info:    'bg-blue-50/50   border-blue-100   text-blue-800',
    warning: 'bg-amber-50/50  border-amber-100  text-amber-800',
    error:   'bg-red-50/50    border-red-100    text-red-700',
    success: 'bg-emerald-50   border-emerald-100 text-emerald-700',
  };
  return (
    <div className={`flex items-start gap-2.5 px-4 py-3 rounded-xl border text-sm font-medium shadow-sm ${styles[type]}`}>
      <Icon size={18} className="shrink-0 mt-0.5" />
      <span className="leading-relaxed">{children}</span>
    </div>
  );
}

// ─── Asosiy sahifa ────────────────────────────────────────────────────────────

export default function ReceiveCropPage() {
  // ── Holat ──────────────────────────────────────────────────────────────────
  const [isPageLoading, setIsPageLoading]     = useState(true);
  const [isSubmitting, setIsSubmitting]       = useState(false);
  const [isCalculating, setIsCalculating]     = useState(false);
  const [successMessage, setSuccessMessage]   = useState(null);

  const [activeMode, setActiveMode]           = useState(MODE.CROP);
  const [weighingMode, setWeighingMode]       = useState(WEIGH.FULL);

  // Ma'lumotlar
  const [prices, setPrices]                   = useState([]);
  const [allBaskets, setAllBaskets]           = useState([]);
  const [farmerBaskets, setFarmerBaskets]     = useState([]); 
  const [isFarmerBasketsLoading, setIsFarmerBasketsLoading] = useState(false);

  // Forma
  const [form, setForm]                       = useState(INITIAL_FORM);
  const updateForm = (patch) => setForm(prev => ({ ...prev, ...patch }));

  // Qidiruv holatlari
  const [farmerSearch, setFarmerSearch]       = useState('');
  const [searchResults, setSearchResults]     = useState([]);
  const [isSearchingFarmer, setIsSearchingFarmer] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen]   = useState(false);
  const [selectedFarmer, setSelectedFarmer]   = useState(null);
  const dropdownRef = useRef(null);

  // Tortish
  const [weightBatches, setWeightBatches]     = useState([]);
  const [currentWeight, setCurrentWeight]     = useState('');
  const [sampleCount, setSampleCount]         = useState('');
  const [sampleWeight, setSampleWeight]       = useState('');

  // Kvitansiya
  const [receipt, setReceipt]                 = useState(null);

  // ── Bosish orqali yopish (Dropdown) ────────────────────────────────────────
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ── Statik ma'lumotlarni yuklash ───────────────────────────────────────────
  useEffect(() => {
    (async () => {
      setIsPageLoading(true);
      try {
        const [pricesRes, basketsRes] = await Promise.all([
          priceService.getActivePrices(),
          basketService.getBaskets(0, 100),
        ]);
        setPrices(Array.isArray(pricesRes) ? pricesRes : []);
        setAllBaskets(Array.isArray(basketsRes?.content) ? basketsRes.content : []);
      } catch (err) {
        console.error('Statik ma\'lumotlarni yuklashda xato:', err);
      } finally {
        setIsPageLoading(false);
      }
    })();
  }, []);

  // ── Farmer qidirish mantig'i (Debounce) ────────────────────────────────────
  useEffect(() => {
    if (farmerSearch.trim().length < 2) {
      setSearchResults([]);
      setIsSearchingFarmer(false);
      return;
    }
    
    setIsSearchingFarmer(true);
    const timer = setTimeout(async () => {
      try {
        const res = await farmerService.getAllFarmers(farmerSearch.trim(), 0, 20);
        setSearchResults(Array.isArray(res?.content) ? res.content : []);
      } catch (err) {
        console.error('Fermer qidirishda xato:', err);
        setSearchResults([]);
      } finally {
        setIsSearchingFarmer(false);
        setIsDropdownOpen(true);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [farmerSearch]);

  // ── Farmer tanlanganida uning savatlarini yuklash ──────────────────────────
  useEffect(() => {
    if (!form.farmerId) {
      setFarmerBaskets([]);
      return;
    }
    (async () => {
      setIsFarmerBasketsLoading(true);
      try {
        const balances = await distributionService.getFarmerBalances(form.farmerId);
        setFarmerBaskets(Array.isArray(balances) ? balances : []);
      } catch (err) {
        console.error('Fermer savatlarini yuklashda xato:', err);
        setFarmerBaskets([]);
      } finally {
        setIsFarmerBasketsLoading(false);
      }
    })();
  }, [form.farmerId]);

  // ── Select options hisoblash ───────────────────────────────────────────────
  const farmerBasketIds = useMemo(() => {
    if (farmerBaskets.length === 0) return [];
    return farmerBaskets.map(b => {
      if (b.basketId) return b.basketId;
      const found = allBaskets.find(bsk => bsk.name === b.basketName);
      return found?.id ?? null;
    }).filter(Boolean);
  }, [farmerBaskets, allBaskets]);

  const basketOptions = useMemo(() => {
    const filtered = farmerBasketIds.length > 0
      ? allBaskets.filter(b => farmerBasketIds.includes(b.id))
      : allBaskets;
    return filtered.map(b => ({ value: b.id, label: `${b.name} (${b.weight} kg)` }));
  }, [allBaskets, farmerBasketIds]);

  const priceOptions = useMemo(() =>
    prices.map(p => ({
      value: p.priceId,
      label: `${p.fruitTypeName} (${p.quality}) — ${p.amount?.toLocaleString()} so'm/kg`,
    })), [prices]);

  // ── Tanlangan savat bo'yicha ruxsat etilgan maksimal son (LIMIT) ───────────
  const maxAllowedBaskets = useMemo(() => {
    if (!form.basketId || farmerBaskets.length === 0) return 0;

    const selectedBasket = allBaskets.find(b => b.id === form.basketId);
    if (!selectedBasket) return 0;

    const farmerBasket = farmerBaskets.find(b => 
      b.basketId === form.basketId || b.basketName === selectedBasket.name
    );

    return farmerBasket ? farmerBasket.quantity : 0;
  }, [form.basketId, farmerBaskets, allBaskets]);

  // ── Kvitansiya hisob-kitobi ──────────────────────────────────────────────
  const isReadyToCalculate = useMemo(() => {
    if (activeMode !== MODE.CROP) return false;
    if (!form.farmerId || !form.priceId || !form.basketId) return false;
    if (farmerBaskets.length === 0) return false;

    if (weighingMode === WEIGH.FULL)    return weightBatches.length > 0;
    if (weighingMode === WEIGH.AVERAGE) return form.basketCount > 0 && sampleCount > 0 && sampleWeight > 0;
    return false;
  }, [activeMode, form, weighingMode, weightBatches, sampleCount, sampleWeight, farmerBaskets]);

  useEffect(() => {
    if (!isReadyToCalculate) {
      setReceipt(null);
      return;
    }
    const timer = setTimeout(async () => {
      setIsCalculating(true);
      try {
        const payload = {
          farmerId:         form.farmerId,
          priceId:          form.priceId,
          hasBasket:        true,
          basketId:         form.basketId,
          basketCount:      parseInt(form.basketCount || 0),
          weighingMode,
          weightBatches,
          sampleBasketCount: parseInt(sampleCount || 0),
          sampleWeight:      parseFloat(sampleWeight || 0),
          grossWeight:       0,
        };
        const result = await cropService.calculatePreview(payload);
        setReceipt(result);
      } catch {
        setReceipt(null);
      } finally {
        setIsCalculating(false);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [isReadyToCalculate, form.farmerId, form.priceId, form.basketId, form.basketCount, weighingMode, weightBatches, sampleCount, sampleWeight]);

  // ── Amallar ───────────────────────────────────────────────────────────────
  const addWeight = (e) => {
    e?.preventDefault();
    const val = parseFloat(currentWeight);
    if (val > 0) {
      setWeightBatches(prev => [...prev, val]);
      setCurrentWeight('');
    }
  };

  const removeWeight = (idx) => setWeightBatches(prev => prev.filter((_, i) => i !== idx));

  const resetAll = () => {
    setForm(INITIAL_FORM);
    setSelectedFarmer(null);
    setFarmerSearch('');
    setWeightBatches([]);
    setCurrentWeight('');
    setSampleCount('');
    setSampleWeight('');
    setReceipt(null);
    setFarmerBaskets([]);
  };

  const switchMode = (mode) => {
    setActiveMode(mode);
    resetAll();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.farmerId) return alert('Iltimos, fermerni tanlang!');

    if (activeMode === MODE.CROP) {
      if (!form.basketId)          return alert('Savat turini tanlang!');
      if (farmerBaskets.length === 0) return alert('Bu fermerda savat yo\'q!');
      if (!receipt)                return alert('Hisob-kitob to\'liq emas!');
    }

    if (activeMode === MODE.EMPTY_BASKET) {
      if (!form.basketId || !form.basketCount) return alert('Savat turi va sonini kiriting!');
    }

    setIsSubmitting(true);
    try {
      if (activeMode === MODE.CROP) {
        await cropService.receiveCrop({
          farmerId:          form.farmerId,
          priceId:           form.priceId,
          hasBasket:         true,
          basketId:          form.basketId,
          basketCount:       parseInt(form.basketCount),
          weighingMode,
          weightBatches,
          sampleBasketCount: parseInt(sampleCount || 0),
          sampleWeight:      parseFloat(sampleWeight || 0),
          grossWeight:       0,
        });
        setSuccessMessage('Hosil muvaffaqiyatli qabul qilindi!');
      } else {
        await distributionService.returnEmptyBaskets({
          farmerId:  form.farmerId,
          basketId:  form.basketId,
          quantity:  parseInt(form.basketCount),
        });
        setSuccessMessage("Bo'sh savatlar muvaffaqiyatli qabul qilindi!");
      }

      resetAll();
      setTimeout(() => setSuccessMessage(null), 6000);
    } catch (err) {
      alert(err.response?.data?.message || 'Xatolik yuz berdi!');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Yordamchi o'zgaruvchilar ───────────────────────────────────────────────
  const farmerHasNoBaskets = form.farmerId && !isFarmerBasketsLoading && farmerBaskets.length === 0;
  const isSubmitDisabled   = isSubmitting || isCalculating ||
    (activeMode === MODE.CROP && (!receipt || !form.basketId || farmerHasNoBaskets));

  const totalBatchWeight = weightBatches.reduce((s, w) => s + w, 0);

  // ── Sahifa yuklanayotgan holat ─────────────────────────────────────────────
  if (isPageLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] gap-4">
        <Loader2 className="animate-spin text-emerald-500" size={36} />
        <p className="text-gray-400 font-medium text-sm">Tizim tayyorlanmoqda...</p>
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto pb-16">

      {/* Muvaffaqiyat xabari */}
      {successMessage && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3 text-emerald-700">
            <CheckCircle2 size={22} />
            <span className="font-bold">{successMessage}</span>
          </div>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-3 py-1.5 bg-white border border-emerald-200 text-emerald-700 rounded-lg text-xs font-bold hover:bg-emerald-50 transition-colors"
          >
            <Printer size={14} /> Chek chop etish
          </button>
        </div>
      )}

      {/* ── Rejim tanlash ─────────────────────────────────────────────────── */}
      <div className="flex items-center bg-gray-100/80 p-1.5 rounded-2xl max-w-sm mx-auto mb-8 border border-gray-200 shadow-inner">
        {[
          { key: MODE.CROP,         label: 'Hosil Qabul',       Icon: Scale,          active: 'bg-white text-emerald-600 shadow-sm border border-gray-100' },
          { key: MODE.EMPTY_BASKET, label: "Bo'sh Savat",       Icon: ArrowRightLeft, active: 'bg-[#0B1A42] text-white shadow-sm' },
        ].map(({ key, label, Icon, active }) => (
          <button
            key={key}
            onClick={() => switchMode(key)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all duration-200 ${activeMode === key ? active : 'text-gray-400 hover:text-gray-600'}`}
          >
            <Icon size={16} /> {label}
          </button>
        ))}
      </div>

      {/* ── Asosiy grid ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Forma paneli ────────────────────────────────────────────────── */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8 space-y-8">
          <form id="mainForm" onSubmit={handleSubmit} className="space-y-8">

            {/* 1. FERMER TANLASH */}
            <div className="bg-gray-50/50 p-5 rounded-2xl border border-gray-100">
              <SectionLabel
                icon={UserCircle}
                text={activeMode === MODE.CROP ? 'Hosil keltirgan fermer' : 'Savat qaytarayotgan fermer'}
                iconClass={activeMode === MODE.CROP ? 'text-emerald-500' : 'text-blue-600'}
              />
              
              <div className="relative" ref={dropdownRef}>
                {selectedFarmer ? (
                  <div className="flex items-center justify-between px-5 py-4 bg-emerald-50 border border-emerald-200 rounded-xl shadow-sm">
                    <div>
                      <span className="font-black text-emerald-900 block text-base">
                        {selectedFarmer.firstName} {selectedFarmer.lastName}
                      </span>
                      <span className="text-sm font-medium text-emerald-700/80 mt-0.5 block">
                        {selectedFarmer.phoneNumber}
                      </span>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => {
                        setSelectedFarmer(null);
                        updateForm({ farmerId: null, basketId: null, basketCount: '' });
                        setReceipt(null);
                        setWeightBatches([]);
                      }}
                      className="p-2 bg-white text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg shadow-sm border border-emerald-100 transition-all"
                    >
                      <X size={20} strokeWidth={2.5} />
                    </button>
                  </div>
                ) : (
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      {isSearchingFarmer ? (
                        <Loader2 size={20} className="text-emerald-500 animate-spin" />
                      ) : (
                        <Search size={20} className="text-gray-400" />
                      )}
                    </div>
                    <input
                      type="text" 
                      autoComplete="off" 
                      value={farmerSearch}
                      onChange={e => setFarmerSearch(e.target.value)}
                      onFocus={() => { if (farmerSearch.length >= 2) setIsDropdownOpen(true); }}
                      placeholder="Kamida 2 ta harf yoki raqam yozing..."
                      className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-300 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 rounded-xl text-gray-900 outline-none transition-all font-medium text-base shadow-sm"
                    />
                    
                    {/* Qidiruv natijalari */}
                    {isDropdownOpen && farmerSearch.length >= 2 && (
                      <div className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-xl border border-gray-100 max-h-64 overflow-y-auto overflow-x-hidden">
                        {isSearchingFarmer ? (
                          <div className="p-5 text-center text-gray-500 text-sm flex items-center justify-center gap-2">
                            <Loader2 size={18} className="animate-spin text-emerald-500" /> Baza tekshirilmoqda...
                          </div>
                        ) : searchResults.length === 0 ? (
                          <div className="p-5 text-center text-gray-500 text-sm font-medium">Fermer topilmadi.</div>
                        ) : (
                          searchResults.map(f => (
                            <div 
                              key={f.id}
                              onMouseDown={e => { 
                                e.preventDefault(); 
                                setSelectedFarmer(f);
                                updateForm({ farmerId: f.id, basketId: null, basketCount: '' });
                                setFarmerSearch('');
                                setSearchResults([]);
                                setIsDropdownOpen(false);
                                setReceipt(null);
                                setWeightBatches([]);
                              }}
                              className="flex flex-col px-5 py-3.5 hover:bg-emerald-50/70 border-b border-gray-50 last:border-0 cursor-pointer transition-colors"
                            >
                              <span className="font-bold text-gray-800 text-base">{f.firstName} {f.lastName}</span>
                              <span className="text-sm font-medium text-gray-500 mt-0.5">{f.phoneNumber}</span>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* FERMER OMBORI UI */}
              {form.farmerId && (
                <div className="mt-4">
                  {isFarmerBasketsLoading ? (
                    <div className="flex items-center gap-2 text-sm text-gray-400 font-medium p-2">
                      <Loader2 size={16} className="animate-spin" /> Ma'lumotlar olinmoqda...
                    </div>
                  ) : farmerBaskets.length > 0 ? (
                    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[11px] font-extrabold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                          <Box size={14} className="text-gray-400" />
                          Fermerdagi savatlar (Qarz)
                        </span>
                        <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-bold">
                          {farmerBaskets.length} xil tara
                        </span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {farmerBaskets.map((b, i) => (
                          <div key={i} className="bg-gray-50 border border-gray-100 rounded-lg p-3 flex flex-col hover:bg-emerald-50/50 hover:border-emerald-100 transition-colors">
                            <span className="text-[11px] font-bold text-gray-500 truncate mb-1" title={b.basketName}>
                              {b.basketName}
                            </span>
                            <div className="flex items-baseline gap-1 mt-auto">
                              <span className="text-lg font-black text-gray-800 leading-none">{b.quantity}</span>
                              <span className="text-[10px] font-bold text-gray-400 uppercase">ta</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <InfoBanner type="error">
                      Bu fermerda tarqatilgan savat yo'q!
                    </InfoBanner>
                  )}
                </div>
              )}
            </div>

            {/* ── HOSIL QABUL rejimi ─────────────────────────────────────── */}
            {activeMode === MODE.CROP && (
              <>
                {/* 2. NARX */}
                <div>
                  <SectionLabel icon={Apple} text="Meva turi va narx" />
                  <Select
                    options={priceOptions}
                    placeholder="Mevani tanlang..."
                    value={priceOptions.find(o => o.value === form.priceId) ?? null}
                    onChange={(sel) => updateForm({ priceId: sel?.value ?? null })}
                    className="text-sm font-medium"
                    isDisabled={farmerHasNoBaskets}
                    styles={{
                      control: (base, state) => ({
                        ...base,
                        padding: '2px',
                        borderRadius: '0.75rem',
                        borderColor: state.isFocused ? '#10B981' : '#D1D5DB',
                        boxShadow: state.isFocused ? '0 0 0 4px rgba(16, 185, 129, 0.1)' : 'none',
                        '&:hover': { borderColor: '#10B981' }
                      })
                    }}
                  />
                </div>

                {/* 3. SAVAT */}
                {form.farmerId && !isFarmerBasketsLoading && farmerBaskets.length > 0 && (
                  <div className={`border-2 rounded-2xl p-5 sm:p-6 space-y-5 transition-colors duration-300 ${form.basketId ? 'border-emerald-500 bg-emerald-50/20' : 'border-gray-200'}`}>
                    <SectionLabel icon={Box} text="Savat ma'lumotlari" />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      {/* Savat turi */}
                      <div>
                        <label className="block text-[11px] font-bold text-gray-500 mb-2 uppercase tracking-wide">
                          Savat turi
                        </label>
                        <Select
                          options={basketOptions}
                          value={basketOptions.find(o => o.value === form.basketId) ?? null}
                          onChange={(sel) => {
                            updateForm({ basketId: sel?.value ?? null, basketCount: '' });
                          }}
                          placeholder="Tanlang..."
                          className="text-sm font-medium"
                          styles={{
                            control: (base, state) => ({
                              ...base,
                              borderRadius: '0.75rem',
                              borderColor: state.isFocused ? '#10B981' : '#D1D5DB',
                              boxShadow: state.isFocused ? '0 0 0 4px rgba(16, 185, 129, 0.1)' : 'none',
                              '&:hover': { borderColor: '#10B981' }
                            })
                          }}
                        />
                        {basketOptions.length === 0 && (
                          <p className="text-[11px] font-medium text-amber-600 mt-2">Bu fermerga mos savat topilmadi</p>
                        )}
                      </div>

                      {/* Savat soni (LIMIT BILAN) */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide">
                            Nechta savat keldi?
                          </label>
                          {maxAllowedBaskets > 0 && (
                            <span className="text-[10px] font-extrabold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-md">
                              Maks: {maxAllowedBaskets} ta
                            </span>
                          )}
                        </div>
                        <input
                          type="number"
                          min="1"
                          max={maxAllowedBaskets}
                          value={form.basketCount}
                          onChange={e => {
                            let val = parseInt(e.target.value, 10);
                            
                            if (isNaN(val)) {
                              updateForm({ basketCount: '' });
                              return;
                            }

                            // Limitdan oshib ketsa, maksimalga tushiramiz
                            if (val > maxAllowedBaskets) {
                              val = maxAllowedBaskets;
                            }
                            
                            updateForm({ basketCount: val.toString() });
                          }}
                          disabled={!form.basketId}
                          className="w-full h-[42px] px-4 border border-gray-300 rounded-xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 text-sm font-bold transition-all outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                          placeholder="Soni..."
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. TORTISH REJIMI */}
                {form.farmerId && farmerBaskets.length > 0 && form.basketId && (
                  <div className="border border-gray-200 rounded-2xl overflow-hidden shadow-sm">

                    {/* Tab */}
                    <div className="flex bg-gray-50/80 border-b border-gray-200">
                      {[
                        { key: WEIGH.FULL,    label: "To'liq / Qismlab",  Icon: Scale,  activeColor: 'text-emerald-600 border-emerald-500 bg-white' },
                        { key: WEIGH.AVERAGE, label: "O'rtacha (Namunaviy)", Icon: Layers, activeColor: 'text-orange-600 border-orange-500 bg-white' },
                      ].map(({ key, label, Icon, activeColor }) => (
                        <button
                          key={key}
                          type="button"
                          onClick={() => { setWeighingMode(key); setReceipt(null); }}
                          className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-bold border-b-2 transition-all ${weighingMode === key ? activeColor : 'border-transparent text-gray-400 hover:text-gray-600 hover:bg-gray-100/50'}`}
                        >
                          <Icon size={16} /> {label}
                        </button>
                      ))}
                    </div>

                    <div className="p-5 sm:p-6 bg-white">

                      {/* To'liq tortish */}
                      {weighingMode === WEIGH.FULL && (
                        <div className="space-y-4">
                          <div className="flex gap-3">
                            <div className="relative flex-1">
                              <input
                                type="number"
                                step="0.1"
                                value={currentWeight}
                                onChange={e => setCurrentWeight(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && addWeight(e)}
                                className="w-full px-5 py-3.5 bg-gray-50 border border-gray-300 rounded-xl text-xl font-black text-gray-800 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all"
                                placeholder="Vazn kiriting..."
                              />
                              <span className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 font-black text-sm pointer-events-none">KG</span>
                            </div>
                            <button
                              type="button"
                              onClick={addWeight}
                              disabled={!currentWeight || parseFloat(currentWeight) <= 0}
                              className="px-6 bg-[#1B5E20] text-white font-bold rounded-xl hover:bg-green-800 disabled:opacity-40 transition-colors flex items-center justify-center shadow-sm"
                            >
                              Qo'shish
                            </button>
                          </div>

                          {weightBatches.length > 0 && (
                            <div className="bg-emerald-50/50 border border-emerald-100 p-4 rounded-xl">
                              <div className="flex justify-between items-center mb-3">
                                <span className="text-[11px] font-extrabold text-gray-500 uppercase tracking-widest">
                                  Tortishlar ({weightBatches.length} marta)
                                </span>
                                <span className="text-emerald-700 font-black bg-emerald-100 px-2 py-0.5 rounded-md">
                                  Jami: {totalBatchWeight.toFixed(1)} kg
                                </span>
                              </div>
                              <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto pr-1 custom-scrollbar">
                                {weightBatches.map((w, i) => (
                                  <div key={i} className="flex items-center gap-2 bg-white border border-emerald-200 pl-3 pr-1.5 py-1.5 rounded-lg text-sm font-bold text-gray-700 shadow-sm group">
                                    <span className="text-gray-400 text-xs font-medium w-4">{i + 1}.</span> 
                                    <span className="w-12 text-right">{w} kg</span>
                                    <button type="button" onClick={() => removeWeight(i)} className="p-1 hover:bg-red-50 text-red-400 rounded-md transition-colors opacity-0 group-hover:opacity-100">
                                      <X size={14} strokeWidth={3} />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* O'rtacha tortish */}
                      {weighingMode === WEIGH.AVERAGE && (
                        <div className="space-y-5">
                          <InfoBanner type="info" icon={AlertCircle}>
                            Namuna savatlarni torting. Tizim jami <strong>{form.basketCount || '0'}</strong> ta savat uchun umumiy vaznni avtomatik hisoblaydi.
                          </InfoBanner>
                          <div className="grid grid-cols-2 gap-5">
                            <div>
                              <label className="block text-[11px] font-bold text-gray-500 mb-2 uppercase tracking-wide">
                                Namuna savatlar soni
                              </label>
                              <input
                                type="number"
                                min="1"
                                value={sampleCount}
                                onChange={e => setSampleCount(e.target.value)}
                                className="w-full px-5 py-3.5 border border-gray-300 rounded-xl text-lg font-black focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all"
                                placeholder="Masalan: 5"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-bold text-gray-500 mb-2 uppercase tracking-wide">
                                Ularning brutto vazni
                              </label>
                              <div className="relative">
                                <input
                                  type="number"
                                  step="0.1"
                                  value={sampleWeight}
                                  onChange={e => setSampleWeight(e.target.value)}
                                  className="w-full px-5 py-3.5 border border-gray-300 rounded-xl text-lg font-black focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all"
                                  placeholder="Masalan: 110"
                                />
                                <span className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 font-black text-sm pointer-events-none">KG</span>
                              </div>
                            </div>
                          </div>

                          {receipt?.grossWeight > 0 && (
                            <div className="flex justify-between items-center pt-4 border-t border-orange-100">
                              <span className="text-sm font-bold text-gray-500">Hisoblab topilgan jami brutto:</span>
                              <span className="text-2xl font-black text-orange-600 bg-orange-50 px-3 py-1 rounded-lg">{receipt.grossWeight} kg</span>
                            </div>
                          )}
                        </div>
                      )}

                    </div>
                  </div>
                )}
              </>
            )}

            {/* ── BO'SH SAVAT QABUL rejimi ───────────────────────────────── */}
            {activeMode === MODE.EMPTY_BASKET && form.farmerId && !isFarmerBasketsLoading && farmerBaskets.length > 0 && (
              <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-6 space-y-6 mt-4">
                <div className="flex items-center gap-2.5 text-[#0B1A42] border-b border-blue-100/50 pb-4">
                  <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                    <Box size={20} />
                  </div>
                  <h3 className="font-black text-lg">Qaytarilayotgan savatlar</h3>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <SectionLabel icon={Box} text="Savat turi" iconClass="text-blue-600" />
                    <Select
                      options={basketOptions}
                      placeholder="Savatni tanlang..."
                      value={basketOptions.find(o => o.value === form.basketId) ?? null}
                      onChange={(sel) => {
                        updateForm({ basketId: sel?.value ?? null, basketCount: '' });
                      }}
                      className="text-sm font-medium"
                      styles={{
                        control: (base, state) => ({
                          ...base,
                          borderRadius: '0.75rem',
                          borderColor: state.isFocused ? '#2563EB' : '#D1D5DB',
                          boxShadow: state.isFocused ? '0 0 0 4px rgba(37, 99, 235, 0.1)' : 'none',
                          '&:hover': { borderColor: '#2563EB' }
                        })
                      }}
                    />
                  </div>
                  
                  {/* Savat soni (LIMIT BILAN) */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide">
                        Savatlar soni
                      </label>
                      {maxAllowedBaskets > 0 && (
                        <span className="text-[10px] font-extrabold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-md">
                          Maks: {maxAllowedBaskets} ta
                        </span>
                      )}
                    </div>
                    <input
                      type="number"
                      min="1"
                      max={maxAllowedBaskets}
                      required
                      value={form.basketCount}
                      onChange={e => {
                        let val = parseInt(e.target.value, 10);
                        if (isNaN(val)) {
                          updateForm({ basketCount: '' });
                          return;
                        }
                        if (val > maxAllowedBaskets) val = maxAllowedBaskets;
                        updateForm({ basketCount: val.toString() });
                      }}
                      disabled={!form.basketId}
                      className="w-full h-[42px] px-4 bg-white border border-gray-300 rounded-xl text-lg font-black text-[#0B1A42] focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>
            )}

          </form>
        </div>

        {/* ── Kvitansiya paneli ────────────────────────────────────────────── */}
        <div className="lg:col-span-1">
          <div className="bg-[#0B1A42] rounded-2xl shadow-xl p-6 sm:p-7 text-white sticky top-6 border border-blue-900/50">

            {/* Sarlavha */}
            <div className="flex items-center justify-between mb-7 border-b border-white/10 pb-4">
              <span className="flex items-center gap-2.5 text-base font-black uppercase tracking-wide">
                {activeMode === MODE.CROP
                  ? <><div className="bg-emerald-500/20 p-1.5 rounded-md"><Calculator size={18} className="text-emerald-400" /></div> Kvitansiya</>
                  : <><div className="bg-blue-500/20 p-1.5 rounded-md"><Box size={18} className="text-blue-400" /></div> Savat Qabuli</>
                }
              </span>
              {isCalculating && <Loader2 size={18} className="animate-spin text-emerald-400" />}
            </div>

            {/* CROP kvitansiya */}
            {activeMode === MODE.CROP && (
              receipt ? (
                <div className="space-y-4 text-sm font-medium">
                  <ReceiptRow label="Jami brutto" value={`${receipt.grossWeight} kg`} />
                  <ReceiptRow label={`Tara (${receipt.basketCount || 0} ta savat)`} value={`− ${receipt.taraWeight} kg`} valueClass="text-red-400" />
                  <div className="pt-4 border-t border-white/10 flex justify-between items-center">
                    <span className="font-extrabold text-gray-400 uppercase tracking-widest text-xs">Sof vazn</span>
                    <span className="text-3xl font-black text-emerald-400">{receipt.netWeight} <span className="text-lg">kg</span></span>
                  </div>
                  <ReceiptRow label="Narx (1 kg)" value={`${receipt.unitPrice?.toLocaleString()} UZS`} />
                  <div className="mt-8 pt-6 border-t border-white/10 bg-white/5 -mx-6 -mb-6 p-6 rounded-b-2xl">
                    <p className="text-gray-400 text-[11px] uppercase tracking-widest mb-2 font-extrabold flex items-center justify-between">
                      Fermer hisobiga:
                      <CheckCircle2 size={14} className="text-emerald-500" />
                    </p>
                    <div className="text-4xl font-black break-all text-white leading-none">
                      {receipt.totalAmount?.toLocaleString()}
                      <span className="text-xl text-emerald-500 font-bold ml-1.5">UZS</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-16 flex flex-col items-center text-center opacity-40">
                  <Calculator size={56} className="mb-4 text-emerald-400/50" />
                  <p className="text-sm font-medium leading-relaxed max-w-[200px]">
                    {!form.farmerId
                      ? 'Avval qidiruv orqali fermerni tanlang'
                      : farmerHasNoBaskets
                      ? 'Bu fermerda savat yo\'q'
                      : !form.priceId
                      ? 'Meva turini tanlang'
                      : !form.basketId
                      ? 'Savatni tanlang'
                      : 'Vazn kiriting'
                    }
                  </p>
                </div>
              )
            )}

            {/* EMPTY_BASKET kvitansiya */}
            {activeMode === MODE.EMPTY_BASKET && (
              <div className="space-y-5 text-sm">
                <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center space-y-2">
                  <p className="text-gray-400 text-xs uppercase tracking-widest font-bold">Qaytariladigan jami</p>
                  <div className="text-5xl font-black text-blue-400">
                    {form.basketCount || 0} <span className="text-xl text-gray-400">ta</span>
                  </div>
                </div>
                <p className="text-xs text-gray-400 text-center leading-relaxed font-medium bg-white/5 p-3 rounded-lg">
                  Savatlar fermerning qarzidan ayirilib, to'g'ridan-to'g'ri umumiy omborga qo'shiladi.
                </p>
              </div>
            )}

            {/* Submit tugmasi */}
            <button
              type="submit"
              form="mainForm"
              disabled={isSubmitDisabled}
              className={`w-full ${activeMode === MODE.CROP ? (receipt ? 'mt-6' : 'mt-8') : 'mt-8'} flex items-center justify-center gap-2 py-4 rounded-xl font-extrabold text-[13px] uppercase tracking-wider transition-all disabled:opacity-30 disabled:cursor-not-allowed active:scale-[0.98] shadow-lg ${activeMode === MODE.CROP ? 'bg-emerald-500 hover:bg-emerald-400 text-[#0B1A42]' : 'bg-blue-600 hover:bg-blue-500 text-white'}`}
            >
              {isSubmitting
                ? <Loader2 size={18} className="animate-spin" />
                : <CheckCircle2 size={18} strokeWidth={2.5} />
              }
              {activeMode === MODE.CROP ? 'HOSILNI QABUL QILISH' : 'SAVATNI QABUL QILISH'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

// ── Kichik yordamchi komponent ────────────────────────────────────────────────
function ReceiptRow({ label, value, valueClass = 'text-white' }) {
  return (
    <div className="flex justify-between items-center text-gray-300">
      <span>{label}</span>
      <span className={`font-bold ${valueClass}`}>{value}</span>
    </div>
  );
}