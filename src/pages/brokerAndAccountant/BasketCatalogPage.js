import React, { useState, useEffect } from 'react';
import basketService from '../../services/basketService';
import { 
  PackageSearch, 
  Plus, 
  Scale, 
  Ruler, 
  CheckCircle2, 
  XCircle,
  MoreVertical, 
  X, 
  Loader2,
  Box
} from 'lucide-react';

// Materiallarni o'zbekchaga o'girish uchun lug'at (Enum mapper)
const MATERIAL_LABELS = {
  PLASTIC: "Plastik",
  WOOD: "Yog'och",
  SACK: "Qop (Mato)",
  CARDBOARD: "Karton"
};

export default function BasketCatalogPage() {
  const [baskets, setBaskets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Yangi savat formasi state'i
  const [newBasket, setNewBasket] = useState({
    name: '',
    material: 'PLASTIC', // Default qiymat
    weight: '',
    dimensions: '',
    description: ''
  });

  useEffect(() => {
    fetchBaskets();
  }, []);

  const fetchBaskets = async () => {
    setIsLoading(true);
    try {
      const data = await basketService.getBaskets();
      // Backend Map(content: [...]) qaytaradi, shuning uchun .content ni olamiz
      const basketsArray = Array.isArray(data?.content) ? data.content : [];
      setBaskets(basketsArray);
    } catch (error) {
      alert("Savatlarni yuklashda xatolik yuz berdi!");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateBasket = async (e) => {
    e.preventDefault();
    if (!newBasket.name || !newBasket.weight) {
      alert("Iltimos, barcha majburiy maydonlarni to'ldiring.");
      return;
    }

    setIsSubmitting(true);
    try {
      const createdBasket = await basketService.createBasket(newBasket);
      
      // Yangi yaratilgan savatni ro'yxatning boshiga qo'shamiz
      setBaskets(prev => [createdBasket, ...prev]);
      
      // Modalni yopish va tozalash
      setIsModalOpen(false);
      setNewBasket({ name: '', material: 'PLASTIC', weight: '', dimensions: '', description: '' });
      
    } catch (error) {
      alert("Savatni yaratishda xatolik yuz berdi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header Qismi */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#0B1A42]/5 rounded-xl text-[#0B1A42]">
            <PackageSearch size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#0B1A42]">Savatlar Katalogi</h1>
            <p className="text-sm text-gray-500 mt-1">Qabul punktidagi mavjud tara va yashik turlari</p>
          </div>
        </div>
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#14A44D] text-white rounded-xl font-medium hover:bg-[#118f43] transition-all shadow-sm active:scale-95"
        >
          <Plus size={20} />
          <span>Yangi savat qo'shish</span>
        </button>
      </div>

      {/* Jadval Qismi */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-32 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <Loader2 className="animate-spin text-[#14A44D] mb-4" size={40} />
          <p className="text-gray-500 font-medium">Katalog yuklanmoqda...</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/70 border-b border-gray-100 text-[13px] uppercase tracking-wider text-gray-500 font-semibold">
                  <th className="px-6 py-4">Savat Nomi</th>
                  <th className="px-6 py-4">Material</th>
                  <th className="px-6 py-4">Bo'sh Og'irligi (Tara)</th>
                  <th className="px-6 py-4">O'lchami</th>
                  <th className="px-6 py-4">Holati</th>
                  <th className="px-6 py-4 text-right">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-[14px]">
                {baskets.map((basket) => (
                  <tr key={basket.id} className="hover:bg-gray-50/50 transition-colors">
                    
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                          <Box size={20} />
                        </div>
                        <div>
                          <p className="font-bold text-[#0B1A42]">{basket.name}</p>
                          <p className="text-[12px] text-gray-500 truncate max-w-[200px]">
                            {basket.description || "Izoh yo'q"}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-[13px] font-medium">
                        {MATERIAL_LABELS[basket.material] || basket.material}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-gray-700 font-semibold">
                        <Scale size={16} className="text-gray-400" />
                        {basket.weight} kg
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-gray-600">
                        <Ruler size={16} className="text-gray-400" />
                        {basket.dimensions || "Kiritilmagan"}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      {basket.isActive ? (
                        <span className="inline-flex items-center gap-1.5 text-green-600 text-[13px] font-bold">
                          <CheckCircle2 size={16} /> Faol
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-red-500 text-[13px] font-bold">
                          <XCircle size={16} /> Nofaol
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <button className="p-2 text-gray-400 hover:text-[#0B1A42] hover:bg-gray-100 rounded-lg transition-colors">
                        <MoreVertical size={20} />
                      </button>
                    </td>
                  </tr>
                ))}
                
                {baskets.length === 0 && (
                  <tr>
                    <td colSpan="6" className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <PackageSearch size={48} className="text-gray-300 mb-4" />
                        <h3 className="text-lg font-bold text-gray-700 mb-1">Katalog bo'sh</h3>
                        <p className="text-gray-500 mb-4">Hali hech qanday savat turi qo'shilmagan.</p>
                        <button 
                          onClick={() => setIsModalOpen(true)}
                          className="text-[#14A44D] font-medium hover:underline"
                        >
                          Birinchi savatni yaratish
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* YANGI SAVAT QO'SHISH MODALI */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-[#0B1A42]/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-gray-50/50">
              <div>
                <h2 className="text-lg font-bold text-[#0B1A42]">Yangi savat turi</h2>
                <p className="text-[13px] text-gray-500">Tizimga yangi tara qo'shish</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                disabled={isSubmitting}
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleCreateBasket} className="p-6">
              <div className="space-y-5">
                
                {/* Nomi */}
                <div>
                  <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Savat Nomi <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    required
                    value={newBasket.name}
                    onChange={(e) => setNewBasket({...newBasket, name: e.target.value})}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#14A44D]/20 focus:border-[#14A44D] transition-all"
                    placeholder="Masalan: Qora Plastik Yashik (Katta)"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Material */}
                  <div>
                    <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Materiali <span className="text-red-500">*</span></label>
                    <select 
                      value={newBasket.material}
                      onChange={(e) => setNewBasket({...newBasket, material: e.target.value})}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#14A44D]/20 focus:border-[#14A44D] transition-all appearance-none"
                      disabled={isSubmitting}
                    >
                      <option value="PLASTIC">Plastik</option>
                      <option value="WOOD">Yog'och</option>
                      <option value="SACK">Qop (Mato)</option>
                      <option value="CARDBOARD">Karton</option>
                    </select>
                  </div>

                  {/* Og'irlik */}
                  <div>
                    <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Tara Og'irligi (kg) <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <input 
                        type="number" 
                        step="0.1"
                        required
                        value={newBasket.weight}
                        onChange={(e) => setNewBasket({...newBasket, weight: e.target.value})}
                        className="w-full pl-4 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#14A44D]/20 focus:border-[#14A44D] transition-all"
                        placeholder="0.0"
                        disabled={isSubmitting}
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium text-sm">kg</span>
                    </div>
                  </div>
                </div>

                {/* O'lchamlari */}
                <div>
                  <label className="block text-[13px] font-bold text-gray-700 mb-1.5">O'lchamlari (Ixtiyoriy)</label>
                  <input 
                    type="text" 
                    value={newBasket.dimensions}
                    onChange={(e) => setNewBasket({...newBasket, dimensions: e.target.value})}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#14A44D]/20 focus:border-[#14A44D] transition-all"
                    placeholder="Masalan: 60x40x20 sm"
                    disabled={isSubmitting}
                  />
                </div>

                {/* Izoh */}
                <div>
                  <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Qo'shimcha Izoh</label>
                  <textarea 
                    rows="2"
                    value={newBasket.description}
                    onChange={(e) => setNewBasket({...newBasket, description: e.target.value})}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#14A44D]/20 focus:border-[#14A44D] transition-all resize-none"
                    placeholder="Savat haqida qo'shimcha ma'lumotlar..."
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-8 pt-4 border-t border-gray-100">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                  disabled={isSubmitting}
                >
                  Bekor qilish
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#14A44D] text-white rounded-xl font-bold hover:bg-[#118f43] transition-colors shadow-md shadow-[#14A44D]/20 disabled:opacity-70"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={18} className="animate-spin" /> 
                      <span>Saqlanmoqda...</span>
                    </>
                  ) : (
                    <span>Saqlash</span>
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