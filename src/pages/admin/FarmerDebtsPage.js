import React, { useState, useEffect, useCallback } from 'react';
import { Search, RefreshCw, ChevronLeft, ChevronRight, Banknote, CreditCard, Send, X, Loader2 } from 'lucide-react';
import { paymentService } from '../../services/paymentService';

const fmt = (n) => Number(n || 0).toLocaleString('uz-UZ');

export default function FarmerDebtsPage() {
  const [debts, setDebts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Paginatsiya va Qidiruv
  const [searchInput, setSearchInput] = useState('');
  const [filters, setFilters] = useState({ search: '' });
  const [pagination, setPagination] = useState({ page: 0, size: 12, totalElements: 0, totalPages: 0 });

  // To'lov Modali state'lari
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFarmer, setSelectedFarmer] = useState(null);
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    method: 'CASH', // CASH, CARD, TRANSFER
    transactionType: 'PAYMENT',
    comment: ''
  });

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await paymentService.getDebts(filters.search, pagination.page, pagination.size);
      setDebts(data.content || []);
      setPagination(prev => ({ ...prev, totalElements: data.totalElements || 0, totalPages: data.totalPages || 0 }));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filters.search, pagination.page, pagination.size]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleSearch = (e) => {
    e.preventDefault();
    setFilters({ search: searchInput });
    setPagination(prev => ({ ...prev, page: 0 }));
  };

  // To'lov formasi submit qilinganda
  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    if (!paymentForm.amount || Number(paymentForm.amount) <= 0) {
      alert("Iltimos, to'lov summasini to'g'ri kiriting!");
      return;
    }

    setIsSubmitting(true);
    try {
      await paymentService.makePayment({
        farmerId: selectedFarmer.id,
        amount: Number(paymentForm.amount),
        method: paymentForm.method,
        transactionType: paymentForm.transactionType,
        comment: paymentForm.comment
      });
      
      // Muvaffaqiyatli to'lovdan keyin
      setIsModalOpen(false);
      setPaymentForm({ amount: '', method: 'CASH', transactionType: 'PAYMENT', comment: '' });
      loadData(); // Jadvalni yangilash
      alert("To'lov muvaffaqiyatli amalga oshirildi!");
    } catch (error) {
      alert(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openPaymentModal = (farmerInfo) => {
    setSelectedFarmer(farmerInfo);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Banknote size={26} className="text-emerald-600" />
              Fermerga To'lov
            </h1>
            <p className="text-sm text-slate-500 mt-1">Fermerlarning joriy haqdorliklari (qarzlari) va to'lov qilish</p>
          </div>
          <button onClick={loadData} className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 flex items-center gap-2 text-sm font-medium transition-colors">
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Yangilash
          </button>
        </div>

        {/* SEARCH */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" placeholder="Fermer F.I.O yoki telefon orqali qidirish..." 
              value={searchInput} onChange={(e) => setSearchInput(e.target.value)} 
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-emerald-500" 
            />
          </div>
          <button type="submit" className="px-5 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors">
            Qidirish
          </button>
        </form>

        {/* TABLE */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden relative">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-6 py-4">Fermer</th>
                  <th className="px-6 py-4">Telefon</th>
                  <th className="px-6 py-4">Joriy Balans</th>
                  <th className="px-6 py-4 text-right">Amal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {debts.length === 0 && !loading ? (
                  <tr><td colSpan="4" className="px-6 py-12 text-center text-slate-500">Hech qanday ma'lumot topilmadi</td></tr>
                ) : (
                  debts.map(item => (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900">{item.farmer?.user?.name} {item.farmer?.user?.surname}</div>
                        <div className="text-xs text-slate-500 font-mono mt-0.5">ID: #{item.farmer?.id}</div>
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-600">
                        {item.farmer?.user?.phone}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-lg text-[#0B1A42]">{fmt(item.balance)} <span className="text-xs text-slate-400">UZS</span></div>
                        <div className="text-[10px] text-emerald-600 font-semibold uppercase tracking-wider mt-0.5">Fermer haqi</div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => openPaymentModal(item.farmer)}
                          className="px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-sm font-bold hover:bg-emerald-600 hover:text-white transition-colors flex items-center gap-2 ml-auto"
                        >
                          <Banknote size={16} /> To'lov qilish
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {loading && (
            <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] flex items-center justify-center z-10">
              <RefreshCw className="animate-spin text-emerald-600" size={24} />
            </div>
          )}
        </div>

        {/* PAGINATION */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-sm text-slate-600">Jami: <span className="font-bold">{pagination.totalElements}</span> ta</span>
            <div className="flex gap-1">
              <button onClick={() => setPagination(p => ({ ...p, page: Math.max(0, p.page - 1) }))} disabled={pagination.page === 0} className="p-1.5 rounded border border-slate-300 text-slate-600 hover:bg-slate-50 disabled:opacity-50"><ChevronLeft size={16} /></button>
              <button onClick={() => setPagination(p => ({ ...p, page: Math.min(p.totalPages - 1, p.page + 1) }))} disabled={pagination.page >= pagination.totalPages - 1} className="p-1.5 rounded border border-slate-300 text-slate-600 hover:bg-slate-50 disabled:opacity-50"><ChevronRight size={16} /></button>
            </div>
          </div>
        )}
      </div>

      {/* TO'LOV MODALI */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Banknote className="text-emerald-600" size={20} /> To'lovni amalga oshirish
              </h2>
              <button onClick={() => !isSubmitting && setIsModalOpen(false)} className="p-1 text-slate-400 hover:text-red-500 rounded-md transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handlePaymentSubmit} className="p-6 space-y-5">
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                <p className="text-xs text-blue-600 font-semibold uppercase tracking-wider mb-0.5">Qabul qiluvchi:</p>
                <p className="text-base font-bold text-slate-900">{selectedFarmer?.user?.name} {selectedFarmer?.user?.surname}</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">To'lov Summasi (UZS) <span className="text-red-500">*</span></label>
                <input 
                  type="number" min="0" step="100" required value={paymentForm.amount}
                  onChange={(e) => setPaymentForm({...paymentForm, amount: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-lg font-bold focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  placeholder="0" disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">To'lov Usuli <span className="text-red-500">*</span></label>
                <div className="grid grid-cols-2 gap-3">
                  <button type="button" onClick={() => setPaymentForm({...paymentForm, method: 'CASH'})} className={`py-2 px-3 border rounded-xl flex items-center justify-center gap-2 text-sm font-semibold transition-all ${paymentForm.method === 'CASH' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`} disabled={isSubmitting}>
                    <Banknote size={18} /> Naqd
                  </button>
                  <button type="button" onClick={() => setPaymentForm({...paymentForm, method: 'CARD'})} className={`py-2 px-3 border rounded-xl flex items-center justify-center gap-2 text-sm font-semibold transition-all ${paymentForm.method === 'CARD' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`} disabled={isSubmitting}>
                    <CreditCard size={18} /> Karta
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Izoh (Ixtiyoriy)</label>
                <textarea 
                  value={paymentForm.comment} onChange={(e) => setPaymentForm({...paymentForm, comment: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-emerald-500 resize-none h-20"
                  placeholder="To'lov haqida qisqacha ma'lumot..." disabled={isSubmitting}
                ></textarea>
              </div>

              <div className="pt-2">
                <button type="submit" disabled={isSubmitting} className="w-full py-3 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 disabled:opacity-70 disabled:shadow-none">
                  {isSubmitting ? (
                    <><Loader2 size={18} className="animate-spin" /> Bajarilmoqda...</>
                  ) : (
                    <><Send size={18} /> To'lovni tasdiqlash</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}