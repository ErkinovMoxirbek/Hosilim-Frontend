import React, { useState, useEffect } from 'react';
import { 
  Bell, Plus, Trash2, Info, AlertTriangle, AlertCircle, X 
} from 'lucide-react';
import { announcementService } from '../../services/announcementService';

const AdminAnnouncementsPage = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'INFO' // Default holat
  });

  // Turlarga qarab rang va ikonka berish
  const typeConfig = {
    INFO: { color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', icon: Info, label: "Ma'lumot" },
    WARNING: { color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200', icon: AlertTriangle, label: "Ogohlantirish" },
    URGENT: { color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', icon: AlertCircle, label: "O'ta muhim" }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setIsLoading(true);
      const response = await announcementService.getActiveAnnouncements();
      if (response.data?.data) {
        setAnnouncements(response.data.data);
      }
    } catch (error) {
      console.error("E'lonlarni tortishda xatolik:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await announcementService.createAnnouncement(formData);
      
      // Tozalash va yopish
      setFormData({ title: '', message: '', type: 'INFO' });
      setIsModalOpen(false);
      
      // Ro'yxatni yangilash
      fetchAnnouncements();
    } catch (error) {
      console.error("E'lon yaratishda xatolik:", error);
      alert("Xatolik yuz berdi!");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bu e'lonni o'chirmoqchimisiz? U barcha xodimlar ekranidan yo'qoladi.")) {
      try {
        await announcementService.deleteAnnouncement(id);
        setAnnouncements(announcements.filter(a => a.id !== id));
      } catch (error) {
        console.error("O'chirishda xatolik:", error);
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* Header Qismi */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Bell size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#0B1A42]">Tizim E'lonlari</h1>
            <p className="text-gray-500 text-sm mt-1">
              Barcha xodimlarga (Broker, Hisobchi) ko'rinadigan xabarlarni boshqarish
            </p>
          </div>
        </div>
        
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-all active:scale-95 shadow-sm shadow-blue-200"
        >
          <Plus size={20} />
          Yangi E'lon Qo'shish
        </button>
      </div>

      {/* E'lonlar Ro'yxati */}
      {isLoading ? (
        <div className="text-center py-20 text-gray-500">Yuklanmoqda...</div>
      ) : announcements.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-gray-200 text-center shadow-sm">
          <Bell size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-bold text-gray-900">Faol e'lonlar yo'q</h3>
          <p className="text-gray-500 mt-2">Hozircha tizimda hech qanday xabar mavjud emas.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {announcements.map((item) => {
            const config = typeConfig[item.type] || typeConfig.INFO;
            const Icon = config.icon;

            return (
              <div 
                key={item.id} 
                className={`bg-white rounded-2xl border-l-4 ${config.border} border-t border-r border-b border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow relative group`}
              >
                <div className="flex gap-4">
                  <div className={`p-3 rounded-xl h-fit ${config.bg} ${config.color}`}>
                    <Icon size={24} />
                  </div>
                  
                  <div className="flex-1 pr-12">
                    <div className="flex items-center gap-3 mb-1">
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${config.bg} ${config.color}`}>
                        {config.label}
                      </span>
                      <span className="text-xs text-gray-400 font-medium">
                        {new Date(item.createdAt).toLocaleString('uz-UZ', {
                          day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
                        })}
                      </span>
                    </div>
                    
                    <h3 className="text-[16px] font-bold text-gray-900 mb-2">{item.title}</h3>
                    <p className="text-gray-600 text-[14px] leading-relaxed whitespace-pre-line">
                      {item.message}
                    </p>
                  </div>
                </div>

                {/* O'chirish tugmasi (Hover bo'lganda chiqadi) */}
                <button
                  onClick={() => handleDelete(item.id)}
                  className="absolute top-5 right-5 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                  title="E'lonni o'chirish"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* YANGI E'LON QO'SHISH MODAL OYNASI */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl transform transition-all">
            
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Bell className="text-blue-600" size={20} />
                Yangi e'lon yaratish
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-700 bg-white hover:bg-gray-100 p-1.5 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              
              <div className="space-y-5">
                {/* Turini tanlash */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">E'lon turi</label>
                  <div className="grid grid-cols-3 gap-3">
                    {Object.entries(typeConfig).map(([key, value]) => (
                      <div 
                        key={key}
                        onClick={() => setFormData({...formData, type: key})}
                        className={`cursor-pointer border rounded-xl p-3 flex flex-col items-center gap-2 transition-all ${
                          formData.type === key 
                          ? `${value.border} ${value.bg} ring-2 ring-${value.color.split('-')[1]}-500/20` 
                          : 'border-gray-200 hover:bg-gray-50 grayscale opacity-60 hover:grayscale-0 hover:opacity-100'
                        }`}
                      >
                        <value.icon className={formData.type === key ? value.color : 'text-gray-500'} size={24} />
                        <span className={`text-xs font-bold ${formData.type === key ? value.color : 'text-gray-600'}`}>
                          {value.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sarlavha */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Sarlavha <span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="Masalan: Tizimda profilaktika..."
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>

                {/* Matn */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Xabar matni <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    rows="4"
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    placeholder="Xodimlarga yetkazilishi kerak bo'lgan batafsil ma'lumotni yozing..."
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none"
                  ></textarea>
                </div>
              </div>

              <div className="mt-8 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 font-medium rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-3 text-white bg-blue-600 font-medium rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {isSubmitting ? 'Yuborilmoqda...' : (
                    <>
                      <Bell size={18} /> E'lon qilish
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminAnnouncementsPage;