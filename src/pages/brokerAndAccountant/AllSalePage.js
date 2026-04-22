import React, { useState, useEffect } from 'react';
import { Search, ChevronLeft, ChevronRight, Loader2, RefreshCcw, Download, Apple, Scale, DollarSign, List } from 'lucide-react';
import cropService from '../../services/productService';

export default function AllSalePage() {
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 15;

  useEffect(() => {
    fetchHistory(currentPage);
  }, [currentPage]);

  const fetchHistory = async (page) => {
    setIsLoading(true);
    try {
      const data = await cropService.getReceiveHistory(page, pageSize);
      setHistory(data.content || []);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error("Xatolik", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Qidiruv (Mijoz ismi yoki telefoniga qarab)
  const filteredHistory = history.filter(item => 
    item.farmerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.farmerPhone?.includes(searchQuery)
  );

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString('uz-UZ', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto pb-10">
      
      {/* Sarlavha qismi */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#0B1A42] flex items-center gap-3">
            <Download className="text-[#14A44D]" size={28} /> Kirimlar Tarixi
          </h1>
          <p className="text-sm text-gray-500 mt-1">Fermerlardan qabul qilingan barcha hosillar ro'yxati</p>
        </div>
        <button 
          onClick={() => fetchHistory(currentPage)} 
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-lg text-sm font-bold shadow-sm hover:bg-gray-50 active:scale-95 transition-all w-fit"
        >
          <RefreshCcw size={16} /> Yangilash
        </button>
      </div>

      {/* Qidiruv bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Fermer ismi yoki telefon raqami orqali qidirish..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#14A44D]/20 focus:border-[#14A44D] transition-all font-medium"
          />
        </div>
      </div>

      {/* JADVAL */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-200 text-gray-500 text-[11px] font-bold uppercase tracking-wider">
                <th className="p-4 pl-6">Sana</th>
                <th className="p-4">Fermer</th>
                <th className="p-4">Meva Turi</th>
                <th className="p-4">Vazn (Netto)</th>
                <th className="p-4">Summa</th>
                <th className="p-4 text-center">Savat</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="p-16 text-center text-gray-400">
                    <Loader2 className="animate-spin mx-auto mb-3 text-[#14A44D]" size={36} />
                    <p className="font-medium text-sm">Ma'lumotlar yuklanmoqda...</p>
                  </td>
                </tr>
              ) : filteredHistory.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-16 text-center text-gray-400">
                    <div className="flex flex-col items-center">
                      <List size={48} className="mb-3 text-gray-300" />
                      <p className="font-medium text-sm">Hech qanday kirim tarixi topilmadi.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredHistory.map((item) => (
                  <tr key={item.id} className="border-b border-gray-100 hover:bg-emerald-50/30 transition-colors">
                    
                    {/* Sana */}
                    <td className="p-4 pl-6 text-sm text-gray-500 font-medium whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-[#0B1A42] font-bold">{formatDate(item.createdAt).split(',')[0]}</span>
                        <span className="text-xs">{formatDate(item.createdAt).split(',')[1]}</span>
                      </div>
                    </td>

                    {/* Fermer */}
                    <td className="p-4">
                      <div className="font-bold text-[#0B1A42] text-[15px]">{item.farmerName}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{item.farmerPhone}</div>
                    </td>

                    {/* Meva turi va narxi */}
                    <td className="p-4">
                      <div className="flex items-start gap-2.5">
                        <div className="mt-0.5 p-1.5 bg-orange-50 text-orange-600 rounded-lg">
                          <Apple size={16} />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-800 text-sm">{item.fruitName}</div>
                          <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mt-0.5">
                            {item.unitPrice?.toLocaleString()} so'm/kg
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Vazn */}
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Scale size={16} className="text-[#14A44D]" />
                        <span className="text-base font-black text-[#14A44D]">{item.netWeight} <span className="text-xs text-gray-400 font-bold">kg</span></span>
                      </div>
                      {item.taraWeight > 0 && (
                        <div className="text-[11px] text-gray-400 mt-0.5 font-medium">Brutto: {item.grossWeight} kg | Tara: {item.taraWeight} kg</div>
                      )}
                    </td>

                    {/* Jami Summa */}
                    <td className="p-4">
                      <div className="flex items-center gap-1.5">
                        <div className="p-1 bg-blue-50 text-blue-600 rounded">
                          <DollarSign size={14} />
                        </div>
                        <span className="font-black text-[#0B1A42] text-[15px]">{item.totalAmount?.toLocaleString()}</span>
                      </div>
                      <div className="text-[10px] text-gray-400 font-bold uppercase mt-1">Fermer hisobiga</div>
                    </td>

                    {/* Savat holati */}
                    <td className="p-4 text-center">
                      {item.basketCount > 0 ? (
                        <div className="inline-flex flex-col items-center">
                          <span className="text-[11px] font-bold bg-gray-100 text-gray-600 px-2 py-1 rounded-md">
                            {item.basketCount} ta
                          </span>
                          <span className="text-[10px] text-gray-400 mt-1 whitespace-nowrap overflow-hidden text-ellipsis max-w-[80px]">
                            {item.basketName}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs font-medium text-gray-300">-</span>
                      )}
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        {!isLoading && totalPages > 1 && (
          <div className="p-4 border-t border-gray-200 flex items-center justify-between bg-gray-50">
            <span className="text-sm text-gray-500 font-medium">
              Sahifa {currentPage + 1} / {totalPages}
            </span>
            <div className="flex gap-2">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                disabled={currentPage === 0}
                className="p-2 border border-gray-200 bg-white rounded-lg text-gray-600 hover:bg-gray-100 disabled:opacity-50 transition-colors"
              >
                <ChevronLeft size={18} />
              </button>
              <button 
                onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                disabled={currentPage === totalPages - 1}
                className="p-2 border border-gray-200 bg-white rounded-lg text-gray-600 hover:bg-gray-100 disabled:opacity-50 transition-colors"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}