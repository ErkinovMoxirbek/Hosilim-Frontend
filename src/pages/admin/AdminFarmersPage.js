import React, { useState, useEffect, useCallback } from 'react';
import { 
  Search, RefreshCw, Users, Phone, 
  ChevronLeft, ChevronRight, Tractor, ShieldAlert, Building
} from 'lucide-react';
import { adminFarmerService } from '../../services/admin/adminFarmerService'; 

export default function AdminFarmersPage() {
  const [farmers, setFarmers] = useState([]);
  const [tableLoading, setTableLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  const [searchText, setSearchText] = useState('');
  const [filters, setFilters] = useState({ search: '' });
  const [pagination, setPagination] = useState({ page: 0, size: 15, totalElements: 0, totalPages: 0 });

  // Debounce (Qidiruvda yozishni to'xtatgandan keyin so'rov yuborish)
  useEffect(() => {
    const t = setTimeout(() => {
      setFilters({ search: searchText });
      setPagination(prev => ({ ...prev, page: 0 }));
    }, 500);
    return () => clearTimeout(t);
  }, [searchText]);

  const loadFarmers = useCallback(async () => {
    try {
      setTableLoading(true);
      setErrorMsg(null);
      const data = await adminFarmerService.getAllFarmers(filters.search, pagination.page, pagination.size);
      
      setFarmers(data.content || []);
      setPagination(prev => ({
        ...prev,
        totalElements: data.totalElements || 0,
        totalPages: data.totalPages || 0
      }));
    } catch (err) {
      setErrorMsg(err.message || "Fermerlarni yuklashda xatolik yuz berdi");
    } finally {
      setTableLoading(false);
    }
  }, [filters.search, pagination.page, pagination.size]);

  useEffect(() => {
    loadFarmers();
  }, [loadFarmers]);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* SARLAVHA VA TUGMALAR */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-800 flex items-center gap-3">
              <div className="p-3 bg-white shadow-sm text-green-600 rounded-2xl border border-green-100">
                <Tractor size={26} />
              </div>
              Barcha Fermerlar
            </h1>
            <p className="text-sm text-slate-500 mt-2 ml-[60px] font-medium">Tizimdagi barcha dehqon va fermerlar ro'yxati</p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Jami:</span>
              <span className="text-lg font-black text-slate-800">{pagination.totalElements}</span>
            </div>
            <button onClick={loadFarmers} className="p-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors shadow-sm">
              <RefreshCw size={20} className={tableLoading ? 'animate-spin text-green-600' : ''} />
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 text-sm font-bold flex items-center shadow-sm">
            <ShieldAlert size={18} className="mr-2" /> {errorMsg}
          </div>
        )}

        {/* QIDIRUV */}
        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Fermerning F.I.O yoki telefon raqami bo'yicha qidirish..." 
              value={searchText} 
              onChange={(e) => setSearchText(e.target.value)} 
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-sm focus:border-green-500 transition-colors outline-none" 
            />
          </div>
        </div>

        {/* JADVAL */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden relative">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 text-[10px] font-black uppercase tracking-wider">
                  <th className="p-4 pl-6">F.I.O (Ism Familiya)</th>
                  <th className="p-4">Telefon Raqami</th>
                  <th className="p-4">Ro'yxatga Olingan Joyi</th>
                  <th className="p-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tableLoading && farmers.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="p-16 text-center text-slate-400">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-3"></div>
                      <p className="font-bold text-slate-500">Fermerlar yuklanmoqda...</p>
                    </td>
                  </tr>
                ) : farmers.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="p-16 text-center text-slate-400">
                      <Users size={40} className="mx-auto mb-3 text-slate-300" />
                      <p className="font-bold text-slate-500">Hech qanday fermer topilmadi</p>
                    </td>
                  </tr>
                ) : (
                  farmers.map(farmer => {
                    // JSON obyektidagi qatorlarni xavfsiz ajratib olamiz
                    const firstName = farmer.firstName || '';
                    const lastName = farmer.lastName || '';
                    const fullName = `${firstName} ${lastName}`.trim() || "Noma'lum";
                    const initial = firstName ? firstName.charAt(0).toUpperCase() : 'F';
                    
                    return (
                      <tr key={farmer.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-4 pl-6">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-green-50 text-green-600 font-black flex items-center justify-center text-xs border border-green-100 shrink-0">
                              {initial}
                            </div>
                            <div>
                              <div className="font-bold text-slate-800 text-sm">
                                {fullName}
                              </div>
                              <div className="text-[10px] font-bold text-slate-400 uppercase mt-0.5 tracking-wider">
                                ID: #{farmer.id}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="text-sm font-mono text-slate-600 font-semibold flex items-center gap-2">
                            <Phone size={14} className="text-slate-400" /> {farmer.phoneNumber || 'Kiritilmagan'}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex flex-col">
                            <div className="text-sm font-medium text-slate-700 flex items-center gap-2">
                              <Building size={16} className="text-blue-500 shrink-0" /> 
                              <span className="truncate max-w-[200px]" title={farmer.addedByCollectionPointName || 'Noma\'lum'}>
                                {farmer.addedByCollectionPointName || "Noma'lum punkt"}
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-400 font-medium ml-6 mt-1 flex items-center gap-1">
                              <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-500">Qo'shgan:</span> {farmer.addedByName || 'Tizim'}
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-center">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                            farmer.isShadow ? 'bg-amber-100 text-amber-700 border border-amber-200' : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                          }`}>
                            {farmer.isShadow ? 'Soya Fermer' : 'Faol'}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          
          {/* Ustidan chiqadigan Loader (Sahifa almashganda) */}
          {tableLoading && farmers.length > 0 && (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center z-10">
              <div className="bg-white p-3 rounded-xl shadow-lg border border-slate-100 flex items-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-600 mr-3"></div>
                <span className="text-sm font-bold text-slate-600">Yuklanmoqda...</span>
              </div>
            </div>
          )}
        </div>

        {/* PAGINATSIYA */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <span className="text-xs font-bold text-slate-500">
              Sahifa: {pagination.page + 1} / {pagination.totalPages}
            </span>
            <div className="flex gap-2">
              <button 
                onClick={() => setPagination(p => ({ ...p, page: Math.max(0, p.page - 1) }))} 
                disabled={pagination.page === 0} 
                className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-50 transition-colors shadow-sm"
              >
                <ChevronLeft size={16} />
              </button>
              <button 
                onClick={() => setPagination(p => ({ ...p, page: Math.min(p.totalPages - 1, p.page + 1) }))} 
                disabled={pagination.page >= pagination.totalPages - 1} 
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