import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBasket, MapPin, User, ChevronRight, RefreshCw, Search, ChevronLeft, ArrowUpRight, ArrowDownLeft, RotateCcw } from 'lucide-react';
import { adminStockService } from '../../services/admin/adminStockService';

export default function AdminBasketPointsGridPage() {
    const navigate = useNavigate();
    const [points, setPoints] = useState([]);
    const [loading, setLoading] = useState(true);

    const [searchInput, setSearchInput] = useState('');
    const [filters, setFilters] = useState({ search: '' });
    const [pagination, setPagination] = useState({ page: 0, size: 12, totalElements: 0, totalPages: 0 });

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            const data = await adminStockService.getPointsBasketSummary(filters.search, pagination.page, pagination.size);
            setPoints(data.content || []);
            setPagination(prev => ({ ...prev, totalElements: data.totalElements || 0, totalPages: data.totalPages || 0 }));
        } catch (err) { console.error(err); } finally { setLoading(false); }
    }, [filters.search, pagination.page, pagination.size]);

    useEffect(() => { loadData(); }, [loadData]);

    const handleSearch = (e) => {
        e.preventDefault();
        setFilters({ search: searchInput });
        setPagination(prev => ({ ...prev, page: 0 }));
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

                <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                            <ShoppingBasket size={24} className="text-orange-500" />
                            Savatlar Aylanmasi
                        </h1>
                        <p className="text-sm text-slate-500 mt-1">Savatlar tarixini ko'rish uchun yig'uv punktini tanlang</p>
                    </div>
                    <button onClick={loadData} className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2 text-sm font-medium">
                        <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Yangilash
                    </button>
                </div>

                <form onSubmit={handleSearch} className="flex gap-2">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input type="text" placeholder="Punkt nomini kiriting..." value={searchInput} onChange={(e) => setSearchInput(e.target.value)} className="w-full pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-orange-500" />
                    </div>
                    <button type="submit" className="px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800">Qidirish</button>
                </form>

                {loading && points.length === 0 ? (
                    <div className="flex justify-center py-20 text-slate-400"><RefreshCw className="animate-spin" size={24} /></div>
                ) : points.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-500 bg-white border border-slate-200 rounded-xl">
                        <ShoppingBasket size={32} className="mb-3 text-slate-300" />
                        <p className="font-medium text-sm">Hech qanday ma'lumot topilmadi.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 relative">
                        {points.map(point => (
                            <button
                                key={point.pointId}
                                onClick={() => navigate(`/dashboard/admin/admin-stock/baskets/${point.pointId}`)}
                                className="bg-white p-5 rounded-xl border border-slate-200 hover:border-orange-400 transition-colors text-left flex flex-col h-full focus:outline-none focus:ring-1 focus:ring-orange-400"
                            >
                                <div className="flex items-start justify-between w-full">
                                    <h3 className="text-base font-bold text-slate-900 line-clamp-1">{point.pointName}</h3>
                                    <ChevronRight size={18} className="text-slate-400" />
                                </div>

                                <div className="mt-3 space-y-2 flex-1">
                                    <div className="flex items-center gap-2 text-sm text-slate-600"><MapPin size={14} className="text-slate-400" /> <span className="truncate">{point.region}</span></div>
                                    <div className="flex items-center gap-2 text-sm text-slate-600"><User size={14} className="text-slate-400" /> <span className="truncate">{point.ownerName || "Tayinlanmagan"}</span></div>
                                </div>

                                {/* SAVATLAR STATISTIKASI */}
                                <div className="mt-5 -mx-5 -mb-5 rounded-b-xl overflow-hidden">
                                    <div className="px-5 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center">
                                        <div>
                                            <div className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1"><ArrowUpRight size={12} className="text-rose-500" /> Tarqatildi</div>
                                            <div className="text-sm font-semibold text-slate-900 mt-0.5">{point.totalGiven} ta</div>
                                        </div>
                                        <div className="text-center border-l border-r border-slate-200 px-4">
                                            <div className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1 justify-center"><ArrowDownLeft size={12} className="text-emerald-500" /> Qaytdi</div>
                                            <div className="text-sm font-semibold text-slate-900 mt-0.5">{point.totalReturned} ta</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-[10px] uppercase font-bold text-slate-500">Qoldiq qarz</div>
                                            <div className={`text-sm font-bold mt-0.5 ${point.currentDebt > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>{point.currentDebt} ta</div>
                                        </div>
                                    </div>

                                    {/* 🆕 BEKOR QILINGAN SAVATLAR */}
                                    {point.totalCancelled > 0 && (
                                        <div className="px-5 py-2 bg-slate-100/80 border-t border-slate-200 flex items-center justify-between">
                                            <div className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1.5">
                                                <RotateCcw size={12} className="text-slate-400" /> Bekor qilingan
                                            </div>
                                            <div className="text-xs font-bold text-slate-600">{point.totalCancelled} ta</div>
                                        </div>
                                    )}
                                </div>
                            </button>
                        ))}
                    </div>
                )}

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
            </div>
        </div>
    );
}