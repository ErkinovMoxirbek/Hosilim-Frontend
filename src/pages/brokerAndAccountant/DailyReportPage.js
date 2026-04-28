import React, { useState, useEffect } from 'react';
import { 
  Calendar, Search, ChevronDown, ChevronUp, 
  UserCircle, Scale, Banknote, Box, Loader2, FileText, Clock
} from 'lucide-react';
import reportService from '../../services/cropService';

// Bugungi sanani YYYY-MM-DD formatida olish
const getTodayString = () => new Date().toISOString().split('T')[0];

export default function DailyReportPage() {
  // ─── Holatlar (States) ──────────────────────────────────────────────────
  const [date, setDate] = useState(getTodayString());
  const [search, setSearch] = useState('');
  
  const [groupedData, setGroupedData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Accordion uchun (Qaysi fermer ochilgani va uning ichki datasi)
  const [expandedId, setExpandedId] = useState(null);
  const [details, setDetails] = useState([]);
  const [isDetailsLoading, setIsDetailsLoading] = useState(false);

  // ─── Asosiy ma'lumotlarni yuklash ───────────────────────────────────────
  useEffect(() => {
    const fetchGroupedData = async () => {
      setIsLoading(true);
      try {
        const res = await reportService.getDailyGroupedHistory(date, search, 0, 50);
        setGroupedData(res.content || []);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    // Qidiruvda yozishni to'xtatgandan keyin 500ms o'tib jo'natish (Debounce)
    const timer = setTimeout(() => {
      fetchGroupedData();
    }, 500);

    return () => clearTimeout(timer);
  }, [date, search]);

  // ─── Accordion (Ichki ma'lumotni) ochish/yopish ─────────────────────────
  const toggleRow = async (farmerId) => {
    // Agar ochiq bo'lsa, yopamiz
    if (expandedId === farmerId) {
      setExpandedId(null);
      setDetails([]);
      return;
    }

    // Yangi qatorni ochamiz va API dan ma'lumot tortamiz
    setExpandedId(farmerId);
    setIsDetailsLoading(true);
    try {
      const res = await reportService.getDailyHistoryDetails(farmerId, date);
      setDetails(res);
    } catch (error) {
      console.error(error);
      setDetails([]);
    } finally {
      setIsDetailsLoading(false);
    }
  };

  // ─── Yordamchi UI: Vaqtni formatlash (14:35 ko'rinishida) ───────────────
  const formatTime = (isoString) => {
    if (!isoString) return '';
    const d = new Date(isoString);
    return d.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });
  };

  // ─── Svodka (Umumiy hisob-kitoblar) ─────────────────────────────────────
  const totalSummary = groupedData.reduce((acc, curr) => ({
    weight: acc.weight + (curr.totalNetWeight || 0),
    amount: acc.amount + (curr.totalAmount || 0),
    baskets: acc.baskets + (curr.totalBaskets || 0),
  }), { weight: 0, amount: 0, baskets: 0 });

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto pb-16 space-y-6">
      
      {/* ─── Sarlavha va Filtrlar ─── */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <h1 className="text-xl font-black text-[#0B1A42] flex items-center gap-2">
          <FileText className="text-blue-500" />
          Kunlik Hisobot
        </h1>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          {/* Sana Tanlagich */}
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="date"
              value={date}
              onChange={(e) => { setDate(e.target.value); setExpandedId(null); }}
              className="pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl font-bold text-gray-700 outline-none focus:border-blue-500 transition-colors w-full sm:w-auto"
            />
          </div>

          {/* Qidiruv */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text"
              placeholder="Fermerni qidiring..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl font-medium text-gray-700 outline-none focus:border-blue-500 transition-colors w-full sm:w-64"
            />
          </div>
        </div>
      </div>

      {/* ─── Asosiy Dashboard (Kichik svodka) ─── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SummaryCard icon={Scale} title="Jami Sof Vazn" value={`${totalSummary.weight.toFixed(1)} kg`} color="text-emerald-600" bg="bg-emerald-50" border="border-emerald-100" />
        <SummaryCard icon={Banknote} title="Jami Summa" value={`${totalSummary.amount.toLocaleString()} UZS`} color="text-blue-600" bg="bg-blue-50" border="border-blue-100" />
        <SummaryCard icon={Box} title="Qaytgan Savatlar" value={`${totalSummary.baskets} ta`} color="text-orange-600" bg="bg-orange-50" border="border-orange-100" />
      </div>

      {/* ─── Jadval Qismi ─── */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center text-gray-400 gap-3">
            <Loader2 className="animate-spin text-blue-500" size={32} />
            <span className="font-medium">Ma'lumotlar yuklanmoqda...</span>
          </div>
        ) : groupedData.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-gray-400 gap-3">
            <FileText size={48} className="opacity-30" />
            <span className="font-bold text-gray-500">Bu sanada hech qanday ma'lumot topilmadi</span>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {groupedData.map((farmer) => (
              <div key={farmer.farmerId} className="flex flex-col">
                
                {/* Asosiy Qator (Guruhlangan) */}
                <div 
                  onClick={() => toggleRow(farmer.farmerId)}
                  className={`flex flex-col md:flex-row md:items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors ${expandedId === farmer.farmerId ? 'bg-blue-50/30' : ''}`}
                >
                  <div className="flex items-center gap-4 mb-3 md:mb-0">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 shrink-0">
                      <UserCircle size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800 text-sm sm:text-base">{farmer.farmerFullName}</h3>
                      <p className="text-xs font-medium text-gray-500">{farmer.farmerPhone}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 md:gap-8 justify-between md:justify-end ml-14 md:ml-0">
                    <div className="text-left md:text-right">
                      <p className="text-[10px] uppercase font-bold text-gray-400">Jami Vazn</p>
                      <p className="font-black text-emerald-600 text-sm sm:text-base">{farmer.totalNetWeight?.toFixed(1)} kg</p>
                    </div>
                    <div className="text-left md:text-right">
                      <p className="text-[10px] uppercase font-bold text-gray-400">Jami Summa</p>
                      <p className="font-black text-blue-600 text-sm sm:text-base">{farmer.totalAmount?.toLocaleString()} UZS</p>
                    </div>
                    <div className="text-left md:text-right w-12 flex justify-end text-gray-400">
                      {expandedId === farmer.farmerId ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </div>
                  </div>
                </div>

                {/* Ichki Qator (Accordion/Details) */}
                {expandedId === farmer.farmerId && (
                  <div className="bg-gray-50 p-4 border-t border-gray-100">
                    {isDetailsLoading ? (
                      <div className="flex justify-center p-4"><Loader2 className="animate-spin text-blue-400" /></div>
                    ) : details.length === 0 ? (
                      <p className="text-center text-gray-400 text-sm font-medium">Batafsil ma'lumot topilmadi.</p>
                    ) : (
                      <div className="space-y-3 pl-4 md:pl-14">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3 border-b border-gray-200 pb-2">
                          Bugungi Kvitansiyalar:
                        </h4>
                        {details.map((detail) => (
                          <div key={detail.id} className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between shadow-sm">
                            
                            <div className="flex items-center gap-3">
                              <div className="bg-gray-100 p-2 rounded-lg text-gray-500">
                                <Clock size={16} />
                              </div>
                              <div>
                                <p className="font-bold text-gray-800 text-sm">{formatTime(detail.createdAt)}</p>
                                <p className="text-xs text-gray-500 font-medium">№ {detail.id}</p>
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-x-8 gap-y-3 flex-1 md:justify-center px-4">
                              <div>
                                <span className="block text-[10px] font-bold text-gray-400 uppercase">Meva / Narx</span>
                                <span className="text-sm font-bold text-gray-700">{detail.fruitName} <span className="font-medium text-gray-500">({detail.unitPrice?.toLocaleString()})</span></span>
                              </div>
                              <div>
                                <span className="block text-[10px] font-bold text-gray-400 uppercase">Savat</span>
                                <span className="text-sm font-bold text-gray-700">{detail.basketName} <span className="font-medium text-gray-500">x{detail.basketCount}</span></span>
                              </div>
                              <div>
                                <span className="block text-[10px] font-bold text-gray-400 uppercase">Netto</span>
                                <span className="text-sm font-black text-emerald-600">{detail.netWeight} kg</span>
                              </div>
                            </div>

                            <div className="bg-blue-50 px-4 py-2 rounded-lg border border-blue-100 min-w-[140px] text-right">
                              <span className="block text-[10px] font-bold text-blue-400 uppercase">Summa</span>
                              <span className="text-base font-black text-blue-700 leading-none">{detail.totalAmount?.toLocaleString()}</span>
                            </div>

                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}

// ─── Kichik komponent: Tepadagi Svodka kartochkasi ───────────────────────
function SummaryCard({ icon: Icon, title, value, color, bg, border }) {
  return (
    <div className={`p-5 rounded-2xl border ${bg} ${border} flex items-center gap-4`}>
      <div className={`p-3 rounded-xl bg-white/60 ${color} shadow-sm`}>
        <Icon size={24} />
      </div>
      <div>
        <h3 className="text-xs font-extrabold uppercase tracking-widest text-gray-500/80 mb-1">{title}</h3>
        <p className={`text-xl sm:text-2xl font-black ${color}`}>{value}</p>
      </div>
    </div>
  );
}