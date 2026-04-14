import React, { useState, useEffect, useRef } from 'react';
import distributionService from '../../services/distributionService';
import basketService from '../../services/basketService';
import { useAuth } from '../../hooks/useAuth';
import { Loader2, Search, X, Check, Package, Clock, ChevronRight, User, ShoppingBasket, Hash } from 'lucide-react';

export default function BasketDistributionPage() {
  const [distributions, setDistributions] = useState([]);
  const [baskets, setBaskets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successId, setSuccessId] = useState(null);

  const { user } = useAuth();
  const canDistribute = user?.role?.includes('BROKER') || user?.role?.includes('ACCOUNTANT');

  const [formData, setFormData] = useState({ farmerId: '', basketId: '', quantity: '' });
  const [selectedBasketStock, setSelectedBasketStock] = useState(0);

  const [farmerSearch, setFarmerSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearchingFarmer, setIsSearchingFarmer] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedFarmer, setSelectedFarmer] = useState(null);

  const dropdownRef = useRef(null);
  const quantityInputRef = useRef(null);
  const historyListRef = useRef(null);

  const getInitials = (fullName) => {
    if (!fullName) return 'F';
    const names = fullName.trim().split(' ');
    if (names.length >= 2) return `${names[0][0]}${names[1][0]}`.toUpperCase();
    return fullName.substring(0, 2).toUpperCase();
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('uz-UZ', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  useEffect(() => {
    fetchInitialData();
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setIsDropdownOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (farmerSearch.trim().length < 2) { setSearchResults([]); setIsSearchingFarmer(false); return; }
    setIsSearchingFarmer(true);
    const timer = setTimeout(async () => {
      try {
        const results = await distributionService.searchFarmers(farmerSearch.trim());
        setSearchResults(Array.isArray(results) ? results : []);
      } catch (e) { console.error(e); }
      finally { setIsSearchingFarmer(false); setIsDropdownOpen(true); }
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
      const available = Array.isArray(basketsData?.content) ? basketsData.content.filter(b => b.isActive) : [];
      setBaskets(available);
      if (available.length > 0) {
        setFormData(prev => ({ ...prev, basketId: available[0].id.toString() }));
        setSelectedBasketStock(available[0].quantity || 0);
      }
    } catch (e) { console.error(e); }
    finally { setIsLoading(false); }
  };

  const handleBasketChange = (e) => {
    const bId = e.target.value;
    setFormData({ ...formData, basketId: bId });
    const sel = baskets.find(b => b.id.toString() === bId);
    setSelectedBasketStock(sel ? sel.quantity : 0);
  };

  const handleSelectFarmer = (farmer) => {
    setSelectedFarmer(farmer);
    setFormData({ ...formData, farmerId: farmer.id });
    setFarmerSearch(''); setSearchResults([]); setIsDropdownOpen(false);
    setTimeout(() => { if (quantityInputRef.current) quantityInputRef.current.focus(); }, 50);
  };

  const handleClearFarmer = () => { setSelectedFarmer(null); setFormData({ ...formData, farmerId: '' }); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.farmerId || !formData.basketId || !formData.quantity) return;
    if (parseInt(formData.quantity) > selectedBasketStock) {
      alert(`Omborda faqat ${selectedBasketStock} ta tara qoldi!`); return;
    }
    setIsSubmitting(true);
    try {
      const newDist = await distributionService.distributeBasket(formData);
      if (newDist) {
        const newId = newDist.id || Date.now();
        setSuccessId(newId);
        setDistributions(prev => [{ ...newDist, id: newId }, ...prev]);
        const updated = selectedBasketStock - parseInt(formData.quantity);
        setBaskets(prev => prev.map(b => b.id.toString() === formData.basketId ? { ...b, quantity: updated } : b));
        setSelectedBasketStock(updated);
        setFormData(prev => ({ ...prev, farmerId: '', quantity: '' }));
        setSelectedFarmer(null);
        if (historyListRef.current) historyListRef.current.scrollTop = 0;
        setTimeout(() => setSuccessId(null), 2500);
      }
    } catch (err) {
      alert(err?.response?.data?.message || "Xatolik yuz berdi. Qayta urinib ko'ring.");
    } finally { setIsSubmitting(false); }
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
            <p className="text-slate-500 text-sm mt-0.5">Ombordan fermerlarga tara biriktirish formasi</p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center gap-3 text-slate-400 py-32 bg-white rounded-xl shadow-sm border border-slate-200">
            <Loader2 className="animate-spin text-[#1B5E20]" size={32} />
            <span className="font-medium">Ma'lumotlar yuklanmoqda...</span>
          </div>
        ) : (
          /* 5-col grid: form=2, history=3 */
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">

            {/* ===== LEFT: FORM (2 cols) ===== */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col gap-6">

              {/* Farmer search */}
              <div className="relative" ref={dropdownRef}>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Fermerni tanlang <span className="text-red-500">*</span>
                </label>
                {selectedFarmer ? (
                  <div className="flex items-center justify-between px-4 py-3 bg-green-50 border border-green-200 rounded-lg">
                    <div>
                      <span className="font-semibold text-green-900 block">{selectedFarmer.name} {selectedFarmer.surname}</span>
                      <span className="text-sm text-green-700">{selectedFarmer.phone}</span>
                    </div>
                    <button type="button" onClick={handleClearFarmer}
                      className="p-1.5 bg-white text-slate-400 hover:text-red-500 rounded-md shadow-sm border border-green-100 transition-colors">
                      <X size={18} strokeWidth={2.5} />
                    </button>
                  </div>
                ) : (
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      {isSearchingFarmer
                        ? <Loader2 size={18} className="text-[#1B5E20] animate-spin" />
                        : <Search size={18} className="text-slate-400" />}
                    </div>
                    <input
                      type="text" autoComplete="off" value={farmerSearch}
                      onChange={e => setFarmerSearch(e.target.value)}
                      onFocus={() => { if (farmerSearch.length >= 2) setIsDropdownOpen(true); }}
                      placeholder="Kamida 2 ta harf yoki raqam yozing..."
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-300 focus:border-[#1B5E20] focus:ring-4 focus:ring-green-500/10 rounded-lg text-slate-900 outline-none transition-all"
                    />
                    {isDropdownOpen && farmerSearch.length >= 2 && (
                      <div className="absolute z-50 w-full mt-1 bg-white rounded-lg shadow-lg border border-slate-200 max-h-60 overflow-y-auto">
                        {isSearchingFarmer ? (
                          <div className="p-4 text-center text-slate-500 text-sm flex items-center justify-center gap-2">
                            <Loader2 size={16} className="animate-spin text-[#1B5E20]" /> Bazada izlanmoqda...
                          </div>
                        ) : searchResults.length === 0 ? (
                          <div className="p-4 text-center text-slate-500 text-sm">Fermer topilmadi.</div>
                        ) : searchResults.map(f => (
                          <div key={f.id}
                            onMouseDown={e => { e.preventDefault(); handleSelectFarmer(f); }}
                            className="flex flex-col px-4 py-3 hover:bg-slate-50 border-b border-slate-100 last:border-0 cursor-pointer transition-colors">
                            <span className="font-medium text-slate-800">{f.name} {f.surname}</span>
                            <span className="text-sm text-slate-500">{f.phone}</span>
                          </div>
                        ))}
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
                    Omborda: <span className={`font-bold ${selectedBasketStock < 50 ? 'text-red-600' : 'text-green-600'}`}>{selectedBasketStock}</span>
                  </span>
                </div>
                <select required value={formData.basketId} onChange={handleBasketChange}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-300 focus:border-[#1B5E20] focus:ring-4 focus:ring-green-500/10 rounded-lg text-slate-900 outline-none transition-all cursor-pointer"
                  disabled={isSubmitting || baskets.length === 0}>
                  {baskets.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Berilayotgan soni <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input ref={quantityInputRef} type="number" min="1" max={selectedBasketStock || 999999} required
                    value={formData.quantity}
                    onChange={e => setFormData({ ...formData, quantity: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-300 focus:border-[#1B5E20] focus:ring-4 focus:ring-green-500/10 rounded-lg text-slate-900 outline-none transition-all font-medium"
                    placeholder="Masalan: 100"
                    disabled={isSubmitting || !formData.basketId || !selectedFarmer} />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium pointer-events-none">ta</span>
                </div>
              </div>

              {/* Submit */}
              <div className="pt-2 border-t border-slate-100">
                <button type="button" onClick={handleSubmit}
                  disabled={isSubmitting || !selectedFarmer || !formData.quantity}
                  className="w-full px-8 py-3 bg-[#1B5E20] text-white rounded-lg font-medium hover:bg-green-800 focus:ring-4 focus:ring-green-500/30 disabled:opacity-50 disabled:hover:bg-[#1B5E20] transition-all flex justify-center items-center gap-2">
                  {isSubmitting ? <Loader2 size={20} className="animate-spin" /> : <Check size={20} strokeWidth={2.5} />}
                  Jarayonni tasdiqlash
                </button>
              </div>
            </div>

            {/* ===== RIGHT: HISTORY (3 cols) ===== */}
            <div className="lg:col-span-3 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">

              {/* Panel header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/60 flex-shrink-0">
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-[#1B5E20]" />
                  <h3 className="font-semibold text-slate-700 text-sm uppercase tracking-wider">Oxirgi tarqatilganlar</h3>
                </div>
                <span className="text-xs font-bold bg-green-100 text-[#1B5E20] px-3 py-1 rounded-full">
                  {distributions.length > 10 ? '10+' : distributions.length} ta yozuv
                </span>
              </div>

              {/* Column labels */}
              <div className="grid grid-cols-12 gap-2 px-5 py-2 border-b border-slate-100 bg-slate-50/40 flex-shrink-0">
                <div className="col-span-5 flex items-center gap-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  <User size={10} /> Fermer
                </div>
                <div className="col-span-4 flex items-center gap-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  <ShoppingBasket size={10} /> Tara turi
                </div>
                <div className="col-span-2 flex items-center justify-end gap-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  <Hash size={10} /> Soni
                </div>
                <div className="col-span-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider text-right">
                  Vaqt
                </div>
              </div>

              {/* Scrollable rows — py-3 instead of py-4, fits ~5 rows */}
              <div ref={historyListRef} className="overflow-y-auto" style={{ maxHeight: '400px' }}>
                {distributions.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 text-sm">Hozircha tarix bo'sh.</div>
                ) : (
                  distributions.slice(0, 10).map((dist, idx) => (
                    <div key={dist.id}
                      className={`grid grid-cols-12 gap-2 items-center px-5 py-3 border-b border-slate-100 last:border-0 transition-all duration-500 ${successId === dist.id
                        ? 'bg-green-50 border-l-2 border-l-green-400'
                        : idx % 2 === 0
                          ? 'hover:bg-slate-50/60'
                          : 'bg-slate-50/20 hover:bg-slate-50/60'
                        }`}>

                      {/* Farmer — col 5 */}
                      <div className="col-span-5 flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex-shrink-0 flex items-center justify-center text-[#1B5E20] font-bold text-[11px] border border-slate-200">
                          {getInitials(dist.farmerFullName)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-800 text-[12px] truncate leading-tight">
                            {dist.farmerFullName || "Noma'lum"}
                          </p>
                          <p className="text-[10px] text-slate-400 font-mono">{dist.farmerPhone}</p>
                        </div>
                      </div>

                      {/* Basket name — col 4 */}
                      <div className="col-span-4 min-w-0">
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md max-w-full">
                          <ShoppingBasket size={10} className="flex-shrink-0 text-slate-400" />
                          <span className="truncate">{dist.basketName || '—'}</span>
                        </span>
                      </div>

                      {/* Quantity — col 2, big number */}
                      <div className="col-span-2 flex flex-col items-end">
                        <span className="text-[18px] font-bold text-[#1B5E20] leading-none">
                          {dist.quantity}
                        </span>
                        <span className="text-[9px] text-slate-400 font-medium mt-0.5">dona</span>
                      </div>

                      {/* Time + Date stacked — col 1 */}
                      <div className="col-span-1 flex flex-col items-end justify-center gap-0.5">
                        {(() => {
                          if (!dist.createdAt) return <span className="text-[10px] text-slate-400">—</span>;
                          const d = new Date(dist.createdAt);
                          const soat = d.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });
                          const sana = `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}`;
                          return (
                            <>
                              <span className="text-[13px] font-semibold text-slate-600 leading-none whitespace-nowrap">{soat}</span>
                              <span className="text-[9px] text-slate-400 whitespace-nowrap">{sana}</span>
                            </>
                          );
                        })()}
                      </div>

                    </div>
                  ))
                )}
              </div>

              {/* Footer */}
              {distributions.length > 10 && (
                <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/50 flex-shrink-0">
                  <button className="w-full flex items-center justify-center gap-1 text-[12px] font-semibold text-[#1B5E20] hover:text-green-800 transition-colors uppercase tracking-wide">
                    Barcha tarixni ko'rish <ChevronRight size={14} strokeWidth={2.5} />
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