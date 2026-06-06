import React, { useState, useEffect } from 'react';
import cropService from '../../services/cropService';

// Harakat turlari uchun tarjima va ranglar
const actionConfig = {
  CANCELLED: { label: 'Bekor qilindi', badgeClass: 'bg-red-100 text-red-700' },
  PRICE_CORRECTED: { label: 'Narx tuzatildi', badgeClass: 'bg-blue-100 text-blue-700' },
  QUANTITY_CORRECTED: { label: 'Miqdor tuzatildi', badgeClass: 'bg-yellow-100 text-yellow-700' },
  DEFAULT: { label: "O'zgarish", badgeClass: 'bg-gray-100 text-gray-700' }
};

const TransactionHistory = () => {
  const [historyElements, setHistoryElements] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        // Yangilangan servis metodini chaqiramiz
        const data = await cropService.getCollectionPointHistory(currentPage, 10);
        setHistoryElements(data.content || []);
        setTotalPages(data.totalPages || 0);
      } catch (error) {
        console.error("Tarixni olishda muammo bo'ldi", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [currentPage]); // transactionId olib tashlandi, faqat currentPage qoldi

  if (loading && historyElements.length === 0) {
    return <div className="text-center p-4 text-[#1B5E20]">Tarix yuklanmoqda...</div>;
  }

  if (!loading && historyElements.length === 0) {
    return <div className="text-center p-4 text-gray-500">Filial bo'yicha o'zgarishlar tarixi yo'q.</div>;
  }

  return (
    <div className="bg-[#FFFFFF] p-6 rounded-lg shadow-sm w-full max-w-3xl mx-auto border border-gray-100">
      <h3 className="text-xl font-bold mb-6 text-[#1B5E20]">
        Filial tranzaksiyalar tarixi
      </h3>

      {/* Timeline Konteyner */}
      <div className="relative border-l-2 border-gray-200 ml-3">
        {historyElements.map((item) => {
          const config = actionConfig[item.actionType] || actionConfig.DEFAULT;
          const date = new Date(item.createdAt).toLocaleString('uz-UZ', {
            day: '2-digit', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
          });

          return (
            <div key={item.id} className="mb-8 ml-6 relative">
              {/* Yashil nuqta */}
              <span className="absolute flex items-center justify-center w-4 h-4 bg-[#1B5E20] rounded-full -left-[31px] ring-4 ring-white top-1"></span>
              
              <div className="bg-[#FFFFFF] p-4 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                
                {/* O'zgarish sarlavhasi va vaqti */}
                <div className="flex flex-col mb-3">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded ${config.badgeClass}`}>
                      {config.label}
                    </span>
                    <span className="text-sm text-gray-500">{date}</span>
                  </div>
                  
                  {/* Yangi qo'shilgan DTO maydonlari: Tranzaksiya va Fermer */}
                  <div className="text-sm font-semibold text-[#1B5E20]">
                    Tranzaksiya #{item.transactionId} <span className="text-gray-500 font-normal ml-1">| Fermer: {item.farmerName}</span>
                  </div>
                </div>

                <p className="text-gray-800 font-medium mt-1">
                  {item.changeSummary}
                </p>
                
                {item.reason && (
                  <p className="text-gray-600 text-sm mt-2 italic border-l-2 border-gray-300 pl-2">
                    " {item.reason} "
                  </p>
                )}

                <div className="mt-3 text-xs text-gray-400 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                  </svg>
                  Bajaruvchi: <span className="font-semibold text-gray-600">{item.createdByName}</span> 
                  ({item.createdByRole})
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Paginatsiya Boshqaruvi */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center mt-6 gap-2">
          <button
            onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
            disabled={currentPage === 0}
            className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 hover:bg-gray-50"
          >
            Oldingi
          </button>
          
          <div className="flex gap-1">
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i)}
                className={`px-3 py-1 rounded text-sm border ${
                  currentPage === i 
                    ? 'bg-[#1B5E20] text-[#FFFFFF] border-[#1B5E20]' 
                    : 'bg-[#FFFFFF] text-gray-600 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>

          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={currentPage === totalPages - 1}
            className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 hover:bg-gray-50"
          >
            Keyingi
          </button>
        </div>
      )}
    </div>
  );
};

export default TransactionHistory;