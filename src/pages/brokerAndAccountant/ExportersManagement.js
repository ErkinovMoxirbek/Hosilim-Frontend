import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  memo,
  Fragment,
} from "react";
import {
  Search,
  Calendar,
  Download,
  ChevronDown,
  ChevronUp,
  Scale,
  Package,
  Wallet,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";

import { exporterService } from "../../services/exporterService";

/* ────────────────────────  DEBOUNCE HOOK  ──────────────────────── */
function useDebounce(value, delay = 500) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

/* ────────────────────────  FORMATTERS  ──────────────────────── */
const fmtKg = (n) =>
  (n ?? 0).toLocaleString("uz-UZ", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const fmtCurrency = (n) => new Intl.NumberFormat("uz-UZ").format(n ?? 0);
const fmtDate = (d) => {
  if (!d) return "-";
  const date = new Date(d);
  return `${date.toLocaleDateString("uz-UZ", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })} ${date.toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" })}`;
};

/* ────────────────────────  FILTERS  ──────────────────────── */
const Filters = memo(
  ({
    startDate,
    endDate,
    onStartChange,
    onEndChange,
    onClearDate,
    search,
    onSearchChange,
    onExportCSV,
    isLoading,
  }) => (
    <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
      <h1 className="text-2xl sm:text-3xl font-black text-[#0B1A42] tracking-tight">
        Oraliq Hisobot
      </h1>

      <div className="flex flex-wrap items-center gap-3">
        {/* Date range */}
        <div className="flex items-center bg-white border border-gray-200 rounded-xl p-1 px-3 shadow-sm focus-within:border-blue-500 transition-colors">
          <Calendar size={16} className="text-gray-400" />
          <input
            type="date"
            value={startDate}
            onChange={onStartChange}
            className="bg-transparent border-none outline-none font-bold text-gray-700 text-sm px-2 py-2 cursor-pointer"
          />
          <span className="text-gray-300 mx-1">–</span>
          <input
            type="date"
            value={endDate}
            onChange={onEndChange}
            className="bg-transparent border-none outline-none font-bold text-gray-700 text-sm px-2 py-2 cursor-pointer"
          />
          {(startDate || endDate) && (
            <button
              onClick={onClearDate}
              className="ml-2 text-rose-500 text-xs font-bold hover:underline"
            >
              Tozalash
            </button>
          )}
        </div>

        {/* Search */}
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={16}
          />
          <input
            type="text"
            placeholder="Fermer F.I.O yoki raqami..."
            value={search}
            onChange={onSearchChange}
            className="pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl font-medium text-sm focus:outline-none focus:border-blue-500 shadow-sm w-full sm:w-[240px]"
          />
        </div>

        {/* Export */}
        <button
          onClick={onExportCSV}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-xl font-bold hover:bg-emerald-100 transition-colors disabled:opacity-50"
        >
          <Download size={18} /> Excel
        </button>
      </div>
    </div>
  )
);

/* ────────────────────────  KPI CARDS  ──────────────────────── */
const KPICard = memo(({ icon: Icon, bg, border, title, value, unit }) => (
  <div className={`bg-${bg}/50 border border-${border} rounded-2xl p-5 flex flex-col justify-center`}>
    <div className="flex items-center gap-3 mb-2">
      <div className={`w-8 h-8 rounded-full bg-${bg}-100 text-${bg}-600 flex items-center justify-center`}>
        <Icon size={16} />
      </div>
      <span className={`text-[10px] font-black uppercase tracking-wider text-${bg}-700`}>{title}</span>
    </div>
    <div className={`text-2xl font-black text-${bg}-700`}>
      {value} <span className="text-sm">{unit}</span>
    </div>

  </div>
));

const KPI = memo(({ data }) => {
  const totals = useMemo(() => {
    return data.reduce(
      (acc, cur) => {
        acc.weight += cur.periodNetWeight;
        acc.baskets += cur.periodBasketCount;
        acc.totalAmount += cur.periodTotalAmount;
        acc.paid += cur.totalPaid;
        acc.debt += cur.currentDebt;
        return acc;
      },
      { weight: 0, baskets: 0, totalAmount: 0, paid: 0, debt: 0 }
    );
  }, [data]);

  const cards = [
    {
      bg: "emerald",
      border: "emerald",
      title: "Sof Vazn",
      value: fmtKg(totals.weight),
      unit: "kg",
      icon: Scale,
    },
    {
      bg: "orange",
      border: "orange",
      title: "Savatlar Soni",
      value: totals.baskets,
      unit: "ta",
      icon: Package,
    },
    {
      bg: "blue",
      border: "blue",
      title: "Jami Summa",
      value: fmtCurrency(totals.totalAmount),
      unit: "UZS",
      icon: Wallet,
    },
    {
      bg: "teal",
      border: "teal",
      title: "To'langan",
      value: fmtCurrency(totals.paid),
      unit: "UZS",
      icon: CheckCircle,
    },
    {
      bg: "rose",
      border: "rose",
      title: "Qoldiq (Qarz)",
      value: fmtCurrency(totals.debt),
      unit: "UZS",
      icon: AlertCircle,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {cards.map((c) => (
        <KPICard key={c.title} {...c} />
      ))}
    </div>
  );
});

/* ────────────────────────  TRANSACTIONS TABLE  ──────────────────────── */
const TransactionsTable = memo(({ txs }) => (
  <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
    <table className="w-full text-left">
      <thead className="bg-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-wider">
        <tr>
          <th className="px-4 py-2.5">Sana</th>
          <th className="px-4 py-2.5">Meva Turi</th>
          <th className="px-4 py-2.5">Hajmi (Savat / Kg)</th>
          <th className="px-4 py-2.5 text-right">Narx</th>
          <th className="px-4 py-2.5 text-right">Summa</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100">
        {txs.map((tx) => (
          <tr key={tx.transactionId} className="hover:bg-slate-50">
            <td className="px-4 py-3 text-xs font-bold text-gray-500">{fmtDate(tx.date)}</td>
            <td className="px-4 py-3 text-sm font-bold text-slate-800">{tx.fruitName}</td>
            <td className="px-4 py-3 text-xs font-bold text-gray-600">
              <span className="bg-gray-100 border border-gray-200 px-1.5 py-0.5 rounded mr-2">
                {tx.basketCount} ta
              </span>
              <span className="text-emerald-600">{fmtKg(tx.netWeight)} kg</span>
            </td>
            <td className="px-4 py-3 text-right text-xs font-bold text-gray-500">
              <span className="font-mono">{fmtCurrency(tx.pricePerKg)}</span> so'm
            </td>
            <td className="px-4 py-3 text-right text-sm font-black text-blue-600">
              <span className="font-mono">{fmtCurrency(tx.totalAmount)}</span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
));

/* ────────────────────────  EXPORTER ROW  ──────────────────────── */
const ExporterRow = memo(
  ({
    exporter,
    isExpanded,
    onToggle,
    txs,
    txLoading,
    txError,
  }) => {
    const {
      exporterId,
      fullName,
      phoneNumber,
      periodNetWeight,
      periodBasketCount,
      periodTotalAmount,
      totalPaid,
      currentDebt,
    } = exporter;

    return (
      <>
        {/* Main row */}
        <tr
          className="hover:bg-gray-50 transition-colors group cursor-pointer"
          onClick={() => onToggle(exporterId)}
        >
          <td className="p-4 text-center">
            <button className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center text-gray-500 transition-colors">
              {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
          </td>

          <td className="p-4">
            <div className="font-extrabold text-[#0B1A42] text-[15px]">{fullName}</div>
            <div className="text-xs text-gray-400 font-bold tracking-wide mt-0.5">{phoneNumber}</div>
          </td>

          <td className="p-4">
            <span className="font-mono font-black text-emerald-600 text-[15px]">
              {fmtKg(periodNetWeight)} <span className="text-xs text-emerald-600/70">kg</span>
            </span>
          </td>

          <td className="p-4">
            <span className="font-mono font-bold text-gray-600 bg-gray-100 px-2 py-1 rounded-lg border border-gray-200">
              {periodBasketCount} ta
            </span>
          </td>

          <td className="p-4">
            <span className="font-mono font-black text-[#0B1A42] text-[15px]">
              {fmtCurrency(periodTotalAmount)} <span className="text-[10px] text-gray-400">UZS</span>
            </span>
          </td>

          <td className="p-4">
            <span className="font-mono font-black text-teal-600 text-[15px]">
              {fmtCurrency(totalPaid)} <span className="text-[10px] text-teal-600/70">UZS</span>
            </span>
          </td>

          <td className="p-4 text-right pr-6">
            <span className="font-mono font-black text-rose-600 text-[15px]">
              {fmtCurrency(currentDebt)} <span className="text-[10px] text-rose-600/70">UZS</span>
            </span>
          </td>
        </tr>

        {/* Expanded area – lazy loaded transactions */}
        {isExpanded && (
          <tr className="bg-slate-50/80 border-b-2 border-slate-200">
            <td colSpan="7" className="p-0">
              <div className="px-4 sm:px-16 py-4">
                {txLoading ? (
                  <div className="flex items-center justify-center py-6 text-gray-500">
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />{" "}
                    <span className="text-sm font-bold">Yuklar tortilmoqda...</span>
                  </div>
                ) : txError ? (
                  <div className="text-center py-6 text-sm text-rose-600 font-bold">
                    {txError}
                  </div>
                ) : txs && txs.length > 0 ? (
                  <TransactionsTable txs={txs} />
                ) : (
                  <div className="text-center py-6 text-sm font-bold text-gray-400 border border-dashed border-gray-300 rounded-xl bg-white">
                    Ushbu oraliqda yuk yuborilmagan
                  </div>
                )}
              </div>
            </td>
          </tr>
        )}
      </>
    );
  },
  (prev, next) => {
    // Prevent re‑render unless relevant props change
    const sameId = prev.exporter.exporterId === next.exporter.exporterId;
    const sameExpand = prev.isExpanded === next.isExpanded;
    const sameTx =
      prev.txs === next.txs && prev.txLoading === next.txLoading && prev.txError === next.txError;
    return sameId && sameExpand && sameTx;
  }
);

/* ────────────────────────  MAIN COMPONENT  ──────────────────────── */
export default function ExportersManagement() {
  // ----------------------------------------------------------------------
  // FILTER STATE
  // ----------------------------------------------------------------------
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [search, setSearch] = useState("");

  // ----------------------------------------------------------------------
  // DATA STATE
  // ----------------------------------------------------------------------
  const [report, setReport] = useState([]);
  const [isReportLoading, setIsReportLoading] = useState(true);
  const [expandedRows, setExpandedRows] = useState({}); // { exporterId: true/false }
  const [txCache, setTxCache] = useState({}); // { exporterId: [...transactions] }
  const [txLoading, setTxLoading] = useState({}); // { exporterId: true/false }
  const [txError, setTxError] = useState({}); // { exporterId: "Error message" }

  // ----------------------------------------------------------------------
  // DEBOUNCE SEARCH
  // ----------------------------------------------------------------------
  const debouncedSearch = useDebounce(search);
  const debouncedStart = useDebounce(startDate);
  const debouncedEnd = useDebounce(endDate);

  // ----------------------------------------------------------------------
  // FETCH REPORT – runs when any filter changes (debounced)
  // ----------------------------------------------------------------------
  const fetchReport = useCallback(async () => {
    setIsReportLoading(true);
    try {
      const params = {};
      if (debouncedStart) params.startDate = debouncedStart;
      if (debouncedEnd) params.endDate = debouncedEnd;
      if (debouncedSearch) params.search = debouncedSearch;

      const data = await exporterService.getExportersReport(params);
      setReport(data);

      // Reset expanded UI + transaction cache (report changed)
      setExpandedRows({});
      setTxCache({});
      setTxLoading({});
      setTxError({});
    } catch (e) {
      console.error("Report fetch error:", e);
    } finally {
      setIsReportLoading(false);
    }
  }, [debouncedStart, debouncedEnd, debouncedSearch]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  // ----------------------------------------------------------------------
  // TOGGLE ROW – lazy load transactions on first expand
  // ----------------------------------------------------------------------
  const toggleRow = useCallback(
    async (exporterId) => {
      const willExpand = !expandedRows[exporterId];
      setExpandedRows((prev) => ({ ...prev, [exporterId]: willExpand }));

      // If we are expanding and we don’t have the data yet → fetch
      if (willExpand && !txCache[exporterId]) {
        setTxLoading((prev) => ({ ...prev, [exporterId]: true }));
        try {
          const params = {};
          if (debouncedStart) params.startDate = debouncedStart;
          if (debouncedEnd) params.endDate = debouncedEnd;

          const txs = await exporterService.getExporterTransactions(
            exporterId,
            params
          );
          setTxCache((prev) => ({ ...prev, [exporterId]: txs }));
          setTxError((prev) => ({ ...prev, [exporterId]: null }));
        } catch (e) {
          console.error(`Tx fetch error for ${exporterId}:`, e);
          setTxError((prev) => ({
            ...prev,
            [exporterId]: "Tranzaktsiyalarni yuklashda xatolik",
          }));
        } finally {
          setTxLoading((prev) => ({ ...prev, [exporterId]: false }));
        }
      }
    },
    [expandedRows, debouncedStart, debouncedEnd, txCache]
  );

  // ----------------------------------------------------------------------
  // EXCEL EXPORT (Backend orqali yuklash)
  // ----------------------------------------------------------------------
  const exportToExcel = async () => {
    try {
      setIsReportLoading(true);
      const params = {};
      if (debouncedStart) params.startDate = debouncedStart;
      if (debouncedEnd) params.endDate = debouncedEnd;
      if (debouncedSearch) params.search = debouncedSearch;

      const blobData = await exporterService.downloadExcelReport(params);

      // Blobni brauzerda yuklab olamiz
      const url = window.URL.createObjectURL(new Blob([blobData]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Eksport_Hisobot_${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);

    } catch (e) {
      alert("Excel yuklashda xatolik yuz berdi: " + e.message);
    } finally {
      setIsReportLoading(false);
    }
  };

  // ----------------------------------------------------------------------
  // RENDER
  // ----------------------------------------------------------------------
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto min-h-screen bg-[#F8FAFC] space-y-6">
      {/* filters */}
      <Filters
        startDate={startDate}
        endDate={endDate}
        onStartChange={(e) => setStartDate(e.target.value)}
        onEndChange={(e) => setEndDate(e.target.value)}
        onClearDate={() => {
          setStartDate("");
          setEndDate("");
        }}
        search={search}
        onSearchChange={(e) => setSearch(e.target.value)}
        onExportCSV={exportToExcel}
        isLoading={isReportLoading}
      />

      {/* KPI cards */}
      <KPI data={report} />

      {/* main table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 text-[11px] font-black uppercase tracking-wider">
                <th className="p-4 w-12 text-center"></th>
                <th className="p-4">Hamkor (Eksportyor)</th>
                <th className="p-4">Oraliqdagi Sof Vazn</th>
                <th className="p-4">Savatlar</th>
                <th className="p-4">Oraliqdagi Summa</th>
                <th className="p-4">To'langan</th>
                <th className="p-4 text-right pr-6">Qarz (Qoldiq)</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {/* Loading state */}
              {isReportLoading ? (
                <tr>
                  <td colSpan="7" className="p-16 text-center text-gray-400">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-3" />
                    <p className="font-bold text-sm">Hisobot tayyorlanmoqda...</p>
                  </td>
                </tr>
              ) : report.length === 0 ? (
                // No data
                <tr>
                  <td colSpan="7" className="p-16 text-center text-gray-400 font-bold">
                    Ma'lumot topilmadi
                  </td>
                </tr>
              ) : (
                // Real rows
                report.map((exp) => (
                  <ExporterRow
                    key={exp.exporterId}
                    exporter={exp}
                    isExpanded={!!expandedRows[exp.exporterId]}
                    onToggle={toggleRow}
                    txs={txCache[exp.exporterId]}
                    txLoading={!!txLoading[exp.exporterId]}
                    txError={txError[exp.exporterId]}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
