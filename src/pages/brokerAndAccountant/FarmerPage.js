import React, { useState, useEffect } from 'react';
// DIQQAT: farmerService faylingiz qayerda joylashganiga qarab manzilni to'g'rilang
import farmerService from '../../services/farmerService'; 
import { 
  Search, 
  Plus, 
  Phone, 
  AlertCircle, 
  CheckCircle2, 
  MoreVertical, 
  X, 
  Loader2 
} from 'lucide-react';

export default function FarmerPage() {
  const [farmers, setFarmers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [newFarmer, setNewFarmer] = useState({ firstName: '', lastName: '', phone: '+998' });

  // Sahifa yuklanganda fermerlarni olib kelish
  useEffect(() => {
    fetchFarmers();
  }, []);

  // API dan ma'lumotlarni tortish funksiyasi
  const fetchFarmers = async () => {
    setIsLoading(true);
    try {
      const data = await farmerService.getAllFarmers();
      
      // XATOLIKNING YECHIMI: Backenddan kelgan ma'lumotni xavfsiz massivga o'g'irish
      const farmersArray = Array.isArray(data) ? data : (data?.content || []);
      setFarmers(farmersArray);
      
    } catch (error) {
      console.error("Ma'lumotlarni yuklashda xatolik:", error);
      alert("Ma'lumotlarni yuklashda xatolik yuz berdi!");
    } finally {
      setIsLoading(false);
    }
  };

  // Yangi fermer qo'shish formasi yuborilganda
  const handleAddFarmer = async (e) => {
    e.preventDefault();
    
    if (newFarmer.phone.length < 13) {
      alert("Iltimos, telefon raqamni to'liq kiriting (+998xxxxxxxxx)");
      return;
    }

    setIsSubmitting(true);
    try {
      const createdFarmer = await farmerService.createShadowFarmer(newFarmer);
      
      // Yangi fermerni ro'yxatning boshiga qo'shish
      setFarmers(prev => [createdFarmer, ...prev]);
      
      // Formani tozalash va yopish
      setIsModalOpen(false);
      setNewFarmer({ firstName: '', lastName: '', phone: '+998' });
      
    } catch (error) {
      if (error.response?.status === 409) {
        alert("Bu telefon raqamiga ega fermer tizimda mavjud!");
      } else {
        alert("Fermer yaratishda xatolik yuz berdi");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Xavfsiz qidiruv filtri (farmers massiv ekanligiga ishonch hosil qilib)
  const filteredFarmers = (Array.isArray(farmers) ? farmers : []).filter(f => 
    f.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.phoneNumber?.includes(searchQuery)
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#0B1A42]">Fermerlar</h1>
          <p className="text-sm text-gray-500 mt-1">Tizimdagi barcha fermerlar va ularning statusi</p>
        </div>
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#14A44D] text-white rounded-xl font-medium hover:bg-[#118f43] transition-colors"
        >
          <Plus size={20} />
          <span>Yangi fermer (Tezkor)</span>
        </button>
      </div>

      {/* Qidiruv */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Ism yoki telefon raqam orqali qidirish..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#14A44D]/20 focus:border-[#14A44D] transition-all"
          />
        </div>
      </div>

      {/* Jadval yoki Yuklanish */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <Loader2 className="animate-spin text-[#14A44D] mb-4" size={40} />
          <p className="text-gray-500 font-medium">Ma'lumotlar yuklanmoqda...</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100 text-[13px] uppercase tracking-wider text-gray-500 font-semibold">
                  <th className="px-6 py-4">Fermer</th>
                  <th className="px-6 py-4">Telefon raqam</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Balans</th>
                  <th className="px-6 py-4 text-right">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-[14px]">
                {filteredFarmers.map((farmer) => (
                  <tr key={farmer.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#0B1A42]/5 flex items-center justify-center text-[#0B1A42] font-bold">
                          {farmer.firstName?.charAt(0) || 'F'}
                        </div>
                        <div>
                          <p className="font-semibold text-[#0B1A42]">{farmer.firstName} {farmer.lastName}</p>
                          <p className="text-[12px] text-gray-500">ID: #{farmer.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600 font-medium">
                      <div className="flex items-center gap-2">
                        <Phone size={16} className="text-gray-400" />
                        {farmer.phoneNumber || farmer.phone}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {farmer.isShadow ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50 text-amber-700 text-[12px] font-semibold border border-amber-200/50">
                          <AlertCircle size={14} />
                          Tasdiqlanmagan
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-green-50 text-green-700 text-[12px] font-semibold border border-green-200/50">
                          <CheckCircle2 size={14} />
                          Tasdiqlangan
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`font-semibold ${farmer.balanceAmount < 0 ? 'text-red-600' : 'text-gray-700'}`}>
                        {farmer.balanceAmount?.toLocaleString() || 0} UZS
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 text-gray-400 hover:text-[#0B1A42] hover:bg-gray-100 rounded-lg transition-colors">
                        <MoreVertical size={20} />
                      </button>
                    </td>
                  </tr>
                ))}
                
                {filteredFarmers.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                      Fermer topilmadi.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tezkor qo'shish Modali */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-[#0B1A42]/20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="text-lg font-bold text-[#0B1A42]">Tezkor fermer qo'shish</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                disabled={isSubmitting}
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleAddFarmer} className="p-5">
              <div className="space-y-4">
                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Ism <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    required
                    value={newFarmer.firstName}
                    onChange={(e) => setNewFarmer({...newFarmer, firstName: e.target.value})}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#14A44D]/20 focus:border-[#14A44D] transition-all"
                    placeholder="Fermerning ismi"
                    disabled={isSubmitting}
                  />
                </div>
                
                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Familiya</label>
                  <input 
                    type="text" 
                    value={newFarmer.lastName}
                    onChange={(e) => setNewFarmer({...newFarmer, lastName: e.target.value})}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#14A44D]/20 focus:border-[#14A44D] transition-all"
                    placeholder="Familiyasi (ixtiyoriy)"
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Telefon raqam <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    required
                    value={newFarmer.phone}
                    onChange={(e) => setNewFarmer({...newFarmer, phone: e.target.value})}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#14A44D]/20 focus:border-[#14A44D] transition-all font-medium"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                  disabled={isSubmitting}
                >
                  Bekor qilish
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#14A44D] text-white rounded-xl font-medium hover:bg-[#118f43] transition-colors shadow-sm shadow-[#14A44D]/20 disabled:opacity-70"
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