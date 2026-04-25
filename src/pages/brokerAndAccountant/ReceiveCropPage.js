import React, { useState, useEffect, useMemo } from 'react';
import Select from 'react-select'; 
import AsyncSelect from 'react-select/async'; 
import farmerService from '../../services/farmerService';
import basketService from '../../services/basketService';
import distributionService from '../../services/distributionService';
import priceService from '../../services/priceService';
import cropService from '../../services/productService';
import { 
  Scale, UserCircle, Apple, Box, Calculator, CheckCircle2, Loader2, AlertCircle, Printer, ArrowRightLeft, X, Layers
} from 'lucide-react';

export default function ReceiveCropPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);

  const [activeMode, setActiveMode] = useState('CROP'); 

  const [prices, setPrices] = useState([]);
  const [baskets, setBaskets] = useState([]);

  const [farmerBalances, setFarmerBalances] = useState([]);
  const [isBalancesLoading, setIsBalancesLoading] = useState(false);

  const [formData, setFormData] = useState({
    farmerId: null,
    priceId: null,
    hasBasket: true,
    basketId: null,
    basketCount: '',
  });

  const [weighingMode, setWeighingMode] = useState('FULL'); 
  
  const [weightBatches, setWeightBatches] = useState([]);
  const [currentWeight, setCurrentWeight] = useState('');

  const [sampleBasketCount, setSampleBasketCount] = useState('');
  const [sampleWeight, setSampleWeight] = useState('');

  const [receiptPreview, setReceiptPreview] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const uiTotalBatches = weightBatches.reduce((total, w) => total + w, 0);

  // 🟢 Fermerdagi savatlar ro'yxatidan tanlangan savat bormi tekshirish
  // farmerBalances ichida basketId bo'lmasa basketName orqali baskets dan topamiz
  const farmerBasketIds = useMemo(() => {
    if (farmerBalances.length === 0) return null; // Balans yo'q => cheklamaymiz
    return farmerBalances.map(b => {
      // Agar to'g'ridan-to'g'ri basketId kelsa — ishlatamiz
      if (b.basketId) return b.basketId;
      // Yo'q bo'lsa — basketName bo'yicha baskets dan topamiz
      const found = baskets.find(bsk => bsk.name === b.basketName);
      return found ? found.id : null;
    }).filter(Boolean);
  }, [farmerBalances, baskets]);

  // 🟢 Tanlangan savat fermerdagi savatlar ro'yxatida bormi?
  const isBasketInvalid = useMemo(() => {
    if (!formData.basketId) return false;
    if (!farmerBasketIds || farmerBasketIds.length === 0) return false;
    return !farmerBasketIds.includes(formData.basketId);
  }, [formData.basketId, farmerBasketIds]);

  useEffect(() => {
    const fetchStaticData = async () => {
      setIsLoading(true);
      try {
        const [pricesRes, basketsRes] = await Promise.all([
          priceService.getActivePrices(),
          basketService.getBaskets(0, 100)
        ]);
        setPrices(Array.isArray(pricesRes) ? pricesRes : []);
        setBaskets(Array.isArray(basketsRes?.content) ? basketsRes.content : []);
      } catch (error) {
        console.error("Yuklash xatosi", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStaticData();
  }, []);

  const loadFarmerOptions = async (inputValue) => {
    if (!inputValue) {
      try {
        const response = await farmerService.getAllFarmers('', 0, 20);
        const data = Array.isArray(response?.content) ? response.content : [];
        return data.map(f => ({ value: f.id, label: `${f.firstName} ${f.lastName} (${f.phoneNumber})` }));
      } catch (e) { return []; }
    }
    if (inputValue.length < 2) return []; 
    try {
      const response = await farmerService.getAllFarmers(inputValue, 0, 20);
      const data = Array.isArray(response?.content) ? response.content : [];
      return data.map(f => ({ value: f.id, label: `${f.firstName} ${f.lastName} (${f.phoneNumber})` }));
    } catch (error) { return []; }
  };

  useEffect(() => {
    if (formData.farmerId) {
      const fetchBalances = async () => {
        setIsBalancesLoading(true);
        try {
          const balances = await distributionService.getFarmerBalances(formData.farmerId);
          setFarmerBalances(balances || []);
        } catch (error) {
          console.error("Savatlarni yuklashda xato", error);
          setFarmerBalances([]);
        } finally {
          setIsBalancesLoading(false);
        }
      };
      fetchBalances();
    } else {
      setFarmerBalances([]);
    }
  }, [formData.farmerId]);

  const handleAddWeight = (e) => {
    e?.preventDefault();
    const weight = parseFloat(currentWeight);
    if (weight > 0) {
      setWeightBatches([...weightBatches, weight]);
      setCurrentWeight('');
    }
  };

  const handleRemoveWeight = (indexToRemove) => {
    setWeightBatches(weightBatches.filter((_, index) => index !== indexToRemove));
  };

  useEffect(() => {
    if (activeMode === 'EMPTY_BASKET' || !formData.priceId) {
      setReceiptPreview(null);
      return;
    }

    // Savat tanlanmagan yoki noto'g'ri savat tanlangan bo'lsa hisoblashni to'xtatamiz
    if (!formData.basketId || isBasketInvalid) {
      setReceiptPreview(null);
      return;
    }

    const isFullReady = weighingMode === 'FULL' && weightBatches.length > 0;
    const isAvgReady = weighingMode === 'AVERAGE' && formData.basketCount > 0 && sampleBasketCount > 0 && sampleWeight > 0;

    if (!isFullReady && !isAvgReady) {
      setReceiptPreview(null);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      setIsCalculating(true);
      try {
        const payload = {
          farmerId: formData.farmerId || 0, 
          priceId: formData.priceId,
          hasBasket: formData.hasBasket,
          basketId: formData.basketId,
          basketCount: parseInt(formData.basketCount || 0),
          weighingMode: weighingMode,
          weightBatches: weightBatches,
          sampleBasketCount: parseInt(sampleBasketCount || 0),
          sampleWeight: parseFloat(sampleWeight || 0),
          grossWeight: 0 
        };
        const result = await cropService.calculatePreview(payload);
        setReceiptPreview(result);
      } catch (error) {
        setReceiptPreview(null);
      } finally {
        setIsCalculating(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [formData, activeMode, weighingMode, weightBatches, sampleBasketCount, sampleWeight, isBasketInvalid]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.farmerId) return alert("Iltimos, fermerni tanlang!");

    if (activeMode === 'CROP') {
      // Savat tanlanmagan
      if (!formData.basketId) {
        return alert("Iltimos, savat turini tanlang! Savatsiz savdo qilib bo'lmaydi.");
      }
      // Noto'g'ri savat tanlangan
      if (isBasketInvalid) {
        return alert("Tanlangan savat ushbu fermerda yo'q! Iltimos, fermerdagi savatlardan birini tanlang.");
      }
      if (!receiptPreview) {
        setIsSubmitting(false);
        return alert("Hisob-kitob to'liq emas!");
      }
    }

    setIsSubmitting(true);
    try {
      if (activeMode === 'CROP') {
        await cropService.receiveCrop({
          farmerId: formData.farmerId,
          priceId: formData.priceId,
          hasBasket: true,
          basketId: formData.basketId,
          basketCount: parseInt(formData.basketCount),
          weighingMode: weighingMode, 
          weightBatches: weightBatches, 
          sampleBasketCount: parseInt(sampleBasketCount || 0),
          sampleWeight: parseFloat(sampleWeight || 0),
          grossWeight: 0
        });
        setSuccessMessage("Hosil muvaffaqiyatli qabul qilindi!");
      } else {
        if (!formData.basketId || !formData.basketCount) {
          setIsSubmitting(false);
          return alert("Savat turini va sonini kiriting!");
        }
        await distributionService.returnEmptyBaskets({
          farmerId: formData.farmerId,
          basketId: formData.basketId,
          quantity: parseInt(formData.basketCount)
        });
        setSuccessMessage("Bo'sh savatlar muvaffaqiyatli qabul qilindi!");
      }
      
      setFormData({ farmerId: null, priceId: null, hasBasket: true, basketId: null, basketCount: ''});
      setWeightBatches([]); setCurrentWeight('');
      setSampleBasketCount(''); setSampleWeight('');
      setReceiptPreview(null);
      setTimeout(() => setSuccessMessage(null), 5000);

    } catch (error) {
      alert(error.response?.data?.message || "Xatolik yuz berdi!");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleModeChange = (mode) => {
    setActiveMode(mode);
    setFormData({ farmerId: null, priceId: null, hasBasket: true, basketId: null, basketCount: ''});
    setWeightBatches([]); setCurrentWeight('');
    setSampleBasketCount(''); setSampleWeight('');
    setReceiptPreview(null);
  };

  // 🟢 Savat options: agar fermer tanlangan va uning savatlari bor bo'lsa — faqat o'shalarni ko'rsatamiz
  // Yo'q bo'lsa — hammasini ko'rsatamiz
  const basketOptions = useMemo(() => {
    if (farmerBasketIds && farmerBasketIds.length > 0) {
      return baskets
        .filter(b => farmerBasketIds.includes(b.id))
        .map(b => ({ value: b.id, label: `${b.name} (${b.weight} kg)` }));
    }
    return baskets.map(b => ({ value: b.id, label: `${b.name} (${b.weight} kg)` }));
  }, [baskets, farmerBasketIds]);

  const priceOptions = prices.map(p => ({ value: p.priceId, label: `${p.fruitTypeName} (${p.quality}) — ${p.amount?.toLocaleString()} so'm/kg` }));

  // Submit tugmasini bloklash sharti
  const isSubmitDisabled = isSubmitting || isCalculating ||
    (activeMode === 'CROP' && (!receiptPreview || !formData.basketId || isBasketInvalid));

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh]">
        <Loader2 className="animate-spin text-[#14A44D] mb-4" size={40} />
        <p className="text-gray-500 font-medium">Tizim tayyorlanmoqda...</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto pb-10">
      
      {successMessage && (
        <div className="mb-6 p-5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between animate-in fade-in slide-in-from-top-4 shadow-sm">
          <div className="flex items-center gap-3 text-emerald-700">
            <CheckCircle2 size={24} />
            <p className="font-bold text-[15px]">{successMessage}</p>
          </div>
          <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 bg-white border border-emerald-200 text-emerald-700 rounded-lg text-sm font-bold hover:bg-emerald-100 transition-colors">
            <Printer size={16} /> Chekni Chop Etish
          </button>
        </div>
      )}

      {/* TABLAR */}
      <div className="bg-gray-100/80 p-1.5 rounded-2xl flex items-center mb-6 shadow-inner max-w-md mx-auto border border-gray-200">
        <button onClick={() => handleModeChange('CROP')} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${activeMode === 'CROP' ? 'bg-white text-[#14A44D] shadow-md' : 'text-gray-500 hover:text-gray-700'}`}>
          <Scale size={18} /> Hosil Qabul
        </button>
        <button onClick={() => handleModeChange('EMPTY_BASKET')} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${activeMode === 'EMPTY_BASKET' ? 'bg-[#0B1A42] text-white shadow-md' : 'text-gray-500 hover:text-gray-700'}`}>
          <ArrowRightLeft size={18} /> Bo'sh Savat Qabul
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* ASOSIY FORMA */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm p-6 lg:p-8">
          <form id="receiveForm" onSubmit={handleSubmit} className="space-y-7">
            
            {/* FERMER */}
            <div>
              <label className="flex items-center gap-2 text-[13px] font-extrabold text-gray-500 uppercase tracking-wider mb-2">
                <UserCircle size={18} className={activeMode === 'CROP' ? "text-[#14A44D]" : "text-[#0B1A42]"} /> 
                {activeMode === 'CROP' ? "Hosil keltirgan fermer" : "Savat qaytarayotgan fermer"}
              </label>
              <AsyncSelect 
                cacheOptions defaultOptions loadOptions={loadFarmerOptions}
                placeholder="Ism yoki raqam bo'yicha qidirish..."
                isClearable={true}
                value={formData.farmerId ? { value: formData.farmerId, label: 'Tanlangan fermer' } : null}
                onChange={(selected) => setFormData({...formData, farmerId: selected ? selected.value : null, basketId: null, basketCount: ''})}
                className="text-sm font-medium"
                loadingMessage={() => "Qidirilmoqda..."}
                noOptionsMessage={({ inputValue }) => inputValue?.length < 2 ? "Kamida 2 ta belgi kiriting..." : "Fermer topilmadi"}
              />

              {formData.farmerId && (
                <div className="mt-3 animate-in fade-in slide-in-from-top-2">
                  {isBalancesLoading ? (
                    <div className="flex items-center gap-2 text-xs text-gray-400 font-medium">
                      <Loader2 size={14} className="animate-spin" /> Tekshirilmoqda...
                    </div>
                  ) : farmerBalances.length > 0 ? (
                    <div className="flex flex-wrap items-center gap-2 bg-blue-50/50 border border-blue-100 p-2.5 rounded-lg">
                      <span className="text-[11px] font-extrabold text-blue-800 uppercase tracking-wider">Fermerdagi savatlar:</span>
                      {farmerBalances.map((b, index) => (
                        <span key={index} className="bg-white text-blue-700 px-2.5 py-1 rounded-md text-xs font-bold border border-blue-200 shadow-sm">
                          {b.basketName}: {b.quantity} ta
                        </span>
                      ))}
                    </div>
                  ) : (
                    // 🟢 Fermerda savat yo'q — savdo qilib bo'lmaydi degan ogohlantirish
                    <div className="flex items-center gap-2 text-red-700 bg-red-50 border border-red-200 px-3 py-2.5 rounded-lg text-sm font-bold mt-2">
                      <AlertCircle size={16} className="shrink-0 text-red-500" />
                      Ushbu fermerda savat yo'q — savdo amalga oshirib bo'lmaydi!
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* HOSIL REJIMI */}
            {activeMode === 'CROP' && (
              <>
                <div>
                  <label className="flex items-center gap-2 text-[13px] font-extrabold text-gray-500 uppercase tracking-wider mb-2">
                    <Apple size={18} className="text-[#14A44D]" /> Meva turi va Joriy narx
                  </label>
                  <Select
                    options={priceOptions}
                    placeholder="Mevani tanlang..."
                    value={priceOptions.find(o => o.value === formData.priceId) || null}
                    onChange={(selected) => setFormData({...formData, priceId: selected ? selected.value : null})}
                    className="text-sm font-medium"
                    // 🟢 Fermerda savat yo'q bo'lsa narx ham tanlanmasin
                    isDisabled={formData.farmerId && farmerBalances.length === 0 && !isBalancesLoading}
                  />
                </div>

                {/* 🟢 SAVAT QISMI — DOIM OCHIQ, FAQAT FERMERDAGI SAVATLAR TANLANADI */}
                <div className={`border-2 rounded-xl p-5 space-y-4 transition-all duration-300 ${isBasketInvalid ? 'border-red-400 bg-red-50/20' : formData.basketId ? 'border-[#14A44D] bg-emerald-50/20' : 'border-gray-200 bg-gray-50/30'}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <Box size={20} className={isBasketInvalid ? "text-red-500" : "text-[#14A44D]"} />
                    <span className="font-bold text-[#0B1A42]">
                      Savat ma'lumotlari <span className="text-red-500">*</span>
                    </span>
                    <span className="ml-auto text-[11px] text-red-500 font-bold uppercase tracking-wider bg-red-50 px-2 py-0.5 rounded border border-red-100">Majburiy</span>
                  </div>

                  {/* 🟢 Fermerda savat yo'q holda bu blok ko'rsatilsa */}
                  {formData.farmerId && farmerBalances.length === 0 && !isBalancesLoading && (
                    <div className="flex items-center gap-2 text-red-700 bg-red-50 border border-red-200 px-3 py-2.5 rounded-lg text-sm font-bold">
                      <AlertCircle size={16} className="shrink-0 text-red-500" />
                      Fermerda savat yo'q. Avval savatni taqsimlang!
                    </div>
                  )}

                  {/* 🟢 Noto'g'ri savat tanlanganda xato */}
                  {isBasketInvalid && (
                    <div className="flex items-center gap-2 text-red-700 bg-red-50 border border-red-200 px-3 py-2.5 rounded-lg text-sm font-bold">
                      <AlertCircle size={16} className="shrink-0 text-red-500" />
                      Bu savat ushbu fermerda yo'q! Faqat fermerdagi savatlarni tanlash mumkin.
                    </div>
                  )}

                  {/* 🟢 Savat tanlanmagan holat */}
                  {!formData.basketId && !isBasketInvalid && (
                    <div className="flex items-center gap-2 text-amber-700 bg-amber-50 border border-amber-200 px-3 py-2.5 rounded-lg text-sm font-medium">
                      <AlertCircle size={16} className="shrink-0 text-amber-500" />
                      Savat tanlanmasa savdo amalga oshirib bo'lmaydi!
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[12px] font-bold text-gray-500 mb-1.5">
                        Savat turini tanlang
                        {farmerBasketIds && farmerBasketIds.length > 0 && (
                          <span className="ml-2 text-blue-600 font-normal">(faqat fermerdagi savatlar)</span>
                        )}
                      </label>
                      <Select
                        options={basketOptions}
                        value={basketOptions.find(o => o.value === formData.basketId) || null}
                        onChange={(selected) => setFormData({...formData, basketId: selected ? selected.value : null})}
                        className="text-sm font-medium"
                        placeholder="Savatni tanlang..."
                        isDisabled={formData.farmerId && farmerBalances.length === 0 && !isBalancesLoading}
                        // 🟢 Noto'g'ri savat tanlansa qizil chegara
                        styles={{
                          control: (base) => ({
                            ...base,
                            borderColor: isBasketInvalid ? '#EF4444' : base.borderColor,
                            '&:hover': { borderColor: isBasketInvalid ? '#DC2626' : base['&:hover']?.borderColor }
                          })
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-[12px] font-bold text-gray-500 mb-1.5">JAMI nechta savat keldi?</label>
                      <input
                        type="number" min="1"
                        value={formData.basketCount}
                        onChange={e => setFormData({...formData, basketCount: e.target.value})}
                        className="w-full h-[38px] px-3 border border-gray-300 rounded focus:ring-2 focus:ring-[#14A44D]/20 focus:border-[#14A44D]"
                        placeholder="Soni..."
                        disabled={formData.farmerId && farmerBalances.length === 0 && !isBalancesLoading}
                      />
                    </div>
                  </div>
                </div>

                {/* TAROZI QISMI */}
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                  
                  <div className="flex border-b border-gray-200 bg-gray-50">
                    <button type="button" onClick={() => setWeighingMode('FULL')} className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${weighingMode === 'FULL' ? 'bg-white text-[#14A44D] border-b-2 border-[#14A44D]' : 'text-gray-500 hover:text-gray-700'}`}>
                      <Scale size={16} /> To'liq / Qismlab Tortish
                    </button>
                    <button type="button" onClick={() => setWeighingMode('AVERAGE')} className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${weighingMode === 'AVERAGE' ? 'bg-white text-orange-600 border-b-2 border-orange-600' : 'text-gray-500 hover:text-gray-700'}`}>
                      <Layers size={16} /> O'rtacha (Namunaviy)
                    </button>
                  </div>

                  <div className="p-5">
                    
                    {weighingMode === 'FULL' && (
                      <div>
                        <div className="flex items-center gap-3 mb-4">
                          <div className="relative flex-1">
                            <input 
                              type="number" step="0.1" value={currentWeight}
                              onChange={e => setCurrentWeight(e.target.value)}
                              onKeyDown={e => e.key === 'Enter' && handleAddWeight(e)}
                              className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#14A44D]/30 focus:border-[#14A44D] text-xl font-bold text-[#0B1A42]"
                              placeholder="Vazn kiriting..."
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">KG</span>
                          </div>
                          <button type="button" onClick={handleAddWeight} disabled={!currentWeight || parseFloat(currentWeight) <= 0} className="h-[54px] px-6 bg-[#14A44D] text-white font-bold rounded-xl hover:bg-[#118f43] disabled:opacity-50">
                            QO'SHISH
                          </button>
                        </div>

                        {weightBatches.length > 0 && (
                          <div className="bg-emerald-50/50 p-3 border border-emerald-100 rounded-xl max-h-[160px] overflow-y-auto">
                            <div className="flex items-center justify-between mb-2 pl-1">
                              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Tortishlar tarixi:</span>
                              <span className="text-xs font-black text-[#14A44D] bg-emerald-100 px-2 py-0.5 rounded">UI Jami: {uiTotalBatches} kg</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {weightBatches.map((w, idx) => (
                                <div key={idx} className="flex items-center gap-1.5 bg-white border border-emerald-200 pl-2 pr-1 py-1 rounded-lg text-sm font-bold text-[#0B1A42] shadow-sm">
                                  <span className="text-gray-400 text-xs font-medium">{idx + 1}-yuk:</span> {w} kg
                                  <button type="button" onClick={() => handleRemoveWeight(idx)} className="p-1 hover:bg-red-100 text-red-500 rounded-md transition-colors"><X size={14} /></button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {weighingMode === 'AVERAGE' && (
                      <div className="bg-orange-50/50 border border-orange-100 p-5 rounded-xl space-y-4">
                        <div className="flex items-start gap-2 text-orange-800 text-sm font-medium bg-orange-100/50 p-3 rounded-lg border border-orange-200">
                          <AlertCircle size={20} className="shrink-0 mt-0.5 text-orange-600" />
                          <p>Tizim {formData.basketCount || '0'} ta savat uchun umumiy vaznni o'zi orqafonda avtomat hisoblaydi.</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[12px] font-bold text-gray-500 mb-1.5">Namuna savatlar soni</label>
                            <input type="number" min="1" value={sampleBasketCount} onChange={e => setSampleBasketCount(e.target.value)} className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 text-lg font-bold" placeholder="Masalan: 10" />
                          </div>
                          <div>
                            <label className="block text-[12px] font-bold text-gray-500 mb-1.5">Ularning vazni (Brutto)</label>
                            <div className="relative">
                              <input type="number" step="0.1" value={sampleWeight} onChange={e => setSampleWeight(e.target.value)} className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 text-lg font-bold" placeholder="Masalan: 220" />
                              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">KG</span>
                            </div>
                          </div>
                        </div>
                        
                        {receiptPreview && receiptPreview.grossWeight > 0 && weighingMode === 'AVERAGE' && (
                          <div className="mt-4 pt-4 border-t border-orange-200 flex justify-between items-center">
                            <span className="text-sm font-bold text-gray-600 uppercase tracking-wide">API da hisoblangan Jami Brutto:</span>
                            <span className="text-2xl font-black text-orange-600">{receiptPreview.grossWeight} kg</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* BO'SH SAVAT REJIMI */}
            {activeMode === 'EMPTY_BASKET' && (
              <div className="bg-blue-50/50 border border-blue-100 p-6 rounded-2xl space-y-5">
                <div className="flex items-center gap-3 text-[#0B1A42] mb-4">
                  <Box size={24} />
                  <h3 className="font-bold text-lg">Qaytarilayotgan savatlar</h3>
                </div>
                <div>
                  <label className="block text-[13px] font-extrabold text-gray-500 uppercase tracking-wider mb-2">Qaysi turdagi savat qaytarildi?</label>
                  <Select options={baskets.map(b => ({ value: b.id, label: `${b.name} (${b.weight} kg)` }))} placeholder="Savatni tanlang..." value={baskets.map(b => ({ value: b.id, label: `${b.name} (${b.weight} kg)` })).find(o => o.value === formData.basketId) || null} onChange={(selected) => setFormData({...formData, basketId: selected ? selected.value : null})} className="text-sm font-medium" />
                </div>
                <div>
                  <label className="block text-[13px] font-extrabold text-gray-500 uppercase tracking-wider mb-2">Savatlar soni</label>
                  <input type="number" min="1" required value={formData.basketCount} onChange={e => setFormData({...formData, basketCount: e.target.value})} className="w-full px-5 py-4 bg-white border border-gray-200 rounded-xl text-2xl font-black text-[#0B1A42] focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" placeholder="0" />
                </div>
              </div>
            )}

          </form>
        </div>

        {/* KVITANSIYA PANELI */}
        <div className="lg:col-span-1">
          <div className={`rounded-2xl shadow-xl p-6 text-white sticky top-6 border transition-colors duration-300 ${activeMode === 'CROP' ? 'bg-[#0B1A42] border-blue-900/50' : 'bg-gradient-to-b from-[#0B1A42] to-blue-900 border-blue-800'}`}>
            
            <h3 className="flex items-center justify-between gap-2 text-lg font-bold mb-6 border-b border-white/10 pb-4">
              <span className="flex items-center gap-2">
                {activeMode === 'CROP' ? <Calculator size={20} className="text-[#14A44D]" /> : <Box size={20} className="text-blue-400" />} 
                {activeMode === 'CROP' ? 'Kvitansiya' : "Savat Qabuli"}
              </span>
              {isCalculating && <Loader2 size={18} className="animate-spin text-[#14A44D]" />}
            </h3>

            {activeMode === 'CROP' && receiptPreview && !isBasketInvalid && (
              <div className="space-y-4 text-[14px]">
                <div className="flex justify-between items-center text-gray-300"><span>Jami Brutto:</span><span className="font-medium text-white">{receiptPreview.grossWeight} kg</span></div>
                <div className="flex justify-between items-center text-gray-300"><span>Tara ({receiptPreview.basketCount || 0} ta):</span><span className="font-medium text-red-400">- {receiptPreview.taraWeight} kg</span></div>
                <div className="pt-4 border-t border-white/10 flex justify-between items-center"><span className="font-bold text-gray-200">SOF VAZN:</span><span className="text-2xl font-black text-[#14A44D]">{receiptPreview.netWeight} kg</span></div>
                <div className="flex justify-between items-center text-gray-300 pt-3"><span>Narxi (1 kg):</span><span className="font-medium text-white">{receiptPreview.unitPrice?.toLocaleString()} UZS</span></div>
                <div className="mt-8 pt-6 border-t border-white/10">
                  <p className="text-gray-400 text-[12px] uppercase tracking-wider mb-1 font-bold">Fermer hisobiga:</p>
                  <div className="text-3xl font-black text-white break-all">{receiptPreview.totalAmount?.toLocaleString()} <span className="text-lg text-[#14A44D] font-bold">UZS</span></div>
                </div>
              </div>
            )}

            {/* 🟢 Noto'g'ri savat xatosi kvitansiyada */}
            {activeMode === 'CROP' && isBasketInvalid && (
              <div className="py-8 flex flex-col items-center justify-center text-center">
                <AlertCircle size={44} className="mb-3 text-red-400" />
                <p className="text-sm text-red-300 font-bold">Bu savat fermerda yo'q!</p>
                <p className="text-xs text-gray-400 mt-2">Faqat fermerdagi savatlarni tanlang</p>
              </div>
            )}

            {activeMode === 'EMPTY_BASKET' && (
              <div className="space-y-4 text-[14px]">
                <div className="p-4 bg-white/5 rounded-xl border border-white/10 text-center space-y-2">
                  <p className="text-gray-400 text-xs uppercase tracking-wider">Qaytariladigan Miqdor</p>
                  <div className="text-4xl font-black text-blue-400">{formData.basketCount || 0} <span className="text-lg text-gray-400">ta</span></div>
                </div>
                <p className="text-sm text-gray-300 text-center mt-4">Ushbu savatlar fermerning joriy qarzidan ayirib tashlanadi va omborga toza holatda qo'shiladi.</p>
              </div>
            )}

            {activeMode === 'CROP' && !receiptPreview && !isBasketInvalid && (
              <div className="py-12 flex flex-col items-center justify-center text-center opacity-50">
                <Calculator size={48} className="mb-3" />
                <p className="text-sm">Hisob-kitobni ko'rish uchun<br/>ma'lumotlarni kiriting</p>
              </div>
            )}

            <button 
              type="submit" form="receiveForm"
              disabled={isSubmitDisabled}
              className={`w-full mt-8 flex items-center justify-center gap-2 px-4 py-4 text-white rounded-xl font-bold transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 ${activeMode === 'CROP' ? 'bg-[#14A44D] hover:bg-[#118f43] shadow-[#14A44D]/20' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20'}`}
            >
              {isSubmitting ? <Loader2 size={20} className="animate-spin" /> : <CheckCircle2 size={20} />}
              {activeMode === 'CROP' ? 'HOSILNI QABUL QILISH' : 'SAVATNI QABUL QILISH'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}