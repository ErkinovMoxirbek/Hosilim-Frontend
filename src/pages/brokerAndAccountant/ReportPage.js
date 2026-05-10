import React, { useState, useEffect } from 'react';
import { 
  Calendar, Search, ChevronDown, ChevronUp, 
  Scale, Banknote, Box, Loader2, FileText, Clock, Filter, UserCircle
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
        const res = await reportService.getReportsGrouped(startDate, endDate, search, 0, 50);
        setGroupedData(res.content || []);
      } catch (error) {
        console.error("Ma'lumotlarni yuklashda xato:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const timer = setTimeout(() => {
      fetchGroupedData();
    }, 500);

    return () => clearTimeout(timer);
  }, [startDate, endDate, search]);

  // ─── Accordion ochish/yopish ─────────────────────────
  const toggleRow = async (farmerId) => {
    if (expandedId === farmerId) {
      setExpandedId(null);
      setDetails([]);
      return;
    }

    setExpandedId(farmerId);
    setIsDetailsLoading(true);
    try {
      const res = await reportService.getReportsDetails(farmerId, startDate, endDate);
      setDetails(res);
    } catch (error) {
      console.error("Batafsil ma'lumotni yuklashda xato:", error);
      setDetails([]);
    } finally {
      setIsDetailsLoading(false);
    }
  };

  const formatDateTime = (isoString) => {
    if (!isoString) return '';
    const d = new Date(isoString);
    return d.toLocaleString('uz-UZ', { 
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit' 
    });
  };

  // ─── Svodka hisob-kitoblari ─────────────────────────────────────
  const totalSummary = groupedData.reduce((acc, curr) => ({
    weight: acc.weight + (curr.totalNetWeight || 0),
    amount: acc.amount + (curr.totalAmount || 0),
    baskets: acc.baskets + (curr.totalBaskets || 0),
  }), { weight: 0, amount: 0, baskets: 0 });

  const isDaily = startDate === endDate;

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto pb-16 space-y-6 bg-gray-50/50 min-h-screen">
      
      {/* ─── Sarlavha va Filtrlar ─── */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col xl:flex-row gap-5 xl:justify-between xl:items-center">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#0B1A42] flex items-center gap-2">
            <FileText className="text-blue-500" size={28} />
            {isDaily ? "Kunlik Hisobot" : "Oraliq Hisobot"}
          </h1>
          <p className="text-sm text-gray-500 mt-1 font-medium ml-9">
            {isDaily ? "Bugungi qabul qilingan hosil statistikasi" : "Tanlangan davr oralig'idagi statistika"}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto">
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
              min={startDate}
              onChange={(e) => { setEndDate(e.target.value); setExpandedId(null); }}
              className="bg-transparent border-none outline-none font-bold text-gray-700 text-sm px-3 py-2 w-full cursor-pointer"
            />
          </div>

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

      {/* ─── Asosiy Dashboard ─── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SummaryCard icon={Scale} title="Jami Sof Vazn" value={`${totalSummary.weight.toFixed(1)} kg`} color="text-emerald-600" bg="bg-emerald-50" border="border-emerald-100" />
        <SummaryCard icon={Banknote} title="Jami Summa" value={`${totalSummary.amount.toLocaleString()} UZS`} color="text-blue-600" bg="bg-blue-50" border="border-blue-100" />
        <SummaryCard icon={Box} title="Qabul qilingan Savatlar" value={`${totalSummary.baskets} ta`} color="text-orange-600" bg="bg-orange-50" border="border-orange-100" />
      </div>

      {/* ─── Jadval Qismi (Yangilangan Dizayn) ─── */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-200 text-gray-500 text-[11px] font-bold uppercase tracking-wider">
                <th className="p-4 pl-6 w-10"></th>
                <th className="p-4">Fermer</th>
                <th className="p-4">Jami Netto Vazn</th>
                <th className="p-4">Jami Summa</th>
                <th className="p-4 text-center">Ishlatilgan Savatlar</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="5" className="p-16 text-center text-gray-400">
                    <Loader2 className="animate-spin mx-auto mb-3 text-blue-500" size={36} />
                    <p className="font-medium text-sm">Ma'lumotlar yuklanmoqda...</p>
                  </td>
                </tr>
              ) : groupedData.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-16 text-center text-gray-400">
                    <div className="flex flex-col items-center">
                      <Filter size={48} className="mb-3 text-gray-300" />
                      <p className="font-medium text-sm">Hech qanday ma'lumot topilmadi.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                groupedData.map((farmer) => {
                  const isOpen = expandedId === farmer.farmerId;

                  return (
                    <React.Fragment key={farmer.farmerId}>
                      <tr
                        onClick={() => toggleRow(farmer.farmerId)}
                        className={`border-b cursor-pointer transition-colors ${isOpen ? 'bg-blue-50/40 border-blue-100' : 'border-gray-100 hover:bg-gray-50'}`}
                      >
                        <td className="p-4 pl-6">
                          <button className={`p-1.5 rounded-md transition-colors ${isOpen ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'}`}>
                            {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </button>
                        </td>
                        <td className="p-4">
                          <div className="font-bold text-[#0B1A42] text-[15px]">{farmer.farmerFullName}</div>
                          <div className="text-xs text-gray-500 mt-0.5">{farmer.farmerPhone}</div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Scale size={16} className="text-emerald-600" />
                            <span className="text-lg font-black text-emerald-600">
                              {farmer.totalNetWeight?.toFixed(1)} <span className="text-xs text-gray-400 font-bold">kg</span>
                            </span>
                          </div>
                          <div className="text-[10px] font-bold text-gray-400 uppercase mt-0.5">Topshiriqlar mavjud</div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-1.5">
                            <div className="p-1 bg-blue-50 text-blue-600 rounded">
                              <Banknote size={14} />
                            </div>
                            <span className="font-black text-[#0B1A42] text-[16px]">
                              {farmer.totalAmount?.toLocaleString()} <span className="text-sm">UZS</span>
                            </span>
                          </div>
                        </td>
                        <td className="p-4 text-center">
                          <div className="inline-flex flex-col items-center">
                            <span className="text-[12px] font-extrabold bg-gray-100 text-gray-600 px-2.5 py-1 rounded-md">
                              {farmer.totalBaskets?.toLocaleString()} ta
                            </span>
                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1">Savat</span>
                          </div>
                        </td>
                      </tr>

                      {isOpen && (
                        <tr className="bg-gray-50/50 border-b border-gray-200">
                          <td colSpan="5" className="p-0">
                            <div className="p-4 pl-16 pr-6 py-5">
                              <div className="bg-white border border-blue-100 rounded-xl overflow-hidden shadow-sm">
                                {isDetailsLoading ? (
                                  <div className="p-8 text-center text-gray-400">
                                    <Loader2 className="animate-spin mx-auto mb-2 text-blue-500" size={24} />
                                    <p className="text-xs font-medium">Tranzaksiyalar yuklanmoqda...</p>
                                  </div>
                                ) : (
                                  <table className="w-full text-left border-collapse">
                                    <thead>
                                      <tr className="bg-blue-50/50 text-blue-800 text-[10px] font-bold uppercase tracking-wider border-b border-blue-100">
                                        <th className="p-3 pl-4">Sana</th>
                                        <th className="p-3">Meva Turi</th>
                                        <th className="p-3">Netto (Sof vazn)</th>
                                        <th className="p-3">Summa</th>
                                        <th className="p-3">Savat Turi</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {details.length === 0 ? (
                                        <tr>
                                          <td colSpan="5" className="p-6 text-center text-xs text-gray-400">Ma'lumot topilmadi</td>
                                        </tr>
                                      ) : (
                                        details.map((item, idx) => (
                                          <tr key={item.id || idx} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                                            <td className="p-3 pl-4 text-xs text-gray-500 font-medium">{formatDateTime(item.createdAt)}</td>
                                            <td className="p-3">
                                              <div className="flex items-center gap-2">
                                                <FileText size={14} className="text-orange-500" />
                                                <div>
                                                  <div className="font-semibold text-gray-800 text-xs">{item.fruitName}</div>
                                                  <div className="text-[10px] font-bold text-gray-400 mt-0.5">
                                                    {item.unitPrice?.toLocaleString()} so'm/kg
                                                  </div>
                                                </div>
                                              </div>
                                            </td>
                                            <td className="p-3">
                                              <span className="font-bold text-emerald-600 text-sm">{item.netWeight} kg</span>
                                            </td>
                                            <td className="p-3 font-bold text-[#0B1A42] text-sm">
                                              {item.totalAmount?.toLocaleString()} <span className="text-[10px] text-gray-400">UZS</span>
                                            </td>
                                            <td className="p-3">
                                              {item.basketCount > 0 ? (
                                                <div className="flex items-center gap-1.5 text-xs">
                                                  <span className="font-bold text-gray-600">{item.basketCount}x</span>
                                                  <span className="text-gray-400 truncate max-w-[120px]">{item.basketName}</span>
                                                </div>
                                              ) : (
                                                <span className="text-gray-300">-</span>
                                              )}
                                            </td>
                                          </tr>
                                        ))
                                      )}
                                    </tbody>
                                  </table>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

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