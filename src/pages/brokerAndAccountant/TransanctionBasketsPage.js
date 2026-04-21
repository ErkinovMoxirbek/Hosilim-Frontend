import React, { useState, useEffect, useRef } from 'react';
import distributionService from '../../services/distributionService';
import basketService from '../../services/basketService';
import { Loader2, Search, Filter, ChevronLeft, ChevronRight, X, Box, Package, Clock, Calendar } from 'lucide-react';

export default function BasketHistoryPage() {
  const [transactions, setTransactions] = useState([]);
  const [baskets, setBaskets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Paginatsiya state'lari
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 15;

  // Filtr state'lari
  const [filters, setFilters] = useState({
    farmerId: '',
    basketId: '',
    type: '' // Hozircha faqat 'GIVEN_TO_FARMER' bo'lishi mumkin
  });

  // Fermer qidiruv state'lari
  const [farmerSearch, setFarmerSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearchingFarmer, setIsSearchingFarmer] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedFarmer, setSelectedFarmer] = useState(null);
  const dropdownRef = useRef(null);

  // Helper: Initsiallar
  const getInitials = (fullName) => {
    if (!fullName) return 'F';
    const names = fullName.trim().split(' ');
    if (names.length >= 2) return `${names[0][0]}${names[1][0]}`.toUpperCase();
    return fullName.substring(0, 2).toUpperCase();
  };

  // Helper: Vaqt va Sana
  const formatDateTime = (dateString) => {
    if (!dateString) return { time: '', date: '' };
    const d = new Date(dateString);
    const time = d.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });
    const date = d.toLocaleDateString('uz-UZ', { month: 'short', day: 'numeric', year: 'numeric' });
    return { time, date };
  };

  // Dropdown yopish
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Boshlang'ich datalarni va Savatlarni yuklash
  useEffect(() => {
    fetchBaskets();
    fetchTransactions(0, filters);
  }, []);

  // Fermer izlash (Debounce)
  useEffect(() => {
    if (farmerSearch.trim().length < 2) {
      setSearchResults([]);
      setIsSearchingFarmer(false);
      return;
    }
    
    setIsSearchingFarmer(true);
    const timer = setTimeout(async () => {
      try {
        const results = await distributionService.searchFarmers(farmerSearch.trim());
        setSearchResults(Array.isArray(results) ? results : []);
      } catch (e) {
        console.error("Fermer qidirishda xatolik:", e);
      } finally {
        setIsSearchingFarmer(false);
        setIsDropdownOpen(true);
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, [farmerSearch]);

  const fetchBaskets = async () => {
    try {
      const basketsData = await basketService.getBaskets();
      const available = Array.isArray(basketsData?.content) ? basketsData.content : [];
      setBaskets(available);
    } catch (error) {
      console.error('Savatlarni yuklashda xatolik:', error);
    }
  };

  // Asosiy API chaqiruvi (Filtrlar bilan)
  const fetchTransactions = async (pageToFetch, currentFilters) => {
    setIsLoading(true);
    try {
      // Backend API ga parametrlarni jo'natish
      // Eslatma: distributionService ichiga getAllTransactions degan yangi metod qo'shishingiz kerak!
      const response = await distributionService.getAllTransactions({
        page: pageToFetch,
        size: pageSize,
        farmerId: currentFilters.farmerId || null,
        basketId: currentFilters.basketId || null,
        type: currentFilters.type || null
      });

      if (response && response.content) {
        setTransactions(response.content);
        setTotalPages(response.totalPages);
        setTotalElements(response.totalElements);
        setCurrentPage(response.number);
      } else {
        setTransactions(Array.isArray(response) ? response : []);
      }
    } catch (error) {
      console.error('Tarixni yuklashda xatolik:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filtr o'zgarganda
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);
    fetchTransactions(0, newFilters); // Filtr o'zgarsa har doim 1-sahifadan boshlaymiz
  };

  // Fermer tanlanganda
  const handleSelectFarmer = (farmer) => {
    setSelectedFarmer(farmer);
    const newFilters = { ...filters, farmerId: farmer.id };
    setFilters(newFilters);
    setFarmerSearch('');
    setSearchResults([]);
    setIsDropdownOpen(false);
    fetchTransactions(0, newFilters);
  };

  // Fermer filtrini tozalash
  const handleClearFarmer = () => {
    setSelectedFarmer(null);
    const newFilters = { ...filters, farmerId: '' };
    setFilters(newFilters);
    fetchTransactions(0, newFilters);
  };

  // Sahifa o'zgarganda
  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      fetchTransactions(newPage, filters);
    }
  };

  return (
    <div className="p-4 sm:p-6 bg-slate-50 text-slate-900 w-full min-h-screen">
      <div className="max-w-7xl mx-auto w-full flex flex-col">

        {/* ===== HEADER ===== */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[#1B5E20] rounded-lg text-white shadow-sm">
              <Clock size={22} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Savatlar Tarixi</h1>
              <p className="text-slate-500 text-sm mt-0.5">Barcha tarqatilgan savatlar ro'yxati</p>
            </div>
          </div>
          
          <div className="bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm flex items-center gap-2">
            <span className="text-sm text-slate-500 font-medium">Jami yozuvlar:</span>
            <span className="font-bold text-[#1B5E20] text-lg leading-none">{totalElements}</span>
          </div>
        </div>

        {/* ===== FILTRLAR QISMI ===== */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-5 mb-6 flex flex-col lg:flex-row gap-4 items-end">
          
          {/* Fermer bo'yicha filtr */}
          <div className="w-full lg:w-1/3 relative" ref={dropdownRef}>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Fermer bo'yicha qidirish
            </label>
            
            {selectedFarmer ? (
              <div className="flex items-center justify-between px-3 py-2.5 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-[#1B5E20] font-bold text-xs shadow-sm border border-green-100">
                    {getInitials(`${selectedFarmer.name} ${selectedFarmer.surname}`)}
                  </div>
                  <div>
                    <span className="font-bold text-green-900 text-sm block leading-none">{selectedFarmer.name}</span>
                    <span className="text-[11px] text-green-700 font-mono mt-0.5">{selectedFarmer.phone}</span>
                  </div>
                </div>
                <button onClick={handleClearFarmer} className="p-1.5 hover:bg-white rounded-md text-slate-400 hover:text-red-500 transition-colors">
                  <X size={16} strokeWidth={2.5} />
                </button>
              </div>
            ) : (
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  {isSearchingFarmer ? <Loader2 size={16} className="text-[#1B5E20] animate-spin" /> : <Search size={16} className="text-slate-400" />}
                </div>
                <input
                  type="text" 
                  autoComplete="off" 
                  value={farmerSearch}
                  onChange={e => setFarmerSearch(e.target.value)}
                  onFocus={() => { if (farmerSearch.length >= 2) setIsDropdownOpen(true); }}
                  placeholder="Ism yoki telefon raqam..."
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#1B5E20] focus:ring-1 focus:ring-[#1B5E20] rounded-lg text-slate-900 text-sm outline-none transition-all"
                />
                
                {isDropdownOpen && farmerSearch.length >= 2 && (
                  <div className="absolute z-50 w-full mt-1 bg-white rounded-lg shadow-lg border border-slate-200 max-h-60 overflow-y-auto">
                    {isSearchingFarmer ? (
                      <div className="p-3 text-center text-slate-500 text-xs flex items-center justify-center gap-2">
                        <Loader2 size={14} className="animate-spin text-[#1B5E20]" /> Qidirilmoqda...
                      </div>
                    ) : searchResults.length === 0 ? (
                      <div className="p-3 text-center text-slate-500 text-xs">Fermer topilmadi.</div>
                    ) : searchResults.map(f => (
                      <div key={f.id} onMouseDown={e => { e.preventDefault(); handleSelectFarmer(f); }} className="flex flex-col px-3 py-2 hover:bg-slate-50 border-b border-slate-100 last:border-0 cursor-pointer">
                        <span className="font-bold text-slate-800 text-sm">{f.name} {f.surname}</span>
                        <span className="text-xs text-slate-500 font-mono">{f.phone}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Savat turi bo'yicha filtr */}
          <div className="w-full lg:w-1/4">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Tara turi
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Box size={16} className="text-slate-400" />
              </div>
              <select
                name="basketId"
                value={filters.basketId}
                onChange={handleFilterChange}
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#1B5E20] focus:ring-1 focus:ring-[#1B5E20] rounded-lg text-slate-900 text-sm outline-none transition-all cursor-pointer font-medium appearance-none"
              >
                <option value="">Barcha taralar</option>
                {baskets.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Tozalash tugmasi (Faqat filtr tanlanganda chiqadi) */}
          {(filters.farmerId || filters.basketId) && (
            <div className="w-full lg:w-auto flex-shrink-0">
              <button 
                onClick={() => {
                  setSelectedFarmer(null);
                  setFarmerSearch('');
                  const emptyFilters = { farmerId: '', basketId: '', type: '' };
                  setFilters(emptyFilters);
                  fetchTransactions(0, emptyFilters);
                }}
                className="px-4 py-2.5 text-sm font-semibold text-slate-500 hover:text-red-600 bg-slate-100 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <Filter size={16} />
                Filtrni tozalash
              </button>
            </div>
          )}
        </div>

        {/* ===== JADVAL QISMI (TABLE) ===== */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col flex-1">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200">
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider w-16 text-center">#</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Fermer ma'lumotlari</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Tara turi</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Berilgan soni</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Sana va Vaqt</th>
                </tr>
              </thead>
              
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-16 text-center">
                      <Loader2 className="animate-spin text-[#1B5E20] mx-auto mb-3" size={28} />
                      <p className="text-slate-500 text-sm">Tarix yuklanmoqda...</p>
                    </td>
                  </tr>
                ) : transactions.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-16 text-center">
                      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Search size={24} className="text-slate-400" />
                      </div>
                      <p className="text-slate-600 font-medium">Hech qanday ma'lumot topilmadi</p>
                      <p className="text-slate-400 text-sm mt-1">Boshqa qidiruv so'zlarini kiritib ko'ring</p>
                    </td>
                  </tr>
                ) : (
                  transactions.map((dist, index) => {
                    const { time, date } = formatDateTime(dist.createdAt || dist.date);
                    // Umumiy ro'yxatdagi tartib raqami
                    const itemNumber = (currentPage * pageSize) + index + 1;
                    
                    return (
                      <tr key={dist.id} className="hover:bg-slate-50/60 transition-colors group">
                        <td className="px-6 py-4 text-sm font-medium text-slate-400 text-center">
                          {itemNumber}
                        </td>
                        
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-[#1B5E20] font-bold text-xs border border-slate-200">
                              {getInitials(dist.farmerFullName)}
                            </div>
                            <div>
                              <div className="font-bold text-slate-800 text-sm">{dist.farmerFullName || "Noma'lum"}</div>
                              <div className="text-xs text-slate-500 font-mono mt-0.5">{dist.farmerPhone}</div>
                            </div>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200/60">
                            <Package size={12} className="text-slate-400" />
                            {dist.basketName}
                          </span>
                        </td>
                        
                        <td className="px-6 py-4 text-right">
                          <span className="inline-flex items-baseline gap-1 text-[#1B5E20]">
                            <span className="font-black text-lg">+{dist.quantity}</span>
                            <span className="text-xs font-semibold text-green-700/60 uppercase">dona</span>
                          </span>
                        </td>
                        
                        <td className="px-6 py-4 text-right">
                          <div className="flex flex-col items-end justify-center">
                            <span className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
                              <Clock size={12} className="text-slate-400" /> {time}
                            </span>
                            <span className="text-xs text-slate-400 font-medium flex items-center gap-1.5 mt-0.5">
                              <Calendar size={12} className="text-slate-400" /> {date}
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* ===== PAGINATSIYA ===== */}
          {!isLoading && totalPages > 1 && (
            <div className="px-6 py-4 border-t border-slate-100 bg-white flex items-center justify-between mt-auto">
              <div className="text-sm text-slate-500 font-medium">
                Ko'rsatilmoqda <span className="font-bold text-slate-800">{(currentPage * pageSize) + 1}</span> dan <span className="font-bold text-slate-800">{Math.min((currentPage + 1) * pageSize, totalElements)}</span> gacha
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 0}
                  className="p-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={18} />
                </button>
                
                {/* Sahifa raqamlari (soddalashtirilgan) */}
                <div className="flex items-center gap-1 px-2">
                  <span className="text-sm font-bold text-white bg-[#1B5E20] px-3 py-1 rounded-md">
                    {currentPage + 1}
                  </span>
                  <span className="text-sm font-medium text-slate-400 px-1">/</span>
                  <span className="text-sm font-medium text-slate-600">
                    {totalPages}
                  </span>
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages - 1}
                  className="p-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}