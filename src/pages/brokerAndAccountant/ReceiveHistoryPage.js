import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Search, ChevronLeft, ChevronRight, Loader2, RefreshCcw, Apple, Scale,
  DollarSign, List, ChevronDown, ChevronUp, Printer, Calendar, Download,
  X, XCircle, Package, AlertTriangle, Filter, CheckCircle
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

  // ── Filtr State'lari (Default Bugun) ──────────────────────────────────────
  const todayISO = useMemo(() => new Date().toISOString().split('T')[0], []);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [startDate, setStartDate] = useState(todayISO);
  const [endDate, setEndDate] = useState(todayISO);
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
      const data = await cropService.getReportsGrouped(start, end, search, page, pageSize, fruit);
      setGroups(data.content || []);
      setTotalPages(data.totalPages || 1);
    } catch { 
      setGroups([]); 
    } finally { 
      setIsLoading(false); 
    }
  };

  const loadDetails = useCallback((farmerId) => {
    cropService.getReportsDetails(farmerId, startDate, endDate, selectedFruit)
      .then(res => {
        const txs = res.transactions || [];
        setAccordionState(s => ({ ...s, [farmerId]: { isOpen: true, details: txs, isLoadingDetails: false } }));
      })
      .catch(() => setAccordionState(s => ({ ...s, [farmerId]: { isOpen: true, details: [], isLoadingDetails: false } })));
  }, [startDate, endDate, selectedFruit]);

  const toggleRow = useCallback(async (farmerId) => {
    setAccordionState(prev => {
      const cur = prev[farmerId];
      if (cur?.isOpen) return { ...prev, [farmerId]: { ...cur, isOpen: false } };
      if (cur?.details) return { ...prev, [farmerId]: { ...cur, isOpen: true } };
      loadDetails(farmerId);
      return { ...prev, [farmerId]: { isOpen: true, details: null, isLoadingDetails: true } };
    });
  }, [loadDetails]); // 🟢 react-hooks/exhaustive-deps xatosi tuzatildi

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
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto min-h-screen bg-[#F8FAFC]">
      
      {/* ── HEADER ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0B1A42] tracking-tight flex items-center gap-2">
            Oraliq Hisobot <span className="text-gray-300 font-light">|</span> Qabul Tarixi
          </h1>
          <p className="text-sm text-gray-500 mt-1">Fermerlardan qabul qilingan mahsulotlarning oraliq hisoboti</p>
        </div>
      </div>

      {/* ── FILTERLAR (Sana, Meva, Qidiruv, Excel) ─────────────────────────── */}
      <div className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm mb-6 flex flex-col xl:flex-row gap-3 items-center justify-between">
        
        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
          {/* Qidiruv */}
          <div className="relative w-full sm:w-[260px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input type="text" placeholder="F.I.O yoki telefon..."
              value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium placeholder-gray-400" />
          </div>

          {/* Sana oralig'i */}
          <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl p-1 px-3 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all w-full sm:w-auto">
            <Calendar size={16} className="text-gray-400 mr-2" />
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="bg-transparent border-none outline-none font-bold text-gray-700 text-sm py-1.5 cursor-pointer flex-1 sm:flex-none sm:w-[125px]" />
            <span className="text-gray-300 mx-2">–</span>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="bg-transparent border-none outline-none font-bold text-gray-700 text-sm py-1.5 cursor-pointer flex-1 sm:flex-none sm:w-[125px]" />
            {(startDate || endDate) && (
              <button onClick={() => { setStartDate(''); setEndDate(''); }} className="ml-2 p-1 text-red-400 hover:bg-red-50 hover:text-red-500 rounded-md transition-colors"><X size={14}/></button>
            )}
          </div>

          {/* Meva Filtri */}
          <div className="relative w-full sm:w-[180px]">
            <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <select value={selectedFruit} onChange={(e) => setSelectedFruit(e.target.value)}
              className="w-full pl-10 pr-8 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none cursor-pointer transition-all">
              <option value="">Barcha mevalar</option>
              {fruitTypes.map(f => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Tugmalar (Excel va Yangilash) */}
        <div className="flex items-center gap-3 w-full xl:w-auto mt-2 xl:mt-0">
          <button onClick={handleExportExcel} disabled={isLoading || isExporting}
            className="flex-1 xl:flex-none items-center justify-center gap-2 px-5 py-2.5 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-xl text-sm font-bold hover:bg-emerald-100 active:scale-95 transition-all flex disabled:opacity-50 disabled:active:scale-100">
            {isExporting ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />} Excel
          </button>
          
          <button onClick={() => fetchGroups(currentPage, debouncedSearch, startDate, endDate, selectedFruit)} disabled={isLoading}
            className="flex-1 xl:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-50 active:scale-95 transition-all disabled:opacity-50 disabled:active:scale-100">
            <RefreshCcw size={18} className={isLoading ? "animate-spin" : ""} /> Yangilash
          </button>
        </div>

      </div>

      {/* ── ASOSIY JADVAL ──────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden w-full">
        <div className="overflow-x-auto w-full scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
          <table className="w-full text-left border-collapse min-w-[800px] md:min-w-[1000px]">
            <thead>
              <tr className="bg-slate-50 border-b border-gray-200 text-slate-500 text-[11px] font-black uppercase tracking-wider">
                <th className="p-4 pl-6 w-12 text-center">#</th>
                <th className="p-4">Fermer</th>
                <th className="p-4">Sof Vazn</th>
                <th className="p-4">Summa</th>
                <th className="p-4 text-center">Ishlatilgan Savatlar</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan="5" className="p-20 text-center text-gray-400">
                  <Loader2 className="animate-spin mx-auto mb-4 text-blue-500" size={36} />
                  <p className="font-bold text-sm">Hisobot tayyorlanmoqda...</p>
                </td></tr>
              ) : groups.length === 0 ? (
                <tr><td colSpan="5" className="p-20 text-center text-gray-400">
                  <div className="flex flex-col items-center">
                    <List size={48} className="mb-4 text-gray-300" />
                    <p className="font-bold text-base text-gray-500">Hech qanday ma'lumot topilmadi.</p>
                    <p className="text-sm mt-1">Boshqa sana oralig'i yoki meva tanlab ko'ring.</p>
                  </div>
                </td></tr>
              ) : groups.map((group) => {
                const acc = accordionState[group.farmerId] || {};
                const isOpen = !!acc.isOpen;
                return (
                  <React.Fragment key={group.farmerId}>
                    {/* Fermer qatori */}
                    <tr onClick={() => toggleRow(group.farmerId)}
                      className={`border-b cursor-pointer transition-all duration-200 group ${isOpen ? 'bg-blue-50/30 border-blue-100' : 'border-gray-100 hover:bg-gray-50'}`}>
                      <td className="p-4 pl-6 text-center">
                        <button className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${isOpen ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400 group-hover:bg-gray-200'}`}>
                          {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </button>
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        <div className="font-extrabold text-[#0B1A42] text-[15px]">{group.farmerFullName}</div>
                        <div className="text-xs text-gray-500 font-bold tracking-wide mt-0.5">{group.farmerPhone}</div>
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Scale size={16} className="text-emerald-500" />
                          <span className="text-[17px] font-black text-emerald-600">
                            {group.totalNetWeight?.toLocaleString()} <span className="text-[11px] text-emerald-600/70">kg</span>
                          </span>
                        </div>
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 bg-blue-100 text-blue-600 rounded-lg"><DollarSign size={14} strokeWidth={3} /></div>
                          <span className="font-black text-[#0B1A42] text-[17px]">{group.totalAmount?.toLocaleString()} <span className="text-[11px] text-gray-400">UZS</span></span>
                        </div>
                      </td>
                      <td className="p-4 text-center whitespace-nowrap">
                        <div className="inline-flex flex-col items-center justify-center bg-gray-100 border border-gray-200 px-3 py-1.5 rounded-xl min-w-[80px]">
                          <span className="text-[14px] font-black text-gray-700">{group.totalBaskets?.toLocaleString()} <span className="text-[11px] font-bold">ta</span></span>
                        </div>
                      </td>
                    </tr>

                    {/* Tranzaksiyalar Accordion */}
                    {isOpen && (
                      <tr className="bg-slate-50/80 border-b-2 border-slate-200">
                        <td colSpan="5" className="p-0">
                          <div className="p-4 sm:px-16 py-6">
                            <div className="bg-white border border-gray-200 rounded-xl overflow-x-auto shadow-sm">
                              {acc.isLoadingDetails ? (
                                <div className="p-8 text-center text-gray-400 flex items-center justify-center">
                                  <Loader2 className="animate-spin text-blue-500 mr-3" size={24} />
                                  <span className="font-bold text-sm">Yuklar tortilmoqda...</span>
                                </div>
                              ) : (
                                <table className="w-full text-left border-collapse min-w-[800px]">
                                  <thead>
                                    <tr className="bg-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-wider border-b border-gray-200">
                                      <th className="p-3 pl-5 whitespace-nowrap">Sana</th>
                                      <th className="p-3 whitespace-nowrap">Meva Turi</th>
                                      <th className="p-3 whitespace-nowrap">Sof Vazn</th>
                                      <th className="p-3 whitespace-nowrap">Brutto/Tara</th>
                                      <th className="p-3 whitespace-nowrap text-right">Summa</th>
                                      <th className="p-3 whitespace-nowrap">Savat</th>
                                      <th className="p-3 text-center whitespace-nowrap">Holat</th>
                                      <th className="p-3 text-right pr-5 whitespace-nowrap">Amallar</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {(acc.details || []).map((item, idx) => {
                                      const cancelled = item.status === 'CANCELLED';
                                      return (
                                        <tr key={item.id || idx} className={`border-b border-gray-50 transition-colors ${cancelled ? 'bg-red-50/30' : 'hover:bg-gray-50/80'}`}>
                                          <td className="p-3 pl-5 text-xs text-gray-500 font-bold whitespace-nowrap">{formatDate(item.createdAt)}</td>
                                          <td className="p-3 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${cancelled ? 'bg-gray-200 text-gray-400' : 'bg-orange-100 text-orange-500'}`}>
                                                <Apple size={14} strokeWidth={2.5} />
                                              </div>
                                              <div>
                                                <div className={`font-bold text-[13px] ${cancelled ? 'line-through text-gray-400' : 'text-slate-800'}`}>{item.fruitName}</div>
                                                <div className="text-[10px] font-black text-gray-400 font-mono mt-0.5">{item.unitPrice?.toLocaleString()} so'm</div>
                                              </div>
                                            </div>
                                          </td>
                                          <td className="p-3 whitespace-nowrap">
                                            <span className={`font-black font-mono text-[14px] ${cancelled ? 'line-through text-gray-400' : 'text-emerald-600'}`}>{item.netWeight} kg</span>
                                          </td>
                                          <td className="p-3 text-[11px] font-bold text-gray-400 whitespace-nowrap">
                                            <div>B: {item.grossWeight} kg</div>
                                            <div>T: {item.taraWeight} kg</div>
                                          </td>
                                          <td className="p-3 text-right whitespace-nowrap">
                                            <div className={`font-black font-mono text-[14px] ${cancelled ? 'line-through text-gray-400' : 'text-blue-600'}`}>
                                              {item.totalAmount?.toLocaleString()} so'm
                                            </div>
                                          </td>
                                          <td className="p-3 whitespace-nowrap">
                                            {item.basketCount > 0 ? (
                                              <div className="flex items-center gap-1.5 bg-gray-100 px-2 py-1 rounded w-fit">
                                                <span className="font-black text-[12px] text-gray-600">{item.basketCount}x</span>
                                                <span className="text-[11px] font-bold text-gray-500 truncate max-w-[80px]">{item.basketName}</span>
                                              </div>
                                            ) : <span className="text-gray-300 font-bold text-xs">—</span>}
                                          </td>
                                          <td className="p-3 text-center whitespace-nowrap">
                                            <StatusBadge status={item.status} />
                                          </td>
                                          <td className="p-3 pr-5 whitespace-nowrap">
                                            <div className="flex items-center justify-end gap-1.5">
                                              <button onClick={(e) => handleDownloadReceipt(item.id, e)} className="p-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white rounded-lg transition-colors" title="Chekni yuklash">
                                                <Printer size={16} />
                                              </button>
                                              {!cancelled && (
                                                <>
                                                  {item.basketCount > 0 && (
                                                    <button onClick={(e) => openModal('editQuantity', item, group.farmerId, e)} className="p-1.5 bg-amber-50 text-amber-600 hover:bg-amber-500 hover:text-white rounded-lg transition-colors" title="Savat sonini tahrirlash">
                                                      <Package size={16} />
                                                    </button>
                                                  )}
                                                  <button onClick={(e) => openModal('cancel', item, group.farmerId, e)} className="p-1.5 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-lg transition-colors" title="Bekor qilish">
                                                    <XCircle size={16} />
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
          <div className="p-4 border-t border-gray-200 flex items-center justify-between bg-white">
            <span className="text-sm text-gray-500 font-bold">Sahifa {currentPage + 1} / {totalPages}</span>
            <div className="flex gap-2">
              <button onClick={() => setCurrentPage(p => Math.max(0, p - 1))} disabled={currentPage === 0}
                className="p-2 border border-gray-200 bg-white rounded-lg text-gray-600 hover:bg-gray-50 hover:text-blue-600 disabled:opacity-50 transition-colors shadow-sm">
                <ChevronLeft size={18} />
              </button>
              <button onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))} disabled={currentPage === totalPages - 1}
                className="p-2 border border-gray-200 bg-white rounded-lg text-gray-600 hover:bg-gray-50 hover:text-blue-600 disabled:opacity-50 transition-colors shadow-sm">
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── ACTION MODAL ─────────────────────────────────────────────────────── */}
      {modal.isOpen && cfg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0B1A42]/60 backdrop-blur-sm p-4 animate-in fade-in duration-200" onClick={closeModal}>
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
            <div className={`p-5 border-b border-gray-100 flex items-center justify-between ${cfg.bg}`}>
              <div className="flex items-center gap-3">
                <cfg.icon size={22} className={cfg.iconCls} strokeWidth={2.5} />
                <h3 className={`font-black text-[16px] tracking-tight ${cfg.hdCls}`}>{cfg.title}</h3>
              </div>
              <button onClick={closeModal} className="p-1.5 hover:bg-black/10 rounded-lg transition-colors"><X size={18} className="text-gray-500" /></button>
            </div>

            <div className="p-5 space-y-5 max-h-[75vh] overflow-y-auto">
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 text-[13px] space-y-2">
                <div className="flex justify-between"><span className="text-gray-500 font-bold">Meva:</span><span className="font-black text-gray-800">{modal.tx?.fruitName}</span></div>
                <div className="flex justify-between"><span className="text-gray-500 font-bold">Sof vazn:</span><span className="font-black font-mono text-emerald-600">{modal.tx?.netWeight} kg</span></div>
                <div className="flex justify-between pt-1 mt-1 border-t border-gray-200"><span className="text-gray-500 font-bold">Joriy summa:</span><span className="font-black font-mono text-blue-600 text-[14px]">{modal.tx?.totalAmount?.toLocaleString()} UZS</span></div>
              </div>

              {modal.type === 'cancel' && (
                <div className="flex items-start gap-3 p-3.5 bg-red-50 border border-red-100 rounded-xl">
                  <AlertTriangle size={18} className="text-red-500 mt-0.5 flex-shrink-0" />
                  <p className="text-[13px] text-red-700 font-medium leading-relaxed">
                    Bu amal moliyaviy balans, ombor va savat qarzini <strong>avtomatik qaytaradi</strong>. Amal qaytarib bo'lmaydi.
                  </p>
                </div>
              )}

              {modal.type === 'editQuantity' && (
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-[11px] font-black text-gray-600 uppercase tracking-wider">
                        Yangi savat sonini kiriting
                      </label>
                      {maxAllowed !== null && (
                        <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-100">
                          MAX: {maxAllowed} TA
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
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-base font-black focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 disabled:bg-gray-100 disabled:text-gray-400 transition-all" 
                    />
                  </div>

                  {preview && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-[12px] space-y-2 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-16 h-16 bg-amber-400/10 rounded-bl-full -mr-4 -mt-4" />
                      <div className="text-[10px] font-black text-amber-700 uppercase tracking-wider mb-2">Qayta hisoblangan natija</div>
                      <div className="flex justify-between text-amber-900 font-medium"><span>Yangi sof vazn:</span><span className="font-black">{preview.newNet} kg</span></div>
                      <div className="flex justify-between text-amber-900 font-medium"><span>Yangi brutto / tara:</span><span className="font-black">{preview.newGross} / {preview.newTara} kg</span></div>
                      <div className="flex justify-between border-t border-amber-200/60 pt-2 mt-1 text-amber-900 font-medium"><span>Yangi summa:</span><span className="font-black font-mono">{preview.newTotal?.toLocaleString()} UZS</span></div>
                      <div className="flex justify-between text-amber-900 font-medium pt-1">
                        <span>O'zgarish:</span>
                        <span className={`font-black font-mono text-[13px] ${preview.diff < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                          {preview.diff > 0 ? '+' : ''}{preview.diff?.toLocaleString()} UZS
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="text-[11px] font-black text-gray-600 uppercase tracking-wider mb-2 block">Sabab *</label>
                <textarea value={form.reason} onChange={(e) => setForm(f => ({ ...f, reason: e.target.value }))}
                  placeholder="Nima uchun bu o'zgartirish qilinmoqda?..." rows={2}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
              </div>

              {modalError && (
                <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-100 rounded-xl text-[13px] text-red-700 font-bold">
                  <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
                  <span>{modalError}</span>
                </div>
              )}
            </div>

            <div className="p-5 pt-0 flex gap-3">
              <button onClick={closeModal} disabled={modalLoading} className="flex-1 py-3 border border-gray-200 bg-white text-gray-700 font-bold text-sm rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50">
                Yopish
              </button>
              <button onClick={handleSubmit} disabled={modalLoading || !form.reason.trim()} style={{ backgroundColor: (!form.reason.trim() || modalLoading) ? '#9CA3AF' : cfg.color }}
                className="flex-1 py-3 text-white font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2 disabled:cursor-not-allowed shadow-md">
                {modalLoading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />} 
                {cfg.btn}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}