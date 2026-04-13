// src/services/adminUsersService.js
import api from "../api/Axios";  // api.js fayli turgan manzilni to'g'rilab yozing (masalan: "./api" yoki "../services/api")

// UI (Frontend) qismida ushbu xatolik klassi ishlatilgan bo'lishi mumkin, 
// shuning uchun uni saqlab qolamiz.
export class ApiError extends Error {
  constructor(message, status, payload) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}

// Axios xatolarini ApiError formatiga o'tkazib beruvchi yordamchi funksiya
const handleApiError = (error) => {
  if (error.response) {
    const payload = error.response.data;
    const message = payload?.message || payload?.error || error.response.statusText || "Request failed";
    throw new ApiError(message, error.response.status, payload);
  }
  throw error; // Network error bo'lsa
};

export const adminUsersService = {
  /**
   * LIST: GET /admin/users yoki /users
   */
  async list(params = {}) {
    const sortOrder =
      params.sortOrder && String(params.sortOrder).toLowerCase() === "asc"
        ? "ASC"
        : params.sortOrder && String(params.sortOrder).toUpperCase() === "DESC"
        ? "DESC"
        : params.sortOrder;

    const finalParams = {
      ...params,
      sortOrder, 
      sort: params.sort ?? params.sortBy,
      sortBy: params.sortBy ?? params.sort,
    };

    try {
      // Axios URL paramlarni (query string) avtomat o'zi yasab oladi
      const res = await api.get("/users", { params: finalParams });
      return res.data?.data || res.data;
    } catch (err) {
      handleApiError(err);
    }
  },

  // CRUD
  async create(data) {
    try {
      const res = await api.post("/admin/users", data);
      return res.data?.data || res.data;
    } catch (err) { handleApiError(err); }
  },

  async update(userId, data) {
    try {
      const res = await api.patch(`/admin/users/${userId}`, data);
      return res.data?.data || res.data;
    } catch (err) { handleApiError(err); }
  },

  async remove(userId) {
    try {
      const res = await api.delete(`/admin/users/${userId}`);
      return res.data?.data || res.data;
    } catch (err) { handleApiError(err); }
  },

  // actions
  async approve(userId) {
    try {
      const res = await api.post(`/admin/users/${userId}/approve`);
      return res.data?.data || res.data;
    } catch (err) { handleApiError(err); }
  },

  async block(userId) {
    try {
      const res = await api.post(`/admin/users/${userId}/block`);
      return res.data?.data || res.data;
    } catch (err) { handleApiError(err); }
  },

  async unblock(userId) {
    try {
      const res = await api.post(`/admin/users/${userId}/unblock`);
      return res.data?.data || res.data;
    } catch (err) { handleApiError(err); }
  },

  async verify(userId) {
    try {
      const res = await api.post(`/admin/users/${userId}/verify`);
      return res.data?.data || res.data;
    } catch (err) { handleApiError(err); }
  },

  async resetPassword(userId) {
    try {
      const res = await api.post(`/admin/users/${userId}/reset-password`);
      return res.data?.data || res.data;
    } catch (err) { handleApiError(err); }
  },

  async notify(userId, data = {}) {
    try {
      const res = await api.post(`/admin/users/${userId}/notify`, data);
      return res.data?.data || res.data;
    } catch (err) { handleApiError(err); }
  },

  // bulk
  async bulk(action, ids) {
    try {
      const res = await api.post("/admin/users/bulk", { action, ids });
      return res.data?.data || res.data;
    } catch (err) { handleApiError(err); }
  },
};