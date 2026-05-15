import React, { useState, useEffect, useRef } from 'react';
import { 
  ShoppingCart, Users, Package, DollarSign, Check, X, ChevronRight, TrendingUp, Scale, Filter, ChevronDown, Calendar
} from 'lucide-react';
import API_BASE_URL from "../../config";

export default function BrokerDashboard() {
  const [stats, setStats] = useState({
    pendingOrders: 0,
    activeFarmers: 0,
    totalInventory: 0,
    dailyIncome: 0,
    dailyAcceptedWeight: 0 
  });
  const [orders, setOrders] = useState([]);
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- FILTR STATE'LARI ---
  const [filterType, setFilterType] = useState('today'); // 'today', 'all', 'custom'
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterRef = useRef(null);

  // Dropdown'dan tashqariga bosganda uni yopish
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setIsFilterOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    fetchBrokerData();
    // eslint-disable-next-line
  }, [filterType, selectedDate]); 

  const fetchBrokerData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      
      let statsUrl = `${API_BASE_URL}/broker/dashboard/stats?filter=${filterType}`;
      if (filterType === 'custom') {
        statsUrl += `&date=${selectedDate}`;
      }
      
      const statsResponse = await fetch(statsUrl, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData.data);
      }

      const ordersResponse = await fetch(`${API_BASE_URL}/broker/orders?status=pending&limit=10`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (ordersResponse.ok) {
        const ordersData = await ordersResponse.json();
        setOrders(ordersData.data);
      }

      const pricesResponse = await fetch(`${API_BASE_URL}/broker/prices`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (pricesResponse.ok) {
        const pricesData = await pricesResponse.json();
        setPrices(pricesData.data);
      }

    } catch (error) {
      console.error('Broker data fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptOrder = async (orderId) => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`${API_BASE_URL}/broker/orders/${orderId}/accept`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        setOrders(orders.filter(order => order.id !== orderId));
        fetchBrokerData(); 
      }
    } catch (error) { console.error('Accept error:', error); }
  };

  const handleRejectOrder = async (orderId) => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`${API_BASE_URL}/broker/orders/${orderId}/reject`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) setOrders(orders.filter(order => order.id !== orderId));
    } catch (error) { console.error('Reject error:', error); }
  };

  // Filtr nomini chiroyli ko'rsatish uchun yordamchi obyekti
  const filterLabels = {
    today: "Bugungi",
    all: "Barcha vaqtlar",
    custom: selectedDate.split('-').reverse().join('.') // 2026-05-13 ni 13.05.2026 qiladi
  };

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-8 bg-[#F8FAFC] min-h-screen">
      
      {/* Sarlavha */}
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Bosh sahifa</h1>
        <p className="text-slate-500 mt-1 font-medium text-sm">Tizimning umumiy xulosasi va tezkor amallar</p>
      </div>

      {/* --- STATISTIKA QISMI (Yangi nafis, ramkasiz dizayn) --- */}
      <div className="flex flex-col gap-5">
        
        {/* Filtr Boshqaruvi va Sarlavha */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mt-2 mb-1">
          
          {/* Chap tomon: Sarlavha */}
          <div>
            
          </div>
          
          {/* O'ng tomon: Nafis Dropdown */}
          <div className="relative z-20" ref={filterRef}>
            <button 
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex items-center gap-2.5 px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-200/80 rounded-xl text-sm font-bold text-slate-700 transition-all shadow-[0_2px_8px_rgb(0,0,0,0.04)]"
            >
              <Filter size={16} className="text-blue-500" />
              <span>{filterLabels[filterType]}</span>
              <ChevronDown size={16} className={`text-slate-400 transition-transform duration-200 ${isFilterOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Qalqib chiquvchi oyna (Dropdown Menu) */}
            {isFilterOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-100 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] rounded-xl p-1.5 animate-in fade-in zoom-in-95 duration-200">
                <button 
                  onClick={() => { setFilterType('today'); setIsFilterOpen(false); }} 
                  className={`w-full flex items-center gap-2 text-left px-3 py-2.5 rounded-lg text-sm font-bold transition-colors ${filterType === 'today' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  Bugun
                </button>
                <button 
                  onClick={() => { setFilterType('all'); setIsFilterOpen(false); }} 
                  className={`w-full flex items-center gap-2 text-left px-3 py-2.5 rounded-lg text-sm font-bold transition-colors ${filterType === 'all' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  Barcha vaqtlar
                </button>
                <div className="h-px bg-slate-100 my-1.5 mx-2"></div>
                <div className="px-3 pt-2 pb-1 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Aniq sana tanlash
                </div>
                <div className="p-2">
                  <div className="relative flex items-center">
                    <Calendar size={14} className="absolute left-3 text-slate-400" />
                    <input 
                      type="date" 
                      value={selectedDate}
                      onChange={(e) => {
                        setFilterType('custom');
                        setSelectedDate(e.target.value);
                        setIsFilterOpen(false);
                      }}
                      className="w-full text-sm font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Statistika Kartalari - Oq ramkasiz, to'g'ridan-to'g'ri orqa fonda */}
        {loading ? (
           <div className="flex flex-col items-center justify-center py-12 gap-3 opacity-60">
             <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-300 border-t-blue-600"></div>
             <p className="text-slate-500 font-medium text-sm">Statistikalar yuklanmoqda...</p>
           </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
            {[
              { label: 'Tarqatilgan savatlar', val: stats.pendingOrders, unit: 'ta', icon: ShoppingCart, color: 'text-blue-500', bg: 'bg-blue-50/50' },
              { label: 'Fermerlar', val: stats.activeFarmers, unit: 'nafar', icon: Users, color: 'text-emerald-500', bg: 'bg-emerald-50/50' },
              { label: 'Mahsulot qiymati', val: stats.dailyIncome?.toLocaleString(), unit: "so'm", icon: DollarSign, color: 'text-purple-500', bg: 'bg-purple-50/50' },
              { label: 'Mahsulot og\'irligi', val: stats.dailyAcceptedWeight || 0, unit: 'kg', icon: Scale, color: 'text-rose-500', bg: 'bg-rose-50/50' },
              { label: 'Haladelnik', val: stats.totalInventory, unit: 'kg', icon: Package, color: 'text-amber-500', bg: 'bg-amber-50/50' },
            ].map((item, idx) => (
              <div key={idx} className="bg-white rounded-2xl p-5 border border-slate-200/60 shadow-[0_2px_12px_rgb(0,0,0,0.02)] hover:shadow-[0_8px_24px_rgb(0,0,0,0.06)] hover:-translate-y-0.5 transition-all duration-300 group flex flex-col justify-between">
                
                {/* Sarlavha va Kichik Ikonka */}
                <div className="flex justify-between items-start mb-2">
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest leading-snug max-w-[70%] group-hover:text-slate-500 transition-colors">
                    {item.label}
                  </p>
                  <div className={`w-8 h-8 rounded-full ${item.bg} ${item.color} flex items-center justify-center shrink-0`}>
                    <item.icon size={16} strokeWidth={2.5} />
                  </div>
                </div>

                {/* Yirik Raqamlar - NAFIS va IDEAL ko'rinish */}
                <div className="flex items-baseline gap-1.5 pt-2">
                  <span className="text-[26px] sm:text-[28px] font-bold text-slate-800 leading-none tracking-tight">
                    {item.val}
                  </span>
                  <span className="text-[11px] font-medium text-slate-400 uppercase tracking-widest">
                    {item.unit}
                  </span>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
      {/* --- STATISTIKA QISMI YAKUNI --- */}

      {/* Asosiy Qism (Ikki ustun) */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        
        {/* Chap ustun: Buyurtmalar */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-white">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              Yangi qabullar
              {orders.length > 0 && (
                <span className="bg-red-50 text-red-600 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest border border-red-100">
                  {orders.length} ta
                </span>
              )}
            </h3>
            <button className="text-[11px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 uppercase tracking-wider">
              Barchasi <ChevronRight size={14} />
            </button>
          </div>
          
          <div className="p-6 flex-1 bg-slate-50/30">
            <div className="space-y-3">
              {loading && orders.length === 0 ? (
                <div className="text-center py-12 text-slate-400 font-medium text-sm">Yuklanmoqda...</div>
              ) : orders.map((order) => (
                <div key={order.id} className="bg-white border border-slate-200 rounded-lg p-4 flex flex-col sm:flex-row gap-4 justify-between sm:items-center hover:border-blue-300 transition-colors shadow-sm">
                  <div className="flex gap-4 items-center">
                    <div className="w-10 h-10 rounded-md bg-slate-100 flex items-center justify-center text-slate-600 font-bold border border-slate-200 text-sm">
                      {(order.farmer?.name || "U")[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-sm">{order.farmer?.name || order.farmer?.phone}</p>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 font-bold uppercase mt-0.5 tracking-tight">
                        <span className="text-slate-800">{order.fruitType}</span> • 
                        <span>{order.quantity} kg</span> • 
                        <span className="text-amber-600">{order.quality} Nav</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button 
                      onClick={() => handleAcceptOrder(order.id)}
                      className="flex-1 sm:flex-none bg-emerald-50 text-emerald-700 p-2 rounded-lg hover:bg-emerald-600 hover:text-white transition-all border border-emerald-100"
                    >
                      <Check size={18} strokeWidth={2.5} />
                    </button>
                    <button 
                      onClick={() => handleRejectOrder(order.id)}
                      className="flex-1 sm:flex-none bg-rose-50 text-rose-600 p-2 rounded-lg hover:bg-rose-600 hover:text-white transition-all border border-rose-100"
                    >
                      <X size={18} strokeWidth={2.5} />
                    </button>
                  </div>
                </div>
              ))}
              
              {!loading && orders.length === 0 && (
                <div className="text-center py-12 px-4 opacity-60">
                  <ShoppingCart className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-900 font-bold text-base">Yangi qabullar yo'q</p>
                  <p className="text-slate-500 text-[11px] font-bold uppercase mt-1">Hozircha ma'lumot kelmadi</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* O'ng ustun: Narxlar jadvali */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-white">
            <h3 className="text-base font-bold text-slate-900 uppercase tracking-tight">Hozirgi Narxlar</h3>
          </div>
          
          <div className="p-2 flex-1">
            <div className="space-y-1">
              {loading && prices.length === 0 ? (
                 <div className="text-center py-12 text-slate-400 font-medium text-sm">Yuklanmoqda...</div>
              ) : prices.map((price) => (
                <div key={price.id} className="p-3.5 hover:bg-slate-50 transition-colors rounded-lg flex justify-between items-center border-b border-slate-50 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                    <div>
                      <p className="font-bold text-slate-800 text-sm">{price.fruitType}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{price.quality} nav</p>
                    </div>
                  </div>
                  <div className="text-right font-black text-slate-900 text-sm">
                    {price.pricePerKg?.toLocaleString()} <span className="text-[10px] text-slate-400 font-bold uppercase">so'm</span>
                  </div>
                </div>
              ))}
              
              {!loading && prices.length === 0 && (
                <div className="text-center py-12 px-4 opacity-60">
                  <TrendingUp className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-900 font-bold text-sm uppercase">Narxlar belgilanmagan</p>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}