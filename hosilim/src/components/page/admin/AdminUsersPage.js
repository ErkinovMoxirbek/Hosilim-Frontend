import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  Users, Search, Plus, MoreVertical, Eye, Edit2,
  Trash2, Shield, UserCheck, Phone,
  Mail, Download, RefreshCw, ChevronDown,
  AlertTriangle, CheckCircle, Clock, Ban,
  Star, Activity, DollarSign, Save, ArrowUpDown,
  Settings, Unlock, Lock, MessageSquare, Database, X
} from 'lucide-react';
import 'rsuite/dist/rsuite.min.css';
import { DateRangePicker } from 'rsuite';

import API_BASE_URL from "../../../config";

const AdminUsersManagement = () => {
  /* ======================= Core State ======================= */
  const [users, setUsers] = useState([]);
  const [loadingInitial, setLoadingInitial] = useState(true); // 1st load
  const [tableLoading, setTableLoading] = useState(false);     // re-fetches
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  /* ======================= Filters ======================= */
  const [filters, setFilters] = useState({
    search: '',
    role: 'ALL',
    status: 'ALL',
    region: 'ALL',
    startDateTime: null,
    endDateTime: null
  });

  // Debounced search (500ms) + Enter instant apply
  const [searchText, setSearchText] = useState('');
  useEffect(() => {
    const t = setTimeout(() => {
      setFilters(f => (f.search === searchText ? f : { ...f, search: searchText }));
    }, 500);
    return () => clearTimeout(t);
  }, [searchText]);

  /* ======================= Sorting/Selection/Pagination ======================= */
  const [sorting, setSorting] = useState({ field: 'createdAt', direction: 'desc' });
  const [selectedUsers, setSelectedUsers] = useState(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 25, total: 0, totalPages: 0 });

  /* ======================= Modal/Form ======================= */
  const [modal, setModal] = useState({ isOpen: false, type: null, data: null });
  const [formData, setFormData] = useState({});
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const API_BASE = API_BASE_URL;
  const today = new Date();
  const rangeValue = (filters.startDateTime && filters.endDateTime)
    ? [new Date(filters.startDateTime), new Date(filters.endDateTime)]
    : null;

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
      const isForm = typeof FormData !== 'undefined' && body instanceof FormData;
      const headers = getAuthHeaders();
      if (isForm) delete headers['Content-Type'];
      const res = await fetch(`${API_BASE}${path}`, {
        method: 'POST',
        headers,
        body: isForm ? body : JSON.stringify(body ?? {}),
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
  const fetchUsers = useCallback(async () => {
    try {
      if (!hasLoadedRef.current) setLoadingInitial(true);
      else setTableLoading(true);
      setError(null);

      const params = {
        page: pagination.page,
        limit: pagination.limit,
        sortBy: sorting.field,
        sortOrder: sorting.direction,
        search: filters.search,
        role: filters.role,
        status: filters.status,
        region: filters.region,
        startDateTime: filters.startDateTime ? new Date(filters.startDateTime).toISOString() : undefined,
        endDateTime: filters.endDateTime ? new Date(filters.endDateTime).toISOString() : undefined,
      };

      const res = await api.get('/admin/users', params);
      const items = res.data ?? res.items ?? res.results ?? res.users ?? [];
      const meta = res.meta ?? {};
      const total = Number(res.total ?? meta.total ?? res.count ?? items.length ?? 0);
      const limit = Number(meta.limit ?? pagination.limit ?? params?.limit ?? 25);
      const page = Number(meta.page ?? pagination.page ?? 1);
      const totalPages = Number(meta.totalPages ?? (limit > 0 ? Math.ceil(total / limit) : 0));

      setUsers(items);
      setPagination(prev => ({ ...prev, page, limit, total, totalPages }));
    } catch (err) {
      console.error('Fetch users error:', err);
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
  }, [filters, pagination.page, pagination.limit, sorting.field, sorting.direction]);

  // initial mount
  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  // page reset when filters/sorting change
  useEffect(() => { setPagination(p => ({ ...p, page: 1 })); }, [filters, sorting]);

  /* ======================= Stats ======================= */
  const statistics = useMemo(() => {
    if (!users.length) return null;
    return {
      total: users.length,
      active: users.filter(u => u.status === 'ACTIVE').length,
      blocked: users.filter(u => u.status === 'BLOCKED').length,
      verified: users.filter(u => u.isVerified).length,
      totalRevenue: users.reduce((sum, u) => sum + (Number(u.totalRevenue) || 0), 0),
    };
  }, [users]);

  /* ======================= Notifications ======================= */
  const showNotification = (message, type = 'info') => {
    const colors = { success: '#10B981', error: '#EF4444', warning: '#F59E0B', info: '#3B82F6' };
    console.log(`%c${type.toUpperCase()}: ${message}`, `color: ${colors[type]}`);
    alert(`${type.toUpperCase()}: ${message}`);
  };

  /* ======================= Actions ======================= */
  const handleUserAction = async (action, userId, data = null) => {
    try {
      setSubmitting(true);
      switch (action) {
        case 'approve':
          await api.post(`/admin/users/${userId}/approve`);
          showNotification('Foydalanuvchi tasdiqlandi', 'success');
          break;
        case 'block':
          await api.post(`/admin/users/${userId}/block`);
          showNotification('Foydalanuvchi bloklandi', 'warning');
          break;
        case 'unblock':
          await api.post(`/admin/users/${userId}/unblock`);
          showNotification('Block olib tashlandi', 'success');
          break;
        case 'verify':
          await api.post(`/admin/users/${userId}/verify`);
          showNotification('Foydalanuvchi tasdiqlandi', 'success');
          break;
        case 'delete': {
          const ok = window.confirm("Bu amalni qaytarib bo'lmaydi. Davom etasizmi?");
          if (!ok) break;
          await api.del(`/admin/users/${userId}`);
          showNotification("Foydalanuvchi o'chirildi", 'error');
          break;
        }
        case 'update':
          await api.patch(`/admin/users/${userId}`, data ?? {});
          showNotification("Ma'lumotlar yangilandi", 'success');
          break;
        case 'resetPassword':
          await api.post(`/admin/users/${userId}/reset-password`, {});
          showNotification('Parol tiklash linki yuborildi', 'info');
          break;
        case 'sendNotification':
          await api.post(`/admin/users/${userId}/notify`, data ?? {});
          showNotification('Bildirishnoma yuborildi', 'info');
          break;
        default:
          break;
      }
      await fetchUsers();
    } catch (error) {
      showNotification('Amal bajarilmadi: ' + (error?.message || 'xatolik'), 'error');
    } finally { setSubmitting(false); }
  };

  const handleBulkAction = async (action) => {
    if (selectedUsers.size === 0) { showNotification('Foydalanuvchilar tanlanmagan', 'warning'); return; }
    const confirmed = window.confirm(`${selectedUsers.size} ta foydalanuvchi uchun "${action}" amalini bajarishni tasdiqlaysizmi?`);
    if (!confirmed) return;

    try {
      setSubmitting(true);
      const ids = Array.from(selectedUsers);
      await api.post('/admin/users/bulk', { action, ids });
      setSelectedUsers(new Set());
      setSelectAll(false);
      await fetchUsers();
      showNotification(`${ids.length} ta foydalanuvchi uchun amal bajarildi`, 'success');
    } catch (error) {
      showNotification('Bulk amal bajarilmadi: ' + (error?.message || 'xatolik'), 'error');
    } finally { setSubmitting(false); }
  };

  /* ======================= Form ======================= */
  const validateForm = (data) => {
    const errors = {};
    if (!data.name?.trim()) errors.name = 'Ism majburiy';
    if (!data.phone?.trim()) errors.phone = 'Telefon majburiy';
    if (!data.role) errors.role = 'Rol majburiy';
    if (!data.status) errors.status = 'Status majburiy';
    return errors;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm(formData);
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) { showNotification("Forma ma'lumotlarini to'g'rilang", 'error'); return; }

    try {
      setSubmitting(true);
      if (modal.type === 'create') {
        await api.post('/admin/users', formData);
        showNotification('Yangi foydalanuvchi yaratildi', 'success');
      } else if (modal.type === 'edit' && modal.data?.id) {
        await api.patch(`/admin/users/${modal.data.id}`, formData);
        showNotification("Ma'lumotlar yangilandi", 'success');
      }
      await fetchUsers();
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
        phone: data.phone ?? '',
        role: data.role ?? '',
        status: data.status ?? '',
        region: data.region ?? '',
        district: data.district ?? '',
        village: data.village ?? '',
        isVerified: !!data.isVerified,
        notes: data.notes ?? ''
      });
    }
    if (type === 'create') {
      setFormData({
        name: '', phone: '', role: '', status: '', region: '', district: '',village: '', isVerified: false, notes: ''
      });
    }
  };

  const closeModal = () => { setModal({ isOpen: false, type: null, data: null }); setFormData({}); setFormErrors({}); };

  /* ======================= Formatters ======================= */
  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString('uz-UZ', { year: 'numeric', month: 'short', day: 'numeric' });

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('uz-UZ', { style: 'currency', currency: 'UZS', minimumFractionDigits: 0 }).format(amount || 0);

  const formatRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    if (diffInHours < 1) return 'Hozir';
    if (diffInHours < 24) return `${diffInHours} soat oldin`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)} kun oldin`;
    return formatDate(dateString);
  };

  /* ======================= Export ======================= */
  const handleExport = async (format = 'csv') => {
    try {
      showNotification('Export boshlanmoqda...', 'info');
      const exportData = users.map(user => ({
        ID: user.id,
        Ism: user.name,
        Telefon: user.phone,
        Rol: user.role,
        Status: user.status,
        Viloyat: user.region,
        Tuman: user.district,
        Qishloq: user.village,
        'Yaratilgan sana': user.createdAt ? formatDate(user.createdAt) : '-',
        'Tranzaksiyalar': user.totalTransactions ?? 0,
        'Daromad': user.totalRevenue ?? 0,
        'Reyting': user.rating ?? 0,
        'Tasdiqlangan': user.isVerified ? 'Ha' : "Yo'q",
      }));

      if (format === 'csv') {
        const csv = convertToCSV(exportData);
        downloadFile(csv, `foydalanuvchilar_${new Date().toISOString().split('T')[0]}.csv`, 'text/csv');
      } else if (format === 'json') {
        const json = JSON.stringify(exportData, null, 2);
        downloadFile(json, `foydalanuvchilar_${new Date().toISOString().split('T')[0]}.json`, 'application/json');
      }
      showNotification('Export muvaffaqiyatli yakunlandi', 'success');
    } catch (e) { showNotification('Export xatosi: ' + e.message, 'error'); }
  };

  const convertToCSV = (data) => {
    if (!data.length) return '';
    const headers = Object.keys(data[0]);
    const csvHeaders = headers.join(',');
    const csvRows = data.map(row => headers.map(header => {
      const value = row[header];
      return (typeof value === 'string' && value.includes(',')) ? `"${value}"` : value;
    }).join(','));
    return [csvHeaders, ...csvRows].join('\n');
  };

  const downloadFile = (content, filename, mimeType) => {
    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url; link.download = filename;
    document.body.appendChild(link); link.click();
    document.body.removeChild(link); window.URL.revokeObjectURL(url);
  };

  /* ======================= Badges ======================= */
  const StatusBadge = ({ status }) => {
    const statusConfig = {
      'ACTIVE': { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', label: 'Faol' },
      'BLOCKED': { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', label: 'Bloklangan' },
      'INACTIVE': { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-gray-200', label: 'Faol emas' }
    };
    const config = statusConfig[status] || statusConfig['INACTIVE'];
    return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.bg} ${config.text} ${config.border}`}>{config.label}</span>;
  };

  const RoleBadge = ({ role }) => {
    const roleConfig = {
      'FARMER': { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', label: 'Fermer' },
      'BROKER': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', label: 'Broker' },
      'ADMIN': { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', label: 'Admin' }
    };
    const config = roleConfig[role] || roleConfig['FARMER'];
    return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.bg} ${config.text} ${config.border}`}>{config.label}</span>;
  };

  /* ======================= Render ======================= */
  if (loadingInitial && users.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-gray-600 font-medium">Sistema yuklanmoqda...</div>
          <div className="text-sm text-gray-500 mt-1">Foydalanuvchilar ma'lumotlari tayyorlanmoqda</div>
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
              <Users className="mr-3 h-8 w-8 text-blue-600" />
              Foydalanuvchilar Boshqaruvi
            </h1>
            <p className="text-gray-600 mt-1">Tizim foydalanuvchilarini professional boshqarish paneli</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => { setRefreshing(true); fetchUsers(); }}
              disabled={refreshing}
              className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Yangilash
            </button>

            <div className="relative group">
              <button className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                <Download className="w-4 h-4 mr-2" />
                Export
                <ChevronDown className="w-4 h-4 ml-1" />
              </button>
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                <button onClick={() => handleExport('csv')} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 first:rounded-t-lg">CSV formatida</button>
                <button onClick={() => handleExport('json')} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 last:rounded-b-lg">JSON formatida</button>
              </div>
            </div>

            <button onClick={() => openModal('create')} className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              <Plus className="w-4 h-4 mr-2" />
              Yangi Foydalanuvchi
            </button>
          </div>
        </div>

        {/* Statistics */}
        {statistics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
            <div className="bg-white overflow-hidden shadow-sm rounded-lg border">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0"><Database className="h-6 w-6 text-blue-600" /></div>
                  <div className="ml-3 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Jami</dt>
                      <dd className="text-lg font-semibold text-gray-900">{statistics.total}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow-sm rounded-lg border">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0"><CheckCircle className="h-6 w-6 text-green-600" /></div>
                  <div className="ml-3 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Faol</dt>
                      <dd className="text-lg font-semibold text-green-600">{statistics.active}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow-sm rounded-lg border">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0"><Clock className="h-6 w-6 text-yellow-600" /></div>
                  <div className="ml-3 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Kutmoqda</dt>
                      <dd className="text-lg font-semibold text-yellow-600">{statistics.total - statistics.active}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow-sm rounded-lg border">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0"><Ban className="h-6 w-6 text-red-600" /></div>
                  <div className="ml-3 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Bloklangan</dt>
                      <dd className="text-lg font-semibold text-red-600">{statistics.blocked}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow-sm rounded-lg border">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0"><Shield className="h-6 w-6 text-blue-600" /></div>
                  <div className="ml-3 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Tasdiqlangan</dt>
                      <dd className="text-lg font-semibold text-blue-600">{statistics.verified}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow-sm rounded-lg border">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0"><DollarSign className="h-6 w-6 text-green-600" /></div>
                  <div className="ml-3 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Daromad</dt>
                      <dd className="text-lg font-semibold text-gray-900">{formatCurrency(statistics.totalRevenue)}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white shadow-sm rounded-lg border mb-6">
          <div className="px-6 py-4">
            <div className="grid grid-cols-1 lg:grid-cols-6 gap-4">
              {/* Search */}
              <div className="lg:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Qidirish (ism, telefon)..."
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        setFilters((f) => ({ ...f, search: e.target.value }));
                      }
                    }}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </div>

              {/* Date range */}
              <div className="flex items-center">
                <div className="w-80">
                  <DateRangePicker
                    placeholder="Sanani Tanlang"
                    format="dd-MM-yyyy HH:mm:ss"
                    showMeridian
                    placement="bottomStart"
                    character=" to "
                    showOneCalendar={false}
                    showOk
                    disabledDate={(date) => date.getTime() > today.getTime()}
                    value={rangeValue}
                    onOk={(range) => {
                      if (!range) return;
                      const [start, end] = range;
                      setFilters(f => ({ ...f, startDateTime: start, endDateTime: end }));
                    }}
                    onClean={() => setFilters(f => ({ ...f, startDateTime: null, endDateTime: null }))}
                    onChange={(range) => {
                      if (!range) return;
                      const [start, end] = range;
                      if (start && end) {
                        const s = new Date(start), e = new Date(end), now = new Date();
                        if (e < s) return;
                        if (s > now) s.setTime(now.getTime());
                        if (e > now) e.setTime(now.getTime());
                        setFilters(f => ({ ...f, startDateTime: s, endDateTime: e }));
                      }
                    }}
                  />
                </div>
              </div>

              <div>
                <select value={filters.role} onChange={(e) => setFilters({ ...filters, role: e.target.value })} className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                  <option value="ALL">Barcha rollar</option>
                  <option value="FARMER">Fermer</option>
                  <option value="BROKER">Broker</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>

              <div>
                <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })} className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                  <option value="ALL">Barcha statuslar</option>
                  <option value="ACTIVE">Faol</option>
                  <option value="BLOCKED">Bloklangan</option>
                  <option value="INACTIVE">Faol emas</option>
                </select>
              </div>
            </div>

            {selectedUsers.size > 0 && (
              <div className="mt-4 flex items-center justify-between p-3 bg-blue-50 rounded-lg border">
                <span className="text-sm font-medium text-blue-900">{selectedUsers.size} ta foydalanuvchi tanlangan</span>
                <div className="flex items-center space-x-2">
                  <button onClick={() => handleBulkAction('approve')} disabled={submitting} className="inline-flex items-center px-3 py-1.5 text-xs rounded text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"><UserCheck className="w-3 h-3 mr-1" />Tasdiqlash</button>
                  <button onClick={() => handleBulkAction('block')} disabled={submitting} className="inline-flex items-center px-3 py-1.5 text-xs rounded text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"><Ban className="w-3 h-3 mr-1" />Bloklash</button>
                  <button onClick={() => handleBulkAction('verify')} disabled={submitting} className="inline-flex items-center px-3 py-1.5 text-xs rounded text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"><Shield className="w-3 h-3 mr-1" />Tasdiqlash</button>
                  <button onClick={() => { setSelectedUsers(new Set()); setSelectAll(false); }} className="inline-flex items-center px-3 py-1.5 text-xs rounded text-gray-700 bg-white border border-gray-300 hover:bg-gray-50">Bekor qilish</button>
                </div>
              </div>
            )}
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
                <div className="mt-2">
                  <button onClick={() => fetchUsers()} className="text-sm font-medium text-red-800 hover:text-red-900">Qayta urinish</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="bg-white shadow-sm rounded-lg border overflow-hidden relative">
          <div className="min-w-full divide-y divide-gray-200">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectAll}
                      onChange={(e) => {
                        setSelectAll(e.target.checked);
                        if (e.target.checked) setSelectedUsers(new Set(users.map(u => u.id)));
                        else setSelectedUsers(new Set());
                      }}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Foydalanuvchi</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aloqa ma'lumotlari</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol/Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statistika</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Faollik</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amallar</th>
                </tr>
              </thead>

              <tbody className="bg-white divide-y divide-gray-200">
                {/* Skeleton rows when tableLoading && users.length === 0 */}
                {tableLoading && users.length === 0 && (
                  Array.from({ length: 8 }).map((_, i) => (
                    <tr key={`sk-${i}`} className="animate-pulse">
                      <td className="px-6 py-4"><div className="h-4 w-4 bg-gray-200 rounded" /></td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="h-10 w-10 rounded-full bg-gray-200" />
                          <div>
                            <div className="h-4 w-32 bg-gray-200 rounded mb-2"></div>
                            <div className="h-3 w-20 bg-gray-200 rounded"></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4"><div className="h-4 w-40 bg-gray-200 rounded" /></td>
                      <td className="px-6 py-4"><div className="h-6 w-24 bg-gray-200 rounded-full" /></td>
                      <td className="px-6 py-4"><div className="h-4 w-28 bg-gray-200 rounded" /></td>
                      <td className="px-6 py-4"><div className="h-4 w-24 bg-gray-200 rounded" /></td>
                      <td className="px-6 py-4 text-right"><div className="h-6 w-20 bg-gray-200 rounded ml-auto" /></td>
                    </tr>
                  ))
                )}

                {/* Real rows */}
                {!tableLoading && users.map(user => (
                  <tr key={user.id} className={`hover:bg-gray-50 ${selectedUsers.has(user.id) ? 'bg-blue-50' : ''}`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedUsers.has(user.id)}
                        onChange={(e) => {
                          const next = new Set(selectedUsers);
                          if (e.target.checked) next.add(user.id); else next.delete(user.id);
                          setSelectedUsers(next);
                        }}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                            {user.name?.charAt(0)?.toUpperCase() || 'U'}
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="flex items-center">
                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                            {user.isVerified && <CheckCircle className="ml-2 h-4 w-4 text-green-500" title="Tasdiqlangan" />}
                          </div>
                          <div className="text-sm text-gray-500">ID: #{user.id}</div>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <div className="flex items-center mb-1"><Phone className="h-4 w-4 mr-2 text-gray-400" />{user.phone}</div>
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-2">
                        <RoleBadge role={user.role} />
                        <StatusBadge status={user.status} />
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="space-y-1">
                        <div className="flex items-center"><Activity className="h-4 w-4 mr-2 text-blue-500" />{user.totalTransactions ?? 0} ta</div>
                        <div className="flex items-center"><DollarSign className="h-4 w-4 mr-2 text-green-500" />{formatCurrency(user.totalRevenue)}</div>
                        <div className="flex items-center"><Star className="h-4 w-4 mr-2 text-yellow-400" />{user.rating ?? 0} ★</div>
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="space-y-1">
                        <div>Ro'yxat: {user.createdAt ? formatDate(user.createdAt) : '-'}</div>
                        <div className="text-xs">{user.loginCount ?? 0} ta login</div>
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button onClick={() => openModal('view', user)} className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50" title="Ko'rish"><Eye className="h-4 w-4" /></button>
                        <button onClick={() => openModal('edit', user)} className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50" title="Tahrirlash"><Edit2 className="h-4 w-4" /></button>


                        {user.status === 'ACTIVE' ? (
                          <button onClick={() => handleUserAction('block', user.id)} className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50" title="Bloklash"><Lock className="h-4 w-4" /></button>
                        ) : user.status === 'BLOCKED' ? (
                          <button onClick={() => handleUserAction('unblock', user.id)} className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50" title="Blokni olib tashlash"><Unlock className="h-4 w-4" /></button>
                        ) : null}

                        <div className="relative group">
                          <button className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-50"><MoreVertical className="h-4 w-4" /></button>
                          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                            <button onClick={() => handleUserAction('resetPassword', user.id)} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center"><Settings className="h-4 w-4 mr-2" />Parolni tiklash</button>
                            <button onClick={() => handleUserAction('sendNotification', user.id)} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center"><MessageSquare className="h-4 w-4 mr-2" />Xabar yuborish</button>
                            {!user.isVerified && (
                              <button onClick={() => handleUserAction('verify', user.id)} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center"><Shield className="h-4 w-4 mr-2" />Tasdiqlash</button>
                            )}
                            <hr className="my-1" />
                            <button onClick={() => handleUserAction('delete', user.id)} className="w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-50 flex items-center"><Trash2 className="h-4 w-4 mr-2" />O'chirish</button>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Overlay loader when updating table but we already have rows */}
          {tableLoading && users.length > 0 && (
            <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
              <div className="flex items-center bg-white border rounded-lg px-4 py-2 shadow">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-2"></div>
                <span className="text-sm text-gray-700">Yuklanmoqda...</span>
              </div>
            </div>
          )}

          {/* Empty state */}
          {users.length === 0 && !tableLoading && (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Foydalanuvchilar topilmadi</h3>
              <p className="mt-1 text-sm text-gray-500">Filter sozlamalarini o'zgartiring yoki yangi foydalanuvchi qo'shing.</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button onClick={() => setPagination(p => ({ ...p, page: Math.max(1, p.page - 1) }))} disabled={pagination.page === 1} className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">Avvalgi</button>
              <button onClick={() => setPagination(p => ({ ...p, page: Math.min(p.totalPages, p.page + 1) }))} disabled={pagination.page === pagination.totalPages} className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">Keyingi</button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  <span className="font-medium">{((pagination.page - 1) * pagination.limit) + 1}</span>
                  {' '}-{' '}
                  <span className="font-medium">{Math.min(pagination.page * pagination.limit, pagination.total)}</span>
                  {' '}dan{' '}
                  <span className="font-medium">{pagination.total}</span>
                  {' '}ta ko'rsatilmoqda
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button onClick={() => setPagination(p => ({ ...p, page: Math.max(1, p.page - 1) }))} disabled={pagination.page === 1} className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">Avvalgi</button>
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    const page = i + 1;
                    return (
                      <button key={page} onClick={() => setPagination(p => ({ ...p, page }))} className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${page === pagination.page ? 'z-10 bg-blue-50 border-blue-500 text-blue-600' : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'}`}>
                        {page}
                      </button>
                    );
                  })}
                  <button onClick={() => setPagination(p => ({ ...p, page: Math.min(p.totalPages, p.page + 1) }))} disabled={pagination.page === pagination.totalPages} className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">Keyingi</button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {modal.isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    {modal.type === 'view' && "Foydalanuvchi Ma'lumotlari"}
                    {modal.type === 'edit' && 'Foydalanuvchini Tahrirlash'}
                    {modal.type === 'create' && 'Yangi Foydalanuvchi Yaratish'}
                  </h3>
                  <button onClick={closeModal} className="rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"><X className="h-6 w-6" /></button>
                </div>

                {modal.type === 'view' && modal.data && (
                  <div className="space-y-6">
                    <div className="flex items-center space-x-4">
                      <div className="h-16 w-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold">
                        {modal.data.name?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                      <div>
                        <div className="flex items-center">
                          <h4 className="text-xl font-semibold text-gray-900">{modal.data.name}</h4>
                          {modal.data.isVerified && <CheckCircle className="ml-2 h-5 w-5 text-green-500" />}
                        </div>
                        <div className="flex items-center space-x-2 mt-1">
                          <RoleBadge role={modal.data.role} />
                          <StatusBadge status={modal.data.status} />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div><dt className="text-sm font-medium text-gray-500">Telefon</dt><dd className="mt-1 text-sm text-gray-900">{modal.data.phone}</dd></div>
                      <div><dt className="text-sm font-medium text-gray-500">Viloyat</dt><dd className="mt-1 text-sm text-gray-900">{modal.data.region}</dd></div>
                      <div><dt className="text-sm font-medium text-gray-500">Tuman</dt><dd className="mt-1 text-sm text-gray-900">{modal.data.district}</dd></div>
                      <div><dt className="text-sm font-medium text-gray-500">Qishloq</dt><dd className="mt-1 text-sm text-gray-900">{modal.data.village}</dd></div>
                      <div><dt className="text-sm font-medium text-gray-500">Ro'yxatdan o'tgan</dt><dd className="mt-1 text-sm text-gray-900">{modal.data.createdAt ? formatDate(modal.data.createdAt) : '-'}</dd></div>
                      <div><dt className="text-sm font-medium text-gray-500">Oxirgi faollik</dt><dd className="mt-1 text-sm text-gray-900">{modal.data.lastActive ? formatRelativeTime(modal.data.lastActive) : '-'}</dd></div>
                    </div>

                  
                  </div>
                )}

                {(modal.type === 'edit' || modal.type === 'create') && (
                  <form onSubmit={handleFormSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Ism *</label>
                        <input type="text" id="name" value={formData.name || ''} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${formErrors.name ? 'border-red-300' : 'border-gray-300'}`} required />
                        {formErrors.name && <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>}
                      </div>

                      <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Telefon *</label>
                        <input type="tel" id="phone" value={formData.phone || ''} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${formErrors.phone ? 'border-red-300' : 'border-gray-300'}`} required />
                        {formErrors.phone && <p className="mt-1 text-sm text-red-600">{formErrors.phone}</p>}
                      </div>

                      <div>
                        <label htmlFor="Qishloq" className="block text-sm font-medium text-gray-700">Qishloq</label>
                        <input type="text" id="text" value={formData.village || ''} onChange={(e) => setFormData({ ...formData, village: e.target.value })} className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${formErrors.email ? 'border-red-300' : 'border-gray-300'}`} />
                        {formErrors.email && <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>}
                      </div>

                      <div>
                        <label htmlFor="role" className="block text-sm font-medium text-gray-700">Rol *</label>
                        <select id="role" value={formData.role ?? ''} onChange={(e) => setFormData({ ...formData, role: e.target.value })} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" required>
                          <option value="" disabled>Rolni tanlang</option>
                          <option value="FARMER">Fermer</option>
                          <option value="BROKER">Broker</option>
                        </select>
                        {formErrors.role && <p className="mt-1 text-sm text-red-600">{formErrors.role}</p>}
                      </div>

                      <div>
                        <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status *</label>
                        <select id="status" value={formData.status ?? ''} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" required>
                          <option value="" disabled>Statusni tanlang</option>
                          <option value="ACTIVE">Faol</option>
                          <option value="BLOCKED">Bloklangan</option>
                        </select>
                        {formErrors.status && <p className="mt-1 text-sm text-red-600">{formErrors.status}</p>}
                      </div>

                      <div>
                        <label htmlFor="region" className="block text-sm font-medium text-gray-700">Viloyat</label>
                        <input type="text" id="region" value={formData.region || ''} onChange={(e) => setFormData({ ...formData, region: e.target.value })} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                      </div>

                      <div>
                        <label htmlFor="district" className="block text-sm font-medium text-gray-700">Tuman</label>
                        <input type="text" id="district" value={formData.district || ''} onChange={(e) => setFormData({ ...formData, district: e.target.value })} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Admin izohlari</label>
                      <textarea id="notes" rows={3} value={formData.notes || ''} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" placeholder="Foydalanuvchi haqida qo'shimcha ma'lumotlar..." />
                    </div>

                    <div className="flex items-center justify-end space-x-3 pt-6">
                      <button type="button" onClick={closeModal} className="inline-flex justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">Bekor qilish</button>
                      <button type="submit" disabled={submitting} className="inline-flex justify-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed">
                        {submitting ? (<><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>Saqlanmoqda...</>) : (<><Save className="w-4 h-4 mr-2" />{modal.type === 'create' ? 'Yaratish' : 'Saqlash'}</>)}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Global overlay faqat action/submit uchun */}
      {submitting && (
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

export default AdminUsersManagement;
