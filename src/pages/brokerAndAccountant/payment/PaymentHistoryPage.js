import React, { useEffect, useState, useCallback } from 'react';
import { Search, Loader2, FileText, Download, ArrowUpRight, ArrowDownRight, ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { paymentService } from '../../../services/paymentService';

const fmt = (n) => Number(n || 0).toLocaleString('uz-UZ');

export default function PaymentHistoryPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
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

  const handleDownloadPdf = async (paymentId) => {
    try {
      setDownloadingId(paymentId);
      const blob = await paymentService.downloadReceipt(paymentId);
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

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleString('uz-UZ', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const getMethodName = (method) => {
    switch(method) {
      case 'CASH': return 'Naqd pul';
      case 'CARD': return 'Plastik karta';
      case 'BANK_TRANSFER': return 'Bank o\'tkazmasi';
      default: return method;
    }
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 w-full max-w-[1600px] mx-auto min-h-screen flex flex-col font-inter text-slate-800 antialiased">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
         
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
            To'lovlar tarixi
            <span className="text-[11px] font-semibold text-slate-400 bg-slate-100 px-3 py-1 rounded-lg mt-1 tracking-normal">
              {totalElements} ta tranzaksiya
            </span>
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text" 
              placeholder="Fermer ismi bo'yicha qidirish..." 
              value={searchTerm}
              onChange={handleSearchChange}
              className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 transition-all w-full md:w-[280px] shadow-sm"
            />
          </div>
        </div>
      </div>

      {/* CONTENT */}
      {loading && history.length === 0 ? (
        <div className="flex-1 flex items-center justify-center py-32">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
        </div>
      ) : history.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center bg-white border border-slate-100 p-16 text-center rounded-[2rem] shadow-sm">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
            <FileText size={28} className="text-slate-200" />
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-1">Natija topilmadi</h3>
          <p className="text-sm text-slate-400">Hozircha kassa tarixi bo'sh yoki qidiruvga mos ma'lumot yo'q.</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-[1.5rem] shadow-sm overflow-hidden flex flex-col flex-1">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                {/* uppercase olib tashlandi */}
                <tr className="bg-slate-50/50 border-b border-slate-100 text-[12px] font-semibold text-slate-400 tracking-tight">
                  <th className="px-8 py-5">Sana va vaqt</th>
                  <th className="px-8 py-5">Fermer</th>
                  <th className="px-8 py-5">To'lov turi</th>
                  <th className="px-8 py-5 text-right">Summa</th>
                  <th className="px-8 py-5 text-center">Harakat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {history.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2.5 text-slate-500">
                        <Calendar size={14} className="text-slate-300" />
                        <span className="font-mono font-bold text-[13px] tracking-tight">{formatDate(item.paymentDate)}</span>
                      </div>
                    </td>
                    
                    <td className="px-8 py-5">
                      <div className="flex flex-col min-w-0">
                        <span className="font-semibold text-slate-900 text-[15px] leading-tight truncate">
                          {item.farmerName}
                        </span>
                        <span className="text-[12px] text-slate-400 font-medium font-mono mt-0.5">{item.farmerPhone}</span>
                      </div>
                    </td>

                    <td className="px-8 py-5">
                      <div className="flex flex-col items-start gap-1">
                        {item.transactionType === 'PAYMENT' ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-50 text-rose-600 border border-rose-100">
                             To'lov
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-600 border border-emerald-100">
                             Qaytim
                          </span>
                        )}
                        <span className="text-[10px] text-slate-400 font-semibold tracking-wide">
                          {getMethodName(item.paymentMethod)}
                        </span>
                      </div>
                    </td>

                    <td className="px-8 py-5 text-right">
                      <span className={`font-mono font-black text-[17px] tabular-nums tracking-tighter ${item.transactionType === 'PAYMENT' ? 'text-rose-600' : 'text-emerald-600'}`}>
                        {item.transactionType === 'PAYMENT' ? '-' : '+'}{fmt(item.amount)}
                      </span>
                    </td>

                    <td className="px-8 py-5 text-center">
                      <button 
                        onClick={() => handleDownloadPdf(item.id)}
                        disabled={downloadingId === item.id}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl hover:bg-emerald-600 transition-all text-[11px] font-bold shadow-sm disabled:opacity-50 active:scale-95"
                      >
                        {downloadingId === item.id ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <Download size={14} strokeWidth={2.5} />
                        )}
                        Chek
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
          {totalPages > 1 && (
            <div className="px-8 py-5 border-t border-slate-100 bg-slate-50/30 flex items-center justify-between mt-auto">
              <span className="text-[12px] font-medium text-slate-400">
                Jami <span className="text-slate-900 font-bold">{totalElements}</span> ta yozuv
              </span>
              
              <div className="flex items-center gap-2">
                <button 
                  disabled={page === 0} 
                  onClick={() => setPage(p => p - 1)}
                  className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-30 transition-all shadow-sm"
                >
                  <ChevronLeft size={18} />
                </button>
                
                <span className="text-[12px] font-semibold text-slate-700 px-3">
                  {page + 1} / {totalPages}
                </span>

                <button 
                  disabled={page >= totalPages - 1} 
                  onClick={() => setPage(p => p + 1)}
                  className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-30 transition-all shadow-sm"
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