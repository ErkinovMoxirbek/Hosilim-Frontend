import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Search, Plus, RefreshCw, UserCheck, Phone, MapPin, Building2, 
  ShieldAlert, UserPlus, X, Lock, User, Loader2, ChevronLeft, ChevronRight
} from 'lucide-react';
import { adminBrokerService } from '../../services/admin/adminBrokerService';

export default function BrokersManagement() {
  const [brokers, setBrokers] = useState([]);
  const [freePoints, setFreePoints] = useState([]);
  
  const [tableLoading, setTableLoading] = useState(true);
  const [modalLoading, setModalLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const [searchText, setSearchText] = useState('');
  const [filters, setFilters] = useState({ search: '' });
  const [pagination, setPagination] = useState({ page: 0, size: 15, totalElements: 0, totalPages: 0 });

  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '', surname: '', phone: '', password: '', collectionPointId: ''
  });

  // Debounce for search
  useEffect(() => {
    const t = setTimeout(() => {
      setFilters({ search: searchText });
      setPagination(prev => ({ ...prev, page: 0 }));
    }, 500);
    return () => clearTimeout(t);
  }, [searchText]);

  const loadBrokers = useCallback(async () => {
    try {
      setTableLoading(true);
      const data = await adminBrokerService.getBrokersList(filters.search, pagination.page, pagination.size);
      setBrokers(data.content || []);
      setPagination(prev => ({
        ...prev,
        totalElements: data.totalElements || 0,
        totalPages: data.totalPages || 0
      }));
    } catch (err) {
      setErrorMsg(err.message || "Brokerlarni yuklashda xatolik");
    } finally {
      setTableLoading(false);
    }
  }, [filters.search, pagination.page, pagination.size]);

  useEffect(() => {
    loadBrokers();
  }, [loadBrokers]);

  const handleOpenModal = async () => {
    setModalOpen(true);
    setErrorMsg(null);
    setFormData({ name: '', surname: '', phone: '', password: '', collectionPointId: '' });
    
    // Oynani ochganda darhol bo'sh punktlarni tortib kelamiz
    try {
      const points = await adminBrokerService.getFreePoints();
      setFreePoints(points);
    } catch (err) {
      console.error(err);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    setModalLoading(true);
    
    try {
      await adminBrokerService.createBroker({
        ...formData,
        collectionPointId: Number(formData.collectionPointId)
      });
      setModalOpen(false);
      loadBrokers();
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* SARLAVHA */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-800 flex items-center gap-3">
              <div className="p-3 bg-white shadow-sm text-indigo-600 rounded-2xl border border-indigo-100">
                <UserCheck size={26} />
              </div>
              Brokerlar (Boshqaruvchilar)
            </h1>
            <p className="text-sm text-slate-500 mt-2 ml-[60px] font-medium">Barcha obyekt rahbarlari ro'yxati</p>
          </div>
          <div className="flex items-center space-x-3">
            <button onClick={loadBrokers} className="p-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors shadow-sm">
              <RefreshCw size={20} className={tableLoading ? 'animate-spin text-indigo-600' : ''} />
            </button>
            <button onClick={handleOpenModal} className="inline-flex items-center px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-colors">
              <Plus className="w-5 h-5 mr-1" /> Yangi Broker
            </button>
          </div>
        </div>

        {errorMsg && !modalOpen && (
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
              placeholder="Ism yoki telefon orqali izlash..." 
              value={searchText} 
              onChange={(e) => setSearchText(e.target.value)} 
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-sm focus:border-indigo-500 transition-colors outline-none" 
            />
          </div>
        </div>

        {/* JADVAL */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden relative">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 text-[10px] font-black uppercase tracking-wider">
                  <th className="p-4 pl-6">F.I.O</th>
                  <th className="p-4">Telefon</th>
                  <th className="p-4">Biriktirilgan Sex</th>
                  <th className="p-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tableLoading && brokers.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="p-16 text-center text-slate-400">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-3"></div>
                      <p className="font-bold text-slate-500">Yuklanmoqda...</p>
                    </td>
                  </tr>
                ) : brokers.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="p-16 text-center text-slate-400">
                      <UserCheck size={40} className="mx-auto mb-3 text-slate-300" />
                      <p className="font-bold text-slate-500">Hech qanday broker topilmadi</p>
                    </td>
                  </tr>
                ) : (
                  brokers.map(broker => (
                    <tr key={broker.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 pl-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 font-black flex items-center justify-center text-xs">
                            {broker.fullName.charAt(0)}
                          </div>
                          <div className="font-bold text-slate-800 text-sm">{broker.fullName}</div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm font-mono text-slate-600 font-semibold flex items-center gap-2">
                          <Phone size={14} className="text-slate-400" /> {broker.phone}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm font-bold text-slate-700 flex items-center gap-2">
                          <Building2 size={16} className="text-indigo-500" /> {broker.collectionPointName}
                        </div>
                        {broker.region && <div className="text-[11px] text-slate-400 mt-1 ml-6 font-semibold">{broker.region}</div>}
                      </td>
                      <td className="p-4 text-center">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                          broker.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {broker.status === 'ACTIVE' ? 'Faol' : 'Faol Emas'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* PAGINATSIYA */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <span className="text-xs font-bold text-slate-500">
              Sahifa: {pagination.page + 1} / {pagination.totalPages}
            </span>
            <div className="flex gap-2">
              <button onClick={() => setPagination(p => ({ ...p, page: Math.max(0, p.page - 1) }))} disabled={pagination.page === 0} className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-50 transition-colors">
                <ChevronLeft size={16} />
              </button>
              <button onClick={() => setPagination(p => ({ ...p, page: Math.min(p.totalPages - 1, p.page + 1) }))} disabled={pagination.page >= pagination.totalPages - 1} className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-50 transition-colors">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* ── YARATISH MODALI ── */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
              
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <h3 className="text-lg font-black text-slate-800 flex items-center">
                  <UserPlus className="mr-2 text-indigo-600" size={20} /> Yangi Broker
                </h3>
                <button onClick={() => setModalOpen(false)} className="p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-700 rounded-xl transition-colors">
                  <X size={20} />
                </button>
              </div>

              {errorMsg && (
                <div className="m-6 mb-0 p-3 bg-red-50 text-red-600 rounded-xl border border-red-100 text-sm font-bold flex items-center">
                  <ShieldAlert size={18} className="mr-2 shrink-0" /> {errorMsg}
                </div>
              )}

              <form onSubmit={handleFormSubmit} className="p-6 space-y-5 overflow-y-auto max-h-[70vh]">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-1">
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Ism <span className="text-rose-500">*</span></label>
                    <div className="relative">
                      <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input required type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:border-indigo-500 outline-none" />
                    </div>
                  </div>
                  <div className="col-span-1">
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Familiya <span className="text-rose-500">*</span></label>
                    <div className="relative">
                      <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input required type="text" value={formData.surname} onChange={(e) => setFormData({...formData, surname: e.target.value})} className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:border-indigo-500 outline-none" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Telefon raqam <span className="text-rose-500">*</span></label>
                  <div className="relative">
                    <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input required type="tel" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} placeholder="+998901234567" className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:border-indigo-500 outline-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Parol <span className="text-rose-500">*</span></label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input required type="text" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:border-indigo-500 outline-none" />
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Bo'sh Qabul Punktiga (Sexga) Ulash <span className="text-rose-500">*</span></label>
                  <select required value={formData.collectionPointId} onChange={(e) => setFormData({...formData, collectionPointId: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 focus:border-indigo-500 outline-none cursor-pointer">
                    <option value="" disabled>-- Binoni tanlang --</option>
                    {freePoints.length === 0 ? (
                      <option disabled>Hozircha bo'sh obyektlar yo'q</option>
                    ) : (
                      freePoints.map(point => (
                        <option key={point.id} value={point.id}>{point.name} ({point.region})</option>
                      ))
                    )}
                  </select>
                  {freePoints.length === 0 && (
                    <p className="text-[10px] text-amber-600 mt-2 font-bold bg-amber-50 p-2 rounded-lg border border-amber-100">
                      Diqqat: Broker yaratish uchun avval "Yig'uv punktlari" bo'limida yangi sex (bino) qo'shishingiz kerak!
                    </p>
                  )}
                </div>

                <div className="pt-2 flex gap-3">
                  <button type="button" onClick={() => setModalOpen(false)} className="flex-1 py-3 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">Bekor qilish</button>
                  <button type="submit" disabled={modalLoading || freePoints.length === 0} className="flex-1 py-3 text-sm font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-colors flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed shadow-md shadow-indigo-600/20">
                    {modalLoading ? <Loader2 size={18} className="animate-spin" /> : "Brokerni Saqlash"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}