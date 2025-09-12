
import React, { useState, useEffect } from 'react';
import { 
  Users, Truck, Apple, DollarSign, Eye, CheckCircle,
  AlertTriangle, Clock, MapPin, Bell, Download, Send,
  Filter, Activity, BarChart3, RefreshCw, X
} from 'lucide-react';
import API_BASE_URL from "../../config";

const AdminDashboard = () => {
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [activities, setActivities] = useState([]);
  const [products, setProducts] = useState([]);
  const [regions, setRegions] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const headers = { Authorization: `Bearer ${token}` };

      // Parallel API calls
      const [statsRes, usersRes, activitiesRes, productsRes, regionsRes, complaintsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/admin/dashboard/stats`, { headers }),
        fetch(`${API_BASE_URL}/admin/users/recent?limit=10`, { headers }),
        fetch(`${API_BASE_URL}/admin/activities?limit=10`, { headers }),
        fetch(`${API_BASE_URL}/admin/products/top?limit=5`, { headers }),
        fetch(`${API_BASE_URL}/admin/regions/stats`, { headers }),
        fetch(`${API_BASE_URL}/admin/complaints?status=open&limit=5`, { headers })
      ]);

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

    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const approveUser = async (id) => {
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(`${API_BASE_URL}/admin/users/${id}/approve`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setUsers(users.map(u => u.id === id ? {...u, status: 'ACTIVE'} : u));
      }
    } catch (error) {
      console.error('Approve error:', error);
    }
  };

  const sendNotification = async () => {
    const message = prompt('Xabar kiriting:');
    if (!message) return;
    
    try {
      const token = localStorage.getItem("authToken");
      await fetch(`${API_BASE_URL}/admin/notifications/broadcast`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message, type: 'announcement' })
      });
      alert('Xabar yuborildi');
    } catch (error) {
      alert('Xabar yuborishda xatolik');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="ml-4">Yuklanmoqda...</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Tizim boshqaruv markazi</p>
        </div>
        <div className="flex space-x-3">
          <button onClick={() => {setRefreshing(true); fetchData();}} className="p-2 bg-white rounded-lg border">
            <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
          <button onClick={sendNotification} className="px-4 py-2 bg-blue-600 text-white rounded-lg">
            <Send className="w-4 h-4 mr-2 inline" />
            Xabar yuborish
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl border">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Jami Foydalanuvchilar</p>
              <p className="text-2xl font-bold">{stats.totalUsers || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Oylik Daromad</p>
              <p className="text-2xl font-bold">{(stats.monthlyCommission/1000000)?.toFixed(1) || 0}M</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border">
          <div className="flex items-center">
            <div className="p-3 bg-orange-100 rounded-lg">
              <Clock className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Tasdiqlash Kerak</p>
              <p className="text-2xl font-bold">{stats.pendingApprovals || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <BarChart3 className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Tranzaksiyalar</p>
              <p className="text-2xl font-bold">{stats.totalTransactions || 0}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Users Table */}
        <div className="lg:col-span-2 bg-white rounded-xl border">
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold">Yangi Foydalanuvchilar</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ism</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rol</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.map(user => (
                  <tr key={user.id}>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium">{user.name || 'Nomsiz'}</p>
                        <p className="text-sm text-gray-500">{user.phone}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">
                        {Array.isArray(user.role) ? user.role[0] : user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        user.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {user.status === 'ACTIVE' ? 'Faol' : 'Kutmoqda'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {user.status === 'PENDING' && (
                        <button onClick={() => approveUser(user.id)} className="text-green-600 hover:text-green-800">
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                      <button className="ml-2 text-blue-600 hover:text-blue-800">
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Activities */}
        <div className="bg-white rounded-xl border">
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold">So'ngi Faoliyat</h3>
          </div>
          <div className="p-6 space-y-4">
            {activities.map(activity => (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <Activity className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{activity.description}</p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="bg-white rounded-xl border">
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold">Top Mahsulotlar</h3>
          </div>
          <div className="p-6 space-y-4">
            {products.map((product, index) => (
              <div key={product.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-500 text-white rounded-lg flex items-center justify-center font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-gray-600">{product.totalSold}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{(product.revenue/1000000)?.toFixed(1)}M</p>
                  <p className="text-sm text-green-600">{product.growth}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Complaints */}
        <div className="bg-white rounded-xl border">
          <div className="p-6 border-b flex justify-between">
            <h3 className="text-lg font-semibold">Shikoyatlar</h3>
            <span className="px-2 py-1 bg-red-100 text-red-700 text-sm rounded-full">
              {complaints.length} faol
            </span>
          </div>
          <div className="p-6 space-y-4">
            {complaints.map(complaint => (
              <div key={complaint.id} className="flex justify-between items-center p-3 border rounded-lg">
                <div>
                  <p className="font-medium">{complaint.title || complaint.issue}</p>
                  <p className="text-sm text-gray-600">{complaint.userName || complaint.user}</p>
                  <p className="text-xs text-gray-500">{complaint.createdAt || complaint.time}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    complaint.priority === 'high' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {complaint.priority === 'high' ? 'Yuqori' : 'O\'rta'}
                  </span>
                  <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded">
                    Hal qilish
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;