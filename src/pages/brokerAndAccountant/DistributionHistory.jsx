import React, { useState, useEffect } from 'react';
import { Search, Calendar, Package, ArrowDownRight, Filter } from 'lucide-react';

export default function DistributionHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // 🚀 SHERIGING API BERGANDA SHU YERDAGI MANZILNI O'ZGARTIRASAN
  const API_URL = "http://localhost:8080/api/v1/baskets/distributions"; 

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token"); // Tokenni olish

        const response = await fetch(API_URL, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` // Agar xavfsizlik (Spring Security) bo'lsa
          }
        });

        if (response.ok) {
          const data = await response.json();
          // Backend ma'lumotni 'content' ichida yoki to'g'ridan-to'g'ri massivda berishi mumkin
          setHistory(data.content || data.data || data || []);
        } else {
          console.error("Serverdan xato keldi:", response.status);
        }
      } catch (error) {
        console.error("API ulanishida xatolik:", error);
        // Xato bo'lsa, jadval bo'sh qolmasligi uchun vaqtinchalik namunalar (test uchun)
        // Agar realniy ishlatmoqchi bo'lsang buni o'chirib tashla:
        setHistory([
          { id: 1, farmerName: "Namuna Fermer", phone: "+998901234567", basketType: "Yashik", count: 100, date: new Date().toISOString() }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [API_URL]);

  // Qidiruv filtri
  const filteredHistory = history.filter(item => 
    item.farmerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.phone?.includes(searchTerm)
  );

  const getInitials = (name) => {
    if (!name) return "F";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return {
      day: date.toLocaleDateString('uz-UZ'),
      time: date.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })
    };
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600"></div>
        <p className="text-gray-500 font-medium font-sans">Tarix yuklanmoqda...</p>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-black text-gray-900 tracking-tight italic">Tarqatishlar tarixi</h1>
          <p className="text-gray-500 mt-1 font-medium">Barcha tarqatilgan savatlar ro'yxati (API ulanishiga tayyor)</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Fermerni qidirish..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl font-medium text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all w-full sm:w-64 shadow-sm"
            />
          </div>
          <button className="p-2.5 bg-white border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 shadow-sm">
            <Filter size={18} />
          </button>
        </div>
      </div>

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
              {filteredHistory.length > 0 ? (
                filteredHistory.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-green-50 text-green-700 flex items-center justify-center font-bold text-sm border border-green-100">
                          {getInitials(item.farmerName)}
                        </div>
                        <div>
                          <div className="font-bold text-gray-900">{item.farmerName}</div>
                          <div className="text-gray-500 text-[11px] mt-0.5 font-medium">{item.phone}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Package size={16} className="text-gray-400" />
                        <span className="font-medium bg-gray-100 text-gray-700 px-2.5 py-1 rounded-md text-xs">
                          {item.basketType || "Aniqlanmagan"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5 text-green-700 font-black text-lg">
                        <ArrowDownRight size={16} strokeWidth={3} />
                        {item.count}
                        <span className="text-[11px] font-bold text-gray-400 uppercase">dona</span>
                      </div>
                    </td>
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
                    <p className="text-gray-400 font-medium">Ma'lumot topilmadi.</p>
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