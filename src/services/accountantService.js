import api from "../api/Axios";  // api.js fayli turgan to'g'ri manzilni ko'rsating (masalan: "../services/api")

// api.js o'zida baseURL ni saqlagani uchun faqat manzilning davomini yozamiz:
const API_URL = "/accountants";

export const accountantService = {
  getAll: async (page = 0, size = 100) => {
    // getAuthHeaders KERAK EMAS, api.js o'zi token qo'shadi
    const response = await api.get(`${API_URL}?page=${page}&size=${size}`);
    return response.data?.data || response.data;
  },

  sendOtp: async (phone) => {
    // phone bu yerda "+998901234567" formatida keladi
    const response = await api.post(`${API_URL}/send-otp`, { phone });
    return response.data?.data || response.data;
  },

  verifyOtp: async (phone, otp) => {
    const response = await api.post(`${API_URL}/verify-otp`, { phone, otp });
    return response.data?.data || response.data;
  },

  create: async (data) => {
    const response = await api.post(API_URL, data);
    return response.data?.data || response.data;
  },

  update: async (id, data) => {
    // data ichida fullName, address, phone va STATUS ham bor.
    const response = await api.put(`${API_URL}/${id}`, data);
    return response.data?.data || response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`${API_URL}/${id}`);
    return response.data;
  }
};