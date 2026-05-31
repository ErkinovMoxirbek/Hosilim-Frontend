import React, { useState, useEffect, useCallback } from 'react';
import farmerService from '../../services/farmerService'; // To'g'ri manzilni ko'rsating
import { 
  Search, Plus, Phone, AlertCircle, CheckCircle2, 
  X, Loader2, ShoppingBasket, Edit2, Trash2, ChevronLeft, ChevronRight, RefreshCw
} from 'lucide-react';

export default function FarmerPage() {
  const [farmers, setFarmers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Paginatsiya va Qidiruv state'lari
  const [searchInput, setSearchInput] = useState('');
  const [filters, setFilters] = useState({ search: '' });
  const [pagination, setPagination] = useState({ page: 0, size: 10, totalElements: 0, totalPages: 0 });

  // Modal boshqaruvi
  const [modalMode, setModalMode] = useState(null); // 'add' yoki 'edit'
  const [currentFarmer, setCurrentFarmer] = useState({ id: null, firstName: '', lastName: '', phone: '+998' });

  // Ma'lumotlarni yuklash
  const fetchFarmers = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await farmerService.getAllFarmers(filters.search, pagination.page, pagination.size);
      setFarmers(data.content || []);
      setPagination(prev => ({ ...prev, totalElements: data.totalElements || 0, totalPages: data.totalPages || 0 }));
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [filters.search, pagination.page, pagination.size]);

  useEffect(() => {
    fetchFarmers();
  }, [fetchFarmers]);

  // Qidiruv Formasi
  const handleSearch = (e) => {
    e.preventDefault();
    setFilters({ search: searchInput });
    setPagination(prev => ({ ...prev, page: 0 }));
  };

  // Formani saqlash (Qo'shish yoki Tahrirlash)
  const handleSubmitForm = async (e) => {
    e.preventDefault();
    if (currentFarmer.phone.length < 13) {
      alert("Iltimos, telefon raqamni to'liq kiriting (+998xxxxxxxxx)");
      return;
    }

    setIsSubmitting(true);
    try {
      if (modalMode === 'add') {
        await farmerService.createShadowFarmer(currentFarmer);
      } else if (modalMode === 'edit') {
        await farmerService.updateFarmer(currentFarmer.id, currentFarmer);
      }
      closeModal();
      fetchFarmers(); // Jadvalni yangilash
    } catch (error) {
      alert(error.response?.data?.message || "Xatolik yuz berdi");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fermerni o'chirish
  const handleDelete = async (id) => {
    if (window.confirm("Rostdan ham bu fermerni o'chirmoqchimisiz?")) {
      try {
        await farmerService.deleteFarmer(id);
        fetchFarmers(); // Jadvalni yangilash
      } catch (error) {
        alert("O'chirishda xatolik yuz berdi");
      }
    }
  };

  // Modalni ochish va yopish
  const openModal = (mode, farmer = null) => {
    setModalMode(mode);
    if (mode === 'edit' && farmer) {
      setCurrentFarmer({ id: farmer.id, firstName: farmer.firstName || '', lastName: farmer.lastName || '', phone: farmer.phoneNumber || '' });
    } else {
      setCurrentFarmer({ id: null, firstName: '', lastName: '', phone: '+998' });
    }
  };

  const closeModal = () => {
    setModalMode(null);
    setCurrentFarmer({ id: null, firstName: '', lastName: '', phone: '+998' });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto bg-slate-50 min-h-screen">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Mening fermerlarim</h1>
          <p className="text-sm text-slate-500 mt-1">Sizning qabul punktingizga biriktirilgan fermerlar</p>
        </div>
        <button 
          onClick={() => openModal('add')}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors shadow-sm"
        >
          <Plus size={18} />
          <span>Yangi fermer (Tezkor)</span>
        </button>
      </div>

      {/* SEARCH */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6 flex items-center justify-between">
        <form onSubmit={handleSearch} className="flex gap-2 w-full max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Ism, familiya yoki telefon..." 
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-500 text-sm"
            />
          </div>
          <button type="submit" className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800">
            Qidirish
          </button>
        </form>
        <button onClick={fetchFarmers} className="p-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 hidden sm:block">
          <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <th className="px-6 py-4">Fermer</th>
                <th className="px-6 py-4">Telefon raqam</th>
                <th className="px-6 py-4">Holati va Tarixi</th>
                <th className="px-6 py-4">Lokal Balans</th>
                <th className="px-6 py-4">Savat Qarzi</th>
                <th className="px-6 py-4 text-right">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading && farmers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                    <Loader2 className="animate-spin text-emerald-600 mx-auto mb-3" size={32} />
                    Yuklanmoqda...
                  </td>
                </tr>
              ) : farmers.length === 0 ? (
                <tr><td colSpan="6" className="px-6 py-12 text-center text-slate-500">Fermer topilmadi.</td></tr>
              ) : (
                farmers.map((farmer) => (
                  <tr key={farmer.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 font-bold border border-slate-200">
                          {farmer.firstName?.charAt(0) || 'F'}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{farmer.firstName} {farmer.lastName}</p>
                          <p className="text-xs text-slate-500 font-mono">ID: #{farmer.id}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-3 text-slate-700 font-medium">
                      <div className="flex items-center gap-2">
                        <Phone size={14} className="text-slate-400" />
                        {farmer.phoneNumber}
                      </div>
                    </td>

                    <td className="px-6 py-3">
                      <div className="flex flex-col gap-1">
                        {farmer.isShadow ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-50 text-amber-700 text-[10px] font-bold border border-amber-200 w-max">
                            <AlertCircle size={10} /> TASDIQLANMAGAN
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200 w-max">
                            <CheckCircle2 size={10} /> TASDIQLANGAN
                          </span>
                        )}
                        <div className="text-[10px] text-slate-400 mt-1 leading-tight">
                          <span className="block">Qo'shdi: {farmer.addedByName}</span>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-3">
                      <span className={`font-bold ${
                        farmer.pointBalance < 0 ? 'text-red-600' : 
                        farmer.pointBalance > 0 ? 'text-emerald-600' : 'text-slate-600'
                      }`}>
                        {farmer.pointBalance?.toLocaleString() || 0} UZS
                      </span>
                    </td>

                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2">
                        <div className={`p-1.5 rounded-md ${farmer.basketDebt > 0 ? 'bg-orange-100 text-orange-600' : 'bg-slate-100 text-slate-400'}`}>
                          <ShoppingBasket size={14} />
                        </div>
                        <span className={`font-semibold text-sm ${farmer.basketDebt > 0 ? 'text-orange-600' : 'text-slate-500'}`}>
                          {farmer.basketDebt || 0} dona
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openModal('edit', farmer)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded transition-colors">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => handleDelete(farmer.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors">
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

      {/* PAGINATSIYA */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-sm text-slate-600">Jami: <span className="font-bold">{pagination.totalElements}</span> ta fermer</span>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-600">Sahifa: {pagination.page + 1} / {pagination.totalPages}</span>
            <div className="flex gap-1">
              <button 
                onClick={() => setPagination(p => ({ ...p, page: Math.max(0, p.page - 1) }))} 
                disabled={pagination.page === 0} 
                className="p-1.5 rounded border border-slate-300 text-slate-600 hover:bg-slate-50 disabled:opacity-50"
              >
                <ChevronLeft size={16} />
              </button>
              <button 
                onClick={() => setPagination(p => ({ ...p, page: Math.min(p.totalPages - 1, p.page + 1) }))} 
                disabled={pagination.page >= pagination.totalPages - 1} 
                className="p-1.5 rounded border border-slate-300 text-slate-600 hover:bg-slate-50 disabled:opacity-50"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL (QO'SHISH VA TAHRIRLASH) */}
      {modalMode && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-sm shadow-xl overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">
                {modalMode === 'add' ? "Yangi fermer" : "Fermerni tahrirlash"}
              </h2>
              <button onClick={closeModal} disabled={isSubmitting} className="p-1 text-slate-400 hover:text-red-500 rounded-md">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmitForm} className="p-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Ism <span className="text-red-500">*</span></label>
                <input 
                  type="text" required value={currentFarmer.firstName}
                  onChange={(e) => setCurrentFarmer({...currentFarmer, firstName: e.target.value})}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-emerald-500"
                  placeholder="Ism" disabled={isSubmitting}
                />
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Familiya</label>
                <input 
                  type="text" value={currentFarmer.lastName}
                  onChange={(e) => setCurrentFarmer({...currentFarmer, lastName: e.target.value})}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-emerald-500"
                  placeholder="Familiya" disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Telefon <span className="text-red-500">*</span></label>
                <input 
                  type="text" required value={currentFarmer.phone}
                  onChange={(e) => setCurrentFarmer({...currentFarmer, phone: e.target.value})}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-medium focus:outline-none focus:border-emerald-500"
                  disabled={isSubmitting || modalMode === 'edit'} // Tahrirlashda nomerni o'zgartirishni xohlamasangiz
                />
              </div>

              <div className="flex gap-2 mt-6">
                <button type="button" onClick={closeModal} disabled={isSubmitting} className="flex-1 px-4 py-2 border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50">
                  Bekor qilish
                </button>
                <button type="submit" disabled={isSubmitting} className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 flex items-center justify-center gap-2">
                  {isSubmitting && <Loader2 size={16} className="animate-spin" />} 
                  Saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}