import React, { useEffect, useState, useCallback } from 'react';
import {
  Search, X, Wallet, CreditCard, Landmark, Loader2,
  ArrowDownRight, ArrowUpRight, ChevronLeft, ChevronRight,
  SlidersHorizontal, ArrowUpDown, ArrowUp, ArrowDown
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

  const [paymentModal, setPaymentModal] = useState({ isOpen: false, farmer: null });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    amount: '', method: 'CASH', transactionType: 'PAYMENT',
    receiptNumber: '', comment: ''
  });

  const fetchDebts = useCallback(async () => {
    try {
      setLoading(true);
      const data = await paymentService.getDebts(searchTerm, page, size);
      setDebts(data.content || []);
      setTotalPages(data.totalPages || 0);
      setTotalElements(data.totalElements || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, page, size]);

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
    <div className="p-4 md:p-6 lg:p-8 w-full max-w-[1400px] mx-auto min-h-screen flex flex-col">

      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold mb-1 block">
            Moliya va Kassa
          </span>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
            Qarzdorliklar
          </h1>
        </div>

        {/* Stats pill */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-4 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm">
            <div className="text-center">
              <div className="text-[10px] uppercase tracking-wide text-gray-400 font-semibold">Jami fermerlar</div>
              <div className="font-bold text-gray-900">{totalElements}</div>
            </div>
            <div className="w-px h-6 bg-gray-200" />
            <div className="text-center">
              <div className="text-[10px] uppercase tracking-wide text-gray-400 font-semibold">Jami qarz</div>
              <div className="font-bold text-red-600 font-mono">{fmt(totalDebt)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── TOOLBAR ── */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Fermer ismi yoki telefon..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100 transition-all"
          />
          {searchTerm && (
            <button onClick={() => { setSearchTerm(''); setPage(0); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700">
              <X size={14} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-1 px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs text-gray-500">
          <SlidersHorizontal size={13} className="mr-1" />
          Saralash:
          <button onClick={() => toggleSort('name')} className={`ml-2 px-2 py-1 rounded-md font-medium flex items-center transition-colors ${sortField === 'name' ? 'bg-gray-900 text-white' : 'hover:bg-gray-100 text-gray-600'}`}>
            Ism <SortIcon field="name" />
          </button>
          <button onClick={() => toggleSort('balance')} className={`px-2 py-1 rounded-md font-medium flex items-center transition-colors ${sortField === 'balance' ? 'bg-gray-900 text-white' : 'hover:bg-gray-100 text-gray-600'}`}>
            Qarz <SortIcon field="balance" />
          </button>
        </div>
      </div>

      {/* ── TABLE ── */}
      <div className="flex-1 bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        {/* Table header */}
        <div className="grid grid-cols-[1fr_auto_auto_auto] items-center px-5 py-3 bg-gray-50 border-b border-gray-200 text-[10px] font-bold uppercase tracking-widest text-gray-400">
          <button onClick={() => toggleSort('name')} className="flex items-center text-left hover:text-gray-700 transition-colors">
            Fermer <SortIcon field="name" />
          </button>
          <div className="w-36 text-center">Telefon</div>
          <button onClick={() => toggleSort('balance')} className="w-40 flex items-center justify-end hover:text-gray-700 transition-colors pr-6">
            Qarz miqdori <SortIcon field="balance" />
          </button>
          <div className="w-28 text-center">Amal</div>
        </div>

        {loading && debts.length === 0 ? (
          <div className="flex items-center justify-center py-32">
            <Loader2 className="w-7 h-7 animate-spin text-gray-300" />
          </div>
        ) : sortedDebts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-28 text-center">
            <Wallet size={36} className="text-gray-200 mb-3" />
            <p className="text-gray-400 text-sm">Hech qanday qarzdorlik topilmadi</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {sortedDebts.map((item, idx) => {
              const name = `${item.farmer?.user?.name || ''} ${item.farmer?.user?.surname || ''}`.trim();
              const phone = item.farmer?.user?.phone;
              return (
                <div
                  key={item.id}
                  className="grid grid-cols-[1fr_auto_auto_auto] items-center px-5 py-3.5 hover:bg-gray-50/70 transition-colors group"
                >
                  {/* Name */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500 flex-shrink-0 group-hover:bg-gray-200 transition-colors">
                      {name.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-semibold text-gray-900 text-sm truncate">{name || '—'}</span>
                  </div>

                  {/* Phone */}
                  <div className="w-36 text-center text-sm text-gray-500 font-mono">
                    {phone || <span className="text-gray-300 text-xs">kiritilmagan</span>}
                  </div>

                  {/* Balance */}
                  <div className="w-40 text-right pr-6">
                    <span className={`font-mono font-bold text-sm ${item.balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {fmt(item.balance)}
                    </span>
                    <span className="text-gray-400 text-xs ml-1">so'm</span>
                  </div>

                  {/* Action */}
                  <div className="w-28 flex justify-center">
                    <button
                      onClick={() => openModal(item)}
                      className="px-3 py-1.5 bg-gray-900 text-white text-xs font-semibold rounded-lg hover:bg-black transition-colors opacity-80 group-hover:opacity-100"
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
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 bg-gray-50/50">
            <span className="text-xs text-gray-400">
              Sahifa <span className="font-bold text-gray-700">{page + 1}</span> / {totalPages}
              <span className="ml-2 text-gray-300">({totalElements} ta)</span>
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={page === 0}
                onClick={() => setPage(p => p - 1)}
                className="p-1.5 border border-gray-200 rounded-lg hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={16} className="text-gray-600" />
              </button>
              {/* Page numbers */}
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const p = Math.max(0, Math.min(totalPages - 5, page - 2)) + i;
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-7 h-7 text-xs font-medium rounded-lg transition-colors ${p === page ? 'bg-gray-900 text-white' : 'hover:bg-gray-100 text-gray-500'}`}
                  >
                    {p + 1}
                  </button>
                );
              })}
              <button
                disabled={page >= totalPages - 1}
                onClick={() => setPage(p => p + 1)}
                className="p-1.5 border border-gray-200 rounded-lg hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={16} className="text-gray-600" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── PAYMENT MODAL ── */}
      {paymentModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"
            onClick={closeModal}
          />

          <div className="relative w-full max-w-[420px] bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom-2 duration-200">

            {/* Modal header */}
            <div className="flex items-start justify-between p-5 pb-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Moliya operatsiyasi</h2>
                <p className="text-sm text-gray-400 mt-0.5">
                  {paymentModal.farmer?.farmer?.user?.name} {paymentModal.farmer?.farmer?.user?.surname}
                </p>
              </div>
              <button onClick={closeModal} className="p-1 text-gray-300 hover:text-gray-700 transition-colors mt-0.5">
                <X size={18} />
              </button>
            </div>

            {/* Debt summary bar */}
            <div className="mx-5 mb-4 flex items-center justify-between p-3.5 bg-red-50 border border-red-100 rounded-xl">
              <span className="text-xs font-semibold text-red-400 uppercase tracking-wide">Joriy qarz</span>
              <span className="text-base font-bold text-red-600 font-mono">
                {fmt(paymentModal.farmer?.balance)} <span className="text-xs font-normal text-red-400">so'm</span>
              </span>
            </div>

            <form id="paymentForm" onSubmit={handleSubmit} className="px-5 pb-5 space-y-4">

              {/* Transaction type toggle */}
              <div className="flex p-1 bg-gray-100 rounded-xl gap-1">
                {[
                  { type: 'PAYMENT', icon: ArrowUpRight, label: "Chiqim (To'lov)", color: 'text-red-500' },
                  { type: 'REFUND', icon: ArrowDownRight, label: 'Kirim (Qaytim)', color: 'text-green-500' },
                ].map(t => (
                  <button
                    key={t.type}
                    type="button"
                    onClick={() => setForm({ ...form, transactionType: t.type })}
                    className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${form.transactionType === t.type ? 'bg-white shadow-sm text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    <t.icon size={13} className={form.transactionType === t.type ? t.color : ''} />
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Amount — biggest, most important field */}
              <div>
                <label className="text-[10px] uppercase tracking-widest text-gray-400 font-bold block mb-1.5">
                  Summa (UZS) <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <input
                    required autoFocus
                    type="number" min="1"
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    placeholder="0"
                    className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-2xl font-bold font-mono focus:outline-none focus:border-gray-400 focus:bg-white transition-all pr-20"
                  />
                  {form.transactionType === 'PAYMENT' && (
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, amount: paymentModal.farmer?.balance })}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold bg-gray-200 hover:bg-gray-300 text-gray-700 px-2.5 py-1.5 rounded-lg transition-colors"
                    >
                      TO'LIQ
                    </button>
                  )}
                </div>
              </div>

              {/* Payment method */}
              <div>
                <label className="text-[10px] uppercase tracking-widest text-gray-400 font-bold block mb-1.5">
                  To'lov usuli <span className="text-red-400">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {METHODS.map(m => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setForm({ ...form, method: m.id })}
                      className={`py-3 px-2 rounded-xl border flex flex-col items-center gap-1.5 text-[11px] font-semibold transition-all ${form.method === m.id ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-200 text-gray-400 hover:border-gray-300 hover:text-gray-600'}`}
                    >
                      <m.icon size={16} />
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Optional fields — compact row */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-gray-400 font-bold block mb-1">Kvitansiya</label>
                  <input
                    type="text" placeholder="Ixtiyoriy"
                    value={form.receiptNumber}
                    onChange={(e) => setForm({ ...form, receiptNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gray-400 transition-all"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-gray-400 font-bold block mb-1">Izoh</label>
                  <input
                    type="text" placeholder="Ixtiyoriy"
                    value={form.comment}
                    onChange={(e) => setForm({ ...form, comment: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gray-400 transition-all"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={isSubmitting}
                  className="flex-none px-4 py-3 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Bekor
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !form.amount}
                  className="flex-1 py-3 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-black transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : 'Tasdiqlash'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}