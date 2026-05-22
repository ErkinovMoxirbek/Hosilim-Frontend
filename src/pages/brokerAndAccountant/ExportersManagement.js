import React, { useState, useEffect, useMemo } from 'react';
import { exporterService } from '../../services/exporterService'; 
import {
  Search, Plus, Edit2, Trash2, RefreshCw, 
  Save, X, MapPin, Phone, UserCheck, ShieldAlert, Briefcase
} from 'lucide-react';

export default function ExportersManagement() {
  const [exporters, setExporters] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  
  const [search, setSearch] = useState('');
  
  const [modal, setModal] = useState({ isOpen: false, type: null, data: null });
  const [formData, setFormData] = useState({ name: '', surname: '', phoneNumber: '', address: '' });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const fetchExporters = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const data = await exporterService.getMyExporters();
      setExporters(data);
    } catch (error) {
      setErrorMsg(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExporters();
  }, []);

  // Filtrlash (Ism, Familiya yoki Telefon raqam bo'yicha)
  const filteredExporters = useMemo(() => {
    return exporters.filter(exp => {
      const fullName = `${exp.name} ${exp.surname}`.toLowerCase();
      return fullName.includes(search.toLowerCase()) || exp.phoneNumber?.includes(search);
    });
  }, [exporters, search]);

  // Statistikalar
  const statistics = useMemo(() => {
    if (!exporters.length) return null;
    return {
      total: exporters.length,
      active: exporters.filter(p => p.status === 'ACTIVE').length,
      totalBalance: exporters.reduce((sum, p) => sum + (Number(p.currentBalance) || 0), 0),
    };
  }, [exporters]);

  const handleAction = async (action, id) => {
    if (action === 'delete') {
      if (!window.confirm("Bu eksportyorni tizimdan olib tashlamoqchimisiz?")) return;
      try {
        await exporterService.deleteExporter(id);
        fetchExporters();
      } catch (error) {
        alert(error.message);
      }
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!formData.name?.trim()) errors.name = 'Ism majburiy';
    if (!formData.surname?.trim()) errors.surname = 'Familiya majburiy';
    if (!formData.phoneNumber?.trim()) errors.phoneNumber = 'Telefon raqam majburiy';
    
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    try {
      setSubmitting(true);
      const payload = {
        name: formData.name,
        surname: formData.surname,
        phoneNumber: formData.phoneNumber,
        address: formData.address,
      };
      
      if (modal.type === 'create') {
        await exporterService.createExporter(payload);
      } else if (modal.type === 'edit' && modal.data?.id) {
        await exporterService.updateExporter(modal.data.id, payload);
      }
      fetchExporters();
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
        name: data.name ?? '',
        surname: data.surname ?? '',
        phoneNumber: data.phoneNumber ?? '',
        address: data.address ?? '',
      });
    } else {
      setFormData({ name: '', surname: '', phoneNumber: '', address: '' });
    }
  };

  const closeModal = () => { 
    setModal({ isOpen: false, type: null, data: null }); 
    setFormErrors({}); 
  };
  
  const formatCurrency = (amount) => new Intl.NumberFormat('uz-UZ', { style: 'currency', currency: 'UZS', minimumFractionDigits: 0 }).format(amount || 0);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* SARLAVHA */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-800 flex items-center gap-3">
              <div className="p-3 bg-white shadow-sm text-indigo-600 rounded-2xl border border-indigo-100">
                <Briefcase size={26} />
              </div>
              Eksportyorlar
            </h1>
            <p className="text-sm text-slate-500 mt-2 ml-[60px] font-medium">Hamkor xaridorlar va eksport qiluvchilar</p>
          </div>
          <div className="flex items-center space-x-3">
            <button onClick={fetchExporters} className="p-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors shadow-sm">
              <RefreshCw size={20} className={isLoading ? 'animate-spin text-indigo-600' : ''} />
            </button>
            <button onClick={() => openModal('create')} className="inline-flex items-center px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-colors">
              <Plus className="w-5 h-5 mr-1" /> Yangi Eksportyor
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 text-sm font-bold flex items-center shadow-sm">
            <ShieldAlert size={18} className="mr-2" /> {errorMsg}
          </div>
        )}

        {/* STATISTIKA KARTALARI */}
        {statistics && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl p-5 shadow-indigo-200 shadow-lg text-white">
              <h3 className="text-indigo-100 font-bold uppercase tracking-wider text-xs mb-1">Jami Hamkorlar</h3>
              <div className="text-3xl font-black">{statistics.total}</div>
            </div>
            <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-5 shadow-emerald-200 shadow-lg text-white">
              <h3 className="text-emerald-100 font-bold uppercase tracking-wider text-xs mb-1">Faol Mijozlar</h3>
              <div className="text-3xl font-black">{statistics.active}</div>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
              <h3 className="text-slate-400 font-bold uppercase tracking-wider text-xs mb-1">Umumiy Qarz/Haq</h3>
              <div className="text-2xl font-black text-slate-800">{formatCurrency(statistics.totalBalance)}</div>
            </div>
          </div>
        )}

        {/* QIDIRUV */}
        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
          <div className="relative w-full lg:w-1/2">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Ism, familiya yoki telefon bo'yicha qidirish..." 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-sm focus:border-indigo-500 transition-colors outline-none" 
            />
          </div>
        </div>

        {/* JADVAL */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden relative">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 text-[10px] font-black uppercase tracking-wider">
                  <th className="p-4 pl-6">Eksportyor</th>
                  <th className="p-4">Telefon</th>
                  <th className="p-4">Manzil</th>
                  <th className="p-4 text-right">Balans</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 text-center">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading && exporters.length === 0 ? (
                   <tr>
                     <td colSpan="6" className="p-16 text-center text-slate-400">
                       <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto mb-3"></div>
                       <p className="font-bold text-sm">Ma'lumotlar tortilmoqda...</p>
                     </td>
                   </tr>
                ) : filteredExporters.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-16 text-center text-slate-400">
                      <Briefcase size={40} className="mx-auto mb-3 text-slate-300" />
                      <p className="font-bold text-slate-500">Hech qanday hamkor topilmadi</p>
                    </td>
                  </tr>
                ) : (
                  filteredExporters.map(exp => (
                    <tr key={exp.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="p-4 pl-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-100 to-blue-100 text-indigo-600 flex justify-center items-center font-black">
                            {(exp.name || '').charAt(0).toUpperCase()}{(exp.surname || '').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-extrabold text-slate-800 text-sm">{exp.name} {exp.surname}</div>
                            <div className="text-[10px] text-slate-400 font-bold tracking-wider mt-1">ID: {exp.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm font-semibold text-slate-700 flex items-center">
                          <Phone size={14} className="mr-1.5 text-slate-400" /> {exp.phoneNumber}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-xs font-medium text-slate-600 flex items-center max-w-[200px] truncate" title={exp.address}>
                          <MapPin size={14} className="mr-1.5 text-slate-400 flex-shrink-0" /> {exp.address || 'Manzil kiritilmagan'}
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <div className={`text-sm font-black ${exp.currentBalance < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                          {formatCurrency(exp.currentBalance)}
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                          exp.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {exp.status === 'ACTIVE' ? 'Faol' : 'Faol Emas'}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => openModal('edit', exp)} className="p-2 bg-amber-50 text-amber-600 rounded-xl hover:bg-amber-500 hover:text-white transition-colors" title="Tahrirlash">
                            <Edit2 size={16} />
                          </button>
                          <button onClick={() => handleAction('delete', exp.id)} className="p-2 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-500 hover:text-white transition-colors" title="O'chirish">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* MODAL (Qo'shish / O'zgartirish) */}
        {modal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
              
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <h3 className="text-lg font-black text-slate-800 flex items-center">
                  <UserCheck className="mr-2 text-indigo-600" size={20} />
                  {modal.type === 'edit' ? "Eksportyorni Tahrirlash" : "Yangi Eksportyor Qo'shish"}
                </h3>
                <button onClick={closeModal} className="p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-700 rounded-xl transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 overflow-y-auto">
                  <form id="exporterForm" onSubmit={handleFormSubmit} className="space-y-5">
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Ism <span className="text-rose-500">*</span></label>
                        <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl font-medium focus:border-indigo-500 outline-none ${formErrors.name ? 'border-rose-300' : 'border-slate-200'}`} placeholder="Sardor" />
                        {formErrors.name && <span className="text-[10px] text-rose-500 mt-1">{formErrors.name}</span>}
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Familiya <span className="text-rose-500">*</span></label>
                        <input type="text" value={formData.surname} onChange={(e) => setFormData({ ...formData, surname: e.target.value })} className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl font-medium focus:border-indigo-500 outline-none ${formErrors.surname ? 'border-rose-300' : 'border-slate-200'}`} placeholder="Alimov" />
                        {formErrors.surname && <span className="text-[10px] text-rose-500 mt-1">{formErrors.surname}</span>}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Telefon Raqam <span className="text-rose-500">*</span></label>
                      <input type="text" value={formData.phoneNumber} onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })} className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl font-medium focus:border-indigo-500 outline-none ${formErrors.phoneNumber ? 'border-rose-300' : 'border-slate-200'}`} placeholder="+998901234567" />
                      {formErrors.phoneNumber && <span className="text-[10px] text-rose-500 mt-1">{formErrors.phoneNumber}</span>}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Yashash Manzili</label>
                      <textarea value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} rows={3} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:border-indigo-500 outline-none" placeholder="Toshkent sh., Yunusobod tumani..." />
                    </div>
                  </form>
              </div>
              
              <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3">
                <button type="button" onClick={closeModal} className="px-5 py-2.5 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">Bekor qilish</button>
                <button type="submit" form="exporterForm" disabled={submitting} className="px-6 py-2.5 text-sm font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-colors flex items-center disabled:opacity-70">
                  {submitting ? <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div> Saqlanmoqda...</> : <><Save size={16} className="mr-2"/> Saqlash</>}
                </button>
              </div>
            </div>
          </div>
        )}
        
      </div>
    </div>
  );
}