import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { collectionPointService } from '../../services/admin/collectionPointService'; 
import {
  MapPin, Search, Plus, MoreVertical, Eye, Edit2,
  Trash2, RefreshCw, CheckCircle, DollarSign, Save, X,
  Users, Building2, Navigation, Clock, ShieldAlert, ChevronLeft, ChevronRight
} from 'lucide-react';

export default function CollectionPointsManagement() {
  // ======================= STATE =======================
  const [points, setPoints] = useState([]);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [tableLoading, setTableLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  
  const [filters, setFilters] = useState({ search: '', region: 'ALL', status: 'ALL' });
  const [searchText, setSearchText] = useState('');
  
  const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0, totalPages: 0 });
  const [modal, setModal] = useState({ isOpen: false, type: null, data: null });
  const [formData, setFormData] = useState({});
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // ======================= QIDIRUV (DEBOUNCE) =======================
  useEffect(() => {
    const t = setTimeout(() => {
      setFilters(f => (f.search === searchText ? f : { ...f, search: searchText }));
    }, 400);
    return () => clearTimeout(t);
  }, [searchText]);

  const hasLoadedRef = useRef(false);
  
  // ======================= MA'LUMOTLARNI YUKLASH =======================
  const fetchPoints = useCallback(async () => {
    try {
      if (!hasLoadedRef.current) setLoadingInitial(true);
      else setTableLoading(true);
      setErrorMsg(null);

      const params = {
        page: pagination.page,
        limit: pagination.limit,
        search: filters.search,
        region: filters.region,
        status: filters.status,
      };

      const res = await collectionPointService.getAllPoints(params);
      const items = res?.items ?? res?.results ?? res?.data ?? [];
      const meta = res?.meta ?? {};
      const total = Number(res?.total ?? meta.total ?? items.length ?? 0);
      const limit = Number(meta.limit ?? pagination.limit ?? 15);
      const page = Number(meta.page ?? pagination.page ?? 1);
      const totalPages = Number(meta.totalPages ?? (limit > 0 ? Math.ceil(total / limit) : 0));

      setPoints(items);
      setPagination(prev => ({ ...prev, page, limit, total, totalPages }));
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      if (!hasLoadedRef.current) {
        hasLoadedRef.current = true;
        setLoadingInitial(false);
      } else {
        setTableLoading(false);
      }
    }
  }, [filters, pagination.page, pagination.limit]);

  useEffect(() => { fetchPoints(); }, [fetchPoints]);
  useEffect(() => { setPagination(p => ({ ...p, page: 1 })); }, [filters]);

  // ======================= STATISTIKA =======================
  const statistics = useMemo(() => {
    if (!points.length) return null;
    return {
      total: points.length,
      active: points.filter(p => p.status === 'ACTIVE').length,
      totalBalance: points.reduce((sum, p) => sum + (Number(p.balance) || 0), 0),
      totalEmployees: points.reduce((sum, p) => sum + (Number(p.employeeCount) || 0), 0),
    };
  }, [points]);

  // ======================= FUNKSIYALAR =======================
  
  // 🟢 XARITA LINKI TO'G'RILANDI
  const openInGoogleMaps = (lat, lng) => {
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    if (isNaN(latitude) || isNaN(longitude)) {
      alert("Koordinatalar noto'g'ri formatda");
      return;
    }
    window.open(`https://maps.google.com/?q=${latitude},${longitude}`, '_blank');
  };

  const handlePointAction = async (action, pointId) => {
    try {
      setSubmitting(true);
      if (action === 'activate') {
        await collectionPointService.activatePoint(pointId);
      } else if (action === 'deactivate') {
        await collectionPointService.deactivatePoint(pointId);
      } else if (action === 'delete') {
        if (!window.confirm("Bu amalni qaytarib bo'lmaydi. O'chirasizmi?")) return;
        await collectionPointService.deletePoint(pointId);
      }
      fetchPoints();
    } catch (error) {
      alert(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!formData.name?.trim()) errors.name = 'Nom majburiy';
    if (!formData.region?.trim()) errors.region = 'Viloyat majburiy';
    if (!formData.district?.trim()) errors.district = 'Tuman majburiy';
    if (!formData.address?.trim()) errors.address = 'Manzil majburiy';
    setFormErrors(errors);
    
    if (Object.keys(errors).length > 0) return;

    try {
      setSubmitting(true);
      const payload = {
        name: formData.name,
        region: formData.region,
        district: formData.district,
        address: formData.address,
        latitude: formData.latitude ? Number(formData.latitude) : null,
        longitude: formData.longitude ? Number(formData.longitude) : null,
        // 🟢 DIQQAT: Egasi (Owner) bu yerdan yuborilmaydi, faqat bino yaratiladi!
      };
      
      if (modal.type === 'create') {
        await collectionPointService.createPoint(payload);
      } else if (modal.type === 'edit' && modal.data?.id) {
        await collectionPointService.updatePoint(modal.data.id, payload);
      }
      fetchPoints();
      closeModal();
    } catch (error) {
      alert(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const openModal = (type, data = null) => {
    setModal({ isOpen: true, type, data });
    if (type === 'edit' && data) {
      setFormData({
        name: data.name ?? '', region: data.region ?? '', district: data.district ?? '',
        address: data.address ?? '', latitude: data.latitude ?? '', longitude: data.longitude ?? ''
      });
    } else {
      setFormData({ name: '', region: '', district: '', address: '', latitude: '', longitude: '' });
    }
  };

  const closeModal = () => { setModal({ isOpen: false, type: null, data: null }); setFormErrors({}); };
  const formatCurrency = (amount) => new Intl.NumberFormat('uz-UZ', { style: 'currency', currency: 'UZS', minimumFractionDigits: 0 }).format(amount || 0);
  const formatDate = (dateString) => new Date(dateString).toLocaleDateString('uz-UZ', { year: 'numeric', month: 'short', day: 'numeric' });

  // ======================= LOADING UI =======================
  if (loadingInitial && points.length === 0) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* ======================= SARLAVHA ======================= */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-800 flex items-center gap-3">
              <div className="p-3 bg-white shadow-sm text-blue-600 rounded-2xl border border-blue-100">
                <Building2 size={26} />
              </div>
              Yig'uv Punktlari
            </h1>
            <p className="text-sm text-slate-500 mt-2 ml-[60px] font-medium">Barcha qabul punktlari boshqaruvi</p>
          </div>
          <div className="flex items-center space-x-3">
            <button onClick={fetchPoints} className="p-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors shadow-sm">
              <RefreshCw size={20} className={tableLoading ? 'animate-spin text-blue-600' : ''} />
            </button>
            <button onClick={() => openModal('create')} className="inline-flex items-center px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-colors">
              <Plus className="w-5 h-5 mr-1" /> Yangi Punkt
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 text-sm font-bold flex items-center shadow-sm">
            <ShieldAlert size={18} className="mr-2" /> {errorMsg}
          </div>
        )}

        {/* ======================= STATISTIKA KARTALARI ======================= */}
        {statistics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-5 shadow-blue-200 shadow-lg text-white">
              <h3 className="text-blue-100 font-bold uppercase tracking-wider text-xs mb-1">Jami Punktlar</h3>
              <div className="text-3xl font-black">{statistics.total}</div>
            </div>
            <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-5 shadow-emerald-200 shadow-lg text-white">
              <h3 className="text-emerald-100 font-bold uppercase tracking-wider text-xs mb-1">Faol Punktlar</h3>
              <div className="text-3xl font-black">{statistics.active}</div>
            </div>
            <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl p-5 shadow-indigo-200 shadow-lg text-white">
              <h3 className="text-indigo-100 font-bold uppercase tracking-wider text-xs mb-1">Umumiy Balans</h3>
              <div className="text-2xl font-black">{formatCurrency(statistics.totalBalance)}</div>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
              <h3 className="text-slate-400 font-bold uppercase tracking-wider text-xs mb-1">Ishchilar Soni</h3>
              <div className="text-3xl font-black text-slate-800">{statistics.totalEmployees}</div>
            </div>
          </div>
        )}

        {/* ======================= FILTRLAR ======================= */}
        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input type="text" placeholder="Punkt nomi yoki manzil bo'yicha qidirish..." value={searchText} onChange={(e) => setSearchText(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-sm focus:border-blue-500 transition-colors outline-none" />
          </div>
          <select value={filters.region} onChange={(e) => setFilters({ ...filters, region: e.target.value })} className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-sm text-slate-700 focus:border-blue-500 outline-none">
            <option value="ALL">Barcha viloyatlar</option>
            <option value="Toshkent">Toshkent</option>
            <option value="Samarqand">Samarqand</option>
            <option value="Buxoro">Buxoro</option>
            <option value="Andijon">Andijon</option>
          </select>
          <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })} className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-sm text-slate-700 focus:border-blue-500 outline-none">
            <option value="ALL">Barcha statuslar</option>
            <option value="ACTIVE">Faol</option>
            <option value="INACTIVE">Faol emas</option>
          </select>
        </div>

        {/* ======================= JADVAL ======================= */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden relative">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 text-[10px] font-black uppercase tracking-wider">
                  <th className="p-4 pl-6">Punkt Nomi</th>
                  <th className="p-4">Manzil</th>
                  <th className="p-4">Egasi (Broker)</th>
                  <th className="p-4 text-right">Moliya / Xodim</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 text-center">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {points.length === 0 && !tableLoading ? (
                   <tr>
                     <td colSpan="6" className="p-16 text-center text-slate-400">
                       <Building2 size={40} className="mx-auto mb-3 text-slate-300" />
                       <p className="font-bold text-slate-500">Hech qanday punkt topilmadi</p>
                     </td>
                   </tr>
                ) : (
                  points.map(point => (
                    <tr key={point.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="p-4 pl-6">
                        <div className="font-extrabold text-slate-800 text-sm">{point.name}</div>
                        <div className="text-[10px] text-slate-400 font-bold tracking-wider uppercase mt-1">ID: #{point.id}</div>
                      </td>
                      <td className="p-4">
                        <div className="text-xs font-bold text-slate-700 mb-1">{point.region}, {point.district}</div>
                        <div className="text-xs text-slate-500 truncate max-w-[200px]" title={point.address}>{point.address}</div>
                      </td>
                      <td className="p-4">
                        {/* 🟢 TO'G'RILANDI: JSON dagi ownerFullName ishlatiladi */}
                        {point.ownerFullName ? (
                          <>
                            <div className="text-sm font-bold text-slate-800">{point.ownerFullName}</div>
                            <div className="text-xs text-slate-500 mt-1">{point.ownerPhone}</div>
                          </>
                        ) : (
                          <span className="text-[11px] font-bold text-rose-500 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-100">Tayinlanmagan</span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <div className="text-sm font-black text-emerald-600 mb-1">{formatCurrency(point.balance)}</div>
                        <div className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded inline-block">
                          <Users size={10} className="inline mr-1" /> {point.employeeCount || 0} xodim
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                          point.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {point.status === 'ACTIVE' ? 'Faol' : 'Faol Emas'}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => openModal('view', point)} className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-colors" title="Ko'rish">
                            <Eye size={16} />
                          </button>
                          <button onClick={() => openModal('edit', point)} className="p-2 bg-amber-50 text-amber-600 rounded-xl hover:bg-amber-500 hover:text-white transition-colors" title="Tahrirlash">
                            <Edit2 size={16} />
                          </button>
                          <div className="relative group/menu">
                            <button className="p-2 bg-slate-50 text-slate-600 rounded-xl hover:bg-slate-200 transition-colors">
                              <MoreVertical size={16} />
                            </button>
                            <div className="absolute right-0 top-full mt-1 w-36 bg-white rounded-xl shadow-lg border border-slate-100 opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all z-20 overflow-hidden">
                              {point.status === 'ACTIVE' ? (
                                <button onClick={() => handlePointAction('deactivate', point.id)} className="w-full text-left px-4 py-2.5 text-xs font-bold text-amber-600 hover:bg-amber-50 flex items-center">
                                  <Clock size={14} className="mr-2" /> Faolsizlantirish
                                </button>
                              ) : (
                                <button onClick={() => handlePointAction('activate', point.id)} className="w-full text-left px-4 py-2.5 text-xs font-bold text-emerald-600 hover:bg-emerald-50 flex items-center">
                                  <CheckCircle size={14} className="mr-2" /> Faollashtirish
                                </button>
                              )}
                              <div className="h-px bg-slate-100 w-full"></div>
                              <button onClick={() => handlePointAction('delete', point.id)} className="w-full text-left px-4 py-2.5 text-xs font-bold text-rose-600 hover:bg-rose-50 flex items-center">
                                <Trash2 size={14} className="mr-2" /> O'chirish
                              </button>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {tableLoading && (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center z-10">
              <div className="bg-white p-3 rounded-xl shadow-lg border border-slate-100 flex items-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-3"></div>
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
              <button onClick={() => setPagination(p => ({ ...p, page: Math.max(1, p.page - 1) }))} disabled={pagination.page === 1} className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-50 transition-colors">
                <ChevronLeft size={16} />
              </button>
              <button onClick={() => setPagination(p => ({ ...p, page: Math.min(p.totalPages, p.page + 1) }))} disabled={pagination.page === pagination.totalPages} className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-50 transition-colors">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* ======================= MODAL ======================= */}
        {modal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
              
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <h3 className="text-lg font-black text-slate-800 flex items-center">
                  <Building2 className="mr-2 text-blue-600" size={20} />
                  {modal.type === 'view' ? "Punkt Ma'lumotlari" : modal.type === 'edit' ? "Punktni Tahrirlash" : "Yangi Punkt Qo'shish"}
                </h3>
                <button onClick={closeModal} className="p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-700 rounded-xl transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 overflow-y-auto">
                {/* ---------- VIEW REJIMI ---------- */}
                {modal.type === 'view' && modal.data ? (
                  <div className="space-y-6">
                    <div className="flex items-center space-x-4 pb-4 border-b border-slate-100">
                      <div className="h-16 w-16 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center text-white shadow-sm">
                        <Building2 className="h-8 w-8" />
                      </div>
                      <div>
                        <h4 className="text-xl font-black text-slate-800">{modal.data.name}</h4>
                        <div className="mt-1">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                            modal.data.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {modal.data.status === 'ACTIVE' ? 'Faol' : 'Faol Emas'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <h5 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3">Manzil</h5>
                        <div className="space-y-2">
                          <div className="flex items-start">
                            <MapPin className="h-4 w-4 mr-2 text-blue-500 mt-0.5" />
                            <div className="text-sm text-slate-800 font-medium">
                              <div>{modal.data.region}, {modal.data.district}</div>
                              <div className="text-slate-500">{modal.data.address}</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h5 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3">Egasi</h5>
                        {/* 🟢 TO'G'RILANDI: ownerFullName ishlatiladi */}
                        {modal.data.ownerFullName ? (
                          <div className="flex items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold">
                              {modal.data.ownerFullName.charAt(0).toUpperCase()}
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-bold text-slate-800">{modal.data.ownerFullName}</div>
                              <div className="text-xs text-slate-500">{modal.data.ownerPhone}</div>
                            </div>
                          </div>
                        ) : (
                          <div className="text-sm font-bold text-rose-500 bg-rose-50 p-3 rounded-xl border border-rose-100">Hali tayinlanmagan</div>
                        )}
                      </div>

                      <div>
                        <h5 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3">Moliyaviy & Xodimlar</h5>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-100 rounded-xl">
                            <div className="flex items-center"><DollarSign className="h-4 w-4 text-emerald-600 mr-2" /><span className="text-sm font-bold text-slate-700">Balans</span></div>
                            <span className="text-sm font-black text-emerald-700">{formatCurrency(modal.data.balance || 0)}</span>
                          </div>
                          <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-100 rounded-xl">
                            <div className="flex items-center"><Users className="h-4 w-4 text-blue-600 mr-2" /><span className="text-sm font-bold text-slate-700">Ishchilar</span></div>
                            <span className="text-sm font-black text-blue-700">{modal.data.employeeCount || 0} ta</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h5 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3">Qo'shimcha</h5>
                        <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3 border border-slate-100 rounded-xl">
                          <div>
                            <div className="text-[10px] uppercase font-bold text-slate-400">Yaratilgan sana</div>
                            <div className="text-xs font-bold text-slate-800 mt-1">{modal.data.createdAt ? formatDate(modal.data.createdAt) : '-'}</div>
                          </div>
                          <div>
                            <div className="text-[10px] uppercase font-bold text-slate-400">Oxirgi yangilanish</div>
                            <div className="text-xs font-bold text-slate-800 mt-1">{modal.data.updatedAt ? formatDate(modal.data.updatedAt) : '-'}</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 🟢 TO'G'RILANGAN GOOGLE MAPS IFRAME */}
                    {modal.data.latitude && modal.data.longitude && (
                      <div className="pt-4 border-t border-slate-100">
                        <div className="flex items-center justify-between mb-3">
                          <h5 className="text-xs font-black uppercase tracking-wider text-slate-400">Xarita</h5>
                          <button onClick={() => openInGoogleMaps(modal.data.latitude, modal.data.longitude)} className="inline-flex items-center px-3 py-1.5 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                            <MapPin className="h-3 w-3 mr-1" /> To'liq xaritada ochish
                          </button>
                        </div>
                        <div className="relative bg-slate-100 rounded-xl overflow-hidden border border-slate-200" style={{ height: '300px' }}>
                          <iframe
                            width="100%" height="100%" frameBorder="0" style={{ border: 0 }} referrerPolicy="no-referrer-when-downgrade"
                            src={`https://maps.google.com/maps?q=${parseFloat(modal.data.latitude)},${parseFloat(modal.data.longitude)}&z=14&output=embed`}
                            allowFullScreen
                          ></iframe>
                          <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-sm border border-slate-200">
                            <div className="text-xs font-bold text-slate-700">
                              📍 Kenglik: {parseFloat(modal.data.latitude).toFixed(6)} | Uzunlik: {parseFloat(modal.data.longitude).toFixed(6)}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  
                /* ---------- EDIT / CREATE FORMASI ---------- */
                  <form id="pointForm" onSubmit={handleFormSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Punkt Nomi <span className="text-rose-500">*</span></label>
                        <input type="text" value={formData.name || ''} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl font-medium focus:border-blue-500 outline-none ${formErrors.name ? 'border-rose-300' : 'border-slate-200'}`} placeholder="Meva Qabul Markazi" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Viloyat <span className="text-rose-500">*</span></label>
                        <input type="text" value={formData.region || ''} onChange={(e) => setFormData({ ...formData, region: e.target.value })} className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl font-medium focus:border-blue-500 outline-none ${formErrors.region ? 'border-rose-300' : 'border-slate-200'}`} placeholder="Farg'ona" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Tuman <span className="text-rose-500">*</span></label>
                        <input type="text" value={formData.district || ''} onChange={(e) => setFormData({ ...formData, district: e.target.value })} className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl font-medium focus:border-blue-500 outline-none ${formErrors.district ? 'border-rose-300' : 'border-slate-200'}`} placeholder="Oltiariq" />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">To'liq Manzil <span className="text-rose-500">*</span></label>
                        <textarea value={formData.address || ''} onChange={(e) => setFormData({ ...formData, address: e.target.value })} rows={2} className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl font-medium focus:border-blue-500 outline-none ${formErrors.address ? 'border-rose-300' : 'border-slate-200'}`} placeholder="Ko'cha, uy raqami" />
                      </div>
                      
                      <div className="md:col-span-2 pt-4 border-t border-slate-100">
                        <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center"><Navigation className="h-4 w-4 mr-2 text-blue-500" /> Geografik koordinatalar (ixtiyoriy)</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Latitude (Kenglik)</label>
                            <input type="number" step="0.000001" value={formData.latitude || ''} onChange={(e) => setFormData({ ...formData, latitude: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:border-blue-500 outline-none" placeholder="41.311151" />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Longitude (Uzunlik)</label>
                            <input type="number" step="0.000001" value={formData.longitude || ''} onChange={(e) => setFormData({ ...formData, longitude: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:border-blue-500 outline-none" placeholder="69.279737" />
                          </div>
                        </div>
                        {formData.latitude && formData.longitude && (
                          <button type="button" onClick={() => openInGoogleMaps(formData.latitude, formData.longitude)} className="mt-3 inline-flex items-center px-3 py-2 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                            <MapPin className="h-3 w-3 mr-1" /> Kiritilgan xaritani tekshirish
                          </button>
                        )}
                      </div>
                      {/* 🟢 OWNER TANLASH QISMI (Select) BUTUNLAY O'CHIRIB TASHLANDI */}
                    </div>
                  </form>
                )}
              </div>
              
              {/* OYNA TAGIDAGI TUGMALAR */}
              {modal.type !== 'view' && (
                <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3">
                  <button type="button" onClick={closeModal} className="px-5 py-2.5 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">Bekor qilish</button>
                  <button type="submit" form="pointForm" disabled={submitting} className="px-6 py-2.5 text-sm font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors flex items-center disabled:opacity-70">
                    {submitting ? <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div> Saqlanmoqda...</> : <><Save size={16} className="mr-2"/> Saqlash</>}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
        
      </div>
    </div>
  );
}