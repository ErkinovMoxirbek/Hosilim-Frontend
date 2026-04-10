import React, { useState, useEffect, useRef } from 'react';
import distributionService from '../../services/distributionService';
import basketService from '../../services/basketService';
import { useAuth } from '../../hooks/useAuth'; 
import { Loader2, Search, X, Check } from 'lucide-react';

export default function BasketDistributionPage() {
  const [distributions, setDistributions] = useState([]);
  const [baskets, setBaskets] = useState([]);
  const [farmers, setFarmers] = useState([]); 
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { user } = useAuth();
  const canDistribute = user?.role?.includes('BROKER') || user?.role?.includes('ACCOUNTANT') || user?.role === 'BROKER' || user?.role === 'ACCOUNTANT';

  const [formData, setFormData] = useState({
    farmerId: '',
    basketId: '',
    quantity: ''
  });

  const [selectedBasketStock, setSelectedBasketStock] = useState(0);

  // FERMER QIDIRUV STATE'LARI
  const [farmerSearch, setFarmerSearch] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedFarmer, setSelectedFarmer] = useState(null);
  
  const dropdownRef = useRef(null); 
  const quantityInputRef = useRef(null);

  useEffect(() => {
    fetchInitialData();
    
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchInitialData = async () => {
    setIsLoading(true);
    try {
      const [distData, basketsData, farmersData] = await Promise.all([
        distributionService.getDistributions().catch(() => ({ content: [] })), 
        basketService.getBaskets(),
        distributionService.getFarmers()
      ]);

      setDistributions(Array.isArray(distData?.content) ? distData.content : []);
      
      const availableBaskets = Array.isArray(basketsData?.content) ? basketsData.content.filter(b => b.isActive) : [];
      setBaskets(availableBaskets);
      setFarmers(Array.isArray(farmersData) ? farmersData : []);
      
      if (availableBaskets.length > 0) {
        setFormData(prev => ({ ...prev, basketId: availableBaskets[0].id.toString() }));
        setSelectedBasketStock(availableBaskets[0].quantity || 0);
      }
    } catch (error) {
      console.error("Xatolik:", error);
    } finally {
      setIsLoading(false);
      setTimeout(() => document.getElementById('farmerSearchInput')?.focus(), 100);
    }
  };

  const handleBasketChange = (e) => {
    const bId = e.target.value;
    setFormData({ ...formData, basketId: bId });
    const selected = baskets.find(b => b.id.toString() === bId);
    setSelectedBasketStock(selected ? selected.quantity : 0);
  };

  const filteredFarmers = farmers.filter(f => 
    `${f.name} ${f.surname} ${f.phone}`.toLowerCase().includes(farmerSearch.toLowerCase())
  );

  const handleSelectFarmer = (farmer) => {
    setSelectedFarmer(farmer);
    setFormData({ ...formData, farmerId: farmer.id });
    setFarmerSearch('');
    setIsDropdownOpen(false);
    
    setTimeout(() => {
      if (quantityInputRef.current) quantityInputRef.current.focus();
    }, 50);
  };

  const handleClearFarmer = () => {
    setSelectedFarmer(null);
    setFormData({ ...formData, farmerId: '' });
    setTimeout(() => document.getElementById('farmerSearchInput')?.focus(), 10);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.farmerId || !formData.basketId || !formData.quantity) return;

    if (parseInt(formData.quantity) > selectedBasketStock) {
      alert(`Omborda faqat ${selectedBasketStock} ta tara qoldi!`);
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        distributedDate: new Date().toISOString().split('T')[0] 
      };

      const newDistribution = await distributionService.distributeBasket(payload);
      
      // Yangisini boshiga qo'shamiz
      setDistributions(prev => [newDistribution, ...prev]);
      
      const updatedQuantity = selectedBasketStock - parseInt(formData.quantity);
      setBaskets(prev => prev.map(b => b.id.toString() === formData.basketId ? { ...b, quantity: updatedQuantity } : b));
      setSelectedBasketStock(updatedQuantity);

      setFormData(prev => ({ ...prev, farmerId: '', quantity: '' }));
      setSelectedFarmer(null); 
      
    } catch (error) { 
      alert("Xatolik yuz berdi. Qayta urinib ko'ring."); 
    } finally { 
      setIsSubmitting(false); 
      setTimeout(() => document.getElementById('farmerSearchInput')?.focus(), 100);
    }
  };

  if (!canDistribute) {
    return <div className="p-10 text-center text-slate-500">Sizda bu sahifaga kirish huquqi yo'q.</div>;
  }

  return (
    // 🎨 Oq fon, minimalist layout
    <div className="min-h-screen bg-white p-6 sm:p-12 font-sans text-slate-900">
      <div className="max-w-6xl mx-auto">
        
        {/* Sarlavha - Katta va toza */}
        <div className="mb-12">
          <h1 className="text-3xl sm:text-4xl font-light tracking-tight text-slate-900">Savat tarqatish</h1>
          <p className="text-slate-500 mt-2 text-sm font-medium">Ombordan fermerlarga tara biriktirish paneli</p>
        </div>

        {isLoading ? (
          <div className="flex items-center gap-3 text-slate-400 py-20">
            <Loader2 className="animate-spin" size={24} />
            <span>Yuklanmoqda...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-start">
            
            {/* ========================================================= */}
            {/* CHAP TOMON: ASOSIY FORMA (7 column)                       */}
            {/* ========================================================= */}
            <div className="lg:col-span-7 w-full">
              <form onSubmit={handleSubmit} className="space-y-8">
                
                {/* 1. FERMER QIDIRUV */}
                <div className="relative" ref={dropdownRef}>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                    Fermer
                  </label>
                  
                  {selectedFarmer ? (
                    // Tanlangan fermer (Toza ko'rinish)
                    <div className="flex items-center justify-between px-6 py-5 bg-slate-50 rounded-2xl transition-all">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-900 text-lg">{selectedFarmer.name} {selectedFarmer.surname}</span>
                        <span className="text-sm text-slate-500 mt-0.5">{selectedFarmer.phone}</span>
                      </div>
                      <button 
                        type="button" 
                        onClick={handleClearFarmer}
                        className="p-2 text-slate-400 hover:text-slate-800 transition-colors"
                      >
                        <X size={20} strokeWidth={2}/>
                      </button>
                    </div>
                  ) : (
                    // Qidiruv inputi
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                        <Search size={20} className="text-slate-400" strokeWidth={2} />
                      </div>
                      <input 
                        id="farmerSearchInput"
                        type="text" 
                        autoComplete="off"
                        value={farmerSearch}
                        onChange={(e) => {
                          setFarmerSearch(e.target.value);
                          setIsDropdownOpen(true);
                        }}
                        onFocus={() => setIsDropdownOpen(true)}
                        placeholder="Fermer ismini yozing..." 
                        className="w-full pl-14 pr-6 py-5 bg-slate-50 hover:bg-slate-100 focus:bg-slate-100 rounded-2xl font-medium text-slate-900 text-lg outline-none transition-colors placeholder:text-slate-400"
                      />
                      
                      {/* Qidiruv natijalari dropdown */}
                      {isDropdownOpen && farmerSearch && (
                        <div className="absolute z-50 w-full mt-2 bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.08)] border border-slate-100 max-h-[300px] overflow-y-auto py-2">
                          {filteredFarmers.length === 0 ? (
                            <div className="p-6 text-center text-slate-400 text-sm">Fermer topilmadi.</div>
                          ) : (
                            filteredFarmers.map((f) => (
                              <div 
                                key={f.id} 
                                onClick={() => handleSelectFarmer(f)}
                                className="flex flex-col px-6 py-3 hover:bg-slate-50 cursor-pointer transition-colors"
                              >
                                <span className="font-semibold text-slate-900 text-base">{f.name} {f.surname}</span>
                                <span className="text-sm text-slate-500">{f.phone}</span>
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* 2. TARA TURINI TANLASH */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Tara turi</label>
                    <span className="text-[12px] font-medium text-slate-500">
                      Qoldiq: <span className={`font-bold ${selectedBasketStock < 50 ? 'text-red-500' : 'text-slate-900'}`}>{selectedBasketStock} ta</span>
                    </span>
                  </div>
                  
                  <select 
                    required 
                    value={formData.basketId} 
                    onChange={handleBasketChange} 
                    className="w-full px-6 py-5 bg-slate-50 hover:bg-slate-100 focus:bg-slate-100 rounded-2xl font-medium text-slate-900 text-lg outline-none transition-colors appearance-none cursor-pointer" 
                    disabled={isSubmitting || baskets.length === 0}
                  >
                    {baskets.map((b) => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>

                {/* 3. SONI (GIGANT INPUT) */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                    Berilayotgan soni
                  </label>
                  <div className="relative">
                    <input 
                      ref={quantityInputRef}
                      type="number" min="1" max={selectedBasketStock || 999999} required 
                      value={formData.quantity} 
                      onChange={(e) => setFormData({...formData, quantity: e.target.value})} 
                      className="w-full px-6 py-6 bg-slate-50 focus:bg-slate-100 rounded-2xl font-light text-5xl text-slate-900 outline-none transition-colors" 
                      placeholder="0" 
                      disabled={isSubmitting || !formData.basketId || !selectedFarmer}
                    />
                    <span className="absolute right-8 top-1/2 -translate-y-1/2 text-slate-300 font-light text-3xl pointer-events-none">
                      ta
                    </span>
                  </div>
                </div>

                {/* TASDIQLASH TUGMASI (QORA) */}
                <button 
                  type="submit" 
                  disabled={isSubmitting || !selectedFarmer || !formData.quantity} 
                  className="w-full mt-4 py-5 bg-slate-900 text-white rounded-2xl font-medium hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-slate-900 transition-all flex justify-center items-center gap-3 text-lg"
                >
                  {isSubmitting ? (
                    <Loader2 size={24} className="animate-spin" />
                  ) : (
                    <>
                      <Check size={24} strokeWidth={2} />
                      Tasdiqlash
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* ========================================================= */}
            {/* O'NG TOMON: OXIRGI 5 TA TARIX (5 column)                  */}
            {/* ========================================================= */}
            <div className="lg:col-span-5 w-full">
              <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-6 pt-2">
                Oxirgi operatsiyalar
              </h3>
              
              <div className="space-y-4">
                {distributions.length === 0 ? (
                  <p className="text-slate-400 text-sm">Tarix bo'sh.</p>
                ) : (
                  // Faqat oxirgi 5 tasini ko'rsatamiz
                  distributions.slice(0, 5).map((dist) => (
                    <div key={dist.id} className="group flex items-start justify-between p-4 rounded-2xl hover:bg-slate-50 transition-colors">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-900 text-[15px]">{dist.farmerName || "Ism familiya"}</span>
                        <span className="text-slate-500 text-[13px] mt-1 flex items-center gap-2">
                          {dist.basketName}
                          <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                          {dist.distributedDate}
                        </span>
                      </div>
                      
                      <div className="flex flex-col items-end">
                        <span className="font-bold text-slate-900 text-base">
                          +{dist.quantity} <span className="text-xs font-normal text-slate-500">ta</span>
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
              
              {distributions.length > 5 && (
                 <div className="mt-6 pt-6 border-t border-slate-100">
                    <button className="text-sm font-medium text-slate-400 hover:text-slate-900 transition-colors">
                      Barcha tarixni ko'rish →
                    </button>
                 </div>
              )}
            </div>

          </div>
        )}
      </div>
    </div>
  );
}