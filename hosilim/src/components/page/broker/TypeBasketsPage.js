import React, { useState, useEffect, useMemo } from 'react';
import {
  Package, Plus, Edit3, Trash2, Save, X, AlertTriangle,
  Loader2, Search, RefreshCw, Layers, CheckCircle2
} from 'lucide-react';

// ==================== UTILITIES ====================
import API_BASE_URL from "../../../config";
const authToken = localStorage.getItem('authToken');

const messages = {
  uz: {
    requiredName: 'Nomi majburiy',
    minLengthName: 'Kamida 3 ta belgi',
    requiredMaterial: 'Material majburiy',
    requiredDimensions: 'O\'lchamlar majburiy',
    invalidDimensions: 'Noto‘g‘ri format. Format: NxNxN',
    invalidRange: 'Har bir o\'lcham 1 dan 99 gacha bo‘lishi kerak',
    requiredWeight: 'Og‘irlik 0 dan katta bo‘lishi kerak',
    fixErrors: 'Iltimos, barcha xatolarni tuzating',
    genericError: 'Xatolik yuz berdi',
    unauthorized: 'Sessiya tugadi, iltimos qayta kiring',
    noInternet: 'Internet aloqasi yo\'q',
    createdSuccess: 'Yangi savat turi qo\'shildi',
    updatedSuccess: 'Savat turi yangilandi',
    deletedSuccess: 'Savat turi o\'chirildi',
    deleteError: 'O\'chirishda xatolik',
    loadingError: 'Ma\'lumotlarni yuklashda xatolik',
    noBaskets: 'Sizga tegishli savat turlari topilmadi. Yangi savat turi qo\'shing.',
    noSearchResults: 'Qidiruv so\'ziga mos savat turi topilmadi.'
  }
};

const showToast = (message, type = 'success') => {
  const toast = document.createElement('div');
  const bgColor = {
    success: 'bg-green-600',
    error: 'bg-red-600',
    warning: 'bg-yellow-600',
    info: 'bg-blue-600'
  }[type];
  
  const icon = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ'
  }[type];
  
  toast.className = `fixed top-6 right-6 z-50 p-4 rounded-lg shadow-lg text-white ${bgColor} flex items-center gap-3 min-w-[300px]`;
  toast.style.animation = 'slideIn 0.3s ease-out';
  toast.innerHTML = `
    <span class="text-lg font-bold">${icon}</span>
    <span class="flex-1 font-medium">${message}</span>
  `;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.animation = 'slideOut 0.3s ease-out';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
};

// Auto-format dimensions: NxNxN without padding, limit to 1-2 digits per part
const formatDimensions = (value) => {
  const cleaned = value.replace(/[^0-9x]/g, '');
  
  if (!cleaned.includes('x')) {
    return cleaned.slice(0, 2); // Limit first part to 2 digits if no x
  }
  
  const parts = cleaned.split('x').slice(0, 3);
  const limited = parts.map(p => p.slice(0, 2));
  
  let result = limited[0];
  if (parts.length > 1) result += 'x' + limited[1];
  if (parts.length > 2) result += 'x' + limited[2];
  
  return result;
};

// Map enum values to display names
const mapMaterialToDisplay = (material) => {
  const materialMap = {
    PLASTIK: 'Plastik',
    YOGOCH: "Yog'och",
    METALL: 'Metall',
    KARTON: 'Karton',
    KOMPOZIT: 'Kompozit'
  };
  return materialMap[material] || material;
};

// ==================== API CLIENT ====================
const api = {
  async request(url, options = {}) {
    const config = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      ...options
    };
    try {
      const res = await fetch(url, config);
      if (res.status === 401) {
        showToast(messages.uz.unauthorized, 'error');
        setTimeout(() => window.location.href = '/login', 1000);
        throw new Error('401 Unauthorized');
      }
      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.message || `HTTP ${res.status}`);
      }
      return await res.json();
    } catch (error) {
      if (error.name === 'TypeError') {
        showToast(messages.uz.noInternet, 'error');
      }
      throw error;
    }
  },

  async getBasketTypes(page = 0, size = 20) {
    const response = await this.request(`${API_BASE_URL}/basket?page=${page}&size=${size}`);
    console.log('API Response:', response); // Debug uchun
    const apiData = response.data || response;
    return {
      data: apiData.content || apiData.data || [],
      totalPages: apiData.totalPages || apiData.data?.totalPages || 1,
      totalElements: apiData.totalElements || apiData.data?.totalElements || 0
    };
  },

  async createBasketType(data) {
    const response = await this.request(`${API_BASE_URL}/basket`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return response.data || response;
  },

  async updateBasketType(id, data) {
    const response = await this.request(`${API_BASE_URL}/basket/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
    return response.data || response;
  },

  async deleteBasketType(id) {
    await this.request(`${API_BASE_URL}/basket/${id}`, {
      method: 'DELETE'
    });
  }
};

// ==================== DELETE CONFIRM MODAL ====================
const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, itemName }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 bg-gray-900/70" onClick={onClose} aria-hidden="true" />
        <div className="relative w-full max-w-md bg-white rounded-lg shadow-lg">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-800">O‘chirishni tasdiqlash</h3>
          </div>
          <div className="p-4">
            <p className="text-sm text-gray-600">
              "{itemName}" savat turini o‘chirmoqchimisiz? Bu amalni qaytarib bo‘lmaydi.
            </p>
          </div>
          <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              aria-label="Bekor qilish"
            >
              Bekor qilish
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
              aria-label="O‘chirish"
            >
              O‘chirish
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==================== BASKET TYPE MODAL ====================
const BasketTypeModal = ({ isOpen, onClose, onSubmit, editData }) => {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    name: '',
    material: '',
    dimensions: '',
    weight: '',
    description: '',
    isActive: true
  });

  useEffect(() => {
    if (isOpen) {
      if (editData) {
        setFormData({
          name: editData.name || '',
          material: editData.material || '',
          dimensions: editData.dimensions || '',
          weight: editData.weight || '',
          description: editData.description || '',
          isActive: editData.isActive !== undefined ? editData.isActive : true
        });
      } else {
        setFormData({
          name: '',
          material: '',
          dimensions: '',
          weight: '',
          description: '',
          isActive: true
        });
      }
      setErrors({});
    }
  }, [isOpen, editData]);

  const validate = () => {
    const newErrors = {};
    if (!formData.name?.trim()) newErrors.name = messages.uz.requiredName;
    else if (formData.name.length < 3) newErrors.name = messages.uz.minLengthName;
    if (!formData.material?.trim()) newErrors.material = messages.uz.requiredMaterial;
    if (!formData.dimensions?.trim()) newErrors.dimensions = messages.uz.requiredDimensions;
    else {
      if (!/^\d{1,2}x\d{1,2}x\d{1,2}$/.test(formData.dimensions)) {
        newErrors.dimensions = messages.uz.invalidDimensions;
      } else {
        const parts = formData.dimensions.split('x').map(Number);
        if (parts.some(isNaN) || parts.some(p => p < 1 || p > 99)) {
          newErrors.dimensions = messages.uz.invalidRange;
        }
      }
    }
    if (!formData.weight || formData.weight <= 0) newErrors.weight = messages.uz.requiredWeight;
    return newErrors;
  };

  const handleSubmit = async () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      showToast(messages.uz.fixErrors, 'warning');
      return;
    }
    setLoading(true);
    try {
      await onSubmit(formData);
      showToast(editData ? messages.uz.updatedSuccess : messages.uz.createdSuccess, 'success');
      onClose();
    } catch (err) {
      showToast(err.message || messages.uz.genericError, 'error');
      setErrors({ submit: err.message || messages.uz.genericError });
    } finally {
      setLoading(false);
    }
  };

  const handleDimensionsChange = (e) => {
    const formatted = formatDimensions(e.target.value);
    setFormData({ ...formData, dimensions: formatted });
    if (errors.dimensions) setErrors({ ...errors, dimensions: '' });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 bg-gray-900/70" onClick={onClose} aria-hidden="true" />
        <div className="relative w-full max-w-2xl bg-white rounded-lg shadow-lg">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-medium text-gray-800">
                  {editData ? 'Savat Turini Tahrirlash' : 'Yangi Savat Turi'}
                </h3>
              </div>
              <button
                onClick={onClose}
                disabled={loading}
                className="p-2 hover:bg-gray-100 rounded-lg"
                aria-label="Yopish"
              >
                <X className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>
          <div className="p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Savat Nomi <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.name ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Masalan, Kichik Plastik Yashik"
                value={formData.name}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value });
                  if (errors.name) setErrors({ ...errors, name: '' });
                }}
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? 'name-error' : undefined}
              />
              {errors.name && (
                <p id="name-error" className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4" />
                  {errors.name}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Material <span className="text-red-500">*</span>
              </label>
              <select
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.material ? 'border-red-300' : 'border-gray-300'
                }`}
                value={formData.material}
                onChange={(e) => {
                  setFormData({ ...formData, material: e.target.value });
                  if (errors.material) setErrors({ ...errors, material: '' });
                }}
                aria-invalid={!!errors.material}
                aria-describedby={errors.material ? 'material-error' : undefined}
              >
                <option value="">Tanlang</option>
                <option value="PLASTIK">Plastik</option>
                <option value="YOGOCH">Yog'och</option>
                <option value="METALL">Metall</option>
                <option value="KARTON">Karton</option>
                <option value="KOMPOZIT">Kompozit</option>
              </select>
              {errors.material && (
                <p id="material-error" className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4" />
                  {errors.material}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                O'lcham (sm) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className={`w-full px-3 py-2 border rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.dimensions ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="40x30x20"
                value={formData.dimensions}
                onChange={handleDimensionsChange}
                maxLength={8}
                aria-invalid={!!errors.dimensions}
                aria-describedby={errors.dimensions ? 'dimensions-error' : undefined}
              />
              {errors.dimensions && (
                <p id="dimensions-error" className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4" />
                  {errors.dimensions}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">Format: NxNxN (N=1-99)</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Og‘irlik (g) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="1"
                  min="0"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.weight ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="1500"
                  value={formData.weight}
                  onChange={(e) => {
                    setFormData({ ...formData, weight: parseInt(e.target.value) || '' });
                    if (errors.weight) setErrors({ ...errors, weight: '' });
                  }}
                  aria-invalid={!!errors.weight}
                  aria-describedby={errors.weight ? 'weight-error' : undefined}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">g</span>
              </div>
              {errors.weight && (
                <p id="weight-error" className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4" />
                  {errors.weight}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tavsif</label>
              <textarea
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="Qo'shimcha ma'lumotlar va tavsif..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                maxLength={200}
                aria-describedby="description-count"
              />
              <p id="description-count" className="mt-1 text-xs text-gray-500">{formData.description?.length || 0} / 200 belgi</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
              <label className="flex items-center justify-between cursor-pointer">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className={`w-5 h-5 ${formData.isActive ? 'text-green-600' : 'text-gray-400'}`} />
                  <div>
                    <p className="font-medium text-gray-800">Faol Holat</p>
                    <p className="text-sm text-gray-500">Savat turini ishlatish mumkinligi</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                  aria-label="Faol holatni yoqish/yopish"
                />
              </label>
            </div>
            {errors.submit && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4" />
                  {errors.submit}
                </p>
              </div>
            )}
          </div>
          <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-2">
            <button
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              aria-label="Bekor qilish"
            >
              Bekor qilish
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2"
              aria-label={editData ? 'Yangilash' : 'Saqlash'}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saqlanmoqda...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {editData ? 'Yangilash' : 'Saqlash'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==================== MAIN COMPONENT ====================
export default function BasketTypesManagement() {
  const [basketTypes, setBasketTypes] = useState([]);
  const [filteredTypes, setFilteredTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingType, setEditingType] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState(null);
  const [deleteItemName, setDeleteItemName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadBasketTypes();
  }, [page]);

  const filteredTypesMemo = useMemo(() => {
    if (!searchQuery) return basketTypes;
    return basketTypes.filter(
      (type) =>
        type.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        mapMaterialToDisplay(type.material)?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [basketTypes, searchQuery]);

  useEffect(() => {
    setFilteredTypes(filteredTypesMemo);
  }, [filteredTypesMemo]);

  const loadBasketTypes = async () => {
    setLoading(true);
    try {
      const { data, totalPages, totalElements } = await api.getBasketTypes(page);
      console.log('Loaded basket types:', { data, totalPages, totalElements }); // Debug uchun
      const validData = (data || []).map(item => ({
        ...item,
        material: Object.values({
          PLASTIK: 'PLASTIK',
          YOGOCH: 'YOGOCH',
          METALL: 'METALL',
          KARTON: 'KARTON',
          KOMPOZIT: 'KOMPOZIT'
        }).includes(item.material) ? item.material : 'UNKNOWN'
      }));
      setBasketTypes(validData);
      setTotalPages(totalPages || 1);
      if (validData.length === 0 && page === 0) {
        showToast(messages.uz.noBaskets, 'info');
      }
    } catch (error) {
      console.error('Basket yuklashda xatolik:', error);
      showToast(error.message === 'HTTP 404' ? messages.uz.noBaskets : messages.uz.loadingError, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (data) => {
    try {
      const newType = await api.createBasketType(data);
      setBasketTypes([...basketTypes, newType]);
      setPage(0); // Yangi qo'shilganda birinchi sahifaga qaytish
      showToast(messages.uz.createdSuccess, 'success');
    } catch (error) {
      console.error('Create error:', error);
      throw error;
    }
  };

  const handleUpdate = async (data) => {
    try {
      const updated = await api.updateBasketType(editingType.id, data);
      setBasketTypes(basketTypes.map((t) => (t.id === editingType.id ? updated : t)));
      setEditingType(null);
      showToast(messages.uz.updatedSuccess, 'success');
    } catch (error) {
      console.error('Update error:', error);
      throw error;
    }
  };

  const handleDelete = (id) => {
    const item = basketTypes.find((t) => t.id === id);
    setDeleteItemId(id);
    setDeleteItemName(item?.name || 'Noma\'lum');
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await api.deleteBasketType(deleteItemId);
      setBasketTypes(basketTypes.filter((t) => t.id !== deleteItemId));
      showToast(messages.uz.deletedSuccess, 'success');
    } catch (error) {
      console.error('Delete error:', error);
      showToast(messages.uz.deleteError, 'error');
    } finally {
      setIsDeleteModalOpen(false);
      setDeleteItemId(null);
      setDeleteItemName('');
    }
  };

  const activeCount = basketTypes.filter((t) => t.isActive).length;
  const inactiveCount = basketTypes.filter((t) => !t.isActive).length;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(100%); opacity: 0; }
        }
      `}</style>

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-gray-800">Savat Turlarini Boshqarish</h1>
              <p className="text-sm text-gray-500 mt-1">Professional savat turlari boshqaruv tizimi</p>
            </div>
            <button
              onClick={() => {
                setEditingType(null);
                setIsModalOpen(true);
              }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center gap-2"
              aria-label="Yangi tur qo'shish"
            >
              <Plus className="w-4 h-4" />
              Yangi Tur Qo'shish
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center gap-3">
              <Layers className="w-6 h-6 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Jami Turlar</p>
                <p className="text-2xl font-semibold text-gray-800">{basketTypes.length}</p>
              </div>
            </div>
          </div>
          <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Faol Turlar</p>
                <p className="text-2xl font-semibold text-green-600">{activeCount}</p>
              </div>
            </div>
          </div>
          <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center gap-3">
              <Package className="w-6 h-6 text-gray-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Nofaol Turlar</p>
                <p className="text-2xl font-semibold text-gray-600">{inactiveCount}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Nom yoki material bo'yicha qidirish..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Qidiruv"
              />
            </div>
            <button
              onClick={loadBasketTypes}
              disabled={loading}
              className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
              aria-label="Yangilash"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
          <p className="mt-2 text-sm text-gray-500">{filteredTypes.length} ta natija topildi</p>
        </div>

        {/* Pagination Controls */}
        <div className="flex justify-between mb-4">
          <button
            onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
            disabled={page === 0 || loading}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg disabled:opacity-50"
            aria-label="Oldingi sahifa"
          >
            Oldingi
          </button>
          <span className="text-sm text-gray-600">
            Sahifa {page + 1} / {totalPages}
          </span>
          <button
            onClick={() => setPage((prev) => Math.min(prev + 1, totalPages - 1))}
            disabled={page >= totalPages - 1 || loading}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg disabled:opacity-50"
            aria-label="Keyingi sahifa"
          >
            Keyingi
          </button>
        </div>

        {/* Table */}
        <div className="relative">
          {loading && (
            <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
          )}
          {filteredTypes.length === 0 && !loading ? (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <Package className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-800 mb-2">
                {basketTypes.length === 0 ? 'Hech qanday savat turi yo\'q' : messages.uz.noSearchResults}
              </h3>
              <p className="text-gray-500 mb-4">
                {basketTypes.length === 0
                  ? messages.uz.noBaskets
                  : messages.uz.noSearchResults}
              </p>
              {basketTypes.length === 0 && (
                <button
                  onClick={() => {
                    setEditingType(null);
                    setIsModalOpen(true);
                  }}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center gap-2 mx-auto"
                >
                  <Plus className="w-4 h-4" />
                  Birinchi savat turini qo‘shish
                </button>
              )}
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="mt-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                  aria-label="Qidiruvni tozalash"
                >
                  Qidiruvni tozalash
                </button>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">ID</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">Savat Nomi</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">Material</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">O'lcham</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">Og‘irlik</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">Holat</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-600">Amallar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredTypes.map((type) => (
                    <tr key={type.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-600">#{type.id}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Package className="w-5 h-5 text-blue-600" />
                          <div>
                            <p className="font-medium text-gray-800">{type.name}</p>
                            {type.description && (
                              <p className="text-sm text-gray-500">{type.description}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{mapMaterialToDisplay(type.material)}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 font-mono">{type.dimensions} sm</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{type.weight} g</td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            type.isActive ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {type.isActive ? 'Faol' : 'Nofaol'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setEditingType(type);
                              setIsModalOpen(true);
                            }}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                            title="Tahrirlash"
                            aria-label="Tahrirlash"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(type.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                            title="O'chirish"
                            aria-label="O'chirish"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <BasketTypeModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingType(null);
          }}
          onSubmit={editingType ? handleUpdate : handleCreate}
          editData={editingType}
        />
        <DeleteConfirmModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={confirmDelete}
          itemName={deleteItemName}
        />
      </div>
    </div>
  );
}