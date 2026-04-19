import React, { useState, useEffect } from 'react';
import Select from 'react-select'; 
import AsyncSelect from 'react-select/async'; 
import farmerService from '../../services/farmerService';
import basketService from '../../services/basketService';
import priceService from '../../services/priceService';
import productService from '../../services/productService';
import { 
  Scale, UserCircle, Apple, Box, Calculator, CheckCircle2, Loader2, AlertCircle, Printer
} from 'lucide-react';

export default function ReceiveCropPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);

  // Bazadan keladigan statik ro'yxatlar (Meva va Savat)
  const [prices, setPrices] = useState([]);
  const [baskets, setBaskets] = useState([]);

  // Forma State
  const [formData, setFormData] = useState({
    farmerId: null,
    priceId: null,
    hasBasket: false,
    basketId: null,
    basketCount: '',
    grossWeight: ''
  });

  // Backenddan keladigan tayyor hisob-kitob (Kvitansiya)
  const [receiptPreview, setReceiptPreview] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // ==========================================
  // 1. STATIK MA'LUMOTLARNI YUKLASH (Meva va Savat)
  // ==========================================
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
        console.error("Ma'lumotlarni yuklashda xatolik yuz berdi!", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStaticData();
  }, []);

  // ==========================================
  // 2. FERMERLARNI ASINXRON QIDIRISH (API)
  // ==========================================
  const loadFarmerOptions = async (inputValue) => {
    // Agar qidiruv maydoni bo'sh bo'lsa, dastlabki 20 ta fermerni ko'rsatamiz
    if (!inputValue) {
      try {
        const response = await farmerService.getAllFarmers('', 0, 20);
        const data = Array.isArray(response?.content) ? response.content : (Array.isArray(response) ? response : []);
        return data.map(f => ({ value: f.id, label: `${f.firstName} ${f.lastName} (${f.phoneNumber})` }));
      } catch (e) {
        return [];
      }
    }

    // 2 ta belgidan kam yozilgan bo'lsa API ga bormaydi (to'xtatiladi)
    if (inputValue.length < 2) {
      return []; 
    }

    // Backenddan qidirib topish
    try {
      const response = await farmerService.getAllFarmers(inputValue, 0, 20);
      const data = Array.isArray(response?.content) ? response.content : (Array.isArray(response) ? response : []);
      
      return data.map(f => ({ 
        value: f.id, 
        label: `${f.firstName} ${f.lastName} (${f.phoneNumber})` 
      }));
    } catch (error) {
      console.error("Fermerlarni qidirishda xatolik", error);
      return [];
    }
  };

  // ==========================================
  // 3. JONLI HISOB-KITOB (BACKEND ORQALI)
  // ==========================================
  useEffect(() => {
    // Agar muhim maydonlar to'ldirilmagan bo'lsa, Kvitansiyani yashiramiz
    if (!formData.priceId || !formData.grossWeight || parseFloat(formData.grossWeight) <= 0) {
      setReceiptPreview(null);
      return;
    }

    // Debounce: Foydalanuvchi yozishni to'xtatgach 500ms o'tib API ga so'rov ketadi
    const delayDebounce = setTimeout(async () => {
      setIsCalculating(true);
      try {
        const payload = {
          farmerId: formData.farmerId || 0, // Hisoblash (Preview) uchun ID shart emas
          priceId: formData.priceId,
          hasBasket: formData.hasBasket,
          basketId: formData.hasBasket ? formData.basketId : null,
          basketCount: formData.hasBasket ? parseInt(formData.basketCount || 0) : 0,
          grossWeight: parseFloat(formData.grossWeight)
        };
        
        const result = await productService.calculatePreview(payload);
        setReceiptPreview(result);
      } catch (error) {
        console.error("Hisob-kitob xatosi", error);
        setReceiptPreview(null);
      } finally {
        setIsCalculating(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [formData]);

  // ==========================================
  // 4. SAQLASH TUGMASI BOSILGANDA
  // ==========================================
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.farmerId) return alert("Iltimos, fermerni tanlang!");
    if (!receiptPreview) return alert("Hisob-kitob to'liq emas!");

    setIsSubmitting(true);
    try {
      const payload = {
        farmerId: formData.farmerId,
        priceId: formData.priceId,
        hasBasket: formData.hasBasket,
        basketId: formData.hasBasket ? formData.basketId : null,
        basketCount: formData.hasBasket ? parseInt(formData.basketCount) : 0,
        grossWeight: parseFloat(formData.grossWeight)
      };

      await productService.receiveCrop(payload);
      setSuccessMessage("Hosil muvaffaqiyatli qabul qilindi va chek yuborildi!");
      
      // Formani tozalash
      setFormData({ farmerId: null, priceId: null, hasBasket: false, basketId: null, basketCount: '', grossWeight: ''});
      setReceiptPreview(null);
      
      // 5 soniyadan keyin Muvaffaqiyatli yozuvni yo'qotish
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (error) {
      alert(error.response?.data?.message || "Xatolik yuz berdi!");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Select opsiyalari formatlash (Meva va Savat)
  const priceOptions = prices.map(p => ({
    value: p.priceId, 
    label: `${p.fruitTypeName} (${p.quality}) — ${p.amount?.toLocaleString()} so'm/kg`
  }));

  const basketOptions = baskets.map(b => ({
    value: b.id, 
    label: `${b.name} (${b.weight} kg)`
  }));

  // Yuklanish ekrani
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
      
      {/* Sarlavha */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#0B1A42] flex items-center gap-3">
          <Scale className="text-[#14A44D]" size={28} /> Hosil Qabul Qilish
        </h1>
        <p className="text-sm text-gray-500 mt-1">Tarozidagi ma'lumotlarni kiritib fermerdan hosilni oling.</p>
      </div>

      {/* Muvaffaqiyatli xabar va Chek chiqarish tugmasi */}
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* ========================================== */}
        {/* ASOSIY FORMA */}
        {/* ========================================== */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm p-6 lg:p-8">
          <form id="receiveForm" onSubmit={handleSubmit} className="space-y-7">
            
            {/* 1. FERMER (Asinxron Qidiruvli Select) */}
            <div>
              <label className="flex items-center gap-2 text-[13px] font-extrabold text-gray-500 uppercase tracking-wider mb-2">
                <UserCircle size={18} className="text-[#14A44D]" /> Fermerni tanlang
              </label>
              <AsyncSelect 
                cacheOptions
                defaultOptions
                loadOptions={loadFarmerOptions}
                placeholder="Ism yoki raqam bo'yicha qidirish..."
                isClearable={true}
                value={formData.farmerId ? { value: formData.farmerId, label: 'Tanlangan fermer' } : null}
                onChange={(selected) => setFormData({...formData, farmerId: selected ? selected.value : null})}
                className="text-sm font-medium"
                classNamePrefix="react-select"
                loadingMessage={() => "Qidirilmoqda..."}
                noOptionsMessage={({ inputValue }) => {
                  if (inputValue && inputValue.length < 2) {
                    return "Qidirish uchun kamida 2 ta belgi kiriting...";
                  }
                  return "Fermer topilmadi";
                }}
              />
            </div>

            {/* 2. MEVA VA NARX (Select) */}
            <div>
              <label className="flex items-center gap-2 text-[13px] font-extrabold text-gray-500 uppercase tracking-wider mb-2">
                <Apple size={18} className="text-[#14A44D]" /> Meva turi va Joriy narx
              </label>
              <Select 
                options={priceOptions}
                placeholder="Mevani tanlang..."
                isSearchable={true}
                value={priceOptions.find(o => o.value === formData.priceId) || null}
                onChange={(selected) => setFormData({...formData, priceId: selected ? selected.value : null})}
                className="text-sm font-medium"
                noOptionsMessage={() => "Narxlar ro'yxati topilmadi"}
              />
              {prices.length === 0 && (
                <p className="text-[12px] text-red-500 mt-2 flex items-center gap-1">
                  <AlertCircle size={14}/> Bugungi kun uchun narx belgilanmagan!
                </p>
              )}
            </div>

            <hr className="border-gray-100" />

            {/* 3. SAVAT VA TARA */}
            <div className={`border-2 rounded-xl transition-all duration-300 ${formData.hasBasket ? 'border-[#14A44D] bg-emerald-50/20' : 'border-gray-200 bg-gray-50/50'}`}>
              <label className="flex items-center gap-3 p-4 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={formData.hasBasket}
                  onChange={e => setFormData({...formData, hasBasket: e.target.checked, basketId: null, basketCount: ''})}
                  className="w-5 h-5 text-[#14A44D] border-gray-300 rounded focus:ring-[#14A44D] cursor-pointer"
                />
                <Box size={20} className={formData.hasBasket ? "text-[#14A44D]" : "text-gray-400"} /> 
                <span className={`font-bold ${formData.hasBasket ? 'text-[#0B1A42]' : 'text-gray-500'}`}>Hosil savatda / tarada keldi</span>
              </label>

              {formData.hasBasket && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 pt-0 border-t border-emerald-100/50 mt-2">
                  <div>
                    <label className="block text-[12px] font-bold text-gray-500 mb-1.5">Savat turini qidiring</label>
                    <Select 
                      options={basketOptions}
                      placeholder="Tanlang..."
                      value={basketOptions.find(o => o.value === formData.basketId) || null}
                      onChange={(selected) => setFormData({...formData, basketId: selected ? selected.value : null})}
                      className="text-sm font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] font-bold text-gray-500 mb-1.5">Nechta savat?</label>
                    <input 
                      type="number" 
                      min="1"
                      required
                      value={formData.basketCount}
                      onChange={e => setFormData({...formData, basketCount: e.target.value})}
                      className="w-full h-[38px] px-3 bg-white border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#14A44D]/20 focus:border-[#14A44D] transition-all text-sm font-medium"
                      placeholder="Soni..."
                    />
                  </div>
                </div>
              )}
            </div>

            {/* 4. TAROZI (Brutto) */}
            <div>
              <label className="flex items-center gap-2 text-[13px] font-extrabold text-gray-500 uppercase tracking-wider mb-2">
                <Scale size={18} className="text-[#14A44D]" /> Tarozidagi Umumiy Vazn (Brutto)
              </label>
              <div className="relative">
                <input 
                  type="number" 
                  step="0.1"
                  required
                  value={formData.grossWeight}
                  onChange={e => setFormData({...formData, grossWeight: e.target.value})}
                  className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#14A44D]/20 focus:border-[#14A44D] text-2xl font-black text-[#0B1A42] transition-all"
                  placeholder="0.0"
                />
                <span className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 font-black text-xl">KG</span>
              </div>
            </div>

          </form>
        </div>

        {/* ========================================== */}
        {/* KVITANSIYA PANELI (Backenddan kelgan ma'lumot) */}
        {/* ========================================== */}
        <div className="lg:col-span-1">
          <div className="bg-[#0B1A42] rounded-2xl shadow-xl p-6 text-white sticky top-6 border border-blue-900/50">
            <h3 className="flex items-center justify-between gap-2 text-lg font-bold mb-6 border-b border-white/10 pb-4">
              <span className="flex items-center gap-2"><Calculator size={20} className="text-[#14A44D]" /> Kvitansiya</span>
              {isCalculating && <Loader2 size={18} className="animate-spin text-[#14A44D]" />}
            </h3>

            {receiptPreview ? (
              <div className="space-y-4 text-[14px]">
                <div className="flex justify-between items-center text-gray-300">
                  <span>Brutto (Tarozida):</span>
                  <span className="font-medium text-white">{receiptPreview.grossWeight} kg</span>
                </div>
                
                <div className="flex justify-between items-center text-gray-300">
                  <span>Tara ({receiptPreview.basketCount || 0} ta):</span>
                  <span className="font-medium text-red-400">- {receiptPreview.taraWeight} kg</span>
                </div>

                <div className="pt-4 border-t border-white/10 flex justify-between items-center">
                  <span className="font-bold text-gray-200">SOF VAZN (Netto):</span>
                  <span className="text-2xl font-black text-[#14A44D]">{receiptPreview.netWeight} kg</span>
                </div>

                <div className="flex justify-between items-center text-gray-300 pt-3">
                  <span>Narxi (1 kg):</span>
                  <span className="font-medium text-white">{receiptPreview.unitPrice?.toLocaleString()} UZS</span>
                </div>

                <div className="mt-8 pt-6 border-t border-white/10">
                  <p className="text-gray-400 text-[12px] uppercase tracking-wider mb-1 font-bold">Fermer hisobiga:</p>
                  <div className="text-3xl font-black text-white break-all">
                    {receiptPreview.totalAmount?.toLocaleString()} <span className="text-lg text-[#14A44D] font-bold">UZS</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-12 flex flex-col items-center justify-center text-center opacity-50">
                <Calculator size={48} className="mb-3" />
                <p className="text-sm">Hisob-kitobni ko'rish uchun<br/>ma'lumotlarni kiriting</p>
              </div>
            )}

            <button 
              type="submit"
              form="receiveForm"
              disabled={isSubmitting || !receiptPreview || isCalculating}
              className="w-full mt-8 flex items-center justify-center gap-2 px-4 py-4 bg-[#14A44D] text-white rounded-xl font-bold hover:bg-[#118f43] transition-all shadow-lg shadow-[#14A44D]/20 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
            >
              {isSubmitting ? <Loader2 size={20} className="animate-spin" /> : <CheckCircle2 size={20} />}
              HOSILNI QABUL QILISH
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}