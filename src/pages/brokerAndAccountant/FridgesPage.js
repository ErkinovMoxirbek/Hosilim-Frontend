import React, { useEffect, useState, useRef } from "react";
import {
  Search,
  Plus,
  MapPin,
  User,
  Phone,
  ThermometerSnowflake,
  ThermometerSun,
  Server,
  X,
  Loader2,
  AlertCircle,
  Trash2,
  Settings2,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

import { fridgeService } from "../../services/fridgeService";

/* -------------------------------------------------------------
   1️⃣ TOAST – ekranning tepasida ko‘rinadigan xabarnoma
   ------------------------------------------------------------- */
function ToastMessage({ message, type = "success", onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg border animate-in slide-in-from-top-4 fade-in duration-300 ${
        type === "error"
          ? "bg-red-50 text-red-700 border-red-200"
          : "bg-emerald-50 text-emerald-700 border-emerald-200"
      }`}
    >
      {type === "error" ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
      <span className="text-sm font-bold">{message}</span>
    </div>
  );
}

/* -------------------------------------------------------------
   2️⃣ DELETE CONFIRM MODAL
   ------------------------------------------------------------- */
function DeleteConfirmModal({
  isOpen,
  fridgeName,
  onCancel,
  onConfirm,
  isLoading,
}) {
  const dialogRef = useRef(null);

  // focus birinchi tugmaga
  useEffect(() => {
    if (isOpen) {
      const firstBtn = dialogRef.current?.querySelector("button");
      firstBtn?.focus();
    }
  }, [isOpen]);

  // Esc → yopish
  useEffect(() => {
    const escHandler = (e) => {
      if (e.key === "Escape" && isOpen && !isLoading) onCancel();
    };
    window.addEventListener("keydown", escHandler);
    return () => window.removeEventListener("keydown", escHandler);
  }, [isOpen, isLoading, onCancel]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={() => !isLoading && onCancel()}
      />
      <div
        ref={dialogRef}
        role="alertdialog"
        aria-modal="true"
        className="relative bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl animate-in zoom-in-95 duration-200"
      >
        <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mb-4">
          <AlertTriangle size={24} />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          O‘chirishni tasdiqlang
        </h3>
        <p className="text-gray-500 text-sm mb-6">
          Siz rostdan ham <span className="font-bold">{`"${fridgeName}"`}</span>{" "}
          xolodilnikini o‘chirayotganingizga ishonchingiz komilmi? Bu amalni
          ortga qaytarib bo‘lmaydi.
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            Bekor qilish
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 py-2.5 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {isLoading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              "O‘chir"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------
   3️⃣ ADD / EDIT DRAWER
   ------------------------------------------------------------- */
function AddFridgeDrawer({ isOpen, onClose, onSubmit, isSubmitting }) {
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    maxCapacity: "",
    temperatureCelsius: "",
    managerName: "",
    managerPhone: "",
  });
  const [errors, setErrors] = useState({});
  const firstInputRef = useRef(null);
  const drawerRef = useRef(null);

  // focus birinchi input, scroll‑ni bloklash
  useEffect(() => {
    if (isOpen) {
      firstInputRef.current?.focus();
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Esc → yopish
  useEffect(() => {
    const esc = (e) => {
      if (e.key === "Escape" && isOpen && !isSubmitting) onClose();
    };
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [isOpen, isSubmitting, onClose]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const validate = () => {
    const errs = {};

    if (!formData.name.trim()) errs.name = "Nom kiriting";
    if (!formData.address.trim()) errs.address = "Manzil kiriting";

    if (!formData.maxCapacity) {
      errs.maxCapacity = "Sig‘imni kiriting";
    } else if (Number(formData.maxCapacity) <= 0) {
      errs.maxCapacity = "Musbat son bo‘lishi kerak";
    }

    if (
      formData.managerPhone &&
      !/^\+?\d{9,15}$/.test(formData.managerPhone.replace(/\s+/g, ""))
    ) {
      errs.managerPhone = "Telefon raqam noto‘g‘ri formatda";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      name: formData.name.trim(),
      address: formData.address.trim(),
      maxCapacity: parseFloat(formData.maxCapacity),
      temperatureCelsius: formData.temperatureCelsius
        ? parseFloat(formData.temperatureCelsius)
        : undefined,
      managerName: formData.managerName?.trim() || undefined,
      managerPhone: formData.managerPhone?.trim() || undefined,
    };

    try {
      await onSubmit(payload);
      // muvaffaqiyatli saqlanganidan so‘ng forma tozalanadi
      setFormData({
        name: "",
        address: "",
        maxCapacity: "",
        temperatureCelsius: "",
        managerName: "",
        managerPhone: "",
      });
      setErrors({});
    } catch (err) {
      // onSubmit ichida toast chiqadi, shunchaki errorni qaytarmayapmiz
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* overlay */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={() => !isSubmitting && onClose()}
      />
      {/* drawer */}
      <aside
        ref={drawerRef}
        className="relative w-full max-w-md h-full bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300"
        aria-labelledby="drawer-title"
      >
        <header className="flex items-center justify-between p-5 border-b border-gray-100 bg-gray-50/50">
          <h2
            id="drawer-title"
            className="text-lg font-bold text-gray-900 font-['Syne',sans-serif]"
          >
            Yangi xolodilnik
          </h2>
          <button
            type="button"
            onClick={() => !isSubmitting && onClose()}
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
            aria-label="Yopish"
          >
            <X size={20} />
          </button>
        </header>

        <form
          className="flex-1 overflow-y-auto p-5 space-y-4"
          onSubmit={handleSubmit}
          noValidate
        >
          {/* Nomi */}
          <div className="space-y-1">
            <label
              htmlFor="name"
              className="block text-[11px] font-bold uppercase text-gray-500"
            >
              Nomlanishi *
            </label>
            <input
              id="name"
              ref={firstInputRef}
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Kamera #1"
              required
              className={`w-full p-2.5 bg-gray-50 border rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white ${
                errors.name ? "border-red-500" : ""
              }`}
            />
            {errors.name && (
              <p className="text-xs text-red-600">{errors.name}</p>
            )}
          </div>

          {/* Manzil */}
          <div className="space-y-1">
            <label
              htmlFor="address"
              className="block text-[11px] font-bold uppercase text-gray-500"
            >
              Manzil *
            </label>
            <input
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="To‘liq manzil"
              required
              className={`w-full p-2.5 bg-gray-50 border rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white ${
                errors.address ? "border-red-500" : ""
              }`}
            />
            {errors.address && (
              <p className="text-xs text-red-600">{errors.address}</p>
            )}
          </div>

          {/* Sig‘im + Harorat */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label
                htmlFor="maxCapacity"
                className="block text-[11px] font-bold uppercase text-gray-500"
              >
                Sig‘im (tn) *
              </label>
              <input
                id="maxCapacity"
                name="maxCapacity"
                type="number"
                step="0.01"
                min="0"
                value={formData.maxCapacity}
                onChange={handleChange}
                placeholder="100"
                required
                className={`w-full p-2.5 font-mono bg-gray-50 border rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white ${
                  errors.maxCapacity ? "border-red-500" : ""
                }`}
              />
              {errors.maxCapacity && (
                <p className="text-xs text-red-600">{errors.maxCapacity}</p>
              )}
            </div>

            <div className="space-y-1">
              <label
                htmlFor="temperatureCelsius"
                className="block text-[11px] font-bold uppercase text-gray-500"
              >
                Harorat (°C)
              </label>
              <input
                id="temperatureCelsius"
                name="temperatureCelsius"
                type="number"
                step="0.1"
                value={formData.temperatureCelsius}
                onChange={handleChange}
                placeholder="-5.0"
                className="w-full p-2.5 font-mono bg-gray-50 border rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white"
              />
            </div>
          </div>

          <hr className="border-gray-100 my-2" />

          {/* Menejer ismi */}
          <div className="space-y-1">
            <label
              htmlFor="managerName"
              className="block text-[11px] font-bold uppercase text-gray-500"
            >
              Mas’ul shaxs (Menejer)
            </label>
            <input
              id="managerName"
              name="managerName"
              value={formData.managerName}
              onChange={handleChange}
              placeholder="Ism familiyasi"
              className="w-full p-2.5 bg-gray-50 border rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white"
            />
          </div>

          {/* Telefon */}
          <div className="space-y-1">
            <label
              htmlFor="managerPhone"
              className="block text-[11px] font-bold uppercase text-gray-500"
            >
              Telefon raqam
            </label>
            <input
              id="managerPhone"
              name="managerPhone"
              value={formData.managerPhone}
              onChange={handleChange}
              placeholder="+998 90 123 45 67"
              className={`w-full p-2.5 font-mono bg-gray-50 border rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white ${
                errors.managerPhone ? "border-red-500" : ""
              }`}
            />
            {errors.managerPhone && (
              <p className="text-xs text-red-600">{errors.managerPhone}</p>
            )}
          </div>
        </form>

        {/* Footer aksiyalar */}
        <footer className="p-5 border-t border-gray-100 bg-white flex gap-3 shadow-[0_-4px_20px_rgba(0,0,0,0.02)]">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 py-3 bg-gray-50 border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            Bekor qilish
          </button>
          <button
            type="submit"
            form="fridge-form"
            disabled={isSubmitting}
            className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-70 shadow-sm shadow-blue-200"
          >
            {isSubmitting ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <>
                <Plus size={18} /> Saqlash
              </>
            )}
          </button>
        </footer>
      </aside>
    </div>
  );
}

/* -------------------------------------------------------------
   4️⃣ FRIDGE CARD (kartani alohida komponentga ajratdik)
   ------------------------------------------------------------- */
function FridgeCard({ fridge, onDelete }) {
  const current = fridge.currentCapacity ?? 0;
  const max = fridge.maxCapacity ?? 1;
  const pct = Math.min(Math.round((current / max) * 100), 100);
  const isFull = pct >= 95;
  const isCold = fridge.temperatureCelsius < 0;

  const getStatusBadge = (status) => {
    switch (status) {
      case "ACTIVE":
        return (
          <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
            Ishlamoqda
          </span>
        );
      case "MAINTENANCE":
        return (
          <span className="bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
            Ta'mirda
          </span>
        );
      case "FULL":
        return (
          <span className="bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
            To'lgan
          </span>
        );
      default:
        return (
          <span className="bg-gray-50 text-gray-700 border border-gray-200 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
            Noma'lum
          </span>
        );
    }
  };

  return (
    <article className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all flex flex-col overflow-hidden group">
      <header className="p-5 border-b border-gray-100 flex justify-between items-start">
        <div className="flex-1 pr-4">
          <h2 className="text-[18px] font-bold text-gray-900 font-['Syne',sans-serif] mb-1.5">
            {fridge.name}
          </h2>
          {getStatusBadge(fridge.status)}
        </div>
        <button
          type="button"
          onClick={() => onDelete(fridge.id, fridge.name, current)}
          className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors shrink-0"
          aria-label={`"${fridge.name}" xolodilnikini o‘chir`}
        >
          <Trash2 size={18} />
        </button>
      </header>

      <section className="p-5 flex-1 flex flex-col gap-4 text-sm bg-gray-50/30">
        <div className="flex flex-col gap-2">
          <p className="flex items-center gap-2.5 text-gray-600">
            <MapPin size={16} className="text-gray-400 shrink-0" />
            <span className="font-medium truncate">{fridge.address}</span>
          </p>
          <p className="flex items-center gap-2.5 text-gray-600">
            <User size={16} className="text-gray-400 shrink-0" />
            <span className="font-medium truncate">
              {fridge.managerName || "Biriktirilmagan"}
            </span>
          </p>
          <p className="flex items-center gap-2.5 text-gray-600">
            <Phone size={16} className="text-gray-400 shrink-0" />
            <span className="font-mono">{fridge.managerPhone || "---"}</span>
          </p>
        </div>

        {/* Harorat */}
        <div
          className={`flex justify-between items-center p-3 mt-1 rounded-xl border ${
            isCold ? "bg-blue-50/50 border-blue-100" : "bg-orange-50/50 border-orange-100"
          }`}
        >
          <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
            Harorat
          </span>
          <div
            className={`flex items-center gap-1.5 font-bold ${
              isCold ? "text-blue-600" : "text-orange-600"
            }`}
          >
            {isCold ? (
              <ThermometerSnowflake size={16} />
            ) : (
              <ThermometerSun size={16} />
            )}
            <span className="font-mono text-base">
              {fridge.temperatureCelsius > 0 ? "+" : ""}
              {fridge.temperatureCelsius}°C
            </span>
          </div>
        </div>

        {/* Sig‘im progress */}
        <div className="mt-auto bg-white p-3 rounded-xl border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
          <div className="flex justify-between items-end mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
              Joriy sig‘im
            </span>
            <span className="font-mono text-xs font-semibold text-gray-500">
              <span
                className={`text-sm ${
                  isFull ? "text-red-600 font-bold" : "text-gray-900 font-black"
                }`}
              >
                {current.toLocaleString()}
              </span>{" "}
              / {max.toLocaleString()} tn
            </span>
          </div>
          <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isFull
                  ? "bg-red-500"
                  : pct > 75
                  ? "bg-amber-400"
                  : "bg-blue-500"
              }`}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </section>
    </article>
  );
}

/* -------------------------------------------------------------
   5️⃣ ASOSIY PAGE – hammasi bir faylda
   ------------------------------------------------------------- */
export default function FridgesPage() {
  /* ---- state ---- */
  const [fridges, setFridges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    fridgeId: null,
    fridgeName: "",
  });

  /* ---- fetch ---- */
  const fetchFridges = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fridgeService.getMyFridges();
      setFridges(data || []);
    } catch (err) {
      setError(err?.message ?? "Xolodilniklarni yuklashda tarmoq xatosi yuz berdi.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchFridges();
  }, []);

  /* ---- toast helper ---- */
  const showToast = (msg, type = "success") => {
    setToast({ show: true, message: msg, type });
  };
  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => setToast({ ...toast, show: false }), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  /* ---- create ---- */
  const handleCreate = async (payload) => {
    try {
      setIsSubmitting(true);
      await fridgeService.createFridge(payload);
      setIsDrawerOpen(false);
      showToast("Yangi xolodilnik muvaffaqiyatli qo‘shildi!");
      fetchFridges();
    } catch (err) {
      showToast(err?.message ?? "Ma'lumotni saqlashda xatolik yuz berdi", "error");
      throw err; // form ichida error handling uchun
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ---- delete ---- */
  const requestDelete = (id, name, currentCap) => {
    if (currentCap > 0) {
      showToast(
        `Xatolik! "${name}" ichida yuk mavjud. Avval uni bo‘shating.`,
        "error"
      );
      return;
    }
    setDeleteModal({ isOpen: true, fridgeId: id, fridgeName: name });
  };

  const confirmDelete = async () => {
    try {
      setIsSubmitting(true);
      await fridgeService.deleteFridge(deleteModal.fridgeId);
      showToast(`"${deleteModal.fridgeName}" o‘chirildi.`);
      setDeleteModal({ isOpen: false, fridgeId: null, fridgeName: "" });
      fetchFridges();
    } catch (err) {
      showToast(err?.message ?? "O‘chirishda xatolik", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ---- filter ---- */
  const filteredFridges = fridges.filter(
    (f) =>
      (f.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (f.address?.toLowerCase() || "").includes(searchTerm.toLowerCase())
  );

  /* ---- loading skeleton (cards) ---- */
  const loadingSkeleton = (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="animate-pulse bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden"
        >
          <div className="h-5 bg-gray-200 rounded w-3/4 mx-5 mt-5"></div>
          <div className="h-3 bg-gray-200 rounded w-1/3 mx-5 mt-2"></div>
          <div className="mt-5 space-y-3 px-5">
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
            <div className="h-4 bg-gray-200 rounded w-3/6"></div>
          </div>
          <div className="mt-5 h-2 bg-gray-200 rounded w-full mx-5 mb-5"></div>
        </div>
      ))}
    </div>
  );

  /* ---- render ---- */
  return (
    <div className="p-4 md:p-6 lg:p-8 w-full max-w-[1600px] mx-auto min-h-screen flex flex-col relative">
      {/* Toast */}
      {toast.show && (
        <ToastMessage
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}

      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-blue-600 font-bold mb-1 flex items-center gap-1.5">
            <Settings2 size={14} /> Infratuzilma Sozlamalari
          </span>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 font-['Syne',sans-serif] tracking-tight">
            Xolodilniklar Boshqaruvi
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Qidiruv..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-all w-full md:w-[240px]"
            />
          </div>
          <button
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors shadow-sm whitespace-nowrap"
            onClick={() => setIsDrawerOpen(true)}
          >
            <Plus size={18} /> Yangi qo‘shish
          </button>
        </div>
      </header>

      {/* Error block */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-600 border border-red-200 rounded-xl text-sm font-medium flex items-start gap-3">
          <AlertCircle size={20} className="shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      {/* Main content */}
      {loading ? (
        loadingSkeleton
      ) : fridges.length === 0 ? (
        // Bo‘sh holat
        <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-gray-300 rounded-3xl p-12 text-center bg-gray-50/50 min-h-[400px]">
          <Server size={64} className="text-gray-300 mb-4" strokeWidth={1.5} />
          <h3 className="text-xl font-bold text-gray-900 mb-2 font-['Syne',sans-serif]">
            Infratuzilma bo‘sh
          </h3>
          <p className="text-gray-500 text-sm max-w-sm mb-6">
            Hozircha tizimga hech qanday xolodilnik qo‘shilmagan. Yuk qabul
            qilish uchun avval xolodilnik yarating.
          </p>
          <button
            className="flex items-center gap-2 bg-blue-50 text-blue-600 px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-100 transition-colors border border-blue-200"
            onClick={() => setIsDrawerOpen(true)}
          >
            <Plus size={18} /> Birinchi xolodilnikni qo‘shish
          </button>
        </div>
      ) : filteredFridges.length === 0 ? (
        // Qidiruv natijasiz
        <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-gray-300 rounded-3xl p-12 text-center bg-gray-50/50 min-h-[400px]">
          <Search size={48} className="text-gray-300 mb-4" strokeWidth={1.5} />
          <h3 className="text-lg font-bold text-gray-900 mb-1 font-['Syne',sans-serif]">
            Natija topilmadi
          </h3>
          <p className="text-gray-500 text-sm">
            "{searchTerm}" bo‘yicha hech qanday xolodilnik topilmadi.
          </p>
          <button
            className="mt-4 text-blue-600 font-medium text-sm hover:underline"
            onClick={() => setSearchTerm("")}
          >
            Qidiruvni tozalash
          </button>
        </div>
      ) : (
        // Keltirilgan ro‘yxat
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredFridges.map((f) => (
            <FridgeCard
              key={f.id}
              fridge={f}
              onDelete={requestDelete}
            />
          ))}
        </div>
      )}

      {/* Delete modal */}
      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        fridgeName={deleteModal.fridgeName}
        onCancel={() =>
          setDeleteModal({ isOpen: false, fridgeId: null, fridgeName: "" })
        }
        onConfirm={confirmDelete}
        isLoading={isSubmitting}
      />

      {/* Add drawer */}
      <AddFridgeDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onSubmit={handleCreate}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
