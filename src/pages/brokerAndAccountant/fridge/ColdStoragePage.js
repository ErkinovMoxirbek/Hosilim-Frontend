import React, { useState, useEffect } from 'react';
import { fridgeService } from '../../../services/fridgeService'; 
import { stockService } from '../../../services/stockService'; // 🟢 Otmena qilish uchun ulandi
import { 
  ThermometerSnowflake, Search, Calendar, 
  ArrowDownLeft, ArrowUpRight, Package, Box, Filter, 
  ChevronLeft, ChevronRight, Undo2, MapPin
} from 'lucide-react';

const getTodayString = () => new Date().toISOString().split('T')[0];
const fmtKg = (n) => (n ?? 0).toLocaleString('uz-UZ', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

export default function ColdStoragePage() {
  const [startDate, setStartDate] = useState(getTodayString());
  const [endDate, setEndDate] = useState(getTodayString());
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('ALL'); 
  
  const [page, setPage] = useState(0); 
  const [totalPages, setTotalPages] = useState(1);
  const [size] = useState(15); 

  const [isLoading, setIsLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchHistory = async () => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      const data = await fridgeService.getFridgeHistory({
        startDate, endDate, filterType, search, page, size
      });
      if (data) {
        setTransactions(data.content || []);
        setTotalPages(data.totalPages || 1);
      }
    } catch (error) {
      setErrorMsg(error.message || "Tarixni yuklashda xatolik yuz berdi");
      setTransactions([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => { fetchHistory(); }, 400); 
    return () => clearTimeout(delayDebounceFn);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate, filterType, search, page]);

  // 🟢 OTMENA FUNKSIYASI (Zalga qaytarish)
  const handleRevert = async (targetStockId) => {
    if (!targetStockId) {
      alert("Xatolik! Bu yukning ID si bazadan kelmayapti.");
      return;
    }
    const isConfirmed = window.confirm("Rostdan ham bu yukni xolodilnikdan zalga qaytarmoqchimisiz?");
    if (isConfirmed) {
      try {
        await stockService.revertFridgeTransfer(targetStockId);
        fetchHistory(); // O'chgandan keyin jadvalni yangilaymiz
      } catch (error) {
        alert(error.message);
      }
    }
  };

  const summary = transactions.reduce((acc, curr) => {
    if (curr.type === 'IN') acc.totalIn += curr.netWeight;
    else if (curr.type === 'OUT') acc.totalOut += curr.netWeight;
    return acc;
  }, { totalIn: 0, totalOut: 0 });

  const currentBalance = summary.totalIn - summary.totalOut;

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const d = new Date(dateString);
    return `${d.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}, ${d.toLocaleDateString('uz-UZ', { day: '2-digit', month: '2-digit', year: 'numeric' })}`;
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto pb-16 space-y-6 bg-[#F8FAFC] min-h-screen">
      
      {/* SARLAVHA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 flex items-center gap-3">
           
            Kamera (Ombor) Tarixi
          </h1>
          
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 text-sm font-bold shadow-sm">
          {errorMsg}
        </div>
      )}

      {/* 🟢 YANGILANGAN ZAMONAVIY KARTALAR */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-5 shadow-emerald-200 shadow-lg text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-4 -mt-4 opacity-20"><ArrowDownLeft size={100} /></div>
          <h3 className="text-emerald-50 font-bold uppercase tracking-wider text-xs mb-1">Kiritilgan mahsulot</h3>
          <div className="flex items-end gap-1">
            <span className="text-3xl font-black">{fmtKg(summary.totalIn)}</span>
            <span className="text-sm font-semibold text-emerald-100 mb-1">kg</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-rose-500 to-rose-600 rounded-2xl p-5 shadow-rose-200 shadow-lg text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-4 -mt-4 opacity-20"><ArrowUpRight size={100} /></div>
          <h3 className="text-rose-50 font-bold uppercase tracking-wider text-xs mb-1">Chiqarilgan mahsulot</h3>
          <div className="flex items-end gap-1">
            <span className="text-3xl font-black">{fmtKg(summary.totalOut)}</span>
            <span className="text-sm font-semibold text-rose-100 mb-1">kg</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-4 -mt-4 text-slate-50"><Package size={100} /></div>
          <h3 className="text-slate-400 font-bold uppercase tracking-wider text-xs mb-1">Ombordagi mahsulot</h3>
          <div className="flex items-end gap-1 relative z-10">
            <span className="text-3xl font-black text-slate-800">{fmtKg(currentBalance)}</span>
            <span className="text-sm font-semibold text-slate-400 mb-1">kg</span>
          </div>
        </div>
      </div>

      {/* FILTRLAR */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm flex flex-col lg:flex-row gap-2 lg:items-center justify-between">
        <div className="flex p-1 bg-slate-100 rounded-xl w-full lg:w-fit">
          <button onClick={() => { setFilterType('ALL'); setPage(0); }} className={`flex-1 lg:px-6 py-2 rounded-lg text-sm font-bold transition-all ${filterType === 'ALL' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Barchasi</button>
          <button onClick={() => { setFilterType('IN'); setPage(0); }} className={`flex-1 lg:px-6 py-2 rounded-lg text-sm font-bold transition-all ${filterType === 'IN' ? 'bg-emerald-500 text-white shadow-sm' : 'text-slate-500 hover:text-emerald-600'}`}>Kirim</button>
          <button onClick={() => { setFilterType('OUT'); setPage(0); }} className={`flex-1 lg:px-6 py-2 rounded-lg text-sm font-bold transition-all ${filterType === 'OUT' ? 'bg-rose-500 text-white shadow-sm' : 'text-slate-500 hover:text-rose-600'}`}>Chiqim</button>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto px-2">
          <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl p-1 px-3 w-full sm:w-auto">
            <Calendar size={16} className="text-slate-400" />
            <input type="date" value={startDate} onChange={(e) => { setStartDate(e.target.value); setPage(0); }} className="bg-transparent border-none outline-none font-bold text-slate-700 text-sm px-2 py-2 w-full cursor-pointer" />
            <span className="text-slate-300">-</span>
            <input type="date" value={endDate} onChange={(e) => { setEndDate(e.target.value); setPage(0); }} className="bg-transparent border-none outline-none font-bold text-slate-700 text-sm px-2 py-2 w-full cursor-pointer" />
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input type="text" placeholder="Meva yoki shaxs izlash..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(0); }} className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm text-slate-700 outline-none focus:border-blue-500 transition-all" />
          </div>
        </div>
      </div>

      {/* JADVAL */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 text-[14px] font-black tracking-wider">
                <th className="p-4 pl-6 w-12">Tur</th>
                <th className="p-4">Sana</th>
                <th className="p-4">Kamera / Meva</th>
                <th className="p-4">Sof vazn</th>
                <th className="p-4">Savat / Kimdan</th>
                <th className="p-4">Izoh</th>
                <th className="p-4 text-center">Amal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan="7" className="p-16 text-center text-slate-400">
                    <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-3"></div>
                    <p className="font-bold text-sm">Ma'lumotlar tortilmoqda...</p>
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-16 text-center text-slate-400">
                    <Filter size={40} className="mx-auto mb-3 text-slate-300" />
                    <p className="font-bold text-slate-500">Hech narsa topilmadi</p>
                  </td>
                </tr>
              ) : (
                transactions.map((item) => {
                  const isKirim = item.type === 'IN';
                  return (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="p-4 pl-6">
                        {isKirim ? (
                          <div className="flex justify-center items-center w-9 h-9 rounded-xl bg-emerald-100 text-emerald-600" title="Kirim"><ArrowDownLeft size={18} strokeWidth={3} /></div>
                        ) : (
                          <div className="flex justify-center items-center w-9 h-9 rounded-xl bg-rose-100 text-rose-600" title="Chiqim"><ArrowUpRight size={18} strokeWidth={3} /></div>
                        )}
                      </td>
                      <td className="p-4">
                        <span className="text-xs font-bold text-slate-500">{formatDate(item.date)}</span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2 mb-1">
                          <MapPin size={12} className="text-blue-500" />
                          {/* 🟢 XOLODILNIK NOMI SHU YERDA CHIQADI */}
                          <span className="text-[11px] font-black uppercase text-blue-600 tracking-wider bg-blue-50 px-2 py-0.5 rounded-md">
                            {item.fridgeName || 'Noma\'lum Kamera'}
                          </span>
                        </div>
                        <div className="font-extrabold text-slate-800 text-sm">{item.fruit}</div>
                      </td>
                      <td className="p-4">
                        <span className={`text-base font-black ${isKirim ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {isKirim ? '+' : '-'}{fmtKg(item.netWeight)} <span className="text-[10px] text-slate-400 font-bold">kg</span>
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="text-sm font-bold text-slate-800 mb-1">{item.person}</div>
                        <div className="flex items-center gap-1.5 text-slate-500">
                          <Box size={12} />
                          <span className="text-xs font-bold">{item.basketCount} ta</span>
                          <span className="text-[10px] font-medium">({item.basketName})</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-1.5 rounded-lg block w-max max-w-[150px] truncate" title={item.comment}>{item.comment}</span>
                      </td>
                      <td className="p-4 text-center">
                        {/* 🟢 OTMENA KNOPKASI (Faqat Kirim bo'lsa va stockId kelsa chiqadi) */}
                        {isKirim && item.stockId ? (
                          <button 
                            onClick={() => handleRevert(item.stockId)} 
                            className="p-2 text-rose-500 hover:bg-rose-100 rounded-xl transition-all opacity-0 group-hover:opacity-100" 
                            title="Xatoni to'g'rilash (Zalga qaytarish)"
                          >
                            <Undo2 size={18} strokeWidth={2.5} />
                          </button>
                        ) : (
                          <span className="text-slate-300 text-xs">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATSIYA */}
        {!isLoading && totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50">
            <span className="text-xs font-bold text-slate-500">Sahifa: {page + 1} / {totalPages}</span>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-50 transition-colors"><ChevronLeft size={16} /></button>
              <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-50 transition-colors"><ChevronRight size={16} /></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}