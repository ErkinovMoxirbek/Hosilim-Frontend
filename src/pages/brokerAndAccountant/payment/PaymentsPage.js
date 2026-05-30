import React, { useEffect, useState, useCallback } from 'react';
import {
  Search, X, Wallet, CreditCard, Landmark, Loader2,
  ChevronLeft, ChevronRight,
  ArrowUpDown, ArrowUp, ArrowDown, Calendar
} from "lucide-react";
import { paymentService } from '../../../services/paymentService';

const METHODS = [
  { id: 'CASH', icon: Wallet, label: 'Naqd' },
  { id: 'CARD', icon: CreditCard, label: 'Karta' },
  { id: 'BANK_TRANSFER', icon: Landmark, label: 'Bank' },
];

const fmt = (n) => Number(n || 0).toLocaleString('uz-UZ');

export default function PaymentsPage() {
  const [debts, setDebts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('balance');
  const [sortDir, setSortDir] = useState('desc');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const size = 15;

  // --- KALENDAR STATE'LARI ---
  const today = new Date().toISOString().split('T')[0];
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);

  const [paymentModal, setPaymentModal] = useState({ isOpen: false, farmer: null });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    amount: '', method: 'CASH', transactionType: 'PAYMENT',
    receiptNumber: '', comment: ''
  });

  const fetchDebts = useCallback(async () => {
    try {
      setLoading(true);
      // Backend api'ga sanalar yuboriladi
      const data = await paymentService.getDebts(searchTerm, page, size, startDate, endDate);
      setDebts(data.content || []);
      setTotalPages(data.totalPages || 0);
      setTotalElements(data.totalElements || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, page, size, startDate, endDate]);

  useEffect(() => {
    const t = setTimeout(fetchDebts, 400);
    return () => clearTimeout(t);
  }, [fetchDebts]);

  const handleSearchChange = (e) => { setSearchTerm(e.target.value); setPage(0); };

  const sortedDebts = [...debts].sort((a, b) => {
    if (sortField === 'balance') return sortDir === 'desc' ? b.balance - a.balance : a.balance - b.balance;
    if (sortField === 'name') {
      const na = `${a.farmer?.user?.name} ${a.farmer?.user?.surname}`;
      const nb = `${b.farmer?.user?.name} ${b.farmer?.user?.surname}`;
      return sortDir === 'desc' ? nb.localeCompare(na) : na.localeCompare(nb);
    }
    return 0;
  });

  const toggleSort = (field) => {
    if (sortField === field) setSortDir(d => d === 'desc' ? 'asc' : 'desc');
    else { setSortField(field); setSortDir('desc'); }
  };

  const openModal = (item) => {
    setForm({ amount: '', method: 'CASH', transactionType: 'PAYMENT', receiptNumber: '', comment: '' });
    setPaymentModal({ isOpen: true, farmer: item });
  };

  const closeModal = () => { if (!isSubmitting) setPaymentModal({ isOpen: false, farmer: null }); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.amount || Number(form.amount) <= 0) return alert("Summani to'g'ri kiriting!");
    try {
      setIsSubmitting(true);
      await paymentService.makePayment({
        farmerId: paymentModal.farmer.farmer.id,
        amount: Number(form.amount),
        method: form.method,
        transactionType: form.transactionType,
        receiptNumber: form.receiptNumber,
        comment: form.comment,
      });
      closeModal();
      fetchDebts();
    } catch (err) {
      alert(err.message || "Xatolik yuz berdi");
    } finally {
      setIsSubmitting(false);
    }
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <ArrowUpDown size={13} className="text-gray-300 ml-1 flex-shrink-0" />;
    return sortDir === 'desc'
      ? <ArrowDown size={13} className="text-gray-700 ml-1 flex-shrink-0" />
      : <ArrowUp size={13} className="text-gray-700 ml-1 flex-shrink-0" />;
  };

  const totalDebt = debts.reduce((s, d) => s + (d.balance || 0), 0);

  return (
    <div className="p-4 md:p-6 lg:p-8 w-full max-w-[1400px] mx-auto min-h-screen flex flex-col font-sans">

      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
            Fermerlar daromadi
          </h1>
        </div>

        {/* Stats pill - YANGILANGAN YASHIL DIZAYN */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-4 px-5 py-3 bg-white border border-slate-200 rounded-2xl shadow-sm">
            <div className="text-center">
              <div className="text-[11px] text-slate-400 font-bold mb-0.5">Jami fermerlar</div>
              <div className="font-bold text-slate-900 text-lg">{totalElements}</div>
            </div>
            <div className="w-px h-8 bg-slate-100" />
            <div className="text-center">
              <div className="text-[11px] text-slate-400 font-bold mb-0.5">Jami qarz</div>
              <div className="font-mono font-black text-emerald-600 text-lg tracking-tighter">
                {fmt(totalDebt)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── TOOLBAR & FILTERS ── */}
      <div className="flex flex-col xl:flex-row gap-4 mb-6 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        
        {/* Search */}
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Fermer ismi yoki telefon raqami..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 transition-all"
          />
        </div>

        {/* Date Filters - KALENDAR */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl">
            <Calendar size={14} className="text-slate-400" />
            <input 
              type="date" 
              value={startDate} 
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-700 outline-none cursor-pointer"
            />
            <span className="text-slate-300 mx-1">—</span>
            <input 
              type="date" 
              value={endDate} 
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-700 outline-none cursor-pointer"
            />
          </div>

          <div className="flex items-center gap-1 p-1 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-500">
            <button onClick={() => toggleSort('name')} className={`px-3 py-1.5 rounded-lg transition-all ${sortField === 'name' ? 'bg-white shadow-sm text-emerald-600' : 'hover:text-slate-700'}`}>
              Ism <SortIcon field="name" />
            </button>
            <button onClick={() => toggleSort('balance')} className={`px-3 py-1.5 rounded-lg transition-all ${sortField === 'balance' ? 'bg-white shadow-sm text-emerald-600' : 'hover:text-slate-700'}`}>
              Qarz <SortIcon field="balance" />
            </button>
          </div>
        </div>
      </div>

      {/* ── TABLE ── */}
      <div className="flex-1 bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        {/* Table header - FAQAT BOSH HARFI KATTA */}
        <div className="grid grid-cols-[1fr_200px_200px_120px] items-center px-6 py-4 bg-slate-50/50 border-b border-slate-100 text-[11px] font-bold tracking-wider text-slate-400">
          <div>Fermer</div>
          <div className="text-center">Telefon</div>
          <div className="text-right pr-4">Qarz miqdori</div>
          <div className="text-center">Amal</div>
        </div>

        {loading && debts.length === 0 ? (
          <div className="flex items-center justify-center py-32">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
          </div>
        ) : sortedDebts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-28 text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <Wallet size={32} className="text-slate-200" />
            </div>
            <p className="text-slate-400 font-bold text-sm">Ma'lumot topilmadi</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {sortedDebts.map((item) => {
              const name = `${item.farmer?.user?.name || ''} ${item.farmer?.user?.surname || ''}`.trim();
              const phone = item.farmer?.user?.phone;
              return (
                <div
                  key={item.id}
                  className="grid grid-cols-[1fr_200px_200px_120px] items-center px-6 py-4 hover:bg-slate-50/50 transition-colors group"
                >
                  {/* Name */}
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-xs font-black text-slate-400 flex-shrink-0 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-all">
                      {name.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-bold text-slate-800 text-[15px] truncate">{name || '—'}</span>
                  </div>

                  {/* Phone */}
                  <div className="text-center text-sm text-slate-500 font-mono tracking-tighter">
                    {phone || <span className="text-slate-200 italic">yo'q</span>}
                  </div>

                  {/* Balance - RAMKASIZ VA YASHIL */}
                  <div className="text-right pr-4">
                    <span className="font-mono font-black text-[17px] text-emerald-600 tabular-nums">
                      {fmt(item.balance)}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-500/50 ml-1.5 uppercase">uzs</span>
                  </div>

                  {/* Action */}
                  <div className="flex justify-center">
                    <button
                      onClick={() => openModal(item)}
                      className="px-4 py-2 bg-slate-900 text-white text-[11px] font-black rounded-xl hover:bg-emerald-600 transition-all shadow-sm active:scale-95 uppercase tracking-wider"
                    >
                      To'lov
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── PAGINATION ── */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/30">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
              Sahifa <span className="text-slate-800">{page + 1}</span> / {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={page === 0}
                onClick={() => setPage(p => p - 1)}
                className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-30 transition-all"
              >
                <ChevronLeft size={16} className="text-slate-600" />
              </button>
              <button
                disabled={page >= totalPages - 1}
                onClick={() => setPage(p => p + 1)}
                className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-30 transition-all"
              >
                <ChevronRight size={16} className="text-slate-600" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── MODAL ── */}
      {paymentModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={closeModal} />
          <div className="relative w-full max-w-[420px] bg-white rounded-[32px] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-8">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">Moliya operatsiyasi</h2>
                  <p className="text-sm font-bold text-emerald-600 mt-0.5">{paymentModal.farmer?.farmer?.user?.name} {paymentModal.farmer?.farmer?.user?.surname}</p>
                </div>
                <button onClick={closeModal} className="p-2 bg-slate-50 text-slate-400 hover:text-slate-600 rounded-2xl transition-all"><X size={20} /></button>
              </div>

              <div className="mb-6 p-5 bg-emerald-50 border border-emerald-100 rounded-[24px] flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest">Joriy hisob</span>
                <span className="text-xl font-mono font-black text-emerald-600">{fmt(paymentModal.farmer?.balance)} <span className="text-xs font-bold opacity-60 uppercase">uzs</span></span>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex p-1 bg-slate-100 rounded-2xl gap-1">
                  {[{ type: 'PAYMENT', label: "To'lov" }, { type: 'REFUND', label: 'Qaytim' }].map(t => (
                    <button key={t.type} type="button" onClick={() => setForm({ ...form, transactionType: t.type })} className={`flex-1 py-2.5 text-xs font-black rounded-xl transition-all ${form.transactionType === t.type ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400 hover:text-slate-500'}`}>{t.label}</button>
                  ))}
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block px-1">To'lov summasi</label>
                  <div className="relative">
                    <input required autoFocus type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="0" className="w-full px-6 py-5 bg-slate-50 border border-slate-200 rounded-[20px] text-3xl font-mono font-black text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all" />
                    <span className="absolute right-6 top-1/2 -translate-y-1/2 text-xs font-black text-slate-300 uppercase font-mono">uzs</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {METHODS.map(m => (
                    <button key={m.id} type="button" onClick={() => setForm({ ...form, method: m.id })} className={`py-4 rounded-[20px] border flex flex-col items-center gap-2 text-[10px] font-black transition-all ${form.method === m.id ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-100 text-slate-400 hover:bg-slate-50'}`}><m.icon size={20} />{m.label}</button>
                  ))}
                </div>

                <button type="submit" disabled={isSubmitting || !form.amount} className="w-full py-5 bg-slate-900 text-white rounded-[20px] text-sm font-black hover:bg-emerald-600 shadow-xl shadow-slate-900/10 transition-all active:scale-[0.98] flex items-center justify-center gap-2">
                  {isSubmitting ? <Loader2 size={20} className="animate-spin" /> : "TASDIQLASH"}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}