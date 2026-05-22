import api from "../api/Axios"; 

const API_URL = '/exporters';

export const exporterService = {
  getMyExporters: async () => {
    try {
      const response = await api.get(API_URL);
      return response.data?.data || [];
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 
        "Tarmoqda xatolik yuz berdi. Eksportyorlarni yuklab bo'lmadi."
      );
    }
  },

  createExporter: async (exporterData) => {
    try {
      const response = await api.post(API_URL, exporterData);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 
        "Eksportyor yaratishda xatolik yuz berdi. Ma'lumotlarni tekshiring."
      );
    }
  },

  updateExporter: async (id, exporterData) => {
    try {
      const response = await api.put(`${API_URL}/${id}`, exporterData);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 
        "Ma'lumotni yangilashda xatolik yuz berdi."
      );
    }
  },

  deleteExporter: async (id) => {
    try {
      const response = await api.delete(`${API_URL}/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 
        "Eksportyorni o'chirish imkonsiz. Tarmoq xatosi."
      );
    }
  }
};