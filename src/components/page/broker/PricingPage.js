import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  Plus, Save, X, Edit3, Trash2, Search, ArrowUpDown, CheckCircle2, 
  CircleAlert, Loader2, ChevronLeft, ChevronRight, TrendingUp, TrendingDown,
  DollarSign, Package, AlertTriangle, RefreshCw, Download, Filter,
  Eye, Copy, FileText, BarChart3, Calendar, Clock
} from 'lucide-react';

import API_BASE_URL from '../../../config';

// ==================== UTILITIES ====================
const getToken = () => localStorage.getItem('authToken') || '';

const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return '0';
  return new Intl.NumberFormat('uz-UZ', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(Math.round(Number(amount)));
};

const formatDate = (dateString) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('uz-UZ', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const formatRelativeTime = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  const now = new Date();
  const diffInMinutes = Math.floor((now - date) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'Hozir';
  if (diffInMinutes < 60) return `${diffInMinutes} daqiqa oldin`;
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} soat oldin`;
  if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)} kun oldin`;
  return formatDate(dateString);
};

// Toast Notification System
const showToast = (message, type = 'success') => {
  const toast = document.createElement('div');
  const bgColor = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    warning: 'bg-yellow-500',
    info: 'bg-blue-500'
  }[type] || 'bg-gray-500';
  
  const icon = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ'
  }[type] || '•';
  
  toast.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg text-white ${bgColor} animate-slide-in flex items-center gap-3 min-w-[300px]`;
  toast.innerHTML = `
    <span class="text-xl font-bold">${icon}</span>
    <span class="flex-1">${message}</span>
  `;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.animation = 'slide-out 0.3s ease-out';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
};

// ==================== API CLIENT ====================
const PRICING_URL = `${API_BASE_URL}/pricing`;

const api = {
  async request(url, options = {}) {
    const token = getToken();
    const config = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      ...options
    };

    try {
      const res = await fetch(url, config);
      
      if (res.status === 401) {
        showToast('Avtorizatsiya xatosi - qayta kiring', 'error');
        throw new Error('401 Unauthorized');
      }
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        const errorMessage = errorData?.message || `HTTP ${res.status} ${res.statusText}`;
        throw new Error(errorMessage);
      }
      
      return await res.json();
    } catch (error) {
      console.error('API Request Error:', error);
      throw error;
    }
  },

  async list({ page = 0, size = 10, sort = 'productCreatedDate', dir = 'desc', q = '' } = {}) {
    const url = new URL(PRICING_URL);
    url.searchParams.set('page', page);
    url.searchParams.set('size', size);
    url.searchParams.set('sort', `${sort},${dir}`);
    if (q) url.searchParams.set('q', q);

    const payload = await this.request(url.toString());
    const data = payload.data ?? payload;
    
    return {
      content: (data.content || []).map(item => ({
        id: item.id,
        productName: item.productName || '',
        productDescription: item.productDescription || '',
        productPrice: item.productPrice || 0,
        productUnit: item.productUnit || "so'm/kg",
        active: item.active !== undefined ? item.active : true,
        productCreatedDate: item.productCreatedDate || item.createdAt,
        productUpdatedDate: item.productUpdatedDate || item.updatedAt || null
      })),
      totalPages: data.totalPages ?? 1,
      totalElements: data.totalElements ?? 0,
      size: data.size ?? size,
      number: data.number ?? page
    };
  },

  async create(item) {
    const payload = await this.request(PRICING_URL, {
      method: 'POST',
      body: JSON.stringify({
        productName: item.productName,
        productDescription: item.productDescription,
        productPrice: Number(item.productPrice),
        productUnit: item.productUnit,
        active: item.active
      })
    });
    return payload.data ?? payload;
  },

  async update(id, patch) {
    const payload = await this.request(`${API_BASE_URL}/pricing/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        productName: patch.productName,
        productDescription: patch.productDescription,
        productPrice: Number(patch.productPrice),
        productUnit: patch.productUnit,
        active: patch.active
      })
    });
    return payload.data ?? payload;
  },

  async remove(id) {
    await this.request(`${PRICING_URL}/${id}`, { method: 'DELETE' });
    return true;
  }
};

// ==================== STATISTICS CARD ====================
const StatCard = ({ icon: Icon, label, value, trend, trendValue, color = 'blue' }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600'
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {trend && (
            <div className={`flex items-center gap-1 mt-2 text-sm font-medium ${
              trend === 'up' ? 'text-green-600' : 'text-red-600'
            }`}>
              {trend === 'up' ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              <span>{trendValue}</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-xl ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};

// ==================== MODAL COMPONENT ====================
const PriceModal = ({ isOpen, onClose, onSubmit, initialData, isEdit = false }) => {
  const [form, setForm] = useState({
    productName: '',
    productDescription: '',
    productPrice: '',
    productUnit: "so'm/kg",
    active: true
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setForm({
        productName: initialData?.productName || '',
        productDescription: initialData?.productDescription || '',
        productPrice: initialData?.productPrice ?? '',
        productUnit: initialData?.productUnit || "so'm/kg",
        active: initialData?.active !== undefined ? initialData.active : true
      });
      setErrors({});
    }
  }, [isOpen, initialData]);

  const validate = () => {
    const newErrors = {};
    
    if (!form.productName?.trim()) {
      newErrors.productName = 'Mahsulot nomi majburiy maydon';
    } else if (form.productName.trim().length < 2) {
      newErrors.productName = 'Mahsulot nomi kamida 2 ta belgidan iborat bo\'lishi kerak';
    }
    
    if (!form.productDescription?.trim()) {
      newErrors.productDescription = 'Mahsulot tavsifi majburiy maydon';
    } else if (form.productDescription.trim().length < 2) {
      newErrors.productDescription = 'Mahsulot tavsifi kamida 2 ta belgidan iborat bo\'lishi kerak';
    }
    
    const priceNum = Number(form.productPrice);
    if (!form.productPrice || isNaN(priceNum) || priceNum <= 0) {
      newErrors.productPrice = 'Narx 0 dan katta bo\'lishi kerak';
    } else if (priceNum > 1000000000) {
      newErrors.productPrice = 'Narx juda katta qiymat';
    }
    
    if (!form.productUnit?.trim()) {
      newErrors.productUnit = 'Birlik majburiy';
    }
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        productName: form.productName.trim(),
        productDescription: form.productDescription.trim(),
        productPrice: Number(form.productPrice),
        productUnit: form.productUnit.trim(),
        active: !!form.active
      });
      onClose();
      showToast(isEdit ? 'Narx muvaffaqiyatli yangilandi' : 'Yangi narx muvaffaqiyatli qo\'shildi', 'success');
    } catch (err) {
      showToast(err.message || 'Xatolik yuz berdi', 'error');
      setErrors({ submit: err.message });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-900 bg-opacity-75 backdrop-blur-sm" onClick={onClose} />
        
        <div className="relative inline-block w-full max-w-lg p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-2xl rounded-2xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">
                {isEdit ? 'Narxni Tahrirlash' : 'Yangi Narx Qo\'shish'}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {isEdit ? 'Mavjud narx ma\'lumotlarini yangilang' : 'Yangi meva narxini tizimga kiriting'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Mahsulot Nomi <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className={`w-full px-4 py-3 rounded-lg border ${
                  errors.productName ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                } focus:ring-2 focus:outline-none transition-all`}
                placeholder="Masalan: Shaftoli, Olma, Nok..."
                value={form.productName}
                onChange={(e) => {
                  setForm(p => ({ ...p, productName: e.target.value }));
                  if (errors.productName) setErrors(e => ({ ...e, productName: '' }));
                }}
              />
              {errors.productName && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  {errors.productName}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Mahsulot Tavsifi <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={3}
                className={`w-full px-4 py-3 rounded-lg border ${
                  errors.productDescription ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                } focus:ring-2 focus:outline-none transition-all resize-none`}
                placeholder="Masalan: Lola, Golden, Prezident, Premium sifat..."
                value={form.productDescription}
                onChange={(e) => {
                  setForm(p => ({ ...p, productDescription: e.target.value }));
                  if (errors.productDescription) setErrors(e => ({ ...e, productDescription: '' }));
                }}
              />
              {errors.productDescription && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  {errors.productDescription}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Narx <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    min={0}
                    step={100}
                    className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
                      errors.productPrice ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                    } focus:ring-2 focus:outline-none transition-all`}
                    placeholder="5500"
                    value={form.productPrice}
                    onChange={(e) => {
                      setForm(p => ({ ...p, productPrice: e.target.value }));
                      if (errors.productPrice) setErrors(e => ({ ...e, productPrice: '' }));
                    }}
                  />
                </div>
                {errors.productPrice && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    {errors.productPrice}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Birlik <span className="text-red-500">*</span>
                </label>
                <select
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                  value={form.productUnit}
                  onChange={(e) => setForm(p => ({ ...p, productUnit: e.target.value }))}
                >
                  <option value="so'm/kg">so'm/kg</option>
                  <option value="so'm/dona">so'm/dona</option>
                  <option value="so'm/quti">so'm/quti</option>
                  <option value="so'm/litr">so'm/litr</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <input
                type="checkbox"
                id="active"
                className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                checked={form.active}
                onChange={(e) => setForm(p => ({ ...p, active: e.target.checked }))}
              />
              <label htmlFor="active" className="flex-1">
                <span className="block text-sm font-medium text-gray-900">Faol holat</span>
                <span className="text-xs text-gray-600">
                  {form.active ? 'Narx foydalanuvchilarga ko\'rinadi' : 'Narx vaqtincha yashirilgan'}
                </span>
              </label>
            </div>

            {errors.submit && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  {errors.submit}
                </p>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Bekor qilish
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saqlanmoqda...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    {isEdit ? 'Yangilash' : 'Qo\'shish'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// ==================== TABLE ROW ====================
const PriceRow = ({ row, onEdit, onDelete, onView }) => {
  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
            {row.productName?.charAt(0)?.toUpperCase() || '?'}
          </div>
          <div>
            <p className="font-semibold text-gray-900">{row.productName}</p>
            <p className="text-sm text-gray-500">ID: {row.id}</p>
          </div>
        </div>
      </td>
      
      <td className="px-6 py-4">
        <p className="text-gray-900 line-clamp-2">{row.productDescription}</p>
      </td>
      
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-green-600" />
          <span className="font-bold text-lg text-gray-900">
            {formatCurrency(row.productPrice)}
          </span>
          <span className="text-sm text-gray-500">/ {row.productUnit}</span>
        </div>
      </td>
      
      <td className="px-6 py-4">
        {row.active ? (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 text-green-800 text-xs font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Faol
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-medium">
            <CircleAlert className="w-3.5 h-3.5" />
            Nofaol
          </span>
        )}
      </td>
      
      <td className="px-6 py-4">
        <div className="text-sm">
          <p className="text-gray-900 font-medium">{formatRelativeTime(row.productUpdatedDate)}</p>
          <p className="text-gray-500">{formatDate(row.productCreatedDate)}</p>
        </div>
      </td>
      
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onView(row)}
            className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
            title="Ko'rish"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => onEdit(row)}
            className="p-2 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
            title="Tahrirlash"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(row.id)}
            className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
            title="O'chirish"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
};

// ==================== MAIN PAGE ====================
const PricingPage = () => {
  // State Management
  const [rows, setRows] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState({ by: 'productCreatedDate', dir: 'desc' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  
  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRow, setEditingRow] = useState(null);
  const [viewingRow, setViewingRow] = useState(null);

  // Statistics
  const statistics = useMemo(() => {
    if (!rows.length) return null;
    
    const activeCount = rows.filter(r => r.active).length;
    const avgPrice = rows.reduce((sum, r) => sum + (r.productPrice || 0), 0) / rows.length;
    const maxPrice = Math.max(...rows.map(r => r.productPrice || 0));
    const minPrice = Math.min(...rows.map(r => r.productPrice || 0).filter(p => p > 0));
    
    return {
      total: totalElements,
      active: activeCount,
      inactive: totalElements - activeCount,
      avgPrice: Math.round(avgPrice),
      maxPrice,
      minPrice
    };
  }, [rows, totalElements]);

  // Fetch Data
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    
    try {
      const { content, totalPages, totalElements } = await api.list({
        page: currentPage - 1,
        size: pageSize,
        sort: sortConfig.by,
        dir: sortConfig.dir,
        q: searchQuery
      });
      
      setRows(content);
      setTotalPages(totalPages);
      setTotalElements(totalElements);
    } catch (err) {
      setError(err.message);
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, sortConfig.by, sortConfig.dir, searchQuery]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handlers
  const handleSort = useCallback((field) => {
    setSortConfig(prev => ({
      by: field,
      dir: prev.by === field && prev.dir === 'asc' ? 'desc' : 'asc'
    }));
    setCurrentPage(1);
  }, []);

  const handleCreate = useCallback(async (data) => {
    await api.create(data);
    setCurrentPage(1);
    fetchData();
  }, [fetchData]);

  const handleEdit = useCallback(async (data) => {
    await api.update(editingRow.id, data);
    fetchData();
  }, [editingRow, fetchData]);

  const handleDelete = useCallback(async (id) => {
    if (!window.confirm('Bu narxni o\'chirishga ishonchingiz komilmi?')) return;
    
    try {
      await api.remove(id);
      showToast('Narx muvaffaqiyatli o\'chirildi', 'success');
      
      if (rows.length === 1 && currentPage > 1) {
        setCurrentPage(p => p - 1);
      } else {
        fetchData();
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  }, [rows.length, currentPage, fetchData]);

  const openModal = (type, data = null) => {
    if (type === 'edit') {
      setEditingRow(data);
      setIsModalOpen(true);
    } else if (type === 'create') {
      setEditingRow(null);
      setIsModalOpen(true);
    } else if (type === 'view') {
      setViewingRow(data);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingRow(null);
    setViewingRow(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Narxlarni Boshqarish
              </h1>
              <p className="text-gray-600 mt-2 flex items-center gap-2">
                <Package className="w-4 h-4" />
                Meva va sabzavot narxlarini professional boshqarish tizimi
              </p>
            </div>
            <button
              onClick={() => openModal('create')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl"
            >
              <Plus className="w-5 h-5" />
              Yangi Qo'shish
            </button>
          </div>
        </div>

        {/* Statistics */}
        {statistics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              icon={Package}
              label="Jami Mahsulotlar"
              value={statistics.total}
              color="blue"
            />
            <StatCard
              icon={CheckCircle2}
              label="Faol Narxlar"
              value={statistics.active}
              trend="up"
              trendValue={`${Math.round((statistics.active / statistics.total) * 100)}%`}
              color="green"
            />
            <StatCard
              icon={DollarSign}
              label="O'rtacha Narx"
              value={`${formatCurrency(statistics.avgPrice)} so'm`}
              color="purple"
            />
            <StatCard
              icon={BarChart3}
              label="Narx Diapazoni"
              value={`${formatCurrency(statistics.minPrice)} - ${formatCurrency(statistics.maxPrice)}`}
              color="orange"
            />
          </div>
        )}

        {/* Filters & Search */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Qidirish: mahsulot nomi, tavsif yoki narx..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleSort('productCreatedDate')}
                className={`inline-flex items-center gap-2 px-4 py-3 rounded-xl border transition-all ${
                  sortConfig.by === 'productCreatedDate'
                    ? 'bg-blue-50 border-blue-200 text-blue-700'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Calendar className="w-4 h-4" />
                <span className="text-sm font-medium">Sana</span>
                {sortConfig.by === 'productCreatedDate' && (
                  <span className="text-xs">
                    {sortConfig.dir === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </button>

              <button
                onClick={() => handleSort('productPrice')}
                className={`inline-flex items-center gap-2 px-4 py-3 rounded-xl border transition-all ${
                  sortConfig.by === 'productPrice'
                    ? 'bg-blue-50 border-blue-200 text-blue-700'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <DollarSign className="w-4 h-4" />
                <span className="text-sm font-medium">Narx</span>
                {sortConfig.by === 'productPrice' && (
                  <span className="text-xs">
                    {sortConfig.dir === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </button>

              <button
                onClick={fetchData}
                disabled={loading}
                className="inline-flex items-center gap-2 px-4 py-3 rounded-xl border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-all disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span className="text-sm font-medium">Yangilash</span>
              </button>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <div>
                  <p className="font-medium text-red-900">Xatolik yuz berdi</p>
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
              <button
                onClick={fetchData}
                className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
              >
                Qayta urinish
              </button>
            </div>
          </div>
        )}

        {/* Data Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th 
                    className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors"
                    onClick={() => handleSort('productName')}
                  >
                    <div className="flex items-center gap-2">
                      Mahsulot
                      {sortConfig.by === 'productName' && (
                        <ArrowUpDown className="w-3 h-3" />
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Tavsif
                  </th>
                  <th 
                    className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors"
                    onClick={() => handleSort('productPrice')}
                  >
                    <div className="flex items-center gap-2">
                      Narx
                      {sortConfig.by === 'productPrice' && (
                        <ArrowUpDown className="w-3 h-3" />
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Sana
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Amallar
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center">
                      <Loader2 className="w-10 h-10 animate-spin mx-auto mb-4 text-blue-600" />
                      <p className="text-gray-600 font-medium">Ma'lumotlar yuklanmoqda...</p>
                      <p className="text-sm text-gray-500 mt-1">Iltimos kuting</p>
                    </td>
                  </tr>
                ) : rows.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center">
                      <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                      <p className="text-gray-900 font-semibold text-lg mb-2">Ma'lumot topilmadi</p>
                      <p className="text-gray-500 mb-4">
                        {searchQuery 
                          ? 'Qidiruv bo\'yicha natija topilmadi. Boshqa so\'z bilan qidiring.' 
                          : 'Hozircha hech qanday narx ma\'lumoti yo\'q.'}
                      </p>
                      <button
                        onClick={() => openModal('create')}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        Birinchi narxni qo'shish
                      </button>
                    </td>
                  </tr>
                ) : (
                  rows.map((row) => (
                    <PriceRow
                      key={row.id}
                      row={row}
                      onEdit={(r) => openModal('edit', r)}
                      onDelete={handleDelete}
                      onView={(r) => openModal('view', r)}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <p className="text-sm text-gray-700">
                  <span className="font-medium">{((currentPage - 1) * pageSize) + 1}</span>
                  {' - '}
                  <span className="font-medium">
                    {Math.min(currentPage * pageSize, totalElements)}
                  </span>
                  {' dan '}
                  <span className="font-medium">{totalElements}</span>
                  {' ta natija'}
                </p>
                
                <select
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                >
                  <option value={10}>10 ta</option>
                  <option value={20}>20 ta</option>
                  <option value={50}>50 ta</option>
                  <option value={100}>100 ta</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="px-3 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Birinchi
                </button>
                
                <button
                  onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          currentPage === pageNum
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
                
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Oxirgi
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <PriceModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSubmit={editingRow ? handleEdit : handleCreate}
        initialData={editingRow}
        isEdit={!!editingRow}
      />

      {/* View Modal */}
      {viewingRow && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
            <div className="fixed inset-0 transition-opacity bg-gray-900 bg-opacity-75 backdrop-blur-sm" onClick={closeModal} />
            
            <div className="relative inline-block w-full max-w-2xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-2xl rounded-2xl">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Narx Ma'lumotlari</h3>
                  <p className="text-sm text-gray-500 mt-1">To'liq ma'lumotlar va tarixiy ma'lumotlar</p>
                </div>
                <button
                  onClick={closeModal}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Product Header */}
                <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-2xl">
                    {viewingRow.productName?.charAt(0)?.toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xl font-bold text-gray-900">{viewingRow.productName}</h4>
                    <p className="text-gray-600">{viewingRow.productDescription}</p>
                  </div>
                  {viewingRow.active ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm font-medium">
                      <CheckCircle2 className="w-4 h-4" />
                      Faol
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-sm font-medium">
                      <CircleAlert className="w-4 h-4" />
                      Nofaol
                    </span>
                  )}
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="w-5 h-5 text-green-600" />
                      <p className="text-sm font-medium text-gray-600">Joriy Narx</p>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(viewingRow.productPrice)} <span className="text-lg text-gray-500">so'm</span>
                    </p>
                    <p className="text-sm text-gray-500 mt-1">{viewingRow.productUnit}</p>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="w-5 h-5 text-blue-600" />
                      <p className="text-sm font-medium text-gray-600">Mahsulot ID</p>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">#{viewingRow.id}</p>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-5 h-5 text-purple-600" />
                      <p className="text-sm font-medium text-gray-600">Yaratilgan Sana</p>
                    </div>
                    <p className="text-sm font-semibold text-gray-900">{formatDate(viewingRow.productCreatedDate)}</p>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-5 h-5 text-orange-600" />
                      <p className="text-sm font-medium text-gray-600">Oxirgi Yangilanish</p>
                    </div>
                    <p className="text-sm font-semibold text-gray-900">{formatRelativeTime(viewingRow.productUpdatedDate)}</p>
                  </div>
                </div>

                {/* Full Description */}
                <div className="p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-5 h-5 text-indigo-600" />
                    <p className="text-sm font-medium text-gray-600">To'liq Tavsif</p>
                  </div>
                  <p className="text-gray-900">{viewingRow.productDescription}</p>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                  <button
                    onClick={closeModal}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Yopish
                  </button>
                  <button
                    onClick={() => {
                      closeModal();
                      openModal('edit', viewingRow);
                    }}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <Edit3 className="w-4 h-4" />
                    Tahrirlash
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom Styles */}
      <style>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        @keyframes slide-out {
          from {
            transform: translateX(0);
            opacity: 1;
          }
          to {
            transform: translateX(100%);
            opacity: 0;
          }
        }
        
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default PricingPage;