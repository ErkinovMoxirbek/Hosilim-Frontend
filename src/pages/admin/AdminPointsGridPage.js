import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layers, MapPin, User, ChevronRight, RefreshCw, Search, ChevronLeft } from 'lucide-react';
import { adminStockService } from '../../services/admin/adminStockService'; // Manzilni tekshiring

const fmt = (n) => Number(n || 0).toLocaleString('uz-UZ');

export default function AdminPointsGridPage() {
  const navigate = useNavigate();
  const [points, setPoints] = useState([]);
  const [loading, setLoading] = useState(true);

  // Qidiruv va Paginatsiya
  const [searchInput, setSearchInput] = useState('');
  const [filters, setFilters] = useState({ search: '' });
  const [pagination, setPagination] = useState({ page: 0, size: 12, totalElements: 0, totalPages: 0 });

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await adminStockService.getPointsSummary(filters.search, pagination.page, pagination.size);
      
      setPoints(data.content || []);
      setPagination(prev => ({
        ...prev,
        totalElements: data.totalElements || 0,
        totalPages: data.totalPages || 0
      }));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filters.search, pagination.page, pagination.size]);

  useEffect(() => { 
    loadData(); 
  }, [loadData]);

  const handleSearch = (e) => {
    e.preventDefault();
    setFilters({ search: searchInput });
    setPagination(prev => ({ ...prev, page: 0 }));
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Layers size={24} className="text-slate-700" />
              Yig'uv Punktlari (Omborlar)
            </h1>
            <p className="text-sm text-slate-500 mt-1">Aylanmalar tarixini ko'rish uchun yig'uv punktlaridan birini tanlang</p>
          </div>
          <button onClick={loadData} className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2 text-sm font-medium">
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Yangilash
          </button>
        </div>

        {/* SEARCH BAR */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Punkt nomini kiriting va Enter bosing..." 
              value={searchInput} 
              onChange={(e) => setSearchInput(e.target.value)} 
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500" 
            />
          </div>
          <button type="submit" className="px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors">
            Qidirish
          </button>
        </form>

        {/* GRID LAYOUT */}
        {loading && points.length === 0 ? (
           <div className="flex justify-center py-20 text-slate-400"><RefreshCw className="animate-spin" size={24} /></div>
        ) : points.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500 bg-white border border-slate-200 rounded-xl shadow-sm">
            <Layers size={32} className="mb-3 text-slate-300" />
            <p className="font-medium text-sm">Hech qanday yig'uv punkti topilmadi.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 relative">
              {points.map(point => (
                <button 
                  key={point.pointId} 
                  onClick={() => navigate(`/dashboard/admin/admin-stock/receives/${point.pointId}`)}
                  className="bg-white p-5 rounded-xl border border-slate-200 hover:border-slate-400 transition-colors text-left flex flex-col h-full focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-1"
                >
                  <div className="flex items-start justify-between w-full">
                    <h3 className="text-base font-bold text-slate-900 line-clamp-1">{point.pointName}</h3>
                    <ChevronRight size={18} className="text-slate-400 shrink-0" />
                  </div>
                  
                  <div className="mt-3 space-y-2 flex-1">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <MapPin size={14} className="text-slate-400 shrink-0" /> 
                      <span className="truncate">{point.region || "Hudud kiritilmagan"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <User size={14} className="text-slate-400 shrink-0" /> 
                      <span className="truncate">{point.ownerName || "Tayinlanmagan"}</span>
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-100 flex justify-between items-center">
                    <div>
                      <div className="text-[10px] uppercase font-bold text-slate-500">Jami Kirim</div>
                      <div className="text-sm font-semibold text-slate-900">{fmt(point.totalTransactions)} ta</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] uppercase font-bold text-slate-500">Jami Summa</div>
                      <div className="text-sm font-semibold text-green-700">{fmt(point.totalAmount)} UZS</div>
                    </div>
                  </div>
                </button>
              ))}

              {loading && points.length > 0 && (
                <div className="absolute inset-0 bg-slate-50/50 backdrop-blur-[1px] flex items-center justify-center z-10 rounded-xl">
                  <RefreshCw className="animate-spin text-slate-600" size={24} />
                </div>
              )}
            </div>

            {/* PAGINATION */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                <span className="text-sm text-slate-600">
                  Jami: <span className="font-semibold text-slate-900">{pagination.totalElements}</span> ta
                </span>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-slate-600">
                    {pagination.page + 1} / {pagination.totalPages}
                  </span>
                  <div className="flex gap-1">
                    <button onClick={() => setPagination(p => ({ ...p, page: Math.max(0, p.page - 1) }))} disabled={pagination.page === 0} className="p-1.5 rounded bg-white border border-slate-300 text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-colors"><ChevronLeft size={16} /></button>
                    <button onClick={() => setPagination(p => ({ ...p, page: Math.min(p.totalPages - 1, p.page + 1) }))} disabled={pagination.page >= pagination.totalPages - 1} className="p-1.5 rounded bg-white border border-slate-300 text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-colors"><ChevronRight size={16} /></button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}