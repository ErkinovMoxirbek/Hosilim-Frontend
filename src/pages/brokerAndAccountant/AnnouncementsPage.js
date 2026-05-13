import React, { useEffect, useState } from "react";
import {
  Bell,
  Info,
  AlertTriangle,
  AlertCircle,
  X,
  ArrowUp,
} from "lucide-react";
import { toast } from "react-hot-toast";
import classNames from "classnames";
import { announcementService } from "../../services/announcementService";

/* ──────────────────────────────────────────────────────────────────────
   1️⃣  Announcement turi konfiguratsiyasi (rang, ikonka, label)
   ────────────────────────────────────────────────────────────────────── */
const TYPE = {
  INFO: "INFO",
  WARNING: "WARNING",
  URGENT: "URGENT",
};

const typeConfig = {
  INFO: {
    label: "Ma'lumot",
    border: "border-indigo-500",
    bg: "bg-indigo-50",
    text: "text-indigo-700",
    icon: Info,
  },
  WARNING: {
    label: "Ogohlantirish",
    border: "border-amber-500",
    bg: "bg-amber-50",
    text: "text-amber-700",
    icon: AlertTriangle,
  },
  URGENT: {
    label: "O'ta muhim",
    border: "border-red-500",
    bg: "bg-red-50",
    text: "text-red-700",
    icon: AlertCircle,
  },
};

/* ──────────────────────────────────────────────────────────────────────
   2️⃣  Header (gradient‑siz, sof)
   ────────────────────────────────────────────────────────────────────── */
function Header() {
  return (
    <header className="flex items-center gap-4 p-5 bg-white rounded-xl shadow-sm mb-8">
      <div className="p-3 bg-indigo-50 rounded-lg">
        <Bell size={24} className="text-indigo-600" />
      </div>
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">
          Tizim E'lonlari
        </h1>
        <p className="text-sm text-gray-500">
          So‘nggi yangiliklar, o‘zgarishlar va ogohlantirishlar
        </p>
      </div>
    </header>
  );
}

/* ──────────────────────────────────────────────────────────────────────
   3️⃣  FilterBar – chip‑lar
   ────────────────────────────────────────────────────────────────────── */
const FILTER_OPTIONS = [
  { key: "ALL", label: "Barchasi" },
  { key: TYPE.INFO, label: "Ma'lumot" },
  { key: TYPE.WARNING, label: "Ogohlantirish" },
  { key: TYPE.URGENT, label: "O'ta muhim" },
];

function FilterBar({ active, onChange }) {
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {FILTER_OPTIONS.map((opt) => (
        <button
          key={opt.key}
          onClick={() => onChange(opt.key)}
          className={classNames(
            "px-4 py-1.5 rounded-full text-sm font-medium transition-all",
            active === opt.key
              ? "bg-indigo-600 text-white shadow-md"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────
   4️⃣  Skeleton Card (yuklanishda)
   ────────────────────────────────────────────────────────────────────── */
function SkeletonCard() {
  return (
    <div className="flex gap-4 p-5 bg-white rounded-xl shadow animate-pulse">
      <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
      <div className="flex-1 space-y-2 py-1">
        <div className="h-4 w-1/3 bg-gray-200 rounded"></div>
        <div className="h-3 w-2/3 bg-gray-200 rounded"></div>
        <div className="h-3 w-full bg-gray-200 rounded"></div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────
   5️⃣  EmptyState (e'lon yo'q)
   ────────────────────────────────────────────────────────────────────── */
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 bg-white rounded-xl shadow">
      <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
        <Bell size={32} className="text-indigo-500" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-1">
        Hozircha e'lonlar yo'q
      </h3>
      <p className="text-gray-500 text-center max-w-sm">
        Administrator tomonidan yuborilgan xabarlar shu yerda ko‘rinadi.
      </p>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────
   6️⃣  Announcement Card
   ────────────────────────────────────────────────────────────────────── */
function AnnouncementCard({ data, onDismiss }) {
  const { id, type, title, message, createdAt } = data;
  const cfg = typeConfig[type] ?? typeConfig[TYPE.INFO];
  const Icon = cfg.icon;

  return (
    <div
      className={classNames(
        "flex gap-4 p-5 bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow",
        cfg.border
      )}
    >
      {/* Left border + Icon */}
      <div className={classNames("flex-shrink-0 flex items-center", cfg.bg)}>
        <div className="p-2 rounded-md">
          <Icon className={cfg.text} size={24} />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* label + date */}
        <div className="flex items-center gap-3 mb-2 flex-wrap">
          <span
            className={classNames(
              "text-xs font-medium px-2.5 py-0.5 rounded-full",
              cfg.bg,
              cfg.text
            )}
          >
            {cfg.label}
          </span>
          <time
            className="text-xs text-gray-500"
            dateTime={createdAt}
          >
            {new Date(createdAt).toLocaleString("uz-UZ", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </time>
        </div>

        {/* title */}
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>

        {/* body */}
        <p className="mt-2 text-gray-700 whitespace-pre-line leading-relaxed">
          {message}
        </p>
      </div>

      {/* Dismiss button */}
      <button
        onClick={() => onDismiss(id)}
        className="self-start text-gray-300 hover:text-gray-500 transition-colors"
        aria-label="E'lonni yopish"
      >
        <X size={20} />
      </button>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────
   7️⃣  Scroll‑to‑Top “cho‘qiga chiqish” tugmasi
   ────────────────────────────────────────────────────────────────────── */
function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const toggle = () => setVisible(window.scrollY > 300);
    window.addEventListener("scroll", toggle);
    return () => window.removeEventListener("scroll", toggle);
  }, []);

  if (!visible) return null;
  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed bottom-6 right-6 w-12 h-12 flex items-center justify-center bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 transition-colors transform hover:-translate-y-1"
      aria-label="Yuqoriga"
    >
      <ArrowUp size={20} />
    </button>
  );
}

/* ──────────────────────────────────────────────────────────────────────
   8️⃣  Asosiy sahifa
   ────────────────────────────────────────────────────────────────────── */
export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");

  /*** API‑dan e'lonlarni olish ***/
  const load = async () => {
    try {
      setLoading(true);
      const resp = await announcementService.getActiveAnnouncements();
      // Moslab: response?.data?.data yoki (array)ni o‘qing
      setAnnouncements(resp?.data?.data ?? []);
    } catch (e) {
      console.error(e);
      toast.error("E'lonlarni olishda xatolik");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // Filter qo‘llash
  const list = announcements.filter((a) => {
    if (filter === "ALL") return true;
    return a.type === filter;
  });

  // Dismiss (yopish) – real API‑ga DELETE qo‘ng‘iroqni qo‘shish mumkin
  const handleDismiss = (id) => {
    setAnnouncements((prev) => prev.filter((a) => a.id !== id));
    toast.success("E'lon yopildi");
  };

  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4 sm:px-8">
      {/* Header */}
      <Header />

      {/* Filter */}
      <FilterBar active={filter} onChange={setFilter} />

      {/* Body */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : list.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-4">
          {list.map((ann) => (
            <AnnouncementCard
              key={ann.id}
              data={ann}
              onDismiss={handleDismiss}
            />
          ))}
        </div>
      )}

      {/* Scroll‑to‑top button */}
      <ScrollToTop />
    </main>
  );
}
