import React, { useState, useEffect, useCallback } from 'react';
import {
  Search, ChevronLeft, ChevronRight, Loader2, RefreshCcw, Apple, Scale,
  DollarSign, List, ChevronDown, ChevronUp, Printer, Calendar, Download,
  X, XCircle, Package, AlertTriangle, Filter
} from 'lucide-react';
import cropService from '../../services/cropService';

const StatusBadge = ({ status }) => {
  if (status === 'CANCELLED')
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-50 text-red-600 text-[10px] font-bold rounded-full border border-red-200">
        <X size={10} /> Bekor
      </span>
    );
  if (status === 'CORRECTED')
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-700 text-[10px] font-bold rounded-full border border-amber-200">
        ✦ Tuzatilgan
      </span>
    );
  return null;
};

const MODAL_CONFIG = {
  cancel: { title: 'Tranzaksiyani bekor qilish', btn: 'Ha, bekor qilish', color: '#DC2626', bg: 'bg-red-50', icon: XCircle, iconCls: 'text-red-600', hdCls: 'text-red-800' },
  editQuantity: { title: 'Savat sonini tahrirlash', btn: 'Saqlash', color: '#D97706', bg: 'bg-amber-50', icon: Package, iconCls: 'text-amber-600', hdCls: 'text-amber-800' },
};

export default function ReceiveHistoryPage() {
  const [groups, setGroups] = useState([]);
  const [fruitTypes, setFruitTypes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [accordionState, setAccordionState] = useState({});
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 15;

  // ── Filtr State'lari ──────────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedFruit, setSelectedFruit] = useState('');

  // ── Modal State ───────────────────────────────────────────────────────────
  const [modal, setModal] = useState({ isOpen: false, type: null, tx: null, farmerId: null });
  const [form, setForm] = useState({ reason: '', newBasketCount: 0 });
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState('');
  const [maxAllowed, setMaxAllowed] = useState(null); 

  // Meva turlarini yuklash
  useEffect(() => {
    cropService.getFruitTypes().then(setFruitTypes).catch(console.error);
  }, []);

  // Qidiruv uchun debouncer
  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(searchQuery); setCurrentPage(0); }, 400);
    return () => clearTimeout(t);
  }, [searchQuery]);

  // Har safar filtrlar yoki page o'zgarganda yuklash
  useEffect(() => { 
    fetchGroups(currentPage, debouncedSearch, startDate, endDate, selectedFruit); 
  }, [currentPage, debouncedSearch, startDate, endDate, selectedFruit]);

  const fetchGroups = async (page, search, start, end, fruit) => {
    setIsLoading(true);
    setAccordionState({});
    try {
      // 🟢 YANGLIK: Oddiy getGroupedHistory o'rniga Hisobot API siga murojaat qilamiz
      const data = await cropService.getReportsGrouped(start, end, search, page, pageSize, fruit);
      setGroups(data.content || []);
      setTotalPages(data.totalPages || 1);
    } catch { 
      setGroups([]); 
    } finally { 
      setIsLoading(false); 
    }
  };

  const loadDetails = (farmerId) => {
    // 🟢 YANGLIK: Detallar uchun ham Hisobot API siga murojaat qilamiz, shunda filtrlarga tushganlari chiqadi
    cropService.getReportsDetails(farmerId, startDate, endDate, selectedFruit)
      .then(res => {
        // Backend'dagi javob { transactions: [], periodEarned: ..., ... } formatida
        const txs = res.transactions || [];
        setAccordionState(s => ({ ...s, [farmerId]: { isOpen: true, details: txs, isLoadingDetails: false } }));
      })
      .catch(() => setAccordionState(s => ({ ...s, [farmerId]: { isOpen: true, details: [], isLoadingDetails: false } })));
  };

  const toggleRow = useCallback(async (farmerId) => {
    setAccordionState(prev => {
      const cur = prev[farmerId];
      if (cur?.isOpen) return { ...prev, [farmerId]: { ...cur, isOpen: false } };
      if (cur?.details) return { ...prev, [farmerId]: { ...cur, isOpen: true } };
      loadDetails(farmerId);
      return { ...prev, [farmerId]: { isOpen: true, details: null, isLoadingDetails: true } };
    });
  }, [startDate, endDate, selectedFruit]); // Filtrlar o'zgarganda qayta chaqirishi uchun

  // ── Excel Yuklash ─────────────────────────────────────────────────────────
  const handleExportExcel = async () => {
    setIsExporting(true);
    try {
      const blobData = await cropService.downloadExcelReport(startDate, endDate, debouncedSearch, selectedFruit);
      const url = window.URL.createObjectURL(new Blob([blobData]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Qabul_Hisobot_${startDate || 'all'}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (e) {
      alert("Excel yuklashda xatolik yuz berdi");
    } finally {
      setIsExporting(false);
    }
  };

  // ── Modal handlers ────────────────────────────────────────────────────────
  const openModal = async (type, tx, farmerId, e) => {
    e.stopPropagation();
    setModal({ isOpen: true, type, tx, farmerId });
    setForm({ reason: '', newBasketCount: tx.basketCount || 0 });
    setModalError('');
    setMaxAllowed(null);

    if (type === 'editQuantity') {
      setModalLoading(true);
      try {
        const max = await cropService.getMaxAllowedBaskets(tx.id);
        setMaxAllowed(max);
      } catch (err) {
        setModalError("Maksimal savat sonini yuklab bo'lmadi.");
      } finally {
        setModalLoading(false);
      }
    }
  };

  const closeModal = () => {
    setModal({ isOpen: false, type: null, tx: null, farmerId: null });
    setModalLoading(false);
    setModalError('');
    setMaxAllowed(null);
  };

  const refreshFarmer = (farmerId) => {
    setAccordionState(prev => ({ ...prev, [farmerId]: { ...prev[farmerId], details: null, isLoadingDetails: true } }));
    loadDetails(farmerId);
    fetchGroups(currentPage, debouncedSearch, startDate, endDate, selectedFruit);
  };

  const handleSubmit = async () => {
    if (!form.reason.trim()) { setModalError("Sabab maydoni to'ldirilishi shart!"); return; }
    setModalLoading(true);
    setModalError('');
    try {
      const { type, tx, farmerId } = modal;
      if (type === 'cancel') {
        await cropService.cancelTransaction(tx.id, form.reason);
      } else if (type === 'editQuantity') {
        const cnt = parseInt(form.newBasketCount);
        if (!cnt || cnt <= 0) { setModalError('Yangi savatlar sonini to\'g\'ri kiriting!'); setModalLoading(false); return; }
        if (cnt === tx.basketCount) { setModalError('Savat soni o\'zgarmadi!'); setModalLoading(false); return; }
        
        await cropService.correctTransactionQuantity(tx.id, cnt, form.reason);
      }
      refreshFarmer(farmerId);
      closeModal();
    } catch (err) {
      setModalError(err?.response?.data?.message || err?.message || 'Server xatoligi!');
    } finally { setModalLoading(false); }
  };

  const preview = (() => {
    if (modal.type !== 'editQuantity') return null;
    const tx = modal.tx;
    const newCount = parseInt(form.newBasketCount) || 0;
    
    if (!tx?.basketCount || newCount <= 0 || newCount === tx.basketCount) return null;
    
    const taraPerBsk = tx.basketCount > 0 ? tx.taraWeight / tx.basketCount : 0;
    const newTara = +(taraPerBsk * newCount).toFixed(1);
    const avgGross = tx.grossWeight / tx.basketCount;
    const newGross = +(avgGross * newCount).toFixed(1);
    const newNet = +(newGross - newTara).toFixed(1);
    const newTotal = Math.round(newNet * tx.unitPrice);
    
    return { newCount, newTara, newGross, newNet, newTotal, diff: newTotal - tx.totalAmount };
  })();

  const formatDate = (ds) => {
    if (!ds) return '-';
    const d = new Date(ds);
    return `${d.toLocaleTimeString('uz-UZ',{hour:'2-digit',minute:'2-digit',hour12:false})}, ${d.toLocaleDateString('uz-UZ',{day:'2-digit',month:'2-digit',year:'numeric'})}`;
  };

  const handleDownloadReceipt = async (id, e) => {
    e.stopPropagation();
    try {
      const blob = await cropService.downloadReceipt(id);
      const url = window.URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url; a.setAttribute('download', `Kvitansiya_${id}.pdf`);
      document.body.appendChild(a); a.click(); a.remove();
      window.URL.revokeObjectURL(url);
    } catch { alert('Chekni yuklab olishda xato.'); }
  };

  const cfg = modal.type ? MODAL_CONFIG[modal.type] : null;

  return (
    <div className="p-3 md:p-6 max-w-7xl mx-auto pb-10">
      
      {/* ── HEADER ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-[#0B1A42] flex items-center gap-2">
            Oraliq Hisobot <span className="text-gray-300">|</span> Qabul Tarixi
          </h1>
          <p className="text-xs md:text-sm text-gray-500 mt-1">Fermerlardan qabul qilingan mahsulotlarning oraliq hisoboti</p>
        </div>
      </div>

      {/* ── FILTERLAR (Sana, Meva, Qidiruv, Excel) ─────────────────────────── */}
      <div className="bg-white p-3 md:p-4 rounded-xl border border-gray-200 shadow-sm mb-6 flex flex-wrap gap-3 items-center justify-between">
        
        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
          {/* Qidiruv */}
          <div className="relative w-full sm:w-[240px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input type="text" placeholder="F.I.O yoki telefon..."
              value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#14A44D]/20 focus:border-[#14A44D] transition-all font-medium" />
          </div>

          {/* Sana oralig'i */}
          <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg p-0.5 px-2 focus-within:border-[#14A44D] transition-colors flex-1 sm:flex-none">
            <Calendar size={16} className="text-gray-400 mr-1" />
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="bg-transparent border-none outline-none font-bold text-gray-700 text-sm py-2 cursor-pointer w-[120px]" />
            <span className="text-gray-300 mx-1">–</span>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="bg-transparent border-none outline-none font-bold text-gray-700 text-sm py-2 cursor-pointer w-[120px]" />
            {(startDate || endDate) && (
              <button onClick={() => { setStartDate(''); setEndDate(''); }} className="ml-2 p-1 text-red-400 hover:bg-red-50 rounded transition-colors"><X size={14}/></button>
            )}
          </div>

          {/* Meva Filtri */}
          <div className="relative flex-1 sm:flex-none">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <select value={selectedFruit} onChange={(e) => setSelectedFruit(e.target.value)}
              className="w-full sm:w-[160px] pl-9 pr-8 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#14A44D]/20 focus:border-[#14A44D] appearance-none cursor-pointer">
              <option value="">Barcha mevalar</option>
              {fruitTypes.map(f => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Tugmalar (Excel va Yangilash) */}
        <div className="flex items-center gap-2 w-full xl:w-auto mt-2 xl:mt-0">
          <button onClick={handleExportExcel} disabled={isLoading || isExporting}
            className="flex-1 xl:flex-none items-center justify-center gap-2 px-4 py-2.5 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-lg text-sm font-bold shadow-sm hover:bg-emerald-100 active:scale-95 transition-all flex disabled:opacity-50">
            {isExporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />} Excel
          </button>
          
          <button onClick={() => fetchGroups(currentPage, debouncedSearch, startDate, endDate, selectedFruit)} disabled={isLoading}
            className="flex-1 xl:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-600 rounded-lg text-sm font-bold shadow-sm hover:bg-gray-50 active:scale-95 transition-all disabled:opacity-50">
            <RefreshCcw size={16} className={isLoading ? "animate-spin" : ""} /> Yangilash
          </button>
        </div>

      </div>

      {/* ── ASOSIY JADVAL ──────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden w-full">
        <div className="overflow-x-auto w-full scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
          <table className="w-full text-left border-collapse min-w-[700px] md:min-w-[900px]">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-200 text-gray-500 text-[12px] md:text-[13px] font-bold tracking-wider">
                <th className="p-3 pl-4 md:pl-6 w-10"></th>
                <th className="p-3 whitespace-nowrap">Fermer</th>
                <th className="p-3 whitespace-nowrap">Sof Vazn</th>
                <th className="p-3 whitespace-nowrap">Summa</th>
                <th className="p-3 text-center whitespace-nowrap">Ishlatilgan Savatlar</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan="5" className="p-16 text-center text-gray-400">
                  <Loader2 className="animate-spin mx-auto mb-3 text-[#14A44D]" size={32} />
                  <p className="font-medium text-sm">Hisobot tayyorlanmoqda...</p>
                </td></tr>
              ) : groups.length === 0 ? (
                <tr><td colSpan="5" className="p-16 text-center text-gray-400">
                  <div className="flex flex-col items-center">
                    <List size={40} className="mb-3 text-gray-300" />
                    <p className="font-medium text-sm">Hech qanday ma'lumot topilmadi.</p>
                  </div>
                </td></tr>
              ) : groups.map((group) => {
                const acc = accordionState[group.farmerId] || {};
                const isOpen = !!acc.isOpen;
                return (
                  <React.Fragment key={group.farmerId}>
                    {/* Fermer qatori */}
                    <tr onClick={() => toggleRow(group.farmerId)}
                      className={`border-b cursor-pointer transition-colors ${isOpen ? 'bg-emerald-50/40 border-emerald-100' : 'border-gray-100 hover:bg-gray-50'}`}>
                      <td className="p-3 pl-4 md:pl-6">
                        <button className={`p-1.5 rounded-md transition-colors ${isOpen ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-400'}`}>
                          {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        <div className="font-bold text-[#0B1A42] text-[14px] md:text-[15px]">{group.farmerFullName}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{group.farmerPhone}</div>
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 md:gap-2">
                          <Scale size={15} className="text-[#14A44D]" />
                          <span className="text-base md:text-lg font-black text-[#14A44D]">
                            {group.totalNetWeight?.toLocaleString()} <span className="text-xs text-gray-400 font-bold">kg</span>
                          </span>
                        </div>
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <div className="p-1 bg-blue-50 text-blue-600 rounded"><DollarSign size={14} /></div>
                          <span className="font-black text-[#0B1A42] text-[15px] md:text-[16px]">{group.totalAmount?.toLocaleString()} <span className="text-xs md:text-sm">UZS</span></span>
                        </div>
                      </td>
                      <td className="p-3 text-center whitespace-nowrap">
                        <div className="inline-flex flex-col items-center">
                          <span className="text-[12px] font-extrabold bg-gray-100 text-gray-600 px-2 py-1 rounded-md">{group.totalBaskets?.toLocaleString()} ta</span>
                          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1">Savat</span>
                        </div>
                      </td>
                    </tr>

                    {/* Tranzaksiyalar Accordion */}
                    {isOpen && (
                      <tr className="bg-gray-50/50 border-b border-gray-200">
                        <td colSpan="5" className="p-0">
                          <div className="p-2 md:p-4 md:pl-16 pr-2 md:pr-6 py-4">
                            <div className="bg-white border border-emerald-100 rounded-lg overflow-x-auto shadow-sm">
                              {acc.isLoadingDetails ? (
                                <div className="p-6 text-center text-gray-400">
                                  <Loader2 className="animate-spin mx-auto text-[#14A44D]" size={20} />
                                </div>
                              ) : (
                                <table className="w-full text-left border-collapse min-w-[700px]">
                                  <thead>
                                    <tr className="bg-emerald-50/50 text-emerald-800 text-[10px] font-bold uppercase tracking-wider border-b border-emerald-100">
                                      <th className="p-2.5 pl-4 whitespace-nowrap">Sana</th>
                                      <th className="p-2.5 whitespace-nowrap">Meva</th>
                                      <th className="p-2.5 whitespace-nowrap">Sof Vazn</th>
                                      <th className="p-2.5 whitespace-nowrap">Brutto/Tara</th>
                                      <th className="p-2.5 whitespace-nowrap">Summa</th>
                                      <th className="p-2.5 whitespace-nowrap">Savat</th>
                                      <th className="p-2.5 text-center whitespace-nowrap">Holat</th>
                                      <th className="p-2.5 text-center whitespace-nowrap">Amallar</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {(acc.details || []).map((item, idx) => {
                                      const cancelled = item.status === 'CANCELLED';
                                      return (
                                        <tr key={item.id || idx} className={`border-b border-gray-50 transition-colors ${cancelled ? 'bg-red-50/20 opacity-60' : 'hover:bg-gray-50/50'}`}>
                                          <td className="p-2.5 pl-4 text-xs text-gray-500 font-medium whitespace-nowrap">{formatDate(item.createdAt)}</td>
                                          <td className="p-2.5 whitespace-nowrap">
                                            <div className="flex items-center gap-1.5 md:gap-2">
                                              <Apple size={14} className="text-orange-500 flex-shrink-0" />
                                              <div>
                                                <div className={`font-semibold text-xs ${cancelled ? 'line-through text-gray-400' : 'text-gray-800'}`}>{item.fruitName}</div>
                                                <div className="text-[10px] font-bold text-gray-400 mt-0.5">{item.unitPrice?.toLocaleString()} so'm</div>
                                              </div>
                                            </div>
                                          </td>
                                          <td className="p-2.5 whitespace-nowrap">
                                            <span className={`font-bold text-sm ${cancelled ? 'line-through text-gray-400' : 'text-emerald-600'}`}>{item.netWeight} kg</span>
                                          </td>
                                          <td className="p-2.5 text-[11px] text-gray-500 whitespace-nowrap">
                                            <div>B: {item.grossWeight} kg</div>
                                            <div>T: {item.taraWeight} kg</div>
                                          </td>
                                          <td className="p-2.5 whitespace-nowrap">
                                            <div className={`font-bold text-[13px] md:text-sm ${cancelled ? 'line-through text-gray-400' : 'text-[#0B1A42]'}`}>
                                              {item.totalAmount?.toLocaleString()} so'm
                                            </div>
                                          </td>
                                          <td className="p-2.5 whitespace-nowrap">
                                            {item.basketCount > 0 ? (
                                              <div className="flex items-center gap-1 text-xs">
                                                <span className="font-bold text-gray-600">{item.basketCount}x</span>
                                                <span className="text-gray-400 truncate max-w-[80px]">{item.basketName}</span>
                                              </div>
                                            ) : <span className="text-gray-300">—</span>}
                                          </td>
                                          <td className="p-2.5 text-center whitespace-nowrap">
                                            <StatusBadge status={item.status} />
                                          </td>
                                          <td className="p-2.5 whitespace-nowrap">
                                            <div className="flex items-center justify-center gap-1">
                                              <button onClick={(e) => handleDownloadReceipt(item.id, e)} className="p-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white rounded-lg transition-colors border border-emerald-100">
                                                <Printer size={14} />
                                              </button>
                                              {!cancelled && (
                                                <>
                                                  {item.basketCount > 0 && (
                                                    <button onClick={(e) => openModal('editQuantity', item, group.farmerId, e)} title="Savat sonini tahrirlash" className="p-1.5 bg-amber-50 text-amber-600 hover:bg-amber-600 hover:text-white rounded-lg transition-colors border border-amber-100">
                                                      <Package size={14} />
                                                    </button>
                                                  )}
                                                  <button onClick={(e) => openModal('cancel', item, group.farmerId, e)} title="Tranzaksiyani bekor qilish" className="p-1.5 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-lg transition-colors border border-red-100">
                                                    <XCircle size={14} />
                                                  </button>
                                                </>
                                              )}
                                            </div>
                                          </td>
                                        </tr>
                                      );
                                    })}
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
              })}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {!isLoading && totalPages > 1 && (
          <div className="p-4 border-t border-gray-200 flex items-center justify-between bg-gray-50">
            <span className="text-sm text-gray-500 font-medium">Sahifa {currentPage + 1} / {totalPages}</span>
            <div className="flex gap-2">
              <button onClick={() => setCurrentPage(p => Math.max(0, p - 1))} disabled={currentPage === 0}
                className="p-2 border border-gray-200 bg-white rounded-lg text-gray-600 hover:bg-gray-100 disabled:opacity-50 transition-colors">
                <ChevronLeft size={18} />
              </button>
              <button onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))} disabled={currentPage === totalPages - 1}
                className="p-2 border border-gray-200 bg-white rounded-lg text-gray-600 hover:bg-gray-100 disabled:opacity-50 transition-colors">
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── ACTION MODAL ─────────────────────────────────────────────────────── */}
      {modal.isOpen && cfg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={closeModal}>
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-md overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className={`p-4 md:p-5 border-b border-gray-100 flex items-center justify-between ${cfg.bg}`}>
              <div className="flex items-center gap-3">
                <cfg.icon size={20} className={cfg.iconCls} />
                <h3 className={`font-bold text-[14px] md:text-[15px] ${cfg.hdCls}`}>{cfg.title}</h3>
              </div>
              <button onClick={closeModal} className="p-1.5 hover:bg-black/10 rounded-lg transition-colors"><X size={18} className="text-gray-500" /></button>
            </div>

            <div className="p-4 md:p-5 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 text-[12px] md:text-[13px] space-y-1.5">
                <div className="flex justify-between"><span className="text-gray-500">Meva:</span><span className="font-bold text-gray-800">{modal.tx?.fruitName}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Sof vazn:</span><span className="font-bold text-emerald-600">{modal.tx?.netWeight} kg</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Joriy summa:</span><span className="font-bold text-[#0B1A42]">{modal.tx?.totalAmount?.toLocaleString()} so'm</span></div>
              </div>

              {modal.type === 'cancel' && (
                <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-100 rounded-xl">
                  <AlertTriangle size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
                  <p className="text-[12px] md:text-[13px] text-red-700 leading-relaxed">
                    Bu amal moliyaviy balans, ombor va savat qarzini <strong>avtomatik qaytaradi</strong>. Amal qaytarib bo'lmaydi.
                  </p>
                </div>
              )}

              {modal.type === 'editQuantity' && (
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-[10px] md:text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                        Yangi savat sonini kiriting
                      </label>
                      {maxAllowed !== null && (
                        <span className="text-[10px] md:text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                          Maksimal: {maxAllowed} ta
                        </span>
                      )}
                    </div>
                    
                    <input 
                      type="number" min={1} max={maxAllowed || ''} disabled={modalLoading}
                      value={form.newBasketCount}
                      onChange={(e) => {
                        let val = parseInt(e.target.value);
                        if (isNaN(val)) val = '';
                        if (maxAllowed !== null && val > maxAllowed) val = maxAllowed;
                        setForm(f => ({ ...f, newBasketCount: val }));
                      }}
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm font-bold focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400 disabled:bg-gray-100 disabled:text-gray-400 transition-all" 
                    />
                  </div>

                  {preview && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-[11px] md:text-[12px] space-y-1.5">
                      <div className="text-[9px] md:text-[10px] font-bold text-amber-700 uppercase tracking-wider mb-1.5">Qayta hisoblangan natija</div>
                      <div className="flex justify-between text-amber-800"><span>Yangi sof vazn:</span><span className="font-bold">{preview.newNet} kg</span></div>
                      <div className="flex justify-between text-amber-800"><span>Yangi brutto / tara:</span><span className="font-bold">{preview.newGross} / {preview.newTara} kg</span></div>
                      <div className="flex justify-between border-t border-amber-200 pt-1.5 mt-1 text-amber-900"><span>Yangi summa:</span><span className="font-bold">{preview.newTotal?.toLocaleString()} so'm</span></div>
                      <div className="flex justify-between text-amber-900"><span>O'zgarish:</span><span className={`font-black ${preview.diff < 0 ? 'text-red-600' : 'text-emerald-600'}`}>{preview.diff > 0 ? '+' : ''}{preview.diff?.toLocaleString()} so'm</span></div>
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="text-[10px] md:text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Sabab *</label>
                <textarea value={form.reason} onChange={(e) => setForm(f => ({ ...f, reason: e.target.value }))}
                  placeholder="Nima uchun bu o'zgartirish qilinmoqda?..." rows={2}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-400 transition-all" />
              </div>

              {modalError && (
                <div className="flex items-start gap-2 p-2.5 bg-red-50 border border-red-100 rounded-lg text-[12px] md:text-[13px] text-red-700">
                  <AlertTriangle size={15} className="flex-shrink-0 mt-0.5" />
                  <span>{modalError}</span>
                </div>
              )}
            </div>

            <div className="p-4 md:p-5 pt-0 flex gap-3">
              <button onClick={closeModal} disabled={modalLoading} className="flex-1 py-2 md:py-2.5 border border-gray-200 text-gray-600 font-bold text-sm rounded-lg hover:bg-gray-50 transition-all disabled:opacity-50">
                Yopish
              </button>
              <button onClick={handleSubmit} disabled={modalLoading || !form.reason.trim()} style={{ backgroundColor: (!form.reason.trim() || modalLoading) ? '#9CA3AF' : cfg.color }}
                className="flex-1 py-2 md:py-2.5 text-white font-bold text-sm rounded-lg transition-all flex items-center justify-center gap-2 disabled:cursor-not-allowed">
                {modalLoading && <Loader2 size={15} className="animate-spin" />} {cfg.btn}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}