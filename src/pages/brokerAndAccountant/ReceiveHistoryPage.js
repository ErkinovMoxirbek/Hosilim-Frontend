import React, { useState, useEffect, useCallback } from 'react';
import { Search, ChevronLeft, ChevronRight, Loader2, RefreshCcw, Download, Apple, Scale, DollarSign, List, ChevronDown, ChevronUp, Printer } from 'lucide-react';
import cropService from '../../services/cropService';

export default function ReceiveHistoryPage() {
  const [groups, setGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Accordion state: farmerId → { isOpen, details, isLoadingDetails }
  const [accordionState, setAccordionState] = useState({});

  // Pagination
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 15;

  // Debounce qidiruvni backend'ga yuborish uchun
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(0); // qidiruv o'zgarganda 1-sahifaga qayt
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    fetchGroups(currentPage, debouncedSearch);
  }, [currentPage, debouncedSearch]);

  const fetchGroups = async (page, search) => {
    setIsLoading(true);
    setAccordionState({}); // sahifa o'zgarganda yopamiz
    try {
      const data = await cropService.getGroupedHistory(search, page, pageSize);
      setGroups(data.content || []);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error("Guruh tarixini yuklashda xatolik:", error);
      setGroups([]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleRow = useCallback(async (farmerId) => {
    setAccordionState(prev => {
      const current = prev[farmerId];

      // Agar ochiq bo'lsa — yopamiz
      if (current?.isOpen) {
        return { ...prev, [farmerId]: { ...current, isOpen: false } };
      }

      // Agar allaqachon yuklab olingan bo'lsa — faqat ochamiz
      if (current?.details) {
        return { ...prev, [farmerId]: { ...current, isOpen: true } };
      }

      // Birinchi marta — detail yuklashni boshlaymiz
      const nextState = {
        ...prev,
        [farmerId]: { isOpen: true, details: null, isLoadingDetails: true }
      };

      // Async yuklanishni tashqarida amalga oshiramiz
      cropService.getFarmerDetails(farmerId).then(details => {
        setAccordionState(s => ({
          ...s,
          [farmerId]: { isOpen: true, details: details || [], isLoadingDetails: false }
        }));
      }).catch(() => {
        setAccordionState(s => ({
          ...s,
          [farmerId]: { isOpen: true, details: [], isLoadingDetails: false }
        }));
      });

      return nextState;
    });
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const d = new Date(dateString);

    const time = d.toLocaleTimeString('uz-UZ', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });

    const date = d.toLocaleDateString('uz-UZ', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });

    return `${time}, ${date}`;
  };

  // 🟢 CHEK YUKLASH FUNKSIYASI
  const handleDownloadReceipt = async (transactionId, e) => {
    e.stopPropagation(); // Hodisa tepaga o'tib ketmasligi uchun
    try {
      const blobData = await cropService.downloadReceipt(transactionId);
      const url = window.URL.createObjectURL(new Blob([blobData], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Kvitansiya_${transactionId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Chek yuklashda xatolik:", error);
      alert("Chekni yuklab olishda xato yuz berdi. Backend tekshiring.");
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto pb-10">

      {/* Sarlavha */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#0B1A42] flex items-center gap-3">
           Qabul Tarixi
          </h1>
          <p className="text-sm text-gray-500 mt-1">Fermerlardan qabul qilingan barcha mahsulotlar ro'yxati</p>
        </div>
        <button
          onClick={() => fetchGroups(currentPage, debouncedSearch)}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-lg text-sm font-bold shadow-sm hover:bg-gray-50 active:scale-95 transition-all w-fit"
        >
          <RefreshCcw size={16} /> Yangilash
        </button>
      </div>

      {/* Qidiruv */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm mb-6">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Fermer ismi yoki telefon raqami orqali qidirish..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#14A44D]/20 focus:border-[#14A44D] transition-all font-medium"
          />
        </div>
      </div>

      {/* Jadval */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-200 text-gray-500 text-[14px] font-bold  tracking-wider">
                <th className="p-4 pl-6 w-10"></th>
                <th className="p-4">Fermer</th>
                <th className="p-4">Sof Vazn</th>
                <th className="p-4">Summa</th>
                <th className="p-4 text-center">Ishlatilgan Savatlar</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="5" className="p-16 text-center text-gray-400">
                    <Loader2 className="animate-spin mx-auto mb-3 text-[#14A44D]" size={36} />
                    <p className="font-medium text-sm">Ma'lumotlar yuklanmoqda...</p>
                  </td>
                </tr>
              ) : groups.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-16 text-center text-gray-400">
                    <div className="flex flex-col items-center">
                      <List size={48} className="mb-3 text-gray-300" />
                      <p className="font-medium text-sm">Hech qanday qabul tarixi topilmadi.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                groups.map((group) => {
                  const acc = accordionState[group.farmerId] || {};
                  const isOpen = !!acc.isOpen;

                  return (
                    <React.Fragment key={group.farmerId}>
                      {/* Asosiy qator */}
                      <tr
                        onClick={() => toggleRow(group.farmerId)}
                        className={`border-b cursor-pointer transition-colors ${isOpen ? 'bg-emerald-50/40 border-emerald-100' : 'border-gray-100 hover:bg-gray-50'}`}
                      >
                        <td className="p-4 pl-6">
                          <button className={`p-1.5 rounded-md transition-colors ${isOpen ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-400'}`}>
                            {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </button>
                        </td>
                        <td className="p-4">
                          <div className="font-bold text-[#0B1A42] text-[15px]">{group.farmerFullName}</div>
                          <div className="text-xs text-gray-500 mt-0.5">{group.farmerPhone}</div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Scale size={16} className="text-[#14A44D]" />
                            <span className="text-lg font-black text-[#14A44D]">
                              {group.totalNetWeight?.toLocaleString()} <span className="text-xs text-gray-400 font-bold">kg</span>
                            </span>
                          </div>
                          <div className="text-[10px] font-bold text-gray-400 uppercase mt-0.5">
                            {group.transactionCount} ta topshiriq
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-1.5">
                            <div className="p-1 bg-blue-50 text-blue-600 rounded">
                              <DollarSign size={14} />
                            </div>
                            <span className="font-black text-[#0B1A42] text-[16px]">
                              {group.totalAmount?.toLocaleString()} <span className="text-sm">UZS</span>
                            </span>
                          </div>
                        </td>
                        <td className="p-4 text-center">
                          <div className="inline-flex flex-col items-center">
                            <span className="text-[12px] font-extrabold bg-gray-100 text-gray-600 px-2.5 py-1 rounded-md">
                              {group.totalBaskets?.toLocaleString()} ta
                            </span>
                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1">Savat</span>
                          </div>
                        </td>
                      </tr>

                      {/* Detail qator (Accordion) */}
                      {isOpen && (
                        <tr className="bg-gray-50/50 border-b border-gray-200">
                          <td colSpan="5" className="p-0">
                            <div className="p-4 pl-16 pr-6 py-5">
                              <div className="bg-white border border-emerald-100 rounded-xl overflow-hidden shadow-sm">
                                {acc.isLoadingDetails ? (
                                  <div className="p-8 text-center text-gray-400">
                                    <Loader2 className="animate-spin mx-auto mb-2 text-[#14A44D]" size={24} />
                                    <p className="text-xs font-medium">Tranzaksiyalar yuklanmoqda...</p>
                                  </div>
                                ) : (
                                  <table className="w-full text-left border-collapse">
                                    <thead>
                                      <tr className="bg-emerald-50/50 text-emerald-800 text-[10px] font-bold uppercase tracking-wider border-b border-emerald-100">
                                        <th className="p-3 pl-4">Sana</th>
                                        <th className="p-3">Meva Turi</th>
                                        <th className="p-3">Sof vazn</th>
                                        <th className="p-3">To'liq vazn / Tara</th>
                                        <th className="p-3">Summa</th>
                                        <th className="p-3">Savat Turi</th>
                                        {/* 🟢 YANGI USTUN: Chek */}
                                        <th className="p-3 text-center">Chek</th> 
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {/* colSpan ni 6 dan 7 ga o'zgartiramiz chunki ustun ko'paydi */}
                                      {(acc.details || []).length === 0 ? (
                                        <tr>
                                          <td colSpan="7" className="p-6 text-center text-xs text-gray-400">
                                            Tranzaksiya topilmadi
                                          </td>
                                        </tr>
                                      ) : (
                                        (acc.details || []).map((item, idx) => (
                                          <tr key={item.id || idx} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                                            <td className="p-3 pl-4 text-xs text-gray-500 font-medium">{formatDate(item.createdAt)}</td>
                                            <td className="p-3">
                                              <div className="flex items-center gap-2">
                                                <Apple size={14} className="text-orange-500" />
                                                <div>
                                                  <div className="font-semibold text-gray-800 text-xs">{item.fruitName}</div>
                                                  <div className="text-[10px] font-bold text-gray-400 mt-0.5">
                                                    {item.unitPrice?.toLocaleString()} so'm/kg
                                                  </div>
                                                </div>
                                              </div>
                                            </td>
                                            <td className="p-3">
                                              <span className="font-bold text-emerald-600 text-sm">{item.netWeight} kg</span>
                                            </td>
                                            <td className="p-3 text-[11px] text-gray-500">
                                              <div>B: {item.grossWeight} kg</div>
                                              <div>T: {item.taraWeight} kg</div>
                                            </td>
                                            <td className="p-3 font-bold text-[#0B1A42] text-sm">
                                              {item.totalAmount?.toLocaleString()}
                                            </td>
                                            <td className="p-3">
                                              {item.basketCount > 0 ? (
                                                <div className="flex items-center gap-1.5 text-xs">
                                                  <span className="font-bold text-gray-600">{item.basketCount}x</span>
                                                  <span className="text-gray-400 truncate max-w-[100px]">{item.basketName}</span>
                                                </div>
                                              ) : (
                                                <span className="text-gray-300">-</span>
                                              )}
                                            </td>
                                            {/* 🟢 YANGI TUGMA: PDF Chek */}
                                            <td className="p-3 text-center">
                                              <button 
                                                onClick={(e) => handleDownloadReceipt(item.id, e)}
                                                title="Chekni yuklab olish"
                                                className="p-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white rounded-lg transition-colors border border-emerald-100"
                                              >
                                                <Printer size={16} />
                                              </button>
                                            </td>
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

        {/* Pagination */}
        {!isLoading && totalPages > 1 && (
          <div className="p-4 border-t border-gray-200 flex items-center justify-between bg-gray-50">
            <span className="text-sm text-gray-500 font-medium">
              Sahifa {currentPage + 1} / {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                disabled={currentPage === 0}
                className="p-2 border border-gray-200 bg-white rounded-lg text-gray-600 hover:bg-gray-100 disabled:opacity-50 transition-colors"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                disabled={currentPage === totalPages - 1}
                className="p-2 border border-gray-200 bg-white rounded-lg text-gray-600 hover:bg-gray-100 disabled:opacity-50 transition-colors"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}