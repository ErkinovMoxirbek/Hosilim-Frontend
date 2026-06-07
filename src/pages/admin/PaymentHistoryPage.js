import React, { useState, useEffect, useCallback } from 'react';
import { Search, RefreshCw, Download, FileText } from 'lucide-react';
import { paymentService } from '../../services/paymentService';

const fmt = (n) => Number(n || 0).toLocaleString('uz-UZ');
const formatDate = (iso) => iso ? new Date(iso).toLocaleString('uz-UZ', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-';

export default function PaymentHistoryPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchInput, setSearchInput] = useState('');
  const [filters, setFilters] = useState({ search: '' });
  const [pagination, setPagination] = useState({ page: 0, size: 15, totalElements: 0, totalPages: 0 });

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await paymentService.getHistory(filters.search, pagination.page, pagination.size);
      setHistory(data.content || []);
      setPagination(prev => ({ ...prev, totalElements: data.totalElements || 0, totalPages: data.totalPages || 0 }));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filters.search, pagination.page, pagination.size]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleSearch = (e) => {
    e.preventDefault();
    setFilters({ search: searchInput });
    setPagination(prev => ({ ...prev, page: 0 }));
  };

  const handleDownload = async (id) => {
    try {
      await paymentService.downloadReceipt(id);
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-4">
        
        <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <FileText size={26} className="text-slate-600" /> To'lov Tarixi
            </h1>
          </div>
          <button onClick={loadData} className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 flex items-center gap-2 text-sm font-medium transition-colors">
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Yangilash
          </button>
        </div>

        <form onSubmit={handleSearch} className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row gap-4 items-center shadow-sm mt-6">
          <div className="relative flex-1 w-full md:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} 
              placeholder="Fermer F.I.O yoki chek raqami bo'yicha..." 
              className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-slate-500" 
            />
          </div>
          <button type="submit" className="w-full sm:w-auto px-6 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors">
            Qidirish
          </button>
        </form>

        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden relative mt-4 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-4 py-3">Sana</th>
                  <th className="px-4 py-3">Fermer</th>
                  <th className="px-4 py-3">To'lov Usuli</th>
                  <th className="px-4 py-3 text-right">Summa</th>
                  <th className="px-4 py-3 text-center">Kassir</th>
                  <th className="px-4 py-3 text-center">Chek</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {history.length === 0 && !loading ? (
                  <tr><td colSpan="6" className="px-4 py-12 text-center text-slate-500">To'lov tarixi bo'sh</td></tr>
                ) : (
                  history.map(item => (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 text-slate-600">{formatDate(item.paymentDate)}</td>
                      <td className="px-4 py-3">
                        <div className="font-bold text-slate-900">{item.farmerName}</div>
                        <div className="text-[11px] text-slate-500">{item.farmerPhone}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded text-xs font-bold uppercase">{item.paymentMethod}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="font-bold text-emerald-600">+{fmt(item.amount)} UZS</div>
                      </td>
                      <td className="px-4 py-3 text-center text-slate-600 font-medium">{item.cashierName}</td>
                      <td className="px-4 py-3 text-center">
                        <button onClick={() => handleDownload(item.id)} className="p-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors inline-flex">
                          <Download size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}