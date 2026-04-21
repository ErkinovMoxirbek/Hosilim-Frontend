import React, { useState, useEffect } from 'react';
import fruitTypeService from '../../services/fruitTypeService';
import { 
  Database, 
  Plus, 
  CheckCircle2, 
  AlertCircle,
  X,
  Loader2,
  Apple,
  Power,
  Search
} from 'lucide-react';

export default function FruitCatalogPage() {
  const [fruits, setFruits] = useState([]);
  const [filteredFruits, setFilteredFruits] = useState([]);
  
  // YANGI: Backenddan keladigan navlar va ularni tarjima qilish xaritasi (Map)
  const [qualities, setQualities] = useState([]);
  const [qualityMap, setQualityMap] = useState({});

  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  
  // Xabarlar
  const [toast, setToast] = useState({ show: false, type: '', message: '' });

  // Forma datasi
  const [formData, setFormData] = useState({
    name: '',
    quality: '', // Boshida bo'sh turadi, foydalanuvchi tanlashi shart
    description: ''
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  // Qidiruv ishlashi uchun
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredFruits(fruits);
    } else {
      const lowerQ = searchQuery.toLowerCase();
      setFilteredFruits(
        fruits.filter(f => 
          f.name?.toLowerCase().includes(lowerQ) || 
          f.quality?.toLowerCase().includes(lowerQ) ||
          (qualityMap[f.quality] && qualityMap[f.quality].toLowerCase().includes(lowerQ))
        )
      );
    }
  }, [searchQuery, fruits, qualityMap]);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, type, message });
    setTimeout(() => setToast({ show: false, type: '', message: '' }), 4000);
  };

  // YANGI MANTIQ: Ikkala ma'lumotni (Meva va Navlarni) birdaniga tortish
  const fetchInitialData = async () => {
    setIsLoading(true);
    try {
      const [fruitsData, qualitiesData] = await Promise.all([
        fruitTypeService.getAllFruitTypesForAdmin(),
        fruitTypeService.getQualities()
      ]);

      const fruitsArray = Array.isArray(fruitsData) ? fruitsData : [];
      setFruits(fruitsArray);
      setFilteredFruits(fruitsArray);

      // Navlar ro'yxatini formadagi Select uchun saqlash
      setQualities(Array.isArray(qualitiesData) ? qualitiesData : []);

      // Jadvalda ko'rsatish oson bo'lishi uchun xarita (Map) tuzib olamiz: { "OLIY_NAV": "Oliy nav (Eksport)" }
      const qMap = {};
      if (Array.isArray(qualitiesData)) {
        qualitiesData.forEach(q => {
          qMap[q.key] = q.label;
        });
      }
      setQualityMap(qMap);

    } catch (error) {
      showToast("Katalogni yuklashda tarmoq xatoligi yuz berdi!", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Faqat mevalarni qayta yuklash (Qo'shgandan keyin)
  const refreshFruitsOnly = async () => {
    try {
      const data = await fruitTypeService.getAllFruitTypes();
      const fruitsArray = Array.isArray(data) ? data : [];
      setFruits(fruitsArray);
      setFilteredFruits(fruitsArray);
    } catch (error) {
      console.error(error);
    }
  };

  // Yangi meva qo'shish
  const handleCreateFruit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.quality) return;

    setIsSubmitting(true);
    try {
      const payload = {
        name: formData.name.trim(),
        quality: formData.quality,
        description: formData.description.trim()
      };

      const response = await fruitTypeService.createFruitType(payload);
      showToast(response.message || "Global katalogga yangi meva qo'shildi!");
      
      await refreshFruitsOnly(); // Ro'yxatni yangilash
      
      setIsModalOpen(false);
      setFormData({ name: '', quality: '', description: '' });
    } catch (error) {
      showToast(error.response?.data?.message || "Meva qo'shishda xatolik (Balki bu nav bazada bordir?)", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Meva holatini o'zgartirish (Faol/Nofaol)
  const handleToggleStatus = async (id, currentStatus) => {
    if (!window.confirm(`Siz rostdan ham bu mevani ${currentStatus ? 'nofaol' : 'faol'} qilmoqchimisiz?`)) return;
    
    setActionLoadingId(id);
    try {
      const response = await fruitTypeService.toggleStatus(id);
      showToast(response.message || "Holat muvaffaqiyatli o'zgartirildi!");
      await refreshFruitsOnly();
    } catch (error) {
      showToast("Holatni o'zgartirishda xatolik yuz berdi!", "error");
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-50 rounded-xl text-purple-600 shadow-sm">
            <Database size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Global Meva Katalogi (MDM)</h1>
            <p className="text-sm text-gray-500 mt-1">Barcha brokerlar uchun markaziy meva va navlar bazasi</p>
          </div>
        </div>
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-all shadow-sm active:scale-95"
        >
          <Plus size={20} />
          <span>Yangi Katalog Qo'shish</span>
        </button>
      </div>

      {/* TOAST NOTIFICATION */}
      {toast.show && (
        <div className={`mb-6 p-4 border rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 ${
          toast.type === 'error' ? 'bg-red-50 border-red-200 text-red-700' : 'bg-green-50 border-green-200 text-green-700'
        }`}>
          {toast.type === 'error' ? <AlertCircle size={24} /> : <CheckCircle2 size={24} />}
          <p className="font-medium">{toast.message}</p>
        </div>
      )}

      {/* FILTER & SEARCH */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm mb-6 flex gap-4 items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Meva nomi bo'yicha qidirish..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
          />
        </div>
      </div>

      {/* JADVAL */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/70 border-b border-gray-100 text-[13px] uppercase tracking-wider text-gray-500 font-semibold">
                <th className="px-6 py-4">Meva Nomi va Navi</th>
                <th className="px-6 py-4">Tavsifi</th>
                <th className="px-6 py-4">Holati</th>
                <th className="px-6 py-4 text-right">Boshqaruv</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-[14px]">
              
              {isLoading ? (
                <tr>
                  <td colSpan="4" className="px-6 py-16 text-center">
                    <Loader2 className="animate-spin text-purple-600 mx-auto mb-4" size={32} />
                    <p className="text-gray-500 font-medium">Katalog yuklanmoqda...</p>
                  </td>
                </tr>
              ) : filteredFruits.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-16 text-center">
                    <Database size={48} className="text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 font-medium text-lg">Hech narsa topilmadi</p>
                  </td>
                </tr>
              ) : (
                filteredFruits.map((fruit) => (
                  <tr key={fruit.id} className={`hover:bg-gray-50/50 transition-colors ${!fruit.isActive ? 'bg-gray-50/30 opacity-75' : ''}`}>
                    
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-xl ${fruit.isActive ? 'bg-orange-50 text-orange-500' : 'bg-gray-100 text-gray-400'}`}>
                          <Apple size={24} />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 text-base">{fruit.name}</p>
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-gray-100 text-gray-600 mt-1 uppercase tracking-wide">
                            {/* Backenddan kelgan API Map orqali chiroyli nomni chiqarish */}
                            {qualityMap[fruit.quality] || fruit.quality}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-gray-600">
                      {fruit.description || <span className="text-gray-400 italic">Kiritilmagan</span>}
                    </td>

                    <td className="px-6 py-4">
                      {fruit.isActive ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 text-green-700 text-[12px] font-bold border border-green-200">
                          <CheckCircle2 size={14} /> Faol
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-700 text-[12px] font-bold border border-red-200">
                          <AlertCircle size={14} /> Nofaol
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => handleToggleStatus(fruit.id, fruit.isActive)}
                        disabled={actionLoadingId === fruit.id}
                        className={`inline-flex items-center justify-center p-2 rounded-lg transition-colors border ${
                          fruit.isActive 
                            ? 'text-red-600 hover:bg-red-50 border-transparent hover:border-red-200' 
                            : 'text-green-600 hover:bg-green-50 border-transparent hover:border-green-200'
                        }`}
                        title={fruit.isActive ? "O'chirish (Nofaol qilish)" : "Yoqish (Faollashtirish)"}
                      >
                        {actionLoadingId === fruit.id ? (
                          <Loader2 size={20} className="animate-spin text-gray-400" />
                        ) : (
                          <Power size={20} />
                        )}
                      </button>
                    </td>

                  </tr>
                ))
              )}

            </tbody>
          </table>
        </div>
      </div>

      {/* YANGI QO'SHISH MODALI */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div className="flex items-center gap-3">
                <div className="bg-purple-100 p-2 rounded-lg text-purple-600">
                  <Database size={20} />
                </div>
                <h2 className="text-lg font-bold text-gray-900">Global Katalogga Qo'shish</h2>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors"
                disabled={isSubmitting}
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleCreateFruit} className="p-6">
              <div className="space-y-5">
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Meva Nomi <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    required
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 transition-all font-medium"
                    placeholder="Masalan: Olma, Gilos, Shaftoli"
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Sifati / Navi <span className="text-red-500">*</span></label>
                  <select 
                    required
                    value={formData.quality}
                    onChange={e => setFormData({...formData, quality: e.target.value})}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all font-medium text-gray-900"
                    disabled={isSubmitting}
                  >
                    <option value="">-- Navni tanlang --</option>
                    {qualities.map((q) => (
                      <option key={q.key} value={q.key}>{q.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Tavsif (Ixtiyoriy)</label>
                  <textarea 
                    rows="2"
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 transition-all resize-none"
                    placeholder="Masalan: Qizil olma, faqat eksport uchun..."
                    disabled={isSubmitting}
                  />
                </div>

              </div>

              {/* Actions */}
              <div className="mt-8 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                  disabled={isSubmitting}
                >
                  Bekor qilish
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-70"
                >
                  {isSubmitting ? (
                    <><Loader2 size={18} className="animate-spin" /> Saqlanmoqda...</>
                  ) : (
                    <><CheckCircle2 size={18} /> Katalogga Qo'shish</>
                  )}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}