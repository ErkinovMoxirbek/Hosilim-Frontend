import React, { useState, useEffect, useCallback } from 'react';
import {
  PackagePlus, Save, X, ShoppingBasket, Warehouse, Calendar,
  Loader2, CheckCircle2, AlertTriangle, Package, Layers,
  Hash, FileText, MapPin, User, Truck, Clock, Plus, Minus,
  Search, Filter, RefreshCw, Download, Eye, Edit3, Trash2
} from 'lucide-react';

// ==================== UTILITIES ====================
const API_BASE_URL = 'https://api.example.com';

const getToken = () => {
  try {
    return localStorage.getItem('authToken') || '';
  } catch (error) {
    console.error('Error accessing localStorage:', error);
    return '';
  }
};

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
  
  toast.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg text-white ${bgColor} flex items-center gap-3 min-w-[300px]`;
  toast.innerHTML = `
    <span class="text-xl font-bold">${icon}</span>
    <span class="flex-1">${message}</span>
  `;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s ease-out';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
};

const formatDate = (dateString) => {
  if (!dateString) return '-';
  try {
    return new Date(dateString).toLocaleDateString('uz-UZ', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    console.error('Date formatting error:', error);
    return dateString;
  }
};

// ==================== BASKET TYPES ====================
const BASKET_TYPES = [
  {
    id: 1,
    code: 'SMALL_PLASTIC',
    name: 'Kichik Plastik Yashik',
    material: 'Plastik',
    capacity: 15,
    dimensions: '40x30x20 sm',
    weight: 1.5,
    color: 'blue',
    icon: Package,
    description: 'Kichik mevalar uchun'
  },
  {
    id: 2,
    code: 'MEDIUM_PLASTIC',
    name: 'O\'rta Plastik Yashik',
    material: 'Plastik',
    capacity: 25,
    dimensions: '60x40x30 sm',
    weight: 2.5,
    color: 'green',
    icon: Package,
    description: 'Universal foydalanish'
  },
  {
    id: 3,
    code: 'LARGE_PLASTIC',
    name: 'Katta Plastik Yashik',
    material: 'Plastik',
    capacity: 40,
    dimensions: '80x60x40 sm',
    weight: 4.0,
    color: 'purple',
    icon: Layers,
    description: 'Og\'ir mahsulotlar uchun'
  },
  {
    id: 4,
    code: 'WOODEN_CRATE',
    name: 'Yog\'och Quti',
    material: 'Yog\'och',
    capacity: 30,
    dimensions: '70x50x35 sm',
    weight: 5.0,
    color: 'orange',
    icon: Package,
    description: 'An\'anaviy yashik'
  },
  {
    id: 5,
    code: 'METAL_CONTAINER',
    name: 'Metall Konteyner',
    material: 'Metall',
    capacity: 50,
    dimensions: '100x80x50 sm',
    weight: 8.0,
    color: 'gray',
    icon: Layers,
    description: 'Uzoq muddatli saqlash'
  },
  {
    id: 6,
    code: 'VENTILATED_BOX',
    name: 'Ventilyatsiyali Yashik',
    material: 'Plastik',
    capacity: 20,
    dimensions: '50x40x25 sm',
    weight: 2.0,
    color: 'teal',
    icon: Package,
    description: 'Tez buziladigan mahsulotlar'
  }
];

// ==================== API CLIENT ====================
const BASKETS_URL = `${API_BASE_URL}/baskets`;

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
      
      if (res.status === 403) {
        showToast('Ruxsat yo\'q', 'error');
        throw new Error('403 Forbidden');
      }

      if (res.status === 404) {
        showToast('Ma\'lumot topilmadi', 'error');
        throw new Error('404 Not Found');
      }

      if (res.status === 500) {
        showToast('Server xatosi', 'error');
        throw new Error('500 Internal Server Error');
      }
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        const errorMessage = errorData?.message || errorData?.error || `HTTP ${res.status} ${res.statusText}`;
        throw new Error(errorMessage);
      }
      
      return await res.json();
    } catch (error) {
      if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
        showToast('Internet aloqasi yo\'q', 'error');
        throw new Error('Network error: No internet connection');
      }
      
      console.error('API Request Error:', error);
      throw error;
    }
  },

  async createBasketReceival(data) {
    try {
      const payload = await this.request(BASKETS_URL + '/receival', {
        method: 'POST',
        body: JSON.stringify(data)
      });
      return payload.data ?? payload;
    } catch (error) {
      console.error('Create basket receival error:', error);
      throw error;
    }
  },

  async getBasketReceivals({ page = 0, size = 10, sort = 'createdAt', dir = 'desc' } = {}) {
    try {
      const url = new URL(BASKETS_URL + '/receivals');
      url.searchParams.set('page', page);
      url.searchParams.set('size', size);
      url.searchParams.set('sort', `${sort},${dir}`);

      const payload = await this.request(url.toString());
      const data = payload.data ?? payload;
      
      return {
        content: data.content || [],
        totalPages: data.totalPages ?? 1,
        totalElements: data.totalElements ?? 0
      };
    } catch (error) {
      console.error('Get basket receivals error:', error);
      return {
        content: [],
        totalPages: 1,
        totalElements: 0
      };
    }
  }
};

// ==================== BASKET RECEIVAL MODAL ====================
const BasketReceivalModal = ({ isOpen, onClose, onSubmit }) => {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    supplierName: '',
    supplierContact: '',
    supplierAddress: '',
    deliveryDate: new Date().toISOString().split('T')[0],
    deliveryTime: new Date().toTimeString().slice(0, 5),
    transportNumber: '',
    driverName: '',
    driverContact: '',
    notes: '',
    baskets: []
  });

  const [selectedBaskets, setSelectedBaskets] = useState([]);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        supplierName: '',
        supplierContact: '',
        supplierAddress: '',
        deliveryDate: new Date().toISOString().split('T')[0],
        deliveryTime: new Date().toTimeString().slice(0, 5),
        transportNumber: '',
        driverName: '',
        driverContact: '',
        notes: '',
        baskets: []
      });
      setSelectedBaskets([]);
      setErrors({});
      setStep(1);
    }
  }, [isOpen]);

  const validateStep1 = () => {
    const newErrors = {};
    
    if (!formData.supplierName?.trim()) {
      newErrors.supplierName = 'Yetkazib beruvchi nomi majburiy';
    }
    
    if (!formData.supplierContact?.trim()) {
      newErrors.supplierContact = 'Telefon raqami majburiy';
    } else if (!/^\+?998[0-9]{9}$/.test(formData.supplierContact.replace(/\s/g, ''))) {
      newErrors.supplierContact = 'Noto\'g\'ri telefon format (+998901234567)';
    }
    
    if (!formData.deliveryDate) {
      newErrors.deliveryDate = 'Yetkazib berish sanasi majburiy';
    }
    
    if (!formData.transportNumber?.trim()) {
      newErrors.transportNumber = 'Transport raqami majburiy';
    }
    
    return newErrors;
  };

  const validateStep2 = () => {
    const newErrors = {};
    
    if (selectedBaskets.length === 0) {
      newErrors.baskets = 'Kamida bitta yashik turi tanlanishi kerak';
    }
    
    const hasInvalidQuantity = selectedBaskets.some(b => !b.quantity || b.quantity <= 0);
    if (hasInvalidQuantity) {
      newErrors.basketQuantity = 'Barcha yashiklar soni 0 dan katta bo\'lishi kerak';
    }
    
    return newErrors;
  };

  const handleNext = () => {
    const validationErrors = validateStep1();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      showToast('Iltimos, barcha majburiy maydonlarni to\'ldiring', 'warning');
      return;
    }
    setErrors({});
    setStep(2);
  };

  const handleBack = () => {
    setStep(1);
  };

  const addBasketType = (type) => {
    try {
      const existing = selectedBaskets.find(b => b.typeId === type.id);
      if (existing) {
        showToast('Bu yashik turi allaqachon qo\'shilgan', 'warning');
        return;
      }
      
      setSelectedBaskets([...selectedBaskets, {
        typeId: type.id,
        typeName: type.name,
        typeCode: type.code,
        capacity: type.capacity,
        quantity: 1,
        condition: 'GOOD',
        dimensions: type.dimensions,
        material: type.material
      }]);
    } catch (error) {
      console.error('Error adding basket type:', error);
      showToast('Yashik qo\'shishda xatolik', 'error');
    }
  };

  const removeBasketType = (typeId) => {
    try {
      setSelectedBaskets(selectedBaskets.filter(b => b.typeId !== typeId));
    } catch (error) {
      console.error('Error removing basket type:', error);
      showToast('Yashik o\'chirishda xatolik', 'error');
    }
  };

  const updateBasketQuantity = (typeId, delta) => {
    try {
      setSelectedBaskets(selectedBaskets.map(b => {
        if (b.typeId === typeId) {
          const newQuantity = Math.max(1, (b.quantity || 1) + delta);
          return { ...b, quantity: newQuantity };
        }
        return b;
      }));
    } catch (error) {
      console.error('Error updating basket quantity:', error);
      showToast('Sonni o\'zgartirishda xatolik', 'error');
    }
  };

  const updateBasketCondition = (typeId, condition) => {
    try {
      setSelectedBaskets(selectedBaskets.map(b => {
        if (b.typeId === typeId) {
          return { ...b, condition };
        }
        return b;
      }));
    } catch (error) {
      console.error('Error updating basket condition:', error);
      showToast('Holatni o\'zgartirishda xatolik', 'error');
    }
  };

  const handleSubmit = async () => {
    const validationErrors = validateStep2();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      showToast('Iltimos, barcha maydonlarni to\'g\'ri to\'ldiring', 'warning');
      return;
    }

    setLoading(true);
    try {
      const submitData = {
        ...formData,
        deliveryDateTime: `${formData.deliveryDate}T${formData.deliveryTime}:00`,
        baskets: selectedBaskets,
        totalBaskets: selectedBaskets.reduce((sum, b) => sum + b.quantity, 0)
      };

      await onSubmit(submitData);
      onClose();
      showToast('Yashiklar muvaffaqiyatli qabul qilindi', 'success');
    } catch (err) {
      console.error('Submit error:', err);
      const errorMessage = err.message || 'Xatolik yuz berdi';
      showToast(errorMessage, 'error');
      setErrors({ submit: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const getTotalBaskets = () => selectedBaskets.reduce((sum, b) => sum + (b.quantity || 0), 0);
  const getTotalCapacity = () => selectedBaskets.reduce((sum, b) => sum + ((b.quantity || 0) * (b.capacity || 0)), 0);

  const colorClasses = {
    blue: 'bg-gradient-to-br from-blue-500 to-blue-600',
    green: 'bg-gradient-to-br from-green-500 to-green-600',
    purple: 'bg-gradient-to-br from-purple-500 to-purple-600',
    orange: 'bg-gradient-to-br from-orange-500 to-orange-600',
    gray: 'bg-gradient-to-br from-gray-500 to-gray-600',
    teal: 'bg-gradient-to-br from-teal-500 to-teal-600'
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-900 bg-opacity-75 backdrop-blur-sm" onClick={onClose} />
        
        <div className="relative inline-block w-full max-w-4xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-2xl rounded-2xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl">
                <PackagePlus className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Zavotdan Yashik Qabul Qilish</h3>
                <p className="text-sm text-gray-500">
                  {step === 1 ? 'Yetkazib beruvchi ma\'lumotlari' : 'Yashik turlari va soni'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              disabled={loading}
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold ${
                step >= 1 ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                {step > 1 ? <CheckCircle2 className="w-5 h-5" /> : '1'}
              </div>
              <div className={`w-24 h-1 mx-2 ${step >= 2 ? 'bg-green-500' : 'bg-gray-200'}`} />
              <div className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold ${
                step >= 2 ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                2
              </div>
            </div>
          </div>

          {/* Step 1: Basic Information */}
          {step === 1 && (
            <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
              {/* Supplier Info */}
              <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                <div className="flex items-center gap-2 mb-4">
                  <Warehouse className="w-5 h-5 text-blue-600" />
                  <h4 className="font-semibold text-gray-900">Yetkazib Beruvchi Ma'lumotlari</h4>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Zavot Nomi <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      className={`w-full px-4 py-3 rounded-lg border ${
                        errors.supplierName ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      } focus:ring-2 focus:ring-blue-500 focus:outline-none`}
                      placeholder="Masalan: Toshkent Plastik Zavodi"
                      value={formData.supplierName}
                      onChange={(e) => {
                        setFormData({...formData, supplierName: e.target.value});
                        if (errors.supplierName) setErrors({...errors, supplierName: ''});
                      }}
                    />
                    {errors.supplierName && (
                      <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        {errors.supplierName}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Telefon Raqami <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      className={`w-full px-4 py-3 rounded-lg border ${
                        errors.supplierContact ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      } focus:ring-2 focus:ring-blue-500 focus:outline-none`}
                      placeholder="+998901234567"
                      value={formData.supplierContact}
                      onChange={(e) => {
                        setFormData({...formData, supplierContact: e.target.value});
                        if (errors.supplierContact) setErrors({...errors, supplierContact: ''});
                      }}
                    />
                    {errors.supplierContact && (
                      <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        {errors.supplierContact}
                      </p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Manzil
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      placeholder="Zavot manzili"
                      value={formData.supplierAddress}
                      onChange={(e) => setFormData({...formData, supplierAddress: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              {/* Delivery Info */}
              <div className="p-4 bg-green-50 rounded-xl border border-green-100">
                <div className="flex items-center gap-2 mb-4">
                  <Truck className="w-5 h-5 text-green-600" />
                  <h4 className="font-semibold text-gray-900">Yetkazib Berish Ma'lumotlari</h4>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Sana <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      className={`w-full px-4 py-3 rounded-lg border ${
                        errors.deliveryDate ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      } focus:ring-2 focus:ring-green-500 focus:outline-none`}
                      value={formData.deliveryDate}
                      onChange={(e) => {
                        setFormData({...formData, deliveryDate: e.target.value});
                        if (errors.deliveryDate) setErrors({...errors, deliveryDate: ''});
                      }}
                    />
                    {errors.deliveryDate && (
                      <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        {errors.deliveryDate}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Vaqt
                    </label>
                    <input
                      type="time"
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:outline-none"
                      value={formData.deliveryTime}
                      onChange={(e) => setFormData({...formData, deliveryTime: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Transport Raqami <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      className={`w-full px-4 py-3 rounded-lg border ${
                        errors.transportNumber ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      } focus:ring-2 focus:ring-green-500 focus:outline-none`}
                      placeholder="01 A 123 BC"
                      value={formData.transportNumber}
                      onChange={(e) => {
                        setFormData({...formData, transportNumber: e.target.value});
                        if (errors.transportNumber) setErrors({...errors, transportNumber: ''});
                      }}
                    />
                    {errors.transportNumber && (
                      <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        {errors.transportNumber}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Haydovchi Ismi
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:outline-none"
                      placeholder="Haydovchi F.I.SH"
                      value={formData.driverName}
                      onChange={(e) => setFormData({...formData, driverName: e.target.value})}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Haydovchi Telefon
                    </label>
                    <input
                      type="tel"
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:outline-none"
                      placeholder="+998901234567"
                      value={formData.driverContact}
                      onChange={(e) => setFormData({...formData, driverContact: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Qo'shimcha Izohlar
                </label>
                <textarea
                  rows={3}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
                  placeholder="Qo'shimcha ma'lumotlar..."
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                />
              </div>
            </div>
          )}

          {/* Step 2: Basket Types */}
          {step === 2 && (
            <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
              {/* Select Basket Types */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Package className="w-5 h-5 text-blue-600" />
                  Yashik Turlarini Tanlang
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
                  {BASKET_TYPES.map(type => {
                    const isSelected = selectedBaskets.some(b => b.typeId === type.id);

                    return (
                      <button
                        key={type.id}
                        onClick={() => !isSelected && addBasketType(type)}
                        disabled={isSelected}
                        className={`p-4 rounded-xl border-2 text-left transition-all ${
                          isSelected
                            ? 'border-green-500 bg-green-50 opacity-75 cursor-not-allowed'
                            : 'border-gray-200 hover:border-blue-500 hover:shadow-md'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className={`p-2 ${colorClasses[type.color]} rounded-lg`}>
                            <type.icon className="w-5 h-5 text-white" />
                          </div>
                          {isSelected && (
                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                          )}
                        </div>
                        <h5 className="font-semibold text-gray-900 text-sm mb-1">{type.name}</h5>
                        <p className="text-xs text-gray-600 mb-2">{type.description}</p>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-500">{type.capacity} kg</span>
                          <span className="text-gray-500">{type.material}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {errors.baskets && (
                  <p className="text-sm text-red-600 flex items-center gap-1 mb-4">
                    <AlertTriangle className="w-4 h-4" />
                    {errors.baskets}
                  </p>
                )}
              </div>

              {/* Selected Baskets */}
              {selectedBaskets.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <ShoppingBasket className="w-5 h-5 text-green-600" />
                    Tanlangan Yashiklar ({selectedBaskets.length} tur)
                  </h4>
                  
                  <div className="space-y-3">
                    {selectedBaskets.map(basket => {
                      const type = BASKET_TYPES.find(t => t.id === basket.typeId);
                      if (!type) return null;

                      return (
                        <div key={basket.typeId} className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 ${colorClasses[type.color]} rounded-lg`}>
                                <type.icon className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                <h5 className="font-semibold text-gray-900">{type.name}</h5>
                                <p className="text-xs text-gray-600">{type.dimensions} • {type.capacity} kg</p>
                              </div>
                            </div>
                            <button
                              onClick={() => removeBasketType(basket.typeId)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            {/* Quantity */}
                            <div>
                              <label className="block text-xs font-semibold text-gray-700 mb-2">
                                Soni
                              </label>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => updateBasketQuantity(basket.typeId, -1)}
                                  className="p-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
                                  disabled={basket.quantity <= 1}
                                >
                                  <Minus className="w-4 h-4" />
                                </button>
                                <input
                                  type="number"
                                  min="1"
                                  value={basket.quantity}
                                  onChange={(e) => {
                                    const val = parseInt(e.target.value) || 1;
                                    setSelectedBaskets(selectedBaskets.map(b => 
                                      b.typeId === basket.typeId ? {...b, quantity: Math.max(1, val)} : b
                                    ));
                                  }}
                                  className="w-16 px-3 py-2 text-center rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                />
                                <button
                                  onClick={() => updateBasketQuantity(basket.typeId, 1)}
                                  className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                                >
                                  <Plus className="w-4 h-4" />
                                </button>
                              </div>
                            </div>

                            {/* Condition */}
                            <div>
                              <label className="block text-xs font-semibold text-gray-700 mb-2">
                                Holati
                              </label>
                              <select
                                value={basket.condition}
                                onChange={(e) => updateBasketCondition(basket.typeId, e.target.value)}
                                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                              >
                                <option value="GOOD">Yaxshi</option>
                                <option value="DAMAGED">Shikastlangan</option>
                                <option value="NEEDS_REPAIR">Ta'mirlash kerak</option>
                              </select>
                            </div>
                          </div>

                          {/* Total Capacity */}
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600">Jami sig'im:</span>
                              <span className="font-semibold text-gray-900">
                                {(basket.quantity * basket.capacity).toFixed(1)} kg
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Summary */}
                  <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-xl border border-blue-200">
                    <h5 className="font-semibold text-gray-900 mb-3">Umumiy Ma'lumot</h5>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500 rounded-lg">
                          <Package className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Jami Yashiklar</p>
                          <p className="text-xl font-bold text-gray-900">{getTotalBaskets()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-500 rounded-lg">
                          <Layers className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Jami Sig'im</p>
                          <p className="text-xl font-bold text-gray-900">{getTotalCapacity().toFixed(1)} kg</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {errors.basketQuantity && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4" />
                  {errors.basketQuantity}
                </p>
              )}
            </div>
          )}

          {/* Submit Error */}
          {errors.submit && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                {errors.submit}
              </p>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
            <div>
              {step === 2 && (
                <button
                  onClick={handleBack}
                  disabled={loading}
                  className="px-6 py-2.5 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors font-medium disabled:opacity-50"
                >
                  Orqaga
                </button>
              )}
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                disabled={loading}
                className="px-6 py-2.5 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors font-medium disabled:opacity-50"
              >
                Bekor qilish
              </button>
              
              {step === 1 ? (
                <button
                  onClick={handleNext}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium flex items-center gap-2"
                >
                  Keyingisi
                  <CheckCircle2 className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={loading || selectedBaskets.length === 0}
                  className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Yuklanmoqda...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Saqlash
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==================== MAIN COMPONENT ====================
export default function BasketManagement() {
  const [receivals, setReceivals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState(null);

  const loadReceivals = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getBasketReceivals({ page, size: 10 });
      setReceivals(data.content);
      setTotalPages(data.totalPages);
    } catch (err) {
      console.error('Load receivals error:', err);
      setError(err.message || 'Ma\'lumotlarni yuklashda xatolik');
      showToast('Ma\'lumotlarni yuklashda xatolik', 'error');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    loadReceivals();
  }, [loadReceivals]);

  const handleSubmit = async (data) => {
    try {
      await api.createBasketReceival(data);
      await loadReceivals();
    } catch (error) {
      throw error;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Yashik Qabul Qilish</h1>
              <p className="text-gray-600">Zavotdan yashiklar qabul qilish va boshqarish</p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl font-medium flex items-center gap-2 shadow-lg transition-all"
            >
              <PackagePlus className="w-5 h-5" />
              Yangi Qabul
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="p-6 bg-white rounded-xl shadow-md border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Jami Qabullar</p>
                <p className="text-3xl font-bold text-gray-900">{receivals.length}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Package className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="p-6 bg-white rounded-xl shadow-md border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Yashik Turlari</p>
                <p className="text-3xl font-bold text-gray-900">{BASKET_TYPES.length}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <Layers className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </div>

          <div className="p-6 bg-white rounded-xl shadow-md border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Sahifalar</p>
                <p className="text-3xl font-bold text-gray-900">{totalPages}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <FileText className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <div className="flex-1">
                <h4 className="font-semibold text-red-900">Xatolik</h4>
                <p className="text-sm text-red-700">{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="p-1 hover:bg-red-100 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-red-600" />
              </button>
            </div>
          </div>
        )}

        {/* Receivals List */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Qabul Qilingan Yashiklar</h2>
              <button
                onClick={loadReceivals}
                disabled={loading}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-5 h-5 text-gray-600 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {loading && receivals.length === 0 ? (
            <div className="p-12 text-center">
              <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Yuklanmoqda...</p>
            </div>
          ) : receivals.length === 0 ? (
            <div className="p-12 text-center">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Hech qanday ma'lumot yo'q</h3>
              <p className="text-gray-600 mb-4">Birinchi yashik qabulini boshlash uchun "Yangi Qabul" tugmasini bosing</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Yetkazib Beruvchi</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Transport</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Sana</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Yashiklar</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Amallar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {receivals.map((receival, idx) => (
                    <tr key={idx} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold text-gray-900">{receival.supplierName || 'N/A'}</p>
                          <p className="text-sm text-gray-600">{receival.supplierContact || 'N/A'}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Truck className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-900">{receival.transportNumber || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-900">{formatDate(receival.deliveryDateTime)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                          {receival.totalBaskets || 0} dona
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                          <Eye className="w-4 h-4 text-gray-600" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-gray-100 flex items-center justify-between">
              <button
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0 || loading}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                Oldingi
              </button>
              <span className="text-sm text-gray-600">
                Sahifa {page + 1} / {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1 || loading}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                Keyingi
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      <BasketReceivalModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
      />
    </div>
  );
}