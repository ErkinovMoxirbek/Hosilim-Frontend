import React, { useState, useEffect } from "react";
import { Plus, Search, Edit2, Trash2, X, User, Phone, MapPin, ShieldCheck, CheckCircle2, Ban, MoreVertical, Calendar } from "lucide-react";
import { accountantService } from "../../services/accountantService";

export default function AccountantsPage() {
  const [accountants, setAccountants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal holatlari
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalStep, setModalStep] = useState(1); // 1: Phone, 2: OTP, 3: Edit Details
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  // Taymer holati (OTP uchun)
  const [timer, setTimer] = useState(60);

  // Forma ma'lumotlari
  const [formData, setFormData] = useState({
    phone: "", 
    otp: "",
    fullName: "",
    address: "",
    brokerId: "", 
    status: "ACTIVE" 
  });

  // Telefon raqamni formatlash (bo'shliqlar bilan)
  const formatPhoneUI = (value) => {
    const cleaned = value.replace(/\D/g, '').substring(0, 9);
    let formatted = cleaned;
    if (cleaned.length > 2) formatted = `${cleaned.slice(0, 2)} ${cleaned.slice(2)}`;
    if (cleaned.length > 5) formatted = `${formatted.slice(0, 6)} ${cleaned.slice(5, 7)}`;
    if (cleaned.length > 7) formatted = `${formatted.slice(0, 9)} ${cleaned.slice(7, 9)}`;
    return formatted;
  };

  const handlePhoneChange = (e) => {
    setFormData({ ...formData, phone: formatPhoneUI(e.target.value) });
  };

  const fetchAccountants = async () => {
    try {
      setLoading(true);
      const data = await accountantService.getAll(0, 100);
      const items = data.content ? data.content : Array.isArray(data) ? data : [];
      setAccountants(items);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Ma'lumotlarni yuklashda xatolik yuz berdi.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccountants();
  }, []);

  useEffect(() => {
    let interval;
    if (modalStep === 2 && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [modalStep, timer]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const openAddModal = () => {
    setEditingId(null);
    setFormData({ phone: "", otp: "", fullName: "", address: "", brokerId: "", status: "ACTIVE" });
    setModalStep(1);
    setTimer(60);
    setIsModalOpen(true);
  };

  const openEditModal = (acc) => {
    setEditingId(acc.id);
    const cleanPhone = acc.phone ? acc.phone.replace("+998", "") : "";
    setFormData({ 
      phone: formatPhoneUI(cleanPhone), 
      otp: "", 
      fullName: acc.fullName || "", 
      address: acc.address || "", 
      brokerId: acc.brokerId || "",
      status: acc.status || "ACTIVE"
    });
    setModalStep(3);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (isSubmitting) return;
    setIsModalOpen(false);
    setEditingId(null);
    setModalStep(1);
    setTimer(60);
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    const cleanPhoneDigits = formData.phone.replace(/\s+/g, "");
    if (cleanPhoneDigits.length < 9) return alert("Telefon raqamni to'liq kiriting!");
    
    const fullPhone = `+998${cleanPhoneDigits}`;
    
    try {
      setIsSubmitting(true);
      await accountantService.sendOtp(fullPhone);
      setTimer(60); 
      setModalStep(2); 
    } catch (err) {
      alert("Kod yuborishda xatolik: " + (err.response?.data?.message || err.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    const fullPhone = `+998${formData.phone.replace(/\s+/g, "")}`;
    try {
      setIsSubmitting(true);
      await accountantService.sendOtp(fullPhone);
      setTimer(60);
    } catch (err) {
      alert("Kodni qayta yuborishda xatolik: " + (err.response?.data?.message || err.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!formData.otp) return;

    const fullPhone = `+998${formData.phone.replace(/\s+/g, "")}`;

    try {
      setIsSubmitting(true);
      await accountantService.verifyOtp(fullPhone, formData.otp);
      alert("Yangi hisobchi muvaffaqiyatli qo'shildi!");
      closeModal(); 
      fetchAccountants(); 
    } catch (err) {
      alert("Kod xato yoki tasdiqlashda xatolik: " + (err.response?.data?.message || err.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitEditDetails = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const payload = {
        phone: `+998${formData.phone.replace(/\s+/g, "")}`, 
        fullName: formData.fullName.trim(),
        address: formData.address.trim(),
        brokerId: formData.brokerId ? Number(formData.brokerId) : null,
        status: formData.status
      };

      if (editingId) {
        await accountantService.update(editingId, payload);
      }

      closeModal();
      fetchAccountants(); 
    } catch (err) {
      alert("Xatolik: " + (err.response?.data?.message || "Serverga ulanishda xatolik"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Rostdan ham bu hisobchini o'chirmoqchimisiz?")) {
      try {
        await accountantService.delete(id);
        setAccountants(accountants.filter((acc) => acc.id !== id));
      } catch (err) {
        alert("O'chirishda xatolik yuz berdi!");
      }
    }
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name.trim().split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();
  };

  // 🚀 XATOLIK TO'G'RILANDI: Statusni toza va chiroyli qilib qaytaruvchi funksiya
  const renderStatusBadge = (status) => {
    if (status === 'ACTIVE') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          Faol
        </span>
      );
    }
    if (status === 'BLOCKED') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200 shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
          Bloklangan
        </span>
      );
    }
    if (status === 'INACTIVE') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
          Faol emas
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-gray-50 text-gray-700 border border-gray-200 shadow-sm">
        Noma'lum
      </span>
    );
  };

  if (loading && accountants.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
          <p className="text-gray-500 font-medium">Ma'lumotlar yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-8">
      {/* HEADER QISMI (Premium dizayn) */}
      <div className="bg-white p-6 rounded-[1.5rem] border border-gray-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Hisobchilar</h1>
          <p className="text-gray-500 text-sm mt-1.5 font-medium">Tizimdagi barcha xodimlar va ularning ruxsatlari</p>
        </div>
        
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Qidirish..." 
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl font-medium text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all"
            />
          </div>
          <button 
            onClick={openAddModal}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white px-5 py-2.5 rounded-xl transition-all font-bold shadow-md shadow-blue-600/20 whitespace-nowrap hover:-translate-y-0.5"
          >
            <Plus size={18} strokeWidth={3} />
            <span className="hidden sm:inline">Qo'shish</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 flex items-center gap-3 font-medium">
          <ShieldCheck size={20} className="text-red-500" /> {error}
        </div>
      )}

      {/* JADVAL QISMI */}
      <div className="bg-white border border-gray-100 rounded-[1.5rem] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50/80 text-gray-500 font-bold uppercase tracking-wider text-[11px] border-b border-gray-100">
              <tr>
                <th className="px-6 py-5">Xodim (F.I.O / Telefon)</th>
                <th className="px-6 py-5">Manzil</th>
                <th className="px-6 py-5">Sana</th>
                <th className="px-6 py-5">Holati</th>
                <th className="px-6 py-5 text-right">Harakatlar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {accountants.length > 0 ? (
                accountants.map((acc) => (
                  <tr key={acc.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-100 to-blue-50 text-blue-700 flex items-center justify-center font-black shadow-inner border border-blue-200/50">
                          {getInitials(acc.fullName)}
                        </div>
                        <div>
                          <div className="font-bold text-gray-900 text-base">{acc.fullName || "Noma'lum"}</div>
                          <div className="text-gray-500 text-xs mt-0.5 font-medium flex items-center gap-1">
                            <Phone size={12} /> {acc.phone}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-gray-600 max-w-[220px]" title={acc.address}>
                        <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center border border-gray-100 flex-shrink-0">
                          <MapPin size={14} className="text-gray-400" />
                        </div>
                        <span className="truncate font-medium">{acc.address || "Ko'rsatilmagan"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                       <div className="flex items-center gap-2 text-gray-500 font-medium">
                         <Calendar size={14} className="text-gray-400" />
                         {new Date(acc.createdAt).toLocaleDateString("ru-RU", { 
                          day: '2-digit', month: '2-digit', year: 'numeric' 
                         })}
                       </div>
                    </td>
                    <td className="px-6 py-4">
                      {renderStatusBadge(acc.status)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => openEditModal(acc)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all border border-transparent hover:border-blue-100"
                          title="Tahrirlash"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(acc.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-100"
                          title="O'chirish"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                      <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4 border border-gray-100 shadow-sm">
                        <User size={32} className="text-gray-400" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-1">Hisobchilar topilmadi</h3>
                      <p className="text-sm text-gray-500 font-medium text-center">
                        Hozircha tizimga hech qanday hisobchi qo'shilmagan. Yangi qo'shish uchun yuqoridagi tugmadan foydalaning.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL QISMI (Premium dizayn) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
          {/* Orqa fon pardasi */}
          <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={closeModal}></div>
          
          <div className="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-[440px] overflow-hidden animate-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between px-8 py-5 border-b border-gray-100 bg-white">
              <div className="flex flex-col">
                <h2 className="text-xl font-black text-gray-900">
                  {editingId ? "Tahrirlash" : "Yangi qo'shish"}
                </h2>
                {!editingId && (
                  <p className="text-xs text-blue-600 font-bold mt-1 uppercase tracking-wider">
                    Qadam {modalStep} / 2
                  </p>
                )}
              </div>
              <button 
                onClick={closeModal}
                className="w-10 h-10 flex items-center justify-center bg-gray-50 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors border border-gray-200"
                disabled={isSubmitting}
              >
                <X size={18} strokeWidth={2.5} />
              </button>
            </div>
            
            <div className="p-8">
              {/* QADAM 1: TELEFON RAQAM */}
              {modalStep === 1 && (
                <form onSubmit={handleSendOtp} className="space-y-6">
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-100 shadow-sm">
                      <Phone size={28} />
                    </div>
                    <h3 className="text-gray-900 font-bold text-lg">Telefon raqam</h3>
                    <p className="text-sm text-gray-500 mt-1.5 font-medium">Ushbu raqamga tasdiqlash kodi yuboriladi</p>
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-widest font-bold text-gray-400 mb-2">Raqamni kiriting</label>
                    <div className="flex items-center border-2 border-gray-100 rounded-2xl overflow-hidden focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 bg-gray-50 transition-all">
                      <div className="px-5 py-4 bg-gray-100/50 text-gray-500 font-bold border-r-2 border-gray-100 text-lg">
                        +998
                      </div>
                      <input 
                        type="tel" 
                        name="phone"
                        required
                        value={formData.phone}
                        onChange={handlePhoneChange}
                        placeholder="90 123 45 67" 
                        className="w-full px-5 py-4 bg-transparent focus:outline-none text-lg font-bold tracking-wide placeholder-gray-300 text-gray-900"
                      />
                    </div>
                  </div>
                  
                  <button 
                    type="submit"
                    disabled={isSubmitting || formData.phone.replace(/\s+/g, "").length < 9}
                    className="w-full py-4 mt-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-2xl font-bold text-lg transition-all shadow-lg shadow-blue-600/30 disabled:opacity-50 disabled:shadow-none flex justify-center"
                  >
                    {isSubmitting ? <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Kodni olish"}
                  </button>
                </form>
              )}

              {/* QADAM 2: OTP */}
              {modalStep === 2 && (
                <form onSubmit={handleVerifyOtp} className="space-y-6 animate-in slide-in-from-right-4">
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-100 shadow-sm">
                      <ShieldCheck size={28} />
                    </div>
                    <h3 className="text-gray-900 font-bold text-lg">Kodni tasdiqlang</h3>
                    <p className="text-sm text-gray-500 mt-1.5 font-medium px-4">
                      <span className="font-bold text-gray-900">+998 {formData.phone}</span> raqamiga yuborilgan 4 xonali kodni kiriting.
                    </p>
                  </div>

                  <div>
                    <input 
                      type="text" 
                      name="otp"
                      required
                      maxLength={4}
                      value={formData.otp}
                      onChange={handleChange}
                      placeholder="0 0 0 0" 
                      className="w-full px-4 py-5 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-green-500/10 focus:border-green-500 focus:bg-white text-center text-3xl font-black tracking-[1em] text-gray-900 transition-all placeholder:text-gray-300"
                    />
                  </div>
                  
                  <button 
                    type="submit"
                    disabled={isSubmitting || formData.otp.length !== 4}
                    className="w-full py-4 mt-2 bg-green-600 hover:bg-green-700 active:bg-green-800 text-white rounded-2xl font-bold text-lg transition-all shadow-lg shadow-green-600/30 disabled:opacity-50 disabled:shadow-none flex justify-center"
                  >
                    {isSubmitting ? <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Tasdiqlash"}
                  </button>

                  <div className="flex flex-col items-center gap-3 pt-4 border-t border-gray-100">
                    {timer > 0 ? (
                      <p className="text-sm text-gray-500 font-medium">
                        Qayta so'rash: <span className="text-blue-600 font-bold">00:{timer < 10 ? `0${timer}` : timer}</span>
                      </p>
                    ) : (
                      <button 
                        type="button"
                        onClick={handleResendOtp}
                        disabled={isSubmitting}
                        className="text-sm text-blue-600 hover:text-blue-800 font-bold transition-colors"
                      >
                        Kodni qayta yuborish
                      </button>
                    )}

                    <button 
                      type="button"
                      onClick={() => setModalStep(1)}
                      className="text-sm text-gray-400 hover:text-gray-700 font-medium transition-colors"
                    >
                      Raqamni o'zgartirish
                    </button>
                  </div>
                </form>
              )}

              {/* QADAM 3: TAHRIRLASH (Edit Details) */}
              {modalStep === 3 && (
                <form onSubmit={handleSubmitEditDetails} className="space-y-6 animate-in slide-in-from-right-4">
                  
                  <div className="space-y-5">
                    <div>
                      <label className="block text-[11px] uppercase tracking-widest font-bold text-gray-400 mb-2">F.I.O. (Ism va Familiya)</label>
                      <div className="relative group">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                        <input 
                          type="text" 
                          name="fullName"
                          required
                          value={formData.fullName}
                          onChange={handleChange}
                          placeholder="Sardor Rahimov" 
                          className="pl-11 w-full px-4 py-3.5 bg-gray-50 border-2 border-gray-100 rounded-2xl font-bold text-gray-900 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all placeholder:font-medium placeholder:text-gray-300"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] uppercase tracking-widest font-bold text-gray-400 mb-2">Telefon raqami</label>
                      <div className="flex items-center border-2 border-gray-100 rounded-2xl overflow-hidden focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 bg-gray-50 transition-all">
                        <div className="px-4 py-3.5 bg-gray-100/50 text-gray-500 font-bold border-r-2 border-gray-100">
                          +998
                        </div>
                        <input 
                          type="tel" 
                          name="phone"
                          required
                          value={formData.phone}
                          onChange={handlePhoneChange}
                          placeholder="90 123 45 67" 
                          className="w-full px-4 py-3.5 bg-transparent focus:outline-none tracking-wide font-bold text-gray-900"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] uppercase tracking-widest font-bold text-gray-400 mb-2">Yashash manzili</label>
                      <div className="relative group">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                        <input 
                          type="text" 
                          name="address"
                          required
                          value={formData.address}
                          onChange={handleChange}
                          placeholder="Viloyat, tuman, ko'cha..." 
                          className="pl-11 w-full px-4 py-3.5 bg-gray-50 border-2 border-gray-100 rounded-2xl font-bold text-gray-900 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all placeholder:font-medium placeholder:text-gray-300"
                        />
                      </div>
                    </div>

                    {/* STATUS TANLASH (ZAMONAVIY TOGGLE) */}
                    <div className="pt-2">
                      <label className="block text-[11px] uppercase tracking-widest font-bold text-gray-400 mb-3">Hisob holati</label>
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, status: "ACTIVE" })}
                          className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold border-2 transition-all ${
                            formData.status === "ACTIVE" 
                              ? "bg-green-50 border-green-500 text-green-700 shadow-md shadow-green-500/10" 
                              : "bg-gray-50 border-gray-100 text-gray-400 hover:border-gray-300 hover:bg-gray-100"
                          }`}
                        >
                          <CheckCircle2 size={18} className={formData.status === "ACTIVE" ? "text-green-600" : "text-gray-400"} />
                          Faol
                        </button>

                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, status: "BLOCKED" })}
                          className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold border-2 transition-all ${
                            formData.status === "BLOCKED" 
                              ? "bg-red-50 border-red-500 text-red-700 shadow-md shadow-red-500/10" 
                              : "bg-gray-50 border-gray-100 text-gray-400 hover:border-gray-300 hover:bg-gray-100"
                          }`}
                        >
                          <Ban size={18} className={formData.status === "BLOCKED" ? "text-red-600" : "text-gray-400"} />
                          Bloklangan
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 mt-2 border-t border-gray-100 flex gap-3">
                    <button 
                      type="button"
                      onClick={closeModal}
                      disabled={isSubmitting}
                      className="flex-1 py-4 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-2xl font-bold transition-colors border border-gray-200"
                    >
                      Bekor qilish
                    </button>
                    <button 
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 py-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-2xl font-bold transition-all shadow-lg shadow-blue-600/30 flex justify-center items-center gap-2"
                    >
                      {isSubmitting && <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                      {isSubmitting ? "Saqlanmoqda..." : "Saqlash"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}