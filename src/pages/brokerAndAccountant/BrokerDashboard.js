import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, Users, Package, DollarSign, Plus, Check, X, ChevronRight, TrendingUp 
} from 'lucide-react';
import API_BASE_URL from "../../config";

export default function BrokerDashboard() {
  const [stats, setStats] = useState({
    pendingOrders: 0,
    activeFarmers: 0,
    totalInventory: 0,
    dailyIncome: 0
  });
  const [orders, setOrders] = useState([]);
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBrokerData();
  }, []);

  const fetchBrokerData = async () => {
    try {
      const token = localStorage.getItem("authToken");
      
      const statsResponse = await fetch(`${API_BASE_URL}/broker/dashboard/stats`, {
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
      }
    } catch (error) {
      console.error('Accept order error:', error);
    }
  };

  const handleRejectOrder = async (orderId) => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`${API_BASE_URL}/broker/orders/${orderId}/reject`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.ok) {
        setOrders(orders.filter(order => order.id !== orderId));
      }
    } catch (error) {
      console.error('Reject order error:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] gap-3">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-300 border-t-blue-600"></div>
        <p className="text-slate-500 font-medium text-sm">Ma'lumotlar yuklanmoqda...</p>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-8 bg-[#F8FAFC] min-h-screen">
      {/* Sarlavha - Joyida qoldi */}
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Bosh sahifa</h1>
        <p className="text-slate-500 mt-1 font-medium text-sm">Tizimning umumiy xulosasi va tezkor amallar</p>
      </div>

      {/* Statistika Kartalari - Tiniq chegaralar va qat'iy soya */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Kutayotgan', val: stats.pendingOrders, unit: 'ta', icon: ShoppingCart, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Faol Fermerlar', val: stats.activeFarmers, unit: 'nafar', icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Haladelnik', val: stats.totalInventory, unit: 'kg', icon: Package, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Kunlik Daromad', val: stats.dailyIncome?.toLocaleString(), unit: "so'm", icon: DollarSign, color: 'text-purple-600', bg: 'bg-purple-50' },
        ].map((item, idx) => (
          <div key={idx} className="bg-white rounded-xl p-5 border border-slate-200 shadow-[0_2px_4px_rgba(0,0,0,0.05)] hover:shadow-md transition-all duration-200">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-lg ${item.bg} ${item.color} flex items-center justify-center border border-current/10`}>
                <item.icon size={24} strokeWidth={2} />
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">{item.label}</p>
                <p className="text-2xl font-black text-slate-900 leading-none">
                  {item.val} <span className="text-xs font-bold text-slate-400 uppercase">{item.unit}</span>
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Asosiy Qism (Ikki ustun) */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        
        {/* Chap ustun: Buyurtmalar - Soya va Border tiniqlashtirildi */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-slate-200 shadow-[0_2px_8px_rgba(0,0,0,0.04)] overflow-hidden flex flex-col">
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
              {orders.map((order) => (
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
              
              {orders.length === 0 && (
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
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-[0_2px_8px_rgba(0,0,0,0.04)] overflow-hidden flex flex-col">
          <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-white">
            <h3 className="text-base font-bold text-slate-900 uppercase tracking-tight">Hozirgi Narxlar</h3>
            <button className="bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-600 px-3 py-1.5 rounded-lg flex items-center text-[11px] font-bold transition-all border border-blue-100">
              <Plus size={14} className="mr-1" /> NARX
            </button>
          </div>
          
          <div className="p-2 flex-1">
            <div className="space-y-1">
              {prices.map((price) => (
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
              
              {prices.length === 0 && (
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