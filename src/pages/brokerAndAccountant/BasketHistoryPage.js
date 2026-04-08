import React, { useState, useEffect } from 'react';
import {
  Package, Calendar, PlusCircle, PenTool, Trash2, 
  ArrowDownToLine, ArrowUpRight, ArrowDownLeft, Loader2, Info
} from 'lucide-react';
import basketService from '../../services/basketService';

// ─── Yordamchi funksiyalar ───────────────────────────────────────────────────

const formatMoney = (val) => {
  if (val == null) return null;
  return new Intl.NumberFormat('uz-UZ').format(val) + " so'm";
};

// ─── Harakat turi konfiguratsiyasi ──────────────────────────────────────────

const getActionConfig = (type) => {
  switch (type) {
    case 'CREATE': return { icon: PlusCircle, color: 'text-green-600', bg: 'bg-green-50' };
    case 'UPDATE': return { icon: PenTool, color: 'text-blue-600', bg: 'bg-blue-50' };
    case 'DELETE': return { icon: Trash2, color: 'text-red-600', bg: 'bg-red-50' };
    case 'ADD_STOCK': return { icon: ArrowDownToLine, color: 'text-emerald-600', bg: 'bg-emerald-50' };
    case 'GIVEN_TO_FARMER': return { icon: ArrowUpRight, color: 'text-orange-600', bg: 'bg-orange-50' };
    case 'REMOVE_FROM_FARMER': return { icon: ArrowDownLeft, color: 'text-teal-600', bg: 'bg-teal-50' };
    default: return { icon: Info, color: 'text-slate-500', bg: 'bg-slate-50' };
  }
};

// ─── Kichik detallar (O'zgarishlar qatori) ──────────────────────────────────

const DetailRow = ({ label, value }) => {
  if (!value) return null;
  return (
    <div className="flex items-baseline gap-2 mt-1">
      <span className="text-sm text-slate-500 w-24 shrink-0">{label}:</span>
      <span className="text-sm font-medium text-slate-900">{value}</span>
    </div>
  );
};

// ─── Asosiy qator (List Item) ────────────────────────────────────────────────

const HistoryItem = ({ item }) => {
  const config = getActionConfig(item.actionType);
  const Icon = config.icon;

  return (
    <div className="flex gap-4 py-5 border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors px-2 rounded-xl">
      {/* Chap: Ikonka */}
      <div className={`mt-1 shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${config.bg} ${config.color}`}>
        <Icon size={20} strokeWidth={2} />
      </div>

      {/* O'ng: Kontent */}
      <div className="flex-1 min-w-0">
        
        {/* Yuqori qism (Savat nomi va Vaqt) */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
          <h3 className="font-semibold text-slate-900 text-[15px]">{item.basketName}</h3>
          <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
            <Calendar size={12} /> {item.createdAt}
          </span>
        </div>

        {/* Asosiy Izoh */}
        <p className="text-[14px] text-slate-700 leading-relaxed mb-3">
          {item.description}
        </p>

        {/* O'zgarishlar detallari (Faqat borlari chiqadi) */}
        <div className="mb-3">
          {item.quantityChange != null && (
            <DetailRow 
              label="Soni o'zgardi" 
              value={`${item.quantityChange > 0 ? '+' : ''}${item.quantityChange} ta (Yangi qoldiq: ${item.newQuantity} ta)`} 
            />
          )}
          
          <DetailRow 
            label="Narxi" 
            value={item.newPrice ? formatMoney(item.newPrice) : null} 
          />
          
          <DetailRow 
            label="Holati" 
            value={item.newIsActive != null ? (item.newIsActive ? 'Faol qilingan' : 'Nofaol qilingan') : null} 
          />

          <DetailRow 
            label="Savat nomi" 
            value={item.newName ? `Eskisi: ${item.oldName} -> Yangisi: ${item.newName}` : null} 
          />
        </div>

        {/* Footer (Fermer va Bajaruvchi) */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-4 pt-4 border-t border-slate-100/60">
          {item.farmerName && (
            <div className="text-[12px] text-slate-600">
              <span className="text-slate-400 mr-1">Fermer:</span> 
              <span className="font-medium">{item.farmerName}</span>
            </div>
          )}
          <div className="text-[12px] text-slate-600">
            <span className="text-slate-400 mr-1">Bajaruvchi:</span> 
            <span className="font-medium">{item.createdBy}</span>
          </div>
        </div>

      </div>
    </div>
  );
};

// ─── Asosiy Sahifa ───────────────────────────────────────────────────────────

export default function BasketHistoryPage() {
  const [baskets, setBaskets] = useState([]);
  const [selectedBasketId, setSelectedBasketId] = useState('all');
  
  const [history, setHistory] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isFetchingInitial, setIsFetchingInitial] = useState(false);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [isLoadingBaskets, setIsLoadingBaskets] = useState(true);

  // Savatlar ro'yxatini olish
  useEffect(() => {
    fetchBaskets();
  }, []);

  const fetchBaskets = async () => {
    setIsLoadingBaskets(true);
    try {
      const data = await basketService.getBaskets(0, 100);
      setBaskets(data?.content || data || []);
    } catch (error) {
      console.error('Savatlarni olishda xatolik:', error);
    } finally {
      setIsLoadingBaskets(false);
    }
  };

  // Filtr o'zgarganda yuklash
  useEffect(() => {
    fetchHistoryData(selectedBasketId, 0, true);
  }, [selectedBasketId]);

  const fetchHistoryData = async (basketId, pageNum, isInitial = false) => {
    if (isInitial) {
      setIsFetchingInitial(true);
      setCurrentPage(0);
    } else {
      setIsFetchingMore(true);
    }

    try {
      let data = basketId === 'all' 
        ? await basketService.getAllHistory(pageNum, 20) 
        : await basketService.getHistory(basketId, pageNum, 20);

      if (data) {
        setTotalPages(data.totalPages || 1);
        const newItems = data.content || data || [];
        setHistory(prev => isInitial ? newItems : [...prev, ...newItems]);
      }
    } catch (error) {
      console.error('Tarixni olishda xatolik:', error);
    } finally {
      setIsFetchingInitial(false);
      setIsFetchingMore(false);
    }
  };

  const handleLoadMore = () => {
    if (currentPage < totalPages - 1) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      fetchHistoryData(selectedBasketId, nextPage, false);
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-3xl mx-auto h-screen flex flex-col font-sans">
      
      {/* Sarlavha va Filtr */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 mb-1">Amallar tarixi</h1>
        <p className="text-sm text-slate-500 mb-6">Tizimdagi barcha kirim, chiqim va tahrirlash jarayonlari.</p>

        <div className="relative max-w-sm">
          <Package className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <select
            value={selectedBasketId}
            onChange={(e) => setSelectedBasketId(e.target.value)}
            disabled={isLoadingBaskets || isFetchingInitial}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-[14px] text-slate-800 outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-100 transition-all cursor-pointer disabled:opacity-50 shadow-sm"
          >
            <option value="all">Barcha savatlar</option>
            {baskets.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tarix Ro'yxati */}
      <div className="flex-1 bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col shadow-sm">
        {isFetchingInitial ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-3">
            <Loader2 className="animate-spin" size={24} />
            <span className="text-sm font-medium">Yuklanmoqda...</span>
          </div>
        ) : history.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-2">
            <Info size={24} />
            <span className="text-sm font-medium">Hech qanday tarix topilmadi</span>
          </div>
        ) : (
          <div className="overflow-y-auto p-2 sm:p-4">
            {history.map((item) => (
              <HistoryItem key={item.id} item={item} />
            ))}
            
            {/* Ko'proq yuklash tugmasi */}
            {currentPage < totalPages - 1 && (
              <div className="flex justify-center mt-6 mb-4">
                <button 
                  onClick={handleLoadMore}
                  disabled={isFetchingMore}
                  className="px-6 py-2 bg-white border border-slate-200 rounded-md text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50 shadow-sm flex items-center gap-2"
                >
                  {isFetchingMore && <Loader2 size={16} className="animate-spin" />}
                  Yana yuklash
                </button>
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
}