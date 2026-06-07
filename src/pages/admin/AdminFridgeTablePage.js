import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Search, RefreshCw, ChevronLeft, ChevronRight, ArrowLeft, Snowflake, Box, Thermometer } from 'lucide-react';
import { adminStockService } from '../../services/admin/adminStockService';

const fmtKg = (n) => Number(n || 0).toLocaleString('uz-UZ', { maximumFractionDigits: 1 });
const formatDate = (isoString) => {
  if (!isoString) return '-';
  return new Date(isoString).toLocaleString('uz-UZ', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

export default function AdminFridgeTablePage() {
  const { pointId } = useParams();
  const navigate = useNavigate();

  const [stocks, setStocks] = useState([]);
  const [tableLoading, setTableLoading] = useState(true);

  const [searchInput, setSearchInput] = useState('');
  const [filters, setFilters] = useState({ search: '' });
  const [pagination, setPagination] = useState({ page: 0, size: 15, totalElements: 0, totalPages: 0 });

  const loadData = useCallback(async () => {
    try {
      setTableLoading(true);
      const data = await adminStockService.getFridgeStocksByPoint(pointId, filters.search, pagination.page, pagination.size);
      setStocks(data.content || []);
      setPagination(prev => ({ ...prev, totalElements: data.totalElements || 0, totalPages: data.totalPages || 0 }));
    } catch (err) { 
      console.error(err); 
    } finally { 
      setTableLoading(false); 
    }
  }, [pointId, filters.search, pagination.page, pagination.size]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleApplyFilters = (e) => {
    e.preventDefault();
    setFilters({ search: searchInput });
    setPagination(prev => ({ ...prev, page: 0 }));
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-4">
        
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="p-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors">
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Xolodilnik Ichidagi Zaxiralar</h1>
              <p className="text-sm text-cyan-600 font-semibold mt-0.5">Yig'uv punkti ID: #{pointId}</p>
            </div>
          </div>
          <button onClick={loadData} className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2 text-sm font-medium shadow-sm">
            <RefreshCw size={16} className={tableLoading ? 'animate-spin' : ''} /> Yangilash
          </button>
        </div>

        {/* FILTERS */}
        <form onSubmit={handleApplyFilters} className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row gap-4 items-center shadow-sm mt-6">
          <div className="relative flex-1 w-full md:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} 
              placeholder="Meva nomi bo'yicha qidirish..." 
              className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500" 
            />
          </div>
          <button type="submit" className="w-full sm:w-auto px-6 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors">
            Qidirish
          </button>
        </form>

        {/* TABLE */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden relative mt-4 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <tr>
                  <th className="px-4 py-3">Kelgan Vaqti</th>
                  <th className="px-4 py-3">Xolodilnik Nomi</th>
                  <th className="px-4 py-3">Meva Turi</th>
                  <th className="px-4 py-3">Sof Vazn / Yalpi</th>
                  <th className="px-4 py-3">Tara Ma'lumoti</th>
                  <th className="px-4 py-3">Holati</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {stocks.length === 0 && !tableLoading ? (
                  <tr><td colSpan="6" className="px-4 py-12 text-center text-slate-500">Omborda xolodilnik zaxiralari mavjud emas</td></tr>
                ) : (
                  stocks.map(stock => (
                    <tr key={stock.id} className="hover:bg-slate-50">
                      
                      {/* Kelgan vaqti (enteredAt) */}
                      <td className="px-4 py-3 text-slate-600 text-[13px]">
                        {formatDate(stock.enteredAt)}
                      </td>
                      
                      {/* Qaysi Xolodilnik (fridge.name) */}
                      <td className="px-4 py-3">
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          <Thermometer size={14} className="text-cyan-500"/>
                          {stock.fridgeName || "Umumiy ombor"}
                        </div>
                      </td>

                      {/* Meva (fruitType.name) */}
                      <td className="px-4 py-3 font-semibold text-slate-800">
                        {stock.fruitName}
                      </td>

                      {/* Vaznlar (netWeight / grossWeight) */}
                      <td className="px-4 py-3">
                        <div className="font-bold text-cyan-700 bg-cyan-50 border border-cyan-100 px-2 py-1 rounded inline-block">
                          {fmtKg(stock.netWeight)} kg
                        </div>
                        <div className="text-[11px] text-slate-400 font-medium mt-1">
                          Yalpi: {fmtKg(stock.grossWeight)} kg
                        </div>
                      </td>

                      {/* Tara (basketCount & basketName) */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <Box size={14} className="text-slate-400" />
                          <span className="font-medium text-slate-900">{stock.basketCount} ta</span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-1 truncate max-w-[150px]">
                          {stock.basketName || "Tara yo'q"}
                        </div>
                      </td>

                      {/* Holati (Status) */}
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 bg-cyan-50 text-cyan-700 border border-cyan-200 rounded text-[10px] font-bold uppercase tracking-wider flex items-center w-max gap-1">
                          <Snowflake size={12} /> {stock.status || "ACTIVE"}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {tableLoading && (
            <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] flex items-center justify-center z-10">
              <RefreshCw className="animate-spin text-cyan-600" size={24} />
            </div>
          )}
        </div>

        {/* PAGINATION */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-slate-200 shadow-sm mt-4">
            <span className="text-sm text-slate-600">
              Jami zaxiralar: <span className="font-bold">{pagination.totalElements}</span> ta
            </span>
            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-600">Sahifa: {pagination.page + 1} / {pagination.totalPages}</span>
              <div className="flex gap-1">
                <button onClick={() => setPagination(p => ({ ...p, page: Math.max(0, p.page - 1) }))} disabled={pagination.page === 0} className="p-1.5 rounded bg-white border border-slate-300 text-slate-600 hover:bg-slate-50 disabled:opacity-50"><ChevronLeft size={16} /></button>
                <button onClick={() => setPagination(p => ({ ...p, page: Math.min(p.totalPages - 1, p.page + 1) }))} disabled={pagination.page >= pagination.totalPages - 1} className="p-1.5 rounded bg-white border border-slate-300 text-slate-600 hover:bg-slate-50 disabled:opacity-50"><ChevronRight size={16} /></button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}