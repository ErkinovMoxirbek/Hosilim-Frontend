import React, { useState, useEffect } from 'react';
import { 
  Calendar, Search, ChevronDown, ChevronUp, 
  UserCircle, Scale, Banknote, Box, Loader2, FileText, Clock, Filter
} from 'lucide-react';
import reportService from '../../services/cropService';

// Bugungi sanani YYYY-MM-DD formatida olish
const getTodayString = () => new Date().toISOString().split('T')[0];

export default function ReportPage() {
  // ─── Holatlar (States) ──────────────────────────────────────────────────
  const [startDate, setStartDate] = useState(getTodayString());
  const [endDate, setEndDate] = useState(getTodayString());
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
        const res = await reportService.getDailyGroupedHistory(startDate, endDate, search, 0, 50);
        setGroupedData(res.content || []);
      } catch (error) {
        console.error("Ma'lumotlarni yuklashda xato:", error);
      } finally {
        setIsLoading(false);
      }
    };

    // Qidiruvda yozishni to'xtatgandan keyin 500ms o'tib jo'natish (Debounce)
    const timer = setTimeout(() => {
      fetchGroupedData();
    }, 500);

    return () => clearTimeout(timer);
  }, [startDate, endDate, search]);

  // ─── Accordion (Ichki ma'lumotni) ochish/yopish ─────────────────────────
  const toggleRow = async (farmerId) => {
    if (expandedId === farmerId) {
      setExpandedId(null);
      setDetails([]);
      return;
    }

    setExpandedId(farmerId);
    setIsDetailsLoading(true);
    try {
      // Bitta date o'rniga startDate va endDate yuboriladi
      const res = await reportService.getDailyHistoryDetails(farmerId, startDate, endDate);
      setDetails(res);
    } catch (error) {
      console.error("Batafsil ma'lumotni yuklashda xato:", error);
      setDetails([]);
    } finally {
      setIsDetailsLoading(false);
    }
  };

  // ─── Yordamchi UI: Sana va Vaqtni formatlash ────────────────────────────
  const formatDateTime = (isoString) => {
    if (!isoString) return '';
    const d = new Date(isoString);
    // Oraliq hisobotlar uchun ham sana, ham soat ko'rinishi kerak (12.05.2024, 14:35)
    return d.toLocaleString('uz-UZ', { 
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit' 
    });
  };

  // ─── Svodka (Umumiy hisob-kitoblar) ─────────────────────────────────────
  const totalSummary = groupedData.reduce((acc, curr) => ({
    weight: acc.weight + (curr.totalNetWeight || 0),
    amount: acc.amount + (curr.totalAmount || 0),
    baskets: acc.baskets + (curr.totalBaskets || 0),
  }), { weight: 0, amount: 0, baskets: 0 });

  const isDaily = startDate === endDate;

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto pb-16 space-y-6 bg-gray-50/50 min-h-screen">
      
      {/* ─── Sarlavha va Filtrlar (Modern UI) ─── */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col xl:flex-row gap-5 xl:justify-between xl:items-center">
        
        {/* Dinamik Sarlavha */}
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#0B1A42] flex items-center gap-2">
            <FileText className="text-blue-500" size={28} />
            {isDaily ? "Kunlik Hisobot" : "Oraliq Hisobot"}
          </h1>
          <p className="text-sm text-gray-500 mt-1 font-medium ml-9">
            {isDaily ? "Bugungi qabul qilingan hosil statistikasi" : "Tanlangan davr oralig'idagi statistika"}
          </p>
        </div>

        {/* Filtrlar bloki */}
        <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto">
          
          {/* Sana Tanlagich (Date Range) */}
          <div className="flex items-center bg-gray-50 border border-gray-300 rounded-xl p-1 w-full sm:w-auto focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
            <div className="flex items-center pl-3 text-gray-400">
              <Calendar size={18} />
            </div>
            <input 
              type="date"
              value={startDate}
              onChange={(e) => { setStartDate(e.target.value); setExpandedId(null); }}
              className="bg-transparent border-none outline-none font-bold text-gray-700 text-sm px-3 py-2 w-full cursor-pointer"
            />
            <span className="text-gray-300 font-bold px-1">-</span>
            <input 
              type="date"
              value={endDate}
              min={startDate} // Boshlanish sanasidan oldinga o'tib ketmasligi uchun
              onChange={(e) => { setEndDate(e.target.value); setExpandedId(null); }}
              className="bg-transparent border-none outline-none font-bold text-gray-700 text-sm px-3 py-2 w-full cursor-pointer"
            />
          </div>

          {/* Qidiruv */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text"
              placeholder="Fermerning F.I.O yoki raqami..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl font-medium text-sm text-gray-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all w-full"
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
        
        {/* Sarlavha qatori (Desktop uchun) */}
        <div className="hidden md:flex items-center justify-between p-4 bg-gray-50/80 border-b border-gray-200 text-xs font-extrabold text-gray-400 uppercase tracking-wider">
          <div className="flex-1 ml-14">Fermer ma'lumotlari</div>
          <div className="w-32 text-right">Jami Vazn</div>
          <div className="w-40 text-right">Jami Summa</div>
          <div className="w-12"></div>
        </div>

        {isLoading ? (
          <div className="py-24 flex flex-col items-center justify-center text-gray-400 gap-4">
            <Loader2 className="animate-spin text-blue-500" size={36} />
            <span className="font-medium text-sm tracking-wide">Ma'lumotlar yuklanmoqda...</span>
          </div>
        ) : groupedData.length === 0 ? (
          <div className="py-24 flex flex-col items-center justify-center text-gray-400 gap-3">
            <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mb-2">
              <Filter size={28} className="text-gray-300" />
            </div>
            <span className="font-bold text-gray-500 text-lg">Ma'lumot topilmadi</span>
            <span className="text-sm font-medium text-gray-400">Boshqa sanani tanlab ko'ring yoki qidiruvni o'zgartiring.</span>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {groupedData.map((farmer) => (
              <div key={farmer.farmerId} className="flex flex-col group">
                
                {/* Asosiy Qator (Guruhlangan) */}
                <div 
                  onClick={() => toggleRow(farmer.farmerId)}
                  className={`flex flex-col md:flex-row md:items-center justify-between p-4 sm:px-6 cursor-pointer hover:bg-blue-50/40 transition-colors ${expandedId === farmer.farmerId ? 'bg-blue-50/40' : ''}`}
                >
                  <div className="flex items-center gap-4 mb-3 md:mb-0 flex-1">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors ${expandedId === farmer.farmerId ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400 group-hover:text-gray-600'}`}>
                      <UserCircle size={24} />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-gray-800 text-sm sm:text-base">{farmer.farmerFullName}</h3>
                      <p className="text-xs font-medium text-gray-500">{farmer.farmerPhone}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 sm:gap-6 justify-between md:justify-end ml-14 md:ml-0">
                    <div className="md:w-32 text-left md:text-right">
                      <p className="text-[10px] uppercase font-bold text-gray-400 md:hidden">Jami Vazn</p>
                      <p className="font-black text-emerald-600 text-sm sm:text-base">{farmer.totalNetWeight?.toFixed(1)} kg</p>
                    </div>
                    <div className="md:w-40 text-left md:text-right">
                      <p className="text-[10px] uppercase font-bold text-gray-400 md:hidden">Jami Summa</p>
                      <p className="font-black text-blue-600 text-sm sm:text-base">{farmer.totalAmount?.toLocaleString()} UZS</p>
                    </div>
                    <div className="w-8 flex justify-end text-gray-400">
                      {expandedId === farmer.farmerId ? <ChevronUp size={20} className="text-blue-500" /> : <ChevronDown size={20} />}
                    </div>
                  </div>
                </div>

                {/* Ichki Qator (Accordion/Details) */}
                {expandedId === farmer.farmerId && (
                  <div className="bg-gray-50/80 p-4 sm:px-6 border-t border-gray-100 shadow-inner">
                    {isDetailsLoading ? (
                      <div className="flex justify-center py-6"><Loader2 className="animate-spin text-blue-400" size={24} /></div>
                    ) : details.length === 0 ? (
                      <p className="text-center text-gray-400 text-sm font-medium py-4">Batafsil ma'lumot topilmadi.</p>
                    ) : (
                      <div className="space-y-3 md:pl-14">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4 border-b border-gray-200 pb-2">
                          Batafsil kvitansiyalar tarixi
                        </h4>
                        {details.map((detail) => (
                          <div key={detail.id} className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col xl:flex-row gap-4 items-start xl:items-center justify-between shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)] hover:border-blue-200 transition-colors">
                            
                            {/* Vaqt va ID */}
                            <div className="flex items-center gap-3 w-full xl:w-48">
                              <div className="bg-gray-50 p-2.5 rounded-xl text-gray-400">
                                <Clock size={18} />
                              </div>
                              <div>
                                <p className="font-bold text-gray-800 text-sm">{formatDateTime(detail.createdAt)}</p>
                                <p className="text-xs text-gray-400 font-medium tracking-wide">ID: #{detail.id}</p>
                              </div>
                            </div>

                            {/* Ko'rsatkichlar */}
                            <div className="flex flex-wrap gap-x-6 gap-y-3 flex-1 px-2 xl:px-4 w-full justify-between xl:justify-start">
                              <div>
                                <span className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-wide">Meva turi</span>
                                <span className="text-sm font-bold text-gray-700">{detail.fruitName}</span>
                              </div>
                              <div>
                                <span className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-wide">Narxi</span>
                                <span className="text-sm font-bold text-gray-700">{detail.unitPrice?.toLocaleString()}</span>
                              </div>
                              <div>
                                <span className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-wide">Savat</span>
                                <span className="text-sm font-bold text-gray-700">{detail.basketName} <span className="text-gray-400 font-medium">x{detail.basketCount}</span></span>
                              </div>
                              <div className="xl:ml-auto pr-4 border-r border-gray-100 hidden xl:block">
                                <span className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-wide text-right">Netto Vazn</span>
                                <span className="text-sm font-black text-emerald-600">{detail.netWeight} kg</span>
                              </div>
                            </div>

                            {/* Mobile uchun Netto */}
                            <div className="flex justify-between w-full xl:hidden pt-2 border-t border-gray-100">
                               <span className="text-xs font-extrabold text-gray-400 uppercase mt-1">Netto Vazn:</span>
                               <span className="text-sm font-black text-emerald-600">{detail.netWeight} kg</span>
                            </div>

                            {/* Summa qutisi */}
                            <div className="bg-blue-50/50 px-4 py-2.5 rounded-xl border border-blue-100 min-w-[150px] text-right w-full xl:w-auto mt-2 xl:mt-0 flex justify-between xl:block items-center">
                              <span className="block text-[10px] font-extrabold text-blue-400/80 uppercase tracking-wider xl:mb-0.5">Kvitansiya summasi</span>
                              <span className="text-base font-black text-blue-600 leading-none">{detail.totalAmount?.toLocaleString()} UZS</span>
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
    <div className={`p-5 rounded-2xl border ${bg} ${border} flex items-center gap-4 transition-transform hover:-translate-y-0.5 duration-200`}>
      <div className={`p-3.5 rounded-xl bg-white/80 ${color} shadow-sm backdrop-blur-sm`}>
        <Icon size={24} strokeWidth={2.5} />
      </div>
      <div>
        <h3 className="text-[11px] font-black uppercase tracking-widest text-gray-500/80 mb-1">{title}</h3>
        <p className={`text-xl sm:text-2xl font-black ${color}`}>{value}</p>
      </div>
    </div>
  );
}