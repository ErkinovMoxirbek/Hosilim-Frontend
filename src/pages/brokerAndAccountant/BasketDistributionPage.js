import React, { useState, useEffect, useRef, useCallback } from 'react';
import distributionService from '../../services/basketTransactionService';
import basketService from '../../services/basketService';
import farmerService from '../../services/farmerService';
import { useAuth } from '../../hooks/useAuth';
import {
  Loader2, Search, X, Check, Package, Clock, User,
  ShoppingBasket, Hash, Phone, Receipt, Box, ChevronDown, ChevronUp, Plus
} from 'lucide-react';

export default function BasketDistributionPage() {
  const [distributions, setDistributions] = useState([]);
  const [baskets, setBaskets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successId, setSuccessId] = useState(null);

  // QuickAdd state
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [quickAddFirstName, setQuickAddFirstName] = useState('');
  const [quickAddLastName, setQuickAddLastName] = useState('');
  const [quickAddPhone, setQuickAddPhone] = useState('');
  const [isQuickAdding, setIsQuickAdding] = useState(false);

  const { user } = useAuth();
  const canDistribute = user?.role?.includes('BROKER') || user?.role?.includes('ACCOUNTANT');

  const [formData, setFormData] = useState({ farmerId: '', basketId: '', quantity: '' });
  const [selectedBasketStock, setSelectedBasketStock] = useState(0);

  const [farmerSearch, setFarmerSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearchingFarmer, setIsSearchingFarmer] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedFarmer, setSelectedFarmer] = useState(null);

  const [isStatsExpanded, setIsStatsExpanded] = useState(false);
  const [debtDetails, setDebtDetails] = useState({ totalBaskets: 0, totalAmount: 0, baskets: [] });
  const [isLoadingDebt, setIsLoadingDebt] = useState(false);

  const dropdownRef = useRef(null);
  const quantityInputRef = useRef(null);
  const historyListRef = useRef(null);
  // quickAdd ochiq bo'lsa dropdown yopilmasligi uchun ref
  const quickAddOpenRef = useRef(false);

  // quickAddOpen o'zgarganda ref ni ham yangilaymiz
  useEffect(() => {
    quickAddOpenRef.current = quickAddOpen;
  }, [quickAddOpen]);

  const getInitials = (fullName) => {
    if (!fullName) return 'F';
    const names = fullName.trim().split(' ');
    if (names.length >= 2) return `${names[0][0]}${names[1][0]}`.toUpperCase();
    return fullName.substring(0, 2).toUpperCase();
  };

  // Click outside handler — quickAdd ochiq bo'lsa ISHLAMASIN
  const handleClickOutside = useCallback((event) => {
    if (quickAddOpenRef.current) return; // <-- asosiy fix
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setIsDropdownOpen(false);
    }
  }, []);

  useEffect(() => {
    fetchInitialData();
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [handleClickOutside]);

  useEffect(() => {
    if (farmerSearch.trim().length < 2) {
      setSearchResults([]);
      setIsSearchingFarmer(false);
      setQuickAddOpen(false);
      return;
    }
    setIsSearchingFarmer(true);
    const timer = setTimeout(async () => {
      try {
        const results = await distributionService.searchFarmers(farmerSearch.trim());
        setSearchResults(Array.isArray(results) ? results : []);
        setQuickAddOpen(false); // yangi qidiruv kelsa quick add ni yopamiz
      } catch (e) {
        console.error(e);
      } finally {
        setIsSearchingFarmer(false);
        setIsDropdownOpen(true);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [farmerSearch]);

  const fetchInitialData = async () => {
    setIsLoading(true);
    try {
      const [distData, basketsData] = await Promise.all([
        distributionService.getGivenMiniHistory(),
        basketService.getBaskets()
      ]);
      setDistributions(Array.isArray(distData) ? distData : []);
      const available = Array.isArray(basketsData?.content)
        ? basketsData.content.filter(b => b.isActive)
        : [];
      setBaskets(available);
      if (available.length > 0) {
        setFormData(prev => ({ ...prev, basketId: available[0].id.toString() }));
        setSelectedBasketStock(available[0].quantity || 0);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBasketChange = (e) => {
    const bId = e.target.value;
    setFormData({ ...formData, basketId: bId });
    const sel = baskets.find(b => b.id.toString() === bId);
    setSelectedBasketStock(sel ? sel.quantity : 0);
  };

  // API dan kelgan farmer turli field nomlar bilan kelishi mumkin.
  // name/surname/phone — ichki standart, shu formatga normalizatsiya qilamiz.
  const normalizeFarmer = (farmer) => ({
    ...farmer,
    name:    farmer.name    || farmer.firstName  || '',
    surname: farmer.surname || farmer.lastName   || '',
    phone:   farmer.phone   || farmer.phoneNumber || '',
  });

  const handleSelectFarmer = async (rawFarmer) => {
    const farmer = normalizeFarmer(rawFarmer);
    setSelectedFarmer(farmer);
    setFormData(prev => ({ ...prev, farmerId: farmer.id }));
    setFarmerSearch('');
    setSearchResults([]);
    setIsDropdownOpen(false);
    setQuickAddOpen(false);
    setIsStatsExpanded(false);

    setIsLoadingDebt(true);
    try {
      const details = await distributionService.getFarmerBalanceDetails(farmer.id);
      if (details) {
        setDebtDetails({
          totalBaskets: details.baskets?.reduce((sum, b) => sum + b.quantity, 0) || 0,
          totalAmount: details.totalDebtSum || 0,
          baskets: details.baskets || []
        });
      } else {
        setDebtDetails({ totalBaskets: 0, totalAmount: 0, baskets: [] });
      }
    } catch (err) {
      console.error(err);
      setDebtDetails({ totalBaskets: 0, totalAmount: 0, baskets: [] });
    } finally {
      setIsLoadingDebt(false);
    }

    setTimeout(() => {
      if (quantityInputRef.current) quantityInputRef.current.focus();
    }, 50);
  };

  const handleClearFarmer = () => {
    setSelectedFarmer(null);
    setFormData(prev => ({ ...prev, farmerId: '' }));
    setIsStatsExpanded(false);
    setDebtDetails({ totalBaskets: 0, totalAmount: 0, baskets: [] });
  };

  // Tez qo'shish — openQuickAdd bosqichi
  const openQuickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setQuickAddFirstName(farmerSearch);
    setQuickAddLastName('');
    setQuickAddPhone('');
    setQuickAddOpen(true);
  };

  const cancelQuickAdd = (e) => {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    setQuickAddOpen(false);
    // Dropdown ochiq qolsin, faqat quick add yopilsin
  };

  const handleQuickAdd = async (e) => {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    if (!quickAddFirstName.trim()) return;
    setIsQuickAdding(true);
    try {
      const newFarmer = await farmerService.createShadowFarmer({
        firstName: quickAddFirstName.trim(),
        lastName: quickAddLastName.trim(),
        phone: quickAddPhone.trim() || undefined,
      });
      if (newFarmer) {
        await handleSelectFarmer(newFarmer);
      }
    } catch (err) {
      alert(err?.response?.data?.message || 'Xatolik yuz berdi');
    } finally {
      setIsQuickAdding(false);
    }
  };

  const formatType = (type) => {
    if (!type) return '';
    const types = { YOGOCH: "Yog'och", PLASTIK: 'Plastik', KARTON: 'Karton', TEMIR: 'Temir' };
    return types[type] || type;
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
      const newDist = await distributionService.distributeBasket(formData);
      if (newDist) {
        const newId = newDist.id || Date.now();
        setSuccessId(newId);
        setDistributions(prev => [{ ...newDist, id: newId }, ...prev]);
        const updated = selectedBasketStock - parseInt(formData.quantity);
        setBaskets(prev =>
          prev.map(b => b.id.toString() === formData.basketId ? { ...b, quantity: updated } : b)
        );
        setSelectedBasketStock(updated);
        setFormData(prev => ({ ...prev, quantity: '' }));
        if (historyListRef.current) historyListRef.current.scrollTop = 0;
        handleSelectFarmer(selectedFarmer);
        setTimeout(() => setSuccessId(null), 2500);
      }
    } catch (err) {
      alert(err?.response?.data?.message || "Xatolik yuz berdi. Qayta urinib ko'ring.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!canDistribute) {
    return (
      <div className="p-8 text-center text-red-500 font-medium bg-red-50 rounded-lg m-6">
        Sizda bu sahifaga kirish huquqi yo'q.
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 bg-slate-50 text-slate-900 w-full min-h-screen">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <div className="p-3 bg-[#1B5E20] rounded-lg text-white shadow-sm">
            <Package size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Savat tarqatish</h1>
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center gap-3 text-slate-400 py-32 bg-white rounded-xl shadow-sm border border-slate-200">
            <Loader2 className="animate-spin text-[#1B5E20]" size={32} />
            <span className="font-medium">Ma'lumotlar yuklanmoqda...</span>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">

              {/* ===== LEFT: FORM ===== */}
              <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col gap-6">

                {/* Farmer search */}
                <div className="relative" ref={dropdownRef}>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Fermerni tanlang <span className="text-red-500">*</span>
                  </label>

                  {selectedFarmer ? (
                    <div className="flex items-center justify-between px-4 py-3 bg-green-50/50 border border-green-200 rounded-lg">
                      <div>
                        <span className="font-bold text-green-900 block">
                          {selectedFarmer.name} {selectedFarmer.surname}
                        </span>
                        <span className="text-sm font-medium text-green-700">{selectedFarmer.phone}</span>
                      </div>
                      <button
                        type="button"
                        onClick={handleClearFarmer}
                        className="p-2 bg-white text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md shadow-sm border border-green-100 transition-colors"
                      >
                        <X size={18} strokeWidth={2.5} />
                      </button>
                    </div>
                  ) : (
                    <div className="relative">
                      {/* Search input */}
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        {isSearchingFarmer
                          ? <Loader2 size={18} className="text-[#1B5E20] animate-spin" />
                          : <Search size={18} className="text-slate-400" />}
                      </div>
                      <input
                        type="text"
                        autoComplete="off"
                        value={farmerSearch}
                        onChange={e => setFarmerSearch(e.target.value)}
                        onFocus={() => {
                          if (farmerSearch.length >= 2) setIsDropdownOpen(true);
                        }}
                        placeholder="Kamida 2 ta harf yoki raqam yozing..."
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-300 focus:border-[#1B5E20] focus:ring-4 focus:ring-green-500/10 rounded-lg text-slate-900 outline-none transition-all font-medium"
                      />

                      {/* Dropdown */}
                      {isDropdownOpen && farmerSearch.length >= 2 && (
                        <div className="absolute z-50 w-full mt-1 bg-white rounded-xl shadow-xl border border-slate-200 max-h-72 overflow-y-auto">

                          {isSearchingFarmer ? (
                            <div className="p-4 text-center text-slate-500 text-sm flex items-center justify-center gap-2">
                              <Loader2 size={16} className="animate-spin text-[#1B5E20]" />
                              Bazada izlanmoqda...
                            </div>

                          ) : searchResults.length > 0 ? (
                            /* Natijalar ro'yxati */
                            searchResults.map(f => (
                              <div
                                key={f.id}
                                onMouseDown={e => { e.preventDefault(); handleSelectFarmer(f); }}
                                className="flex flex-col px-4 py-3 hover:bg-green-50/50 border-b border-slate-100 last:border-0 cursor-pointer transition-colors"
                              >
                                <span className="font-bold text-slate-800">{f.name || f.firstName} {f.surname || f.lastName}</span>
                                <span className="text-sm font-medium text-slate-500">{f.phone || f.phoneNumber}</span>
                              </div>
                            ))

                          ) : !quickAddOpen ? (
                            /* Topilmadi + tez qo'shish tugmasi */
                            <div className="p-4 text-center">
                              <p className="text-sm text-slate-500 font-medium mb-3">
                                «{farmerSearch}» topilmadi
                              </p>
                              <button
                                onMouseDown={openQuickAdd}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-green-50 hover:bg-green-100 text-[#1B5E20] font-semibold rounded-lg border border-green-200 transition-colors text-sm"
                              >
                                <Plus size={16} />
                                «{farmerSearch}» ni tez qo'shish
                              </button>
                            </div>

                          ) : (
                            /* ===== QUICK ADD FORMA ===== */
                            <div
                              className="p-4 space-y-3"
                              onMouseDown={e => e.stopPropagation()} // butun forma ichida click outside ni bloklash
                            >
                              <div className="flex items-center justify-between mb-1">
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                  Yangi fermer qo'shish
                                </p>
                                <button
                                  onMouseDown={cancelQuickAdd}
                                  className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                  <X size={14} />
                                </button>
                              </div>

                              <input
                                autoFocus
                                type="text"
                                placeholder="Ism *"
                                value={quickAddFirstName}
                                onChange={e => setQuickAddFirstName(e.target.value)}
                                onKeyDown={e => { if (e.key === 'Enter') handleQuickAdd(e); }}
                                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:border-[#1B5E20] focus:ring-2 focus:ring-green-500/10 outline-none font-medium"
                              />
                              <input
                                type="text"
                                placeholder="Familiya (ixtiyoriy)"
                                value={quickAddLastName}
                                onChange={e => setQuickAddLastName(e.target.value)}
                                onKeyDown={e => { if (e.key === 'Enter') handleQuickAdd(e); }}
                                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:border-[#1B5E20] focus:ring-2 focus:ring-green-500/10 outline-none"
                              />
                              <input
                                type="text"
                                placeholder="+998__ ___ __ __ (ixtiyoriy)"
                                value={quickAddPhone}
                                onChange={e => setQuickAddPhone(e.target.value)}
                                onKeyDown={e => { if (e.key === 'Enter') handleQuickAdd(e); }}
                                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:border-[#1B5E20] focus:ring-2 focus:ring-green-500/10 outline-none font-mono"
                              />

                              <div className="flex gap-2 pt-1">
                                <button
                                  onMouseDown={cancelQuickAdd}
                                  className="flex-1 py-2 text-sm text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                                >
                                  Bekor
                                </button>
                                <button
                                  onMouseDown={handleQuickAdd}
                                  disabled={isQuickAdding || !quickAddFirstName.trim()}
                                  className="flex-1 py-2 text-sm font-bold bg-[#1B5E20] text-white rounded-lg hover:bg-green-800 disabled:opacity-50 flex items-center justify-center gap-1.5 transition-colors"
                                >
                                  {isQuickAdding
                                    ? <Loader2 size={14} className="animate-spin" />
                                    : <Check size={14} />}
                                  Qo'shish
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Basket select */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-semibold text-slate-700">
                      Tara turi <span className="text-red-500">*</span>
                    </label>
                    <span className="text-xs font-medium px-2 py-1 bg-slate-100 rounded text-slate-600">
                      Omborda:{' '}
                      <span className={`font-bold ${selectedBasketStock < 50 ? 'text-red-600' : 'text-green-600'}`}>
                        {selectedBasketStock}
                      </span>
                    </span>
                  </div>
                  <select
                    required
                    value={formData.basketId}
                    onChange={handleBasketChange}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-300 focus:border-[#1B5E20] focus:ring-4 focus:ring-green-500/10 rounded-lg font-medium text-slate-900 outline-none transition-all cursor-pointer"
                    disabled={isSubmitting || baskets.length === 0}
                  >
                    {baskets.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>

                {/* Quantity */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Berilayotgan soni <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      ref={quantityInputRef}
                      type="number"
                      min="1"
                      max={selectedBasketStock || 999999}
                      required
                      value={formData.quantity}
                      onChange={e => setFormData({ ...formData, quantity: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-300 focus:border-[#1B5E20] focus:ring-4 focus:ring-green-500/10 rounded-lg text-slate-900 outline-none transition-all font-bold text-lg"
                      disabled={isSubmitting || !formData.basketId || !selectedFarmer}
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold pointer-events-none">
                      dona
                    </span>
                  </div>
                </div>

                {/* Submit */}
                <div className="pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isSubmitting || !selectedFarmer || !formData.quantity}
                    className="w-full px-8 py-3.5 bg-[#1B5E20] text-white rounded-lg font-bold hover:bg-green-800 focus:ring-4 focus:ring-green-500/30 disabled:opacity-50 disabled:hover:bg-[#1B5E20] transition-all flex justify-center items-center gap-2 shadow-sm"
                  >
                    {isSubmitting
                      ? <Loader2 size={20} className="animate-spin" />
                      : <Check size={20} strokeWidth={2.5} />}
                    Jarayonni tasdiqlash
                  </button>
                </div>
              </div>

              {/* ===== RIGHT: HISTORY ===== */}
              <div className="lg:col-span-3 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/60 flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-[#1B5E20]" />
                    <h3 className="font-bold text-slate-700 text-sm uppercase tracking-wider">Oxirgi tarqatilganlar</h3>
                  </div>
                  <span className="text-xs font-bold bg-green-100 text-[#1B5E20] px-3 py-1 rounded-full shadow-sm border border-green-200">
                    {distributions.length > 10 ? '10+' : distributions.length} ta yozuv
                  </span>
                </div>

                <div className="grid grid-cols-12 gap-2 px-5 py-2.5 border-b border-slate-100 bg-slate-50/40 flex-shrink-0">
                  <div className="col-span-5 flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <User size={12} /> Fermer
                  </div>
                  <div className="col-span-4 flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <ShoppingBasket size={12} /> Tara turi
                  </div>
                  <div className="col-span-2 flex items-center justify-end gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <Hash size={12} /> Soni
                  </div>
                  <div className="col-span-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">
                    Vaqt
                  </div>
                </div>

                <div ref={historyListRef} className="overflow-y-auto" style={{ maxHeight: '420px' }}>
                  {distributions.length === 0 ? (
                    <div className="text-center py-16 text-slate-400">
                      <Package size={48} className="mx-auto text-slate-200 mb-3" />
                      <p className="text-sm font-medium">Hozircha tarix bo'sh.</p>
                    </div>
                  ) : (
                    distributions.slice(0, 10).map((dist, idx) => (
                      <div
                        key={dist.id}
                        className={`grid grid-cols-12 gap-2 items-center px-5 py-3.5 border-b border-slate-100 last:border-0 transition-all duration-500 ${
                          successId === dist.id
                            ? 'bg-green-50 border-l-4 border-l-green-500'
                            : idx % 2 === 0
                              ? 'hover:bg-slate-50/80'
                              : 'bg-slate-50/30 hover:bg-slate-50/80'
                        }`}
                      >
                        <div className="col-span-5 flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-full bg-green-50 flex-shrink-0 flex items-center justify-center text-[#1B5E20] font-bold text-[12px] border border-green-100 shadow-sm">
                            {getInitials(dist.farmerFullName)}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-800 text-[13px] truncate leading-tight mb-0.5">
                              {dist.farmerFullName || "Noma'lum"}
                            </p>
                            <p className="text-[11px] font-medium text-slate-400 font-mono">{dist.farmerPhone}</p>
                          </div>
                        </div>

                        <div className="col-span-4 min-w-0">
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-600 bg-white border border-slate-200 px-2.5 py-1 rounded-lg max-w-full shadow-sm">
                            <ShoppingBasket size={12} className="flex-shrink-0 text-orange-400" />
                            <span className="truncate">{dist.basketName || '—'}</span>
                          </span>
                        </div>

                        <div className="col-span-2 flex flex-col items-end">
                          <span className="text-[20px] font-black text-[#1B5E20] leading-none">{dist.quantity}</span>
                          <span className="text-[9px] font-bold text-slate-400 uppercase mt-1">dona</span>
                        </div>

                        <div className="col-span-1 flex flex-col items-end justify-center gap-0.5">
                          {(() => {
                            if (!dist.createdAt) return <span className="text-[10px] text-slate-400">—</span>;
                            const d = new Date(dist.createdAt);
                            const soat = d.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });
                            const sana = `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}`;
                            return (
                              <>
                                <span className="text-[14px] font-bold text-slate-700 leading-none whitespace-nowrap">{soat}</span>
                                <span className="text-[10px] font-medium text-slate-400 whitespace-nowrap mt-0.5">{sana}</span>
                              </>
                            );
                          })()}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* ===== BOTTOM: QARZ DETALLARI ===== */}
            {selectedFarmer && (
              <div className="mt-6 bg-white border border-green-500 rounded-xl shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">

                <div
                  onClick={() => setIsStatsExpanded(!isStatsExpanded)}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-green-50/30 gap-4 cursor-pointer hover:bg-green-50/60 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-green-100 border border-green-200 text-green-700 font-bold flex items-center justify-center text-lg flex-shrink-0">
                      {getInitials(selectedFarmer.name + ' ' + selectedFarmer.surname)}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-lg">
                        {selectedFarmer.name} {selectedFarmer.surname}
                      </h3>
                      <p className="text-sm text-slate-500 flex items-center gap-1.5 mt-0.5">
                        <Phone size={14} className="text-slate-400" /> {selectedFarmer.phone}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-6 sm:border-l sm:border-slate-200 sm:pl-6">
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Jami qarz</p>
                      <p className="font-black text-red-500 text-xl flex items-center justify-end gap-1.5">
                        {isLoadingDebt
                          ? <Loader2 size={16} className="animate-spin text-red-400" />
                          : <Package size={18} className="text-red-400" />}
                        {debtDetails.totalBaskets} ta
                      </p>
                    </div>
                    <button className="w-10 h-10 rounded-xl bg-green-100 text-green-600 flex items-center justify-center">
                      {isStatsExpanded ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                    </button>
                  </div>
                </div>

                {isStatsExpanded && !isLoadingDebt && (
                  <div className="border-t border-green-100">
                    <div className="px-5 py-4 bg-slate-50/50 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-slate-700 font-bold text-sm">
                        <Receipt size={18} className="text-slate-500" /> Savatlar Bo'yicha Chek
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Jami Summa:</p>
                        <p className="font-black text-[#1B5E20] text-lg leading-none">
                          {debtDetails.totalAmount?.toLocaleString()}{' '}
                          <span className="text-xs font-bold text-slate-500">so'm</span>
                        </p>
                      </div>
                    </div>

                    <div className="p-5 pt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                      {debtDetails.baskets.length === 0 ? (
                        <div className="col-span-2 text-center text-sm font-medium text-slate-500 py-6">
                          Fermerda qarz topilmadi.
                        </div>
                      ) : (
                        debtDetails.baskets.map((basket, idx) => (
                          <div key={idx} className="border border-slate-200 rounded-xl p-4 bg-white shadow-sm hover:border-green-200 transition-colors">
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center border border-blue-100 flex-shrink-0">
                                  <Box size={20} />
                                </div>
                                <div>
                                  <h4 className="font-bold text-slate-800">{basket.name}</h4>
                                  <span className="text-[10px] font-bold text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded mt-1 inline-block uppercase tracking-wider">
                                    {formatType(basket.type)}
                                  </span>
                                </div>
                              </div>
                              <div className="bg-red-50 text-red-500 rounded-lg px-3 py-1.5 text-center border border-red-100">
                                <p className="font-black text-xl leading-none">{basket.quantity}</p>
                                <p className="text-[9px] font-bold uppercase tracking-widest mt-1 text-red-400">Dona</p>
                              </div>
                            </div>

                            <div className="bg-slate-50 rounded-lg p-3 flex items-center justify-between border border-slate-100">
                              <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">1 Dona Narxi</p>
                                <p className="font-bold text-slate-700 text-sm">
                                  {basket.unitPrice?.toLocaleString()}{' '}
                                  <span className="text-[10px] font-bold text-slate-400 uppercase">so'm</span>
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Umumiy</p>
                                <p className="font-black text-[#1B5E20] text-base">
                                  {basket.totalPrice?.toLocaleString()}{' '}
                                  <span className="text-[10px] font-bold text-slate-400 uppercase">so'm</span>
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}