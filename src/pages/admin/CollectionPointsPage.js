import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  MapPin, Search, Plus, MoreVertical, Eye, Edit2,
  Trash2, RefreshCw, ChevronDown, Download,
  AlertTriangle, CheckCircle, DollarSign, Save, X,
  Users, Briefcase, TrendingUp, Building2, Navigation,
  UserCheck, Clock, Star
} from 'lucide-react';

const CollectionPointsManagement = () => {
  /* ======================= Core State ======================= */
  const [points, setPoints] = useState([]);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [tableLoading, setTableLoading] = useState(false);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  /* ======================= Filters ======================= */
  const [filters, setFilters] = useState({
    search: '',
    region: 'ALL',
    ownerId: 'ALL',
    status: 'ALL'
  });

  const [searchText, setSearchText] = useState('');
  useEffect(() => {
    const t = setTimeout(() => {
      setFilters(f => (f.search === searchText ? f : { ...f, search: searchText }));
    }, 500);
    return () => clearTimeout(t);
  }, [searchText]);

  /* ======================= Pagination ======================= */
  const [pagination, setPagination] = useState({ page: 1, limit: 25, total: 0, totalPages: 0 });

  /* ======================= Modal/Form ======================= */
  const [modal, setModal] = useState({ isOpen: false, type: null, data: null });
  const [formData, setFormData] = useState({});
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  /* ======================= Big Brokers (for owner selection) ======================= */
  const [bigBrokers, setBigBrokers] = useState([]);

  const API_BASE = 'http://localhost:8080/api/v1';

  /* ======================= API Client ======================= */
  const getAuthHeaders = () => {
    const token = localStorage.getItem('authToken');
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
  };

  const api = {
    async get(path, params) {
      const qs = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([k, v]) => {
          if (v !== undefined && v !== null && v !== '' && v !== 'ALL') qs.append(k, String(v));
        });
      }
      const res = await fetch(`${API_BASE}${path}${qs.toString() ? `?${qs.toString()}` : ''}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error((await res.text()) || res.statusText);
      return res.json();
    },
    async post(path, body) {
      const res = await fetch(`${API_BASE}${path}`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(body ?? {}),
      });
      if (!res.ok) throw new Error((await res.text()) || res.statusText);
      try { return await res.json(); } catch { return {}; }
    },
    async patch(path, body) {
      const res = await fetch(`${API_BASE}${path}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify(body ?? {}),
      });
      if (!res.ok) throw new Error((await res.text()) || res.statusText);
      try { return await res.json(); } catch { return {}; }
    },
    async del(path) {
      const res = await fetch(`${API_BASE}${path}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error((await res.text()) || res.statusText);
      try { return await res.json(); } catch { return {}; }
    },
  };

  /* ======================= Fetching ======================= */
  const hasLoadedRef = useRef(false);
  
  const fetchPoints = useCallback(async () => {
    try {
      if (!hasLoadedRef.current) setLoadingInitial(true);
      else setTableLoading(true);
      setError(null);

      const params = {
        page: pagination.page,
        limit: pagination.limit,
        search: filters.search,
        region: filters.region,
        ownerId: filters.ownerId,
        status: filters.status,
      };

      const res = await api.get('/admin/collection-points', params);
      const items = res.data ?? res.items ?? res.results ?? [];
      const meta = res.meta ?? {};
      const total = Number(res.total ?? meta.total ?? items.length ?? 0);
      const limit = Number(meta.limit ?? pagination.limit ?? 25);
      const page = Number(meta.page ?? pagination.page ?? 1);
      const totalPages = Number(meta.totalPages ?? (limit > 0 ? Math.ceil(total / limit) : 0));

      setPoints(items);
      setPagination(prev => ({ ...prev, page, limit, total, totalPages }));
    } catch (err) {
      console.error('Fetch points error:', err);
      setError("Ma'lumotlar yuklanishda xatolik yuz berdi");
    } finally {
      if (!hasLoadedRef.current) {
        hasLoadedRef.current = true;
        setLoadingInitial(false);
      } else {
        setTableLoading(false);
      }
      setRefreshing(false);
    }
  }, [filters, pagination.page, pagination.limit]);

  const fetchBigBrokers = useCallback(async () => {
    try {
      const res = await api.get('/admin/users', { userType: 'BIG_BROKER', limit: 1000 });
      setBigBrokers(res.data ?? res.items ?? []);
    } catch (err) {
      console.error('Fetch big brokers error:', err);
    }
  }, []);

  useEffect(() => { fetchPoints(); }, [fetchPoints]);
  useEffect(() => { fetchBigBrokers(); }, [fetchBigBrokers]);
  useEffect(() => { setPagination(p => ({ ...p, page: 1 })); }, [filters]);

  /* ======================= Stats ======================= */
  const statistics = useMemo(() => {
    if (!points.length) return null;
    return {
      total: points.length,
      active: points.filter(p => p.status === 'ACTIVE').length,
      totalBalance: points.reduce((sum, p) => sum + (Number(p.balance) || 0), 0),
      totalEmployees: points.reduce((sum, p) => sum + (Number(p.employeeCount) || 0), 0),
      totalTransactions: points.reduce((sum, p) => sum + (Number(p.transactionCount) || 0), 0),
    };
  }, [points]);

  /* ======================= Notifications ======================= */
  const showNotification = (message, type = 'info') => {
    console.log(`${type.toUpperCase()}: ${message}`);
    alert(`${type.toUpperCase()}: ${message}`);
  };

  /* ======================= Actions ======================= */
  const handlePointAction = async (action, pointId) => {
    try {
      setSubmitting(true);
      switch (action) {
        case 'activate':
          await api.post(`/admin/collection-points/${pointId}/activate`);
          showNotification('Punkt faollashtirildi', 'success');
          break;
        case 'deactivate':
          await api.post(`/admin/collection-points/${pointId}/deactivate`);
          showNotification('Punkt faolsizlantirildi', 'warning');
          break;
        case 'delete': {
          const ok = window.confirm("Bu amalni qaytarib bo'lmaydi. Davom etasizmi?");
          if (!ok) break;
          await api.del(`/admin/collection-points/${pointId}`);
          showNotification("Punkt o'chirildi", 'error');
          break;
        }
        default:
          break;
      }
      await fetchPoints();
    } catch (error) {
      showNotification('Amal bajarilmadi: ' + (error?.message || 'xatolik'), 'error');
    } finally { setSubmitting(false); }
  };

  /* ======================= Form ======================= */
  const validateForm = (data) => {
    const errors = {};
    if (!data.name?.trim()) errors.name = 'Nom majburiy';
    if (!data.region?.trim()) errors.region = 'Viloyat majburiy';
    if (!data.district?.trim()) errors.district = 'Tuman majburiy';
    if (!data.address?.trim()) errors.address = 'Manzil majburiy';
    
    // Validate coordinates
    if (data.latitude !== undefined && data.latitude !== null && data.latitude !== '') {
      const lat = Number(data.latitude);
      if (isNaN(lat) || lat < -90 || lat > 90) {
        errors.latitude = 'Noto\'g\'ri latitude (-90 dan 90 gacha)';
      }
    }
    if (data.longitude !== undefined && data.longitude !== null && data.longitude !== '') {
      const lng = Number(data.longitude);
      if (isNaN(lng) || lng < -180 || lng > 180) {
        errors.longitude = 'Noto\'g\'ri longitude (-180 dan 180 gacha)';
      }
    }
    
    return errors;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm(formData);
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) { 
      showNotification("Forma ma'lumotlarini to'g'rilang", 'error'); 
      return; 
    }

    try {
      setSubmitting(true);
      
      const payload = {
        name: formData.name,
        region: formData.region,
        district: formData.district,
        address: formData.address,
        latitude: formData.latitude ? Number(formData.latitude) : null,
        longitude: formData.longitude ? Number(formData.longitude) : null,
        ownerId: formData.ownerId || null, // BIG_BROKER ID
      };
      
      if (modal.type === 'create') {
        await api.post('/admin/collection-points', payload);
        showNotification('Yangi punkt yaratildi', 'success');
      } else if (modal.type === 'edit' && modal.data?.id) {
        await api.patch(`/admin/collection-points/${modal.data.id}`, payload);
        showNotification("Ma'lumotlar yangilandi", 'success');
      }
      
      await fetchPoints();
      closeModal();
    } catch (error) {
      showNotification('Forma yuborishda xatolik: ' + (error?.message || 'xatolik'), 'error');
    } finally { setSubmitting(false); }
  };

  const openModal = (type, data = null) => {
    setModal({ isOpen: true, type, data });
    if (type === 'edit' && data) {
      setFormData({
        name: data.name ?? '',
        region: data.region ?? '',
        district: data.district ?? '',
        address: data.address ?? '',
        latitude: data.latitude ?? '',
        longitude: data.longitude ?? '',
        ownerId: data.currentOwnerId ?? '',
      });
    }
    if (type === 'create') {
      setFormData({
        name: '', region: '', district: '', address: '',
        latitude: '', longitude: '', ownerId: '',
      });
    }
  };

  const closeModal = () => { 
    setModal({ isOpen: false, type: null, data: null }); 
    setFormData({}); 
    setFormErrors({}); 
  };

  /* ======================= Formatters ======================= */
  const formatCurrency = (amount) =>
    new Intl.NumberFormat('uz-UZ', { style: 'currency', currency: 'UZS', minimumFractionDigits: 0 }).format(amount || 0);

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString('uz-UZ', { year: 'numeric', month: 'short', day: 'numeric' });

  /* ======================= Map Helpers ======================= */
  const openInGoogleMaps = (lat, lng) => {
    // Convert string to number safely
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    
    if (isNaN(latitude) || isNaN(longitude)) {
      showNotification('Koordinatalar noto\'g\'ri formatda', 'error');
      return;
    }
    
    const url = `https://www.google.com/maps?q=${latitude},${longitude}`;
    window.open(url, '_blank');
  };

  const getGoogleMapsEmbedUrl = (lat, lng) => {
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    
    if (isNaN(latitude) || isNaN(longitude)) return null;
    
    return `https://www.google.com/maps/embed/v1/place?key=YOUR_API_KEY&q=${latitude},${longitude}&zoom=15`;
  };

  const getStaticMapUrl = (lat, lng) => {
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    
    if (isNaN(latitude) || isNaN(longitude)) return null;
    
    // Using OpenStreetMap static map service (no API key needed)
    return `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=15/${latitude}/${longitude}`;
  };

  /* ======================= Badges ======================= */
  const StatusBadge = ({ status }) => {
    const config = status === 'ACTIVE' 
      ? { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', label: 'Faol' }
      : { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200', label: 'Faol emas' };
    return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.bg} ${config.text} ${config.border}`}>{config.label}</span>;
  };

  /* ======================= Render ======================= */
  if (loadingInitial && points.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-gray-600 font-medium">Sistema yuklanmoqda...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <Building2 className="mr-3 h-8 w-8 text-blue-600" />
              Yig'uv Punktlari Boshqaruvi
            </h1>
            <p className="text-gray-600 mt-1">Collection Points tizimini boshqarish paneli</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => { setRefreshing(true); fetchPoints(); }}
              disabled={refreshing}
              className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Yangilash
            </button>

            <button 
              onClick={() => openModal('create')} 
              className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Yangi Punkt
            </button>
          </div>
        </div>

        {/* Statistics */}
        {statistics && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
            <div className="bg-white overflow-hidden shadow-sm rounded-lg border p-4">
              <div className="flex items-center">
                <Building2 className="h-5 w-5 text-blue-600 mr-2" />
                <div>
                  <div className="text-xs text-gray-500">Jami Punktlar</div>
                  <div className="text-lg font-semibold text-gray-900">{statistics.total}</div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow-sm rounded-lg border p-4">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                <div>
                  <div className="text-xs text-gray-500">Faol</div>
                  <div className="text-lg font-semibold text-green-600">{statistics.active}</div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow-sm rounded-lg border p-4">
              <div className="flex items-center">
                <DollarSign className="h-5 w-5 text-green-600 mr-2" />
                <div>
                  <div className="text-xs text-gray-500">Balans</div>
                  <div className="text-sm font-semibold text-gray-900">{formatCurrency(statistics.totalBalance)}</div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow-sm rounded-lg border p-4">
              <div className="flex items-center">
                <Users className="h-5 w-5 text-blue-600 mr-2" />
                <div>
                  <div className="text-xs text-gray-500">Ishchilar</div>
                  <div className="text-lg font-semibold text-blue-600">{statistics.totalEmployees}</div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow-sm rounded-lg border p-4">
              <div className="flex items-center">
                <TrendingUp className="h-5 w-5 text-purple-600 mr-2" />
                <div>
                  <div className="text-xs text-gray-500">Tranzaksiyalar</div>
                  <div className="text-lg font-semibold text-purple-600">{statistics.totalTransactions}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white shadow-sm rounded-lg border mb-6 p-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Qidirish (nom, manzil)..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <select 
                value={filters.region} 
                onChange={(e) => setFilters({ ...filters, region: e.target.value })} 
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="ALL">Barcha viloyatlar</option>
                <option value="Toshkent">Toshkent</option>
                <option value="Samarqand">Samarqand</option>
                <option value="Buxoro">Buxoro</option>
                <option value="Andijon">Andijon</option>
              </select>
            </div>

            <div>
              <select 
                value={filters.status} 
                onChange={(e) => setFilters({ ...filters, status: e.target.value })} 
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="ALL">Barcha statuslar</option>
                <option value="ACTIVE">Faol</option>
                <option value="INACTIVE">Faol emas</option>
              </select>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex">
              <AlertTriangle className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Xatolik yuz berdi</h3>
                <div className="mt-1 text-sm text-red-700">{error}</div>
                <button onClick={() => fetchPoints()} className="mt-2 text-sm font-medium text-red-800 hover:text-red-900">Qayta urinish</button>
              </div>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="bg-white shadow-sm rounded-lg border overflow-hidden relative">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Punkt</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Manzil</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Egasi</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statistika</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amallar</th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">
              {tableLoading && points.length === 0 ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={`sk-${i}`} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-10 w-48 bg-gray-200 rounded" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-32 bg-gray-200 rounded" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-24 bg-gray-200 rounded" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-20 bg-gray-200 rounded" /></td>
                    <td className="px-6 py-4"><div className="h-6 w-16 bg-gray-200 rounded-full" /></td>
                    <td className="px-6 py-4"><div className="h-8 w-20 bg-gray-200 rounded ml-auto" /></td>
                  </tr>
                ))
              ) : points.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-12">
                    <Building2 className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Punktlar topilmadi</h3>
                    <p className="mt-1 text-sm text-gray-500">Yangi punkt qo'shing</p>
                  </td>
                </tr>
              ) : (
                points.map(point => (
                  <tr key={point.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center text-white">
                          <Building2 className="h-5 w-5" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{point.name}</div>
                          <div className="text-xs text-gray-500">ID: #{point.id}</div>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        <div className="flex items-center mb-1">
                          <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                          {point.region}, {point.district}
                        </div>
                        <div className="text-xs text-gray-500">{point.address}</div>
                        {point.latitude && point.longitude && (
                          <button
                            onClick={() => openInGoogleMaps(point.latitude, point.longitude)}
                            className="flex items-center mt-1 text-xs text-blue-600 hover:text-blue-800 hover:underline"
                            title="Google Maps'da ochish"
                          >
                            <Navigation className="h-3 w-3 mr-1" />
                            {parseFloat(point.latitude).toFixed(4)}, {parseFloat(point.longitude).toFixed(4)}
                          </button>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      {point.ownerName ? (
                        <div className="flex items-center">
                          <UserCheck className="h-4 w-4 mr-2 text-purple-500" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">{point.ownerName}</div>
                            <div className="text-xs text-gray-500">{point.ownerPhone}</div>
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">Tayinlanmagan</span>
                      )}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="space-y-1">
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-2 text-blue-500" />
                          {point.employeeCount || 0} ishchi
                        </div>
                        <div className="flex items-center">
                          <TrendingUp className="h-4 w-4 mr-2 text-green-500" />
                          {point.transactionCount || 0} ta
                        </div>
                        <div className="flex items-center text-xs">
                          <DollarSign className="h-3 w-3 mr-1 text-gray-400" />
                          {formatCurrency(point.balance || 0)}
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={point.status} />
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button 
                          onClick={() => openModal('view', point)} 
                          className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50" 
                          title="Ko'rish"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        
                        <button 
                          onClick={() => openModal('edit', point)} 
                          className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50" 
                          title="Tahrirlash"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>

                        <div className="relative group">
                          <button className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-50">
                            <MoreVertical className="h-4 w-4" />
                          </button>
                          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                            {point.status === 'ACTIVE' ? (
                              <button 
                                onClick={() => handlePointAction('deactivate', point.id)} 
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                              >
                                <Clock className="h-4 w-4 mr-2" />
                                Faolsizlantirish
                              </button>
                            ) : (
                              <button 
                                onClick={() => handlePointAction('activate', point.id)} 
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Faollashtirish
                              </button>
                            )}
                            <hr className="my-1" />
                            <button 
                              onClick={() => handlePointAction('delete', point.id)} 
                              className="w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-50 flex items-center"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              O'chirish
                            </button>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Loading overlay */}
          {tableLoading && points.length > 0 && (
            <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
              <div className="flex items-center bg-white border rounded-lg px-4 py-2 shadow">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-2"></div>
                <span className="text-sm text-gray-700">Yuklanmoqda...</span>
              </div>
            </div>
          )}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-gray-700">
              <span className="font-medium">{((pagination.page - 1) * pagination.limit) + 1}</span>
              {' '}-{' '}
              <span className="font-medium">{Math.min(pagination.page * pagination.limit, pagination.total)}</span>
              {' '}dan{' '}
              <span className="font-medium">{pagination.total}</span>
              {' '}ta
            </div>
            <div className="flex space-x-2">
              <button 
                onClick={() => setPagination(p => ({ ...p, page: Math.max(1, p.page - 1) }))} 
                disabled={pagination.page === 1} 
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Avvalgi
              </button>
              <button 
                onClick={() => setPagination(p => ({ ...p, page: Math.min(p.totalPages, p.page + 1) }))} 
                disabled={pagination.page === pagination.totalPages} 
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Keyingi
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {modal.isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={closeModal}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
              <div className="bg-white px-6 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-medium text-gray-900 flex items-center">
                    <Building2 className="h-6 w-6 mr-2 text-blue-600" />
                    {modal.type === 'view' && "Punkt Ma'lumotlari"}
                    {modal.type === 'edit' && 'Punktni Tahrirlash'}
                    {modal.type === 'create' && 'Yangi Punkt Yaratish'}
                  </h3>
                  <button onClick={closeModal} className="text-gray-400 hover:text-gray-500">
                    <X className="h-6 w-6" />
                  </button>
                </div>

                {/* VIEW MODE */}
                {modal.type === 'view' && modal.data && (
                  <div className="space-y-6">
                    <div className="flex items-center space-x-4 pb-4 border-b">
                      <div className="h-16 w-16 rounded-lg bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center text-white">
                        <Building2 className="h-8 w-8" />
                      </div>
                      <div>
                        <h4 className="text-xl font-semibold text-gray-900">{modal.data.name}</h4>
                        <div className="mt-1">
                          <StatusBadge status={modal.data.status} />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <h5 className="text-sm font-medium text-gray-500 mb-3">Manzil</h5>
                        <div className="space-y-2">
                          <div className="flex items-start">
                            <MapPin className="h-4 w-4 mr-2 text-gray-400 mt-0.5" />
                            <div className="text-sm text-gray-900">
                              <div>{modal.data.region}, {modal.data.district}</div>
                              <div className="text-gray-600">{modal.data.address}</div>
                            </div>
                          </div>
                          {modal.data.latitude && modal.data.longitude && (
                            <button
                              onClick={() => openInGoogleMaps(modal.data.latitude, modal.data.longitude)}
                              className="flex items-center text-xs text-blue-600 hover:text-blue-800 hover:underline"
                            >
                              <Navigation className="h-3 w-3 mr-1" />
                              Koordinatalar: {parseFloat(modal.data.latitude).toFixed(6)}, {parseFloat(modal.data.longitude).toFixed(6)}
                            </button>
                          )}
                        </div>
                      </div>

                      <div>
                        <h5 className="text-sm font-medium text-gray-500 mb-3">Egasi</h5>
                        {modal.data.ownerName ? (
                          <div className="flex items-center">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center text-white font-semibold">
                              {modal.data.ownerName.charAt(0).toUpperCase()}
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900">{modal.data.ownerName}</div>
                              <div className="text-xs text-gray-500">{modal.data.ownerPhone}</div>
                            </div>
                          </div>
                        ) : (
                          <div className="text-sm text-gray-400 italic">Hali tayinlanmagan</div>
                        )}
                      </div>

                      <div>
                        <h5 className="text-sm font-medium text-gray-500 mb-3">Moliyaviy</h5>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                            <div className="flex items-center">
                              <DollarSign className="h-5 w-5 text-green-600 mr-2" />
                              <span className="text-sm text-gray-600">Balans</span>
                            </div>
                            <span className="text-sm font-semibold text-green-700">
                              {formatCurrency(modal.data.balance || 0)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                            <div className="flex items-center">
                              <TrendingUp className="h-5 w-5 text-purple-600 mr-2" />
                              <span className="text-sm text-gray-600">Tranzaksiyalar</span>
                            </div>
                            <span className="text-sm font-semibold text-purple-700">
                              {modal.data.transactionCount || 0} ta
                            </span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h5 className="text-sm font-medium text-gray-500 mb-3">Xodimlar</h5>
                        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                          <div className="flex items-center">
                            <Users className="h-5 w-5 text-blue-600 mr-2" />
                            <span className="text-sm text-gray-600">Ishchilar soni</span>
                          </div>
                          <span className="text-sm font-semibold text-blue-700">
                            {modal.data.employeeCount || 0}
                          </span>
                        </div>
                      </div>

                      <div className="col-span-2">
                        <h5 className="text-sm font-medium text-gray-500 mb-3">Qo'shimcha</h5>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="text-xs text-gray-500">Yaratilgan sana</div>
                            <div className="text-sm font-medium text-gray-900 mt-1">
                              {modal.data.createdAt ? formatDate(modal.data.createdAt) : '-'}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500">Oxirgi yangilanish</div>
                            <div className="text-sm font-medium text-gray-900 mt-1">
                              {modal.data.updatedAt ? formatDate(modal.data.updatedAt) : '-'}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Map placeholder */}
                    {modal.data.latitude && modal.data.longitude && (
                      <div className="pt-4 border-t">
                        <div className="flex items-center justify-between mb-3">
                          <h5 className="text-sm font-medium text-gray-500">Xarita</h5>
                          <button
                            onClick={() => openInGoogleMaps(modal.data.latitude, modal.data.longitude)}
                            className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
                          >
                            <MapPin className="h-3 w-3 mr-1" />
                            Google Maps'da ochish
                          </button>
                        </div>
                        <div className="relative bg-gray-100 rounded-lg overflow-hidden" style={{ height: '300px' }}>
                          <iframe
                            width="100%"
                            height="100%"
                            frameBorder="0"
                            style={{ border: 0 }}
                            referrerPolicy="no-referrer-when-downgrade"
                            src={`https://www.google.com/maps?q=${parseFloat(modal.data.latitude)},${parseFloat(modal.data.longitude)}&output=embed`}
                            allowFullScreen
                          ></iframe>
                          <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-sm">
                            <div className="text-xs font-medium text-gray-700">
                              📍 {parseFloat(modal.data.latitude).toFixed(6)}, {parseFloat(modal.data.longitude).toFixed(6)}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* EDIT/CREATE MODE */}
                {(modal.type === 'edit' || modal.type === 'create') && (
                  <form onSubmit={handleFormSubmit} className="space-y-6">
                    {/* Basic Info */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-4 flex items-center">
                        <Building2 className="h-4 w-4 mr-2" />
                        Asosiy ma'lumotlar
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Punkt nomi <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={formData.name || ''}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
                              formErrors.name ? 'border-red-300' : 'border-gray-300'
                            }`}
                            placeholder="Masalan: Toshkent Yig'uv Markazi"
                          />
                          {formErrors.name && <p className="mt-1 text-xs text-red-600">{formErrors.name}</p>}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Viloyat <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={formData.region || ''}
                            onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
                              formErrors.region ? 'border-red-300' : 'border-gray-300'
                            }`}
                            placeholder="Masalan: Toshkent"
                          />
                          {formErrors.region && <p className="mt-1 text-xs text-red-600">{formErrors.region}</p>}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tuman <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={formData.district || ''}
                            onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
                              formErrors.district ? 'border-red-300' : 'border-gray-300'
                            }`}
                            placeholder="Masalan: Chilonzor"
                          />
                          {formErrors.district && <p className="mt-1 text-xs text-red-600">{formErrors.district}</p>}
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            To'liq manzil <span className="text-red-500">*</span>
                          </label>
                          <textarea
                            rows={2}
                            value={formData.address || ''}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
                              formErrors.address ? 'border-red-300' : 'border-gray-300'
                            }`}
                            placeholder="Masalan: Chilonzor tumani, Bunyodkor ko'chasi, 10-uy"
                          />
                          {formErrors.address && <p className="mt-1 text-xs text-red-600">{formErrors.address}</p>}
                        </div>
                      </div>
                    </div>

                    {/* Location */}
                    <div className="pt-4 border-t">
                      <h4 className="text-sm font-medium text-gray-900 mb-4 flex items-center">
                        <Navigation className="h-4 w-4 mr-2" />
                        Geografik koordinatalar (ixtiyoriy)
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Latitude (Kenglik)
                          </label>
                          <input
                            type="number"
                            step="0.000001"
                            value={formData.latitude || ''}
                            onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
                              formErrors.latitude ? 'border-red-300' : 'border-gray-300'
                            }`}
                            placeholder="41.311151"
                          />
                          {formErrors.latitude && <p className="mt-1 text-xs text-red-600">{formErrors.latitude}</p>}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Longitude (Uzunlik)
                          </label>
                          <input
                            type="number"
                            step="0.000001"
                            value={formData.longitude || ''}
                            onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
                              formErrors.longitude ? 'border-red-300' : 'border-gray-300'
                            }`}
                            placeholder="69.279737"
                          />
                          {formErrors.longitude && <p className="mt-1 text-xs text-red-600">{formErrors.longitude}</p>}
                        </div>
                      </div>
                      <p className="mt-2 text-xs text-gray-500">
                        💡 Google Maps yoki boshqa xarita servislaridan koordinatalarni olishingiz mumkin
                      </p>
                      
                      {/* Quick location button */}
                      {formData.latitude && formData.longitude && (
                        <button
                          type="button"
                          onClick={() => openInGoogleMaps(formData.latitude, formData.longitude)}
                          className="mt-3 inline-flex items-center px-3 py-2 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200"
                        >
                          <MapPin className="h-3 w-3 mr-1" />
                          Xaritada ko'rish
                        </button>
                      )}
                    </div>

                    {/* Owner Selection */}
                    <div className="pt-4 border-t">
                      <h4 className="text-sm font-medium text-gray-900 mb-4 flex items-center">
                        <UserCheck className="h-4 w-4 mr-2" />
                        Punkt egasi (ixtiyoriy)
                      </h4>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Katta Broker tanlang
                        </label>
                        <select
                          value={formData.ownerId || ''}
                          onChange={(e) => setFormData({ ...formData, ownerId: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">Tayinlanmagan</option>
                          {bigBrokers.map(broker => (
                            <option key={broker.id} value={broker.id}>
                              {broker.name} ({broker.phone})
                            </option>
                          ))}
                        </select>
                        <p className="mt-2 text-xs text-gray-500">
                          Owner tayinlanmagan punktlar keyinchalik tayinlanishi mumkin
                        </p>
                      </div>
                    </div>

                    {/* Info box */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex">
                        <CheckCircle className="h-5 w-5 text-blue-400 mt-0.5 mr-3" />
                        <div>
                          <h4 className="text-sm font-medium text-blue-800">Eslatma</h4>
                          <div className="mt-1 text-xs text-blue-700 space-y-1">
                            <p>• Punkt yaratilgandan keyin balance avtomatik 0 dan boshlanadi</p>
                            <p>• Owner (Katta Broker) keyinchalik o'zgartirilishi mumkin</p>
                            <p>• Koordinatalar xaritada aniq joylashuvni ko'rsatish uchun kerak</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end space-x-3 pt-4 border-t">
                      <button
                        type="button"
                        onClick={closeModal}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                      >
                        Bekor qilish
                      </button>
                      <button
                        type="submit"
                        disabled={submitting}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                      >
                        {submitting ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Saqlanmoqda...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4 mr-2" />
                            {modal.type === 'create' ? 'Yaratish' : 'Saqlash'}
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Global loading overlay */}
      {submitting && !modal.isOpen && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 shadow-xl">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-3"></div>
              <span className="text-gray-700 font-medium">Amal bajarilmoqda...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CollectionPointsManagement;