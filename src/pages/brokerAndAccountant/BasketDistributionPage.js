import React, { useState, useEffect, useRef } from 'react';
import distributionService from '../../services/distributionService';
import basketService from '../../services/basketService';
import { useAuth } from '../../hooks/useAuth'; 
import { Loader2, Search, X, Check, Package, Clock } from 'lucide-react';

export default function BasketDistributionPage() {
  const [distributions, setDistributions] = useState([]);
  const [baskets, setBaskets] = useState([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { user } = useAuth();
  const canDistribute = user?.role?.includes('BROKER') || user?.role?.includes('ACCOUNTANT');

  const [formData, setFormData] = useState({
    farmerId: '',
    basketId: '',
    quantity: ''
  });

  const [selectedBasketStock, setSelectedBasketStock] = useState(0);

  // Qidiruv State'lari
  const [farmerSearch, setFarmerSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]); 
  const [isSearchingFarmer, setIsSearchingFarmer] = useState(false);
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

  // Debounce effekti (Fermer qidirish)
  useEffect(() => {
    if (farmerSearch.trim().length < 2) {
      setSearchResults([]);
      setIsSearchingFarmer(false);
      return;
    }

    setIsSearchingFarmer(true);

    const delayDebounceFn = setTimeout(async () => {
      try {
        const results = await distributionService.searchFarmers(farmerSearch.trim());
        setSearchResults(Array.isArray(results) ? results : []);
      } catch (error) {
        console.error(error);
      } finally {
        setIsSearchingFarmer(false);
        setIsDropdownOpen(true);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [farmerSearch]);

  const fetchInitialData = async () => {
    setIsLoading(true);
    try {
      const [distData, basketsData] = await Promise.all([
        distributionService.getGivenHistory(), 
        basketService.getBaskets()
      ]);

      setDistributions(Array.isArray(distData) ? distData : []);
      
      const availableBaskets = Array.isArray(basketsData?.content) ? basketsData.content.filter(b => b.isActive) : [];
      setBaskets(availableBaskets);
      
      if (availableBaskets.length > 0) {
        setFormData(prev => ({ ...prev, basketId: availableBaskets[0].id.toString() }));
        setSelectedBasketStock(availableBaskets[0].quantity || 0);
      }
    } catch (error) {
      console.error("Xatolik:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBasketChange = (e) => {
    const bId = e.target.value;
    setFormData({ ...formData, basketId: bId });
    const selected = baskets.find(b => b.id.toString() === bId);
    setSelectedBasketStock(selected ? selected.quantity : 0);
  };

  const handleSelectFarmer = (farmer) => {
    setSelectedFarmer(farmer);
    setFormData({ ...formData, farmerId: farmer.id });
    setFarmerSearch('');
    setSearchResults([]);
    setIsDropdownOpen(false);
    
    setTimeout(() => {
      if (quantityInputRef.current) quantityInputRef.current.focus();
    }, 50);
  };

  const handleClearFarmer = () => {
    setSelectedFarmer(null);
    setFormData({ ...formData, farmerId: '' });
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
      const newDistribution = await distributionService.distributeBasket(formData);
      
      if (newDistribution) {
        // Yangi tranzaksiyani UI'ning boshiga qo'shamiz
        setDistributions(prev => [newDistribution, ...prev]);
        
        // Ombordagi savat qoldig'ini yangilaymiz
        const updatedQuantity = selectedBasketStock - parseInt(formData.quantity);
        setBaskets(prev => prev.map(b => b.id.toString() === formData.basketId ? { ...b, quantity: updatedQuantity } : b));
        setSelectedBasketStock(updatedQuantity);

        // Formani tozalash
        setFormData(prev => ({ ...prev, farmerId: '', quantity: '' }));
        setSelectedFarmer(null);
      }
      
    } catch (error) { 
      // API xato bersa, masalan savat yetarli emas deb, ogohlantirish beriladi
      alert(error?.response?.data?.message || "Xatolik yuz berdi. Qayta urinib ko'ring."); 
    } finally { 
      setIsSubmitting(false); 
    }
  };

  // Helper funksiya sanani chiroyli ko'rsatish uchun
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('uz-UZ', { month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit' });
  };

  if (!canDistribute) {
    return <div className="p-8 text-center text-red-500 font-medium bg-red-50 rounded-lg m-6">Sizda bu sahifaga kirish huquqi yo'q.</div>;
  }

  return (
    <div className="p-4 sm:p-6 bg-slate-50 text-slate-900 w-full min-h-screen">
      <div className="max-w-6xl mx-auto">
        
        {/* Sarlavha */}
        <div className="mb-6 flex items-center gap-3">
          <div className="p-3 bg-blue-600 rounded-lg text-white">
            <Package size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Savat tarqatish</h1>
            <p className="text-slate-500 text-sm mt-1">Ombordan fermerlarga tara biriktirish formasi</p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center gap-3 text-slate-400 py-32 bg-white rounded-xl shadow-sm border border-slate-200">
            <Loader2 className="animate-spin text-blue-600" size={32} />
            <span className="font-medium">Ma'lumotlar yuklanmoqda...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            
            {/* CHAP TOMON: ASOSIY FORMA */}
            <div className="lg:col-span-2 w-full bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* 1. API ORQALI FERMER QIDIRUV */}
                <div className="relative" ref={dropdownRef}>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Fermerni tanlang <span className="text-red-500">*</span>
                  </label>
                  
                  {selectedFarmer ? (
                    <div className="flex items-center justify-between px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div>
                        <span className="font-semibold text-blue-900 block">{selectedFarmer.name} {selectedFarmer.surname}</span>
                        <span className="text-sm text-blue-700">{selectedFarmer.phone}</span>
                      </div>
                      <button 
                        type="button" 
                        onClick={handleClearFarmer}
                        className="p-1.5 bg-white text-slate-400 hover:text-red-500 rounded-md shadow-sm border border-blue-100 transition-colors"
                        title="Boshqa fermer tanlash"
                      >
                        <X size={18} strokeWidth={2.5}/>
                      </button>
                    </div>
                  ) : (
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        {isSearchingFarmer ? (
                          <Loader2 size={18} className="text-blue-500 animate-spin" />
                        ) : (
                          <Search size={18} className="text-slate-400" />
                        )}
                      </div>
                      <input 
                        id="farmerSearchInput"
                        type="text" 
                        autoComplete="off"
                        value={farmerSearch}
                        onChange={(e) => setFarmerSearch(e.target.value)}
                        onFocus={() => { if (farmerSearch.length >= 2) setIsDropdownOpen(true); }}
                        placeholder="Kamida 2 ta harf yoki raqam yozing..." 
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-lg text-slate-900 outline-none transition-all"
                      />
                      
                      {/* Qidiruv natijalari dropdown */}
                      {isDropdownOpen && farmerSearch.length >= 2 && (
                        <div className="absolute z-50 w-full mt-1 bg-white rounded-lg shadow-lg border border-slate-200 max-h-60 overflow-y-auto">
                          {isSearchingFarmer ? (
                            <div className="p-4 text-center text-slate-500 text-sm flex items-center justify-center gap-2">
                              <Loader2 size={16} className="animate-spin text-blue-500"/>
                              Bazada izlanmoqda...
                            </div>
                          ) : searchResults.length === 0 ? (
                            <div className="p-4 text-center text-slate-500 text-sm">Fermer topilmadi. Ismni to'g'ri yozing.</div>
                          ) : (
                            searchResults.map((f) => (
                              <div 
                                key={f.id} 
                                onMouseDown={(e) => {
                                  e.preventDefault(); 
                                  handleSelectFarmer(f);
                                }}
                                className="flex flex-col px-4 py-3 hover:bg-slate-50 border-b border-slate-100 last:border-0 cursor-pointer transition-colors"
                              >
                                <span className="font-medium text-slate-800">{f.name} {f.surname}</span>
                                <span className="text-sm text-slate-500">{f.phone}</span>
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* 2. TARA TURINI TANLASH */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-semibold text-slate-700">
                        Tara turi <span className="text-red-500">*</span>
                      </label>
                      <span className="text-xs font-medium px-2 py-1 bg-slate-100 rounded text-slate-600">
                        Omborda: <span className={`font-bold ${selectedBasketStock < 50 ? 'text-red-600' : 'text-green-600'}`}>{selectedBasketStock}</span>
                      </span>
                    </div>
                    
                    <select 
                      required 
                      value={formData.basketId} 
                      onChange={handleBasketChange} 
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-lg text-slate-900 outline-none transition-all cursor-pointer" 
                      disabled={isSubmitting || baskets.length === 0}
                    >
                      {baskets.map((b) => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* 3. SONI */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Berilayotgan soni <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input 
                        ref={quantityInputRef}
                        type="number" min="1" max={selectedBasketStock || 999999} required 
                        value={formData.quantity} 
                        onChange={(e) => setFormData({...formData, quantity: e.target.value})} 
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-lg text-slate-900 outline-none transition-all font-medium" 
                        placeholder="Masalan: 100" 
                        disabled={isSubmitting || !formData.basketId || !selectedFarmer}
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium pointer-events-none">
                        ta
                      </span>
                    </div>
                  </div>
                </div>

                {/* TASDIQLASH TUGMASI */}
                <div className="pt-4 border-t border-slate-100 mt-6">
                  <button 
                    type="submit" 
                    disabled={isSubmitting || !selectedFarmer || !formData.quantity} 
                    className="w-full sm:w-auto px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 focus:ring-4 focus:ring-blue-500/30 disabled:opacity-50 disabled:hover:bg-blue-600 transition-all flex justify-center items-center gap-2"
                  >
                    {isSubmitting ? (
                      <Loader2 size={20} className="animate-spin" />
                    ) : (
                      <Check size={20} strokeWidth={2.5} />
                    )}
                    Jarayonni tasdiqlash
                  </button>
                </div>
              </form>
            </div>

            {/* O'NG TOMON: OXIRGI 5 TA TARIX */}
            <div className="lg:col-span-1 w-full bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
                <Clock size={20} className="text-slate-400" />
                <h3 className="font-bold text-slate-800">
                  Oxirgi tarqatilganlar
                </h3>
              </div>
              
              <div className="space-y-3">
                {distributions.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-sm">
                    Hozircha hech qanday tara tarqatilmagan.
                  </div>
                ) : (
                  distributions.slice(0, 5).map((dist) => (
                    <div key={dist.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50 hover:bg-slate-100/80 transition-colors">
                      <div className="flex flex-col overflow-hidden">
                        <span className="font-semibold text-slate-800 text-sm truncate" title={dist.farmerFullName}>
                          {dist.farmerFullName || "Noma'lum fermer"}
                        </span>
                        <span className="text-slate-500 text-xs mt-0.5">
                          {dist.basketName} • {formatDate(dist.date)}
                        </span>
                      </div>
                      <div className="ml-3 pl-3 border-l border-slate-200">
                        <span className="font-bold text-blue-600 text-sm whitespace-nowrap">
                          {dist.quantity} ta
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
              
              {distributions.length > 5 && (
                 <div className="mt-4 pt-4 border-t border-slate-100 text-center">
                    <button className="text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors">
                      Barcha tarixni ko'rish &rarr;
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