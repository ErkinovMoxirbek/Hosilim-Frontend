import React, { useState, useEffect, useMemo } from "react";
import { Plus, Search, Edit2, Trash2, X, User, Phone, MapPin, ShieldCheck, CheckCircle2, Ban, Calendar, Users } from "lucide-react";
import { accountantService } from "../../services/accountantService";

export default function AccountantsPage() {
  const [accountants, setAccountants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // QIDIRUV UCHUN STATE QO'SHILDI
  const [searchQuery, setSearchQuery] = useState("");

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

  // QIDIRUV MANTIG'I (Search ishlashi uchun)
  const filteredAccountants = useMemo(() => {
    if (!searchQuery.trim()) return accountants;
    const query = searchQuery.toLowerCase();
    return accountants.filter(acc => 
      acc.fullName?.toLowerCase().includes(query) || 
      acc.phone?.includes(query)
    );
  }, [accountants, searchQuery]);

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
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-slate-50 text-slate-700 border border-slate-200 shadow-sm">
        Noma'lum
      </span>
    );
  };

  return (
    // YUQORIGA YOPISHIB QOLMASLIGI UCHUN PADDINGLAR VA MAX-WIDTH BERILDI
    <div className="p-4 md:p-6 lg:p-8 w-full max-w-[1400px] mx-auto min-h-screen flex flex-col font-inter text-slate-900 antialiased space-y-6">
      
      {/* HEADER QISMI (Premium dizayn, indigo rangda) */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-5 lg:p-6 bg-white border border-slate-200 rounded-2xl shadow-sm gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-xl flex items-center justify-center shadow-sm shrink-0">
            <Users size={22} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight leading-none">Hisobchilar</h1>
            <p className="text-[13px] sm:text-sm text-slate-400 mt-1.5 font-medium">Tizimdagi barcha xodimlar va ularning ruxsatlari</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto flex-col sm:flex-row">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Ism yoki telefon qidiring..." 
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-[13px] focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white transition-all"
            />
          </div>
          <button 
            onClick={openAddModal}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white px-5 py-2.5 rounded-xl transition-all font-bold shadow-md shadow-indigo-600/20 whitespace-nowrap"
          >
            <Plus size={18} strokeWidth={2.5} />
            Qo'shish
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 flex items-center gap-3 font-medium text-sm">
          <ShieldCheck size={20} className="text-red-500 shrink-0" /> {error}
        </div>
      )}

      {/* JADVAL QISMI */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {loading && accountants.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">Yuklanmoqda...</p>
            </div>
          ) : (
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-6 py-4">Xodim (F.I.O / Telefon)</th>
                  <th className="px-6 py-4">Manzil</th>
                  <th className="px-6 py-4">Sana</th>
                  <th className="px-6 py-4">Holati</th>
                  <th className="px-6 py-4 text-right">Harakatlar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAccountants.length > 0 ? (
                  // FILTERLANGAN ARRAY ISHLATILYAPTI
                  filteredAccountants.map((acc) => (
                    <tr key={acc.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center font-bold text-xs border border-slate-200">
                            {getInitials(acc.fullName)}
                          </div>
                          <div>
                            <div className="font-bold text-slate-800 text-[15px]">{acc.fullName || "Noma'lum"}</div>
                            <div className="text-slate-400 text-xs mt-0.5 font-mono flex items-center gap-1.5">
                              <Phone size={11} /> {acc.phone}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-slate-500 max-w-[220px]" title={acc.address}>
                          <div className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-200 shrink-0">
                            <MapPin size={13} className="text-slate-400" />
                          </div>
                          <span className="truncate font-medium text-[13px]">{acc.address || "Ko'rsatilmagan"}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                         <div className="flex items-center gap-2 text-slate-500 font-medium text-[13px]">
                           <Calendar size={14} className="text-slate-400" />
                           {new Date(acc.createdAt).toLocaleDateString("ru-RU", { 
                            day: '2-digit', month: '2-digit', year: 'numeric' 
                           })}
                         </div>
                      </td>
                      <td className="px-6 py-4">
                        {renderStatusBadge(acc.status)}
                      </td>
                      <td className="px-6 py-4">
                        {/* TUGMALAR DOIM KO'RINIB TURADI */}
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => openEditModal(acc)}
                            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all border border-transparent hover:border-indigo-100"
                            title="Tahrirlash"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button 
                            onClick={() => handleDelete(acc.id)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-100"
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
                    <td colSpan="5" className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                        <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4 border border-slate-100 shadow-sm">
                          <User size={28} className="text-slate-300" />
                        </div>
                        <h3 className="text-[15px] font-bold text-slate-800 mb-1">Hisobchilar topilmadi</h3>
                        <p className="text-[13px] text-slate-400 font-medium text-center">
                          {searchQuery ? "Qidiruvingizga mos natija topilmadi." : "Hozircha tizimga hisobchi qo'shilmagan."}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* MODAL QISMI */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={closeModal}></div>
          
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-white">
              <div className="flex flex-col">
                <h2 className="text-lg font-bold text-slate-900">
                  {editingId ? "Tahrirlash" : "Yangi qo'shish"}
                </h2>
                {!editingId && (
                  <p className="text-[10px] text-indigo-600 font-bold mt-0.5 uppercase tracking-widest">
                    Qadam {modalStep} / 2
                  </p>
                )}
              </div>
              <button 
                onClick={closeModal}
                className="w-8 h-8 flex items-center justify-center bg-slate-50 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors border border-slate-200"
                disabled={isSubmitting}
              >
                <X size={16} strokeWidth={2.5} />
              </button>
            </div>
            
            <div className="p-6">
              {/* QADAM 1: TELEFON RAQAM */}
              {modalStep === 1 && (
                <form onSubmit={handleSendOtp} className="space-y-6">
                  <div className="text-center mb-6">
                    <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-indigo-100 shadow-sm">
                      <Phone size={24} />
                    </div>
                    <h3 className="text-slate-900 font-bold text-[17px]">Telefon raqam</h3>
                    <p className="text-[13px] text-slate-400 mt-1 font-medium">Tasdiqlash kodi yuboriladi</p>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-1.5 ml-1">Raqamni kiriting</label>
                    <div className="flex items-center border-2 border-slate-100 rounded-xl overflow-hidden focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10 bg-slate-50 transition-all">
                      <div className="px-4 py-3 bg-slate-100/50 text-slate-500 font-bold border-r-2 border-slate-100 text-[15px]">
                        +998
                      </div>
                      <input 
                        type="tel" 
                        name="phone"
                        required
                        value={formData.phone}
                        onChange={handlePhoneChange}
                        placeholder="90 123 45 67" 
                        className="w-full px-4 py-3 bg-transparent focus:outline-none text-[15px] font-bold tracking-wide placeholder-slate-300 text-slate-900"
                      />
                    </div>
                  </div>
                  
                  <button 
                    type="submit"
                    disabled={isSubmitting || formData.phone.replace(/\s+/g, "").length < 9}
                    className="w-full py-3.5 mt-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-xl font-bold text-[14px] uppercase tracking-widest transition-all shadow-md disabled:opacity-50 flex justify-center"
                  >
                    {isSubmitting ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Kodni olish"}
                  </button>
                </form>
              )}

              {/* QADAM 2: OTP */}
              {modalStep === 2 && (
                <form onSubmit={handleVerifyOtp} className="space-y-6 animate-in slide-in-from-right-4">
                  <div className="text-center mb-6">
                    <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-emerald-100 shadow-sm">
                      <ShieldCheck size={24} />
                    </div>
                    <h3 className="text-slate-900 font-bold text-[17px]">Kodni tasdiqlang</h3>
                    <p className="text-[13px] text-slate-400 mt-1 font-medium px-4">
                      <span className="font-bold text-slate-700">+998 {formData.phone}</span> raqamiga yuborilgan 4 xonali kod.
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
                      className="w-full px-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-xl focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 focus:bg-white text-center text-3xl font-black tracking-[1em] text-slate-900 transition-all placeholder:text-slate-200"
                    />
                  </div>
                  
                  <button 
                    type="submit"
                    disabled={isSubmitting || formData.otp.length !== 4}
                    className="w-full py-3.5 mt-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl font-bold text-[14px] uppercase tracking-widest transition-all shadow-md disabled:opacity-50 flex justify-center"
                  >
                    {isSubmitting ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Tasdiqlash"}
                  </button>

                  <div className="flex flex-col items-center gap-2 pt-4 border-t border-slate-100">
                    {timer > 0 ? (
                      <p className="text-[12px] text-slate-400 font-medium">
                        Qayta so'rash: <span className="text-indigo-600 font-bold">00:{timer < 10 ? `0${timer}` : timer}</span>
                      </p>
                    ) : (
                      <button 
                        type="button"
                        onClick={handleResendOtp}
                        disabled={isSubmitting}
                        className="text-[12px] text-indigo-600 hover:text-indigo-800 font-bold transition-colors"
                      >
                        Kodni qayta yuborish
                      </button>
                    )}

                    <button 
                      type="button"
                      onClick={() => setModalStep(1)}
                      className="text-[12px] text-slate-400 hover:text-slate-700 font-medium transition-colors"
                    >
                      Raqamni o'zgartirish
                    </button>
                  </div>
                </form>
              )}

              {/* QADAM 3: TAHRIRLASH */}
              {modalStep === 3 && (
                <form onSubmit={handleSubmitEditDetails} className="space-y-5 animate-in slide-in-from-right-4">
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-1.5 ml-1">F.I.O. (Ism va Familiya)</label>
                      <div className="relative group">
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={16} />
                        <input 
                          type="text" 
                          name="fullName"
                          required
                          value={formData.fullName}
                          onChange={handleChange}
                          placeholder="Sardor Rahimov" 
                          className="pl-10 w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl font-bold text-[14px] text-slate-900 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white transition-all placeholder:font-medium placeholder:text-slate-300"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-1.5 ml-1">Telefon raqami</label>
                      <div className="flex items-center border-2 border-slate-100 rounded-xl overflow-hidden focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10 bg-slate-50 transition-all">
                        <div className="px-3.5 py-3 bg-slate-100/50 text-slate-500 font-bold border-r-2 border-slate-100 text-[14px]">
                          +998
                        </div>
                        <input 
                          type="tel" 
                          name="phone"
                          required
                          value={formData.phone}
                          onChange={handlePhoneChange}
                          placeholder="90 123 45 67" 
                          className="w-full px-3.5 py-3 bg-transparent focus:outline-none tracking-wide font-bold text-[14px] text-slate-900"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-1.5 ml-1">Yashash manzili</label>
                      <div className="relative group">
                        <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={16} />
                        <input 
                          type="text" 
                          name="address"
                          required
                          value={formData.address}
                          onChange={handleChange}
                          placeholder="Viloyat, tuman..." 
                          className="pl-10 w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl font-bold text-[14px] text-slate-900 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white transition-all placeholder:font-medium placeholder:text-slate-300"
                        />
                      </div>
                    </div>

                    {/* STATUS */}
                    <div className="pt-2">
                      <label className="block text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-2 ml-1">Hisob holati</label>
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, status: "ACTIVE" })}
                          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-[13px] border-2 transition-all ${
                            formData.status === "ACTIVE" 
                              ? "bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm" 
                              : "bg-slate-50 border-slate-100 text-slate-400 hover:border-slate-300 hover:bg-slate-100"
                          }`}
                        >
                          <CheckCircle2 size={16} className={formData.status === "ACTIVE" ? "text-emerald-600" : "text-slate-400"} />
                          Faol
                        </button>

                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, status: "BLOCKED" })}
                          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-[13px] border-2 transition-all ${
                            formData.status === "BLOCKED" 
                              ? "bg-red-50 border-red-500 text-red-700 shadow-sm" 
                              : "bg-slate-50 border-slate-100 text-slate-400 hover:border-slate-300 hover:bg-slate-100"
                          }`}
                        >
                          <Ban size={16} className={formData.status === "BLOCKED" ? "text-red-600" : "text-slate-400"} />
                          Bloklangan
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="pt-5 mt-2 border-t border-slate-100 flex gap-3">
                    <button 
                      type="button"
                      onClick={closeModal}
                      disabled={isSubmitting}
                      className="flex-1 py-3 bg-white hover:bg-slate-50 text-slate-600 rounded-xl font-bold text-[13px] uppercase tracking-widest transition-colors border border-slate-200"
                    >
                      Bekor qilish
                    </button>
                    <button 
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-xl font-bold text-[13px] uppercase tracking-widest transition-all shadow-md flex justify-center items-center gap-2"
                    >
                      {isSubmitting && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                      Saqlash
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