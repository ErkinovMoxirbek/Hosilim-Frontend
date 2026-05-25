/* ─────────────────────────────────────────────────────────────────────────────
   ExportHistoryPage.jsx
   – Barcha yordamchi funksiyalar, komponentlar va hook’lar bitta faylda
   – Tailwind CSS + lucide‑react ikonkalaridan foydalanadi
   – UI optimallashtirildi (memo, debouncing, loading‑spinners, acces‑iblity)
   ────────────────────────────────────────────────────────────────────────── */

import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
} from "react";

import {
  Briefcase,
  DollarSign,
  Undo2,
  Filter,
  ChevronLeft,
  ChevronRight,
  PackageCheck,
  AlertCircle,
  Loader2
} from "lucide-react";

import { stockService } from "../../services/stockService";

/* ──────────────────────  UTILS & FORMATTERS ────────────────────── */
const fmtKg = (n) =>
  (n ?? 0).toLocaleString("uz-UZ", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
const fmtSum = (n) => (n ?? 0).toLocaleString("uz-UZ");
const fmtDate = (s) => {
  if (!s) return "-";
  const d = new Date(s);
  return `${d.toLocaleTimeString("uz-UZ", {
    hour: "2-digit",
    minute: "2-digit",
  })}, ${d.toLocaleDateString("uz-UZ", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })}`;
};

/* ──────────────────────  CUSTOM HOOK: API LOGIC ────────────────────── */
function useExportHistory({ pageSize }) {
  const [history, setHistory] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [revertingId, setRevertingId] = useState(null);

  const fetchHistory = useCallback(
    async (p = page) => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await stockService.getExportHistory(p, pageSize);
        setHistory(data?.content ?? []);
        setTotalPages(data?.totalPages ?? 1);
      } catch (e) {
        console.error(e);
        setError(e?.message ?? "Ma'lumotni yuklashda xatolik");
      } finally {
        setIsLoading(false);
      }
    },
    [pageSize, page]
  );

  // har safar page o'zgarganda yangilanadi
  useEffect(() => {
    fetchHistory(page);
  }, [fetchHistory, page]);

  const refresh = useCallback(() => fetchHistory(page), [fetchHistory, page]);

  const revertExport = useCallback(async (transactionId) => {
    setRevertingId(transactionId);
    try {
      await stockService.revertExport(transactionId);
      // optimistik yangilash – statusni o‘zgartiramiz
      setHistory((prev) =>
        prev.map((it) =>
          it.transactionId === transactionId
            ? { ...it, status: "REVERTED" }
            : it
        )
      );
    } catch (e) {
      console.error(e);
      window.alert(e?.message ?? "Otmena qilishda xatolik");
    } finally {
      setRevertingId(null);
    }
  }, []);

  return {
    history,
    page,
    setPage,
    totalPages,
    isLoading,
    error,
    refresh,
    revertExport,
    revertingId,
  };
}

/* ──────────────────────  UI‑KOMPONENTLAR ────────────────────── */

/* Header – title, subtitle, refresh button */
const Header = React.memo(({ onRefresh, isLoading }) => (
  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
    <div>
      <h1 className="text-2xl sm:text-3xl font-black text-slate-800 flex items-center gap-3">
        <div className="p-3 bg-white shadow-sm text-indigo-600 rounded-2xl border border-indigo-100">
          <PackageCheck size={26} />
        </div>
        Eksport Tarixi
      </h1>
      <p className="text-sm text-slate-500 mt-2 ml-[60px] font-medium">
        Hamkorlarga sotilgan va jo‘natilgan barcha yuklar ro‘yxati
      </p>
    </div>

    <button
      onClick={onRefresh}
      disabled={isLoading}
      className="px-4 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 shadow-sm transition-colors disabled:opacity-50"
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          Yangilanmoqda…
        </span>
      ) : (
        "Yangilash"
      )}
    </button>
  </div>
));

/* Global error banner */
const ErrorAlert = React.memo(({ message }) => (
  <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 text-sm font-bold flex items-center shadow-sm">
    <AlertCircle size={18} className="mr-2" />
    {message}
  </div>
));

/* KPI‑card */
const SummaryCard = React.memo(({ icon: Icon, bg, title, value, unit }) => (
  <div
    className={`bg-gradient-to-br from-${bg}-500 to-${bg}-600 rounded-2xl p-5 shadow-${bg}-200 shadow-lg text-white relative overflow-hidden`}
  >
    <div className="absolute top-0 right-0 -mr-4 -mt-4 opacity-20">
      <Icon size={100} />
    </div>
    <h3 className={`text-${bg}-100 font-bold uppercase tracking-wider text-xs mb-1`}>
      {title}
    </h3>
    <div className="flex items-end gap-1">
      <span className="text-3xl font-black">{value}</span>
      <span className="text-sm font-semibold text-{bg}-200 mb-1">{unit}</span>
    </div>
  </div>
));

/* Kujagi – har bir satr (sarlavhalar, tugmalar ham) */
const ExportRow = React.memo(
  ({ item, onRevert, isReverting }) => {
    const isReverted = item.status === "REVERTED";

    return (
      <tr
        className={`hover:bg-slate-50 transition-colors group ${
          isReverted ? "bg-red-50/50 opacity-60" : ""
        }`}
      >
        {/* Sana */}
        <td className="p-4 pl-6">
          <span className="text-xs font-bold text-slate-500">{fmtDate(item.date)}</span>
        </td>

        {/* Exporter + comment */}
        <td className="p-4">
          <div className="flex items-center gap-2 mb-1">
            <Briefcase size={14} className="text-indigo-500" />
            <span className="font-black text-slate-800 text-sm">{item.exporterName}</span>
          </div>
          <div
            className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded inline-block truncate max-w-[200px]"
            title={item.comment}
          >
            {item.comment}
          </div>
        </td>

        {/* Meva & hajm */}
        <td className="p-4">
          <div className="text-sm font-extrabold text-slate-800 mb-1">{item.fruitName}</div>
          <div className="text-xs font-bold text-slate-500">
            <span className="text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
              {item.basketCount} ta savat
            </span>
            <span className="mx-2">•</span>
            <span className="text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
              {fmtKg(item.netWeight)} kg
            </span>
          </div>
        </td>

        {/* Narx / Summa */}
        <td className="p-4 text-right">
          <div className="text-xs font-bold text-slate-500 mb-1">
            <span className="font-mono">{fmtSum(item.pricePerKg)}</span> so'm/kg
          </div>
          <div
            className={`text-base font-black ${
              isReverted ? "text-slate-400 line-through" : "text-emerald-600"
            }`}
          >
            {fmtSum(item.totalAmount)} so'm
          </div>
        </td>

        {/* Status */}
        <td className="p-4 text-center">
          <span
            className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
              isReverted ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-700"
            }`}
          >
            {isReverted ? "Otmena qilingan" : "Muvaffaqiyatli"}
          </span>
        </td>

        {/* Amal */}
        <td className="p-4 text-center">
          {!isReverted ? (
            <button
              onClick={() => onRevert(item.transactionId)}
              disabled={isReverting}
              className={`p-2 text-rose-500 hover:bg-rose-100 rounded-xl transition-all ${
                isReverting ? "opacity-50 cursor-wait" : "opacity-0 group-hover:opacity-100"
              }`}
              aria-label="Eksportni bekor qilish (Otmena)"
              title="Eksportni bekor qilish (Otmena)"
            >
              {isReverting ? (
                <div className="animate-spin w-5 h-5 border-2 border-rose-500 border-t-transparent rounded-full mx-auto"></div>
              ) : (
                <Undo2 size={18} strokeWidth={2.5} />
              )}
            </button>
          ) : (
            <span className="text-slate-300 text-xs">-</span>
          )}
        </td>
      </tr>
    );
  },
  (prev, next) =>
    prev.item.transactionId === next.item.transactionId &&
    prev.isReverting === next.isReverting &&
    prev.item.status === next.item.status
);

/* Table body – loading / empty / real rows */
const ExportTableBody = ({
  history,
  isLoading,
  onRevert,
  revertingId,
}) => {
  if (isLoading) {
    return (
      <tbody>
        <tr>
          <td colSpan="6" className="p-16 text-center text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mx-auto mb-3" />
            <p className="font-bold text-sm">Tarix yuklanmoqda…</p>
          </td>
        </tr>
      </tbody>
    );
  }

  if (history.length === 0) {
    return (
      <tbody>
        <tr>
          <td colSpan="6" className="p-16 text-center text-slate-400">
            <Filter size={40} className="mx-auto mb-3 text-slate-300" />
            <p className="font-bold text-slate-500">Hech narsa topilmadi</p>
          </td>
        </tr>
      </tbody>
    );
  }

  return (
    <tbody className="divide-y divide-slate-100">
      {history.map((item) => (
        <ExportRow
          key={item.transactionId}
          item={item}
          onRevert={onRevert}
          isReverting={revertingId === item.transactionId}
        />
      ))}
    </tbody>
  );
};

/* Pagination bar */
const Pagination = ({
  page,
  totalPages,
  setPage,
  isLoading,
}) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50">
      <span className="text-xs font-bold text-slate-500">
        Sahifa {page + 1} / {totalPages}
      </span>
      <div className="flex gap-2">
        <button
          onClick={() => setPage((p) => Math.max(0, p - 1))}
          disabled={page === 0 || isLoading}
          className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-50 transition-colors"
          aria-label="Previous page"
        >
          <ChevronLeft size={16} />
        </button>
        <button
          onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
          disabled={page >= totalPages - 1 || isLoading}
          className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-50 transition-colors"
          aria-label="Next page"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

/* ──────────────────────  MAIN PAGE COMPONENT ────────────────────── */
export default function ExportHistoryPage() {
  const PAGE_SIZE = 15; // doimiy, o‘zgarmas

  // API + state boshqaruvi
  const {
    history,
    page,
    setPage,
    totalPages,
    isLoading,
    error,
    refresh,
    revertExport,
    revertingId,
  } = useExportHistory({ pageSize: PAGE_SIZE });

  // KPI summasi – memoised
  const summary = useMemo(() => {
    return history.reduce(
      (acc, cur) => {
        if (cur.status === "ACTIVE") {
          acc.totalWeight += cur.netWeight;
          acc.totalAmount += cur.totalAmount;
        }
        return acc;
      },
      { totalWeight: 0, totalAmount: 0 }
    );
  }, [history]);

  // “Bekor qilish” tugmasi bosilganda chaqiriladi
  const handleRevert = async (transactionId) => {
    const confirmed = window.confirm(
      "Rostdan ham ushbu eksportni bekor qilib, yukni zalga qaytarmoqchimisiz? (Summa eksportyor balansidan o‘chiriladi)"
    );
    if (!confirmed) return;
    await revertExport(transactionId);
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto pb-16 space-y-6 bg-[#F8FAFC] min-h-screen">
      {/* Header */}
      <Header onRefresh={refresh} isLoading={isLoading} />

      {/* Global error */}
      {error && <ErrorAlert message={error} />}

      {/* KPI cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <SummaryCard
          icon={Briefcase}
          bg="indigo"
          title="Sahifadagi Jami Yuk (Faol)"
          value={fmtKg(summary.totalWeight)}
          unit="kg"
        />
        <SummaryCard
          icon={DollarSign}
          bg="emerald"
          title="Sahifadagi Jami Summa (Faol)"
          value={fmtSum(summary.totalAmount)}
          unit="so'm"
        />
      </div>

      {/* Main table + pagination */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <caption className="sr-only">Export tarixi jadvali</caption>
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 text-[10px] font-black uppercase tracking-wider">
                <th className="p-4 pl-6 w-12">Sana</th>
                <th className="p-4">Eksportyor (Hamkor)</th>
                <th className="p-4">Meva & Hajm</th>
                <th className="p-4 text-right">Narx / Summa</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-center">Amal</th>
              </tr>
            </thead>

            <ExportTableBody
              history={history}
              isLoading={isLoading}
              onRevert={handleRevert}
              revertingId={revertingId}
            />
          </table>
        </div>

        <Pagination
          page={page}
          totalPages={totalPages}
          setPage={setPage}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
