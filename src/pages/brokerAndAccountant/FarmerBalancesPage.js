import React, { useState, useEffect, useMemo } from 'react';
import { Search, Phone, Package, ChevronDown, ChevronUp, Loader2, Receipt, AlertCircle } from 'lucide-react';
import distributionService from '../../services/distributionService'; 

// Debounce (Tez yozganda serverni qotirmaslik uchun)
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

const FarmerBalancesPage = () => {
  const [farmersSummary, setFarmersSummary] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  const debouncedSearch = useDebounce(searchQuery, 500); // 🟢 500ms kutib keyin izlaydi

  const [expandedFarmerId, setExpandedFarmerId] = useState(null);
  const [loadingDetailsId, setLoadingDetailsId] = useState(null);
  const [farmerDetails, setFarmerDetails] = useState({});

  // Izlash yozuvi o'zgarganda faqat Serverdan tortamiz
  useEffect(() => {
    fetchSummary(debouncedSearch);
  }, [debouncedSearch]);

  const fetchSummary = async (query = '') => {
    try {
      setIsLoading(true);
      // 🟢 Frontend array.filter() EMAS, balki Backendga search yuborilmoqda
      const data = await distributionService.getFarmerBalancesSummary(query, 0, 50);
      setFarmersSummary(data || []);
    } catch (error) {
      console.error("Xatolik:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleFarmer = async (farmerId) => {
    if (expandedFarmerId === farmerId) {
      setExpandedFarmerId(null);
      return;
    }

    setExpandedFarmerId(farmerId);
    if (farmerDetails[farmerId]) return;

    try {
      setLoadingDetailsId(farmerId);
      const detailsData = await distributionService.getFarmerBalanceDetails(farmerId);
      if (detailsData) {
        setFarmerDetails(prev => ({
          ...prev,
          [farmerId]: detailsData
        }));
      }
    } catch (error) {
      console.error("Detallarni yuklashda xato:", error);
    } finally {
      setLoadingDetailsId(null);
    }
  };

  const formatType = (type) => {
    if (!type) return "";
    const types = { "YOGOCH": "Yog'och", "PLASTIK": "Plastik", "KARTON": "Karton", "TEMIR": "Temir" };
    return types[type] || type;
  };

  const totalBasketsDebtSum = useMemo(() => {
    return farmersSummary.reduce((sum, f) => sum + (f.totalBasketsDebt || 0), 0);
  }, [farmersSummary]);

  return (
    <div className="p-4 md:p-6 lg:p-8 w-full max-w-[1400px] mx-auto min-h-screen flex flex-col font-inter text-slate-900 antialiased">
      
      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight leading-none">Fermerlar qarzdorligi</h1>
          <p className="text-sm text-slate-400 mt-1.5 font-medium">Fermerlarda qolib ketgan savatlar hisoboti</p>
        </div>

        <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto justify-end">
          <div className="flex items-center gap-4 px-5 py-3 bg-white border border-slate-200 rounded-2xl shadow-sm">
            <div className="text-center">
              <div className="text-[11px] text-slate-400 font-bold mb-0.5">Jami fermerlar</div>
              <div className="font-bold text-slate-900 text-lg leading-none">{farmersSummary.length}</div>
            </div>
            <div className="w-px h-8 bg-slate-100" />
            <div className="text-center">
              <div className="text-[11px] text-slate-400 font-bold mb-0.5">Umumiy qarz</div>
              <div className="font-mono font-black text-red-500 text-lg leading-none">{totalBasketsDebtSum} ta</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── QIDIRUV (Serverdan) ── */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Fermer ismi yoki telefon raqami..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 transition-all"
          />
        </div>
      </div>

      {/* ── RO'YXAT ── */}
      {isLoading ? (
        <div className="text-center py-20 text-gray-500 flex flex-col items-center gap-3">
          <Loader2 className="animate-spin text-emerald-600" size={32} />
          <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Yuklanmoqda...</span>
        </div>
      ) : farmersSummary.length === 0 ? (
        <div className="bg-white p-16 rounded-3xl border border-slate-100 text-center flex flex-col items-center shadow-sm">
          <AlertCircle size={40} className="text-slate-200 mb-3" />
          <h3 className="text-base font-bold text-slate-900">Qarzdorlik topilmadi</h3>
          <p className="text-sm text-slate-400 mt-1">Barcha qarzlar yopilgan yoki qidiruvga mos fermer yo'q</p>
        </div>
      ) : (
        <div className="space-y-3">
          {farmersSummary.map((farmer) => {
            const isExpanded = expandedFarmerId === farmer.farmerId;
            const isLoadingDetails = loadingDetailsId === farmer.farmerId;
            const detailData = farmerDetails[farmer.farmerId]; 

            return (
              <div 
                key={farmer.farmerId} 
                className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden ${
                  isExpanded ? 'border-emerald-500 shadow-md ring-4 ring-emerald-500/5' : 'border-slate-200 shadow-sm hover:border-slate-300'
                }`}
              >
                
                {/* Qator */}
                <button 
                  type="button"
                  onClick={() => handleToggleFarmer(farmer.farmerId)}
                  className={`w-full px-6 py-4 flex items-center justify-between text-left focus:outline-none transition-colors ${
                    isExpanded ? 'bg-slate-50/50' : 'bg-white hover:bg-slate-50/40'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-100 text-slate-500 font-bold rounded-full flex items-center justify-center text-xs border border-slate-200">
                      {farmer.farmerFullName?.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-[15px]">{farmer.farmerFullName}</h3>
                      <div className="flex items-center gap-1.5 text-slate-400 text-xs font-mono mt-1">
                        <Phone size={12} /> {farmer.farmerPhone}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right hidden sm:block">
                      <p className="text-[10px] font-bold text-slate-400 mb-0.5">Qolib ketgan savat</p>
                      <div className="flex items-center gap-1.5 justify-end">
                        <p className="font-mono font-black text-red-500 text-[16px]">{farmer.totalBasketsDebt} ta</p>
                      </div>
                    </div>
                    
                    <div className={`p-2 rounded-xl transition-colors ${isExpanded ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'}`}>
                      {isLoadingDetails ? (
                        <Loader2 size={18} className="animate-spin text-emerald-600" />
                      ) : (
                        <ChevronDown size={18} className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                      )}
                    </div>
                  </div>
                </button>

                {/* Detallar (Haqiqiy Ma'lumot) */}
                {isExpanded && detailData && !isLoadingDetails && (
                  <div className="bg-slate-50/60 border-t border-slate-100 px-6 py-5">
                    
                    <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200/60">
                      <h4 className="text-xs font-bold text-slate-400 flex items-center gap-2">
                        <Receipt size={14} /> Savatlar bo'yicha hisob
                      </h4>
                      <div className="text-right">
                        <span className="text-[11px] font-bold text-slate-400 mr-2">Umumiy qiymati:</span>
                        <span className="text-[16px] font-mono font-black text-emerald-600">
                          {detailData.totalDebtSum?.toLocaleString()} <span className="text-[10px] font-bold opacity-60">UZS</span>
                        </span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {detailData.baskets?.map((basket, idx) => (
                        <div key={idx} className="bg-white border border-slate-200/80 p-4 rounded-xl shadow-sm hover:border-emerald-200 transition-all flex flex-col gap-3">
                          
                          <div className="flex justify-between items-start">
                            <div className="flex gap-3 items-center">
                              <div className="p-2 bg-slate-50 text-slate-400 rounded-lg border border-slate-100">
                                <Package size={16} />
                              </div>
                              <div>
                                <h5 className="text-[14px] font-bold text-slate-800 leading-tight">{basket.name}</h5>
                                {basket.type && (
                                  <span className="text-[10px] font-semibold text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-100 mt-1 inline-block">
                                    {formatType(basket.type)}
                                  </span>
                                )}
                              </div>
                            </div>
                            
                            <div className="bg-red-50 border border-red-100 px-2.5 py-1 rounded-lg flex flex-col items-center">
                              <span className="font-mono font-black text-red-500 text-[14px] leading-none">{basket.quantity}</span>
                              <span className="text-[8px] font-bold text-red-400 uppercase mt-0.5">ta</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between bg-slate-50/60 p-2.5 rounded-lg border border-slate-100/80 mt-1">
                            <div>
                              <p className="text-[10px] font-bold text-slate-400 mb-0.5">Asli narxi</p>
                              <p className="text-[13px] font-bold text-slate-600 font-mono">
                                {basket.unitPrice?.toLocaleString()} <span className="text-[9px] text-slate-400">so'm</span>
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-[10px] font-bold text-slate-400 mb-0.5">Jami bahosi</p>
                              <p className="text-[14px] font-mono font-black text-emerald-600">
                                {basket.totalPrice?.toLocaleString()} <span className="text-[9px] text-emerald-400">so'm</span>
                              </p>
                            </div>
                          </div>

                        </div>
                      ))}
                    </div>

                  </div>
                )}

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FarmerBalancesPage;