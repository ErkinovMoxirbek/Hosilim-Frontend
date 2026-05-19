import React, { useEffect, useState, useRef } from "react";
import {
  Search, Plus, MapPin, User, Phone,
  ThermometerSnowflake, ThermometerSun,
  Server, X, Loader2, AlertCircle, Trash2,
  Settings2, AlertTriangle, CheckCircle2,
} from "lucide-react";
import { fridgeService } from "../../../services/fridgeService";

/* ─────────────────────────────────────────
   TOAST
───────────────────────────────────────── */
function ToastMessage({ message, type = "success", onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div
      role="alert"
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-[70] flex items-center gap-2 px-5 py-3 rounded-2xl shadow-xl border text-sm font-bold ${
        type === "error"
          ? "bg-red-50 text-red-700 border-red-200"
          : "bg-emerald-50 text-emerald-700 border-emerald-200"
      }`}
    >
      {type === "error" ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
      {message}
    </div>
  );
}

/* ─────────────────────────────────────────
   DELETE MODAL
───────────────────────────────────────── */
function DeleteConfirmModal({ isOpen, fridgeName, onCancel, onConfirm, isLoading }) {
  useEffect(() => {
    const esc = (e) => { if (e.key === "Escape" && isOpen && !isLoading) onCancel(); };
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [isOpen, isLoading, onCancel]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => !isLoading && onCancel()} />
      <div className="relative bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl">
        <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mb-4 mx-auto">
          <AlertTriangle size={24} />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2 text-center" style={{ fontFamily: '"Syne", sans-serif' }}>
          O'chirishni tasdiqlang
        </h3>
        <p className="text-gray-500 text-sm mb-6 text-center">
          <span className="font-bold text-gray-800">"{fridgeName}"</span> xolodilnikini
          o'chirayotganingizga ishonchingiz komilmi? Bu amalni ortga qaytarib bo'lmaydi.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            Bekor
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 py-2.5 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {isLoading ? <Loader2 size={16} className="animate-spin" /> : "O'chir"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   ADD DRAWER  ← BU YERDA ID TUZATILDI
───────────────────────────────────────── */
const FORM_ID = "fridge-add-form"; // ← bitta joyda belgilanadi

// Field va inputCls drawer tashqarisida — focus muammosi yo'q
function Field({ id, label, required, error, children }) {
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="block text-[11px] font-bold uppercase tracking-wider text-gray-500">
        {label}{required && " *"}
      </label>
      {children}
      {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
    </div>
  );
}

const inputCls = (err) =>
  `w-full px-3 py-2.5 bg-gray-50 border rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-all ${
    err ? "border-red-400 bg-red-50/30" : "border-gray-200"
  }`;

function AddFridgeDrawer({ isOpen, onClose, onSubmit, isSubmitting }) {
  const EMPTY = { name: "", address: "", maxCapacity: "", temperatureCelsius: "", managerName: "", managerPhone: "" };
  const [formData, setFormData] = useState(EMPTY);
  const [errors, setErrors]     = useState({});
  const firstRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      firstRef.current?.focus();
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  useEffect(() => {
    const esc = (e) => { if (e.key === "Escape" && isOpen && !isSubmitting) onClose(); };
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [isOpen, isSubmitting, onClose]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(p => ({ ...p, [name]: value }));
    // xato belgini tozalash
    if (errors[name]) setErrors(p => ({ ...p, [name]: undefined }));
  };

  const validate = () => {
    const errs = {};
    if (!formData.name.trim())        errs.name        = "Nom kiriting";
    if (!formData.address.trim())     errs.address     = "Manzil kiriting";
    if (!formData.maxCapacity)        errs.maxCapacity = "Sig'imni kiriting";
    else if (Number(formData.maxCapacity) <= 0) errs.maxCapacity = "Musbat son bo'lishi kerak";
    if (formData.managerPhone && !/^\+?\d{9,15}$/.test(formData.managerPhone.replace(/\s+/g, "")))
      errs.managerPhone = "Noto'g'ri format";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    const payload = {
      name:               formData.name.trim(),
      address:            formData.address.trim(),
      maxCapacity:        parseFloat(formData.maxCapacity),
      temperatureCelsius: formData.temperatureCelsius ? parseFloat(formData.temperatureCelsius) : undefined,
      managerName:        formData.managerName?.trim()  || undefined,
      managerPhone:       formData.managerPhone?.trim() || undefined,
    };
    try {
      await onSubmit(payload);
      setFormData(EMPTY);
      setErrors({});
    } catch (_) {}
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => !isSubmitting && onClose()} />
      <aside className="relative w-full max-w-md h-full bg-white shadow-2xl flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/60">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-blue-600 font-bold mb-0.5">Yangi obyekt</p>
            <h2 className="text-lg font-bold text-gray-900" style={{ fontFamily: '"Syne", sans-serif' }}>
              Xolodilnik qo'shish
            </h2>
          </div>
          <button
            onClick={() => !isSubmitting && onClose()}
            className="w-9 h-9 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* ✅ TUZATILDI: form id="fridge-add-form" */}
        <form
          id={FORM_ID}
          onSubmit={handleSubmit}
          noValidate
          className="flex-1 overflow-y-auto px-6 py-5 space-y-4"
        >
          <Field id="name" label="Nomlanishi" required error={errors.name}>
            <input
              id="name" ref={firstRef} name="name"
              value={formData.name} onChange={handleChange}
              placeholder="Masalan: Kamera №1"
              className={inputCls(errors.name)}
            />
          </Field>

          <Field id="address" label="Manzil" required error={errors.address}>
            <input
              id="address" name="address"
              value={formData.address} onChange={handleChange}
              placeholder="To'liq manzil"
              className={inputCls(errors.address)}
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field id="maxCapacity" label="Sig'im (tn)" required error={errors.maxCapacity}>
              <input
                id="maxCapacity" name="maxCapacity" type="number" step="0.01" min="0"
                value={formData.maxCapacity} onChange={handleChange}
                placeholder="100"
                className={`${inputCls(errors.maxCapacity)} font-mono`}
              />
            </Field>
            <Field id="temperatureCelsius" label="Harorat (°C)">
              <input
                id="temperatureCelsius" name="temperatureCelsius" type="number" step="0.1"
                value={formData.temperatureCelsius} onChange={handleChange}
                placeholder="-5.0"
                className={`${inputCls(false)} font-mono`}
              />
            </Field>
          </div>

          <div className="border-t border-dashed border-gray-200 pt-4">
            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-3">
              Mas'ul shaxs (ixtiyoriy)
            </p>
            <div className="space-y-3">
              <Field id="managerName" label="Ism familiyasi">
                <div className="relative">
                  <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    id="managerName" name="managerName"
                    value={formData.managerName} onChange={handleChange}
                    placeholder="Abdullayev Sarvar"
                    className={`${inputCls(false)} pl-8`}
                  />
                </div>
              </Field>
              <Field id="managerPhone" label="Telefon" error={errors.managerPhone}>
                <div className="relative">
                  <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    id="managerPhone" name="managerPhone"
                    value={formData.managerPhone} onChange={handleChange}
                    placeholder="+998 90 123 45 67"
                    className={`${inputCls(errors.managerPhone)} pl-8 font-mono`}
                  />
                </div>
              </Field>
            </div>
          </div>
        </form>

        {/* Footer — form tashqarisida, lekin type="submit" form={FORM_ID} */}
        <div className="px-6 py-4 border-t border-gray-100 bg-white flex gap-3 shadow-[0_-4px_16px_rgba(0,0,0,0.04)]">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 py-3 bg-gray-50 border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-100 transition-colors disabled:opacity-50 text-sm"
          >
            Bekor qilish
          </button>
          {/* ✅ form={FORM_ID} — to'g'ri id bilan bog'landi */}
          <button
            type="submit"
            form={FORM_ID}
            disabled={isSubmitting}
            className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-70 shadow-sm text-sm"
          >
            {isSubmitting
              ? <Loader2 size={18} className="animate-spin" />
              : <><Plus size={16} /> Saqlash</>
            }
          </button>
        </div>
      </aside>
    </div>
  );
}

/* ─────────────────────────────────────────
   FRIDGE CARD
───────────────────────────────────────── */
function FridgeCard({ fridge, onDelete }) {
  const current = fridge.currentCapacity ?? 0;
  const max     = fridge.maxCapacity ?? 1;
  const pct     = Math.min(Math.round((current / max) * 100), 100);
  const isFull  = pct >= 95;
  const isCold  = (fridge.temperatureCelsius ?? 0) < 0;

  const statusBadge = {
    ACTIVE:      <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">Ishlamoqda</span>,
    MAINTENANCE: <span className="bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">Ta'mirda</span>,
    FULL:        <span className="bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">To'lgan</span>,
  }[fridge.status] ?? (
    <span className="bg-gray-100 text-gray-600 border border-gray-200 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">Noma'lum</span>
  );

  const barColor = isFull ? "bg-red-500" : pct > 75 ? "bg-amber-400" : "bg-blue-500";

  return (
    <article className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col overflow-hidden">

      {/* Renkli chiziq */}
      <div className={`h-1 w-full ${isCold ? "bg-blue-400" : "bg-amber-400"}`} />

      {/* Bosh qism */}
      <div className="px-5 pt-4 pb-3 flex justify-between items-start border-b border-gray-100">
        <div className="flex-1 pr-3 min-w-0">
          <h2 className="text-[17px] font-bold text-gray-900 truncate mb-1.5" style={{ fontFamily: '"Syne", sans-serif' }}>
            {fridge.name}
          </h2>
          {statusBadge}
        </div>
        <button
          onClick={() => onDelete(fridge.id, fridge.name, current)}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-300 hover:bg-red-50 hover:text-red-500 transition-colors shrink-0"
          aria-label={`"${fridge.name}" o'chir`}
        >
          <Trash2 size={16} />
        </button>
      </div>

      {/* Tafsilotlar */}
      <div className="px-5 py-4 flex-1 flex flex-col gap-3">

        <div className="space-y-2">
          {[
            { icon: <MapPin size={14} />, value: fridge.address },
            { icon: <User size={14} />,   value: fridge.managerName  || "Biriktirilmagan" },
            { icon: <Phone size={14} />,  value: fridge.managerPhone || "---", mono: true },
          ].map((row, i) => (
            <div key={i} className="flex items-center gap-2.5 text-sm text-gray-600">
              <span className="text-gray-400 shrink-0">{row.icon}</span>
              <span className={`truncate ${row.mono ? "font-mono text-xs" : "font-medium"}`}>{row.value}</span>
            </div>
          ))}
        </div>

        {/* Harorat */}
        <div className={`flex items-center justify-between px-3 py-2.5 rounded-xl border text-sm ${
          isCold ? "bg-blue-50/60 border-blue-100" : "bg-orange-50/60 border-orange-100"
        }`}>
          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Harorat</span>
          <div className={`flex items-center gap-1.5 font-bold font-mono ${isCold ? "text-blue-600" : "text-orange-600"}`}>
            {isCold ? <ThermometerSnowflake size={15} /> : <ThermometerSun size={15} />}
            {fridge.temperatureCelsius > 0 ? "+" : ""}{fridge.temperatureCelsius}°C
          </div>
        </div>

        {/* Sig'im progress */}
        <div className="mt-auto bg-gray-50 border border-gray-100 rounded-xl p-3">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Sig'im</span>
            <span className="text-xs text-gray-500 font-mono">
              <span className={`font-bold ${isFull ? "text-red-600" : "text-gray-900"}`}>{current.toLocaleString()}</span>
              {" "}/ {max.toLocaleString()} tn
            </span>
          </div>
          <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${barColor}`}
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="flex justify-end mt-1">
            <span className={`text-[10px] font-bold ${isFull ? "text-red-500" : "text-gray-400"}`}>{pct}%</span>
          </div>
        </div>
      </div>
    </article>
  );
}

/* ─────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────── */
export default function FridgesPage() {
  const [fridges,     setFridges]     = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);
  const [searchTerm,  setSearchTerm]  = useState("");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast,       setToast]       = useState({ show: false, message: "", type: "success" });
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, fridgeId: null, fridgeName: "" });

  const fetchFridges = async () => {
    try {
      setLoading(true); setError(null);
      const data = await fridgeService.getMyFridges();
      setFridges(data || []);
    } catch (err) {
      setError(err?.message ?? "Xolodilniklarni yuklashda xatolik.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { fetchFridges(); }, []);

  const showToast = (message, type = "success") => setToast({ show: true, message, type });

  const handleCreate = async (payload) => {
    try {
      setIsSubmitting(true);
      await fridgeService.createFridge(payload);
      setIsDrawerOpen(false);
      showToast("Yangi xolodilnik muvaffaqiyatli qo'shildi!");
      fetchFridges();
    } catch (err) {
      showToast(err?.message ?? "Saqlashda xatolik yuz berdi", "error");
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const requestDelete = (id, name, currentCap) => {
    if (currentCap > 0) {
      showToast(`"${name}" ichida yuk mavjud. Avval uni bo'shating.`, "error");
      return;
    }
    setDeleteModal({ isOpen: true, fridgeId: id, fridgeName: name });
  };

  const confirmDelete = async () => {
    try {
      setIsSubmitting(true);
      await fridgeService.deleteFridge(deleteModal.fridgeId);
      showToast(`"${deleteModal.fridgeName}" muvaffaqiyatli o'chirildi.`);
      setDeleteModal({ isOpen: false, fridgeId: null, fridgeName: "" });
      fetchFridges();
    } catch (err) {
      showToast(err?.message ?? "O'chirishda xatolik", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredFridges = fridges.filter(f =>
    (f.name?.toLowerCase()    || "").includes(searchTerm.toLowerCase()) ||
    (f.address?.toLowerCase() || "").includes(searchTerm.toLowerCase())
  );

  const Skeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="animate-pulse bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="h-1 bg-gray-200 w-full" />
          <div className="p-5 space-y-3">
            <div className="h-5 bg-gray-200 rounded-lg w-3/4" />
            <div className="h-3 bg-gray-100 rounded w-1/3" />
            <div className="space-y-2 pt-2">
              {[...Array(3)].map((_, j) => <div key={j} className="h-4 bg-gray-100 rounded w-5/6" />)}
            </div>
            <div className="h-10 bg-gray-100 rounded-xl" />
            <div className="h-12 bg-gray-100 rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="p-4 md:p-6 lg:p-8 w-full max-w-[1600px] mx-auto min-h-screen flex flex-col relative">

      {toast.show && (
        <ToastMessage
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(t => ({ ...t, show: false }))}
        />
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 bg-white px-6 py-5 rounded-2xl border border-gray-200 shadow-sm">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-blue-600 font-bold mb-1 flex items-center gap-1.5">
            <Settings2 size={13} /> Infratuzilma
          </span>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight" style={{ fontFamily: '"Syne", sans-serif' }}>
            Xolodilniklar Boshqaruvi
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
            <input
              type="text"
              placeholder="Qidiruv..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-300 transition-all w-full md:w-[220px]"
            />
          </div>
          <span className="bg-gray-100 border border-gray-200 text-gray-700 text-sm font-bold px-4 py-2.5 rounded-full whitespace-nowrap font-mono">
            {filteredFridges.length}
          </span>
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-full text-sm font-bold hover:bg-blue-700 transition-colors shadow-sm whitespace-nowrap"
          >
            <Plus size={17} /> Yangi
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-600 border border-red-200 rounded-xl text-sm font-medium flex items-start gap-3">
          <AlertCircle size={18} className="shrink-0 mt-0.5" /> {error}
        </div>
      )}

      {loading ? (
        <Skeleton />
      ) : fridges.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-gray-300 rounded-3xl p-12 text-center bg-gray-50/50 min-h-[400px]">
          <Server size={56} className="text-gray-300 mb-4" strokeWidth={1.2} />
          <h3 className="text-xl font-bold text-gray-900 mb-2" style={{ fontFamily: '"Syne", sans-serif' }}>
            Infratuzilma bo'sh
          </h3>
          <p className="text-gray-400 text-sm max-w-sm mb-6">
            Hozircha tizimga hech qanday xolodilnik qo'shilmagan.
          </p>
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="flex items-center gap-2 bg-blue-50 text-blue-600 px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-100 transition-colors border border-blue-200"
          >
            <Plus size={17} /> Birinchi xolodilnikni qo'shish
          </button>
        </div>
      ) : filteredFridges.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-gray-300 rounded-3xl p-12 text-center bg-gray-50/50 min-h-[300px]">
          <Search size={40} className="text-gray-300 mb-3" strokeWidth={1.2} />
          <h3 className="text-lg font-bold text-gray-900 mb-1" style={{ fontFamily: '"Syne", sans-serif' }}>Natija topilmadi</h3>
          <p className="text-gray-400 text-sm">"{searchTerm}" bo'yicha hech narsa topilmadi.</p>
          <button onClick={() => setSearchTerm("")} className="mt-4 text-blue-600 font-semibold text-sm hover:underline">
            Qidiruvni tozalash
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredFridges.map(f => (
            <FridgeCard key={f.id} fridge={f} onDelete={requestDelete} />
          ))}
        </div>
      )}

      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        fridgeName={deleteModal.fridgeName}
        onCancel={() => setDeleteModal({ isOpen: false, fridgeId: null, fridgeName: "" })}
        onConfirm={confirmDelete}
        isLoading={isSubmitting}
      />

      <AddFridgeDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onSubmit={handleCreate}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}