import React, { useState, useEffect } from 'react';
import { 
  Users, Truck, Apple, DollarSign, Eye, Edit, Trash2, 
  Plus, Search, BarChart3, Settings, TrendingUp, CheckCircle 
} from 'lucide-react';
import API_BASE_URL from "../../config";


const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeBrokers: 0,
    activeFarmers: 0,
    dailyRevenue: 0
  });
  const [users, setUsers] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const token = localStorage.getItem("authToken");
      
      // Statistika olish
      const statsResponse = await fetch(`${API_BASE_URL}/admin/dashboard/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData.data);
      }

      // Foydalanuvchilar ro'yxati
      const usersResponse = await fetch(`${API_BASE_URL}/admin/users?limit=10`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        setUsers(usersData.data.users);
      }

      // So'nggi faoliyat
      const activitiesResponse = await fetch(`${API_BASE_URL}/admin/activities?limit=5`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (activitiesResponse.ok) {
        const activitiesData = await activitiesResponse.json();
        setActivities(activitiesData.data);
      }

    } catch (error) {
      console.error('Admin data fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Foydalanuvchini o\'chirishga ishonchingiz komilmi?')) return;
    
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.ok) {
        setUsers(users.filter(user => user.id !== userId));
        alert('Foydalanuvchi muvaffaqiyatli o\'chirildi');
      }
    } catch (error) {
      console.error('Delete user error:', error);
      alert('Foydalanuvchini o\'chirishda xatolik');
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
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-1">Tizim ko'rinishi va boshqaruv</p>
      </div>

      {/* Statistika kartochalari */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
        <div className="bg-white rounded-xl p-4 lg:p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 lg:p-3 bg-blue-100 rounded-lg">
              <Users className="h-5 w-5 lg:h-6 lg:w-6 text-blue-600" />
            </div>
            <div className="ml-3 lg:ml-4">
              <p className="text-xs lg:text-sm text-gray-600">Jami Foydalanuvchilar</p>
              <p className="text-lg lg:text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 lg:p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 lg:p-3 bg-green-100 rounded-lg">
              <Truck className="h-5 w-5 lg:h-6 lg:w-6 text-green-600" />
            </div>
            <div className="ml-3 lg:ml-4">
              <p className="text-xs lg:text-sm text-gray-600">Faol Brokerlar</p>
              <p className="text-lg lg:text-2xl font-bold text-gray-900">{stats.activeBrokers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 lg:p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 lg:p-3 bg-yellow-100 rounded-lg">
              <Apple className="h-5 w-5 lg:h-6 lg:w-6 text-yellow-600" />
            </div>
            <div className="ml-3 lg:ml-4">
              <p className="text-xs lg:text-sm text-gray-600">Faol Fermerlar</p>
              <p className="text-lg lg:text-2xl font-bold text-gray-900">{stats.activeFarmers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 lg:p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 lg:p-3 bg-purple-100 rounded-lg">
              <DollarSign className="h-5 w-5 lg:h-6 lg:w-6 text-purple-600" />
            </div>
            <div className="ml-3 lg:ml-4">
              <p className="text-xs lg:text-sm text-gray-600">Kunlik Aylanma</p>
              <p className="text-lg lg:text-2xl font-bold text-gray-900">{stats.dailyRevenue?.toLocaleString()} so'm</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Foydalanuvchilar ro'yxati */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200">
          <div className="p-4 lg:p-6 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">So'nggi Foydalanuvchilar</h3>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center text-sm">
              <Plus className="w-4 h-4 mr-2" />
              Yangi User
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ism</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rol</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden lg:table-cell">Telefon</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-4 py-4 text-sm text-gray-900">{user.name || user.phone}</td>
                    <td className="px-4 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        user.role === 'ADMIN' ? 'bg-red-100 text-red-700' :
                        user.role === 'BROKER' ? 'bg-blue-100 text-blue-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600 hidden lg:table-cell">{user.phone}</td>
                    <td className="px-4 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        user.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {user.status === 'ACTIVE' ? 'Faol' : 'Nofaol'}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex space-x-2">
                        <button className="text-blue-600 hover:text-blue-800">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="text-green-600 hover:text-green-800">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* So'nggi faoliyat */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="p-4 lg:p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">So'nggi Faoliyat</h3>
          </div>
          <div className="p-4 lg:p-6">
            <div className="space-y-4">
              {activities.map((activity, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-900">{activity.description}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;