import React, { useState, useEffect } from 'react';
import { Bell, Info, AlertTriangle, AlertCircle } from 'lucide-react';
import { announcementService } from '../../services/announcementService'; // API yo'lini o'zingizga moslang

const AnnouncementsPage = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Turlarga qarab rang va ikonka berish (Admin bilan bir xil)
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

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Header Qismi */}
      <div className="flex items-center gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
          <Bell size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[#0B1A42]">Tizim E'lonlari</h1>
          <p className="text-gray-500 text-sm mt-1">
            Tizimdagi so'nggi yangiliklar, o'zgarishlar va ogohlantirishlar
          </p>
        </div>
      </div>

      {/* E'lonlar Ro'yxati */}
      {isLoading ? (
        <div className="flex flex-col gap-4">
          {[1, 2, 3].map(n => (
            <div key={n} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm animate-pulse flex gap-4">
              <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
              <div className="flex-1 space-y-3 py-1">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>
          ))}
        </div>
      ) : announcements.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-gray-200 text-center shadow-sm flex flex-col items-center">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
            <Bell size={32} className="text-gray-300" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">Hozircha e'lonlar yo'q</h3>
          <p className="text-gray-500 mt-2">Tizim Administratori tomonidan yuborilgan xabarlar shu yerda ko'rinadi.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {announcements.map((item) => {
            const config = typeConfig[item.type] || typeConfig.INFO;
            const Icon = config.icon;

            return (
              <div 
                key={item.id} 
                className={`bg-white rounded-2xl border-l-4 ${config.border} border-t border-r border-b border-gray-100 p-5 sm:p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col sm:flex-row gap-4 sm:gap-5`}
              >
                <div className={`p-3 rounded-xl h-fit w-fit ${config.bg} ${config.color}`}>
                  <Icon size={28} />
                </div>
                
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${config.bg} ${config.color}`}>
                      {config.label}
                    </span>
                    <span className="text-xs text-gray-400 font-medium bg-gray-50 px-2 py-1 rounded-lg">
                      {new Date(item.createdAt).toLocaleString('uz-UZ', {
                        day: '2-digit', month: '2-digit', year: 'numeric', 
                        hour: '2-digit', minute: '2-digit'
                      })}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-600 text-[15px] leading-relaxed whitespace-pre-line bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                    {item.message}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AnnouncementsPage;