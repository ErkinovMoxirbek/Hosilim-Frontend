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
        // Muvaffaqiyatli bildirishnoma (Custom alert qo'shsangiz ham bo'ladi)
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
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        <p className="text-gray-500 font-medium">Ma'lumotlar yuklanmoqda...</p>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Sarlavha */}
      <div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Bosh sahifa</h1>
        <p className="text-gray-500 mt-1 font-medium">Tizimning umumiy xulosasi va tezkor amallar</p>
      </div>

      {/* Statistika Kartalari */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        <div className="bg-white rounded-[1.5rem] p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100/50">
              <ShoppingCart size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium mb-0.5">Kutayotgan</p>
              <p className="text-2xl font-black text-gray-900 leading-none">{stats.pendingOrders} <span className="text-sm font-semibold text-gray-400">ta</span></p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[1.5rem] p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100/50">
              <Users size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium mb-0.5">Faol Fermerlar</p>
              <p className="text-2xl font-black text-gray-900 leading-none">{stats.activeFarmers} <span className="text-sm font-semibold text-gray-400">nafar</span></p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[1.5rem] p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100/50">
              <Package size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium mb-0.5">Haladelnik</p>
              <p className="text-2xl font-black text-gray-900 leading-none">{stats.totalInventory} <span className="text-sm font-semibold text-gray-400">kg</span></p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[1.5rem] p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100/50">
              <DollarSign size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium mb-0.5">Kunlik Daromad</p>
              <p className="text-2xl font-black text-gray-900 leading-none">{stats.dailyIncome?.toLocaleString()} <span className="text-sm font-semibold text-gray-400">so'm</span></p>
            </div>
          </div>
        </div>

      </div>

      {/* Asosiy Qism (Ikki ustun) */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        
        {/* Chap ustun: Buyurtmalar (Kengroq) */}
        <div className="lg:col-span-3 bg-white rounded-[1.5rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-5 border-b border-gray-50 flex justify-between items-center bg-white">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              Yangi qabullar
              {orders.length > 0 && (
                <span className="bg-red-50 text-red-600 px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider">
                  {orders.length} ta yangi
                </span>
              )}
            </h3>
            <button className="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1">
              Barchasi <ChevronRight size={16} />
            </button>
          </div>
          
          <div className="p-6 flex-1 bg-gray-50/30">
            <div className="space-y-3">
              {orders.map((order) => (
                <div key={order.id} className="bg-white border border-gray-100 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row gap-4 justify-between sm:items-center hover:border-blue-100 transition-colors shadow-sm">
                  
                  <div className="flex gap-4 items-center">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold flex-shrink-0">
                      {(order.farmer?.name || "U")[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{order.farmer?.name || order.farmer?.phone}</p>
                      <div className="flex items-center gap-2 text-sm text-gray-500 font-medium mt-0.5">
                        <span className="text-gray-900 font-bold">{order.fruitType}</span> • 
                        <span>{order.quantity} kg</span> • 
                        <span className="text-amber-600">{order.quality}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button 
                      onClick={() => handleAcceptOrder(order.id)}
                      className="flex-1 sm:flex-none bg-green-50 text-green-700 p-2.5 rounded-xl text-sm font-bold hover:bg-green-100 transition-colors flex items-center justify-center gap-1.5 border border-green-200/50"
                    >
                      <Check size={18} />
                      <span className="sm:hidden">Qabul</span>
                    </button>
                    <button 
                      onClick={() => handleRejectOrder(order.id)}
                      className="flex-1 sm:flex-none bg-red-50 text-red-600 p-2.5 rounded-xl text-sm font-bold hover:bg-red-100 transition-colors flex items-center justify-center gap-1.5 border border-red-200/50"
                    >
                      <X size={18} />
                      <span className="sm:hidden">Rad etish</span>
                    </button>
                  </div>

                </div>
              ))}
              
              {orders.length === 0 && (
                <div className="text-center py-12 px-4">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ShoppingCart className="w-8 h-8 text-gray-300" />
                  </div>
                  <p className="text-gray-900 font-bold text-lg">Yangi qabullar yo'q</p>
                  <p className="text-gray-500 text-sm mt-1">Hozircha daladan yoki fermerlardan mahsulot kelmadi.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* O'ng ustun: Narxlar jadvali */}
        <div className="lg:col-span-2 bg-white rounded-[1.5rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-5 border-b border-gray-50 flex justify-between items-center bg-white">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">Hozirgi Narxlar</h3>
            <button className="bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 py-1.5 rounded-lg flex items-center text-sm font-bold transition-colors">
              <Plus size={16} className="mr-1" /> Narx
            </button>
          </div>
          
          <div className="p-2 flex-1">
            <div className="divide-y divide-gray-50">
              {prices.map((price) => (
                <div key={price.id} className="p-4 hover:bg-gray-50/50 transition-colors rounded-xl flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <div>
                      <p className="font-bold text-gray-900 text-sm">{price.fruitType}</p>
                      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mt-0.5">{price.quality} nav</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-gray-900">{price.pricePerKg?.toLocaleString()} <span className="text-xs text-gray-500 font-semibold">so'm</span></p>
                  </div>
                </div>
              ))}
              
              {prices.length === 0 && (
                <div className="text-center py-12 px-4">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="w-8 h-8 text-gray-300" />
                  </div>
                  <p className="text-gray-900 font-bold text-base">Narxlar belgilanmagan</p>
                  <p className="text-gray-500 text-sm mt-1 text-center">Fermerlar uchun narxlarni e'lon qiling.</p>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}