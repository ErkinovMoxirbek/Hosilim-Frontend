import React, { useState, useEffect } from 'react';
import { Box, Search, Calendar, ChevronLeft, ChevronRight, Loader2, RefreshCcw, ArrowDownCircle, ArrowUpCircle, AlertCircle } from 'lucide-react';
import distributionService from '../../services/distributionService';

// Transaction turini chiroyli ko'rsatish
const getTypeBadge = (type) => {
  const types = {
    RETURNED_EMPTY: {
      label: "Bo'sh qaytarildi",
      color: "bg-blue-50 border-blue-100 text-blue-700",
      icon: <ArrowUpCircle size={13} />
    },
    GIVEN_TO_FARMER: {
      label: "Berildi",
      color: "bg-green-50 border-green-100 text-green-700",
      icon: <ArrowDownCircle size={13} />
    },
    RETURNED_WITH_CROP: {
      label: "To'la qaytarildi",
      color: "bg-purple-50 border-purple-100 text-purple-700",
      icon: <ArrowUpCircle size={13} />
    },
    LOST: {
      label: "Yo'qoldi",
      color: "bg-red-50 border-red-100 text-red-700",
      icon: <AlertCircle size={13} />
    },
  };
  const t = types[type] || { label: type, color: "bg-gray-100 border-gray-200 text-gray-600", icon: null };
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs font-bold ${t.color}`}>
      {t.icon} {t.label}
    </span>
  );
};

const formatDate = (dateString) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleDateString('uz-UZ', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
};

export default function BasketTransactionsHistoryPage() {
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 15;

  useEffect(() => {
    fetchHistory(currentPage);
  }, [currentPage]);

  const fetchHistory = async (page) => {
    setIsLoading(true);
    try {
      const data = await distributionService.getAllTransactions(page, pageSize);
      setHistory(data.content || []);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error("Xatolik:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredHistory = history.filter(item =>
    item.farmerFullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.farmerPhone?.includes(searchQuery)
  );

  return (
    <div className="p-6 max-w-7xl mx-auto pb-10">

      {/* Sarlavha */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#0B1A42] flex items-center gap-3">
            <RefreshCcw className="text-blue-500" size={28} />
            Savat Transaksiyalari Tarixi
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Barcha savat harakatlarining to'liq tarixi
          </p>
        </div>
        <button
          onClick={() => fetchHistory(currentPage)}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-lg text-sm font-bold shadow-sm hover:bg-gray-50 transition-all"
        >
          <RefreshCcw size={16} /> Yangilash
        </button>
      </div>

      {/* Qidiruv */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Fermer ismi yoki telefon raqami..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>
      </div>

      {/* Jadval */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-200 text-gray-500 text-[12px] uppercase tracking-wider">
                <th className="p-4 font-bold">#</th>
                <th className="p-4 font-bold">Sana</th>
                <th className="p-4 font-bold">Fermer</th>
                <th className="p-4 font-bold">Turi</th>
                <th className="p-4 font-bold">Savat</th>
                <th className="p-4 font-bold text-right">Miqdor</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="p-10 text-center text-gray-500">
                    <Loader2 className="animate-spin mx-auto mb-3 text-blue-500" size={32} />
                    Yuklanmoqda...
                  </td>
                </tr>
              ) : filteredHistory.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-10 text-center text-gray-500">
                    Hech qanday ma'lumot topilmadi.
                  </td>
                </tr>
              ) : (
                filteredHistory.map((item, index) => (
                  <tr key={item.id} className="border-b border-gray-100 hover:bg-blue-50/30 transition-colors">
                    <td className="p-4 text-sm text-gray-500 font-medium">
                      {currentPage * pageSize + index + 1}
                    </td>
                    <td className="p-4 text-sm text-gray-600 font-medium whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-gray-400" />
                        {formatDate(item.createdAt)}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-[#0B1A42] text-sm">{item.farmerFullName}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{item.farmerPhone}</div>
                    </td>
                    <td className="p-4">
                      {getTypeBadge(item.type)}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Box size={16} className="text-gray-400" />
                        <span className="text-sm font-semibold text-gray-700">{item.basketName}</span>
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <div className="inline-flex items-center justify-center bg-blue-50 border border-blue-100 text-blue-700 px-3 py-1 rounded-lg font-black text-sm">
                        {item.quantity} ta
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
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