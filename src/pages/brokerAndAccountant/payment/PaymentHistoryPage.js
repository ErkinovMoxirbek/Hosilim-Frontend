import React, { useEffect, useState, useCallback } from 'react';
import { Search, Loader2, FileText, Download, ArrowUpRight, ArrowDownRight, ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { paymentService } from '../../../services/paymentService';

export default function PaymentHistoryPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Pagination statelari
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [downloadingId, setDownloadingId] = useState(null);
  const size = 12; 

  const fetchHistory = useCallback(async () => {
    try {
      setLoading(true);
      const data = await paymentService.getHistory(searchTerm, page, size);
      
      setHistory(data.content || []);
      setTotalPages(data.totalPages || 0);
      setTotalElements(data.totalElements || 0);
    } catch (error) {
      console.error("Tarixni yuklashda xatolik:", error);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, page, size]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchHistory();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [fetchHistory]); 

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setPage(0);
  };

  // PDF ni yuklab olish funksiyasi
  const handleDownloadPdf = async (paymentId) => {
    try {
      setDownloadingId(paymentId);
      const blob = await paymentService.downloadReceipt(paymentId);
      
      // Brauzerda sun'iy havola yaratib, avtomat bosish (Download qilish)
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `tolov_cheki_${paymentId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      alert("Chekni yuklab olishda xatolik yuz berdi!");
    } finally {
      setDownloadingId(null);
    }
  };

  // Sanani chiroyli formatlash (2026-05-12T14:30 -> 12.05.2026 14:30)
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleString('ru-RU', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  // To'lov usulini chiroyli nomga o'girish
  const getMethodName = (method) => {
    switch(method) {
      case 'CASH': return 'Naqd pul';
      case 'CARD': return 'Plastik karta';
      case 'BANK_TRANSFER': return 'Bank o\'tkazmasi';
      default: return method;
    }
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 w-full max-w-[1600px] mx-auto min-h-screen flex flex-col relative">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-1 block">Moliya va Kassa</span>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 font-['Syne',sans-serif] tracking-tight flex items-center gap-2">
            To'lovlar Tarixi 
            <span className="text-sm font-medium text-gray-400 bg-gray-100 px-2.5 py-0.5 rounded-full inline-flex items-center mt-1">
              {totalElements} ta tranzaksiya
            </span>
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text" placeholder="Fermer ismi bo'yicha..." 
              value={searchTerm}
              onChange={handleSearchChange}
              className="pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-full text-sm focus:outline-none focus:border-gray-400 transition-all w-full md:w-[260px] shadow-sm"
            />
          </div>
        </div>
      </div>

      {/* ASOSIY KONTENT - TOZA JADVAL (TABLE) */}
      {loading && history.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      ) : history.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-gray-300 p-12 text-center rounded-xl bg-gray-50/50">
          <FileText size={48} className="text-gray-300 mb-3" />
          <p className="text-gray-900 font-medium mb-1 font-['Syne']">Natija topilmadi</p>
          <p className="text-sm text-gray-500">Hozircha kassa tarixi bo'sh yoki qidiruvga mos ma'lumot yo'q.</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col flex-1">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4">Sana va Vaqt</th>
                  <th className="px-6 py-4">Fermer</th>
                  <th className="px-6 py-4">Operatsiya Turi</th>
                  <th className="px-6 py-4 text-right">Summa (UZS)</th>
                  <th className="px-6 py-4 text-center">Chek (PDF)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {history.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/80 transition-colors group">
                    {/* Sana */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-gray-700">
                        <Calendar size={14} className="text-gray-400" />
                        <span className="font-['DM_Mono'] font-medium text-[13px]">{formatDate(item.paymentDate)}</span>
                      </div>
                    </td>
                    
                    {/* Fermer */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-900 font-['Syne']">
                          {item.farmerName}
                        </span>
                        <span className="text-[11px] text-gray-500 mt-0.5">{item.farmerPhone}</span>
                      </div>
                    </td>

                    {/* Operatsiya turi va Usul */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col items-start gap-1">
                        {item.transactionType === 'PAYMENT' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-red-50 text-red-600 border border-red-100">
                            <ArrowUpRight size={12} /> CHIQIM (TO'LOV)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-green-50 text-green-600 border border-green-100">
                            <ArrowDownRight size={12} /> KIRIM (QAYTIM)
                          </span>
                        )}
                        <span className="text-[11px] text-gray-500 font-medium flex items-center gap-1">
                          • {getMethodName(item.paymentMethod)}
                        </span>
                      </div>
                    </td>

                    {/* Summa */}
                    <td className="px-6 py-4 text-right">
                      <span className={`font-bold font-['DM_Mono'] text-[15px] ${item.transactionType === 'PAYMENT' ? 'text-red-600' : 'text-green-600'}`}>
                        {item.transactionType === 'PAYMENT' ? '-' : '+'}{item.amount?.toLocaleString()}
                      </span>
                    </td>

                    {/* Harakat (Yuklab olish) */}
                    <td className="px-6 py-4 text-center">
                      <button 
                        onClick={() => handleDownloadPdf(item.id)}
                        disabled={downloadingId === item.id}
                        className="inline-flex items-center gap-2 px-3 py-1.5 border border-gray-200 text-gray-600 bg-white rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-all text-[13px] font-medium shadow-sm disabled:opacity-50"
                        title="Kvitansiyani yuklab olish"
                      >
                        {downloadingId === item.id ? (
                          <Loader2 size={16} className="animate-spin text-blue-600" />
                        ) : (
                          <Download size={16} />
                        )}
                        Chek
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* PAGINATION TUGMALARI */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between mt-auto">
              <span className="text-sm text-gray-500">
                Jami <span className="font-bold text-gray-900">{totalElements}</span> ta yozuv
              </span>
              
              <div className="flex items-center gap-3">
                <button 
                  disabled={page === 0} 
                  onClick={() => setPage(p => p - 1)}
                  className="p-1.5 border border-gray-200 rounded-md bg-white hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-white text-gray-600 transition-colors"
                >
                  <ChevronLeft size={18} />
                </button>
                
                <span className="text-sm font-medium text-gray-600">
                  <span className="text-gray-900">{page + 1}</span> / {totalPages}
                </span>

                <button 
                  disabled={page >= totalPages - 1} 
                  onClick={() => setPage(p => p + 1)}
                  className="p-1.5 border border-gray-200 rounded-md bg-white hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-white text-gray-600 transition-colors"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}