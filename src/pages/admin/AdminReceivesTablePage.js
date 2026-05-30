import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Search, RefreshCw, ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react';
import { adminStockService } from '../../services/admin/adminStockService'; // Manzilni tekshiring

const fmt = (n) => Number(n || 0).toLocaleString('uz-UZ');
const fmtKg = (n) => Number(n || 0).toFixed(1);

const formatDate = (isoString) => {
  if (!isoString) return '-';
  const d = new Date(isoString);
  return d.toLocaleDateString('uz-UZ', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

export default function AdminReceivesTablePage() {
  const { pointId } = useParams();
  const navigate = useNavigate();

  const [receives, setReceives] = useState([]);
  const [tableLoading, setTableLoading] = useState(true);

  // Filter inputlari (form submit qilinganda bazaga ketadi)
  const [searchInput, setSearchInput] = useState('');
  const [dateInputs, setDateInputs] = useState({ start: '', end: '' });
  
  // Real Filterlar (Backendga yuboriladigan)
  const [filters, setFilters] = useState({ search: '', startDate: '', endDate: '' });
  const [pagination, setPagination] = useState({ page: 0, size: 15, totalElements: 0, totalPages: 0 });

  const loadData = useCallback(async () => {
    try {
      setTableLoading(true);
      const params = {
        page: pagination.page, 
        size: pagination.size,
        search: filters.search, 
        startDate: filters.startDate || undefined, 
        endDate: filters.endDate || undefined
      };
      
      const data = await adminStockService.getReceivesByPoint(pointId, params);
      setReceives(data.content || []);
      setPagination(prev => ({ 
        ...prev, 
        totalElements: data.totalElements || 0, 
        totalPages: data.totalPages || 0 
      }));
    } catch (err) {
      console.error(err);
    } finally {
      setTableLoading(false);
    }
  }, [pointId, filters, pagination.page, pagination.size]);

  useEffect(() => { 
    loadData(); 
  }, [loadData]);

  // Form submit (Filtrlarni qo'llash)
  const handleApplyFilters = (e) => {
    e.preventDefault();
    setFilters({ search: searchInput, startDate: dateInputs.start, endDate: dateInputs.end });
    setPagination(prev => ({ ...prev, page: 0 }));
  };

  const clearFilters = () => {
    setSearchInput('');
    setDateInputs({ start: '', end: '' });
    setFilters({ search: '', startDate: '', endDate: '' });
    setPagination(prev => ({ ...prev, page: 0 }));
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-4">
        
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate(-1)} 
              className="p-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Kirimlar Tarixi</h1>
              <p className="text-sm text-slate-500 mt-0.5">Yig'uv punkti ID: #{pointId}</p>
            </div>
          </div>
          <button onClick={loadData} className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2 text-sm font-medium">
            <RefreshCw size={16} className={tableLoading ? 'animate-spin' : ''} />
            Yangilash
          </button>
        </div>

        {/* FILTERS */}
        <form onSubmit={handleApplyFilters} className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col xl:flex-row gap-4 items-end shadow-sm">
          <div className="w-full xl:w-80">
            <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">Fermer qidirish</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                value={searchInput} 
                onChange={(e) => setSearchInput(e.target.value)} 
                placeholder="Fermer Ismi, familiyasi..." 
                className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-slate-500" 
              />
            </div>
          </div>
          
          <div className="w-full xl:w-auto flex gap-2">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">Boshlanish sanasi</label>
              <input 
                type="date" 
                value={dateInputs.start} 
                onChange={(e) => setDateInputs({...dateInputs, start: e.target.value})} 
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-slate-500" 
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">Tugash sanasi</label>
              <input 
                type="date" 
                value={dateInputs.end} 
                onChange={(e) => setDateInputs({...dateInputs, end: e.target.value})} 
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-slate-500" 
              />
            </div>
          </div>

          <div className="flex gap-2 w-full xl:w-auto">
            <button type="button" onClick={clearFilters} className="px-4 py-2 bg-slate-100 text-slate-600 border border-slate-200 text-sm font-medium rounded-lg hover:bg-slate-200 transition-colors">
              Tozalash
            </button>
            <button type="submit" className="px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors">
              Filtrlash
            </button>
          </div>
        </form>

        {/* TABLE */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden relative">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <tr>
                  <th className="px-4 py-3">Sana</th>
                  <th className="px-4 py-3">Fermer</th>
                  <th className="px-4 py-3">Meva / Narx</th>
                  <th className="px-4 py-3">Sof Vazn / Tara</th>
                  <th className="px-4 py-3">Jami Summa</th>
                  <th className="px-4 py-3">Holati</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {receives.length === 0 && !tableLoading ? (
                  <tr><td colSpan="6" className="px-4 py-12 text-center text-slate-500">Ushbu punktda kirimlar mavjud emas</td></tr>
                ) : (
                  receives.map(item => (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 text-slate-600">
                        {formatDate(item.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-900">{item.farmerFullName || "Noma'lum"}</div>
                        <div className="text-xs text-slate-500">{item.farmerPhone}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium">{item.fruitName}</div>
                        <div className="text-xs text-slate-500">{fmt(item.unitPrice)} UZS / kg</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-medium">{fmtKg(item.netWeight)} kg</span>
                        {item.basketCount > 0 && <span className="text-xs text-slate-500 ml-2">({item.basketCount} tara)</span>}
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-900">
                        {fmt(item.totalAmount)} UZS
                      </td>
                      <td className="px-4 py-3">
                        {item.isPaid 
                          ? <span className="px-2.5 py-1 bg-green-50 text-green-700 border border-green-200 rounded-md text-xs font-semibold">To'langan</span> 
                          : <span className="px-2.5 py-1 bg-red-50 text-red-700 border border-red-200 rounded-md text-xs font-semibold">Qarz</span>}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {tableLoading && (
            <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] flex items-center justify-center z-10">
              <RefreshCw className="animate-spin text-slate-600" size={24} />
            </div>
          )}
        </div>

        {/* PAGINATION */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
            <span className="text-sm text-slate-600">
              Jami: <span className="font-semibold text-slate-900">{pagination.totalElements}</span> ta qayd
            </span>
            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-600">
                Sahifa: {pagination.page + 1} / {pagination.totalPages}
              </span>
              <div className="flex gap-1">
                <button onClick={() => setPagination(p => ({ ...p, page: Math.max(0, p.page - 1) }))} disabled={pagination.page === 0} className="p-1.5 rounded bg-white border border-slate-300 text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-colors"><ChevronLeft size={16} /></button>
                <button onClick={() => setPagination(p => ({ ...p, page: Math.min(p.totalPages - 1, p.page + 1) }))} disabled={pagination.page >= pagination.totalPages - 1} className="p-1.5 rounded bg-white border border-slate-300 text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-colors"><ChevronRight size={16} /></button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}