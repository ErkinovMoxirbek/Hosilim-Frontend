import React, { useState, useEffect, useMemo } from 'react';
import { Search, Phone, Package, Briefcase, AlertCircle, ChevronDown, ChevronUp, Loader2, Receipt } from 'lucide-react';
import distributionService from '../../services/distributionService'; // O'zingizning yo'lingiz

const FarmerBalancesPage = () => {
  const [farmersSummary, setFarmersSummary] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Accordion va Loading boshqaruvi
  const [expandedFarmerId, setExpandedFarmerId] = useState(null);
  const [loadingDetailsId, setLoadingDetailsId] = useState(null);
  const [farmerDetails, setFarmerDetails] = useState({});

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    try {
      setIsLoading(true);
      const data = await distributionService.getFarmerBalancesSummary(0, 50);
      setFarmersSummary(data);
    } catch (error) {
      console.error("Xatolik:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredFarmers = useMemo(() => {
    if (!searchQuery.trim()) return farmersSummary;
    const query = searchQuery.toLowerCase();
    return farmersSummary.filter(f => 
      f.farmerFullName?.toLowerCase().includes(query) || 
      f.farmerPhone?.includes(query)
    );
  }, [farmersSummary, searchQuery]);

  const handleToggleFarmer = async (farmerId) => {
    if (expandedFarmerId === farmerId) {
      setExpandedFarmerId(null);
      return;
    }

    setExpandedFarmerId(farmerId);

    if (farmerDetails[farmerId]) {
      return;
    }

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

  // Turni chiroyli qilib formatlash yordamchisi (Masalan: YOGOCH -> Yog'och)
  const formatType = (type) => {
    if (!type) return "";
    const types = {
      "YOGOCH": "Yog'och",
      "PLASTIK": "Plastik",
      "KARTON": "Karton",
      "TEMIR": "Temir"
    };
    return types[type] || type;
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-10">
      
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-700 text-white rounded-xl flex items-center justify-center shadow-md">
            <Briefcase size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-[#0B1A42]">Fermerlar Qarzdorligi</h1>
            <p className="text-sm text-gray-500 mt-1">Fermerlarda qolib ketgan savatlar hisoboti</p>
          </div>
        </div>
      </div>

      {/* 2. Qidiruv */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
        <div className="max-w-md">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Ism yoki telefon raqam..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium"
            />
          </div>
        </div>
      </div>

      {/* 3. Ro'yxat */}
      {isLoading ? (
        <div className="text-center py-10 text-gray-500 flex flex-col items-center gap-3">
          <Loader2 className="animate-spin text-emerald-600" size={32} />
          <span>Ma'lumotlar yuklanmoqda...</span>
        </div>
      ) : filteredFarmers.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-gray-200 text-center flex flex-col items-center shadow-sm">
          <AlertCircle size={40} className="text-gray-300 mb-4" />
          <h3 className="text-lg font-bold text-gray-900">Qarzdorlik topilmadi</h3>
          <p className="text-sm text-gray-500 mt-2">Barcha qarzlar to'langan yoki bunday fermer yo'q</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredFarmers.map((farmer) => {
            const isExpanded = expandedFarmerId === farmer.farmerId;
            const isLoadingDetails = loadingDetailsId === farmer.farmerId;
            const detailData = farmerDetails[farmer.farmerId]; 

            return (
              <div 
                key={farmer.farmerId} 
                className={`bg-white rounded-xl border transition-all duration-200 overflow-hidden ${
                  isExpanded ? 'border-emerald-500 shadow-md ring-2 ring-emerald-50' : 'border-gray-200 shadow-sm hover:border-gray-300'
                }`}
              >
                
                {/* 🟢 Asosiy Qator (Ustiga bosiladigan joy) */}
                <button 
                  onClick={() => handleToggleFarmer(farmer.farmerId)}
                  className={`w-full px-5 py-4 flex items-center justify-between text-left focus:outline-none transition-colors ${
                    isExpanded ? 'bg-emerald-50/30' : 'bg-white hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 bg-emerald-100 text-emerald-800 font-bold rounded-full flex items-center justify-center text-[15px] border border-emerald-200">
                      {farmer.farmerFullName?.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-[#0B1A42] text-[16px]">{farmer.farmerFullName}</h3>
                      <div className="flex items-center gap-1.5 text-gray-500 text-[13px] mt-0.5">
                        <Phone size={13} /> {farmer.farmerPhone}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right hidden sm:block">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Jami qarz</p>
                      <div className="flex items-center gap-1.5">
                        <Package size={14} className="text-red-500" />
                        <p className="text-[16px] font-extrabold text-red-600">{farmer.totalBasketsDebt} ta</p>
                      </div>
                    </div>
                    
                    <div className={`p-2 rounded-lg transition-colors ${isExpanded ? 'bg-emerald-200/50 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                      {isLoadingDetails ? (
                        <Loader2 size={20} className="animate-spin text-emerald-600" />
                      ) : isExpanded ? (
                        <ChevronUp size={20} />
                      ) : (
                        <ChevronDown size={20} />
                      )}
                    </div>
                  </div>
                </button>

                {/* 🟢 YASHIRIN QISM (MOLIYAVIY DETALLAR) */}
                {isExpanded && detailData && !isLoadingDetails && (
                  <div className="bg-gray-50 border-t border-emerald-100 px-5 py-5">
                    
                    <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
                      <h4 className="text-[13px] font-bold text-gray-600 flex items-center gap-2">
                        <Receipt size={16} />
                        Savatlar Bo'yicha Chek
                      </h4>
                      <div className="text-right">
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Jami Summa:</p>
                        <span className="text-[16px] font-black text-emerald-700">
                          {detailData.totalDebtSum?.toLocaleString()} so'm
                        </span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {detailData.baskets?.map((basket, idx) => (
                        <div key={idx} className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm hover:border-emerald-200 hover:shadow-md transition-all flex flex-col gap-3">
                          
                          {/* Sarlavha qismi */}
                          <div className="flex justify-between items-start">
                            <div className="flex gap-3 items-center">
                              <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg">
                                <Package size={20} />
                              </div>
                              <div>
                                <h5 className="text-[14px] font-bold text-gray-800 leading-tight">{basket.name}</h5>
                                {basket.type && (
                                  <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded uppercase mt-1 inline-block">
                                    {formatType(basket.type)}
                                  </span>
                                )}
                              </div>
                            </div>
                            
                            {/* Qarz miqdori */}
                            <div className="bg-red-50 border border-red-100 px-3 py-1.5 rounded-lg flex flex-col items-center">
                              <span className="font-black text-red-600 text-[16px] leading-none">{basket.quantity}</span>
                              <span className="text-[9px] font-bold text-red-400 uppercase mt-0.5">Dona</span>
                            </div>
                          </div>

                          {/* Narxlar qismi */}
                          <div className="flex items-center justify-between bg-gray-50/80 p-3 rounded-lg border border-gray-100 mt-1">
                            <div>
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">1 dona narxi</p>
                              <p className="text-[13px] font-bold text-gray-700">
                                {basket.unitPrice?.toLocaleString()} <span className="text-[10px] font-semibold text-gray-400">so'm</span>
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Umumiy</p>
                              <p className="text-[14px] font-black text-emerald-600">
                                {basket.totalPrice?.toLocaleString()} <span className="text-[10px] font-semibold text-emerald-600/70">so'm</span>
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