import React, { useState, useEffect } from 'react';
import { Search, Calendar, Package, ArrowDownRight, Filter } from 'lucide-react';
// API_BASE_URL ni o'zingizning config faylingizdan chaqirasiz
// import API_BASE_URL from "../../config";

export default function DistributionHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Backend'dan API kelganda shu funksiyani ishlatasiz
  /*
  const fetchHistory = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("authToken");
      // Sherigingiz bergan API manzilini shu yerga yozasiz
      const response = await fetch(`${API_BASE_URL}/broker/baskets/distribution-history`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setHistory(data.content || data.data || []); 
      }
    } catch (error) {
      console.error('Tarixni yuklashda xatolik:', error);
    } finally {
      setLoading(false);
    }
  };
  */

  // Vaqtinchalik (Mock) ma'lumotlar - API bitguncha dizaynni ko'rib turish uchun
  useEffect(() => {
    // API ulasangiz, pastdagi setTimeout o'rniga fetchHistory() ni chaqirasiz
    setTimeout(() => {
      setHistory([
        { id: 1, farmerName: "Biloliddin Abdulazizov", phone: "+998912134567", basketType: "8-olchamlik karzinka", count: 5169, date: "2026-04-23T15:16:00" },
        { id: 2, farmerName: "Biloliddin Abdulazizov", phone: "+998912134567", basketType: "8-olchamlik karzinka", count: 10, date: "2026-04-22T15:49:00" },
        { id: 3, farmerName: "ABDUQODIR SOTVOLDIYEV", phone: "+998937770137", basketType: "Reyka yashik", count: 100, date: "2026-04-22T15:48:00" },
        { id: 4, farmerName: "ABDUQODIR SOTVOLDIYEV", phone: "+998937770137", basketType: "Reyka yashik", count: 1, date: "2026-04-17T23:40:00" }
      ]);
      setLoading(false);
    }, 800); // 0.8 soniya yuklanish animatsiyasi
  }, []);

  // Ismning birinchi harflarini olish uchun yordamchi funksiya
  const getInitials = (name) => {
    if (!name) return "F";
    const parts = name.split(" ");
    return parts.length > 1 ? (parts[0][0] + parts[1][0]).toUpperCase() : parts[0].substring(0, 2).toUpperCase();
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return {
      day: date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' }),
      time: date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
    };
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#1B5E20]"></div>
        <p className="text-gray-500 font-medium">Tarix yuklanmoqda...</p>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      
      {/* Sahifa Sarlavhasi */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-black text-gray-900 tracking-tight">Tarqatishlar tarixi</h1>
          <p className="text-gray-500 mt-1 font-medium">Fermerlarga tarqatilgan barcha savatlar ro'yxati</p>
        </div>
        
        {/* Qidiruv va Filter */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Fermerni qidirish..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl font-medium text-sm focus:outline-none focus:ring-2 focus:ring-[#1B5E20]/20 focus:border-[#1B5E20] transition-all w-full sm:w-64 shadow-sm"
            />
          </div>
          <button className="p-2.5 bg-white border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors shadow-sm">
            <Filter size={18} />
          </button>
        </div>
      </div>

      {/* Asosiy Jadval */}
      <div className="bg-white border border-gray-100 rounded-[1.5rem] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50/80 text-gray-500 font-bold uppercase tracking-wider text-[11px] border-b border-gray-100">
              <tr>
                <th className="px-6 py-5">Fermer</th>
                <th className="px-6 py-5">Tara turi</th>
                <th className="px-6 py-5 text-right">Soni</th>
                <th className="px-6 py-5 text-right">Vaqti</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {history.length > 0 ? (
                history.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/50 transition-colors group">
                    
                    {/* Fermer ma'lumotlari */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-green-50 text-[#1B5E20] flex items-center justify-center font-bold text-sm border border-green-100">
                          {getInitials(item.farmerName)}
                        </div>
                        <div>
                          <div className="font-bold text-gray-900">{item.farmerName}</div>
                          <div className="text-gray-500 text-[11px] mt-0.5 font-medium">{item.phone}</div>
                        </div>
                      </div>
                    </td>

                    {/* Tara turi */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Package size={16} className="text-gray-400" />
                        <span className="font-medium bg-gray-100 text-gray-700 px-2.5 py-1 rounded-md text-xs">
                          {item.basketType}
                        </span>
                      </div>
                    </td>

                    {/* Soni (Yashil rangda ajralib turadi) */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5 text-[#1B5E20] font-black text-lg">
                        <ArrowDownRight size={16} strokeWidth={3} />
                        {item.count}
                        <span className="text-[11px] font-bold text-gray-400 uppercase">dona</span>
                      </div>
                    </td>

                    {/* Sana va Vaqt */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex flex-col items-end">
                        <span className="font-bold text-gray-900">{formatDate(item.date).time}</span>
                        <div className="flex items-center gap-1 text-gray-400 text-xs font-medium mt-0.5">
                          <Calendar size={12} />
                          {formatDate(item.date).day}
                        </div>
                      </div>
                    </td>

                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-6 py-16 text-center">
                    <p className="text-gray-500 font-medium text-base">Hozircha tarqatilgan savatlar tarixi yo'q.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}