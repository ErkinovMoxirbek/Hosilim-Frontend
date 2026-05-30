import api from '../../api/Axios';

const BASE_URL = '/admin-stock';

export const adminStockService = {
  // 1. Qabul punktlari ro'yxati va umumiy statistikasini olish
  getPointsSummary: async (search = '', page = 0, size = 12) => {
    try {
      const response = await api.get(`${BASE_URL}/points-summary`, {
        params: { search, page, size }
      });
      return response.data?.data || { content: [], totalElements: 0, totalPages: 0 };
    } catch (error) {
      throw new Error(error.response?.data?.message || "Punktlar ro'yxatini yuklashda xatolik yuz berdi");
    }
  },

  // 2. Aniq bitta punktning kirimlar tarixini olish
  getReceivesByPoint: async (pointId, params = {}) => {
    try {
      const response = await api.get(`${BASE_URL}/receives`, { 
        params: { ...params, pointId } 
      });
      return response.data?.data || { content: [], totalElements: 0, totalPages: 0 };
    } catch (error) {
      throw new Error(error.response?.data?.message || "Jadval ma'lumotlarini yuklashda xatolik yuz berdi");
    }
  },

  // --- SAVATLAR UCHUN ---
  getPointsBasketSummary: async (search = '', page = 0, size = 12) => {
    try {
      const response = await api.get(`${BASE_URL}/baskets-summary`, { params: { search, page, size } });
      return response.data?.data || { content: [], totalElements: 0, totalPages: 0 };
    } catch (error) {
      throw new Error("Savatlar statistikasini yuklashda xatolik");
    }
  },

  getBasketsByPoint: async (pointId, params = {}) => {
    try {
      const response = await api.get(`${BASE_URL}/baskets`, { params: { ...params, pointId } });
      return response.data?.data || { content: [], totalElements: 0, totalPages: 0 };
    } catch (error) {
      throw new Error("Savatlar tarixini yuklashda xatolik");
    }
  }
};