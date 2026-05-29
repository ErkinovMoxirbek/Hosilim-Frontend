import React, { useState, useEffect, useCallback } from 'react';
import { 
  Search, RefreshCw, Users, Phone, MapPin, 
  ChevronLeft, ChevronRight, ShieldAlert, UserCircle,
  Briefcase, Calculator, Tractor, Shield
} from 'lucide-react';
import { adminUserService } from '../../services/admin/adminUserService'; 

export default function AdminUsersManagement() {
  const [usersList, setUsersList] = useState([]);
  const [tableLoading, setTableLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  const [searchText, setSearchText] = useState('');
  
  // 🟢 Filterlar (Rol va Status)
  const [filters, setFilters] = useState({ 
    search: '', 
    role: 'ALL', 
    status: 'ALL' 
  });
  
  // 🟢 Paginatsiya (Backend getPage() - 1 qilgani uchun, bu yerda 1 dan boshlaymiz)
  const [pagination, setPagination] = useState({ page: 1, limit: 15, totalElements: 0, totalPages: 0 });

  // Debounce (Qidiruvda yozishni to'xtatgandan keyin so'rov yuborish)
  useEffect(() => {
    const t = setTimeout(() => {
      setFilters(prev => ({ ...prev, search: searchText }));
      setPagination(prev => ({ ...prev, page: 1 })); // Qidiruv o'zgarsa, 1-sahifaga qaytadi
    }, 500);
    return () => clearTimeout(t);
  }, [searchText]);

  const loadUsers = useCallback(async () => {
    try {
      setTableLoading(true);
      setErrorMsg(null);
      
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        search: filters.search,
        role: filters.role === 'ALL' ? '' : filters.role,
        status: filters.status === 'ALL' ? '' : filters.status,
      };

      const response = await adminUserService.getUsers(params);
      
      setUsersList(response.data || []);
      setPagination(prev => ({
        ...prev,
        totalElements: response.total || 0,
        totalPages: response.meta?.totalPages || 0
      }));
    } catch (err) {
      setErrorMsg(err.message || "Foydalanuvchilarni yuklashda xatolik yuz berdi");
    } finally {
      setTableLoading(false);
    }
  }, [filters, pagination.page, pagination.limit]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // 🟢 Rolga qarab chiroyli dizayn (Badge) beruvchi funksiya
  const RoleBadge = ({ roles }) => {
    if (!roles || roles.length === 0) return <span className="text-gray-400">Rol yo'q</span>;
    
    // Agar massiv emas string kelsa, massivga aylantiramiz
    const roleList = Array.isArray(roles) ? roles : [roles];

    return (
      <div className="flex flex-wrap gap-1">
        {roleList.map((r, i) => {
          const role = String(r).toUpperCase();
          if (role.includes('ADMIN')) return <span key={i} className="flex items-center gap-1 text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded text-[10px] font-black tracking-widest"><Shield size={10}/> ADMIN</span>;
          if (role.includes('BROKER')) return <span key={i} className="flex items-center gap-1 text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded text-[10px] font-black tracking-widest"><Briefcase size={10}/> BROKER</span>;
          if (role.includes('ACCOUNTANT')) return <span key={i} className="flex items-center gap-1 text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded text-[10px] font-black tracking-widest"><Calculator size={10}/> HISOBCHI</span>;
          if (role.includes('FARMER')) return <span key={i} className="flex items-center gap-1 text-orange-700 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded text-[10px] font-black tracking-widest"><Tractor size={10}/> FERMER</span>;
          return <span key={i} className="text-gray-700 bg-gray-100 px-2 py-0.5 rounded text-[10px] font-black tracking-widest border border-gray-200">{role}</span>;
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* SARLAVHA VA TUGMALAR */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-800 flex items-center gap-3">
              <div className="p-3 bg-white shadow-sm text-indigo-600 rounded-2xl border border-indigo-100">
                <Users size={26} />
              </div>
              Foydalanuvchilar
            </h1>
            <p className="text-sm text-slate-500 mt-2 ml-[60px] font-medium">Tizimdagi barcha ishtirokchilar nazorati</p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Jami:</span>
              <span className="text-lg font-black text-slate-800">{pagination.totalElements}</span>
            </div>
            <button onClick={loadUsers} className="p-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors shadow-sm">
              <RefreshCw size={20} className={tableLoading ? 'animate-spin text-indigo-600' : ''} />
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 text-sm font-bold flex items-center shadow-sm">
            <ShieldAlert size={18} className="mr-2" /> {errorMsg}
          </div>
        )}

        {/* QIDIRUV VA FILTRLAR */}
        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Ism, familiya yoki telefon bo'yicha qidirish..." 
              value={searchText} 
              onChange={(e) => setSearchText(e.target.value)} 
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-sm focus:border-indigo-500 transition-colors outline-none" 
            />
          </div>
          
          <select 
            value={filters.role} 
            onChange={(e) => { setFilters({...filters, role: e.target.value}); setPagination({...pagination, page: 1}); }}
            className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm text-slate-700 focus:border-indigo-500 outline-none cursor-pointer"
          >
            <option value="ALL">Barcha Rollar</option>
            <option value="ADMIN">Adminlar</option>
            <option value="BROKER">Brokerlar</option>
            <option value="ACCOUNTANT">Hisobchilar</option>
            <option value="FARMER">Fermerlar</option>
          </select>

          <select 
            value={filters.status} 
            onChange={(e) => { setFilters({...filters, status: e.target.value}); setPagination({...pagination, page: 1}); }}
            className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm text-slate-700 focus:border-indigo-500 outline-none cursor-pointer"
          >
            <option value="ALL">Barcha Statuslar</option>
            <option value="ACTIVE">Faol</option>
            <option value="INACTIVE">Faol Emas</option>
            <option value="BLOCKED">Bloklangan</option>
          </select>
        </div>

        {/* JADVAL */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden relative">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 text-[10px] font-black uppercase tracking-wider">
                  <th className="p-4 pl-6">Foydalanuvchi</th>
                  <th className="p-4">Telefon Raqami</th>
                  <th className="p-4">Rol / Vazifa</th>
                  <th className="p-4">Manzil</th>
                  <th className="p-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tableLoading && usersList.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-16 text-center text-slate-400">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-3"></div>
                      <p className="font-bold text-slate-500">Ma'lumotlar yuklanmoqda...</p>
                    </td>
                  </tr>
                ) : usersList.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-16 text-center text-slate-400">
                      <UserCircle size={40} className="mx-auto mb-3 text-slate-300" />
                      <p className="font-bold text-slate-500">Hech qanday foydalanuvchi topilmadi</p>
                    </td>
                  </tr>
                ) : (
                  usersList.map(usr => (
                    <tr key={usr.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 pl-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 font-black flex items-center justify-center text-xs border border-indigo-100 shrink-0">
                            {usr.name ? usr.name.charAt(0).toUpperCase() : 'U'}
                          </div>
                          <div>
                            <div className="font-bold text-slate-800 text-sm">
                              {usr.name} {usr.surname}
                            </div>
                            <div className="text-[10px] font-bold text-slate-400 uppercase mt-0.5 tracking-wider">
                              ID: #{usr.id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm font-mono text-slate-600 font-semibold flex items-center gap-2">
                          <Phone size={14} className="text-slate-400" /> {usr.phone || 'Kiritilmagan'}
                        </div>
                      </td>
                      <td className="p-4">
                        {/* 🟢 Tizimdagi rolni aniqlab nishon qo'yish */}
                        <RoleBadge roles={usr.role || usr.roles} />
                      </td>
                      <td className="p-4">
                        <div className="text-sm font-medium text-slate-600 flex items-center gap-2">
                          <MapPin size={16} className="text-indigo-400 shrink-0" /> 
                          <span className="truncate max-w-[150px]" title={usr.address || 'Manzil kiritilmagan'}>
                            {usr.address || 'Kiritilmagan'}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                          usr.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 
                          usr.status === 'INACTIVE' ? 'bg-amber-100 text-amber-700' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                          {usr.status === 'ACTIVE' ? 'Faol' : usr.status === 'INACTIVE' ? 'Faol Emas' : usr.status || 'Noaniq'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {/* Ustidan chiqadigan Loader (Sahifa almashganda) */}
          {tableLoading && usersList.length > 0 && (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center z-10">
              <div className="bg-white p-3 rounded-xl shadow-lg border border-slate-100 flex items-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600 mr-3"></div>
                <span className="text-sm font-bold text-slate-600">Yuklanmoqda...</span>
              </div>
            </div>
          )}
        </div>

        {/* PAGINATSIYA */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <span className="text-xs font-bold text-slate-500">
              Sahifa: {pagination.page} / {pagination.totalPages}
            </span>
            <div className="flex gap-2">
              <button 
                onClick={() => setPagination(p => ({ ...p, page: Math.max(1, p.page - 1) }))} 
                disabled={pagination.page === 1} 
                className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-50 transition-colors shadow-sm"
              >
                <ChevronLeft size={16} />
              </button>
              <button 
                onClick={() => setPagination(p => ({ ...p, page: Math.min(p.totalPages, p.page + 1) }))} 
                disabled={pagination.page >= pagination.totalPages} 
                className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-50 transition-colors shadow-sm"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}