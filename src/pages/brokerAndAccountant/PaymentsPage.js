import React, { useEffect, useState, useCallback } from 'react';
import { Search, X, Wallet, CreditCard, Landmark, Loader2, ArrowDownRight, ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
import { paymentService } from '../../services/paymentService'; 

export default function PaymentsPage() {
  const [debts, setDebts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Pagination statelari
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const size = 12; // Bir sahifada nechta ko'rinishi

  const [paymentModal, setPaymentModal] = useState({ isOpen: false, farmer: null });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [form, setForm] = useState({
    amount: "", method: "CASH", transactionType: "PAYMENT", receiptNumber: "", comment: ""
  });

  // ✨ YANGILANDI: useCallback orqali xotirada saqlanadi, warning yo'qoladi
  const fetchDebts = useCallback(async () => {
    try {
      setLoading(true);
      const data = await paymentService.getDebts(searchTerm, page, size);
      
      setDebts(data.content || []);
      setTotalPages(data.totalPages || 0);
      setTotalElements(data.totalElements || 0);
    } catch (error) {
      console.error("Qarzlarni yuklashda xatolik:", error);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, page, size]);

  // ✨ YANGILANDI: useEffect faqat fetchDebts ni kuzatadi
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchDebts();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [fetchDebts]); 

  // Qidiruv so'zi o'zgarganda sahifani 1-betga (0 ga) qaytarish
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setPage(0);
  };

  const handlePaymentSubmit = async (e) => {
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
        comment: form.comment
      });

      alert("To'lov muvaffaqiyatli saqlandi!");
      setPaymentModal({ isOpen: false, farmer: null });
      setForm({ amount: "", method: "CASH", transactionType: "PAYMENT", receiptNumber: "", comment: "" });
      fetchDebts(); // Yangilash
    } catch (error) {
      alert(error.message || "Xatolik yuz berdi");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 w-full max-w-[1600px] mx-auto min-h-screen flex flex-col relative">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-1 block">Moliya va Kassa</span>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 font-['Syne',sans-serif] tracking-tight">
            Qarzdorliklar <span className="text-sm font-normal text-gray-400">({totalElements} ta)</span>
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text" placeholder="Fermerni izlash..." 
              value={searchTerm}
              onChange={handleSearchChange}
              className="pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-full text-sm focus:outline-none focus:border-gray-400 transition-all w-full md:w-[260px]"
            />
          </div>
        </div>
      </div>

      {/* ASOSIY KONTENT */}
      {loading && debts.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      ) : debts.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-gray-300 p-12 text-center rounded-xl bg-gray-50/50">
          <Wallet size={48} className="text-gray-300 mb-3" />
          <p className="text-gray-900 font-medium mb-1 font-['Syne']">Natija topilmadi</p>
          <p className="text-sm text-gray-500">Hech qanday qarzdorlik mavjud emas.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
            {debts.map((item) => (
              <div key={item.id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:border-gray-400 transition-all duration-200 flex flex-col overflow-hidden">
                <div className="p-5 border-b border-gray-50">
                  <div className="flex items-center justify-between mb-1">
                    <h2 className="text-lg font-bold text-gray-900 font-['Syne'] truncate pr-2">
                      {item.farmer?.user?.name} {item.farmer?.user?.surname}
                    </h2>
                  </div>
                  <p className="text-xs text-gray-500 font-medium">{item.farmer?.user?.phone || "Telefon kiritilmagan"}</p>
                </div>
                
                <div className="p-5 bg-red-50/30 flex flex-col items-center justify-center py-6">
                  <span className="text-[10px] text-red-500 font-bold uppercase tracking-wider mb-1">Bizning qarzdorligimiz</span>
                  <span className="text-2xl font-bold text-gray-900 font-['DM_Mono']">
                    {item.balance?.toLocaleString()} <span className="text-sm font-normal text-gray-500">UZS</span>
                  </span>
                </div>

                <div className="p-3 bg-white mt-auto">
                  <button 
                    onClick={() => setPaymentModal({ isOpen: true, farmer: item })}
                    className="w-full py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-black transition-colors"
                  >
                    To'lov qilish
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* PAGINATION TUGMALARI */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-auto pt-6 pb-4">
              <button 
                disabled={page === 0} 
                onClick={() => setPage(p => p - 1)}
                className="p-2 border border-gray-200 rounded-full hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-transparent"
              >
                <ChevronLeft size={20} className="text-gray-600" />
              </button>
              
              <span className="text-sm font-medium text-gray-600">
                Sahifa <span className="font-bold text-gray-900">{page + 1}</span> / {totalPages}
              </span>

              <button 
                disabled={page >= totalPages - 1} 
                onClick={() => setPage(p => p + 1)}
                className="p-2 border border-gray-200 rounded-full hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-transparent"
              >
                <ChevronRight size={20} className="text-gray-600" />
              </button>
            </div>
          )}
        </>
      )}

      {/* TO'LOV MODALI */}
      {paymentModal.isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => !isSubmitting && setPaymentModal({ isOpen: false, farmer: null })} />
          
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            
            {/* Header */}
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900 font-['Syne']">Moliya operatsiyasi</h2>
                <p className="text-xs text-gray-500 mt-0.5">{paymentModal.farmer?.farmer?.user?.name} uchun</p>
              </div>
              <button onClick={() => !isSubmitting && setPaymentModal({ isOpen: false, farmer: null })} className="text-gray-400 hover:text-gray-900"><X size={20} /></button>
            </div>

            <div className="p-5 space-y-5">
              
              {/* Balans Info */}
              <div className="flex justify-between items-center p-4 bg-gray-50 border border-gray-200 rounded-xl">
                <span className="text-xs font-bold text-gray-500 uppercase">Qarz miqdori:</span>
                <span className="text-lg font-bold text-red-600 font-['DM_Mono']">{paymentModal.farmer?.balance?.toLocaleString()} so'm</span>
              </div>

              <form id="paymentForm" className="space-y-4" onSubmit={handlePaymentSubmit}>
                
                {/* Tranzaksiya Turi */}
                <div className="flex p-1 bg-gray-100 rounded-lg">
                  <button type="button" onClick={() => setForm({...form, transactionType: "PAYMENT"})} className={`flex-1 py-2 text-xs font-bold rounded-md flex items-center justify-center gap-1.5 transition-all ${form.transactionType === "PAYMENT" ? "bg-white text-gray-900 shadow-sm" : "text-gray-400"}`}>
                    <ArrowUpRight size={14} className={form.transactionType === "PAYMENT" ? "text-red-500" : ""} /> Chiqim (To'lov)
                  </button>
                  <button type="button" onClick={() => setForm({...form, transactionType: "REFUND"})} className={`flex-1 py-2 text-xs font-bold rounded-md flex items-center justify-center gap-1.5 transition-all ${form.transactionType === "REFUND" ? "bg-white text-gray-900 shadow-sm" : "text-gray-400"}`}>
                    <ArrowDownRight size={14} className={form.transactionType === "REFUND" ? "text-green-500" : ""} /> Kirim (Qaytim)
                  </button>
                </div>

                {/* To'lov usuli */}
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">To'lov usuli *</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'CASH', icon: Wallet, label: 'Naqd' },
                      { id: 'CARD', icon: CreditCard, label: 'Karta' },
                      { id: 'BANK_TRANSFER', icon: Landmark, label: 'Bank' }
                    ].map(t => (
                      <div 
                        key={t.id} 
                        onClick={() => setForm({...form, method: t.id})}
                        className={`cursor-pointer p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${form.method === t.id ? "border-gray-900 bg-gray-50 text-gray-900" : "border-gray-200 text-gray-400 hover:border-gray-300"}`}
                      >
                        <t.icon size={18} />
                        <span className="text-[10px] font-bold">{t.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Summa */}
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Summa (UZS) *</label>
                  <div className="relative">
                    <input
                      required type="number" min="1"
                      value={form.amount} 
                      onChange={(e) => setForm({ ...form, amount: e.target.value })}
                      placeholder="0"
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-xl font-bold font-['DM_Mono'] focus:outline-none focus:border-gray-900 pr-16"
                    />
                    {form.transactionType === "PAYMENT" && (
                      <button 
                        type="button" 
                        onClick={() => setForm({...form, amount: paymentModal.farmer?.balance})} 
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold bg-gray-200 text-gray-700 px-2.5 py-1.5 rounded-md hover:bg-gray-300 transition-colors"
                      >
                        TO'LIQ
                      </button>
                    )}
                  </div>
                </div>

                {/* Kvitansiya & Izoh */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Kvitansiya raqami</label>
                    <input type="text" placeholder="Ixtiyoriy" value={form.receiptNumber} onChange={(e) => setForm({...form, receiptNumber: e.target.value})} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gray-900" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Izoh</label>
                    <input type="text" placeholder="Ixtiyoriy" value={form.comment} onChange={(e) => setForm({...form, comment: e.target.value})} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gray-900" />
                  </div>
                </div>

              </form>
            </div>

            {/* Footer */}
            <div className="p-5 border-t border-gray-100 flex gap-3">
              <button disabled={isSubmitting} onClick={() => setPaymentModal({ isOpen: false, farmer: null })} className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm font-bold hover:bg-gray-50 transition-colors">Bekor qilish</button>
              <button type="submit" form="paymentForm" disabled={isSubmitting || !form.amount} className="flex-1 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-bold hover:bg-black transition-colors flex items-center justify-center gap-2">
                {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : "Tasdiqlash"}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}