import React, { useState, useEffect } from "react";
import { Plus, Search, Edit2, Trash2, X, User, Phone, MapPin, ShieldCheck, CheckCircle2, Ban } from "lucide-react";
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
    phone: "", // Faqat 9 xonali qismi saqlanadi
    otp: "",
    fullName: "",
    address: "",
    brokerId: "", 
    status: "ACTIVE" // Yangi status maydoni
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
    // Backenddan kelgan raqamdan +998 ni olib tashlab formatlaymiz
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
        alert("Hisobchi ma'lumotlari muvaffaqiyatli yangilandi!");
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

  if (loading && accountants.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* HEADER QISMI */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hisobchilar</h1>
          <p className="text-gray-500 text-sm mt-1">Tizimdagi barcha hisobchilar ro'yxati</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Qidirish..." 
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64 transition-all"
            />
          </div>
          <button 
            onClick={openAddModal}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors font-medium shadow-sm whitespace-nowrap"
          >
            <Plus size={18} />
            <span className="hidden sm:inline">Yangi qo'shish</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-lg border border-red-100 flex items-center gap-2">
          <ShieldCheck size={20} /> {error}
        </div>
      )}

      {/* JADVAL QISMI */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50/80 text-gray-700 font-medium border-b border-gray-200">
              <tr>
                <th className="px-6 py-4">F.I.O. va Telefon</th>
                <th className="px-6 py-4">Manzil</th>
                <th className="px-6 py-4">Qo'shilgan sana</th>
                <th className="px-6 py-4">Holati</th>
                <th className="px-6 py-4 text-right">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {accountants.length > 0 ? (
                accountants.map((acc) => (
                  <tr key={acc.id} className="hover:bg-blue-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-100 to-blue-50 text-blue-600 flex items-center justify-center font-bold shadow-inner">
                          {getInitials(acc.fullName)}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{acc.fullName || "Noma'lum"}</div>
                          <div className="text-gray-500 text-xs mt-0.5">{acc.phone}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-gray-600 max-w-[200px] truncate" title={acc.address}>
                        <MapPin size={16} className="text-gray-400 flex-shrink-0" />
                        <span className="truncate">{acc.address || "-"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {new Date(acc.createdAt).toLocaleDateString("ru-RU", { 
                        day: '2-digit', month: '2-digit', year: 'numeric' 
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 inline-flex items-center gap-1.5 rounded-full text-xs font-medium border ${
                        acc.status === 'ACTIVE' 
                          ? 'bg-green-50 text-green-700 border-green-200' 
                          : 'bg-red-50 text-red-700 border-red-200'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${acc.status === 'ACTIVE' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                        <span className={`w-1.5 h-1.5 rounded-full ${acc.status === 'INACTIVE' ? 'bg-yellow-500' : 'bg-yellow-500'}`}></span>
                        {acc.status === 'ACTIVE' ? 'Faol' : 'Nomalum'}
                        {acc.status === 'INACTIVE' ? 'Faol emas' : 'Nomalum'}
                      </span>
                      
                      
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button 
                          onClick={() => openEditModal(acc)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(acc.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-16 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                        <User size={32} className="text-gray-400" />
                      </div>
                      <p className="text-base font-medium text-gray-900">Hisobchilar topilmadi</p>
                      <p className="text-sm mt-1">Hozircha tizimga hech qanday hisobchi qo'shilmagan.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL QISMI */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <div className="flex flex-col">
                <h2 className="text-lg font-bold text-gray-900">
                  {editingId ? "Hisobchini tahrirlash" : "Yangi hisobchi qo'shish"}
                </h2>
                {!editingId && (
                  <p className="text-xs text-gray-500 font-medium mt-0.5">
                    Qadam {modalStep} / 2
                  </p>
                )}
              </div>
              <button 
                onClick={closeModal}
                className="p-2 -mr-2 text-gray-400 hover:text-gray-700 hover:bg-gray-200 rounded-full transition-colors"
                disabled={isSubmitting}
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6">
              {/* QADAM 1: TELEFON RAQAM */}
              {modalStep === 1 && (
                <form onSubmit={handleSendOtp} className="space-y-5">
                  <div className="text-center mb-6">
                    <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Phone size={24} />
                    </div>
                    <h3 className="text-gray-900 font-medium">Telefon raqamni kiriting</h3>
                    <p className="text-sm text-gray-500 mt-1">Ushbu raqamga tasdiqlash kodi yuboriladi</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Telefon raqam</label>
                    <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 bg-gray-50 transition-shadow">
                      <div className="px-4 py-3 bg-gray-100 text-gray-600 font-medium border-r border-gray-200">
                        +998
                      </div>
                      <input 
                        type="tel" 
                        name="phone"
                        required
                        value={formData.phone}
                        onChange={handlePhoneChange}
                        placeholder="90 123 45 67" 
                        className="w-full px-4 py-3 bg-transparent focus:outline-none text-lg tracking-wide placeholder-gray-300"
                      />
                    </div>
                  </div>
                  
                  <button 
                    type="submit"
                    disabled={isSubmitting || formData.phone.replace(/\s+/g, "").length < 9}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors disabled:opacity-70 flex justify-center"
                  >
                    {isSubmitting ? "Yuborilmoqda..." : "Kodni olish"}
                  </button>
                </form>
              )}

              {/* QADAM 2: OTP */}
              {modalStep === 2 && (
                <form onSubmit={handleVerifyOtp} className="space-y-5 animate-in slide-in-from-right-4">
                  <div className="text-center mb-6">
                    <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                      <ShieldCheck size={24} />
                    </div>
                    <h3 className="text-gray-900 font-medium">Kodni tasdiqlang</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      +998 {formData.phone} raqamiga yuborilgan 4 xonali kodni kiriting.
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
                      placeholder="• • • •" 
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white text-center text-2xl tracking-[1em]"
                    />
                  </div>
                  
                  <button 
                    type="submit"
                    disabled={isSubmitting || formData.otp.length !== 4}
                    className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition-colors disabled:opacity-70 flex justify-center"
                  >
                    {isSubmitting ? "Tekshirilmoqda..." : "Tasdiqlash va Qo'shish"}
                  </button>

                  <div className="flex flex-col items-center gap-2 pt-2">
                    {timer > 0 ? (
                      <p className="text-sm text-gray-500 font-medium">
                        Kodni qayta so'rash: <span className="text-blue-600">00:{timer < 10 ? `0${timer}` : timer}</span>
                      </p>
                    ) : (
                      <button 
                        type="button"
                        onClick={handleResendOtp}
                        disabled={isSubmitting}
                        className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
                      >
                        Kodni qayta yuborish
                      </button>
                    )}

                    <button 
                      type="button"
                      onClick={() => setModalStep(1)}
                      className="w-full py-2 mt-2 text-gray-500 hover:text-gray-800 text-sm font-medium"
                    >
                      Raqamni o'zgartirish
                    </button>
                  </div>
                </form>
              )}

              {/* QADAM 3: TAHRIRLASH */}
              {modalStep === 3 && (
                <form onSubmit={handleSubmitEditDetails} className="space-y-5 animate-in slide-in-from-right-4">
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="col-span-1 sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">F.I.O. (Ism va Familiya)</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input 
                          type="text" 
                          name="fullName"
                          required
                          value={formData.fullName}
                          onChange={handleChange}
                          placeholder="Masalan: Sardor Rahimov" 
                          className="pl-10 w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                        />
                      </div>
                    </div>

                    <div className="col-span-1 sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Telefon raqami (Tahrirlash mumkin)</label>
                      <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 bg-gray-50 transition-shadow">
                        <div className="px-4 py-2.5 bg-gray-100 text-gray-600 font-medium border-r border-gray-200">
                          +998
                        </div>
                        <input 
                          type="tel" 
                          name="phone"
                          required
                          value={formData.phone}
                          onChange={handlePhoneChange}
                          placeholder="90 123 45 67" 
                          className="w-full px-3 py-2.5 bg-transparent focus:outline-none tracking-wide"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Yashash manzili</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input 
                        type="text" 
                        name="address"
                        required
                        value={formData.address}
                        onChange={handleChange}
                        placeholder="Viloyat, tuman, ko'cha..." 
                        className="pl-10 w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                      />
                    </div>
                  </div>

                  {/* STATUS TANLASH (ZAMONAVIY TOGGLE) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Hisob holati</label>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, status: "ACTIVE" })}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-medium border-2 transition-all ${
                          formData.status === "ACTIVE" 
                            ? "bg-green-50 border-green-500 text-green-700 shadow-sm" 
                            : "bg-white border-gray-200 text-gray-500 hover:border-green-200"
                        }`}
                      >
                        <CheckCircle2 size={18} className={formData.status === "ACTIVE" ? "text-green-600" : "text-gray-400"} />
                        Faol (Active)
                      </button>

                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, status: "BLOCKED" })}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-medium border-2 transition-all ${
                          formData.status === "BLOCKED" 
                            ? "bg-red-50 border-red-500 text-red-700 shadow-sm" 
                            : "bg-white border-gray-200 text-gray-500 hover:border-red-200"
                        }`}
                      >
                        <Ban size={18} className={formData.status === "BLOCKED" ? "text-red-600" : "text-gray-400"} />
                        Bloklangan
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 mt-6 pt-5 border-t border-gray-100">
                    <button 
                      type="button"
                      onClick={closeModal}
                      disabled={isSubmitting}
                      className="px-5 py-2.5 text-gray-600 hover:bg-gray-100 rounded-xl font-medium transition-colors"
                    >
                      Bekor qilish
                    </button>
                    <button 
                      type="submit"
                      disabled={isSubmitting}
                      className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors flex items-center gap-2"
                    >
                      {isSubmitting && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
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