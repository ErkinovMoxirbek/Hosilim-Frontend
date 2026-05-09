import React, { useEffect, useState } from 'react';
import { Package, Search, Inbox } from "lucide-react";
import { stockService } from '../../services/stockService';

// ACCENTS massivi har xil mevalar uchun tasodifiy (lekin meva nomiga bog'langan doimiy) rang beradi
const ACCENTS = ['#EF4444', '#F97316', '#F59E0B', '#84CC16', '#10B981', '#06B6D4', '#3B82F6', '#8B5CF6', '#D946EF', '#F43F5E'];

const getAccentColor = (name) => {
  if (!name) return ACCENTS[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return ACCENTS[Math.abs(hash) % ACCENTS.length];
};

export default function MyStocksPage() {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchStocks();
  }, []);

  const fetchStocks = async () => {
    try {
      setError(null);
      setLoading(true);
      const data = await stockService.getMyBalances();
      setStocks(data || []);
    } catch (err) {
      setError(err?.toString() || "Ombor ma'lumotlarini yuklashda xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  const filteredStocks = stocks.filter(stock =>
    (stock.fruitName?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
    (stock.basketName?.toLowerCase() || "").includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-6 h-6 border-2 border-gray-200 border-t-black rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
        <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-3">
          <Package size={24} />
        </div>
        <p className="text-gray-900 font-medium mb-1">Xatolik yuz berdi</p>
        <p className="text-gray-500 text-sm mb-4">{error}</p>
        <button
          onClick={fetchStocks}
          className="px-5 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium transition-colors"
        >
          Qaytadan urinish
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 w-full max-w-[1600px] mx-auto min-h-screen flex flex-col">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-1 block">
            Qabul punkti
          </span>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 font-['Syne',sans-serif] tracking-tight">
            Ombor Zaxirasi
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Qidiruv..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-full text-sm focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 transition-all w-full md:w-[240px]"
            />
          </div>
          <span className="bg-gray-100 border border-gray-200 text-gray-800 text-sm font-semibold px-4 py-2 rounded-full whitespace-nowrap">
            Jami: <span className="font-['DM_Mono',monospace]">{filteredStocks.length}</span>
          </span>
        </div>
      </div>

      {/* ASOSIY KONTENT */}
      {filteredStocks.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center bg-transparent rounded-xl border border-dashed border-gray-300 p-12 text-center">
          <Inbox size={40} className="text-gray-300 mb-3" />
          <p className="text-gray-900 font-medium mb-1 font-['Syne',sans-serif]">Zaxira topilmadi</p>
          <p className="text-gray-500 text-sm">Hozircha omborda yuk yo'q yoki natija topilmadi.</p>
        </div>
      ) : (
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {filteredStocks.map((stock) => {
            
            const mainName = stock.fruitName || "Noma'lum meva";
            const qualityTag = stock.fruitQuality || "Noma'lum sifat";

            const accentColor = getAccentColor(mainName);

            // Dinamik ranglar
            let qualityColorClass = "bg-gray-100 text-gray-600"; 
            const upperTag = qualityTag.toUpperCase();
            
            if (upperTag.includes("OLIY")) {
              qualityColorClass = "bg-blue-50 text-blue-700";
            } else if (upperTag.includes("BIRINCHI") || upperTag.includes("1")) {
              qualityColorClass = "bg-green-50 text-green-700";
            } else if (upperTag.includes("IKKINCHI") || upperTag.includes("2")) {
              qualityColorClass = "bg-orange-50 text-orange-700";
            }

            return (
              <div 
                key={stock.stockId} 
                className="relative bg-white rounded-xl border border-gray-200 shadow-sm hover:border-gray-400 hover:-translate-y-[2px] transition-all duration-200 flex flex-col overflow-hidden"
              >
                {/* ACCENT CHIZIQ */}
                <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: accentColor }} />

                {/* Sarlavha Qismi */}
                <div className="p-4 pt-5 pb-3 flex justify-between items-start">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 font-['Syne',sans-serif] leading-none mb-2">
                      {mainName}
                    </h2>
                    <span className={`inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded ${qualityColorClass}`}>
                      {qualityTag}
                    </span>
                  </div>
                </div>
                
                {/* Savat Ma'lumoti */}
                <div className="px-4 pb-3 flex items-center justify-between text-sm">
                  <span className="text-gray-500 truncate pr-2" title={stock.basketName}>
                    {stock.basketName || "Savatsiz"}
                  </span>
                  <span className="font-['DM_Mono',monospace] font-medium text-gray-900 bg-gray-50 px-2 py-0.5 rounded border border-gray-100">
                    {stock.basketCount ?? 0} ta
                  </span>
                </div>

                {/* Netto va Brutto (Ikkita ustunli blok, vertikal chiziq bilan) */}
                <div className="grid grid-cols-2 border-y border-gray-100 divide-x divide-gray-100 bg-gray-50/50">
                  <div className="p-3 flex flex-col">
                    <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider mb-1">
                      Netto
                    </span>
                    <span className="font-['DM_Mono',monospace] font-bold text-gray-900 text-base">
                      {stock.netWeight ?? 0} <span className="text-xs font-normal text-gray-500">kg</span>
                    </span>
                  </div>
                  <div className="p-3 flex flex-col">
                    <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider mb-1">
                      Brutto
                    </span>
                    <span className="font-['DM_Mono',monospace] font-bold text-gray-900 text-base">
                      {stock.grossWeight ?? 0} <span className="text-xs font-normal text-gray-500">kg</span>
                    </span>
                  </div>
                </div>

                {/* Pul hisoboti (agar mavjud bo'lsa) */}
                {(stock.fruitPrice > 0 || stock.totalAmount > 0) && (
                  <div className="px-4 py-3 flex justify-between items-center text-sm border-b border-gray-100">
                    <span className="text-gray-500">
                      <span className="font-['DM_Mono',monospace]">{stock.fruitPrice?.toLocaleString() ?? 0}</span> so'm/kg
                    </span>
                    <span className="font-['DM_Mono',monospace] font-bold text-green-700">
                      {stock.totalAmount?.toLocaleString() ?? 0} so'm
                    </span>
                  </div>
                )}

                {/* Ko'chirish tugmasi */}
                <div className="p-3 mt-auto bg-white">
                  <button className="w-full py-2 bg-transparent border border-gray-200 text-gray-600 text-sm font-medium rounded-lg hover:border-gray-900 hover:text-gray-900 transition-colors">
                    Yukni ko'chirish
                  </button>
                </div>
                
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}