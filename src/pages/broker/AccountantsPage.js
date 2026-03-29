import React, { useState, useEffect } from "react";
import { Plus, Search, Edit2, Trash2, X, User, Briefcase } from "lucide-react";
import { accountantService } from "../../services/accountantService";

export default function AccountantsPage() {
  // --- Holatlar (States) ---
  const [accountants, setAccountants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal boshqaruvi
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null); // Null bo'lsa 'Yaratish', raqam bo'lsa 'Tahrirlash'

  // Forma malumotlari (Backend'dagi AccountantRequest ga moslangan)
  const [formData, setFormData] = useState({
    userId: "",
    brokerId: "", // Agar joriy foydalanuvchi Admin bo'lsa kerak bo'ladi
  });

  // --- Ma'lumotlarni yuklash ---
  const fetchAccountants = async () => {
    try {
      setLoading(true);
      // Pagination bilan olish (masalan 1-sahifa, 100 ta qator)
      const data = await accountantService.getAll(0, 100);
      
      // Agar backend Pageable yuborsa, array content ichida bo'ladi
      const items = data.content ? data.content : Array.isArray(data) ? data : [];
      setAccountants(items);
      setError(null);
    } catch (err) {
      console.error("Yuklashda xatolik:", err);
      setError("Ma'lumotlarni yuklashda xatolik yuz berdi.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccountants();
  }, []);

  // --- Forma eventlari ---
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const openAddModal = () => {
    setEditingId(null);
    setFormData({ userId: "", brokerId: "" });
    setIsModalOpen(true);
  };

  const openEditModal = (acc) => {
    setEditingId(acc.id);
    setFormData({ 
        userId: acc.userId || "", 
        brokerId: acc.brokerId || "" 
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (isSubmitting) return;
    setIsModalOpen(false);
    setEditingId(null);
  };

  // --- Saqlash (Yaratish va Tahrirlash) ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);

      const payload = {
        userId: Number(formData.userId),
        brokerId: formData.brokerId ? Number(formData.brokerId) : null,
      };

      if (editingId) {
        // Tahrirlash rejimida
        await accountantService.update(editingId, payload);
        alert("Hisobchi muvaffaqiyatli yangilandi!");
      } else {
        // Yaratish rejimida
        await accountantService.create(payload);
        alert("Hisobchi muvaffaqiyatli qo'shildi!");
      }

      closeModal();
      fetchAccountants(); 
    } catch (err) {
      alert("Xatolik: " + (err.response?.data?.message || "Serverga ulanishda xatolik yuz berdi"));
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- O'chirish ---
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

  // --- UI Render ---
  if (loading && accountants.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* --- Yuqori qism --- */}
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
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64"
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
        <div className="p-4 bg-red-50 text-red-600 rounded-lg border border-red-100">
          {error}
        </div>
      )}

      {/* --- Jadval --- */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-gray-700 font-medium border-b border-gray-200">
              <tr>
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">User ID</th>
                <th className="px-6 py-4">Broker ID</th>
                <th className="px-6 py-4">Holati</th>
                <th className="px-6 py-4 text-right">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {accountants.length > 0 ? (
                accountants.map((acc) => (
                  <tr key={acc.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-gray-500">#{acc.id}</td>
                    <td className="px-6 py-4 font-medium text-gray-900">{acc.userId}</td>
                    <td className="px-6 py-4">{acc.brokerId}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        acc.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {acc.status || "ACTIVE"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => openEditModal(acc)}
                          title="Tahrirlash"
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(acc.id)}
                          title="O'chirish"
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
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <User size={48} className="text-gray-300 mb-3" />
                      <p className="text-base font-medium text-gray-900">Hisobchilar topilmadi</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- Modal (Add & Edit) --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">
                {editingId ? "Hisobchini tahrirlash" : "Yangi hisobchi qo'shish"}
              </h2>
              <button 
                onClick={closeModal}
                className="p-2 -mr-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full"
                disabled={isSubmitting}
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Foydalanuvchi (User) ID</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    type="number" 
                    name="userId"
                    required
                    value={formData.userId}
                    onChange={handleChange}
                    placeholder="Masalan: 105" 
                    className="pl-10 w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Broker ID (Ixtiyoriy/Admin uchun)</label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    type="number" 
                    name="brokerId"
                    value={formData.brokerId}
                    onChange={handleChange}
                    placeholder="Masalan: 2" 
                    className="pl-10 w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 mt-8 pt-4 border-t border-gray-100">
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
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors disabled:bg-blue-400 flex items-center gap-2"
                >
                  {isSubmitting && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                  {isSubmitting ? "Saqlanmoqda..." : "Saqlash"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}