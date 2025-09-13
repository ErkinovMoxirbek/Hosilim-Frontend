import React, { useState, useEffect } from 'react';
import { 
  Users, Truck, Apple, DollarSign, Eye, CheckCircle,
  AlertTriangle, Clock, MapPin, Bell, Download, Send,
  Filter, Activity, BarChart3, RefreshCw, X, Search,
  TrendingUp, TrendingDown, Package, Shield, Calendar,
  FileText, Settings, Award, Globe
} from 'lucide-react';
import API_BASE_URL from "../../config";

const AdminDashboard = () => {
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [activities, setActivities] = useState([]);
  const [products, setProducts] = useState([]);
  const [regions, setRegions] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [systemHealth, setSystemHealth] = useState({});
  const [marketData, setMarketData] = useState([]);
  const [financialData, setFinancialData] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('today');

  useEffect(() => {
    fetchData();
    // Auto refresh har 30 soniyada
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [selectedPeriod]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const headers = { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // Parallel API calls
      const [
        statsRes, usersRes, activitiesRes, productsRes, 
        regionsRes, complaintsRes, systemRes, marketRes, financialRes
      ] = await Promise.all([
        fetch(`${API_BASE_URL}/admin/dashboard/stats?period=${selectedPeriod}`, { headers }),
        fetch(`${API_BASE_URL}/admin/users/recent?limit=10`, { headers }),
        fetch(`${API_BASE_URL}/admin/activities?limit=10`, { headers }),
        fetch(`${API_BASE_URL}/admin/products/top?limit=5`, { headers }),
        fetch(`${API_BASE_URL}/admin/regions/stats`, { headers }),
        fetch(`${API_BASE_URL}/admin/complaints?status=open&limit=5`, { headers }),
        fetch(`${API_BASE_URL}/admin/system/health`, { headers }),
        fetch(`${API_BASE_URL}/admin/market/overview`, { headers }),
        fetch(`${API_BASE_URL}/admin/financial/summary?period=${selectedPeriod}`, { headers })
      ]);

      // Process responses
      if (statsRes.ok) {
        const data = await statsRes.json();
        setStats(data.data);
      }
      
      if (usersRes.ok) {
        const data = await usersRes.json();
        setUsers(data.data);
      }

      if (activitiesRes.ok) {
        const data = await activitiesRes.json();
        setActivities(data.data);
      }

      if (productsRes.ok) {
        const data = await productsRes.json();
        setProducts(data.data);
      }

      if (regionsRes.ok) {
        const data = await regionsRes.json();
        setRegions(data.data);
      }

      if (complaintsRes.ok) {
        const data = await complaintsRes.json();
        setComplaints(data.data);
      }

      if (systemRes.ok) {
        const data = await systemRes.json();
        setSystemHealth(data.data);
      }

      if (marketRes.ok) {
        const data = await marketRes.json();
        setMarketData(data.data);
      }

      if (financialRes.ok) {
        const data = await financialRes.json();
        setFinancialData(data.data);
      }

    } catch (error) {
      console.error('Fetch error:', error);
      showNotification('Ma\'lumotlarni yuklashda xatolik', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const showNotification = (message, type = 'info') => {
    alert(message); // Haqiqiy loyihada toast yoki notification kutubxonasi ishlatilishi mumkin
  };

  const approveUser = async (id) => {
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(`${API_BASE_URL}/admin/users/${id}/approve`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (res.ok) {
        setUsers(users.map(u => u.id === id ? {...u, status: 'ACTIVE'} : u));
        setStats(prev => ({...prev, pendingApprovals: prev.pendingApprovals - 1}));
        showNotification('Foydalanuvchi tasdiqlandi', 'success');
      } else {
        const error = await res.json();
        showNotification(error.message || 'Tasdiqlashda xatolik', 'error');
      }
    } catch (error) {
      console.error('Approve error:', error);
      showNotification('Tarmoq xatosi', 'error');
    }
  };

  const rejectUser = async (id) => {
    if (!window.confirm('Foydalanuvchini rad etishga ishonchingiz komilmi?')) return;
    
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(`${API_BASE_URL}/admin/users/${id}/reject`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (res.ok) {
        setUsers(users.filter(u => u.id !== id));
        setStats(prev => ({...prev, pendingApprovals: prev.pendingApprovals - 1}));
        showNotification('Foydalanuvchi rad etildi', 'success');
      }
    } catch (error) {
      console.error('Reject error:', error);
      showNotification('Rad etishda xatolik', 'error');
    }
  };

  const sendNotification = async () => {
    const message = prompt('Barcha foydalanuvchilarga yuborilacak xabarni kiriting:');
    if (!message?.trim()) return;
    
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(`${API_BASE_URL}/admin/notifications/broadcast`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          message: message.trim(), 
          type: 'announcement',
          priority: 'normal'
        })
      });
      
      if (res.ok) {
        showNotification('Xabar barcha foydalanuvchilarga yuborildi', 'success');
      } else {
        const error = await res.json();
        showNotification(error.message || 'Xabar yuborishda xatolik', 'error');
      }
    } catch (error) {
      console.error('Notification error:', error);
      showNotification('Tarmoq xatosi', 'error');
    }
  };

  const exportData = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(`${API_BASE_URL}/admin/export/dashboard?period=${selectedPeriod}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `admin_dashboard_${selectedPeriod}_${new Date().toISOString().split('T')[0]}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        showNotification('Ma\'lumotlar eksport qilindi', 'success');
      }
    } catch (error) {
      console.error('Export error:', error);
      showNotification('Eksport xatosi', 'error');
    }
  };

  const resolveComplaint = async (id) => {
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(`${API_BASE_URL}/admin/complaints/${id}/resolve`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (res.ok) {
        setComplaints(complaints.filter(c => c.id !== id));
        showNotification('Shikoyat hal qilindi', 'success');
      }
    } catch (error) {
      console.error('Resolve error:', error);
      showNotification('Hal qilishda xatolik', 'error');
    }
  };

  const formatNumber = (num) => {
    if (!num) return '0';
    if (num >= 1000000) return `${(num/1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num/1000).toFixed(0)}k`;
    return num.toLocaleString();
  };

  const formatCurrency = (amount) => {
    if (!amount) return '0 so\'m';
    return `${formatNumber(amount)} so'm`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Admin ma'lumotlari yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Tizim boshqaruv markazi - {new Date().toLocaleDateString('uz-UZ')}</p>
        </div>
        <div className="flex items-center space-x-3">
          <select 
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg bg-white"
          >
            <option value="today">Bugun</option>
            <option value="week">Bu hafta</option>
            <option value="month">Bu oy</option>
            <option value="year">Bu yil</option>
          </select>
          
          <button 
            onClick={() => {setRefreshing(true); fetchData();}} 
            disabled={refreshing}
            className="p-2 bg-white rounded-lg border hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
          
          <button 
            onClick={exportData}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
          >
            <Download className="w-4 h-4 mr-2" />
            Eksport
          </button>
          
          <button 
            onClick={sendNotification} 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <Send className="w-4 h-4 mr-2" />
            Xabar yuborish
          </button>
        </div>
      </div>

      {/* System Health Alert */}
      {systemHealth?.status && systemHealth.status !== 'healthy' && (
        <div className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-r-lg">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mr-3" />
            <div>
              <h4 className="font-semibold text-yellow-800">Tizim ogohlantirishi</h4>
              <p className="text-yellow-700 text-sm">{systemHealth.message}</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Jami Foydalanuvchilar</p>
                <p className="text-2xl font-bold text-gray-900">{formatNumber(stats.totalUsers)}</p>
                <p className="text-xs text-gray-500">
                  Fermer: {formatNumber(stats.activeFarmers)} | Broker: {formatNumber(stats.activeBrokers)}
                </p>
              </div>
            </div>
            <div className="text-right">
              {stats.userGrowth > 0 ? (
                <TrendingUp className="w-5 h-5 text-green-500" />
              ) : (
                <TrendingDown className="w-5 h-5 text-red-500" />
              )}
              <p className={`text-sm font-medium ${stats.userGrowth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {stats.userGrowth > 0 ? '+' : ''}{stats.userGrowth}%
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Platform Daromadi</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.monthlyCommission)}</p>
                <p className="text-xs text-gray-500">Bu oyda komissiya</p>
              </div>
            </div>
            <div className="text-right">
              <TrendingUp className="w-5 h-5 text-green-500" />
              <p className="text-sm font-medium text-green-600">+{stats.revenueGrowth || 15}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="p-3 bg-orange-100 rounded-lg">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Tasdiqlash Kutmoqda</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingApprovals || 0}</p>
                <p className={`text-xs font-medium ${
                  (stats.pendingApprovals || 0) > 0 ? 'text-orange-600' : 'text-green-600'
                }`}>
                  {(stats.pendingApprovals || 0) > 0 ? 'Diqqat talab qiladi' : 'Hammasi hal qilingan'}
                </p>
              </div>
            </div>
            {(stats.pendingApprovals || 0) > 0 && (
              <AlertTriangle className="w-5 h-5 text-orange-500" />
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <BarChart3 className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Tranzaksiyalar</p>
                <p className="text-2xl font-bold text-gray-900">{formatNumber(stats.totalTransactions)}</p>
                <p className="text-xs text-gray-500">
                  Jami aylanma: {formatCurrency(stats.totalVolume)}
                </p>
              </div>
            </div>
            <div className="text-right">
              <TrendingUp className="w-5 h-5 text-green-500" />
              <p className="text-sm font-medium text-green-600">+{stats.transactionGrowth || 8}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Users Table */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border">
          <div className="p-6 border-b border-gray-100">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Yangi Foydalanuvchilar</h3>
                <p className="text-sm text-gray-500">So'nggi ro'yxatdan o'tganlar</p>
              </div>
              <div className="flex items-center space-x-2">
                <Search className="w-4 h-4 text-gray-400" />
                <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full font-medium">
                  {users.length} ta
                </span>
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            {users.length > 0 ? (
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Foydalanuvchi
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rol
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amallar
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map(user => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">
                            {user.name?.charAt(0) || user.phone?.slice(-1)}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{user.name || user.surname || 'Nomsiz'}</p>
                            <p className="text-sm text-gray-500">{user.phone}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                          user.role === 'ADMIN' ? 'bg-red-100 text-red-700' :
                          user.role === 'BROKER' ? 'bg-blue-100 text-blue-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 text-xs rounded-full font-medium ${
                          user.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {user.status === 'ACTIVE' ? 'Faol' : 'Kutmoqda'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          {user.status === 'PENDING' && (
                            <>
                              <button 
                                onClick={() => approveUser(user.id)} 
                                className="text-green-600 hover:text-green-800 p-1 rounded hover:bg-green-50"
                                title="Tasdiqlash"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => rejectUser(user.id)} 
                                className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50"
                                title="Rad etish"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          <button 
                            className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50"
                            title="Batafsil"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-8 text-center text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Yangi foydalanuvchilar yo'q</p>
              </div>
            )}
          </div>
        </div>

        {/* Activities */}
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="p-6 border-b border-gray-100">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">So'nggi Faoliyat</h3>
                <p className="text-sm text-gray-500">Real-time monitoring</p>
              </div>
              <Activity className="w-5 h-5 text-gray-400" />
            </div>
          </div>
          
          <div className="p-6">
            {activities.length > 0 ? (
              <div className="space-y-4">
                {activities.map(activity => (
                  <div key={activity.id} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      activity.type === 'transaction' ? 'bg-green-100' :
                      activity.type === 'user' ? 'bg-blue-100' :
                      activity.type === 'complaint' ? 'bg-red-100' :
                      'bg-yellow-100'
                    }`}>
                      {activity.type === 'transaction' ? 
                        <DollarSign className="w-4 h-4 text-green-600" /> :
                        activity.type === 'user' ? 
                        <Users className="w-4 h-4 text-blue-600" /> :
                        activity.type === 'complaint' ? 
                        <AlertTriangle className="w-4 h-4 text-red-600" /> :
                        <Activity className="w-4 h-4 text-yellow-600" />
                      }
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                      {activity.user && <p className="text-xs text-gray-500 mt-1">{activity.user}</p>}
                      {activity.amount && (
                        <p className="text-xs text-green-600 font-medium mt-1">{activity.amount}</p>
                      )}
                      <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Hozircha faoliyat yo'q</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Top Products */}
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="p-6 border-b border-gray-100">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Top Mahsulotlar</h3>
                <p className="text-sm text-gray-500">Eng ko'p sotiladigan</p>
              </div>
              <BarChart3 className="w-5 h-5 text-gray-400" />
            </div>
          </div>
          
          <div className="p-6">
            {products.length > 0 ? (
              <div className="space-y-4">
                {products.map((product, index) => (
                  <div key={product.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:shadow-sm transition-shadow">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 text-white rounded-lg flex items-center justify-center font-bold text-sm ${
                        index === 0 ? 'bg-gradient-to-br from-yellow-400 to-orange-500' :
                        index === 1 ? 'bg-gradient-to-br from-gray-400 to-gray-500' :
                        index === 2 ? 'bg-gradient-to-br from-orange-400 to-red-500' :
                        'bg-gradient-to-br from-blue-400 to-purple-500'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{product.name}</p>
                        <p className="text-sm text-gray-600">{product.totalSold} sotildi</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{formatCurrency(product.revenue)}</p>
                      <p className={`text-sm font-medium ${
                        product.growth?.toString().startsWith('+') ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {product.growth}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Apple className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Mahsulot ma'lumotlari yo'q</p>
              </div>
            )}
          </div>
        </div>

        {/* Complaints */}
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="p-6 border-b border-gray-100">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Shikoyatlar</h3>
                <p className="text-sm text-gray-500">Hal qilish kerak bo'lgan masalalar</p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="px-3 py-1 bg-red-100 text-red-700 text-sm rounded-full font-medium">
                  {complaints.length} faol
                </span>
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
            </div>
          </div>
          
          <div className="p-6">
            {complaints.length > 0 ? (
              <div className="space-y-4">
                {complaints.map(complaint => (
                  <div key={complaint.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow">
                    <div className="flex items-center space-x-4">
                      <div className={`w-3 h-3 rounded-full ${
                        complaint.priority === 'high' ? 'bg-red-500' :
                        complaint.priority === 'medium' ? 'bg-yellow-500' :
                        'bg-green-500'
                      }`}></div>
                      <div>
                        <p className="font-medium text-gray-900">{complaint.title || complaint.issue}</p>
                        <p className="text-sm text-gray-600">{complaint.userName || complaint.user}</p>
                        <p className="text-xs text-gray-500">{complaint.createdAt || complaint.time}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                        complaint.priority === 'high' ? 'bg-red-100 text-red-700' :
                        complaint.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {complaint.priority === 'high' ? 'Yuqori' :
                         complaint.priority === 'medium' ? 'O\'rta' : 'Past'}
                      </span>
                      <button 
                        onClick={() => resolveComplaint(complaint.id)}
                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Hal qilish
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <CheckCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Barcha shikoyatlar hal qilingan</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Additional Stats Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Regional Stats */}
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900">Regional Statistika</h3>
            <p className="text-sm text-gray-500">Viloyatlar bo'yicha faollik</p>
          </div>
          <div className="p-6">
            {regions.length > 0 ? (
              <div className="space-y-4">
                {regions.map(region => (
                  <div key={region.id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium text-gray-900">{region.region}</h4>
                      <span className="text-sm text-gray-500">{region.users} user</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Tranzaksiyalar</p>
                        <p className="font-semibold text-blue-600">{region.transactions}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Daromad</p>
                        <p className="font-semibold text-green-600">{formatCurrency(region.revenue)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <MapPin className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Regional ma'lumotlar yo'q</p>
              </div>
            )}
          </div>
        </div>

        {/* Market Overview */}
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900">Bozor Ko'rinishi</h3>
            <p className="text-sm text-gray-500">Eng faol mahsulotlar</p>
          </div>
          <div className="p-6">
            {marketData.length > 0 ? (
              <div className="space-y-4">
                {marketData.map(item => (
                  <div key={item.id} className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-gray-900">{item.product}</p>
                      <p className="text-sm text-gray-600">{formatCurrency(item.avgPrice)} o'rtacha</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{item.volume} kg</p>
                      <div className={`flex items-center text-sm ${
                        item.trend === 'up' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {item.trend === 'up' ? 
                          <TrendingUp className="w-3 h-3 mr-1" /> : 
                          <TrendingDown className="w-3 h-3 mr-1" />
                        }
                        {item.change}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Bozor ma'lumotlari yo'q</p>
              </div>
            )}
          </div>
        </div>

        {/* Financial Summary */}
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900">Moliyaviy Xulosa</h3>
            <p className="text-sm text-gray-500">{selectedPeriod === 'today' ? 'Bugungi' : 'Umumiy'} ko'rsatkichlar</p>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Jami aylanma</span>
                <span className="font-bold text-gray-900">{formatCurrency(financialData.totalVolume)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Platform komissiyasi</span>
                <span className="font-bold text-green-600">{formatCurrency(financialData.totalCommission)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">O'rtacha tranzaksiya</span>
                <span className="font-semibold text-gray-900">{formatCurrency(financialData.avgTransaction)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Faol to'lovlar</span>
                <span className="font-semibold text-blue-600">{formatNumber(financialData.pendingPayments)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;