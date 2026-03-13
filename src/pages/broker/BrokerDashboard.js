import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, Users, Package, DollarSign, Plus, 
  Eye, Check, X, Star, TrendingUp 
} from 'lucide-react';
import API_BASE_URL from "../../config";

const BrokerDashboard = () => {
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
      
      // Broker statistikasi
      const statsResponse = await fetch(`${API_BASE_URL}/broker/dashboard/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData.data);
      }

      // Yangi buyurtmalar
      const ordersResponse = await fetch(`${API_BASE_URL}/broker/orders?status=pending&limit=10`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (ordersResponse.ok) {
        const ordersData = await ordersResponse.json();
        setOrders(ordersData.data);
      }

      // Mening narxlarim
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
        alert('Buyurtma qabul qilindi!');
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
        alert('Buyurtma rad etildi');
      }
    } catch (error) {
      console.error('Reject order error:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Broker Dashboard</h1>
        <p className="text-gray-600 mt-1">Buyurtmalar va inventar boshqaruvi</p>
      </div>

      {/* Statistika */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
        <div className="bg-white rounded-xl p-4 lg:p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 lg:p-3 bg-blue-100 rounded-lg">
              <ShoppingCart className="h-5 w-5 lg:h-6 lg:w-6 text-blue-600" />
            </div>
            <div className="ml-3 lg:ml-4">
              <p className="text-xs lg:text-sm text-gray-600">Yangi Buyurtmalar</p>
              <p className="text-lg lg:text-2xl font-bold text-gray-900">{stats.pendingOrders}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 lg:p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 lg:p-3 bg-green-100 rounded-lg">
              <Users className="h-5 w-5 lg:h-6 lg:w-6 text-green-600" />
            </div>
            <div className="ml-3 lg:ml-4">
              <p className="text-xs lg:text-sm text-gray-600">Faol Fermerlar</p>
              <p className="text-lg lg:text-2xl font-bold text-gray-900">{stats.activeFarmers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 lg:p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 lg:p-3 bg-yellow-100 rounded-lg">
              <Package className="h-5 w-5 lg:h-6 lg:w-6 text-yellow-600" />
            </div>
            <div className="ml-3 lg:ml-4">
              <p className="text-xs lg:text-sm text-gray-600">Omborxona</p>
              <p className="text-lg lg:text-2xl font-bold text-gray-900">{stats.totalInventory} kg</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 lg:p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 lg:p-3 bg-purple-100 rounded-lg">
              <DollarSign className="h-5 w-5 lg:h-6 lg:w-6 text-purple-600" />
            </div>
            <div className="ml-3 lg:ml-4">
              <p className="text-xs lg:text-sm text-gray-600">Kunlik Daromad</p>
              <p className="text-lg lg:text-2xl font-bold text-gray-900">{stats.dailyIncome?.toLocaleString()} so'm</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Yangi buyurtmalar */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="p-4 lg:p-6 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">Yangi Buyurtmalar</h3>
            <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-medium">
              {orders.length} yangi
            </span>
          </div>
          <div className="p-4 lg:p-6">
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-medium text-gray-900">{order.farmer?.name || order.farmer?.phone}</p>
                      <p className="text-sm text-gray-600">{order.fruitType} - {order.quantity}kg</p>
                      <p className="text-sm text-gray-600">Sifat: {order.quality}</p>
                      <p className="text-sm text-gray-600">Taklif narx: {order.proposedPrice?.toLocaleString()} so'm/kg</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => handleAcceptOrder(order.id)}
                      className="bg-green-100 text-green-700 px-3 py-1 rounded-md text-sm font-medium hover:bg-green-200 transition-colors flex items-center"
                    >
                      <Check className="w-4 h-4 mr-1" />
                      Qabul qilish
                    </button>
                    <button 
                      onClick={() => handleRejectOrder(order.id)}
                      className="bg-red-100 text-red-700 px-3 py-1 rounded-md text-sm font-medium hover:bg-red-200 transition-colors flex items-center"
                    >
                      <X className="w-4 h-4 mr-1" />
                      Rad etish
                    </button>
                  </div>
                </div>
              ))}
              
              {orders.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <ShoppingCart className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Yangi buyurtmalar yo'q</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mening narxlarim */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="p-4 lg:p-6 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">Mening Narxlarim</h3>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center text-sm">
              <Plus className="w-4 h-4 mr-2" />
              Yangi Narx
            </button>
          </div>
          <div className="p-4 lg:p-6">
            <div className="space-y-3">
              {prices.map((price) => (
                <div key={price.id} className="flex justify-between items-center py-3 border-b border-gray-100">
                  <div>
                    <p className="font-medium text-gray-900">{price.fruitType}</p>
                    <p className="text-sm text-gray-600">Sifat: {price.quality}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">{price.pricePerKg?.toLocaleString()} so'm/kg</p>
                    <p className="text-xs text-gray-500">Yangilandi: {new Date(price.updatedAt).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
              
              {prices.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <DollarSign className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Hali narxlar belgilanmagan</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrokerDashboard;