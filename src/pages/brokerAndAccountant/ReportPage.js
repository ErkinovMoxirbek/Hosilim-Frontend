import React, { useState, useEffect } from 'react';
import {
  Calendar, Search, ChevronDown, ChevronUp,
  Scale, Banknote, Box, Loader2, FileText, Filter,
  CheckCircle2, Clock, AlertCircle, Download,
  Wallet, CreditCard, Landmark, X
} from 'lucide-react';
import cropService from '../../services/cropService';
import { paymentService } from '../../services/paymentService';

const getTodayString = () => new Date().toISOString().split('T')[0];
const fmt = (n) => (n ?? 0).toLocaleString('uz-UZ');
const fmtKg = (n) => ((n ?? 0)).toFixed(1);

const formatDateTime = (isoString) => {
  if (!isoString) return '';
  return new Date(isoString).toLocaleString('uz-UZ', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

const getPeriodBalance = (farmer) => {
  if (farmer.periodBalance != null) return farmer.periodBalance;
  return (farmer.totalAmount ?? 0) - (farmer.totalPaid ?? 0);
};

const METHODS = [
  { id: 'CASH', icon: Wallet, label: 'Naqd' },
  { id: 'CARD', icon: CreditCard, label: 'Karta' },
  { id: 'BANK_TRANSFER', icon: Landmark, label: 'Bank' },
];

export default function ReportPage() {
  const [startDate, setStartDate] = useState(getTodayString());
  const [endDate, setEndDate] = useState(getTodayString());
  const [search, setSearch] = useState('');

  const [groupedData, setGroupedData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const [expandedId, setExpandedId] = useState(null);
  const [details, setDetails] = useState([]);
  const [detailsSummary, setDetailsSummary] = useState(null);
  const [isDetailsLoading, setIsDetailsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // To'lov Modali State'lari
  const [paymentModal, setPaymentModal] = useState({ isOpen: false, farmer: null, suggestedAmount: 0 });
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);
  const [paymentForm, setPaymentForm] = useState({ amount: '', method: 'CASH', comment: '' });

  const [fruitTypes, setFruitTypes] = useState([]);
  const [fruitTypeId, setFruitTypeId] = useState(null);

  useEffect(() => {
    cropService.getFruitTypes().then(setFruitTypes);
  }, []);


  useEffect(() => {
    const fetchGroupedData = async () => {
      setIsLoading(true);
      try {
        const res = await cropService.getReportsGrouped(
          startDate, endDate, search, 0, 50, fruitTypeId  // ← fruitTypeId qo'shildi
        );
        setGroupedData(res.content || []);
      } catch (error) {
        console.error("Ma'lumotlarni yuklashda xato:", error);
      } finally {
        setIsLoading(false);
      }
    };
    const timer = setTimeout(fetchGroupedData, 300);
    return () => clearTimeout(timer);
  }, [startDate, endDate, search, fruitTypeId, refreshTrigger]);  // ← fruitTypeId qo'shildi


  const toggleRow = async (farmerId) => {
    if (expandedId === farmerId) {
      setExpandedId(null);
      setDetails([]);
      setDetailsSummary(null);
      return;
    }
    setExpandedId(farmerId);
    setIsDetailsLoading(true);
    try {
      const res = await cropService.getReportsDetails(
        farmerId, startDate, endDate, fruitTypeId
      );
      setDetails(Array.isArray(res.transactions) ? res.transactions : []);
      setDetailsSummary({
        periodEarned: res.periodEarned ?? 0,
        periodPaid: res.periodPaid ?? 0,
        periodDifference: res.periodDifference ?? 0,
      });
    } catch (error) {
      console.error("Batafsil ma'lumotni yuklashda xato:", error);
      setDetails([]);
      setDetailsSummary(null);
    } finally {
      setIsDetailsLoading(false);
    }
  };

  const downloadExcel = async () => {
    setIsDownloading(true);
    try {
      const blobData = await cropService.downloadExcelReport(startDate, endDate, search);
      const url = window.URL.createObjectURL(new Blob([blobData]));
      const link = document.createElement('a');
      link.href = url;
      const fileName = startDate === endDate
        ? `Kunlik_Hisobot_${startDate}.xlsx`
        : `Hisobot_${startDate}_dan_${endDate}.xlsx`;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert("Excel yuklashda xatolik yuz berdi. Server aloqasini tekshiring.");
    } finally {
      setIsDownloading(false);
    }
  };

  const openPaymentModal = (farmer, e) => {
    e.stopPropagation();
    const debt = getPeriodBalance(farmer);
    setPaymentModal({ isOpen: true, farmer, suggestedAmount: debt });
    setPaymentForm({ amount: debt > 0 ? debt : '', method: 'CASH', comment: '' });
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    if (!paymentForm.amount || Number(paymentForm.amount) <= 0) {
      return alert("Summani to'g'ri kiriting!");
    }

    try {
      setIsSubmittingPayment(true);
      await paymentService.makePayment({
        farmerId: paymentModal.farmer.farmerId,
        amount: Number(paymentForm.amount),
        method: paymentForm.method,
        transactionType: 'PAYMENT',
        receiptNumber: '',
        comment: `Hisobot sahifasidan oraliq to'lov`,
        startDate: startDate,
        endDate: endDate
      });

      setPaymentModal({ isOpen: false, farmer: null, suggestedAmount: 0 });
      setRefreshTrigger(prev => prev + 1);

      if (expandedId === paymentModal.farmer.farmerId) {
        toggleRow(paymentModal.farmer.farmerId);
        setTimeout(() => toggleRow(paymentModal.farmer.farmerId), 100);
      }

    } catch (err) {
      alert(err.message || "To'lovda xatolik yuz berdi");
    } finally {
      setIsSubmittingPayment(false);
    }
  };

  const totalSummary = groupedData.reduce((acc, curr) => ({
    weight: acc.weight + (curr.totalNetWeight ?? 0),
    amount: acc.amount + (curr.totalAmount ?? 0),
    paid: acc.paid + (curr.totalPaid ?? 0),
    baskets: acc.baskets + (curr.totalBaskets ?? 0),
    debt: acc.debt + getPeriodBalance(curr),
  }), { weight: 0, amount: 0, paid: 0, baskets: 0, debt: 0 });

  const isDaily = startDate === endDate;

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto pb-16 space-y-5 bg-gray-50/50 min-h-screen">
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col xl:flex-row gap-4 xl:justify-between xl:items-center">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#0B1A42] flex items-center gap-2">
            {isDaily ? 'Hisobotlar (Kunlik)' : 'Oraliq Hisobot'}
          </h1>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto">
          <div className="flex items-center bg-gray-50 border border-gray-300 rounded-xl p-1 w-full sm:w-auto focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
            <div className="flex items-center pl-3 text-gray-400"><Calendar size={17} /></div>
            <input type="date" value={startDate} onChange={(e) => { setStartDate(e.target.value); setExpandedId(null); }} className="bg-transparent border-none outline-none font-bold text-gray-700 text-sm px-3 py-2 w-full cursor-pointer" />
            <span className="text-gray-300 font-bold px-1">-</span>
            <input type="date" value={endDate} min={startDate} onChange={(e) => { setEndDate(e.target.value); setExpandedId(null); }} className="bg-transparent border-none outline-none font-bold text-gray-700 text-sm px-3 py-2 w-full cursor-pointer" />
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
            <input type="text" placeholder="Fermerning F.I.O yoki raqami..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl font-medium text-sm text-gray-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all w-full" />
          </div>

          {/* Meva turi filtri */}
          <div className="relative w-full sm:w-52">
            <select
              value={fruitTypeId ?? ''}
              onChange={(e) => {
                setFruitTypeId(e.target.value || null);
                setExpandedId(null);   // ochiq qatorni yopamiz
              }}
              className="w-full pl-4 pr-9 py-2.5 bg-gray-50 border border-gray-300 rounded-xl
                   font-bold text-sm text-gray-700 outline-none appearance-none cursor-pointer
                   focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
            >
              <option value="">Barcha mevalar</option>
              {fruitTypes.map(ft => (
                <option key={ft.id} value={ft.id}>{ft.name + " " + ft.quality}</option>
              ))}
            </select>
            <ChevronDown
              size={14}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
          </div>

          <button onClick={downloadExcel} disabled={isDownloading || groupedData.length === 0} className="flex items-center justify-center gap-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white border border-emerald-200 hover:border-emerald-500 px-4 py-2.5 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto">
            {isDownloading ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
            <span className="hidden sm:inline">Excel</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
        <SummaryCard icon={Scale} title="Sof vazn" value={`${fmtKg(totalSummary.weight)} kg`} color="text-emerald-600" bg="bg-emerald-50" border="border-emerald-100" />
        <SummaryCard icon={Box} title="Savatlar soni" value={`${totalSummary.baskets} ta`} color="text-orange-600" bg="bg-orange-50" border="border-orange-100" />
        <SummaryCard icon={Banknote} title="Jami Summa" value={`${fmt(totalSummary.amount)} UZS`} color="text-blue-600" bg="bg-blue-50" border="border-blue-100" />
        <SummaryCard icon={CheckCircle2} title="To'langan" value={`${fmt(totalSummary.paid)} UZS`} color="text-teal-600" bg="bg-teal-50" border="border-teal-100" />
        <SummaryCard icon={AlertCircle} title="Qoldiq" value={`${fmt(totalSummary.debt)} UZS`} color="text-red-500" bg="bg-red-50" border="border-red-100" />
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-200 text-gray-500 text-[11px] font-bold tracking-wider">
                <th className="p-4 pl-6 w-10"></th>
                <th className="p-4">Fermer</th>
                <th className="p-4">Sof Vazn</th>
                <th className="p-4">Savatlar</th>
                <th className="p-4">Jami Summa</th>
                <th className="p-4">To'langan</th>
                <th className="p-4">Qarz (Qoldiq)</th>
                <th className="p-4 text-center">Amal</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan="8" className="p-16 text-center text-gray-400">
                  <Loader2 className="animate-spin mx-auto mb-3 text-blue-500" size={34} />
                  <p className="font-medium text-sm">Ma'lumotlar yuklanmoqda...</p>
                </td></tr>
              ) : groupedData.length === 0 ? (
                <tr><td colSpan="8" className="p-16 text-center text-gray-400">
                  <div className="flex flex-col items-center">
                    <Filter size={44} className="mb-3 text-gray-300" />
                    <p className="font-medium text-sm">Hech qanday ma'lumot topilmadi.</p>
                  </div>
                </td></tr>
              ) : (
                groupedData.map((farmer) => {
                  const isOpen = expandedId === farmer.farmerId;
                  const balance = getPeriodBalance(farmer);
                  const isFullyPaid = balance <= 0;

                  return (
                    <React.Fragment key={farmer.farmerId}>
                      <tr onClick={() => toggleRow(farmer.farmerId)} className={`border-b cursor-pointer transition-colors ${isOpen ? 'bg-blue-50/40 border-blue-100' : 'border-gray-100 hover:bg-gray-50'}`}>
                        <td className="p-4 pl-6"><button className={`p-1.5 rounded-md transition-colors ${isOpen ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'}`}>{isOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}</button></td>
                        <td className="p-4">
                          <div className="font-bold text-[#0B1A42] text-[15px]">{farmer.farmerFullName}</div>
                          <div className="text-xs text-gray-400 mt-0.5">{farmer.farmerPhone}</div>
                        </td>
                        <td className="p-4"><span className="text-base font-black text-emerald-600">{fmtKg(farmer.totalNetWeight)}<span className="text-xs text-gray-400 font-bold ml-1">kg</span></span></td>
                        <td className="p-4"><span className="text-[12px] font-extrabold bg-gray-100 text-gray-600 px-2.5 py-1 rounded-md">{fmt(farmer.totalBaskets)} ta</span></td>
                        <td className="p-4"><span className="font-black text-[#0B1A42] text-[15px]">{fmt(farmer.totalAmount)}<span className="text-[10px] text-gray-400 ml-1">UZS</span></span></td>
                        <td className="p-4"><span className="font-bold text-teal-600 text-sm">{fmt(farmer.totalPaid)}<span className="text-[10px] text-gray-400 ml-1">UZS</span></span></td>
                        <td className="p-4">
                          {isFullyPaid ? (
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-teal-600 bg-teal-50 px-2.5 py-1 rounded-full"><CheckCircle2 size={12} /> To'liq to'landi</span>
                          ) : (
                            <span className="font-bold text-red-500 text-sm">{fmt(balance)}<span className="text-[10px] text-gray-400 ml-1">UZS</span></span>
                          )}
                        </td>
                        <td className="p-4 text-center">
                          {!isFullyPaid && (
                            <button onClick={(e) => openPaymentModal(farmer, e)} className="px-3 py-1.5 bg-slate-900 text-white text-[11px] font-black rounded-lg hover:bg-emerald-600 transition-all shadow-sm active:scale-95 uppercase tracking-wider">
                              To'lov
                            </button>
                          )}
                        </td>
                      </tr>

                      {isOpen && (
                        <tr className="bg-gray-50/50 border-b border-gray-200">
                          <td colSpan="8" className="p-0">
                            <div className="p-4 pl-14 pr-6 py-4 space-y-3">
                              {detailsSummary && (
                                <div className="grid grid-cols-3 gap-3">
                                  <MiniCard label="Davr daromadi" value={`${fmt(detailsSummary.periodEarned)} UZS`} color="text-blue-600" bg="bg-blue-50" />
                                  <MiniCard label="Davr to'lovi" value={`${fmt(detailsSummary.periodPaid)} UZS`} color="text-teal-600" bg="bg-teal-50" />
                                  <MiniCard label="Davr farqi (qarz)" value={`${fmt(detailsSummary.periodDifference)} UZS`} color="text-red-500" bg="bg-red-50" />
                                </div>
                              )}
                              <div className="bg-white border border-blue-100 rounded-xl overflow-hidden shadow-sm">
                                {isDetailsLoading ? (
                                  <div className="p-8 text-center text-gray-400">
                                    <Loader2 className="animate-spin mx-auto mb-2 text-blue-500" size={22} />
                                    <p className="text-xs font-medium">Tranzaksiyalar yuklanmoqda...</p>
                                  </div>
                                ) : (
                                  <table className="w-full text-left border-collapse">
                                    <thead>
                                      <tr className="bg-blue-50/60 text-blue-800 text-[10px] font-bold uppercase tracking-wider border-b border-blue-100">
                                        <th className="p-3 pl-4">Sana</th>
                                        <th className="p-3">Meva Turi / Narxi</th>
                                        <th className="p-3">Netto</th>
                                        <th className="p-3">Savat</th>
                                        <th className="p-3">Summa</th>
                                        <th className="p-3">To'langan</th>
                                        <th className="p-3">Holat</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {details.length === 0 ? (
                                        <tr><td colSpan="7" className="p-6 text-center text-xs text-gray-400">Ma'lumot topilmadi</td></tr>
                                      ) : (
                                        details.map((item, idx) => (
                                          <tr key={item.id ?? idx} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                                            <td className="p-3 pl-4 text-xs text-gray-500 font-medium whitespace-nowrap">{formatDateTime(item.createdAt)}</td>
                                            <td className="p-3">
                                              <div className="flex items-center gap-2">
                                                <FileText size={13} className="text-orange-500 shrink-0" />
                                                <div>
                                                  <div className="font-semibold text-gray-800 text-xs">{item.fruitName}</div>
                                                  <div className="text-[10px] text-gray-400 mt-0.5">{fmt(item.unitPrice)} so'm/kg</div>
                                                </div>
                                              </div>
                                            </td>
                                            <td className="p-3"><span className="font-bold text-emerald-600 text-xs">{fmtKg(item.netWeight)} kg</span></td>
                                            <td className="p-3">
                                              {(item.basketCount ?? 0) > 0 ? (
                                                <div className="text-xs text-gray-600">
                                                  <span className="font-bold">{item.basketCount}x</span>
                                                  <span className="text-gray-400 ml-1 truncate max-w-[100px] inline-block align-bottom">{item.basketName}</span>
                                                </div>
                                              ) : <span className="text-gray-300 text-xs">—</span>}
                                            </td>
                                            <td className="p-3"><span className="font-bold text-[#0B1A42] text-xs">{fmt(item.totalAmount)}<span className="text-[9px] text-gray-400 ml-1">UZS</span></span></td>
                                            <td className="p-3"><span className="font-bold text-teal-600 text-xs">{fmt(item.paidAmount)}<span className="text-[9px] text-gray-400 ml-1">UZS</span></span></td>
                                            <td className="p-3"><PaymentBadge isPaid={item.isPaid} /></td>
                                          </tr>
                                        ))
                                      )}
                                    </tbody>
                                  </table>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {paymentModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => !isSubmittingPayment && setPaymentModal({ isOpen: false, farmer: null, suggestedAmount: 0 })} />
          <div className="relative w-full max-w-[420px] bg-white rounded-[32px] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-8">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">Oraliq To'lov</h2>
                  <p className="text-sm font-bold text-emerald-600 mt-0.5">{paymentModal.farmer?.farmerFullName}</p>
                </div>
                <button onClick={() => !isSubmittingPayment && setPaymentModal({ isOpen: false, farmer: null, suggestedAmount: 0 })} className="p-2 bg-slate-50 text-slate-400 hover:text-slate-600 rounded-2xl transition-all"><X size={20} /></button>
              </div>

              <div className="mb-6 p-5 bg-emerald-50 border border-emerald-100 rounded-[24px] flex items-center justify-between">
                <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-widest">Oraliqdagi qarz</span>
                <span className="text-xl font-mono font-black text-emerald-600">{fmt(paymentModal.suggestedAmount)} <span className="text-xs font-bold opacity-60 uppercase">uzs</span></span>
              </div>

              <form onSubmit={handlePaymentSubmit} className="space-y-6">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block px-1">To'lov summasi</label>
                  <div className="relative">
                    <input
                      required
                      autoFocus
                      type="text" // 🟢 YANGLIK: number o'rniga text qildik, probel ishlashi uchun
                      inputMode="numeric" // Telefonda faqat raqamlar klaviaturasi chiqishi uchun
                      value={paymentForm.amount ? String(paymentForm.amount).replace(/\B(?=(\d{3})+(?!\d))/g, " ") : ''}
                      onChange={(e) => {
                        // 🟢 YANGLIK: Faqat raqamlarni ajratib olib state'ga saqlaymiz
                        const rawValue = e.target.value.replace(/\D/g, '');
                        setPaymentForm({ ...paymentForm, amount: rawValue });
                      }}
                      placeholder="0"
                      className="w-full px-6 py-5 bg-slate-50 border border-slate-200 rounded-[20px] text-3xl font-mono font-black text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all tracking-wide"
                    />
                    <span className="absolute right-6 top-1/2 -translate-y-1/2 text-xs font-black text-slate-300 uppercase font-mono">uzs</span>
                  </div>
                  <p className="text-[10px] font-medium text-slate-400 mt-2 px-2">* Ushbu summa tanlangan oraliqdagi (<span className="font-bold text-slate-600">{startDate} dan {endDate} gacha</span>) bo'lgan qarzlar hisobidan avtomatik yechiladi.</p>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {METHODS.map(m => (
                    <button key={m.id} type="button" onClick={() => setPaymentForm({ ...paymentForm, method: m.id })} className={`py-4 rounded-[20px] border flex flex-col items-center gap-2 text-[10px] font-black transition-all ${paymentForm.method === m.id ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-100 text-slate-400 hover:bg-slate-50'}`}>
                      <m.icon size={20} />{m.label}
                    </button>
                  ))}
                </div>

                <button type="submit" disabled={isSubmittingPayment || !paymentForm.amount} className="w-full py-5 bg-slate-900 text-white rounded-[20px] text-sm font-black hover:bg-emerald-600 shadow-xl shadow-slate-900/10 transition-all active:scale-[0.98] flex items-center justify-center gap-2">
                  {isSubmittingPayment ? <Loader2 size={20} className="animate-spin" /> : "TO'LOVNI TASDIQLASH"}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

function SummaryCard({ icon: Icon, title, value, suffix, color, bg, border }) {
  return (
    <div className={`p-4 rounded-2xl border ${bg} ${border} flex items-center gap-3 transition-transform hover:-translate-y-0.5 duration-200`}>
      <div className={`p-3 rounded-xl bg-white/80 ${color} shadow-sm shrink-0`}><Icon size={20} strokeWidth={2.5} /></div>
      <div className="min-w-0 flex-1">
        <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-500/80 mb-0.5 truncate">{title}</h3>
        <div className="flex items-baseline gap-1 flex-wrap">
          <span className={`text-[15px] xl:text-[17px] font-black ${color}`}>{value}</span>
          {suffix && <span className="text-[10px] font-bold text-gray-400">{suffix}</span>}
        </div>
      </div>
    </div>
  );
}

function MiniCard({ label, value, color, bg }) {
  return (
    <div className={`${bg} rounded-xl px-4 py-2.5`}>
      <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">{label}</div>
      <div className={`text-sm font-black ${color}`}>{value}</div>
    </div>
  );
}

function PaymentBadge({ isPaid }) {
  if (isPaid) return <span className="inline-flex items-center gap-1 text-[10px] font-bold text-teal-700 bg-teal-50 border border-teal-100 px-2 py-0.5 rounded-full whitespace-nowrap"><CheckCircle2 size={10} /> To'liq</span>;
  return <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-500 bg-red-50 border border-red-100 px-2 py-0.5 rounded-full whitespace-nowrap"><Clock size={10} /> Qarzdor</span>;
}