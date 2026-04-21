import React, { useState, useEffect, useMemo } from 'react';
import farmerService from '../../services/farmerService';
import basketService from '../../services/basketService';
import priceService from '../../services/priceService';
import productService from '../../services/productService';
import { 
  Scale, 
  UserCircle, 
  Apple, 
  Box, 
  Calculator, 
  CheckCircle2, 
  Loader2,
  AlertCircle
} from 'lucide-react';

export default function ReceiveCropPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);

  // Bazadan keladigan ma'lumotlar
  const [farmers, setFarmers] = useState([]);
  const [prices, setPrices] = useState([]);
  const [baskets, setBaskets] = useState([]);

  // Forma state (Hisobchi kiritadigan ma'lumotlar)
  const [formData, setFormData] = useState({
    farmerId: '',
    priceId: '', // Bu orqali fruitTypeId va amount ni topamiz
    hasBasket: false,
    basketId: '',
    basketCount: '',
    grossWeight: ''
  });

  // Sahifa yuklanganda barcha kerakli ro'yxatlarni tortib kelamiz
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [farmersRes, pricesRes, basketsRes] = await Promise.all([
          farmerService.getAllFarmers('', 0, 100), // Barcha mijozlarni olish
          priceService.getActivePrices(),
          basketService.getBaskets(0, 50)
        ]);

        setFarmers(Array.isArray(farmersRes) ? farmersRes : (farmersRes?.content || []));
        setPrices(Array.isArray(pricesRes) ? pricesRes : []);
        setBaskets(Array.isArray(basketsRes?.content) ? basketsRes.content : []);
      } catch (error) {
        alert("Ma'lumotlarni yuklashda xatolik yuz berdi!");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // ==========================================
  // JONLI HISOB-KITOB (Live Calculations)
  // ==========================================
  const calculations = useMemo(() => {
    const selectedPrice = prices.find(p => p.priceId.toString() === formData.priceId);
    const selectedBasket = baskets.find(b => b.id.toString() === formData.basketId);
    
    const gross = parseFloat(formData.grossWeight) || 0;
    const bCount = parseInt(formData.basketCount) || 0;
    
    // Tara hisoblash
    const taraWeight = formData.hasBasket && selectedBasket ? (selectedBasket.weight * bCount) : 0;
    
    // Sof vazn (Netto)
    const netWeight = Math.max(0, gross - taraWeight);
    
    // Jami summa
    const priceAmount = selectedPrice ? selectedPrice.amount : 0;
    const totalAmount = netWeight * priceAmount;

    return { selectedPrice, selectedBasket, taraWeight, netWeight, totalAmount };
  }, [formData, prices, baskets]);

  // ==========================================
  // YUBORISH (Submit)
  // ==========================================
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (calculations.netWeight <= 0) {
      alert("Sof vazn 0 dan katta bo'lishi kerak! Tarozini tekshiring.");
      return;
    }

    setIsSubmitting(true);
    setSuccessMessage(null);

    try {
      const payload = {
        farmerId: parseInt(formData.farmerId),
        fruitTypeId: calculations.selectedPrice.priceId, // API da fruitTypeId deb kelgan edi (backenddagi logicga qarab)
        basketId: formData.hasBasket ? parseInt(formData.basketId) : null,
        basketCount: formData.hasBasket ? parseInt(formData.basketCount) : 0,
        grossWeight: parseFloat(formData.grossWeight)
      };

      const response = await productService.receiveCrop(payload);
      
      setSuccessMessage(response.message);
      
      // Formani tozalash
      setFormData({
        farmerId: '', priceId: '', hasBasket: false, basketId: '', basketCount: '', grossWeight: ''
      });

      // 3 soniyadan keyin xabarni yo'qotish
      setTimeout(() => setSuccessMessage(null), 3000);

    } catch (error) {
      alert(error.response?.data?.message || "Hosilni qabul qilishda xatolik!");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh]">
        <Loader2 className="animate-spin text-[#14A44D] mb-4" size={40} />
        <p className="text-gray-500 font-medium">Taroziga ulanmoqda...</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#0B1A42] flex items-center gap-3">
          <Scale className="text-[#14A44D]" size={28} /> Hosil Qabul Qilish
        </h1>
        <p className="text-sm text-gray-500 mt-1">Tarozidagi ma'lumotlarni kiritib fermerdan hosilni oling.</p>
      </div>

      {successMessage && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3 text-green-700 animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 size={24} />
          <p className="font-medium">{successMessage}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* ASOSIY FORMA */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <form id="receiveForm" onSubmit={handleSubmit} className="space-y-6">
            
            {/* 1. Mijoz */}
            <div>
              <label className="flex items-center gap-2 text-[14px] font-bold text-gray-700 mb-2">
                <UserCircle size={18} className="text-gray-400" /> Fermerni tanlang
              </label>
              <select 
                required
                value={formData.farmerId}
                onChange={e => setFormData({...formData, farmerId: e.target.value})}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#14A44D]/20 focus:border-[#14A44D] transition-all"
              >
                <option value="">-- Ro'yxatdan tanlang --</option>
                {farmers.map(f => (
                  <option key={f.id} value={f.id}>{f.firstName} {f.lastName} ({f.phoneNumber})</option>
                ))}
              </select>
            </div>

            {/* 2. Meva va Narx */}
            <div>
              <label className="flex items-center gap-2 text-[14px] font-bold text-gray-700 mb-2">
                <Apple size={18} className="text-gray-400" /> Meva turi va Joriy narx
              </label>
              <select 
                required
                value={formData.priceId}
                onChange={e => setFormData({...formData, priceId: e.target.value})}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#14A44D]/20 focus:border-[#14A44D] transition-all"
              >
                <option value="">-- Mevani tanlang --</option>
                {prices.map(p => (
                  <option key={p.priceId} value={p.priceId}>
                    {p.fruitTypeName} ({p.quality}) — {p.amount.toLocaleString()} so'm/kg
                  </option>
                ))}
              </select>
              {prices.length === 0 && (
                <p className="text-[12px] text-red-500 mt-1 flex items-center gap-1"><AlertCircle size={14}/> Bugungi kun uchun narx belgilanmagan!</p>
              )}
            </div>

            <hr className="border-gray-100" />

            {/* 3. Savat va Tara */}
            <div>
              <label className="flex items-center gap-3 text-[14px] font-bold text-gray-700 mb-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={formData.hasBasket}
                  onChange={e => setFormData({...formData, hasBasket: e.target.checked, basketId: '', basketCount: ''})}
                  className="w-4 h-4 text-[#14A44D] border-gray-300 rounded focus:ring-[#14A44D]"
                />
                <Box size={18} className={formData.hasBasket ? "text-[#14A44D]" : "text-gray-400"} /> 
                Hosil savatda/tarada keldi
              </label>

              {formData.hasBasket && (
                <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100 animate-in fade-in">
                  <div>
                    <label className="block text-[12px] font-bold text-gray-500 mb-1">Savat turi</label>
                    <select 
                      required
                      value={formData.basketId}
                      onChange={e => setFormData({...formData, basketId: e.target.value})}
                      className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#14A44D]/20 focus:border-[#14A44D] transition-all"
                    >
                      <option value="">-- Tanlang --</option>
                      {baskets.map(b => (
                        <option key={b.id} value={b.id}>{b.name} ({b.weight} kg)</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[12px] font-bold text-gray-500 mb-1">Nechta savat?</label>
                    <input 
                      type="number" 
                      min="1"
                      required
                      value={formData.basketCount}
                      onChange={e => setFormData({...formData, basketCount: e.target.value})}
                      className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#14A44D]/20 focus:border-[#14A44D] transition-all"
                      placeholder="Soni..."
                    />
                  </div>
                </div>
              )}
            </div>

            {/* 4. Tarozi */}
            <div>
              <label className="flex items-center gap-2 text-[14px] font-bold text-gray-700 mb-2">
                <Scale size={18} className="text-gray-400" /> Tarozidagi Umumiy Vazn (Brutto)
              </label>
              <div className="relative">
                <input 
                  type="number" 
                  step="0.1"
                  required
                  value={formData.grossWeight}
                  onChange={e => setFormData({...formData, grossWeight: e.target.value})}
                  className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#14A44D]/20 focus:border-[#14A44D] text-xl font-bold text-[#0B1A42] transition-all"
                  placeholder="0.0"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">KG</span>
              </div>
            </div>

          </form>
        </div>

        {/* HISOB-KITOB PREVIEW (Right Panel) */}
        <div className="lg:col-span-1">
          <div className="bg-[#0B1A42] rounded-2xl shadow-lg p-6 text-white sticky top-6">
            <h3 className="flex items-center gap-2 text-lg font-bold mb-6 border-b border-white/10 pb-4">
              <Calculator size={20} className="text-[#14A44D]" /> Kvitansiya
            </h3>

            <div className="space-y-4 text-[14px]">
              <div className="flex justify-between items-center text-gray-300">
                <span>Brutto (Tarozida):</span>
                <span className="font-medium text-white">{parseFloat(formData.grossWeight || 0).toFixed(1)} kg</span>
              </div>
              
              <div className="flex justify-between items-center text-gray-300">
                <span>Tara ({formData.basketCount || 0} ta savat):</span>
                <span className="font-medium text-red-400">- {calculations.taraWeight.toFixed(1)} kg</span>
              </div>

              <div className="pt-4 border-t border-white/10 flex justify-between items-center">
                <span className="font-bold text-gray-200">SOF VAZN (Netto):</span>
                <span className="text-xl font-bold text-[#14A44D]">{calculations.netWeight.toFixed(1)} kg</span>
              </div>

              <div className="flex justify-between items-center text-gray-300 pt-2">
                <span>Narxi (1 kg):</span>
                <span className="font-medium text-white">
                  {calculations.selectedPrice ? calculations.selectedPrice.amount.toLocaleString() : 0} UZS
                </span>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/10">
              <p className="text-gray-400 text-[13px] mb-1">Fermer hisobiga yoziladigan summa:</p>
              <div className="text-3xl font-bold text-white break-all">
                {calculations.totalAmount.toLocaleString()} <span className="text-lg text-gray-400 font-medium">UZS</span>
              </div>
            </div>

            <button 
              type="submit"
              form="receiveForm"
              disabled={isSubmitting || calculations.netWeight <= 0}
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